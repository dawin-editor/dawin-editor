# Keep AndroidBridge methods exposed to JavaScript
-keepclassmembers,allowobfuscation class app.dawin.editor.MainActivity$AndroidBridge {
    @android.webkit.JavascriptInterface <methods>;
}
-keep class app.dawin.editor.MainActivity$AndroidBridge { *; }

# Keep WebViewAssetLoader
-keep class androidx.webkit.** { *; }

# Keep serialization models if used
-keepclassmembers class ** {
    @com.google.gson.annotations.SerializedName <fields>;
}
