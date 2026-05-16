using System;
using System.Data.SqlClient;

int luaChon = 0;
do {
    Console.WriteLine("===== STUDENT MANAGEMENT =====");
    Console.WriteLine("1. Show the list student");
    Console.WriteLine("2. Add new student");
    Console.WriteLine("3. Quit");
    Console.Write("Choose your input (1-3): ");

    string input = Console.ReadLine();
    if (!int.TryParse(input, out luaChon)) {
        Console.WriteLine("Invalid input. Please enter a number.");
        continue;
    }

    // Go through evry option.
    if (luaChon == 3) { break;}
    if (luaChon == 1) { ShowListSinhVien();}
    else if (luaChon == 2) { AddNewStudent();}
    else { 
        Console.WriteLine("Please choose a valid option (1-3)."); 
    }

} while (luaChon != 3);

static void ShowListSinhVien()
{
    // Adjust the connection string as needed.
    string connectionString = "Server=LAPTOP-2KUSRVU6\\SQLEXPRESS;Database=SQLSV;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True;Encrypt=False";

    using SqlConnection connection = new(connectionString);
    try {
        connection.Open();
        Console.WriteLine("List Student On System:");

        // Change table name/column names as per your database schema.
        string query = "SELECT TOP 5 * FROM tblSV"; // Retrieve top 5 students
        using SqlCommand command = new(query, connection);
        using SqlDataReader reader = command.ExecuteReader();

        while (reader.Read()) {
            // Ensure that column names exactly match those in your database.
            Console.WriteLine($"ID: {reader["ID"]}, Name: {reader["Ho Ten"]}");
        }
    }
    catch (Exception ex) {
        Console.WriteLine($"❌ Error: {ex.Message}");
    }
}

static void AddNewStudent() {
    // Adjust the connection string as needed.
    string connectionString = "Server=LAPTOP-2KUSRVU6\\SQLEXPRESS;Database=SQLSV;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True;Encrypt=False";

    Console.WriteLine("\n===== ADD NEW STUDENT =====");
    Console.Write("Enter Student Name: ");
    string hoTen = Console.ReadLine()?.Trim(); // Remove extra whitespace

    if (string.IsNullOrWhiteSpace(hoTen)) {
        Console.WriteLine("❌ Student name cannot be empty!");
        return;
    }

    using SqlConnection connection = new(connectionString);
    try {
        connection.Open();
        // Make sure tblSinhVien1 exists and the column name matches
        string query = "INSERT INTO dbo.tblSV (HoTen) VALUES (@HoTen)";
        using SqlCommand command = new(query, connection);

        // Add parameter with explicit type and size to avoid data type issues.
        command.Parameters.Add("@HoTen", System.Data.SqlDbType.NVarChar, 255).Value = hoTen;

        int rowsAffected = command.ExecuteNonQuery();
        if (rowsAffected > 0) {
            Console.WriteLine("✅ Student added successfully!");
        }
        else {
            Console.WriteLine("❌ Failed to add student.");
        }
    }
    catch (SqlException sqlEx) {
        Console.WriteLine($"❌ SQL Error: {sqlEx.Message}");
    }
    catch (Exception ex) {
        Console.WriteLine($"❌ Error: {ex.Message}");
    }
}
