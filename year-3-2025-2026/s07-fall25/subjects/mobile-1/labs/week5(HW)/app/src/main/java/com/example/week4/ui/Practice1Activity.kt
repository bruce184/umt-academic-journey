package com.example.week4.ui

import android.os.Bundle
import android.widget.Button
import android.widget.CheckBox
import android.widget.RadioGroup
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.week4.R

class Practice1Activity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_practice1)

        val rg = findViewById<RadioGroup>(R.id.rgGender)
        val cbCoding = findViewById<CheckBox>(R.id.cbCoding)
        val cbMusic  = findViewById<CheckBox>(R.id.cbMusic)
        val cbSport  = findViewById<CheckBox>(R.id.cbSport)
        val tv = findViewById<TextView>(R.id.tvResult)

        findViewById<Button>(R.id.btnShow).setOnClickListener {
            val gender = when (rg.checkedRadioButtonId) {
                R.id.rbMale -> "Nam"
                R.id.rbFemale -> "Nữ"
                else -> "Chưa chọn"
            }
            val hobbies = buildList {
                if (cbCoding.isChecked) add("Coding")
                if (cbMusic.isChecked) add("Music")
                if (cbSport.isChecked) add("Sport")
            }.joinToString(", ").ifEmpty { "Không có" }

            val msg = "Giới tính: $gender\nSở thích: $hobbies"
            tv.text = msg
            Toast.makeText(this, msg, Toast.LENGTH_SHORT).show()
        }

        // Back to Menu
        findViewById<Button>(R.id.btnBackMenu).setOnClickListener { finish() }
    }
}
