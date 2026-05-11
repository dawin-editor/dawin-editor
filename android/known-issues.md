# المشكلات المعروفة وحلولها — تشغيل دوّن على Android WebView

## 1. استيراد الملفات لا يعمل (زر الاستيراد لا يستجيب)

### المشكلة
عند الضغط على زر "استيراد" (رفع ملف `.md` أو `.txt` أو `.html`)، لا يظهر منتقي الملفات ولا يحدث أي شيء.

### السبب
زر الاستيراد يستخدم `<input type="file">` في الواجهة الأمامية (`UploadFile.tsx`). لكي يعمل هذا في WebView، يجب على التطبيق Android تنفيذ دالة `onShowFileChooser` في `WebChromeClient`. بدونها، يتجاهل WebView طلب فتح منتقي الملفات بصمت.

### الحل
أُضيف التالي إلى `MainActivity.kt`:

```kotlin
override fun onShowFileChooser(
    webView: WebView?,
    filePathCallback: ValueCallback<Array<Uri>>?,
    fileChooserParams: FileChooserParams?
): Boolean {
    fileUploadCallback = filePathCallback
    val intent = fileChooserParams?.createIntent() ?: return false
    startActivityForResult(intent, FILE_CHOOSER_REQUEST_CODE)
    return true
}
```

وكذلك دالة `onActivityResult` لاستقبال نتيجة منتقي الملفات وإرجاعها إلى WebView:

```kotlin
override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
    super.onActivityResult(requestCode, resultCode, data)
    if (requestCode == FILE_CHOOSER_REQUEST_CODE) {
        fileUploadCallback?.onReceiveValue(
            if (resultCode == RESULT_OK)
                WebChromeClient.FileChooserParams.parseResult(resultCode, data)
            else null
        )
        fileUploadCallback = null
    }
}
```

---

## 2. الروابط الخارجية لا تعمل (مثل "حول المحرّر")

### المشكلة
عند الضغط على رابط خارجي مثل "حول المحرّر" (`https://www.dawin.io/about`) أو "طريقة الاستعمال" (`https://guide.dawin.io/`)، لا يحدث شيء أو يظهر خطأ.

### السبب
التطبيق يستخدم `WebViewAssetLoader` لخدمة الملفات المحلية عبر نطاق وهمي `https://appassets.dawin.io/`. عندما ينقر المستخدم على رابط خارجي، يحاول WebView تحميله داخل نفس النطاق الوهمي، مما يفشل لأنه نطاق غير حقيقي.

### الحل
أُضيف دالة `shouldOverrideUrlLoading` في `WebViewClient` للتحقق من الرابط:

```kotlin
override fun shouldOverrideUrlLoading(
    view: WebView?,
    request: WebResourceRequest?
): Boolean {
    val url = request?.url?.toString() ?: return false
    // إذا كان الرابط من نطاق الأصول المحلي، دعه يُحمّل داخل WebView
    if (url.startsWith("https://$ASSETS_DOMAIN/")) return false
    // وإلا افتحه في المتصفح الافتراضي للجهاز
    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
    startActivity(intent)
    return true
}
```

---

## 3. تصدير الملفات لا يعمل في WebView

### المشكلة
في المتصفح العادي، يعمل تصدير الملفات عبر إنشاء `Blob URL` وفتحه في رابط تحميل. أما في WebView، فلا يدعم `blob:` URLs للتحميل المباشر.

### الحل
أُنشئ `src/lib/androidBridge.ts` الذي يتحقق من بيئة WebView:

```typescript
export const isAndroidWebView =
  navigator.userAgent.includes("wv") ||
  (navigator.userAgent.includes("Android") &&
    !navigator.userAgent.includes("Chrome/"));
```

وعند التصدير، يُستخدم `androidBridge.saveFile()` الذي يستدعي دالة Kotlin عبر `@JavascriptInterface` لكتابة الملف إلى `Downloads` باستخدام Android `MediaStore` API.

في `ExportDialog.tsx`:

```typescript
if (isAndroidWebView) {
  await androidBridge.saveFile(content, `${safeTitle}.${ext}`, mimeType);
  return;
}
// fallback: method for regular browsers (Blob URL)
```

---

## 4. تصدير PDF لا يعمل في WebView

### المشكلة
دالة `window.print()` غير مدعومة في WebView بتاتًا. مكتبة `printJS` التي يعتمد عليها التطبيق لا تعمل في WebView.

### الحل
في `ExportToPDF.ts`:

```typescript
if (isAndroidWebView) {
  await androidBridge.printPdf(fullHtml, "داوين - تدوينة");
  return;
}
// fallback: printJS للمتصفحات العادية
```

يستخدم `androidBridge.printPdf()` دالة Kotlin التي تنشئ WebView مخفي، تحمّل HTML داخله، ثم تستدعي `PrintManager` لإظهار حوار الطباعة.

---

## 5. مشكلة Service Worker في WebView

### المشكلة
`vite-plugin-pwa` يسجّل Service Worker تلقائيًا. في WebView، قد يتسبب هذا بمشاكل أو تحذيرات لأن بعض ميزات SW غير مدعومة.

### الحل
تم تعطيل التسجيل التلقائي في `vite.config.ts`:

```typescript
VitePWA({
  registerType: "autoUpdate",
  injectRegister: null, // نمنع التسجيل التلقائي
  // ...
})
```

وفي `main.tsx` يتم التسجيل يدويًا فقط إذا لم نكن في WebView:

```typescript
if (!isAndroidWebView) {
  import("virtual:pwa-register").then(({ registerSW }) => registerSW());
}
```

---

## 6. المسارات النسبية في Vite

### المشكلة
`WebViewAssetLoader` يخدم الملفات عبر HTTPS وهمي. إذا استخدم Vite مسارات مطلقة (`/assets/...`)، فلن تعمل.

### الحل
أُضيف `base: './'` في `vite.config.ts` لتوليد مسارات نسبية (`./assets/...`) في ملفات الإخراج.

---

## 7. منتقي الملفات لا يعرض ملفات `.md`

### المشكلة
عند الضغط على زر "استيراد"، يفتح منتقي الملفات ولكن لا يظهر أي ملف `.md` أو `.markdown` للاختيار. يمكن رؤية الملفات النصية فقط.

### السبب
خاصية `accept` في `<input type="file">` كانت تحتوي فقط على امتدادات الملفات:

```html
accept=".txt,.md,.html,.json"
```

Android File Picker يقوم بالتصفية بناءً على MIME types، وليس الامتدادات. الامتداد `.md` ليس له MIME type قياسي (`text/markdown`) معرّف على معظم إصدارات Android، لذلك يقوم المنتقي باستبعاد هذه الملفات.

### الحل
تم تعديل خاصية `accept` في كل من `UploadFile.tsx` و `MobileSideBar.tsx` لتشمل MIME types صريحة إلى جانب الامتدادات:

```html
accept=".txt,.md,.html,.json,text/plain,text/markdown,text/html,application/json"
```

بهذا، يستخدم Android منتقي الملفات MIME type `text/markdown` للسماح بعرض ملفات `.md`.

---

## 8. زر "أرسل ملاحظتك" لا يعمل

### المشكلة
عند الضغط على زر "أرسل ملاحظتك" في القائمة الجانبية (`MobileSideBar`)، لا يحدث أي شيء.

### السبب
الزر يستخدم `window.Tally.openPopup()` والذي يعتمد على:
1. تحميل سكريبت خارجي من `https://tally.so/widgets/embed.js` (يُحمّل بشكل غير متزامن)
2. ظهور نافذة modal منبثقة

في WebView، قد لا يُحمّل السكريبت بشكل صحيح، وحتى إذا تم تحميله، فقد لا تعمل النافذة المنبثقة (modal) بشكل صحيح داخل WebView.

### الحل
تم إضافة فحص `isAndroidWebView` في دالة `handleFeedbackClick` في `MobileSideBar.tsx`. إذا كان التطبيق يعمل في WebView، يتم فتح رابط نموذج Tally مباشرة في المتصفح الافتراضي للجهاز:

```typescript
const handleFeedbackClick = useCallback(() => {
  if (isAndroidWebView) {
    window.open(`https://tally.so/r/${tallyId}`, "_blank");
    return;
  }
  if (window.Tally) {
    window.Tally.openPopup(tallyId, { ... });
  }
}, [tallyId]);
```

عند استدعاء `window.open()`، يتم اعتراض الرابط بواسطة `shouldOverrideUrlLoading` في `MainActivity.kt` وفتحه في المتصفح الخارجي تلقائيًا.

---

## ملخص الملفات المعدلة

| الملف | التعديل |
|---|---|
| `android/app/.../MainActivity.kt` | إضافة `onShowFileChooser` و `shouldOverrideUrlLoading` و `onActivityResult` |
| `src/lib/androidBridge.ts` | ملف جديد — واجهة JS للتواصل مع Kotlin |
| `src/lib/ExportToPDF.ts` | إضافة مسار WebView عبر `androidBridge.printPdf()` |
| `src/components/.../ExportDialog.tsx` | إضافة مسار WebView عبر `androidBridge.saveFile()` |
| `src/main.tsx` | إضافة حماية WebView عند تسجيل Service Worker |
| `vite.config.ts` | إضافة `base: './'` و `injectRegister: null` |
| `src/components/.../UploadFile.tsx` | إضافة MIME types إلى `accept` لظهور ملفات `.md` |
| `src/components/.../MobileSideBar.tsx` | إضافة MIME types إلى `accept` + فتح رابط الملاحظات في المتصفح |
