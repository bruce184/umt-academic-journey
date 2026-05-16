package com.example.week7

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class StudentAdapter(
    private val items: MutableList<Student>,
    private val onItemClick: (Student, Int) -> Unit
) : RecyclerView.Adapter<StudentAdapter.StudentViewHolder>() {

    inner class StudentViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val tvFullName: TextView = itemView.findViewById(R.id.tvFullName)
        private val tvClass: TextView = itemView.findViewById(R.id.tvClass)
        private val tvBirthday: TextView = itemView.findViewById(R.id.tvBirthday)
        private val tvGender: TextView = itemView.findViewById(R.id.tvGender)

        fun bind(student: Student, position: Int) {
            tvFullName.text = student.fullName
            tvClass.text = "Class: ${student.className}"
            tvBirthday.text = "Birthday: ${student.birthday}"
            tvGender.text = "Gender: ${student.gender}"

            itemView.setOnClickListener {
                onItemClick(student, position)
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): StudentViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_student, parent, false)
        return StudentViewHolder(view)
    }

    override fun getItemCount(): Int = items.size

    override fun onBindViewHolder(holder: StudentViewHolder, position: Int) {
        holder.bind(items[position], position)
    }
}
