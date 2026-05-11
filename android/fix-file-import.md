# إصلاح استيراد ملفات `.md` في Android WebView

## المشكلة
عند الضغط على زر "استيراد ملف"، يفتح منتقي الملفات لكن لا يمكن رؤية أو اختيار ملفات `.md` (Markdown).

## السبب
سلسلة تحويل نوع الملف في Android:

```
HTML:  accept=".txt,.md,.html,.json"
  → WebView: FileChooserParams (MIME types)
    → Intent: ACTION_OPEN_DOCUMENT + MIME filters
      → Android File Picker
```

مشكلتان في هذه السلسلة:

1. **الامتدادات و MIME types**: WebView يحول الامتداد `.md` إلى MIME type `text/markdown`. لكن Android File Picker على أغلب الإصدارات **لا يعرف** MIME type `text/markdown`، فلا يعرض ملفات `.md`.

2. **حتى مع إضافة MIME type صريح**: إضافة `text/markdown` إلى خاصية `accept` في HTML لا تحل المشكلة لأن WebView نفسه قد لا ينقل هذا MIME type بشكل صحيح إلى `FileChooserParams`.

## المحاولات السابقة (التي فشلت)

### المحاولة 1: إضافة MIME types إلى accept في HTML
```html
accept=".txt,.md,.html,.json,text/plain,text/markdown,text/html,application/json"
```
**النتيجة:** لم يحل المشكلة. WebView لا ينقل `text/markdown` إلى `FileChooserParams` بشكل صحيح.

### المحاولة 2: الاعتماد على `fileChooserParams.createIntent()`
```kotlin
val intent = fileChooserParams?.createIntent() ?: return false
```
**النتيجة:** الـ Intent الناتج لا يتضمن `text/markdown` في فلتر MIME types، فيتجاهل Android File Picker ملفات `.md`.

## الحل النهائي: Intent مخصص بنوع مفتوح

تم تعديل دالة `onShowFileChooser` في `MainActivity.kt` لإنشاء Intent بنفسها بدلاً من الاعتماد على المعاملات القادمة من WebView:

```kotlin
override fun onShowFileChooser(
    webView: WebView?,
    filePathCallback: ValueCallback<Array<Uri>>?,
    fileChooserParams: FileChooserParams?
): Boolean {
    fileUploadCallback = filePathCallback
    val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
        addCategory(Intent.CATEGORY_OPENABLE)
        type = "*/*"   // ← يُظهر جميع أنواع الملفات
    }
    startActivityForResult(intent, FILE_CHOOSER_REQUEST_CODE)
    return true
}
```

### لماذا `type = "*/*"`؟
- يتجاوز مشكلة عدم تعريف `text/markdown` على Android
- يُظهر جميع الملفات في منتقي الملفات
- المستخدم يمكنه اختيار أي ملف (`.md`, `.txt`, `.html`, `.json`, إلخ)
- التحقق من نوع الملف يتم في JavaScript (`upload.ts`) عند قراءة المحتوى

## الملفات المعدلة

| الملف | التعديل |
|---|---|
| `android/.../MainActivity.kt` | تعديل `onShowFileChooser` لاستخدام Intent مخصص بـ `type = "*/*"` |
| `src/.../UploadFile.tsx` | إضافة MIME types إلى `accept` (تحسين تكميلي) |
| `src/.../MobileSideBar.tsx` | إضافة MIME types إلى `accept` (تحسين تكميلي) |
