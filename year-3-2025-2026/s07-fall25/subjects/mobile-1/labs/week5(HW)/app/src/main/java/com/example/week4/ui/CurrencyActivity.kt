package com.example.week4.ui

import android.os.Bundle
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.EditText
import android.widget.Spinner
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.week4.R
import java.text.NumberFormat
import java.util.Locale

class CurrencyActivity : AppCompatActivity() {

    private val USD_TO_VND = 25_000.0 // chỉnh nếu cần

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_currency)

        val edtAmount = findViewById<EditText>(R.id.edtAmount)
        val spn = findViewById<Spinner>(R.id.spnDirection)
        val btnConvert = findViewById<Button>(R.id.btnConvert)
        val txt = findViewById<TextView>(R.id.txtResult)

        spn.adapter = ArrayAdapter(
            this,
            android.R.layout.simple_spinner_dropdown_item,
            arrayOf("USD → VND", "VND → USD")
        )

        btnConvert.setOnClickListener {
            val amount = edtAmount.text.toString().toDoubleOrNull()
            if (amount == null) {
                Toast.makeText(this, "Enter amount", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val result = if (spn.selectedItemPosition == 0) {
                amount * USD_TO_VND
            } else {
                amount / USD_TO_VND
            }

            val fmt = if (spn.selectedItemPosition == 0)
                NumberFormat.getCurrencyInstance(Locale("vi", "VN"))
            else
                NumberFormat.getCurrencyInstance(Locale.US)

            txt.text = "Result: ${fmt.format(result)}"
        }

        // Back to Menu
        findViewById<Button>(R.id.btnBackMenu).setOnClickListener { finish() }
    }
}
