package com.example.week3.example3

import android.content.ActivityNotFoundException
import android.content.Intent
import android.os.Bundle
import android.provider.ContactsContract
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.week3.R // QUAN TRỌNG: import R của app gốc

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_example3_main)

        findViewById<Button>(R.id.openContactsBtn).setOnClickListener {
            // ACTION_VIEW tới danh sách liên hệ (không cần quyền READ_CONTACTS cho thao tác VIEW)
            val intent = Intent(Intent.ACTION_VIEW, ContactsContract.Contacts.CONTENT_URI)
            try {
                startActivity(intent)
            } catch (e: ActivityNotFoundException) {
                Toast.makeText(this, "No app can handle Contacts VIEW", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
