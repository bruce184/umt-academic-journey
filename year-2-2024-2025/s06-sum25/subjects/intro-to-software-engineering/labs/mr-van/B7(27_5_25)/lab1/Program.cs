IPerson staff = new Staff();
object data = "Bach Khoa Aptech";
//gọi các hành động
staff.Insert(data);
staff.Delete(data);
staff.Update(data);
staff.Display(data);

//tạo sinh viên
IPerson student = new Student() { Id = "S10", Name = "CHUNGLD", Age = 20 };
//hiển thị dữ liệu
student.Display(student);
