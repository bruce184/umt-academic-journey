#include <iostream> 
using namespace std; 

/*
Do tử có thể rút gọn -> lim(x->3) = (x-2)/(x-5) 
*/


float f(float x) {
    return (x - 2.0f) / (x - 5.0f);
}

int main(){ 
    float x; 
    cout<<"Input x: "; cin>>x; 

    float res = f(x);
    cout<<"The result: "<<res<<endl;
    return 0; 
}