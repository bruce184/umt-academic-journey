#include <iostream>
using namespace std;

class shape {
public:
	virtual void draw() {
		cout << "Draw General Shape " << endl;
	}
};

class circle : public shape {
public:
	void draw() override {
		cout << "Draw Circle" << endl;
	}
};

class rectangle : public shape {
public:
	void draw() override {
		cout << "Draw Rectangle " << endl;
	}
};


int main() {
	shape* shape[2]; // Mảng chứa con trỏ tới lớp cha 
	shape[0] = new circle();
	shape[1] = new rectangle();

	for (int i = 0; i < 2; i++) {
		shape[i]->draw(); // GỌi hàm draw() theo kiểu đa hình (nhờ 'virtual')
	}

	return 0;
}