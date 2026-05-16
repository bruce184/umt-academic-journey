package com.example.week6hw

import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.week6hw.databinding.ActivityMainBinding
import com.example.week6hw.model.Student
import com.example.week6hw.ui.AddEditStudentActivity
import com.example.week6hw.ui.StudentAdapter
import com.example.week6hw.util.JsonUtils

class MainActivity : AppCompatActivity() {

    private lateinit var vb: ActivityMainBinding
    private lateinit var adapter: StudentAdapter
    private val data = mutableListOf<Student>()
    private var grid = false

    private val launcher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { res ->
        // Lấy Student theo API-aware
        val s: Student? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            res.data?.getParcelableExtra("student", Student::class.java)
        } else {
            @Suppress("DEPRECATION")
            res.data?.getParcelableExtra("student")
        }

        when {
            res.resultCode == RESULT_OK && s != null -> {
                val idx = data.indexOfFirst { it.id == s.id }
                if (idx >= 0) data[idx] = s else data.add(s)
                submit()
            }
            res.resultCode == RESULT_FIRST_USER -> {
                val delId = res.data?.getIntExtra("deleteId", -1) ?: -1
                val idx = data.indexOfFirst { it.id == delId }
                if (idx >= 0) { data.removeAt(idx); submit() }
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        vb = ActivityMainBinding.inflate(layoutInflater)
        setContentView(vb.root)

        setSupportActionBar(vb.toolbar)

        data.addAll(JsonUtils.loadStudentsFromAssets(this))

        adapter = StudentAdapter { s -> openEdit(s) }
        vb.rvStudents.adapter = adapter
        setLayoutManager()

        vb.fabAdd.setOnClickListener { openAdd() }

        submit()
    }

    private fun setLayoutManager() {
        vb.rvStudents.layoutManager = if (grid) GridLayoutManager(this, 2) else LinearLayoutManager(this)
    }

    private fun submit() = adapter.submitList(data.toList())

    private fun openAdd() {
        val newId = (data.maxOfOrNull { it.id } ?: 0) + 1
        launcher.launch(Intent(this, AddEditStudentActivity::class.java).putExtra("newId", newId))
    }

    private fun openEdit(s: Student) {
        launcher.launch(Intent(this, AddEditStudentActivity::class.java).putExtra("student", s))
    }

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(R.menu.menu_main, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean = when (item.itemId) {
        R.id.action_linear -> { grid = false; setLayoutManager(); true }
        R.id.action_grid   -> { grid = true;  setLayoutManager(); true }
        else -> super.onOptionsItemSelected(item)
    }
}
