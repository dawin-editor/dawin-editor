# استكشاف الأخطاء وإصلاحها — مشاكل WebView الشائعة

## 1. استيراد ملفات `.md` لا تعمل

**المشكلة:** زر استيراد الملفات يفتح منتقي الملفات ولكن لا يمكن رؤية أو اختيار ملفات `.md`.

**السبب:** خاصية `accept` في `<input type="file">` كانت تستخدم فقط امتدادات الملفات:

```html
accept=".txt,.md,.html,.json"
```

Android File Picker يقوم بتصفية الملفات بناءً على MIME types وليس الامتدادات. الامتداد `.md` لا يتوافق مع MIME type معروف (`text/markdown`) على معظم أجهزة Android، مما يؤدي إلى استبعاد ملفات `Markdown` من الظهور.

**الحل:** إضافة MIME types صريحة إلى جانب الامتدادات في `UploadFile.tsx` و `MobileSideBar.tsx`:

```html
accept=".txt,.md,.html,.json,text/plain,text/markdown,text/html,application/json"
```

**الملفات المعدلة:**
- `src/components/Editor/navbar/components/UploadFile.tsx`
- `src/components/Editor/navbar/components/MobileSideBar.tsx`

---

## 2. زر "أرسل ملاحظتك" لا يستجيب

**المشكلة:** الضغط على زر "أرسل ملاحظتك" في القائمة الجانبية لا يحدث أي شيء.

**السبب:** يستخدم الزر خدمة Tally لإظهار نافذة ملاحظات منبثقة عبر `window.Tally.openPopup()`، والتي تعتمد على:
- تحميل سكريبت خارجي من `https://tally.so/widgets/embed.js`
- نافذة modal منبثقة (popup)

في WebView:
- قد لا يتم تحميل السكريبت الخارجي بشكل صحيح
- حتى مع التحميل، قد لا تعمل النوافذ المنبثقة بشكل صحيح داخل WebView

**الحل:** إضافة فحص `isAndroidWebView` في `MobileSideBar.tsx`. عند اكتشاف WebView، يتم فتح رابط نموذج الملاحظات مباشرة في المتصفح الافتراضي للجهاز:

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

**الملف المعدل:**
- `src/components/Editor/navbar/components/MobileSideBar.tsx`
