#include <iostream> 
#include <vector> 
#include <queue> 
using namespace std; 
#define ll long long
#define endl "\n"
const ll INF = numeric_limits<ll>::max(); 

// Danh sách khoảng cách chim bay của các đỉnh, trừ đỉnh J 
vector<ll> h{
    10, 
    8, 
    5, 
    7, 
    3, 
    6, 
    5, 
    3, 
    1, 
    0
};

vector<char> node_name{
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J'
};

vector <ll> as (ll n, ll start, const vector<vector<pair<ll,ll>>> &adj, vector<ll> parent){
    // Declare 
    vector<ll> g(n, INF);
    ll goal = n - 1; 
    parent.assign(n, -1);

    // Priority queue - MUST HAVE 
    priority_queue < pair<ll, ll>, vector<pair<ll, ll>>, greater<>> pq; 

    // Identify the starting node 
    g[start] = 0; 
    pq.push( {g[start] + h[start], start} );     // Push into pq to comparison - CRUCIAL, MUST HAVE  

    while (!pq.empty()){ 
        ll f = pq.top().first; 
        ll u = pq.top().second;
        pq.pop(); // Remove to compare 

        // Compare - if smaller, update or else move in 
        if (f - h[u] > g[u]) continue;

        if (u == goal) break; // THE DIFERENCE 

        for (auto cur : adj[u]){
            ll v = cur.first;
            ll w = cur.second; 
            ll tmp_g = g[u] + w; // calc the current f(x) 

            // Compare to the previous g(x) value of the adjacent node 
            if (tmp_g < g[v]){
                g[v] = tmp_g; 
                parent[v] = u;
                pq.push({g[v] + h[v], v});
            }
        }
    }
    return g; 
}

int main(){
    ll n, m, start, goal;
    vector<ll> parent;
    vector<vector<pair<ll,ll>>> adj;
    for (ll i = 0; i < m; i++){
        ll u, v, w; 
        cin >> u >> v >> w; 
        adj[u].push_back({v, w});
        adj[v].push_back({u, w});
    }

    cout << "Input start (0-19): "; cin >> start;
    cout << endl;
    vector<ll> res = as (n, start, adj, parent);

    ll goal = n - 1;
    if (res[goal] == INF) {
        cout << "No optimal path to goal " << goal << "\n";
    } else {
        cout << "The lowest cost to go from " << start << " to " << goal << ": " 
             << res[goal] << "\n";
        // Recover path
        vector<int> path;
        for (int u = goal; u != -1; u = parent[u])
            path.push_back(u);
        reverse(path.begin(), path.end());
        
        cout << "Path:";
        for (int u : path) cout << " " << u;
        cout << "\n";
    }

    return 0; 
}