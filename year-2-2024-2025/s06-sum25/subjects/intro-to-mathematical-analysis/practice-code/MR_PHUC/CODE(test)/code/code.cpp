#include <iostream>
#include <cmath> 
using namespace std; 

// Căn bậc 3 (hỗ trợ âm)
float cube_root(float x) {
    return cbrt(x);  // từ C++11
}

// Căn bậc 5 (chỉ chính xác với x>=0; với x âm, ta lấy dấu hậu xử lý)
float fifth_root(float x) {
    if (x >= 0) return pow(x, 1.0/5.0);
    else        return -pow(-x, 1.0/5.0);
}



int main(){
    int t; cin>>t; 

    while (t--){
        // float n; cin>>n;
        float e; cin>>e;  

        // float tu = cube_root(n) -1;
        // float mau = fifth_root(n) -1;
        // float cal = tu / mau;
        // float res1 = abs(cal) -5/3;


 
    }

    return 0; 
}
