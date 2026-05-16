package com.example.week3.example2

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import androidx.appcompat.app.AppCompatActivity
import com.example.week3.R // import R của app gốc

class SecondActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_example2_second)

        val replyEt = findViewById<EditText>(R.id.replyEt)
        findViewById<Button>(R.id.sendBackBtn).setOnClickListener {
            val reply = replyEt.text?.toString().orEmpty()
            val data = Intent().putExtra(CONSTANTS2.MESSAGE2, reply)
            setResult(Activity.RESULT_OK, data)
            finish()
        }
    }
}
