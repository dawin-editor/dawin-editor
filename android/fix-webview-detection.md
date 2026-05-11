# إصلاح كشف بيئة WebView

## المشكلة
جميع ميزات Android (استيراد الملفات، تصدير PDF، فتح الروابط، إرسال الملاحظات) لا تعمل رغم أن الكود يتحقق من `isAndroidWebView`.

## التشخيص
دالة الكشف القديمة:
```typescript
export const isAndroidWebView =
  navigator.userAgent.includes("wv") ||
  (navigator.userAgent.includes("Android") &&
    !navigator.userAgent.includes("Chrome/"));
```

هذه الدالة ترجع `false` على Android الحديث لسببين:

### 1. WebView الحديث يستخدم محرك Chromium
Android WebView من إصدار Android 5+ (والأحدث) مبني على Chromium. لذلك **User Agent الخاص به يشمل "Chrome/"**:

```
User Agent النموذجي لمتصفح Chrome على Android:
Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36
  Chrome/120.0.6099.230 Mobile Safari/537.36     ← فيه Chrome/

User Agent النموذجي لـ WebView الحديث:
Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36
  Version/4.0 Chrome/120.0.6099.230 Mobile Safari/537.36  ← فيه Chrome/ برضو
```

الشرط `!userAgent.includes("Chrome/")` يرجع `false` في الحالتين.

### 2. "wv" ليس مضموناً
Google أضاف `"wv"` إلى UA في بعض الإصدارات ولكن ليس كلها. لا يمكن الاعتماد عليه.

### 3. سبب فشل جميع الميزات
لأن `isAndroidWebView` كان `false`، كان الكود يتجاوز كل مسارات WebView:
- زر الملاحظات → يذهب لفرع `window.Tally.openPopup()` (غير موجود في WebView)
- نفس المنطق ينطبق على أي ميزة أخرى تستخدم `isAndroidWebView`

## الحل
بدلاً من تحليل User Agent، نكتشف WebView **بوجود `window.AndroidBridge`**:

```typescript
export const isAndroidWebView = typeof window !== "undefined" &&
  typeof window.AndroidBridge !== "undefined";
```

### لماذا هذا موثوق؟
- `window.AndroidBridge` يُحقن فقط في `MainActivity.kt` عبر:
  ```kotlin
  webView?.addJavascriptInterface(AndroidBridge(this), "AndroidBridge")
  ```
- إذا كان موجوداً، نحن **بالتأكيد** في WebView الخاص بنا
- لا يوجد أي متصفح عادي يضيف `window.AndroidBridge`
- لا يعتمد على User Agent الذي يختلف بين الإصدارات والأجهزة

### آلية المقارنة

| الطريقة | متصفح Chrome | Android WebView | الموثوقية |
|---|---|---|---|
| `userAgent.includes("wv")` | `false` | قد يكون `true` أو `false` | ❌ |
| `userAgent.includes("Chrome/")` | `true` | `true` (حديث) | ❌ |
| `typeof AndroidBridge !== "undefined"` | `false` ✅ | `true` ✅ | ✅ 100% |

## الملفات المعدلة

| الملف | التعديل |
|---|---|
| `src/lib/androidBridge.ts` | تغيير دالة `isAndroidWebView` من تحليل UA إلى كشف `window.AndroidBridge` |
