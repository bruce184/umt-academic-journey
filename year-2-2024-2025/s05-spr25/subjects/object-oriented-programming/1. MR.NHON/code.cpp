#include <iostream>
#include <string>
using namespace std;

class tu_av {
    string tuA, nghiaV;
public:
    tu_av() {} // Constructor mặc định

    void nhap() {
        cout << "Nhap tu Tieng Anh: ";
        cin >> tuA;
        cin.ignore(); // Xóa bộ nhớ đệm sau khi đọc từ
        cout << "Nhap nghia Tieng Viet: ";
        getline(cin, nghiaV);
    }

    string get_tuA() const { return tuA; }
    string get_nghiaV() const { return nghiaV; }
};

class tudien_av {
    int n;          // Số lượng từ vựng
    tu_av* w;       // Mảng động lưu danh sách từ
public:
    tudien_av(int size) {
        n = size;
        w = new tu_av[n]; // Cấp phát động mảng từ
    }

    ~tudien_av() {
        delete[] w; // Giải phóng bộ nhớ
    }

    void nhap() {
        cout << "Nhap so luong tu: " << n << endl;
        for (int i = 0; i < n; i++) {
            cout << "Tu " << i + 1 << ":\n";
            w[i].nhap();
        }
    }

    string tratu(const string& wA) const {
        for (int i = 0; i < n; i++) {
            if (wA == w[i].get_tuA()) {
                return w[i].get_nghiaV();
            }
        }
        return "Khong tim thay tu nay!";
    }
};

int main() {
    int so_tu;
    cout << "Nhap so tu trong tu dien: ";
    cin >> so_tu;
    
    tudien_av td(so_tu);
    td.nhap();

    string wA;
    cin.ignore(); // Xóa bộ nhớ đệm trước khi nhập từ
    while (true) {
        cout << "\nNhap tu can tra (nhap 'exit' de thoat): ";
        getline(cin, wA);
        
        if (wA.empty()) {
            cout << "Tu khong duoc de trong!\n";
            continue;
        }
        if (wA == "exit") break;
        
        cout << "Nghia: " << td.tratu(wA) << endl;
    }

    return 0;
}
