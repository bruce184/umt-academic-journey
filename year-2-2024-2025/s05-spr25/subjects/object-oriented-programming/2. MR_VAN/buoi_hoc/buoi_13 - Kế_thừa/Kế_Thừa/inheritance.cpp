#include <iostream>
using namespace std; 

class base{
public: 
	virtual void show() { 
	// Khi không có 'virtual': sẽ chạy hàm của class base                 -  static binding 
	// Khi có 'virtual': sẽ chạy hàm của đối tượng đang được chiếu - dynamic binding 
		cout << "Function show() of Base Class " << endl;
	}
};

class derived : public base {
public: 
	void show() {
		cout << "Function show() of Derived Class" << endl;
	}
};

int main() {
	base* ptr;
	derived d;
	ptr = &d;

	ptr->show();

	return 0;
}