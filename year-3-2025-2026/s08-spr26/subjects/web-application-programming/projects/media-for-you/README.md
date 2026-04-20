# Homework 09 - React Router + Admin Realtime Dashboard

Project này là bản nâng cấp từ nền tuần 8, với 2 mục tiêu chính:

- Chuyển frontend từ kiểu điều hướng bằng `useState` sang SPA thật bằng `react-router-dom`
- Thêm trang admin có thể theo dõi danh sách user theo 3 cơ chế realtime:
  - Polling
  - Long-polling
  - Server-Sent Events (SSE)

README này giải thích:

- Bài toán tuần 9 đang làm gì
- Lý thuyết đằng sau từng phần
- Code hiện tại đã implement như thế nào
- Cách chạy từ đầu và cách tự test

## 1. Mục tiêu của bài

So với tuần 8, tuần 9 cần bổ sung:

- Một tài khoản admin cố định: `admin@example.com`
- Admin được xem danh sách toàn bộ user
- Frontend dùng router thật thay vì đổi màn hình bằng state
- Có 3 cách cập nhật danh sách user theo thời gian thực

Ý tưởng nghiệp vụ là:

1. Admin mở trang dashboard
2. Khi có người dùng mới đăng ký
3. Danh sách user bên admin tự cập nhật

## 2. Kiến trúc tổng quan

### Backend

- Express API
- PostgreSQL
- Knex cho migration/seed
- JWT access token + refresh token
- Docker để chạy `api` và `db`

### Frontend

- React + Vite
- `react-router-dom` để tạo SPA
- Auth context để giữ trạng thái đăng nhập
- 3 trang admin tách riêng cho 3 cơ chế realtime

## 3. Lý thuyết cần hiểu

### 3.1 React Router là gì

Trước tuần 9, app chuyển màn hình bằng cách lưu một state như:

- `home`
- `login`
- `register`
- `profile`

Cách đó chạy được nhưng chưa phải SPA routing thật, vì:

- URL không đổi đúng theo màn hình
- Không thể refresh ở một trang cụ thể rồi ở lại đúng trang đó
- Không share link trực tiếp tới một màn hình cụ thể
- Không tận dụng được `Navigate`, route guard, redirect

Khi dùng React Router:

- `/` là trang home
- `/login` là trang login
- `/register` là trang register
- `/profile` là trang profile
- `/tasks` là trang tasks
- `/admin-p`, `/admin-lp`, `/admin-sse` là 3 trang admin

Nhờ đó app hoạt động giống một SPA chuẩn hơn.

### 3.2 Polling là gì

Polling là cách đơn giản nhất để “giả realtime”.

Frontend cứ mỗi vài giây lại gọi API:

```text
GET /api/users
```

Ưu điểm:

- Dễ code
- Dễ debug

Nhược điểm:

- Tốn request dù không có dữ liệu mới
- Có độ trễ, vì phải chờ tới lần poll kế tiếp

### 3.3 Long-polling là gì

Long-polling cải tiến từ polling.

Frontend gửi request lên server:

```text
GET /api/users/poll?version=...
```

Nếu server chưa có dữ liệu mới:

- Server không trả ngay
- Giữ request mở

Khi có user mới đăng ký:

- Server trả dữ liệu mới về
- Frontend nhận xong sẽ gửi request long-polling tiếp theo

Ưu điểm:

- Ít request rác hơn polling
- Phản hồi gần realtime hơn

Nhược điểm:

- Phức tạp hơn polling
- Server phải giữ các request đang chờ

### 3.4 SSE là gì

SSE = Server-Sent Events.

Frontend mở một kết nối một chiều tới server bằng `EventSource`:

```text
GET /api/users/sse
```

Sau đó khi có sự kiện mới, server chủ động push message xuống client:

```text
data: {"message":"New user signed up: ..."}
```

Ưu điểm:

- Phù hợp cho luồng server -> client
- Realtime tự nhiên hơn polling
- Nhẹ hơn WebSocket nếu chỉ cần push một chiều

Nhược điểm:

- Chỉ là một chiều server -> client
- Không phải bài nào cũng cần

### 3.5 Vì sao bài này cần version cho long-polling

Frontend cần biết dữ liệu đang có là phiên bản nào.

Server giữ một biến `version`.

- Mỗi lần có user mới đăng ký thì `version` tăng lên
- Client gửi `version` hiện tại của mình lên server
- Nếu server thấy client đang cũ hơn, server trả danh sách user mới ngay
- Nếu client đã mới rồi, server giữ request chờ

Đây là cách rất phổ biến để tránh gửi lại dữ liệu không cần thiết.

## 4. Project này đã implement gì

## 4.1 Frontend router

Frontend đã chuyển sang React Router ở:

- [frontend/src/App.jsx](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/frontend/src/App.jsx)

Các route chính:

- `/`
- `/login`
- `/register`
- `/profile`
- `/tasks`
- `/admin-p`
- `/admin-lp`
- `/admin-sse`

Navbar đã được cập nhật để điều hướng bằng `NavLink`:

- [frontend/src/components/layout/Navbar.jsx](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/frontend/src/components/layout/Navbar.jsx)

## 4.2 Route guard cho user và admin

Hai lớp bảo vệ đã có:

- User phải đăng nhập mới vào được trang protected
- Chỉ admin mới vào được các trang admin

Nằm ở:

- [frontend/src/pages/auth/ProtectedPage.jsx](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/frontend/src/pages/auth/ProtectedPage.jsx)

Phía backend, middleware kiểm tra auth và quyền admin nằm ở:

- [backend/src/middlewares/auth-mw.js](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/backend/src/middlewares/auth-mw.js)

Logic admin hiện là:

- Nếu `req.user.email !== "admin@example.com"` thì trả `403`

## 4.3 Seed tài khoản admin

Admin được tạo bằng seed:

- [backend/db/seeds/002_add_admin.js](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/backend/db/seeds/002_add_admin.js)

Tài khoản:

- Email: `admin@example.com`
- Password: `admin123`

User demo cũ vẫn còn:

- Email: `bruce@example.com`
- Password: `Abc12345`

## 4.4 API lấy danh sách user cho admin

Backend đã thêm route:

- `GET /api/users`

Nằm ở:

- [backend/src/routes/user-r.js](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/backend/src/routes/user-r.js)
- [backend/src/controllers/user-c.js](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/backend/src/controllers/user-c.js)
- [backend/src/services/user-s.js](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/backend/src/services/user-s.js)
- [backend/src/repositories/users-r.js](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/backend/src/repositories/users-r.js)

Luồng xử lý:

1. Router nhận request
2. `protect` kiểm tra JWT
3. `protectAdmin` kiểm tra email admin
4. Controller gọi service
5. Service gọi repository để lấy toàn bộ user từ DB

## 4.5 Polling page

Trang polling nằm ở:

- [frontend/src/pages/auth/AdminPollingPage.jsx](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/frontend/src/pages/auth/AdminPollingPage.jsx)

Ý tưởng code:

- Khi trang mở lên, frontend gọi `userApi.getAllUsers()`
- Sau đó `setInterval(..., 5000)` để gọi lại mỗi 5 giây

API helper nằm ở:

- [frontend/src/auth/api.js](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/frontend/src/auth/api.js)

## 4.6 Long-polling page

Trang long-polling nằm ở:

- [frontend/src/pages/auth/AdminLongPollingPage.jsx](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/frontend/src/pages/auth/AdminLongPollingPage.jsx)

Backend long-polling nằm ở:

- [backend/src/services/user-s.js](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/backend/src/services/user-s.js)
- [backend/src/controllers/user-c.js](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/backend/src/controllers/user-c.js)

Các thành phần chính:

- `version`
- `pendingRequests`
- `addPendingRequest(res)`
- `removePendingRequest(requestId)`
- `flushPendingRequests()`

Luồng hoạt động:

1. Admin mở trang long-polling
2. Frontend gửi `/api/users/poll?version=currentVersion`
3. Nếu server có dữ liệu mới hơn thì trả luôn
4. Nếu chưa có thì giữ request lại trong `pendingRequests`
5. Khi có user mới signup, backend gọi `flushPendingRequests()`
6. Toàn bộ client đang chờ sẽ nhận dữ liệu mới

## 4.7 SSE page

Trang SSE nằm ở:

- [frontend/src/pages/auth/AdminSSEPage.jsx](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/frontend/src/pages/auth/AdminSSEPage.jsx)

Backend SSE nằm ở:

- [backend/src/services/sse-s.js](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/backend/src/services/sse-s.js)
- [backend/src/controllers/user-c.js](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/backend/src/controllers/user-c.js)

Các thành phần chính:

- `addClient(res)`
- `removeClient(clientId)`
- `sendInitialEvent(res, event)`
- `sendEventToAllClients(event)`

Luồng hoạt động:

1. Admin mở `/admin-sse`
2. Frontend tạo `new EventSource(...)`
3. Backend giữ kết nối HTTP mở
4. Khi có user mới signup, backend broadcast event tới mọi SSE client
5. Frontend nhận message rồi reload danh sách user

## 4.8 Vì sao signup sẽ kích hoạt realtime

Sau khi đăng ký thành công, backend đang làm thêm 2 việc:

- `flushPendingRequests()`
- `sendEventToAllClients(...)`

Điểm này nằm ở:

- [backend/src/controllers/auth-c.js](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/backend/src/controllers/auth-c.js)

Nghĩa là:

- Long-polling client nhận dữ liệu mới ngay
- SSE client nhận thông báo ngay

## 4.9 Bảng admin dùng chung

Ba trang admin đều dùng chung table component:

- [frontend/src/components/admin/UsersTable.jsx](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/frontend/src/components/admin/UsersTable.jsx)

Mục đích:

- Tránh lặp UI
- Chỉ thay khác nhau ở cách fetch dữ liệu

## 4.10 Docker đã làm gì

### File chính

- [docker-compose.yml](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/docker-compose.yml)
- [backend/Dockerfile](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/backend/Dockerfile)
- [backend/docker-entrypoint.sh](/Users/mickeynguyen/Documents/Bruce/WEB2/week09/backend/docker-entrypoint.sh)

### Luồng chạy

1. Container `db` chạy PostgreSQL
2. Container `api` build từ thư mục `backend`
3. `docker-entrypoint.sh` chờ DB
4. Chạy migration
5. Nếu `NEED_SEED=true` thì chạy seed
6. Start server Express

## 5. Cấu trúc thư mục quan trọng

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

## 6. Cách chạy từ đầu

### Bước 1: mở đúng thư mục

```bash
cd /Users/mickeynguyen/Documents/Bruce/WEB2/week09
```

### Bước 2: nếu muốn reset sạch DB

```bash
docker compose down -v
```

### Bước 3: chạy backend + database

```bash
docker compose up -d --build
```

### Bước 4: chạy frontend

Mở terminal khác:

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

## 7. Cách tự test nhanh

### Test backend health

```bash
curl http://localhost:3443/api/health
```

### Test login admin

```bash
curl -X POST http://localhost:3443/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### Test login user thường

```bash
curl -X POST http://localhost:3443/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bruce@example.com","password":"Abc12345"}'
```

### Test trên giao diện

1. Login bằng admin
2. Mở 1 trong 3 trang:
   - `Admin Poll`
   - `Admin Long Poll`
   - `Admin SSE`
3. Mở tab khác và register user mới
4. Quay lại trang admin để xem danh sách user tự cập nhật

## 8. Các endpoint chính

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

## 9. Những điểm quan trọng để nhớ khi thuyết trình

- Polling là frontend hỏi server liên tục theo chu kỳ
- Long-polling là frontend hỏi một lần, server giữ request tới khi có dữ liệu mới
- SSE là server chủ động đẩy event xuống client qua một kết nối mở
- Bài này chỉ cần push một chiều server -> client, nên SSE phù hợp
- React Router giúp app có URL thật cho từng màn hình, thay vì chỉ đổi giao diện bằng state
- Route admin được bảo vệ ở cả frontend và backend

## 10. Ghi chú lỗi thường gặp

### Lỗi Docker không kéo được `node:lts-alpine`

Đây là lỗi mạng hoặc Docker Hub, không phải lỗi code app.

Thử:

```bash
docker pull node:lts-alpine
docker login
```

Hoặc restart Docker Desktop rồi chạy lại:

```bash
docker compose up -d --build
```

### Muốn xóa toàn bộ dữ liệu test

```bash
docker compose down -v
docker compose up -d --build
```
