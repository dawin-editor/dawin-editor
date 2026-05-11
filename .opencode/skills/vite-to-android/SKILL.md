---
name: vite-to-android
description: >-
  Converts the dawin-editor Vite/React web application into a native Android APK using advanced Gradle automation (no Android Studio).
  Triggers: "convert to Android", "build APK", "Gradle automation", "wrap as Android app", "mobile build", "WebView APK",
  "Android app without Studio", "package for Android", "build for mobile", "turn this into an Android app".
  Handles: project analysis, automated Vite+Gradle build pipeline, secure WebViewAssetLoader setup,
  type-safe AndroidBridge, R8/ProGuard hardening, network security config, and production-ready APK compilation.
---

# dawin-editor → Android APK (Advanced Gradle Automation)

Converts the dawin-editor Vite/React app into a native Android application using WebView, Gradle Wrapper, and automated build tasks — zero dependency on Android Studio.

> Read `references/project-structure.md` for the full project layout before starting.

---

## Workflow

### Step 1: Analyze the Project

1. Read `package.json` → project name, version, build script, Vite version, key deps (Tiptap, Tailwind, vite-plugin-pwa)
2. Read `vite.config.ts` → plugins, aliases, PWA settings, ensure `base: './'` is set
3. Read `index.html` → entry script, external scripts, title
4. Check `android/` if it already exists — note what needs updating vs. creating from scratch

### Step 2: Capture Build Details

```
Project:        dawin-editor
Package:        app.dawin.editor
AssetDomain:    appassets.dawin.io
Version:        <from package.json>
Build output:   dist/
Android path:   android/
Gradle Wrapper: ./gradlew (NOT global gradle)
```

### Step 3: Present Plan for Approval

```
## Plan: Build dawin-editor APK (Advanced Automation)

Phase 1 — Configure Vite Build & JS Bridge
  - Ensure base: './' in vite.config.ts
  - Add isAndroidWebView guard for Service Worker registration
  - Create src/lib/androidBridge.ts with type-safe invokeBridge<T>() helper
  - Patch ExportDialog.tsx + ExportToPDF.ts to use invokeBridge in WebView
  - Verify npm run build produces dist/ with relative paths (./assets/...)

Phase 2 — Scaffold Android Project with Automation
  - android/build.gradle (root)
  - android/settings.gradle
  - android/gradle.properties
  - android/gradle/wrapper/gradle-wrapper.properties          ← REQUIRED
  - android/app/build.gradle                                  ← WITH buildWebApp task
  - android/app/proguard-rules.pro                            ← AndroidBridge keep rules
  - android/app/src/main/AndroidManifest.xml                  ← WITH networkSecurityConfig
  - android/app/src/main/res/xml/network_security_config.xml  ← SECURE DOMAIN CONFIG
  - android/app/src/main/res/layout/activity_main.xml
  - android/app/src/main/res/values/strings.xml, colors.xml, themes.xml
  - android/app/src/main/java/app/dawin/editor/MainActivity.kt

Phase 3 — Automated Asset Deployment (via Gradle Task)
  - buildWebApp task: runs npm run build → copies dist/* → assets/
  - Integrated into preBuild dependency chain — NO manual copy needed

Phase 4 — Compile APK with Wrapper
  - cd android && ./gradlew clean assembleDebug --no-daemon
  - Output: android/app/build/outputs/apk/debug/app-debug.apk

Phase 5 — Verify & Debug
  - Check APK size (~8MB+), verify fonts/assets included
  - adb install + logcat commands
  - Test export/PDF flows via AndroidBridge
```

Ask for approval, adjust if needed, then execute.

---

### Step 4: Execute the Plan

#### Phase 1: Vite Build Configuration & JS Bridge

**1.1 — Ensure `base: './'` in `vite.config.ts`:**

```ts
export default defineConfig({
  base: './',   // CRITICAL: relative paths for WebViewAssetLoader
  plugins: [...],
})
```

**1.2 — Service Worker Guard for WebView:**

```ts
// In main.tsx or SW registration file:
const isAndroidWebView = navigator.userAgent.includes('wv') ||
  (navigator.userAgent.includes('Android') && !navigator.userAgent.includes('Chrome/'));

if (!isAndroidWebView) {
  // registerSW() or pwa registration
}
```

**1.3 — Type-Safe AndroidBridge (JS side) — `src/lib/androidBridge.ts`:**

```ts
export const isAndroidWebView =
  navigator.userAgent.includes('wv') ||
  (navigator.userAgent.includes('Android') &&
    !navigator.userAgent.includes('Chrome/'));

declare global {
  interface Window {
    AndroidBridge?: {
      saveFile(content: string, filename: string, mimeType: string): boolean;
      printPdf(html: string, jobName: string): void;
    };
  }
}

// Type-safe wrapper with Promise support
export function invokeBridge<T>(method: string, ...args: any[]): Promise<T> {
  if (!window.AndroidBridge) {
    console.warn('AndroidBridge not available');
    return Promise.reject('Bridge unavailable');
  }
  return new Promise((resolve, reject) => {
    try {
      const result = (window.AndroidBridge as any)[method](...args);
      resolve(result as T);
    } catch (e) {
      console.error(`Bridge error on ${method}:`, e);
      reject(e);
    }
  });
}

export const androidBridge = {
  saveFile: (content: string, filename: string, mimeType: string) =>
    invokeBridge<boolean>('saveFile', content, filename, mimeType),
  printPdf: (html: string, jobName: string) =>
    invokeBridge<void>('printPdf', html, jobName),
};
```

**1.4 — Patch Export Files to Use Bridge:**

In `src/lib/ExportToPDF.ts`:
```ts
import { isAndroidWebView, androidBridge } from './androidBridge';

if (isAndroidWebView) {
  await androidBridge.printPdf(fullHtml, 'داوين - تدوينة');
  return;
}
// fallback to printJS for web
```

In `src/components/Editor/navbar/components/ExportDialog.tsx`:
```ts
import { isAndroidWebView, androidBridge } from '@/lib/androidBridge';

if (isAndroidWebView) {
  await androidBridge.saveFile(content, `${safeTitle}.${ext}`, mimeType);
  return;
}
// fallback to Blob URL for web
```

**1.5 — Run Build (for manual testing):**
```bash
npm run build
# Verify: dist/index.html uses ./assets/... paths
```

---

#### Phase 2: Android Project Files

**`android/build.gradle`** (root):
```groovy
buildscript {
    ext {
        kotlin_version = '1.9.24'
        gradle_version = '8.7.0'
        min_sdk_version = 30
        target_sdk_version = 34
    }
    repositories { google(); mavenCentral() }
    dependencies {
        classpath "com.android.tools.build:gradle:${gradle_version}"
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:${kotlin_version}"
    }
}
allprojects { repositories { google(); mavenCentral() } }
task clean(type: Delete) { delete rootProject.buildDir }
```

**`android/settings.gradle`:**
```groovy
pluginManagement {
    repositories { google(); mavenCentral(); gradlePluginPortal() }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.PREFER_SETTINGS)
    repositories { google(); mavenCentral() }
}
rootProject.name = "dawin-editor"
include ':app'
```

**`android/gradle.properties`:**
```properties
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=true
android.nonTransitiveRClass=true
```

**`android/gradle/wrapper/gradle-wrapper.properties`** ← **REQUIRED — build fails without this**:
```properties
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-8.7-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
```

**`android/app/build.gradle`** ← **WITH AUTOMATED buildWebApp TASK**:
```groovy
plugins {
    id 'com.android.application'
    id 'kotlin-android'
}

// AUTOMATED BUILD TASK: runs npm build + copies assets
tasks.register('buildWebApp', Exec) {
    workingDir file('../../')
    def isWindows = System.getProperty('os.name').toLowerCase().contains('win')
    if (isWindows) {
        commandLine 'cmd', '/c', 'npm', 'run', 'build'
    } else {
        commandLine 'sh', '-c', 'npm run build'
    }
}

tasks.named('preBuild') {
    dependsOn('buildWebApp')
    doLast {
        def assetsDir = file('src/main/assets')
        delete assetsDir
        copy {
            from '../../dist'
            into assetsDir
        }
        def indexHtml = file('src/main/assets/index.html')
        if (!indexHtml.exists()) {
            throw new GradleException('Missing assets/index.html after buildWebApp task')
        }
    }
}

android {
    namespace 'app.dawin.editor'
    compileSdk 34
    defaultConfig {
        applicationId "app.dawin.editor"
        minSdk 30
        targetSdk 34
        versionCode 1
        versionName "1.0.0"
        vectorDrawables.useSupportLibrary true
    }
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
        debug {
            minifyEnabled false
            versionNameSuffix "-debug"
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = '17' }
    buildFeatures { viewBinding true }
    androidResources { ignoreAssetsPattern '!.gitkeep' }
}

dependencies {
    implementation 'androidx.webkit:webkit:1.12.0'
    implementation 'androidx.appcompat:appcompat:1.7.0'
    implementation 'com.google.android.material:material:1.12.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.2.0'
    implementation 'androidx.core:core-splashscreen:1.0.0'
    implementation 'androidx.activity:activity-ktx:1.9.0'
}
```

**`android/app/proguard-rules.pro`** ← **REQUIRED for release builds**:
```proguard
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
```

**`android/app/src/main/AndroidManifest.xml`:**
```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <application
        android:enableOnBackInvokedCallback="true"
        android:theme="@style/Theme.App"
        android:networkSecurityConfig="@xml/network_security_config"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|screenLayout|smallestScreenSize|uiMode"
            android:launchMode="singleTask"
            android:hardwareAccelerated="true"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

**`android/app/src/main/res/xml/network_security_config.xml`** ← **NEW — replaces usesCleartextTraffic**:
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">appassets.dawin.io</domain>
    </domain-config>
</network-security-config>
```

**`android/app/src/main/java/app/dawin/editor/MainActivity.kt`:**
```kotlin
package app.dawin.editor

import android.annotation.SuppressLint
import android.content.ContentValues
import android.content.Context
import android.os.Build
import android.os.Bundle
import android.print.PrintAttributes
import android.print.PrintManager
import android.util.Log
import android.view.View
import android.view.WindowManager
import android.webkit.*
import android.provider.MediaStore
import androidx.activity.addCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.webkit.WebViewAssetLoader
import java.io.File

class MainActivity : AppCompatActivity() {
    private var webView: WebView? = null
    private var progressBar: android.widget.ProgressBar? = null

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)
        progressBar = findViewById(R.id.progressBar)

        val assetLoader = WebViewAssetLoader.Builder()
            .setDomain("appassets.dawin.io")
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .addPathHandler("/res/", WebViewAssetLoader.ResourcesPathHandler(this))
            .build()

        webView?.settings?.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = false
            allowFileAccess = true
            allowContentAccess = true
            loadsImagesAutomatically = true
            mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            loadWithOverviewMode = true
            useWideViewPort = true
            setSafeBrowsingEnabled(true)
            setForceDark(WebSettings.FORCE_DARK_OFF)
            setAllowUniversalAccessFromFileURLs(false)
            mediaPlaybackRequiresUserGesture = false
        }

        webView?.webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(message: ConsoleMessage?): Boolean {
                message?.let {
                    Log.d("WebView[${it.messageLevel()}]", "${it.message()} @${it.sourceId()}:${it.lineNumber()}")
                }
                return true
            }
        }

        webView?.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView?,
                request: WebResourceRequest?
            ): WebResourceResponse? =
                request?.url?.let { assetLoader.shouldInterceptRequest(it) }

            override fun onPageStarted(view: WebView?, url: String?, favicon: android.graphics.Bitmap?) {
                progressBar?.visibility = View.VISIBLE
                super.onPageStarted(view, url, favicon)
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                progressBar?.visibility = View.GONE
                super.onPageFinished(view, url)
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                Log.e("WebView", "Error: ${error?.description} (code: ${error?.errorCode}) for ${request?.url}")
                progressBar?.visibility = View.GONE
                super.onReceivedError(view, request, error)
            }
        }

        webView?.addJavascriptInterface(AndroidBridge(this), "AndroidBridge")
        webView?.loadUrl("https://appassets.dawin.io/assets/index.html")
        setupFullScreen()
        setupBackNavigation()
    }

    // Replaces deprecated onBackPressed — uses OnBackPressedDispatcher (API 33+ safe)
    private fun setupBackNavigation() {
        onBackPressedDispatcher.addCallback(this) {
            if (webView?.canGoBack() == true) {
                webView?.goBack()
            } else {
                isEnabled = false
                onBackPressedDispatcher.onBackPressed()
            }
        }
    }

    private fun setupFullScreen() {
        WindowCompat.setDecorFitsSystemWindows(window, false)
        val controller = WindowInsetsControllerCompat(window, window.decorView)
        controller.hide(WindowInsetsCompat.Type.statusBars())
        controller.hide(WindowInsetsCompat.Type.navigationBars())
        controller.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        window.addFlags(WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS)
    }

    override fun onDestroy() {
        webView?.destroy()
        webView = null
        super.onDestroy()
    }

    // ── AndroidBridge ──────────────────────────────────────────────────────────
    // Exposes native Android APIs to JavaScript via window.AndroidBridge
    // Required because WebView does not support blob: URLs for download or window.print()
    inner class AndroidBridge(private val context: Context) {

        // Called from JS: androidBridge.saveFile(content, filename, mimeType)
        @JavascriptInterface
        fun saveFile(content: String, filename: String, mimeType: String): Boolean {
            return try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    val values = ContentValues().apply {
                        put(MediaStore.Downloads.DISPLAY_NAME, filename)
                        put(MediaStore.Downloads.MIME_TYPE, mimeType)
                        put(MediaStore.Downloads.IS_PENDING, 1)
                    }
                    val resolver = context.contentResolver
                    val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
                    uri?.let {
                        resolver.openOutputStream(it)?.use { os -> os.write(content.toByteArray()) }
                        values.clear()
                        values.put(MediaStore.Downloads.IS_PENDING, 0)
                        resolver.update(it, values, null, null)
                    }
                    true
                } else {
                    @Suppress("DEPRECATION")
                    val dir = android.os.Environment.getExternalStoragePublicDirectory(
                        android.os.Environment.DIRECTORY_DOWNLOADS
                    )
                    File(dir, filename).writeText(content)
                    true
                }
            } catch (e: Exception) {
                Log.e("AndroidBridge", "saveFile error: ${e.message}", e)
                false
            }
        }

        // Called from JS: androidBridge.printPdf(html, jobName)
        @JavascriptInterface
        fun printPdf(html: String, jobName: String) {
            runOnUiThread {
                val printWebView = WebView(context)
                printWebView.settings.javaScriptEnabled = true
                printWebView.webViewClient = object : WebViewClient() {
                    override fun onPageFinished(view: WebView?, url: String?) {
                        val printManager = context.getSystemService(PRINT_SERVICE) as PrintManager
                        val printAdapter = view?.createPrintDocumentAdapter(jobName)
                        printAdapter?.let {
                            printManager.print(jobName, it, PrintAttributes.Builder().build())
                        }
                    }
                }
                printWebView.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null)
            }
        }
    }
}
```

**`android/app/src/main/res/layout/activity_main.xml`:**
```xml
<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent">
    <WebView
        android:id="@+id/webView"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />
    <ProgressBar
        android:id="@+id/progressBar"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_centerInParent="true"
        android:visibility="gone"
        android:indeterminate="true" />
</RelativeLayout>
```

**`android/app/src/main/res/values/strings.xml`:**
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">داوين محرر</string>
    <string name="app_name_short">داوين</string>
</resources>
```

**`android/app/src/main/res/values/colors.xml`:**
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="black">#FF000000</color>
    <color name="white">#FFFFFFFF</color>
    <color name="colorPrimary">#1A1A2E</color>
    <color name="colorPrimaryDark">#16213E</color>
    <color name="colorAccent">#0F3460</color>
    <color name="windowBackground">#FFFFFFFF</color>
</resources>
```

**`android/app/src/main/res/values/themes.xml`** ← **required — app crashes without this**:
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.App" parent="Theme.MaterialComponents.DayNight.NoActionBar">
        <item name="android:windowBackground">@color/windowBackground</item>
        <item name="android:statusBarColor">@android:color/transparent</item>
        <item name="android:navigationBarColor">@android:color/transparent</item>
        <item name="android:windowLayoutInDisplayCutoutMode">shortEdges</item>
        <item name="android:windowDrawsSystemBarBackgrounds">true</item>
        <item name="android:enforceNavigationBarContrast">false</item>
        <item name="android:enforceStatusBarContrast">false</item>
    </style>
</resources>
```

---

#### Phase 3: Automated Asset Deployment (via Gradle)

✅ **NO MANUAL COPY NEEDED** — the `buildWebApp` task in `app/build.gradle` handles:
1. Running `npm run build` in project root (cross-platform: Windows + Linux/macOS)
2. Deleting old assets
3. Copying `dist/*` → `android/app/src/main/assets/`
4. Verifying `index.html` exists (throws if missing)

To trigger manually if needed:
```bash
cd android
./gradlew app:buildWebApp      # Build web + deploy assets only
./gradlew clean assembleDebug  # Full build (runs buildWebApp automatically)
```

---

#### Phase 4: Compile APK with Wrapper

```bash
cd android
./gradlew clean assembleDebug --no-daemon --warning-mode all
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`

For release:
```bash
./gradlew assembleRelease --no-daemon
# Sign with keystore afterwards
```

---

#### Phase 5: Verify & Debug

```bash
# Check APK size (expect ~8MB+)
ls -lh android/app/build/outputs/apk/debug/app-debug.apk

# Install on device
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Launch app
adb shell am start -n app.dawin.editor/.MainActivity

# Monitor logs
adb logcat | grep -E "WebView|chromium|dawin|AndroidBridge|Vite"
```

---

## Key Technical Notes

**Why WebViewAssetLoader + Local HTTPS?**
ES modules (`<script type="module">`) are blocked by CORS on `file://` in Android WebView. `WebViewAssetLoader` serves assets via `https://appassets.dawin.io/assets/...` — satisfies CORS without network. Requires `base: './'` in Vite.

**Why Automated Gradle Task?**
Eliminates manual `cp`/`Copy-Item` errors. Ensures assets always sync with web build. Enables CI/CD pipelines with a single command. `--no-daemon` ensures clean builds in CI environments.

**Why `network_security_config.xml` instead of `usesCleartextTraffic`?**
`usesCleartextTraffic="true"` allows ALL HTTP traffic. The config file explicitly permits only `appassets.dawin.io`. Complies with Google Play security policies (2024+).

**Why ProGuard rules for AndroidBridge?**
R8/ProGuard may strip `@JavascriptInterface` methods in release builds if not explicitly kept. Without rules, export and PDF stop working silently in release APK.

**Why Modern WebView Settings?**
- `setSafeBrowsingEnabled(true)` — protects against malicious content
- `setForceDark(FORCE_DARK_OFF)` — prevent unwanted color inversion; control via CSS `prefers-color-scheme`
- `setAllowUniversalAccessFromFileURLs(false)` — critical XSS protection
- `MIXED_CONTENT_NEVER_ALLOW` — stricter than previous version

**Why AndroidBridge for file export and PDF?**
- `blob:` URLs → WebView silently ignores `<a>` clicks — file never downloads
- `window.print()` → completely unsupported in WebView, ignored silently
- Fix: `@JavascriptInterface` exposes Kotlin to JS. `saveFile()` uses `MediaStore.Downloads` (no permissions needed on Android 10+). `printPdf()` uses `PrintManager` with hidden WebView.

**Android SDK Requirements:**
- minSdk 30 (Android 11) — WebViewAssetLoader stable from here
- compileSdk 34 — latest stable
- Java 17+ required
- Gradle Wrapper 8.7+ (use `./gradlew`, not global `gradle`)

---

## Troubleshooting

**White screen on launch:**
```bash
adb logcat | grep -i "WebView\|ERR\|dawin"
```
Checklist:
- [ ] `dist/index.html` uses `./assets/...` (not `/assets/...`)
- [ ] `android/app/src/main/assets/index.html` exists after build
- [ ] `assetLoader.setDomain()` matches `loadUrl()` domain
- [ ] Service worker guard is active (`isAndroidWebView`)
- [ ] No JS errors in `adb logcat | grep ConsoleMessage`

**Gradle build fails — Java version:**
```bash
java -version  # Must be 17+
export JAVA_HOME=/path/to/jdk-17
```

**Gradle wrapper missing:**
```bash
# Inside android/ directory:
gradle wrapper --gradle-version 8.7
```

**APK install fails:**
```bash
adb devices  # Confirm device detected
adb uninstall app.dawin.editor
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

**Arabic fonts not rendering (Dubai/Samim):**
```bash
ls android/app/src/main/assets/assets/ | grep -E "\.(woff|ttf)$"
grep -o "url(./assets/[^)]*)" android/app/src/main/assets/assets/index-*.css
```

**Export to Markdown/HTML does nothing:**
- `blob:` URLs don't work in WebView — ensure `androidBridge.ts` exists and `ExportDialog.tsx` checks `isAndroidWebView`
- Check `adb logcat | grep "AndroidBridge"`
- In JS console: `console.log(typeof window.AndroidBridge)` should be `"object"`

**PDF export does nothing:**
- `window.print()` unsupported in WebView — ensure `ExportToPDF.ts` routes through `androidBridge.printPdf()`
- `window.AndroidBridge` will be `undefined` if `addJavascriptInterface()` is missing from `MainActivity.kt`
- Release builds: verify `proguard-rules.pro` keeps `@JavascriptInterface` methods

**Remote Debugging Setup:**
1. Connect device via USB with debugging enabled
2. Open Chrome desktop → `chrome://inspect/#devices`
3. Enable "Discover USB devices"
4. Select your WebView instance → "inspect" for full DevTools

---

## Success Criteria

- [ ] `./gradlew assembleDebug` completes without manual intervention
- [ ] APK installs and launches to show editor UI
- [ ] Arabic fonts (Dubai, Samim) render correctly
- [ ] Export to Markdown/HTML saves to Downloads via AndroidBridge
- [ ] Export to PDF opens print dialog via AndroidBridge
- [ ] Back button navigates history then exits app
- [ ] No cleartext HTTP warnings in logcat
- [ ] Release build with R8 enabled runs without bridge errors

---

## Optional Enhancements (Post-MVP)

- Add signing config for release builds
- Integrate Firebase Crashlytics for error reporting
- Add deep link support for opening `.md` files
- Implement update check via GitHub Releases API
