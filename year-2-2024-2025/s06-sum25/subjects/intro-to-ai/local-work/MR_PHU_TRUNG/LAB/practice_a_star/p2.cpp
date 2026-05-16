#include <iostream> 
#include <vector> 
#include <queue> 
#include <limits>
#include <algorithm>
using namespace std;
#define ll long long
#define endl "\n"
const ll INF = numeric_limits<ll>::max(); 

vector <ll> hx{
    223, 222, 166, 192, 165, 136, 
    122, 111, 100, 60, 32, 102, 0
};
vector <char> city_name{
    'A', 'B', 'C', 'D', 'E', 'F', 
    'G', 'H', 'I', 'J', 'K', 'L', 'M'    
};

vector <ll> as (ll n, ll m, ll start, ll goal, const vector<vector<pair<ll, ll>>> &adj, vector<ll> &parent){
    vector<ll> gx(n, INF);
    parent.assign(n, -1);

    priority_queue < pair<ll, ll>, vector<pair<ll, ll>>, greater<> > pq;

    gx[start] = 0;                                  
    pq.push({gx[start] + hx[start], start});

    while (!pq.empty()) {
        ll f = pq.top().first; 
        ll u = pq.top().second;
        pq.pop();

        if (u == goal) {
            cout << "Found goal: " << city_name[u] << endl;
            break;
        }

        cout << "Visiting: " << city_name[u] << " with f = " << f << endl;

        for (auto edge : adj[u]) {
            ll v = edge.first;
            ll w = edge.second;
            ll tmp_g = gx[u] + w;

            if (tmp_g < gx[v]) {
                gx[v] = tmp_g;
                parent[v] = u;
                pq.push({gx[v] + hx[v], v});
                cout << "  => Update: g[" << city_name[v] << "] = " << gx[v] << ", parent[" << city_name[v] << "] = " << city_name[u] << endl;
            } else {
                cout << "  => No update for: " << city_name[v] << endl;
            }
        }
    }
    return gx; 
}


int main(){ 
    ll n, m; cin >> n >> m;
    vector< vector<pair<ll, ll>> > adj(n);
    vector <ll> parent;

    for (ll i = 0; i < m; i++){
        ll u, v, w; cin >> u >> v >> w; 
        adj[u].push_back({v, w});
        adj[v].push_back({u, w});
    }

    char start, goal; cin >> start >> goal;
    ll str_idx = find(city_name.begin(), city_name.end(), start) - city_name.begin();
    ll goal_idx = find(city_name.begin(), city_name.end(), goal) - city_name.begin();
    
    vector <ll> res = as(n, m, str_idx, goal_idx, adj, parent);

    if (res[goal_idx] == numeric_limits<ll>::max()) {
        cout << "No optimal path is found";
    } else {
        cout << "The shortes path from " << start << " to " << goal << ": " << res[goal_idx] << endl;
        vector<ll> path;
        for (ll v = goal_idx; v != -1; v = parent[v])
            path.push_back(v);
        reverse(path.begin(), path.end());
        cout << "Path: "; cout << city_name[path[0]];
        for (size_t i = 1; i < path.size(); ++i) {
            cout << "-> " << city_name[path[i]];
        }
    }

    return 0; 
}