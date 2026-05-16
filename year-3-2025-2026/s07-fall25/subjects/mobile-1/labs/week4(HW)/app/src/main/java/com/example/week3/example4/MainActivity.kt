package com.example.week3.example4

import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.webkit.URLUtil
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.week3.R // import R của app gốc

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_example4_main)

        val urlEt = findViewById<EditText>(R.id.urlEt)
        findViewById<Button>(R.id.openUrlBtn).setOnClickListener {
            val input = urlEt.text?.toString().orEmpty()
            val uri = buildWebUri(input)

            if (uri == null || !URLUtil.isValidUrl(uri.toString())) {
                Toast.makeText(this, "URL không hợp lệ", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            // ACTION_VIEW với CATEGORY_BROWSABLE để các trình duyệt nhận
            val viewIntent = Intent(Intent.ACTION_VIEW, uri).apply {
                addCategory(Intent.CATEGORY_BROWSABLE)
            }

            try {
                // Cho phép chọn trình duyệt nếu có nhiều app
                startActivity(Intent.createChooser(viewIntent, "Open with"))
            } catch (e: ActivityNotFoundException) {
                Toast.makeText(this, "Không có ứng dụng mở URL", Toast.LENGTH_SHORT).show()
            }
        }
    }

    /**
     * Chuẩn hoá input thành Uri web:
     * - Trim
     * - Tự động thêm https:// nếu người dùng không gõ scheme
     * - Trả về null nếu parse lỗi
     */
    private fun buildWebUri(raw: String): Uri? {
        val trimmed = raw.trim()
        if (trimmed.isEmpty()) return null

        val withScheme = if (
            !trimmed.startsWith("http://", ignoreCase = true) &&
            !trimmed.startsWith("https://", ignoreCase = true)
        ) {
            "https://$trimmed"
        } else trimmed

        return try { Uri.parse(withScheme) } catch (_: Exception) { null }
    }
}
