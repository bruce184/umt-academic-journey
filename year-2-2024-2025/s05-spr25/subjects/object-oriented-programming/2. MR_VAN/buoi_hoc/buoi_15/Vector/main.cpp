#include <iostream>
#include <vector>
using namespace std;

int main() {
	vector <int> v;

	v.push_back(10);
	v.push_back(20);
	v.push_back(30);
	/*v.pop_back();*/

	v.insert(v.begin() + 1, 15) ; // chèn số 15 vào vị trí thứ 2
	v.reserve(100);

	for (int i : v) cout << i << " ";
	cout << endl;

	cout << "Size: " << v.size() << endl;
	cout << "Capacity: " << v.capacity() << endl;
	// 'capacity':  sức chứa của vector mình định nghĩa 
	// 'size': độ dài thực tế 
	cout << "Is empty: " << (v.empty() ? "Yes" : "No") << endl;

	return 0;
}