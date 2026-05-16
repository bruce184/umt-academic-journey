package com.example.week6hw.model

import android.os.Parcelable
import kotlinx.parcelize.Parcelize

@Parcelize
data class Student(
    val id: Int,
    var name: String,
    var dob: String,        // yyyy-MM-dd
    var gender: String,     // Male/Female
    var className: String,  // e.g., IT01
    var gpa: Double
) : Parcelable
