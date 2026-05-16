#include <iostream>
#include <vector>
using namespace std;

struct student {
	string name; 
	int age;
};

int main() {
	vector <student> student = { {"Alice", 20}, {"Bob", 22} };

	/*for (int i = 0; i < student.size(); i++) {
		cout << "Information Student" << i + 1 << ':';
		cout << student[i].name << "; Age: " << student[i].age << endl;
	}*/

	for (const auto& s : student) {
		cout << s.name << " - " << s.age << " years old \n";
	}

	return 0;
}