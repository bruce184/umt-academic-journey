package com.example.a1stproject

import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity(), View.OnClickListener {
    lateinit var btnAdd: Button
    lateinit var btnSubtraction: Button
    lateinit var btnMultiplication: Button
    lateinit var btnDivision: Button
    lateinit var etA: EditText
    lateinit var etB: EditText
    lateinit var tvResult: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_main)
        btnAdd = findViewById(R.id.btn_add)
        btnSubtraction = findViewById(R.id.btn_subtraction)
        btnMultiplication = findViewById(R.id.btn_multiplication)
        btnDivision = findViewById(R.id.btn_division)
        etA = findViewById(R.id.et_a)
        etB = findViewById(R.id.et_b)
        tvResult = findViewById(R.id.tv_result)

        btnAdd.setOnClickListener(this)
        btnSubtraction.setOnClickListener(this)
        btnMultiplication.setOnClickListener(this)
        btnDivision.setOnClickListener(this)
    }

    override fun onClick(v: View?) {
        var a = etA.text.toString().toDouble()
        var b = etB.text.toString().toDouble()
        var result = 0.0 // double
        when(v?.id){
            R.id.btn_add -> {
                result = a + b
                tvResult.text = result.toString()
            }
            R.id.btn_subtraction -> {
                result = a - b
                tvResult.text = result.toString()
            }
            R.id.btn_multiplication -> {
                result = a * b
                tvResult.text = result.toString()
            }
            R.id.btn_division -> {
                result = a / b
                tvResult.text = result.toString()
            }
        }
        tvResult.text = "Result is ${result.toString()}: "
    }
}