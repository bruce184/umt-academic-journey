#include <iostream>
using namespace std;

class complex{
public:
    int real, imag;
    complex (int r, int i): real(r), imag(i){}

    //Nạp chồng toán tử cộng +
    complex operator + (complex const &obj){
        return complex (real + obj.real, imag + obj.imag);
    }

    complex operator - (complex const &obj){
        return complex (real - obj.real, imag - obj.imag);
    }

    complex operator * (complex const &obj){
        return complex (real*obj.real - imag*obj.imag, real*obj.imag + imag*obj.real);
    }

    complex operator / (complex const &obj){
        return complex ((real*obj.real + imag*obj.imag)/(obj.real*obj.real + obj.imag*obj.imag), (imag*obj.real - real*obj.imag)/(obj.real*obj.real + obj.imag*obj.imag));
    }

    bool  operator == (complex const &obj){
        return (real == obj.real && imag == obj.imag);
    }

    void display() {
        cout << real;
        if(imag >= 0)
            cout << " + " << imag << "i" << endl;
        else
            cout << " - " << -imag << "i" << endl;
    }

    friend istream & operator >> (istream &in, complex &c){
        cout<<"Nhap phan thuc: "; in>>c.real;
        cout<<"Nhap phan ao: "; in>>c.imag;
        return in;
    }

    friend ostream & operator << (ostream &out, complex &c) {
        out << c.real;
        if(c.imag >= 0)
            out << " + " << c.imag << "i";
        else
            out << " - " << -c.imag << "i";
        return out;
    }
};

int main(){
    int r1, r2, i1, i2;
    cout<<"Nhap so that r1: "; cin>>r1;
    cout<<"Nhap so ao i1: "; cin>>i1;
    cout<<"Nhap so that r2: "; cin>>r2;
    cout<<"Nhap so ao i2: "; cin>>i2;
    complex c1(r1, i1), c2(r2, i2);

    complex c3 = c1 + c2; // c3 = c1.operator+(c2);
    c3.display();
    complex c4 = c1 - c2; 
    c4.display();
    complex c5 = c1 * c2; 
    c5.display();   
    complex c6 = c1 / c2; 
    c6.display();

    // Ví dụ sử dụng toán tử >> và <<
    complex c7(0, 0);
    cout << "\nNhap so phuc moi:" << endl;
    cin >> c7;
    cout << "So phuc vua nhap: " << c7 << endl;

    return 0;
}