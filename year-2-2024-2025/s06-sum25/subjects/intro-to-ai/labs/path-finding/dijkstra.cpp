#include <iostream>
#include <vector>
#include <queue>
#include <limits>
#include <algorithm>
#include <map> // mapping char labels to indices
using namespace std;

const int INF = numeric_limits<int>::max();

// Use int for indices instead of char
pair<vector<int>, vector<int>> dijkstra(int n, const vector<vector<pair<int,int>>> &adj, int start) {
    vector<int> dist(n, INF); 
    vector<int> parent(n, -1);

    priority_queue< pair<int,int>, vector<pair<int,int>>, greater<pair<int,int> >> pq;

    dist[start] = 0;
    pq.push(make_pair(0, start));

    while (!pq.empty()) {
        pair<int, int> top = pq.top();
        pq.pop();
        int d = top.first;
        int u = top.second;

        if (d > dist[u]) continue;

        for (size_t i = 0; i < adj[u].size(); ++i) {
            int v = adj[u][i].first;
            int w = adj[u][i].second;
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                parent[v] = u;
                pq.push(make_pair(dist[v], v));
            }
        }
    }

    return make_pair(dist, parent);
}

// Use int for indices instead of char
vector<int> recover_path(int goal, const vector<int> &parent) {
    vector<int> path;
    // Đi ngược lại 
    for (int cur = goal; cur != -1; cur = parent[cur]) {
        path.push_back(cur);
    }
    // Lật ngược để đúng 'normal sense'
    reverse(path.begin(), path.end());
    return path;
}

int main() {
    int n, m;
    cout<<"Enter number of nodes and edges: ";
    cin >> n >> m;

    map<char, int> label_to_idx; // map char label to index
    vector<char> idx_to_label(n); // map index to char label

    cout << "Enter node labels: ";
    for (int i = 0; i < n; ++i) {
        char label;
        cin >> label;

        label_to_idx[label] = i;
        idx_to_label[i] = label;
    }

    vector<vector<pair<int,int>>> adj(n); // use int for node indices
    cout << "Enter edges (u v w):\n";
    for (int i = 0; i < m; i++) {
        char u_label, v_label;
        int w;
        cin >> u_label >> v_label >> w;

        int u = label_to_idx[u_label];
        int v = label_to_idx[v_label];
        adj[u].push_back(make_pair(v, w)); // directed
    }

    char start_label;
    cout << "Enter start node: "; cin >> start_label;
    int start = label_to_idx[start_label];

    pair<vector<int>, vector<int>> result = dijkstra(n, adj, start);
    vector<int> dist = result.first;
    vector<int> parent = result.second;

    cout << "Shortest distances from node " << start_label << ":\n";
    for (int v = 0; v < n; v++) {
        if (dist[v] == INF) {
            cout << "  to node " << idx_to_label[v] << " = unreachable\n";
        } else {
            cout << "  to node " << idx_to_label[v] << " = " << dist[v] << "\n";
        }
    }

    // char goal_label;
    // cout << "Enter goal node: ";
    // cin >> goal_label;
    // int goal = label_to_idx[goal_label];
    // vector<int> path = recover_path(goal, parent);

    // cout << "Path to node " << goal_label << ":";
    // for (size_t i = 0; i < path.size(); ++i) {
    //     cout << " " << idx_to_label[path[i]];
    // }
    // cout << "\n";

    return 0;
}
