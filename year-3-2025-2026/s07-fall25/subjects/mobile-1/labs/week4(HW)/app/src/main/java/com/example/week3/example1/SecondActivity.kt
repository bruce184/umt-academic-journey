package com.example.week3.example1

import android.os.Bundle
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.example.week3.R   // <-- import R

class SecondActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_example1_second)

        val message = intent.getStringExtra(CONSTANTS.MESSAGE1) ?: ""
        findViewById<TextView>(R.id.contentTv).text = message
    }
}
