#include <iostream>
using namespace std;

long long gcd(long long  a, long long b) {
	while (b != 0) {
		long long temp = b;
		b = a % b;
		a = temp;
	}
	return a;
}

class rational {
private: 
	long long numerator; // tử 
	long long denominator; // mẫu 

public: 
	rational(long long tu, long long mau) {
		if (mau == 0) {
			throw invalid_argument("mau khong duoc bang 0");
		}

		// Rút gọn phân số 
		long long gcd_val = gcd(tu, mau); 
		numerator = tu / gcd_val;
		denominator = mau / gcd_val;

		// Đảm bảo mẫu số luôn dương 
		if (denominator < 0) {
			numerator = -numerator;
			denominator = -denominator;
		}
	}

		void print() const {
			cout << numerator << "/" << denominator << endl;
		}


		// Phép + 2 số hữu tỉ
		rational operator+ (const rational& other) {
			long long tu_moi = numerator * other.denominator + other.numerator * denominator;
			long long mau_moi = denominator * other.denominator;
			return rational(tu_moi, mau_moi);
		}

		// Phép - 2 số hữu tỉ 
		rational operator- (const rational& other) {
			long long tu_moi1 = numerator * other.denominator - other.numerator * denominator;
			long long mau_moi1 = denominator * other.denominator;
			return rational(tu_moi1, mau_moi1);
		}

		// Toán tử xuất: cho phép in đối tượng rational thông qua cout
		friend ostream&  operator<< (ostream& os, const rational& r) {
			os << r.numerator << "/" << r.denominator;
			return os;
		}

		friend istream& operator>>(istream& is, rational& r) {
			int num, den;
			char slash;
			// Đọc tử số, sau đó ký tự '/' và mẫu số
			is >> num >> slash >> den;
			if (slash != '/') { // Nếu không có dấu '/' theo định dạng, đánh dấu lỗi
				is.setstate(ios::failbit);
				return is;
			}
			// Gán giá trị vừa đọc cho đối tượng r (sử dụng constructor đã rút gọn phân số)
			r = rational(num, den);
			return is;
		}

};

int main() {
	rational r1(5, 9), r2(7, 3);
	r1.print();
	r2.print();

	rational res1 = r1 + r2;
	rational res2 = r2 - r1;

	cout<<res1<< " " << res2<< endl; // phải định nghĩa hàm operator <<

	return 0;
}