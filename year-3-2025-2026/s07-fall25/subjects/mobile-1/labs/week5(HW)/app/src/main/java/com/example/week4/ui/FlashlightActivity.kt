package com.example.week4.ui

import android.content.res.ColorStateList
import android.graphics.Color
import android.os.Bundle
import android.util.TypedValue
import android.widget.Button
import android.widget.FrameLayout
import android.widget.ImageButton
import android.widget.LinearLayout
import androidx.appcompat.app.AppCompatActivity
import com.example.week4.R
import com.google.android.material.floatingactionbutton.FloatingActionButton

class FlashlightActivity : AppCompatActivity() {

    private var isOn = false
    private var selectedColor: Int = Color.WHITE

    // Giữ nguyên số lượng màu
    private val colors = intArrayOf(
        0xFF2E7D32.toInt(), // xanh lá
        0xFF26A69A.toInt(), // teal
        0xFFCDDC39.toInt(), // lime
        0xFFFFEB3B.toInt(), // vàng
        0xFFFF9800.toInt(), // cam
        0xFFF44336.toInt(), // đỏ
        0xFFFF1744.toInt(), // đỏ hồng
        0xFFE040FB.toInt(), // hồng tím
        0xFF9C27B0.toInt(), // tím
        0xFF2196F3.toInt(), // xanh dương
        0xFFBCAAA4.toInt(), // beige
        0xFFFFFFFF.toInt()  // trắng
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_flashlight)

        val root = findViewById<FrameLayout>(R.id.rootFlash)
        val strip = findViewById<LinearLayout>(R.id.colorStrip)
        val fabPower = findViewById<FloatingActionButton>(R.id.fabPower)

        // Dải nút màu: button liền kề (ImageButton không padding)
        buildColorButtons(strip, fabPower, root)

        // Power: tap = ON/OFF, long-press = đổi màu kế tiếp
        fabPower.setOnClickListener {
            isOn = !isOn
            applyState(root, fabPower)
        }
        fabPower.setOnLongClickListener {
            // chuyển sang màu kế tiếp
            val idx = colors.indexOfFirst { it == selectedColor }.let { if (it == -1) 0 else it }
            selectedColor = colors[(idx + 1) % colors.size]
            fabPower.backgroundTintList = ColorStateList.valueOf(selectedColor)
            if (isOn) root.setBackgroundColor(selectedColor)
            true
        }

        // Back
        findViewById<Button>(R.id.btnBackMenu).setOnClickListener { finish() }

        // Trạng thái ban đầu
        applyState(root, fabPower)
    }

    private fun buildColorButtons(
        strip: LinearLayout,
        fab: FloatingActionButton,
        root: FrameLayout
    ) {
        colors.forEach { color ->
            val btn = ImageButton(this).apply {
                layoutParams = LinearLayout.LayoutParams(dp(30), dp(20)).also {
                    // KHÔNG margin để liền kề
                    it.setMargins(0, 0, 0, 0)
                }
                setBackgroundColor(color)   // nền chính là màu
                setPadding(0, 0, 0, 0)      // bỏ padding mặc định
                contentDescription = ""     // chỉ là nút màu
                isClickable = true
                isFocusable = true
            }
            btn.setOnClickListener {
                selectedColor = color
                // bấm màu => BẬT đèn + đổi nền và power sang màu đã chọn
                if (!isOn) isOn = true
                applyState(root, fab)
            }
            strip.addView(btn)
        }
    }

    private fun applyState(root: FrameLayout, fab: FloatingActionButton) {
        if (isOn) {
            root.setBackgroundColor(selectedColor)
            setScreenBrightness(1f) // sáng tối đa
        } else {
            root.setBackgroundColor(Color.WHITE)
            setScreenBrightness(-1f) // theo hệ thống
        }
        // Power luôn thể hiện màu đang chọn
        fab.backgroundTintList = ColorStateList.valueOf(selectedColor)
    }

    private fun setScreenBrightness(value: Float) {
        val lp = window.attributes
        lp.screenBrightness = value
        window.attributes = lp
    }

    private fun dp(v: Int): Int =
        TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP, v.toFloat(), resources.displayMetrics
        ).toInt()
}
