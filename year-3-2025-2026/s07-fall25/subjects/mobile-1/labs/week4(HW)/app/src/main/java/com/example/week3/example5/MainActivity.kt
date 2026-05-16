package com.example.week3.example5

import android.content.ActivityNotFoundException
import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ShareCompat
import com.example.week3.R // import R của app gốc

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_example5_main)

        val shareEt = findViewById<EditText>(R.id.shareEt)
        findViewById<Button>(R.id.shareBtn).setOnClickListener {
            val text = shareEt.text?.toString()?.trim().orEmpty()
            if (text.isEmpty()) {
                Toast.makeText(this, "Vui lòng nhập nội dung", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            // Cách 1 (khuyến nghị): ShareCompat (AndroidX)
            try {
                ShareCompat.IntentBuilder(this)
                    .setType("text/plain")
                    .setChooserTitle("Chia sẻ qua…")
                    .setSubject("Tiêu đề (tuỳ chọn)") // có thể bỏ
                    .setText(text)
                    .startChooser()
            } catch (e: ActivityNotFoundException) {
                Toast.makeText(this, "Không có ứng dụng để chia sẻ", Toast.LENGTH_SHORT).show()
            }

            // --- Cách 2 (tham khảo): ACTION_SEND thuần ---
            // val sendIntent = Intent(Intent.ACTION_SEND).apply {
            //     type = "text/plain"
            //     putExtra(Intent.EXTRA_SUBJECT, "Tiêu đề (tuỳ chọn)")
            //     putExtra(Intent.EXTRA_TEXT, text)
            // }
            // val chooser = Intent.createChooser(sendIntent, "Chia sẻ qua…")
            // try { startActivity(chooser) } catch (_: ActivityNotFoundException) {
            //     Toast.makeText(this, "Không có ứng dụng để chia sẻ", Toast.LENGTH_SHORT).show()
            // }
        }
    }
}
