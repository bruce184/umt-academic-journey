package com.example.week4

import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.week4.ui.MenuActivity

class MainActivity : AppCompatActivity() {

    companion object {
        private const val DEFAULT_USER = "UMT"
        private const val DEFAULT_PASS = "UMT"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // id -> biến
        val etUser = findViewById<EditText>(R.id.et_username)
        val etPass = findViewById<EditText>(R.id.et_password)
        val btnGo  = findViewById<Button>(R.id.btn_go)
        val tvForgot = findViewById<TextView>(R.id.tv_forgot)

        // Chỉ bật GO khi cả 2 ô có chữ
        val watcher = object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun afterTextChanged(s: Editable?) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                btnGo.isEnabled = etUser.text.isNotBlank() && etPass.text.isNotBlank()
            }
        }
        etUser.addTextChangedListener(watcher)
        etPass.addTextChangedListener(watcher)

        // Đăng nhập
        btnGo.setOnClickListener {
            val u = etUser.text.toString().trim()
            val p = etPass.text.toString().trim()
            if (u == DEFAULT_USER && p == DEFAULT_PASS) {
                startActivity(Intent(this, MenuActivity::class.java))
                finish() // không quay lại Login khi Back
            } else {
                Toast.makeText(this, "Sai tài khoản hoặc mật khẩu", Toast.LENGTH_SHORT).show()
            }
        }

        // Demo forgot
        tvForgot.setOnClickListener {
            Toast.makeText(this, "Demo only 😄", Toast.LENGTH_SHORT).show()
        }
    }
}
