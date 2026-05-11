# dawin-editor — Project Structure Reference

## Full Project Layout

```
dawin-editor/
├── public/
│   ├── apple-splash-landscape-dark-2048x1536.png
│   ├── apple-splash-landscape-light-2048x1536.png
│   ├── apple-splash-portrait-dark-1536x2048.png
│   ├── apple-splash-portrait-light-1536x2048.png
│   ├── apple-touch-icon-180x180.png
│   ├── favicon.ico
│   ├── logo.svg
│   ├── maskable_icon_x192.png
│   ├── maskable_icon_x384.png
│   ├── maskable_icon_x512.png
│   ├── pwa-192x192.png
│   ├── pwa-512x512.png
│   ├── pwa-64x64.png
│   └── screenshot.png
├── src/
│   ├── assets/
│   │   ├── fonts/
│   │   │   ├── Consolas-Regular.ttf
│   │   │   ├── Dubai-Bold.woff
│   │   │   ├── Dubai-Light.woff
│   │   │   ├── Dubai-Medium.woff
│   │   │   ├── Dubai-Regular.woff
│   │   │   ├── Samim.ttf
│   │   │   └── SaudiWeb-Regular.woff
│   │   └── dawin.svg
│   ├── components/
│   │   ├── Editor/
│   │   │   ├── content/
│   │   │   │   ├── tiptap-icons/         ← SVG icon components
│   │   │   │   ├── tiptap-node/          ← node styles (SCSS per node type)
│   │   │   │   ├── tiptap-templates/     ← simple-editor template
│   │   │   │   ├── tiptap-ui/            ← toolbar buttons and dropdowns
│   │   │   │   ├── tiptap-ui-primitive/  ← low-level UI (button, popover, etc.)
│   │   │   │   └── ButtomActions.tsx
│   │   │   ├── footer/
│   │   │   │   └── Stat.tsx
│   │   │   ├── navbar/
│   │   │   │   ├── components/           ← ExportDialog.tsx ← PATCHED for AndroidBridge
│   │   │   │   └── NavBar.tsx
│   │   │   └── tableOfContent/
│   │   │       └── Toc.tsx
│   │   └── ui/                           ← shadcn/ui components
│   ├── contexts/
│   │   └── toolbar-context.ts
│   ├── extensions/
│   │   └── textDir.ts                    ← RTL/LTR text direction extension
│   ├── hooks/                            ← use-mobile, use-tiptap-editor, etc.
│   ├── lib/
│   │   ├── androidBridge.ts              ← NEW: Type-safe JS bridge (invokeBridge<T>)
│   │   ├── db.ts                         ← IndexedDB storage
│   │   ├── ExportToPDF.ts                ← PATCHED: uses androidBridge.printPdf() in WebView
│   │   ├── openFiles.ts
│   │   ├── tiptap-utils.ts
│   │   ├── upload.ts
│   │   └── utils.ts
│   ├── store/                            ← Zustand stores
│   │   ├── EditroStore.ts
│   │   ├── preview.ts
│   │   ├── titleStore.ts
│   │   └── TocStore.ts
│   ├── styles/
│   │   ├── _keyframe-animations.scss
│   │   └── _variables.scss
│   ├── App.tsx
│   ├── index.css                         ← Tailwind base
│   ├── Layout.tsx
│   ├── main.tsx                          ← PATCHED: isAndroidWebView guard for SW
│   └── vite-env.d.ts
├── android/                              ← Android project (created by this skill)
│   ├── app/
│   │   ├── build.gradle                  ← WITH automated buildWebApp task
│   │   ├── proguard-rules.pro            ← AndroidBridge & WebView keep rules
│   │   └── src/main/
│   │       ├── AndroidManifest.xml       ← WITH networkSecurityConfig
│   │       ├── assets/                   ← Auto-deployed by Gradle buildWebApp task
│   │       │   ├── index.html
│   │       │   └── assets/              ← JS, CSS, fonts, icons
│   │       ├── java/app/dawin/editor/
│   │       │   └── MainActivity.kt       ← Modern WebView + AndroidBridge inner class
│   │       └── res/
│   │           ├── layout/
│   │           │   └── activity_main.xml
│   │           ├── xml/
│   │           │   └── network_security_config.xml  ← NEW: secure domain allowlist
│   │           └── values/
│   │               ├── colors.xml
│   │               ├── strings.xml
│   │               └── themes.xml        ← required
│   ├── build.gradle
│   ├── gradle.properties
│   ├── gradle/wrapper/
│   │   └── gradle-wrapper.properties     ← required
│   └── settings.gradle
├── dist/                                 ← Vite build output (auto-generated)
│   ├── assets/                           ← hashed JS/CSS/font bundles
│   └── index.html
├── components.json                       ← shadcn/ui config
├── index.html                            ← dev entry point
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

## Key Files for Android Build

| File | Purpose |
|---|---|
| `vite.config.ts` | Must have `base: './'` |
| `main.tsx` | Add `isAndroidWebView` guard around SW registration |
| `src/lib/androidBridge.ts` | **NEW** — Type-safe JS bridge (`invokeBridge<T>`) |
| `src/lib/ExportToPDF.ts` | **PATCH** — route PDF through `androidBridge.printPdf()` |
| `src/components/.../ExportDialog.tsx` | **PATCH** — route file export through `androidBridge.saveFile()` |
| `dist/index.html` | Must reference `./assets/...` (relative paths) |
| `android/gradle/wrapper/gradle-wrapper.properties` | Gradle distribution — **required** |
| `android/app/build.gradle` | App module + `buildWebApp` automation task |
| `android/app/proguard-rules.pro` | Protects `@JavascriptInterface` from R8 stripping |
| `android/app/src/main/res/xml/network_security_config.xml` | Replaces `usesCleartextTraffic` (secure domain allowlist) |
| `android/app/src/main/res/values/themes.xml` | App theme — **required** |
| `android/app/src/main/.../MainActivity.kt` | Modern WebView + AssetLoader + AndroidBridge |
| `android/app/src/main/assets/index.html` | Vite output — **auto-deployed by Gradle** |

## Arabic Fonts (bundled by Vite)

After `npm run build`, these appear under `dist/assets/` and are **automatically copied by the `buildWebApp` Gradle task**:
- `Dubai-*.woff` — main UI font (Arabic)
- `Samim.ttf` — secondary Arabic font
- `Consolas-Regular.ttf` — monospace (code blocks)
- `SaudiWeb-Regular.woff` — optional Arabic font

## Build Commands (Fully Automated)

```bash
# 1. Build APK — runs npm build + copies assets + compiles automatically
cd android && ./gradlew clean assembleDebug --no-daemon

# 2. Install on device
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# 3. Launch app
adb shell am start -n app.dawin.editor/.MainActivity

# 4. Monitor logs
adb logcat | grep -E "WebView|chromium|dawin|AndroidBridge"
```

> **Note:** Manual `cp`/`Copy-Item` commands are no longer needed — the `buildWebApp` Gradle task handles everything automatically, cross-platform (Windows + Linux/macOS).
