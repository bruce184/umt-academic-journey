#include <iostream>
#include <string>
#include <cmath>
using namespace std;

// Xác định xét giới hạn hai-chiều hay một-chiều
enum Side { BOTH, LEFT, RIGHT };

struct X0Data {
    double value;  // điểm cần xét (ví dụ 2)
    Side   side;   // BOTH (hai-chiều), LEFT (2⁻), RIGHT (2⁺)
};

// Đọc x0 kèm thông tin chiều giới hạn
X0Data readX0() {
    cout << "Enter x0 (e.g. 2 for two-sided, 2- for left, 2+ for right): ";
    string s; cin  >> s;
    
    X0Data r{0, BOTH};
    if (!s.empty() && (s.back() == '-' || s.back() == '+')) {
        r.side  = (s.back() == '-' ? LEFT : RIGHT);
        r.value = stod(s.substr(0, s.size() - 1));
    } else {
        r.side  = BOTH;
        r.value = stod(s);
    }
    return r;
}

// Giá trị hàm bên trái của điểm x=2: f(x)=x^2 - 2x + 3
double f_left(double x) {
    return x*x - 2*x + 3;
}

// Giá trị hàm bên phải của điểm x=2: f(x)=4x - 3
double f_right(double x) {
    return 4*x - 3;
}

int main() {
    int T;
    cout << "Input number of test cases: ";
    cin  >> T;
    while (T--) {
        cout << "\n--- New test case ---\n";
        auto x0 = readX0();
        double x = x0.value;
        double leftVal  = f_left(x);
        double rightVal = f_right(x);

        if (x0.side == LEFT) {
            cout << "Limit from left  = " << leftVal  << "\n";
        }
        else if (x0.side == RIGHT) {
            cout << "Limit from right = " << rightVal << "\n";
        }
        else { // BOTH
            cout << "Limit from left  = " << leftVal  << "\n";
            cout << "Limit from right = " << rightVal << "\n";
            if (fabs(leftVal - rightVal) < 1e-12)
                cout << "Two-sided limit = " << leftVal << "\n";
            else
                cout << "No two-sided limit (values differ)\n";
        }
    }
    return 0;
}
