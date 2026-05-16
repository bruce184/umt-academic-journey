package com.example.week7

import java.io.Serializable

// Model dùng cho UI / Intent
data class Student(
    var id: Int = 0,
    var fullName: String = "",
    var birthday: String = "",
    var className: String = "",
    var gender: String = ""
) : Serializable
