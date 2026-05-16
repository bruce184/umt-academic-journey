package com.example.week6hw.ui

import android.app.Activity
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.view.View
import android.widget.ArrayAdapter
import androidx.appcompat.app.AppCompatActivity
import com.example.week6hw.databinding.ActivityAddEditStudentBinding
import com.example.week6hw.model.Student

class AddEditStudentActivity : AppCompatActivity() {

    private lateinit var vb: ActivityAddEditStudentBinding
    private var editing: Student? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        vb = ActivityAddEditStudentBinding.inflate(layoutInflater)
        setContentView(vb.root)

        // Gợi ý lớp
        vb.actvClass.setAdapter(
            ArrayAdapter(this, android.R.layout.simple_list_item_1,
                listOf("IT01", "IT02", "IT03", "SE01", "SE02", "DS01"))
        )

        // Đọc dữ liệu nếu đang Edit (API-aware)
        editing = readStudentFromIntent()
        editing?.let { s ->
            vb.edtName.setText(s.name)
            vb.edtDob.setText(s.dob)
            vb.edtGender.setText(s.gender)
            vb.actvClass.setText(s.className, false)
            vb.edtGpa.setText(s.gpa.toString())
            vb.btnDelete.visibility = View.VISIBLE
        }

        vb.btnCancel.setOnClickListener {
            setResult(Activity.RESULT_CANCELED)
            finish()
        }

        vb.btnDelete.setOnClickListener {
            setResult(RESULT_FIRST_USER, Intent().putExtra("deleteId", editing!!.id))
            finish()
        }

        vb.btnSave.setOnClickListener {
            val name = vb.edtName.text?.toString()?.trim().orEmpty()
            val dob = vb.edtDob.text?.toString()?.trim().orEmpty()
            val gender = vb.edtGender.text?.toString()?.trim().orEmpty()
            val cls = vb.actvClass.text?.toString()?.trim().orEmpty()
            val gpa = vb.edtGpa.text?.toString()?.toDoubleOrNull() ?: 0.0
            if (name.isEmpty() || dob.isEmpty() || gender.isEmpty() || cls.isEmpty()) return@setOnClickListener

            val result = editing?.copy(name = name, dob = dob, gender = gender, className = cls, gpa = gpa)
                ?: Student(intent.getIntExtra("newId", 0), name, dob, gender, cls, gpa)

            setResult(Activity.RESULT_OK, Intent().putExtra("student", result))
            finish()
        }
    }

    private fun readStudentFromIntent(): Student? {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            intent.getParcelableExtra("student", Student::class.java)
        } else {
            @Suppress("DEPRECATION")
            intent.getParcelableExtra("student")
        }
    }
}
