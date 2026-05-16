package com.example.week4.ui

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.week4.R
import java.text.NumberFormat
import java.util.Locale

class TipActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_tip)

        val edtBill = findViewById<EditText>(R.id.edtBill)
        val edtTip = findViewById<EditText>(R.id.edtTip)
        val btn = findViewById<Button>(R.id.btnCalc)
        val txt = findViewById<TextView>(R.id.txtTipResult)

        btn.setOnClickListener {
            val bill = edtBill.text.toString().toDoubleOrNull()
            val tipPct = edtTip.text.toString().toDoubleOrNull()

            if (bill == null || tipPct == null) {
                Toast.makeText(this, "Enter numbers", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val tip = bill * tipPct / 100.0
            val total = bill + tip
            val fmt = NumberFormat.getCurrencyInstance(Locale("vi", "VN"))
            txt.text = "Tip: ${fmt.format(tip)}\nTotal: ${fmt.format(total)}"
        }

        // Back to Menu
        findViewById<Button>(R.id.btnBackMenu).setOnClickListener { finish() }
    }
}
