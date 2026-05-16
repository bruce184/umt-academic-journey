package com.example.week3.example1

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity
import com.example.week3.R   // <-- QUAN TRỌNG: import R của app gốc

object CONSTANTS { const val MESSAGE1 = "MESSAGE1" }

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Đổi sang layout mới đã rename
        setContentView(R.layout.activity_example1_main)

        findViewById<Button>(R.id.gotoSecondBtn).setOnClickListener {
            val intent = Intent(this, SecondActivity::class.java)
            intent.putExtra(CONSTANTS.MESSAGE1, "This is value")
            startActivity(intent)
        }
    }
}
