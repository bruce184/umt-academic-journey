#include <iostream> 
#include <vector>
using namespace std; 

/*
tử là đa thức bậc 1 với công thức tổng quát là 1+kx = x(k + 1/x)
-> tích tử là bậc 5: x^5(k + 1/x) 
mẫu cũng bậc 5: x^5(2 + 3/x)^5
-> Giới hạn: phân số = 0
​=> Giới hạn bằng tỉ số các hệ số của x^5

*/

int main(){
    int n; cin>>n;
    long long x1, x2;  
    vector<int> hs_tu; 
    for (int i=0; i<n; i++){
        cin>>x1; 
        hs_tu.push_back(x1);
    }
    cin>> x2;

    long long sum_hs = 1; 
    for (int i=0; i<n; i++){
        sum_hs *= hs_tu[i];
    }


    cout<<sum_hs;


    return 0; 
}