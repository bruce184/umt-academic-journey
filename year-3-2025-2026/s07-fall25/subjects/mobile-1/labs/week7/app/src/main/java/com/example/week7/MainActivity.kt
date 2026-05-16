package com.example.week7

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.week7.databinding.ActivityMainBinding
import io.realm.kotlin.Realm
import io.realm.kotlin.RealmConfiguration
import io.realm.kotlin.types.RealmObject
import io.realm.kotlin.types.annotations.PrimaryKey
import io.realm.kotlin.ext.query

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private lateinit var realm: Realm
    private val students = mutableListOf<Student>()
    private lateinit var adapter: StudentAdapter
    private var isGrid = false
    private val addEditLauncher =
        registerForActivityResult(
            androidx.activity.result.contract.ActivityResultContracts.StartActivityForResult()
        ) { result ->
            if (result.resultCode == Activity.RESULT_OK) {
                val data = result.data ?: return@registerForActivityResult
                val student = data.getSerializableExtra("student") as? Student
                    ?: return@registerForActivityResult
                val position = data.getIntExtra("position", -1)

                if (position == -1) {
                    // Add mới
                    val newId = (students.maxOfOrNull { it.id } ?: 0) + 1
                    student.id = newId
                    addStudent(student)
                } else {
                    updateStudent(position, student)
                }
            } else if (result.resultCode == Activity.RESULT_FIRST_USER) {
                // Delete
                val data = result.data ?: return@registerForActivityResult
                val id = data.getIntExtra("id", -1)
                if (id != -1) {
                    deleteStudent(id)
                }
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        setSupportActionBar(binding.toolbar)
        openRealm()
        seedSampleDataIfEmpty()
        setupRecyclerView()
        loadStudentsFromRealm()
        binding.fabAdd.setOnClickListener {
            val intent = Intent(this, AddEditStudentActivity::class.java)
            addEditLauncher.launch(intent)
        }
    }

    // ==== Realm ====
    private fun openRealm() {
        val config = RealmConfiguration.Builder( schema = setOf(StudentEntity::class) )
            .name("students.realm")
            .build()
        realm = Realm.open(config)
    }

    private fun loadStudentsFromRealm() {
        val result = realm.query<StudentEntity>().find()
        students.clear()
        students.addAll(result.map { it.toStudent() })
        adapter.notifyDataSetChanged()
    }

    private fun seedSampleDataIfEmpty() {
        realm.writeBlocking {
            // Nếu đã có dữ liệu thì thôi, không seed nữa
            if (query<StudentEntity>().find().isNotEmpty()) return@writeBlocking
            // 3 student mẫu
            val s1 = StudentEntity().apply {
                id = 1
                fullName = "Dung Nguyen"
                birthday = "01/01/2000"
                className = "19KTPM1"
                gender = "Male"
            }

            val s2 = StudentEntity().apply {
                id = 2
                fullName = "Lan Tran"
                birthday = "15/05/2001"
                className = "20KTPM1"
                gender = "Female"
            }

            val s3 = StudentEntity().apply {
                id = 3
                fullName = "Minh Le"
                birthday = "30/09/2000"
                className = "19KTPM2"
                gender = "Other"
            }

            // Ghi xuống Realm
            copyToRealm(s1)
            copyToRealm(s2)
            copyToRealm(s3)
        }
    }

    // ==== RecyclerView ====
    private fun setupRecyclerView() {
        adapter = StudentAdapter(students) { student, position ->
            val intent = Intent(this, AddEditStudentActivity::class.java).apply {
                putExtra("student", student)
                putExtra("position", position)
            }
            addEditLauncher.launch(intent)
        }
        binding.rvStudents.layoutManager = LinearLayoutManager(this)
        binding.rvStudents.adapter = adapter
    }

    private fun addStudent(student: Student) {
        students.add(student)
        adapter.notifyItemInserted(students.size - 1)
        realm.writeBlocking {
            copyToRealm(student.toEntity())
        }
    }

    private fun updateStudent(position: Int, student: Student) {
        val oldId = students[position].id
        student.id = oldId
        students[position] = student
        adapter.notifyItemChanged(position)

        realm.writeBlocking {
            val obj = query<StudentEntity>("id == $0", oldId).first().find()
            obj?.apply {
                fullName = student.fullName
                birthday = student.birthday
                className = student.className
                gender = student.gender
            }
        }
    }

    private fun deleteStudent(id: Int) {
        val index = students.indexOfFirst { it.id == id }
        if (index != -1) {
            students.removeAt(index)
            adapter.notifyItemRemoved(index)
        }

        realm.writeBlocking {
            val obj = query<StudentEntity>("id == $0", id).first().find()
            if (obj != null) {
                delete(obj)
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        realm.close()
    }

    // ==== Menu đổi layout ====
    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(R.menu.menu_main, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.action_linear -> {
                isGrid = false
                binding.rvStudents.layoutManager = LinearLayoutManager(this)
                true
            }
            R.id.action_grid -> {
                isGrid = true
                binding.rvStudents.layoutManager = GridLayoutManager(this, 2)
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }
}
