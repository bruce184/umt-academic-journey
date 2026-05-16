#include <iostream>
#include <vector>
#include <limits>
#include <algorithm>
using namespace std;

// Hàm nhập bảng
vector<vector<int>> inputTable() {
    int m, j;
    cout << "Input the amount of machines (rows): "; cin >> m;
    cout << "Input the amount of jobs (columns): "; cin >> j;

    vector<vector<int>> a(m, vector<int>(j));
    cout << "Input the table:\n";
    for (int i = 0; i < m; i++) {
        for (int y = 0; y < j; y++) {
            cin >> a[i][y];
        }
    }
    return a;
}

// Hàm in bảng
void printTable(const vector<vector<int>>& a) {
    cout << "The table after input:\n";
    for (int i = 0; i < a.size(); i++) {
        for (int y = 0; y < a[i].size(); y++) {
            cout << a[i][y] << " ";
        }
        cout << endl;
    }
}

// Hàm greedy phân công việc tối ưu gần đúng
void greedyAssignment(const vector<vector<int>>& a) {
    // Tạo biến chứa kích thước của mảng gốc 
    int m = a.size();
    int j = a[0].size(); // j: số việc

    // Tạo mảng mới để lưu dữ liệu khi xét 
    vector<int> total_time(m, 0);        // Tổng thời gian mỗi máy
    vector<int> assign(j, -1);     // Máy nhận từng việc

    // Thuật toán 
    for (int job = 0; job < j; job++) { // Với mỗi công việc 
        int best_machine = -1; // biến để chứa máy làm tốt nhất 
        int min_finish_time = numeric_limits<int>::max(); // ngưỡng SS

        for (int machine = 0; machine < m; machine++) { // Giao cho mỗi máy 
            int finish_time = total_time[machine] + a[machine][job]; // tính tgian hoàn thành
            if (finish_time < min_finish_time) { // SS: nếu nhỏ hơn ngưỡng 
                min_finish_time = finish_time; // -> thành min mới cho cv đó 
                best_machine = machine; // update máy làm tốt nhất cho cv đó 
            }
        }

        assign[job] = best_machine; // update mảng 'máy nhận việc'
        total_time[best_machine] += a[best_machine][job]; // update mảng 'tổng thời gian của máy đó'
    }

    // In kết quả
    cout << "\n== Greedy Assignment Result ==\n";
    for (int machine = 0; machine < m; machine++) { // Với mỗi máy 
        cout << "Machine " << machine + 1 << ": ";
        for (int job = 0; job < j; job++) { // Với cv,
            if (assign[job] == machine) cout << job + 1 << " "; // nếu job đó là máy đó thực hiện, xuất ra
        }
        cout << "(Total: " << total_time[machine] << ")\n"; // Xuất ra tổng số tgian máy đó hoàn thành các cv đc giao
    }
    int max_time = *max_element(total_time.begin(), total_time.end()); // SS các tổng thời gian của mỗi máy 
    cout << "\nMinimum time to complete all jobs (Greedy): " << max_time << endl; // Xuất ra giá trị thấp nhất
}

// ==== Backtracking: tối ưu tuyệt đối ====
int min_time = numeric_limits<int>::max();
vector<int> best_assign;

void backtrack(const vector<vector<int>>& a, vector<int>& load, vector<int>& assign, int job) {
    int m = a.size();
    int j = a[0].size();
    if (job == j) {
        int cur_time = *max_element(load.begin(), load.end());
        if (cur_time < min_time) {
            min_time = cur_time;
            best_assign = assign;
        }
        return;
    }
    for (int machine = 0; machine < m; machine++) {
        load[machine] += a[machine][job];
        assign[job] = machine;
        // Nhánh cắt: không xét nếu đã lớn hơn min_time hiện tại
        if (*max_element(load.begin(), load.end()) < min_time)
            backtrack(a, load, assign, job + 1);
        load[machine] -= a[machine][job];
        assign[job] = -1;
    }
}

void optimalAssignment(const vector<vector<int>>& a) {
    int m = a.size();
    int j = a[0].size();
    min_time = numeric_limits<int>::max();
    best_assign = vector<int>(j, -1);
    vector<int> load(m, 0), assign(j, -1);

    backtrack(a, load, assign, 0);

    // In kết quả tối ưu
    cout << "\n== Optimal Assignment Result (min makespan) ==\n";
    for (int machine = 0; machine < m; machine++) {
        cout << "Machine " << machine + 1 << ": ";
        for (int job = 0; job < j; job++)
            if (best_assign[job] == machine) cout << job + 1 << " ";
        cout << endl;
    }
    cout << "Minimum time to complete all jobs (Optimal): " << min_time << endl;
}

// ===== MAIN =====
int main() {
    vector<vector<int>> a = inputTable();
    printTable(a);
    greedyAssignment(a);

    // Hỏi người dùng có chạy backtracking không (nên dùng với số việc <= 10)
    char runOpt;
    cout << "\nDo you want to run the optimal algorithm (may be slow if jobs > 10)? (y/n): ";
    cin >> runOpt;
    if (runOpt == 'y' || runOpt == 'Y') {
        optimalAssignment(a);
    }
    return 0;
}
