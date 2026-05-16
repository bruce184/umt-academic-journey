package com.example.week7

import android.os.Bundle
import android.webkit.WebView
import androidx.appcompat.app.AppCompatActivity

class StudentHtmlActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_student_html)

        val webView: WebView = findViewById(R.id.webViewStudent)
        val html = intent.getStringExtra("html_content")
            ?: "<html><body><h2>No student data</h2></body></html>"

        webView.settings.javaScriptEnabled = false
        webView.loadDataWithBaseURL(null, html, "text/html", "utf-8", null)
    }
}
