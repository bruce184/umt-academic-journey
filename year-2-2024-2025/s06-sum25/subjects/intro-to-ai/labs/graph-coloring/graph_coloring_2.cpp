#include <iostream>
#include <vector>
#include <fstream>
#include <algorithm>
using namespace std;

int main() {
    ifstream fin("input.txt");
    ofstream fout("output.txt");

    int t;
    fin >> t;  // Đọc số test case từ file
    while (t--) {
        int m;
        fin >> m;  // Đọc số cạnh từ file
        vector<pair<int, int>> e;
        vector<int> e_color(m, -1);

        for (int i = 0; i < m; i++) {
            int u, v;
            fin >> u >> v;  // Đọc cặp cạnh từ file
            e.push_back({u, v});
        }

        fout << "List of edges with their vertices:\n";
        for (int i = 0; i < e.size(); i++) {
            fout << "Edge " << i + 1 << ": (" << e[i].first << ", " << e[i].second << ")\n";
        }

        // Tô màu cạnh
        for (int i = 0; i < e.size(); i++) {
            vector<int> used_color;
            for (int j = 0; j < i; j++) { // Sửa: j < i
                if (e[i].first == e[j].first || e[i].first == e[j].second ||
                    e[i].second == e[j].first || e[i].second == e[j].second) {
                    if (e_color[j] != -1) { // nếu đã được tô 
                        used_color.push_back(e_color[j]); // thêm vào mảng màu bị cấm (used_color) 
                    }
                }
            }
            // Tìm màu nhỏ nhất để gán cho i 
            int color = 0;
            while (find(used_color.begin(), used_color.end(), color) != used_color.end()) {
                color++; 
            }
            e_color[i] = color;
        }

        fout << "List of edges with their vertices and color:\n";
        for (int i = 0; i < m; i++) {
            fout << "Edge " << i + 1 << ": (" << e[i].first << ", " << e[i].second << ") - Color: " << e_color[i] << endl;
        }

        int max_color = *max_element(e_color.begin(), e_color.end());
        fout << "Total colors used: " << max_color + 1 << "\n\n";
    }

    fin.close();
    fout.close();
    return 0;
}
