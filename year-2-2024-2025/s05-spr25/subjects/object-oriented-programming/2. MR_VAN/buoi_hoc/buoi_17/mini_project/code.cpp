#include <iostream>
#include <fstream>
#include <string>
using namespace std;

class Student {
private:
    string name;
    int age = 0;
    float gpa;
public:
    // Constructor mặc định
    Student() : name(""), age(0), gpa(0.0f) {}

    Student(string n, int a, float g) : name(n), age(a), gpa(g) {}

    // Nhập và xuất từ bàn phím
    void input() {
        cout << "Name: ";
        getline(cin, name);
        cout << "Age: ";
        cin >> age;
        cout << "GPA: ";
        cin >> gpa;
        cin.ignore(); // Xử lý newline
    }

    void display() const {
        cout << "Name: " << name << ", Age: " << age << ", GPA: " << gpa << endl;
    }

    // Hàm nhập/xuất dạng text 
    friend ostream& operator<<(ostream& out, const Student& s) {
        out << s.name << ", " << s.age << "," << s.gpa << endl;
        return out;
    }

    friend istream& operator>>(istream& in, Student& s) {
        getline(in, s.name, ',');
        in >> s.age;
        in.ignore();
        in >> s.gpa;
        in.ignore();
        return in;
    }
};

void writeTextFile() {
    ofstream out("Student.txt");
    Student s1("Tieu Long Nu", 20, 3.6), s2("Ly Mac Sau", 21, 3.2);
    out << s1;
    out << s2; 
    out.close();
}

void readTextFile() {
    ifstream in("Student.txt");
    Student s; 
    while (in >> s) {
        s.display();
    }
    in.close();
}

int main() {
    writeTextFile();
    readTextFile();
    return 0;
}
