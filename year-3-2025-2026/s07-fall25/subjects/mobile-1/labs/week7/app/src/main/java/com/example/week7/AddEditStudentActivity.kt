package com.example.week7

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.week7.databinding.ActivityAddEditStudentBinding
import com.bumptech.glide.Glide

class AddEditStudentActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAddEditStudentBinding

    private var editingStudent: Student? = null
    private var position: Int = -1

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAddEditStudentBinding.inflate(layoutInflater)
        setContentView(binding.root)

        loadProfileImage()

        setupClassAutoComplete()

        editingStudent = intent.getSerializableExtra("student") as? Student
        position = intent.getIntExtra("position", -1)

        if (editingStudent != null) {
            bindStudent(editingStudent!!)
        } else {
            binding.btnDelete.isEnabled = false
        }

        binding.btnSave.setOnClickListener { onSave() }
        binding.btnDelete.setOnClickListener { onDelete() }
        binding.tvHtmlLink.setOnClickListener { openHtmlScreen() }
    }

    private fun loadProfileImage() {
        // URL ảnh bất kỳ trên Internet – bạn có thể đổi thành ảnh mình muốn
        val url = "https://picsum.photos/300"

        Glide.with(this)
            .load(url)
            .into(binding.imgProfile)
    }

    private fun setupClassAutoComplete() {
        val classes = listOf("19KTPM1", "19KTPM2", "20KTPM1", "20KTPM2")
        val adapter = ArrayAdapter(this, android.R.layout.simple_list_item_1, classes)
        binding.actvClass.setAdapter(adapter)
    }

    private fun bindStudent(student: Student) {
        binding.edtFullName.setText(student.fullName)
        binding.edtBirthday.setText(student.birthday)
        binding.actvClass.setText(student.className, false)

        when (student.gender) {
            "Male" -> binding.rbMale.isChecked = true
            "Female" -> binding.rbFemale.isChecked = true
            else -> binding.rbOther.isChecked = true
        }
    }

    private fun onSave() {
        val fullName = binding.edtFullName.text.toString().trim()
        val birthday = binding.edtBirthday.text.toString().trim()
        val className = binding.actvClass.text.toString().trim()

        if (fullName.isEmpty() || birthday.isEmpty() || className.isEmpty()) {
            Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show()
            return
        }

        val gender = when (binding.rgGender.checkedRadioButtonId) {
            binding.rbMale.id -> "Male"
            binding.rbFemale.id -> "Female"
            else -> "Other"
        }

        val student = editingStudent?.copy(
            fullName = fullName,
            birthday = birthday,
            className = className,
            gender = gender
        ) ?: Student(
            fullName = fullName,
            birthday = birthday,
            className = className,
            gender = gender
        )

        val resultIntent = Intent().apply {
            putExtra("student", student)
            putExtra("position", position)
        }
        setResult(Activity.RESULT_OK, resultIntent)
        finish()
    }

    private fun onDelete() {
        val id = editingStudent?.id ?: return
        val resultIntent = Intent().apply {
            putExtra("id", id)
        }
        setResult(Activity.RESULT_FIRST_USER, resultIntent)
        finish()
    }

    private fun openHtmlScreen() {
        val fullName = binding.edtFullName.text.toString().trim()
        val birthday = binding.edtBirthday.text.toString().trim()
        val className = binding.actvClass.text.toString().trim()

        val gender = when (binding.rgGender.checkedRadioButtonId) {
            binding.rbMale.id -> "Male"
            binding.rbFemale.id -> "Female"
            else -> "Other"
        }

        val html = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8" />
                <title>Student Information</title>
                <style>
                    body { font-family: sans-serif; padding: 16px; }
                    h1 { color: #1976D2; }
                    .row { margin-bottom: 8px; }
                    .label { font-weight: bold; }
                </style>
            </head>
            <body>
                <h1>Student Information</h1>
                <div class="row"><span class="label">Full Name: </span>$fullName</div>
                <div class="row"><span class="label">Birthday: </span>$birthday</div>
                <div class="row"><span class="label">Class: </span>$className</div>
                <div class="row"><span class="label">Gender: </span>$gender</div>
            </body>
            </html>
        """.trimIndent()

        val intent = Intent(this, StudentHtmlActivity::class.java).apply {
            putExtra("html_content", html)
        }
        startActivity(intent)
    }
}
