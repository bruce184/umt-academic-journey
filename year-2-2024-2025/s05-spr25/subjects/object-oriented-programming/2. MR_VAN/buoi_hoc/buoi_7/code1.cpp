#include <iostream>
#include <cstring>
using namespace std;

class Student {
public:
    // Constructor
    Student(const char* InputID, string inputName, int inputAge);
    Student(const char* InputID, string inputName);
    // Copy Constructor
    Student(const Student&);
    // Destructor
    ~Student();
    // Toán tử gán
    Student& operator= (const Student&);
    // Thay đổi tuổi
    void ChangeAge(int newAge);
    // Hiển thị thông tin
    void display();
    friend int getAge(const Student& s);

private:
    string name;
    int age;
    char* ID;
};

// Constructor có đầy đủ thông tin
Student::Student(const char* InputID, string inputName, int inputAge) {
    ID = new char[11]; // Cấp phát bộ nhớ cho ID
    strcpy_s(ID, 11, InputID);
    name = inputName;
    age = inputAge;
}

// Constructor mặc định tuổi là 18
Student::Student(const char* InputID, string inputName) {
    ID = new char[11]; // Cấp phát bộ nhớ cho ID
    strcpy_s(ID, 11, InputID);
    name = inputName;
    age = 18; // Giá trị mặc định
}

// Copy Constructor
Student::Student(const Student& s) {
    age = s.age;
    name = s.name;
    ID = new char[11]; // Cấp phát bộ nhớ mới
    strcpy_s(ID, 11, s.ID); // Sao chép dữ liệu ID
}

// Toán tử gán
Student& Student::operator= (const Student& s) {
    if (this == &s) return *this; // Kiểm tra tự gán

    delete[] ID; // Giải phóng bộ nhớ cũ

    age = s.age;
    name = s.name;
    ID = new char[11]; // Cấp phát bộ nhớ mới
    strcpy_s(ID, 11, s.ID); // Sao chép dữ liệu ID

    return *this;
}

// Destructor
Student::~Student() {
    delete[] ID; // Giải phóng bộ nhớ
}

// Thay đổi tuổi
void Student::ChangeAge(int newAge) {
    age = newAge;
}

// Hiển thị thông tin
void Student::display() {
    cout << "ID: " << ID << "; Name: " << name << "; Age: " << age << endl;
}

int getAge(const Student& s) {
    return s.age;
}

int main() {
    Student s1("001", "Nguyen Van A", 22);
    Student s2("002", "Nguyen Van B");
    Student s3 = s2; // Gọi Copy Constructor

    s3.ChangeAge(20);

    s1.display();
    s2.display();
    s3.display();

    s3 = s1; // Gán đối tượng đã tồn tại

    cout << "Sau khi gán s3 = s1:" << endl;
    s3.display(); // Phải giống s1

    cout << getAge(s1);


    return 0;
}
