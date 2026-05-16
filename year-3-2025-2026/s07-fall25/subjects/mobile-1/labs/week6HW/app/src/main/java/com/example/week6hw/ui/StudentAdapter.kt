package com.example.week6hw.ui

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.week6hw.databinding.ItemStudentBinding
import com.example.week6hw.model.Student

class StudentAdapter(
    private val onClick: (Student) -> Unit
) : ListAdapter<Student, StudentAdapter.VH>(DIFF) {

    companion object {
        private val DIFF = object : DiffUtil.ItemCallback<Student>() {
            override fun areItemsTheSame(a: Student, b: Student) = a.id == b.id
            override fun areContentsTheSame(a: Student, b: Student) = a == b
        }
    }

    inner class VH(val vb: ItemStudentBinding) : RecyclerView.ViewHolder(vb.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val vb = ItemStudentBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return VH(vb)
    }

    override fun onBindViewHolder(holder: VH, position: Int) {
        val s = getItem(position)
        holder.vb.tvName.text = s.name
        holder.vb.tvClass.text = "Class: ${s.className}"
        holder.vb.tvGpa.text = "GPA: ${"%.2f".format(s.gpa)}"
        holder.itemView.setOnClickListener { onClick(s) }
    }
}
