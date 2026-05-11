# إصلاح زر "أرسل ملاحظتك" في Android WebView

## المشكلة
زر "أرسل ملاحظتك" في القائمة الجانبية (`MobileSideBar`) لا يستجيب عند الضغط عليه في تطبيق Android.

## الأسباب والحلول

### السبب 1: متغير البيئة VITE_TALLY_ID غير معرف

#### المشكلة
`tallyId` يُقرأ من متغير البيئة:
```typescript
const tallyId = import.meta.env.VITE_TALLY_ID;
```
في بيئة البناء المحلية (`npm run build`)، هذا المتغير غير موجود (فارغ في `.env.example`)، لذا `tallyId` يساوي `undefined`. الحارس `if (!tallyId)` كان يمنع أي إجراء تمامًا.

#### الحل
إزالة الحارس الصارم واستخدام رابط احتياطي:
```typescript
const formUrl = tallyId
  ? `https://tally.so/r/${tallyId}`
  : "https://tally.so";
```

---

### السبب 2: window.open() لا يعمل في WebView

#### المحاولة الفاشلة
```typescript
window.open(`https://tally.so/r/${tallyId}`, "_blank");
```
`window.open()` في WebView لا يمر عبر `shouldOverrideUrlLoading` لأنه يحاول فتح نافذة جديدة وليس التنقل في الإطار الرئيسي.

#### الحل النهائي: AndroidBridge.openUrl()
أُضيفت دالة `openUrl` مباشرة في طبقة Kotlin عبر `@JavascriptInterface`:

**جهة Android (`MainActivity.kt`):**
```kotlin
inner class AndroidBridge {
    @JavascriptInterface
    fun openUrl(url: String) {
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
        this@MainActivity.startActivity(intent)
    }
}
```

**جهة JavaScript (`androidBridge.ts`):**
```typescript
export const androidBridge = {
  openUrl: (url: string) => invokeBridge<void>("openUrl", url),
};
```

**الاستخدام (`MobileSideBar.tsx`):**
```typescript
const handleFeedbackClick = useCallback(() => {
  const formUrl = tallyId
    ? `https://tally.so/r/${tallyId}`
    : "https://tally.so";
  if (isAndroidWebView) {
    androidBridge.openUrl(formUrl);
    return;
  }
  // الوضع العادي للمتصفح — Tally.openPopup()
  if (window.Tally) {
    window.Tally.openPopup(tallyId, { ... });
  }
}, [tallyId]);
```

### لماذا `androidBridge.openUrl()` أفضل؟

| الطريقة | النتيجة |
|---|---|
| `window.open(url)` | لا يعمل — يحاول فتح نافذة جديدة غير مدعومة |
| `window.location.href = url` | غير موثوق — يعتمد على `shouldOverrideUrlLoading` |
| `androidBridge.openUrl(url)` | ✅ يعمل مباشرة — يتصل بنظام Android عبر Intent دون المرور على WebView |

## الملفات المعدلة

| الملف | التعديل |
|---|---|
| `android/.../MainActivity.kt` | إضافة دالة `openUrl()` في `AndroidBridge` class |
| `src/lib/androidBridge.ts` | إضافة `openUrl` إلى الواجهة وإلى الكائن `androidBridge` |
| `src/.../MobileSideBar.tsx` | تعديل `handleFeedbackClick`: إزالة الحارس الصارم + استخدام `androidBridge.openUrl()` في WebView |
