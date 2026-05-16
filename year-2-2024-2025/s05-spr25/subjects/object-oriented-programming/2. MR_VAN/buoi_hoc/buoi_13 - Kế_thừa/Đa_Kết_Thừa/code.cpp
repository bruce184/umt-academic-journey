#include <iostream>
using namespace std;

// Lớp Cha 1
class Person {
public:
    string name;
    int age;
    Person(string n, int a) : name(n), age(a) {}

    void showpersoninfo() {
        cout << name << " " << age << endl;
    }

    void eat() {
        cout << "Person eat " << endl;
    }

};

// Lớp Cha 2
class Employee {
public:
    string position;
    Employee(string n) : position(n) {}
    void showemployee() {
        cout << position << endl;
    }

    void eat() {
        cout << "Person eat " << endl;
    }

};

// Lớp con thừa hưởng từ 2 lớp cha trên 
class Manager : public Person, public Employee {
public:
    Manager(string n, int a, string p) : Person(n, a), Employee(p) {}
    void showmanager() {
        showpersoninfo();
        showemployee();
        cout << " is manager"  << endl;
    }
};

int main() {
    Manager p1("Jonh", 29, "Director");
    p1.showmanager();
    // p1.eat(); // diamond problem: cùng tên hàm thành phần -> khai báo rõ của lớp cha nào 
    p1.Employee::eat();


    return 0;
}

