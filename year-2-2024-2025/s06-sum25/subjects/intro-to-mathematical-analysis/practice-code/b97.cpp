#include <iostream>
#include <vector>
#include <string>
#include <cmath>
#include <limits>

using namespace std;

// Cấu trúc giá trị giới hạn (số thực hay vô cực)
struct X0Data {
    bool   isInfinite;    // true nếu INF / -INF
    double infiniteSign;  // +1 hoặc -1 khi vô cực
    double value;         // dùng khi không vô cực
};
X0Data readX0() {
    cout << "Enter x0 (number, INF, -INF): ";
    string s; cin >> s;
    X0Data r{false, 1.0, 0.0};
    if (s == "INF"  || s == "+INF") r.isInfinite = true, r.infiniteSign = +1;
    else if (s == "-INF")           r.isInfinite = true, r.infiniteSign = -1;
    else                            r.value = stod(s);
    if (r.isInfinite)               cout << "x0 = " << (r.infiniteSign>0?"+":"-") << "infinity\n";
    else                            cout << "x0 = " << r.value << "\n";
    return r;
}

// Nhập đa thức dãy số 
vector<int> inputCoefficients(const string& name, int count) {
    vector<int> A(count);

    cout << "Input coefficients for " << name << " (" << count << " values): ";
    for (int i = 0; i < count; ++i) cin >> A[i];
    
    cout << name << " = [ ";
    for (int v : A) cout << v << " ";
    cout << "]\n";
    return A;
}

// Để tính công thức tổng quát của đa thức bằng Horner (pow không lặp lại)
double eval(const vector<int>& A, double x) {
    double res = 0;
    for (int i = (int)A.size() - 1; i >= 0; --i)
        res = res * x + A[i];
    return res;
}

// Đa thức đạo hàm bậc nhất từ vector hệ số đầu vào
vector<int> deriv(const vector<int>& A) {
    int d = (int)A.size() - 1;
    
    if (d <= 0) return {0}; // đa thức rỗng/hằng
    
    vector<int> B(d);
    for (int i = 1; i <= d; ++i)
        B[i-1] = A[i] * i;
    return B;
}

int main() {
    int T;
    cout<<"Input number of test cases: "; cin>>T;
    for (int tc=1; tc<=T; tc++){
        cout << "\n=== Test case " << tc << " ===\n";

        int m, n;
        // automatically know put into: ax+b, ax^2+bx+c,....
        cout << "Input m (number of coefficients in P): "; cin  >> m;
        cout << "Input n (number of coefficients in Q): "; cin  >> n;
    
        auto P = inputCoefficients("P", m);
        auto Q = inputCoefficients("Q", n);
        auto x0 = readX0();
    
        // x0 hữu hạn -> thế vào tính đa thức 
        if (!x0.isInfinite) {
            double P0 = eval(P, x0.value);
            double Q0 = eval(Q, x0.value);
            cout << "P(x0) = " << P0 << "\nQ(x0) = " << Q0 << "\n";
    
            // 
            if (fabs(Q0) > 1e-12) {
                cout << "Limit = " << (P0 / Q0) << "\n";
            }
            else if (fabs(P0) > 1e-12) {
                double inf = numeric_limits<double>::infinity();
                double sign = (P0 > 0 ? +1 : -1) * x0.infiniteSign;
                cout << "Limit = " << (sign > 0 ? inf : -inf) << "\n";
            }
            else {
                // 0/0: áp dụng L'Hôpital
                vector<int> A = P, B = Q;
                double a, b;
                do {
                    A = deriv(A);
                    B = deriv(B);
                    a = eval(A, x0.value);
                    b = eval(B, x0.value);
                } while (fabs(b) <= 1e-12);
                cout << "Limit = " << (a / b) << "\n";
            }
        }
        else {
            int degP = P.size() - 1, degQ = Q.size() - 1;
            if (degP < degQ) {
                cout << "Limit = 0\n";
            }
            else if (degP == degQ) {
                cout << "Limit = " 
                     << double(P.back()) / Q.back() << "\n";
            }
            else {
                double inf = numeric_limits<double>::infinity();
                double coeff = double(P.back()) / Q.back();
                double sign  = (coeff > 0 ? +1 : -1) * x0.infiniteSign;
                cout << "Limit = " << (sign > 0 ? inf : -inf) << "\n";
            }
        }
    }

    return 0;
}
