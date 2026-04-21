#include <iostream>
#include <vector>
using namespace std;

// Hàm tính giới hạn:
// lim_{x→0} ([ (1+a1 x)(1+a2 x)…(1+ak x) − 1 ] / x) = a1 + a2 + … + ak
double computeLimit(const vector<double>& a) {
    double sum = 0;
    for (double ai : a) {
        sum += ai;
    }
    return sum;
}

int main() {
    int k;
    cout << "Input k (number of factors): ";
    cin  >> k;

    vector<double> a(k);
    cout << "Input coefficients a_i: ";
    for (int i = 0; i < k; ++i) {
        cin >> a[i];
    }

    double limit = computeLimit(a);
    cout << "Limit = " << limit << "\n";
    return 0;
}
