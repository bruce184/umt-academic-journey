#include <iostream>
#include <vector>
#include <algorithm>
#include <set>
using namespace std;

int main() {
    int n;
    cout << "Nhap so dinh: "; cin >> n;

    vector<vector<int>> adj(n);
    vector<int> total_e(n);         // Mảng chứa số đỉnh kề chưa tô của mỗi đỉnh
    vector<int> color(n, -1);       // Màu mỗi đỉnh (-1: chưa tô)
    vector<bool> colored(n, false); // Đã tô hay chưa

    // Nhập danh sách kề
    for (int i = 0; i < n; i++) { // Với mỗi đỉnh
        cout << "Nhap cac dinh ke cua dinh " << i << " (ket thuc bang -1): ";

        // Nhập mảng đỉnh kề chưa tô của đỉnh đang xét  
        int v; 
        while (cin >> v && v != -1) {
            adj[i].push_back(v);
        }

        // Update kích thước mảng đỉnh kề chưa tô 
        total_e[i] = adj[i].size();
    }

    int used_colors = 0; // Số màu đã dùng

    for (int step = 0; step < n; step++) {
        // Chọn đỉnh chưa tô có total_e lớn nhất
        int max_e = -1; // số đỉnh 
        int u = -1; // đỉnh kề của đỉnh v
        for (int i = 0; i < n; i++) {
            if (!colored[i] && total_e[i] > max_e) {
                max_e = total_e[i];
                u = i;
            }
        }
        if (u == -1) break; // Không còn đỉnh nào chưa tô

        // Tìm màu (giá trị) không trùng với các đỉnh kề đã tô
        set<int> neighbor_colors; // mảng trung gian để đối chiếu 
        for (int v : adj[u]) { // với mỗi đỉnh kề của đỉnh v đag xét
            if (colored[v]) neighbor_colors.insert(color[v]); 
            // cập nhật giá trị của mảng trung gian 
        }

        int chosen_color = 0; // biến đếm 
        while (neighbor_colors.count(chosen_color)) chosen_color++;
        // nếu mảng đã có thì tăng 

        color[u] = chosen_color; // update mảng màu 
        colored[u] = true; // update mảng 
        if (chosen_color + 1 > used_colors) used_colors = chosen_color + 1;
        // nếu 

        // Giảm total_e của các đỉnh chưa tô liền kề
        for (int v : adj[u]) {
            if (!colored[v]) total_e[v]--;
        }
    }

    cout << "\nTong so mau su dung: " << used_colors << endl;
    for (int i = 0; i < n; i++) {
        cout << "Dinh " << i << " : Mau " << color[i] << endl;
    }


    return 0;
}
