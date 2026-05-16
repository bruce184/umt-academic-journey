package com.example.lab41

import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var msgET: EditText
    private lateinit var exitBtn: Button
    private lateinit var contentTV: TextView

    private val TAG = "d"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Kết nối UI
        msgET = findViewById(R.id.msgET)
        exitBtn = findViewById(R.id.exitBtn)
        contentTV = findViewById(R.id.contentTV)

        Log.i(TAG, "onCreate")

        exitBtn.setOnClickListener {
            finish()
        }
    }

    // Thêm log cho 6 sự kiện còn lại
    override fun onStart() {
        super.onStart()
        Log.i(TAG, "onStart")
    }

    override fun onResume() {
        super.onResume()
        Log.i(TAG, "onResume")
    }

    override fun onPause() {
        super.onPause()
        Log.i(TAG, "onPause")
    }

    override fun onStop() {
        super.onStop()
        Log.i(TAG, "onStop")
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.i(TAG, "onDestroy")
    }

    override fun onRestart() {
        super.onRestart()
        Log.i(TAG, "onRestart")
    }
}
