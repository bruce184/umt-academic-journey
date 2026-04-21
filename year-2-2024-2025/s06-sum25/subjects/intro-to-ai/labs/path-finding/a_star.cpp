#include <iostream> 
#include <queue>
#include <vector> 
#include <limits> 
#include <algorithm>
using namespace std; 
#define ll long long 
#define endl "\n"
const ll INF = numeric_limits<ll>::max(); 

// Danh sánh "khoảng cách chim bay" của mỗi thành phố 
vector<ll> heuristic = {
    366,    // 0: Arad
    0,      // 1: Bucharest
    160,    // 2: Craiova
    242,    // 3: Dobreta
    161,    // 4: Eforie
    176,    // 5: Fagaras
    77,     // 6: Giurgiu
    151,    // 7: Hirsova
    226,    // 8: Iasi
    244,    // 9: Lugoj
    241,    // 10: Mehadia
    234,    // 11: Neamt
    380,    // 12: Oradea
    100,    // 13: Pitesti
    193,    // 14: Rimnicu Vilcea
    253,    // 15: Sibiu
    329,    // 16: Timisoara
    80,     // 17: Urziceni
    199,    // 18: Vaslui
    374     // 19: Zerind
};

// Cho output rõ ràng hơn 
vector<string> city_names = {
    "Arad", "Bucharest", "Craiova", "Dobreta", "Eforie",
    "Fagaras", "Giurgiu", "Hirsova", "Iasi", "Lugoj",
    "Mehadia", "Neamt", "Oradea", "Pitesti", "Rimnicu Vilcea",
    "Sibiu", "Timisoara", "Urziceni", "Vaslui", "Zerind"
};

// Thuật toán chính 
vector<ll> a_star(ll n, const vector<vector<pair<ll,ll>>> &adj, ll start, vector<ll>& parent) {
    vector<ll> g(n, INF); // lưu giữ min-cost từ start đến từng i-th đỉnh, ban đầu tất cả là INF
    parent.assign(n, -1); // để reconstruct path 

    /* Syntax cố định của priority queue, min-heap 
        <Type>      pair (tổng cost, số đỉnh): kiểu dữ liệu lưu trữ
        <Container> vector....: container để lưu giá trị trong queue này 
        <Compare>   greater...: để lấy min_heap(GTNN) thay (mặc định) max_heap(GTLN)
    */ 
    priority_queue< pair<ll,ll>, vector<pair<ll,ll>>, greater<>> pq;

    g[start] = 0;                                  // chi phí -> start = 0
    pq.push({g[start] + heuristic[start], start}); // tính cho starting node: f(x) = g(x) + h(x)

    while (!pq.empty()) {
        ll f = pq.top().first; // lấy phần tử thứ nhất của thằng đầu tiên 
        ll u = pq.top().second;
        pq.pop();
        
        cout << "\n[POP] u = " << u << " (" << city_names[u] << ")" << ", f = " << f << ", g[u] = " << g[u] << ", heuristic[u] = " << heuristic[u] << endl;
        if (f - heuristic[u] > g[u]) {
            cout << "  Move on because f - heuristic[u] = " << (f - heuristic[u]) << " > g[u] = " << g[u] << endl;
            continue;
        }

        // duyệt các đỉnh + cạnh kề
        for (auto pr : adj[u]) {
            ll v = pr.first;        // vertex
            ll w = pr.second;       // weight
            ll tmp_g = g[u] + w;    // tính phí tạm thời từ start đến v (với u)

            cout << "    Consider (" << u << ", " << v << ") with weight = " << w << ", tmp_g = " << tmp_g << ", g[v] = " << g[v];
            if (tmp_g < g[v]) {
                cout << "  =>  Update g[v] & parent[v]" << endl;
                g[v] = tmp_g;
                parent[v] = u;
                cout << "      g[" << v << "] = " << g[v] << ", parent[" << v << "] = " << u << endl;
                pq.push({g[v] + heuristic[v], v});
                cout << "      Input to queue: v = " << v << " (" << city_names[v] << ") with f = " << (g[v] + heuristic[v]) << endl;
            } else {
                cout << "  =>  No update" << endl;
            }
        }
    }
    return g; 
}


int main() {
    // Lưu trữ 
    /* Danh sách kề của đồ thị có n đỉnh: 
        'vector' ngoài cùng: tổng quan đồ thị
        'vector' trong     : ds các cạnh đi từ đỉnh u 
        'pair <ll, ll>'    : lưu giá trị <số đỉnh> v và <trọng số> w 
    */  
    ll n, m; cin >> n >> m;
    vector< vector<pair<ll, ll>> > adj(n);

    // Nhập dữ liệu (undirected graph) 
    for (ll i = 0; i < m; i++){
        // đỉnh u, đỉnh v (kề)
        ll u, v, w; 
        cin >> u >> v >> w; 
        adj[u].push_back({v, w});
        adj[v].push_back({u, w});
    }

    ll start, goal;
    cout << "Input start (0-19): "; cin >> start;
    cout << "Input goal (0-19): "; cin >> goal;
    cout << endl;

    vector<ll> parent;
    vector<ll> res = a_star(n, adj, start, parent);

    if (res[goal] == numeric_limits<ll>::max()) {
        cout << "No optimal path is found";
    } else {
        cout << "The shortes path from " << start << " to " << goal << ": " << res[goal] << endl;
        
        // dường đi 
        vector<ll> path;
        for (ll v = goal; v != -1; v = parent[v])
            path.push_back(v);
        reverse(path.begin(), path.end());
        cout << "Path: ";
        for (ll v : path) cout << "-> " << city_names[v];
        cout << endl;
    }

    return 0; 
}