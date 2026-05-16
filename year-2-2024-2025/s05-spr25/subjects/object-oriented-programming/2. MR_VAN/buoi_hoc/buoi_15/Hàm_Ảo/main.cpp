#include <iostream>
using namespace std;


class Animal {
public:
    virtual void makesound() = 0; // hàm thuần ảo
};

class Dog : public Animal {
//public:
//    void makesound() override  {
//        cout << "Dog barks" << endl;
    //}
};

class Husky : public Dog {
public:
    void makesound() override {
        cout << "Husky barks" << endl;
    }
};

int main() {
    Animal* ptr;
    Husky  hu;
    ptr = &hu;
    ptr->makesound();  // chạy hàm con 

    return 0;
}