#include <iostream>
#include <cstring> // cho hàm memcpy
using namespace std;

class day {
private:
    int n, size;
    long* e;

public:
    // Constructor
    day();

    // Constructor sao chép
    day(const day& other);

    // Destructor
    ~day();

    // Toán tử gán
    day& operator=(const day& other);

    void nhap();
    void xuat();
    bool timkiem(long) const;
    void them(long);
    day giao(const day&) const;
    int getSize() const { return n; }  // Getter để truy cập n
};

// Constructor mặc định
day::day() {
    n = 0;
    size = 100;
    e = new long[size];
}

// Constructor sao chép
day::day(const day& other) {
    n = other.n;
    size = other.size;
    e = new long[size];
    memcpy(e, other.e, n * sizeof(long));
}

// Destructor
day::~day() {
    delete[] e;
}

// Toán tử gán
day& day::operator=(const day& other) {
    if (this != &other) {  // Tránh tự gán
        delete[] e;
        n = other.n;
        size = other.size;
        e = new long[size];
        memcpy(e, other.e, n * sizeof(long));
    }
    return *this;
}

// Nhập dữ liệu
void day::nhap() {
    cout << "Nhap so phan tu: ";
    cin >> n;

    if (n > size) {
        delete[] e;
        size = n + 100;
        e = new long[size];
    }

    cout << "Nhap " << n << " phan tu: " << endl;
    for (int i = 0; i < n; i++) {
        cin >> e[i];
    }
}

// Xuất dữ liệu
void day::xuat() {
    if (n == 0) {
        cout << "Day rong!" << endl;
        return;
    }
    for (int i = 0; i < n; i++) {
        cout << e[i] << " ";
    }
    cout << endl;
}

// Tìm kiếm phần tử
bool day::timkiem(long x) const { // để đảm bảo compiler không nghĩ hàm thay đổi dãy A vì A là const
    for (int i = 0; i < n; i++) {
        if (e[i] == x) {
            return true;
        }
    }
    return false;
}

// Thêm phần tử vào dãy
void day::them(long x) {
    if (n >= size) {
        size += 100;
        long* new_e = new long[size];
        memcpy(new_e, e, n * sizeof(long)); // Sao chép dữ liệu cũ
        delete[] e;
        e = new_e;
    }
    e[n++] = x;
}

// Tìm giao của hai dãy
day day::giao(const day& A) const {
    day C;
    for (int i = 0; i < n; i++) {
        if (A.timkiem(e[i]) && !C.timkiem(e[i])) {
            C.them(e[i]);
        }
    }
    return C;
}

// Chương trình chính
int main() {
    day A, B, C;

    cout << "Nhap day A: " << endl;
    A.nhap();

    cout << "Nhap day B: " << endl;
    B.nhap();

    C = A.giao(B);

    cout << "Giao cua 2 day: ";
    if (C.getSize() == 0) {
        cout << "Khong co phan tu giao" << endl;
    }
    else {
        C.xuat();
    }

    return 0;
}