package com.example.week7

import io.realm.kotlin.types.RealmObject
import io.realm.kotlin.types.annotations.PrimaryKey

// Model lưu trong Realm
class StudentEntity : RealmObject {
    @PrimaryKey
    var id: Int = 0
    var fullName: String = ""
    var birthday: String = ""
    var className: String = ""
    var gender: String = ""
}

// Map giữa Realm <-> UI
fun StudentEntity.toStudent(): Student =
    Student(
        id = id,
        fullName = fullName,
        birthday = birthday,
        className = className,
        gender = gender
    )

fun Student.toEntity(): StudentEntity =
    StudentEntity().apply {
        id = this@toEntity.id
        fullName = this@toEntity.fullName
        birthday = this@toEntity.birthday
        className = this@toEntity.className
        gender = this@toEntity.gender
    }
