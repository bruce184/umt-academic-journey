#include <iostream> 
#include <vector> 
#include <algorithm>
#include <functional>
#include <cmath>
using namespace std; 
#define db double
using CongThuc = function<db(const vector<pair<db, bool>>&)>;
#define ll long long 
#define endl "\n"
#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

db rad2deg (db rad){
    return rad * (180.0 / M_PI);
}

db deg2rad (db deg){
    return deg * (M_PI / 180.0);
}

vector < pair<db, bool> > M = {
    // first: giá trị; second: có hay chưa
    {0, false},             // a
    {6, true},              // b
    {8, true},              // c

    {0, false},             // S
    {0, false},             // p

    {deg2rad(60), true},    // alpha
    {0, false},             // beta
    {0, false},             // gamma

    {0, false},             // ha
    {0, false},             // hb
    {0, false},             // hc

    {0, false},             // ma
    {0, false},             // mb
    {0, false},             // mc

    {0, false},             // pa
    {0, false},             // pb
    {0, false},             // pc

    {0, false},             // R (bán kính đường tròn ngoại tiếp)
    {0, false},             // r (bán kính đường tròn nội tiếp)
    {0, false},             // ra
    {0, false},             // rb
    {0, false}              // rc
};


vector<CongThuc> F = {
    // f1: alpha + beta + gamma = pi
    [](const vector<pair<db, bool>>& M) {
        db alpha = M[5].first, beta = M[6].first, gamma = M[7].first;
        db pi = alpha + beta + gamma;
        return pi - M_PI;
    },
    // f2: a^2 = b^2 + c^2 - 2bc*cos(alpha)
    [](const vector<pair<db, bool>>& M) {
        db a = M[0].first, b = M[1].first, c = M[2].first, alpha = M[5].first;
        db left = a * a;
        db right = b * b + c * c - 2 * b * c * cos(alpha);
        return left - right;
    },
    // f3: b^2 = a^2 + c^2 - 2ac*cos(beta)
    [](const vector<pair<db, bool>>& M) {
        db a = M[0].first, b = M[1].first, c = M[2].first, beta = M[6].first;
        db left = b * b;
        db right = a * a + c * c - 2 * a * c * cos(beta);
        return left - right;
    },
    // f4: c^2 = a^2 + b^2 - 2ab*cos(gamma)
    [](const vector<pair<db, bool>>& M) {
        db a = M[0].first, b = M[1].first, c = M[2].first, gamma = M[7].first;
        db left = c * c;
        db right = a * a + b * b - 2 * a * b * cos(gamma);
        return left - right;
    },
    // f5: a/sin(alpha) = b/sin(beta)
    [](const vector<pair<db, bool>>& M) {
        db a = M[0].first, b = M[1].first, alpha = M[5].first, beta = M[6].first;
        db left = a / sin(alpha);
        db right = b / sin(beta);
        return left - right;
    },
    // f6: c/sin(gamma) = b/sin(beta)
    [](const vector<pair<db, bool>>& M) {
        db c = M[2].first, b = M[1].first, gamma = M[7].first, beta = M[6].first;
        db left = c / sin(gamma);
        db right = b / sin(beta);
        return left - right;
    },
    // f7: a/sin(alpha) = c/sin(gamma)
    [](const vector<pair<db, bool>>& M) {
        db a = M[0].first, c = M[2].first, alpha = M[5].first, gamma = M[7].first;
        db left = a / sin(alpha);
        db right = c / sin(gamma);
        return left - right;
    },
    // f8: a/sin(alpha) = 2R
    [](const vector<pair<db, bool>>& M) {
        db a = M[0].first, alpha = M[5].first, R = M[18].first;
        db left = a / sin(alpha);
        db right = 2 * R;
        return left - right;
    },
    // f9: b/sin(beta) = 2R
    [](const vector<pair<db, bool>>& M) {
        db b = M[1].first, beta = M[6].first, R = M[18].first;
        db left = b / sin(beta);
        db right = 2 * R;
        return left - right;
    },
    // f10: c/sin(gamma) = 2R
    [](const vector<pair<db, bool>>& M) {
        db c = M[2].first, gamma = M[7].first, R = M[18].first;
        db left = c / sin(gamma);
        db right = 2 * R;
        return left - right;
    },
    // f11: 2p = a + b + c
    [](const vector<pair<db, bool>>& M) {
        db a = M[0].first, b = M[1].first, c = M[2].first, p = M[4].first;
        db left = 2 * p;
        db right = a + b + c;
        return left - right;
    },
    // f12: S = a*ha/2
    [](const vector<pair<db, bool>>& M) {
        db S = M[3].first, a = M[0].first, ha = M[8].first;
        db right = a * ha / 2;
        return S - right;
    },
    // f13: S = b*hb/2
    [](const vector<pair<db, bool>>& M) {
        db S = M[3].first, b = M[1].first, hb = M[9].first;
        db right = b * hb / 2;
        return S - right;
    },
    // f14: S = c*hc/2
    [](const vector<pair<db, bool>>& M) {
        db S = M[3].first, c = M[2].first, hc = M[10].first;
        db right = c * hc / 2;
        return S - right;
    },
    // f15: S = p*r
    [](const vector<pair<db, bool>>& M) {
        db S = M[3].first, p = M[4].first, r = M[19].first;
        db right = p * r;
        return S - right;
    },
    // f16: S = sqrt(p*(p-a)*(p-b)*(p-c))
    [](const vector<pair<db, bool>>& M) {
        db S = M[3].first, p = M[4].first, a = M[0].first, b = M[1].first, c = M[2].first;
        db right = sqrt(p * (p - a) * (p - b) * (p - c));
        return S - right;
    },
    // f17: S = b*c*sin(alpha)/2
    [](const vector<pair<db, bool>>& M) {
        db S = M[3].first, b = M[1].first, c = M[2].first, alpha = M[5].first;
        db right = b * c * sin(alpha) / 2;
        return S - right;
    },
    // f18: S = a*c*sin(beta)/2
    [](const vector<pair<db, bool>>& M) {
        db S = M[3].first, a = M[0].first, c = M[2].first, beta = M[6].first;
        db right = a * c * sin(beta) / 2;
        return S - right;
    },
    // f19: S = a*b*sin(gamma)/2
    [](const vector<pair<db, bool>>& M) {
        db S = M[3].first, a = M[0].first, b = M[1].first, gamma = M[7].first;
        db right = a * b * sin(gamma) / 2;
        return S - right;
    }
};

void propagate_activation(vector<CongThuc>& F, vector<pair<db, bool>>& M) {
    bool changed = true;
    while (changed) {
        changed = false;
        for (int i = 0; i < F.size(); i++){
            db res = F[i](M);
            cout << "Result of F[" << i << "]: " << res << endl;  
        }
    }
}

int main(){
    propagate_activation(F, M);
    return 0;
}

