package app.dawin.editor

import android.annotation.SuppressLint
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.net.Uri
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
    private var fileUploadCallback: ValueCallback<Array<Uri>>? = null

    companion object {
        private const val FILE_CHOOSER_REQUEST_CODE = 1001
        private const val ASSETS_DOMAIN = "appassets.dawin.io"
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)
        progressBar = findViewById(R.id.progressBar)

        val assetLoader = WebViewAssetLoader.Builder()
            .setDomain(ASSETS_DOMAIN)
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

            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                fileUploadCallback = filePathCallback
                val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE)
                    type = "*/*"
                }
                startActivityForResult(intent, FILE_CHOOSER_REQUEST_CODE)
                return true
            }
        }

        webView?.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView?,
                request: WebResourceRequest?
            ): WebResourceResponse? =
                request?.url?.let { assetLoader.shouldInterceptRequest(it) }

            override fun shouldOverrideUrlLoading(
                view: WebView?,
                request: WebResourceRequest?
            ): Boolean {
                val url = request?.url?.toString() ?: return false
                if (url.startsWith("https://$ASSETS_DOMAIN/")) return false
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                startActivity(intent)
                return true
            }

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
        webView?.loadUrl("https://$ASSETS_DOMAIN/assets/index.html")
        setupFullScreen()
        setupBackNavigation()
    }

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

    @Deprecated("Use ActivityResultLauncher", ReplaceWith("registerForActivityResult"))
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == FILE_CHOOSER_REQUEST_CODE) {
            fileUploadCallback?.onReceiveValue(
                if (resultCode == RESULT_OK) WebChromeClient.FileChooserParams.parseResult(resultCode, data) else null
            )
            fileUploadCallback = null
        }
    }

    inner class AndroidBridge(private val context: Context) {

        @JavascriptInterface
        fun openUrl(url: String) {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
            context.startActivity(intent)
        }

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
