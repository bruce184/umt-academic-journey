package com.example.week6hw.util

import android.content.Context
import com.example.week6hw.model.Student
import org.json.JSONArray

object JsonUtils {
    fun loadStudentsFromAssets(context: Context, file: String = "students.json"): MutableList<Student> {
        val json = context.assets.open(file).bufferedReader().use { it.readText() }
        val arr = JSONArray(json)
        val list = mutableListOf<Student>()
        for (i in 0 until arr.length()) {
            val o = arr.getJSONObject(i)
            list.add(
                Student(
                    id = o.getInt("id"),
                    name = o.getString("name"),
                    dob = o.getString("dob"),
                    gender = o.getString("gender"),
                    className = o.getString("className"),
                    gpa = o.getDouble("gpa")
                )
            )
        }
        return list
    }
}
