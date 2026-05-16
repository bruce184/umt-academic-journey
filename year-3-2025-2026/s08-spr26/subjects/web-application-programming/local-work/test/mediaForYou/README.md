# Homework 09 - React Router + Admin Realtime Dashboard

Project nĂ y lĂ  báº£n nĂ¢ng cáº¥p tá»« ná»n tuáº§n 8, vá»›i 2 má»¥c tiĂªu chĂ­nh:

- Chuyá»ƒn frontend tá»« kiá»ƒu Ä‘iá»u hÆ°á»›ng báº±ng `useState` sang SPA tháº­t báº±ng `react-router-dom`
- ThĂªm trang admin cĂ³ thá»ƒ theo dĂµi danh sĂ¡ch user theo 3 cÆ¡ cháº¿ realtime:
  - Polling
  - Long-polling
  - Server-Sent Events (SSE)

README nĂ y giáº£i thĂ­ch:

- BĂ i toĂ¡n tuáº§n 9 Ä‘ang lĂ m gĂ¬
- LĂ½ thuyáº¿t Ä‘áº±ng sau tá»«ng pháº§n
- Code hiá»‡n táº¡i Ä‘Ă£ implement nhÆ° tháº¿ nĂ o
- CĂ¡ch cháº¡y tá»« Ä‘áº§u vĂ  cĂ¡ch tá»± test

## 1. Má»¥c tiĂªu cá»§a bĂ i

So vá»›i tuáº§n 8, tuáº§n 9 cáº§n bá»• sung:

- Má»™t tĂ i khoáº£n admin cá»‘ Ä‘á»‹nh: `admin@example.com`
- Admin Ä‘Æ°á»£c xem danh sĂ¡ch toĂ n bá»™ user
- Frontend dĂ¹ng router tháº­t thay vĂ¬ Ä‘á»•i mĂ n hĂ¬nh báº±ng state
- CĂ³ 3 cĂ¡ch cáº­p nháº­t danh sĂ¡ch user theo thá»i gian thá»±c

Ă tÆ°á»Ÿng nghiá»‡p vá»¥ lĂ :

1. Admin má»Ÿ trang dashboard
2. Khi cĂ³ ngÆ°á»i dĂ¹ng má»›i Ä‘Äƒng kĂ½
3. Danh sĂ¡ch user bĂªn admin tá»± cáº­p nháº­t

## 2. Kiáº¿n trĂºc tá»•ng quan

### Backend

- Express API
- PostgreSQL
- Knex cho migration/seed
- JWT access token + refresh token
- Docker Ä‘á»ƒ cháº¡y `api` vĂ  `db`

### Frontend

- React + Vite
- `react-router-dom` Ä‘á»ƒ táº¡o SPA
- Auth context Ä‘á»ƒ giá»¯ tráº¡ng thĂ¡i Ä‘Äƒng nháº­p
- 3 trang admin tĂ¡ch riĂªng cho 3 cÆ¡ cháº¿ realtime

## 3. LĂ½ thuyáº¿t cáº§n hiá»ƒu

### 3.1 React Router lĂ  gĂ¬

TrÆ°á»›c tuáº§n 9, app chuyá»ƒn mĂ n hĂ¬nh báº±ng cĂ¡ch lÆ°u má»™t state nhÆ°:

- `home`
- `login`
- `register`
- `profile`

CĂ¡ch Ä‘Ă³ cháº¡y Ä‘Æ°á»£c nhÆ°ng chÆ°a pháº£i SPA routing tháº­t, vĂ¬:

- URL khĂ´ng Ä‘á»•i Ä‘Ăºng theo mĂ n hĂ¬nh
- KhĂ´ng thá»ƒ refresh á»Ÿ má»™t trang cá»¥ thá»ƒ rá»“i á»Ÿ láº¡i Ä‘Ăºng trang Ä‘Ă³
- KhĂ´ng share link trá»±c tiáº¿p tá»›i má»™t mĂ n hĂ¬nh cá»¥ thá»ƒ
- KhĂ´ng táº­n dá»¥ng Ä‘Æ°á»£c `Navigate`, route guard, redirect

Khi dĂ¹ng React Router:

- `/` lĂ  trang home
- `/login` lĂ  trang login
- `/register` lĂ  trang register
- `/profile` lĂ  trang profile
- `/tasks` lĂ  trang tasks
- `/admin-p`, `/admin-lp`, `/admin-sse` lĂ  3 trang admin

Nhá» Ä‘Ă³ app hoáº¡t Ä‘á»™ng giá»‘ng má»™t SPA chuáº©n hÆ¡n.

### 3.2 Polling lĂ  gĂ¬

Polling lĂ  cĂ¡ch Ä‘Æ¡n giáº£n nháº¥t Ä‘á»ƒ â€œgiáº£ realtimeâ€.

Frontend cá»© má»—i vĂ i giĂ¢y láº¡i gá»i API:

```text
GET /api/users
```

Æ¯u Ä‘iá»ƒm:

- Dá»… code
- Dá»… debug

NhÆ°á»£c Ä‘iá»ƒm:

- Tá»‘n request dĂ¹ khĂ´ng cĂ³ dá»¯ liá»‡u má»›i
- CĂ³ Ä‘á»™ trá»…, vĂ¬ pháº£i chá» tá»›i láº§n poll káº¿ tiáº¿p

### 3.3 Long-polling lĂ  gĂ¬

Long-polling cáº£i tiáº¿n tá»« polling.

Frontend gá»­i request lĂªn server:

```text
GET /api/users/poll?version=...
```

Náº¿u server chÆ°a cĂ³ dá»¯ liá»‡u má»›i:

- Server khĂ´ng tráº£ ngay
- Giá»¯ request má»Ÿ

Khi cĂ³ user má»›i Ä‘Äƒng kĂ½:

- Server tráº£ dá»¯ liá»‡u má»›i vá»
- Frontend nháº­n xong sáº½ gá»­i request long-polling tiáº¿p theo

Æ¯u Ä‘iá»ƒm:

- Ăt request rĂ¡c hÆ¡n polling
- Pháº£n há»“i gáº§n realtime hÆ¡n

NhÆ°á»£c Ä‘iá»ƒm:

- Phá»©c táº¡p hÆ¡n polling
- Server pháº£i giá»¯ cĂ¡c request Ä‘ang chá»

### 3.4 SSE lĂ  gĂ¬

SSE = Server-Sent Events.

Frontend má»Ÿ má»™t káº¿t ná»‘i má»™t chiá»u tá»›i server báº±ng `EventSource`:

```text
GET /api/users/sse
```

Sau Ä‘Ă³ khi cĂ³ sá»± kiá»‡n má»›i, server chá»§ Ä‘á»™ng push message xuá»‘ng client:

```text
data: {"message":"New user signed up: ..."}
```

Æ¯u Ä‘iá»ƒm:

- PhĂ¹ há»£p cho luá»“ng server -> client
- Realtime tá»± nhiĂªn hÆ¡n polling
- Nháº¹ hÆ¡n WebSocket náº¿u chá»‰ cáº§n push má»™t chiá»u

NhÆ°á»£c Ä‘iá»ƒm:

- Chá»‰ lĂ  má»™t chiá»u server -> client
- KhĂ´ng pháº£i bĂ i nĂ o cÅ©ng cáº§n

### 3.5 VĂ¬ sao bĂ i nĂ y cáº§n version cho long-polling

Frontend cáº§n biáº¿t dá»¯ liá»‡u Ä‘ang cĂ³ lĂ  phiĂªn báº£n nĂ o.

Server giá»¯ má»™t biáº¿n `version`.

- Má»—i láº§n cĂ³ user má»›i Ä‘Äƒng kĂ½ thĂ¬ `version` tÄƒng lĂªn
- Client gá»­i `version` hiá»‡n táº¡i cá»§a mĂ¬nh lĂªn server
- Náº¿u server tháº¥y client Ä‘ang cÅ© hÆ¡n, server tráº£ danh sĂ¡ch user má»›i ngay
- Náº¿u client Ä‘Ă£ má»›i rá»“i, server giá»¯ request chá»

ÄĂ¢y lĂ  cĂ¡ch ráº¥t phá»• biáº¿n Ä‘á»ƒ trĂ¡nh gá»­i láº¡i dá»¯ liá»‡u khĂ´ng cáº§n thiáº¿t.

## 4. Project nĂ y Ä‘Ă£ implement gĂ¬

## 4.1 Frontend router

Frontend Ä‘Ă£ chuyá»ƒn sang React Router á»Ÿ:

- [frontend/src/App.jsx](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/frontend/src/App.jsx)

CĂ¡c route chĂ­nh:

- `/`
- `/login`
- `/register`
- `/profile`
- `/tasks`
- `/admin-p`
- `/admin-lp`
- `/admin-sse`

Navbar Ä‘Ă£ Ä‘Æ°á»£c cáº­p nháº­t Ä‘á»ƒ Ä‘iá»u hÆ°á»›ng báº±ng `NavLink`:

- [frontend/src/components/layout/Navbar.jsx](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/frontend/src/components/layout/Navbar.jsx)

## 4.2 Route guard cho user vĂ  admin

Hai lá»›p báº£o vá»‡ Ä‘Ă£ cĂ³:

- User pháº£i Ä‘Äƒng nháº­p má»›i vĂ o Ä‘Æ°á»£c trang protected
- Chá»‰ admin má»›i vĂ o Ä‘Æ°á»£c cĂ¡c trang admin

Náº±m á»Ÿ:

- [frontend/src/pages/auth/ProtectedPage.jsx](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/frontend/src/pages/auth/ProtectedPage.jsx)

PhĂ­a backend, middleware kiá»ƒm tra auth vĂ  quyá»n admin náº±m á»Ÿ:

- [backend/src/middlewares/auth-mw.js](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/backend/src/middlewares/auth-mw.js)

Logic admin hiá»‡n lĂ :

- Náº¿u `req.user.email !== "admin@example.com"` thĂ¬ tráº£ `403`

## 4.3 Seed tĂ i khoáº£n admin

Admin Ä‘Æ°á»£c táº¡o báº±ng seed:

- [backend/db/seeds/002_add_admin.js](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/backend/db/seeds/002_add_admin.js)

TĂ i khoáº£n:

- Email: `admin@example.com`
- Password: `demo-password`

User demo cÅ© váº«n cĂ²n:

- Email: `bruce@example.com`
- Password: `demo-password`

## 4.4 API láº¥y danh sĂ¡ch user cho admin

Backend Ä‘Ă£ thĂªm route:

- `GET /api/users`

Náº±m á»Ÿ:

- [backend/src/routes/user-r.js](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/backend/src/routes/user-r.js)
- [backend/src/controllers/user-c.js](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/backend/src/controllers/user-c.js)
- [backend/src/services/user-s.js](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/backend/src/services/user-s.js)
- [backend/src/repositories/users-r.js](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/backend/src/repositories/users-r.js)

Luá»“ng xá»­ lĂ½:

1. Router nháº­n request
2. `protect` kiá»ƒm tra JWT
3. `protectAdmin` kiá»ƒm tra email admin
4. Controller gá»i service
5. Service gá»i repository Ä‘á»ƒ láº¥y toĂ n bá»™ user tá»« DB

## 4.5 Polling page

Trang polling náº±m á»Ÿ:

- [frontend/src/pages/auth/AdminPollingPage.jsx](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/frontend/src/pages/auth/AdminPollingPage.jsx)

Ă tÆ°á»Ÿng code:

- Khi trang má»Ÿ lĂªn, frontend gá»i `userApi.getAllUsers()`
- Sau Ä‘Ă³ `setInterval(..., 5000)` Ä‘á»ƒ gá»i láº¡i má»—i 5 giĂ¢y

API helper náº±m á»Ÿ:

- [frontend/src/auth/api.js](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/frontend/src/auth/api.js)

## 4.6 Long-polling page

Trang long-polling náº±m á»Ÿ:

- [frontend/src/pages/auth/AdminLongPollingPage.jsx](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/frontend/src/pages/auth/AdminLongPollingPage.jsx)

Backend long-polling náº±m á»Ÿ:

- [backend/src/services/user-s.js](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/backend/src/services/user-s.js)
- [backend/src/controllers/user-c.js](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/backend/src/controllers/user-c.js)

CĂ¡c thĂ nh pháº§n chĂ­nh:

- `version`
- `pendingRequests`
- `addPendingRequest(res)`
- `removePendingRequest(requestId)`
- `flushPendingRequests()`

Luá»“ng hoáº¡t Ä‘á»™ng:

1. Admin má»Ÿ trang long-polling
2. Frontend gá»­i `/api/users/poll?version=currentVersion`
3. Náº¿u server cĂ³ dá»¯ liá»‡u má»›i hÆ¡n thĂ¬ tráº£ luĂ´n
4. Náº¿u chÆ°a cĂ³ thĂ¬ giá»¯ request láº¡i trong `pendingRequests`
5. Khi cĂ³ user má»›i signup, backend gá»i `flushPendingRequests()`
6. ToĂ n bá»™ client Ä‘ang chá» sáº½ nháº­n dá»¯ liá»‡u má»›i

## 4.7 SSE page

Trang SSE náº±m á»Ÿ:

- [frontend/src/pages/auth/AdminSSEPage.jsx](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/frontend/src/pages/auth/AdminSSEPage.jsx)

Backend SSE náº±m á»Ÿ:

- [backend/src/services/sse-s.js](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/backend/src/services/sse-s.js)
- [backend/src/controllers/user-c.js](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/backend/src/controllers/user-c.js)

CĂ¡c thĂ nh pháº§n chĂ­nh:

- `addClient(res)`
- `removeClient(clientId)`
- `sendInitialEvent(res, event)`
- `sendEventToAllClients(event)`

Luá»“ng hoáº¡t Ä‘á»™ng:

1. Admin má»Ÿ `/admin-sse`
2. Frontend táº¡o `new EventSource(...)`
3. Backend giá»¯ káº¿t ná»‘i HTTP má»Ÿ
4. Khi cĂ³ user má»›i signup, backend broadcast event tá»›i má»i SSE client
5. Frontend nháº­n message rá»“i reload danh sĂ¡ch user

## 4.8 VĂ¬ sao signup sáº½ kĂ­ch hoáº¡t realtime

Sau khi Ä‘Äƒng kĂ½ thĂ nh cĂ´ng, backend Ä‘ang lĂ m thĂªm 2 viá»‡c:

- `flushPendingRequests()`
- `sendEventToAllClients(...)`

Äiá»ƒm nĂ y náº±m á»Ÿ:

- [backend/src/controllers/auth-c.js](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/backend/src/controllers/auth-c.js)

NghÄ©a lĂ :

- Long-polling client nháº­n dá»¯ liá»‡u má»›i ngay
- SSE client nháº­n thĂ´ng bĂ¡o ngay

## 4.9 Báº£ng admin dĂ¹ng chung

Ba trang admin Ä‘á»u dĂ¹ng chung table component:

- [frontend/src/components/admin/UsersTable.jsx](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/frontend/src/components/admin/UsersTable.jsx)

Má»¥c Ä‘Ă­ch:

- TrĂ¡nh láº·p UI
- Chá»‰ thay khĂ¡c nhau á»Ÿ cĂ¡ch fetch dá»¯ liá»‡u

## 4.10 Docker Ä‘Ă£ lĂ m gĂ¬

### File chĂ­nh

- [docker-compose.yml](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/docker-compose.yml)
- [backend/Dockerfile](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/backend/Dockerfile)
- [backend/docker-entrypoint.sh](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/backend/docker-entrypoint.sh)

### Luá»“ng cháº¡y

1. Container `db` cháº¡y PostgreSQL
2. Container `api` build tá»« thÆ° má»¥c `backend`
3. `docker-entrypoint.sh` chá» DB
4. Cháº¡y migration
5. Náº¿u `NEED_SEED=true` thĂ¬ cháº¡y seed
6. Start server Express

## 5. Cáº¥u trĂºc thÆ° má»¥c quan trá»ng

### Root

- `docker-compose.yml`
- `README.md`

### Backend

- `backend/src/app.js`
- `backend/src/server.js`
- `backend/src/routes/`
- `backend/src/controllers/`
- `backend/src/services/`
- `backend/src/repositories/`
- `backend/src/middlewares/`
- `backend/db/migrations/`
- `backend/db/seeds/`

### Frontend

- `frontend/src/App.jsx`
- `frontend/src/contexts/AuthContext.jsx`
- `frontend/src/auth/api.js`
- `frontend/src/components/`
- `frontend/src/pages/`

## 6. CĂ¡ch cháº¡y tá»« Ä‘áº§u

### BÆ°á»›c 1: má»Ÿ Ä‘Ăºng thÆ° má»¥c

```bash
cd /Users/mickeynguyen/Documents/Bruce/WEB2/week09
```

### BÆ°á»›c 2: náº¿u muá»‘n reset sáº¡ch DB

```bash
docker compose down -v
```

### BÆ°á»›c 3: cháº¡y backend + database

```bash
docker compose up -d --build
```

### BÆ°á»›c 4: cháº¡y frontend

Má»Ÿ terminal khĂ¡c:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Backend API:

```text
http://localhost:3443/api
```

## 7. CĂ¡ch tá»± test nhanh

### Test backend health

```bash
curl http://localhost:3443/api/health
```

### Test login admin

```bash
curl -X POST http://localhost:3443/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"demo-password"}'
```

### Test login user thÆ°á»ng

```bash
curl -X POST http://localhost:3443/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bruce@example.com","password":"demo-password"}'
```

### Test trĂªn giao diá»‡n

1. Login báº±ng admin
2. Má»Ÿ 1 trong 3 trang:
   - `Admin Poll`
   - `Admin Long Poll`
   - `Admin SSE`
3. Má»Ÿ tab khĂ¡c vĂ  register user má»›i
4. Quay láº¡i trang admin Ä‘á»ƒ xem danh sĂ¡ch user tá»± cáº­p nháº­t

## 8. CĂ¡c endpoint chĂ­nh

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/refresh-token`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Tasks

- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/:id/toggle`

### Admin users

- `GET /api/users`
- `GET /api/users/poll?version=...`
- `GET /api/users/sse`

## 9. Nhá»¯ng Ä‘iá»ƒm quan trá»ng Ä‘á»ƒ nhá»› khi thuyáº¿t trĂ¬nh

- Polling lĂ  frontend há»i server liĂªn tá»¥c theo chu ká»³
- Long-polling lĂ  frontend há»i má»™t láº§n, server giá»¯ request tá»›i khi cĂ³ dá»¯ liá»‡u má»›i
- SSE lĂ  server chá»§ Ä‘á»™ng Ä‘áº©y event xuá»‘ng client qua má»™t káº¿t ná»‘i má»Ÿ
- BĂ i nĂ y chá»‰ cáº§n push má»™t chiá»u server -> client, nĂªn SSE phĂ¹ há»£p
- React Router giĂºp app cĂ³ URL tháº­t cho tá»«ng mĂ n hĂ¬nh, thay vĂ¬ chá»‰ Ä‘á»•i giao diá»‡n báº±ng state
- Route admin Ä‘Æ°á»£c báº£o vá»‡ á»Ÿ cáº£ frontend vĂ  backend

## 10. Ghi chĂº lá»—i thÆ°á»ng gáº·p

### Lá»—i Docker khĂ´ng kĂ©o Ä‘Æ°á»£c `node:lts-alpine`

ÄĂ¢y lĂ  lá»—i máº¡ng hoáº·c Docker Hub, khĂ´ng pháº£i lá»—i code app.

Thá»­:

```bash
docker pull node:lts-alpine
docker login
```

Hoáº·c restart Docker Desktop rá»“i cháº¡y láº¡i:

```bash
docker compose up -d --build
```

### Muá»‘n xĂ³a toĂ n bá»™ dá»¯ liá»‡u test

```bash
docker compose down -v
docker compose up -d --build
```
