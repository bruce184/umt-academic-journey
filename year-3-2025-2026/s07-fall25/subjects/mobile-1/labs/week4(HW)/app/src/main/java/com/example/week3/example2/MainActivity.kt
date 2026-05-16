package com.example.week3.example2

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import com.example.week3.R // QUAN TRỌNG: import R của app gốc

object CONSTANTS2 { const val MESSAGE2 = "MESSAGE2" }

class MainActivity : AppCompatActivity() {

    // Đăng ký nhận kết quả từ SecondActivity (API mới)
    private val getMessageFromSecond =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            if (result.resultCode == Activity.RESULT_OK) {
                val replyText = result.data?.getStringExtra(CONSTANTS2.MESSAGE2).orEmpty()
                findViewById<TextView>(R.id.contentTv).text =
                    if (replyText.isBlank()) "(Empty reply)" else replyText
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_example2_main)

        findViewById<Button>(R.id.openSecondForResultBtn).setOnClickListener {
            val intent = Intent(this, SecondActivity::class.java)
            getMessageFromSecond.launch(intent)
        }
    }
}
