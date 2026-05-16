#include <iostream>
using namespace std;

// protected: chạy vẫn được, nh phải khai báo trong lớp con 
// private: không được hoàn toàn 
class Animal {
public:
    void speak() { cout << "I'm a animal!" << endl; }
};

//public: chạy bình thường
// protected: vẫn được, nhưng phải khai báo trong class con 
// private: vẫn được, nhưng error khi có lớp con khác của lớp này 
class Dog : private Animal {
public:
    void bark() {
        speak();
        cout << "Gau dau!" << endl;
    }
};

int main() {
    Dog d;
    // d.speak(); // ✅ Được phép vì `speak()` là public
    d.bark();  // ✅ Được phép
    return 0;
}