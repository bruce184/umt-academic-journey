package com.example.week4.ui

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity
import com.example.week4.R

class MenuActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_menu)

        findViewById<Button>(R.id.btnBai1).setOnClickListener {
            startActivity(Intent(this, Practice1Activity::class.java))
        }
        findViewById<Button>(R.id.btnCurrency).setOnClickListener {
            startActivity(Intent(this, CurrencyActivity::class.java))
        }
        findViewById<Button>(R.id.btnTip).setOnClickListener {
            startActivity(Intent(this, TipActivity::class.java))
        }
        findViewById<Button>(R.id.btnFlash).setOnClickListener {
            startActivity(Intent(this, FlashlightActivity::class.java))
        }
    }
}
