#include <iostream>
using namespace std;

class Counter {
private:
    int value;
public:
    // Constructor với giá trị mặc định
    Counter(int v = 0) : value(v) {}

    // Overload toán tử tăng dạng prefix (++x)
    // Prefix: tăng giá trị rồi trả về đối tượng hiện tại (là đối tượng đã tăng)
    Counter& operator++() {
        ++value;       // Tăng trước
        return *this;  // Trả về đối tượng đã tăng
    }

    // Overload toán tử tăng dạng postfix (x++)
    // Postfix: trả về đối tượng ban đầu rồi mới tăng giá trị.
    Counter operator++(int) {
        Counter temp = *this; // Lưu trạng thái ban đầu
        value++;              // Tăng giá trị
        return temp;          // Trả về đối tượng ban đầu (trước khi tăng)
    }

    // Hàm hiển thị giá trị
    void display() const {
        cout << value;
    }
};

int main(){
    Counter c(5);
    cout << "Gia tri ban dau: ";
    c.display(); 
    cout << endl;
    
    cout << "Sau khi su dung prefix (++c): ";
    (++c).display(); // tăng và hiển thị giá trị mới
    // '(++c)' tương đương với 'c.operator++()'
    cout << endl;
    
    cout << "Su dung postfix (c++): ";
    c.display(); // hiển thị giá trị cũ trước khi tăng
    cout << endl;
    
    cout << "Gia tri hien tai: ";
    (c++).display(); // hiển thị giá trị sau khi tăng
    cout << endl;

    return 0;
}