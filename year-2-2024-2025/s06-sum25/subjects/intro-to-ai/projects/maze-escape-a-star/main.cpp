#include <iostream>
#include <vector>
#include <queue>
#include <cmath>
#include <algorithm>
#include <random>
#include <chrono>
#include <limits>
using namespace std;
using namespace std::chrono;

using ll = long long;
const ll INF = numeric_limits<ll>::max() / 2;
static mt19937 rng(random_device{}());

ll manhattan(ll u, ll goal, ll N) {
    ll ux = u / N, uy = u % N;
    ll gx = goal / N, gy = goal % N;
    return abs(ux - gx) + abs(uy - gy);
}

ll euclidean(ll u, ll goal, ll N) {
    ll ux = u / N, uy = u % N;
    ll gx = goal / N, gy = goal % N;
    double dx = double(ux - gx);
    double dy = double(uy - gy);
    return static_cast<ll>(sqrt(dx*dx + dy*dy));
}

vector<ll> astar(ll n, ll start, const vector<vector<pair<ll,ll>>>& adj, vector<ll>& parent, ll N, bool useEuclid) {
    vector<ll> g(n, INF);
    ll goal = n - 1;
    parent.assign(n, -1);

    priority_queue<
        pair<ll,ll>,
        vector<pair<ll,ll>>,
        greater<pair<ll,ll>>
    > pq;

    ll h0 = useEuclid
        ? euclidean(start, goal, N)
        : manhattan(start, goal, N);
    g[start] = 0;
    pq.push({h0, start});

    while (!pq.empty()) {
        // *** FIX: no structured bindings ***
        pair<ll,ll> top = pq.top();
        pq.pop();
        ll f = top.first;
        ll u = top.second;

        ll hu = useEuclid
            ? euclidean(u, goal, N)
            : manhattan(u, goal, N);
        if (f - hu > g[u]) continue;
        if (u == goal) break;

        for (size_t i = 0; i < adj[u].size(); ++i) {
            ll v = adj[u][i].first;
            ll w = adj[u][i].second;
            ll ng = g[u] + w;
            if (ng < g[v]) {
                g[v] = ng;
                parent[v] = u;
                ll hv = useEuclid
                    ? euclidean(v, goal, N)
                    : manhattan(v, goal, N);
                pq.push({ng + hv, v});
            }
        }
    }
    return g;
}

int dx[4] = { -1, 1, 0, 0 };
int dy[4] = {  0, 0, -1, 1 };

bool isValid(int x, int y, int N) {
    return x >= 0 && y >= 0 && x < N && y < N;
}

int nodeID(int x, int y, int N) {
    return x * N + y;
}

void buildMazeDFS(int x, int y, int N, vector<vector<char>>& maze, vector<vector<bool>>& visited) {
    visited[x][y] = true;
    maze[x][y] = '.';

    vector<int> dir = {0,1,2,3};
    shuffle(dir.begin(), dir.end(), rng);

    for (int d : dir) {
        int nx = x + dx[d]*2;
        int ny = y + dy[d]*2;
        if (isValid(nx, ny, N) && !visited[nx][ny]) {
            maze[x + dx[d]][y + dy[d]] = '.';
            buildMazeDFS(nx, ny, N, maze, visited);
        }
    }
}

void addRandomLoops(vector<vector<char>>& maze, int N, int extraPassages) {
    uniform_int_distribution<int> cellDist(0, N-1);
    uniform_int_distribution<int> dirDist(0, 3);

    for (int k = 0; k < extraPassages; ++k) {
        int i = cellDist(rng);
        int j = cellDist(rng);
        int d = dirDist(rng);
        int ni = i + dx[d], nj = j + dy[d];

        if (isValid(i, j, N) && isValid(ni, nj, N) && maze[i][j] == '#' && maze[ni][nj] == '#'){
            maze[i][j]   = '.';
            maze[ni][nj] = '.';
            int mi = (i + ni) / 2;
            int mj = (j + nj) / 2;
            maze[mi][mj] = '.';
        }
    }
}

void printMaze(const vector<vector<char>>& maze) {
    int rows = (int)maze.size();
    int cols = rows ? (int)maze[0].size() : 0;
    for (int i = 0; i < rows; ++i) {
        for (int j = 0; j < cols; ++j) {
            cout << maze[i][j] << ' ';
        }
        cout << '\n';
    }
    cout << endl;
}

vector<ll> reconstructPath(const vector<ll>& parent, ll start, ll goal) {
    vector<ll> path;
    for (ll cur = goal; cur != -1; cur = parent[cur]) path.push_back(cur);
    reverse(path.begin(), path.end());
    return path;
}

int main() {
    int N;
    cout << "Enter maze size N (>= 3): "; cin >> N;
    if (N < 3) {
        cout << "Invalid size.\n";
        return 0;
    }

    vector<vector<char>> maze(N, vector<char>(N, '#'));
    vector<vector<bool>> visited(N, vector<bool>(N, false));
    buildMazeDFS(1, 1, N, maze, visited);

    addRandomLoops(maze, N, (N*N)/10);

    maze[0][1]     = '.';
    maze[N-1][N-2] = '.';

    cout << "\nGenerated Maze:\n";
    printMaze(maze);

    int total = N * N;
    vector<vector<pair<ll,ll>>> adj(total);
    for (int i = 0; i < N; ++i) {
        for (int j = 0; j < N; ++j) {
            if (maze[i][j] == '.') {
                int u = nodeID(i, j, N);
                for (int d = 0; d < 4; ++d) {
                    int ni = i + dx[d], nj = j + dy[d];
                    if (isValid(ni, nj, N) && maze[ni][nj] == '.') {
                        adj[u].push_back({ nodeID(ni, nj, N), 1 });
                    }
                }
            }
        }
    }

    ll start = nodeID(0, 1, N);
    ll goal  = nodeID(N-1, N-2, N);
    vector<ll> parent;

    cout << "\nChoose heuristic:\n"
         << " 1) Manhattan\n"
         << " 2) Euclidean\n"
         << " 3) Compare both\n"
         << "Enter choice: ";
    int choice; cin >> choice;

    // Option 3
    if (choice == 3) {
        const int TRIALS = 1000;
        long long sumM=0, sumE=0;
        vector<ll> parentM;

        // average Manhattan
        for(int i=0;i<TRIALS;++i){
            auto t0 = chrono::high_resolution_clock::now();
            auto dM = astar(total,start,adj,parentM,N,false);
            auto t1 = chrono::high_resolution_clock::now();
            sumM += chrono::duration_cast<chrono::nanoseconds>(t1-t0).count();
        }
        // average Euclid
        for(int i=0;i<TRIALS;++i){
            auto t2 = chrono::high_resolution_clock::now();
            auto dE = astar(total,start,adj,parent,N,true);
            auto t3 = chrono::high_resolution_clock::now();
            sumE += chrono::duration_cast<chrono::nanoseconds>(t3-t2).count();
        }

        ll avgM = sumM / TRIALS;
        ll avgE = sumE / TRIALS;
        // run one final Manhattan to get parentM & dist
        auto distM = astar(total,start,adj,parentM,N,false);

        cout<<"\n--- Heuristic Comparison (avg over "<<TRIALS<<" runs) ---\n"
            <<"Manhattan: len="<<distM[goal]
            <<", avg time="<<avgM<<" ns\n"
            <<"Euclidean: len="<<distM[goal]
            <<", avg time="<<avgE<<" ns\n\n";

        auto path = reconstructPath(parentM,start,goal);
        auto mazeCopy = maze;
        for(ll id:path){
            mazeCopy[id/N][id%N] = '*';
        }
        cout<<"Optimal path (same for both):\n";
        printMaze(mazeCopy);
        return 0;
    }
    

    // Option 1 or 2
    bool useEuclid = (choice == 2); // *choose heuristics 
    auto ts = chrono::high_resolution_clock::now();
    vector<ll> dist = astar(total, start, adj, parent, N, useEuclid);
    auto te = chrono::high_resolution_clock::now();
    ll elapsed = chrono::duration_cast<chrono::nanoseconds>(te - ts).count();

    if (dist[goal] == INF) {
        cout << "\nNo path found.\n";
        return 0;
    }

    cout << "\nHeuristic used: "
         << (useEuclid ? "Euclidean" : "Manhattan") << "\n"
         << "Path length = " << dist[goal] << "\n"
         << "Time = " << elapsed << " ns\n";

    vector<ll> path = reconstructPath(parent, start, goal);
    for (ll id : path) {
        int x = int(id / N), y = int(id % N);
        maze[x][y] = '*';
    }

    cout << "\nPath in maze:\n"; printMaze(maze);

    return 0;
}