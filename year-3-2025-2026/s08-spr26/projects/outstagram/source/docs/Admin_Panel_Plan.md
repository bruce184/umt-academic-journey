# Outstagram — Admin Panel Plan

> **Version:** 1.0  
> **Last Updated:** 2026-02-21  
> **Author:** System Architect  
> **Audience:** Developers, Technical Leaders, Project Maintainers

---

## Table of Contents

1. [Overview](#1-overview)
2. [Scope & User Roles](#2-scope--user-roles)
3. [Core Modules](#3-core-modules)
4. [Data & API Interaction](#4-data--api-interaction)
5. [UI/UX Principles](#5-uiux-principles)
6. [Security Considerations](#6-security-considerations)
7. [Development Roadmap](#7-development-roadmap)
8. [Future Extension](#8-future-extension)
9. [Appendix — Current System Reference](#appendix--current-system-reference)

---

## 1. Overview

### 1.1 Mục Tiêu

Admin Panel được xây dựng nhằm cung cấp cho đội ngũ quản trị một dashboard tập trung để:

- **Giám sát hệ thống** — Theo dõi metrics (tổng users, posts, tăng trưởng, active users), tình trạng sức khỏe server, và các chỉ số quan trọng.
- **Quản lý dữ liệu** — CRUD users, posts, comments; xử lý reports; soft-delete / restore nội dung vi phạm.
- **Phân quyền & bảo mật** — Quản lý roles, permissions cho nội bộ; audit log mọi hành động nhạy cảm.
- **Cấu hình hệ thống** — Thay đổi feature flags, rate limits, các thông số vận hành mà không cần deploy lại code.

### 1.2 Vai Trò Trong Tổng Thể Hệ Thống

```
┌──────────────────────────────────────────────────────────────────┐
│                      Outstagram Ecosystem                       │
│                                                                  │
│  ┌────────────┐   ┌────────────┐   ┌─────────────────────────┐  │
│  │   Mobile    │   │  Web App   │   │      Admin Panel        │  │
│  │ (iOS/And.)  │   │  (React)   │   │   (React — Separate)    │  │
│  └─────┬──────┘   └─────┬──────┘   └──────────┬──────────────┘  │
│        │                │                      │                 │
│        └────────────────┼──────────────────────┘                 │
│                         ▼                                        │
│              ┌─────────────────────┐                             │
│              │   Express API       │                             │
│              │   (Backend Server)  │                             │
│              └─────────┬───────────┘                             │
│                        ▼                                         │
│              ┌─────────────────────┐                             │
│              │  PostgreSQL (Supa.) │                             │
│              │  + Supabase Auth    │                             │
│              │  + Supabase Storage │                             │
│              └─────────────────────┘                             │
└──────────────────────────────────────────────────────────────────┘
```

Admin Panel là một **ứng dụng client riêng biệt** giao tiếp với cùng Express API backend, nhưng sử dụng các endpoint bổ sung có phân quyền admin (`/api/v1/admin/*`). Nó **không** chia sẻ codebase client với Web App hiện tại.

---

## 2. Scope & User Roles

### 2.1 Các Loại User Quản Trị

| Role | Mô Tả | Cấp Độ |
|------|--------|--------|
| **Super Admin** | Toàn quyền hệ thống. Quản lý admins khác, truy cập audit logs, thay đổi system config. | Cao nhất |
| **Admin** | Quản lý users, posts, comments. Xử lý reports. Không thể thay đổi system config hoặc quản lý Super Admin. | Trung bình |
| **Moderator** | Chỉ xem và xử lý reports (ẩn/khóa nội dung). Không truy cập user data nhạy cảm hoặc system config. | Cơ bản |

### 2.2 Ma Trận Quyền Hạn (High-level)

| Chức năng | Super Admin | Admin | Moderator |
|-----------|:-----------:|:-----:|:---------:|
| Dashboard — view all metrics | ✅ | ✅ | ✅ |
| User Management — view | ✅ | ✅ | ❌ |
| User Management — ban/unban | ✅ | ✅ | ❌ |
| User Management — delete | ✅ | ❌ | ❌ |
| Post / Comment — view | ✅ | ✅ | ✅ |
| Post / Comment — soft-delete / restore | ✅ | ✅ | ✅ |
| Post / Comment — hard-delete | ✅ | ❌ | ❌ |
| Reports — view & resolve | ✅ | ✅ | ✅ |
| Role Management | ✅ | ❌ | ❌ |
| System Configuration | ✅ | ❌ | ❌ |
| Audit Logs — view | ✅ | ✅ (own) | ❌ |
| Audit Logs — view all | ✅ | ❌ | ❌ |

---

## 3. Core Modules

### 3.1 Dashboard

**Mục tiêu:** Trang chủ cung cấp cái nhìn khái quát về sức khỏe và hoạt động hệ thống.

| Widget | Dữ Liệu | Nguồn |
|--------|----------|-------|
| Total Users | Count `profiles` | `SELECT count(*) FROM profiles` |
| New Users (7d / 30d) | `profiles.created_at` | Aggregation query |
| Total Posts | Count `posts` (non-deleted) | `WHERE is_deleted = false` |
| New Posts (7d / 30d) | `posts.created_at` | Aggregation query |
| Active Users (DAU/MAU) | Dựa trên Supabase Auth sessions hoặc custom tracking | Supabase Auth API / custom table |
| Engagement Rate | Likes + Comments / Posts | Derived metric |
| Top Posts | Posts with most likes/comments | `post_likes` + `comments` join |
| Notifications Sent | Count `notifications` | Aggregation query |

**Biểu đồ đề xuất:**
- Line chart: User growth (daily / weekly)
- Bar chart: Posts per day
- Pie chart: Content breakdown (images / videos via `post_media.media_type`)

---

### 3.2 User Management

**Mục tiêu:** Quản lý toàn bộ user profiles trong hệ thống.

**Chức năng:**

| Feature | Mô Tả |
|---------|--------|
| **List Users** | Bảng phân trang hiển thị `username`, `display_name`, `avatar_url`, `is_private`, `created_at`. Hỗ trợ search, sort, filter |
| **View User Detail** | Xem toàn bộ profile + thống kê: số posts, followers, following, comments |
| **Ban / Unban** | Set trạng thái `is_banned` (cần thêm cột) → block login qua middleware |
| **Delete User** | Hard-delete (Super Admin) → cascade xóa posts, comments, follows, likes, notifications |
| **Edit Profile** | Sửa `username`, `display_name`, `bio`, `is_private` cho user (trường hợp đặc biệt) |
| **View User Posts** | Danh sách posts của user (bao gồm cả soft-deleted) |

**Schema Impact:**
```sql
-- Cần thêm cột vào bảng profiles
ALTER TABLE profiles ADD COLUMN role TEXT NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'moderator', 'admin', 'super_admin'));
ALTER TABLE profiles ADD COLUMN is_banned BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN banned_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN banned_reason TEXT;
```

---

### 3.3 Content / Data Management

**Mục tiêu:** Quản lý nội dung (Posts, Comments, Media) trên nền tảng.

#### 3.3.1 Post Management

| Feature | Mô Tả |
|---------|--------|
| **List Posts** | Bảng phân trang: `id`, `owner_id`, `caption` (trích), media count, likes count, comments count, `is_deleted`, `created_at` |
| **View Post Detail** | Xem full caption, media gallery, comments thread, likes list |
| **Soft-delete / Restore** | Toggle `is_deleted` flag |
| **Hard-delete** | Xóa vĩnh viễn post + cascade media, likes, comments, notifications |
| **Filter** | Theo user, ngày tạo, trạng thái (active / deleted), có media hay không |

#### 3.3.2 Comment Management

| Feature | Mô Tả |
|---------|--------|
| **List Comments** | Phân trang: `id`, `post_id`, `user_id`, nội dung (trích), `is_deleted`, `created_at` |
| **View Comment Thread** | Hiển thị nested replies (`parent_id`) |
| **Soft-delete / Restore** | Toggle `is_deleted` |
| **Hard-delete** | Xóa vĩnh viễn |

#### 3.3.3 Reports (Mở rộng — Phase 2)

Chức năng cho phép users report posts/comments vi phạm. Cần thêm bảng `reports`:

```sql
CREATE TABLE reports (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES profiles(user_id),
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment', 'profile')),
  target_id   BIGINT NOT NULL,
  reason      TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  resolved_by UUID REFERENCES profiles(user_id),
  resolved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### 3.4 Permission & Role Management

**Mục tiêu:** Quản lý phân quyền nội bộ admin system.

| Feature | Mô Tả |
|---------|--------|
| **View Admins** | Danh sách tất cả users có role ≠ `user` |
| **Assign Role** | Super Admin gán role `moderator` / `admin` cho user |
| **Revoke Role** | Super Admin hạ role về `user` |
| **Role History** | Log mọi thay đổi role (ai, khi nào, thay đổi gì) — lưu vào `audit_logs` |

**Nguyên tắc:**
- Moderator **không thể** tự nâng quyền.
- Admin **không thể** quản lý Super Admin hoặc các Admin khác.
- Super Admin **không thể** tự hạ quyền (cần Super Admin khác thực hiện).

---

### 3.5 System Configuration

**Mục tiêu:** Cho phép điều chỉnh thông số hệ thống mà không cần deploy.

| Cấu Hình | Mô Tả | Default |
|-----------|--------|---------|
| `max_caption_length` | Giới hạn ký tự caption | 2200 |
| `max_bio_length` | Giới hạn ký tự bio | 500 |
| `max_comment_length` | Giới hạn ký tự comment | 1000 |
| `max_media_per_post` | Số media tối đa / post | 10 |
| `upload_size_limit_mb` | Giới hạn file upload | 10 |
| `maintenance_mode` | Bật / tắt chế độ bảo trì | `false` |
| `new_registration_enabled` | Cho phép đăng ký mới | `true` |

**Lưu trữ:** Tạo bảng `system_config`:
```sql
CREATE TABLE system_config (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_by  UUID REFERENCES profiles(user_id),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### 3.6 Logs / Audit / Monitoring

**Mục tiêu:** Ghi lại toàn bộ hành động quản trị để đảm bảo traceability và accountability.

#### 3.6.1 Audit Logs

```sql
CREATE TABLE audit_logs (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id    UUID NOT NULL REFERENCES profiles(user_id),
  action      TEXT NOT NULL,        -- 'user.ban', 'post.delete', 'config.update', ...
  target_type TEXT,                 -- 'user', 'post', 'comment', 'config'
  target_id   TEXT,                 -- ID of the target entity
  metadata    JSONB DEFAULT '{}',   -- Additional context (old value, new value, reason)
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_actor ON audit_logs (actor_id, created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs (action, created_at DESC);
CREATE INDEX idx_audit_logs_target ON audit_logs (target_type, target_id);
```

#### 3.6.2 Monitoring

| Metric | Phương Pháp |
|--------|-------------|
| API Response Time | Middleware ghi `response_time` vào structured logs |
| Error Rate | Aggregate error logs (status ≥ 500) |
| Database Pool Status | Knex pool monitoring (`knex.client.pool`) |
| Supabase Auth Health | Poll `/health` endpoint |
| Storage Usage | Supabase Storage API — bucket usage |

---

## 4. Data & API Interaction

### 4.1 Kiến Trúc API Cho Admin

Admin Panel giao tiếp với backend thông qua các endpoint mới dưới namespace `/api/v1/admin/*`.

```
/api/v1/admin/
├── dashboard/
│   ├── GET /stats              ← Tổng hợp metrics
│   └── GET /charts/:type       ← Dữ liệu biểu đồ (users, posts, engagement)
├── users/
│   ├── GET    /                ← List users (paginated, filterable)
│   ├── GET    /:id             ← User detail + stats
│   ├── PATCH  /:id             ← Update user profile
│   ├── POST   /:id/ban        ← Ban user
│   ├── POST   /:id/unban      ← Unban user
│   └── DELETE /:id             ← Hard delete user (Super Admin)
├── posts/
│   ├── GET    /                ← List posts (paginated)
│   ├── GET    /:id             ← Post detail
│   ├── PATCH  /:id/soft-delete ← Toggle soft-delete
│   └── DELETE /:id             ← Hard delete (Super Admin)
├── comments/
│   ├── GET    /                ← List comments (paginated)
│   ├── PATCH  /:id/soft-delete ← Toggle soft-delete
│   └── DELETE /:id             ← Hard delete
├── reports/                     ← Phase 2
│   ├── GET    /                ← List reports
│   ├── PATCH  /:id/resolve     ← Mark resolved
│   └── PATCH  /:id/dismiss     ← Dismiss report
├── roles/
│   ├── GET    /admins          ← List admin users
│   └── PATCH  /:id/role        ← Update user role (Super Admin)
├── config/
│   ├── GET    /                ← Get all config
│   └── PATCH  /:key            ← Update config value (Super Admin)
└── audit-logs/
    └── GET    /                ← List audit logs (paginated, filterable)
```

### 4.2 Nguyên Tắc Phân Quyền Ở API Level

```
Request → requireAuth() → requireAdmin(minRole) → Controller → Service → DB
```

**Middleware chain:**

1. **`requireAuth()`** — Middleware hiện tại, xác thực JWT token từ Supabase Auth.
2. **`requireAdmin(minRole)`** — Middleware mới, kiểm tra `profiles.role`:
   - Lấy `role` từ `profiles` table dựa trên `req.userId`.
   - So sánh với `minRole` (hierarchy: `super_admin` > `admin` > `moderator`).
   - Reject nếu role không đủ quyền → `403 Forbidden`.
3. **Controller** gọi Service layer, Service gọi DB.
4. **Audit log tự động** — Middleware hoặc Service layer ghi `audit_logs` cho mọi mutation (POST, PATCH, DELETE).

```javascript
// Ví dụ sử dụng
router.delete('/users/:id', requireAuth, requireAdmin('super_admin'), adminUserCtrl.deleteUser);
router.post('/users/:id/ban', requireAuth, requireAdmin('admin'), adminUserCtrl.banUser);
router.get('/reports', requireAuth, requireAdmin('moderator'), adminReportCtrl.listReports);
```

### 4.3 Logging & Traceability

| Yêu Cầu | Giải Pháp |
|----------|-----------|
| Mỗi request có unique ID | Đã có `request-id` middleware |
| Structured logging | Sử dụng format: `{ requestId, userId, action, target, timestamp }` |
| Audit trail | Ghi vào `audit_logs` table cho mỗi admin action |
| Error tracing | Log `requestId` + stack trace; frontend hiển thị `requestId` để support dễ trace |

---

## 5. UI/UX Principles

### 5.1 Nguyên Tắc Thiết Kế

| Nguyên Tắc | Mô Tả |
|------------|--------|
| **Clarity** | Mỗi page/section có tiêu đề rõ ràng. Data tables có column header mô tả. Breadcrumbs cho navigation |
| **Information Density** | Admin UI ưu tiên mật độ thông tin cao — compact tables, không cần quá nhiều whitespace. Tận dụng sidebar filters thay vì nhiều page chuyển đổi |
| **Safety** | Mọi destructive action (delete, ban) phải có confirmation dialog. Hard-delete yêu cầu gõ lại tên/ID để xác nhận |
| **Responsiveness** | Hỗ trợ desktop-first (admin thường dùng desktop). Mobile layout đơn giản hóa (collapse sidebar) |
| **Consistency** | Sử dụng design system thống nhất (colors, typography, spacing, components) |

### 5.2 Error Handling & Confirmation Flows

```
┌──────────────────────────────────────────────────────┐
│                 Destructive Action Flow              │
│                                                      │
│  User clicks "Ban User"                              │
│         │                                            │
│         ▼                                            │
│  ┌─────────────────────────┐                         │
│  │  Confirmation Dialog    │                         │
│  │  "Ban @username?"       │                         │
│  │  [Reason: __________ ]  │                         │
│  │  [Cancel]  [Confirm]    │                         │
│  └────────────┬────────────┘                         │
│               ▼                                      │
│  API Call → Loading state → Success / Error toast    │
│               │                                      │
│               ▼                                      │
│  Audit log recorded automatically                    │
└──────────────────────────────────────────────────────┘
```

**Quy tắc:**
- **Toast notifications** cho success/error (auto-dismiss sau 5s).
- **Inline validation** trên form inputs.
- **Optimistic UI** cho non-critical actions (mark read). **Pessimistic UI** cho critical actions (delete, ban) — đợi server confirm trước khi update UI.
- **Error recovery** — Hiển thị retry button khi API call fail.

### 5.3 Tech Stack Đề Xuất Cho Admin Panel

| Layer | Công Nghệ | Lý Do |
|-------|-----------|-------|
| Framework | **React** (Vite) | Nhất quán với Web App hiện tại |
| UI Library | **Ant Design** hoặc **Shadcn/UI** | Component library mạnh cho admin dashboard |
| State Management | **TanStack Query** (React Query) | Server state, caching, refetch |
| Charts | **Recharts** hoặc **Chart.js** | Biểu đồ dashboard |
| Routing | **React Router v6** | Nhất quán với client hiện tại |
| Auth | **Supabase Auth** (cùng instance) | Tái sử dụng auth system |

---

## 6. Security Considerations

### 6.1 Authentication / Authorization

| Yêu Cầu | Giải Pháp |
|----------|-----------|
| **Authentication** | Sử dụng Supabase Auth — cùng hệ thống với user app. Admin login cùng credentials nhưng phải có `role` ≠ `user` |
| **Token Validation** | JWT validated server-side với `requireAuth` middleware (đã có) |
| **Role-based Access** | `requireAdmin(minRole)` middleware kiểm tra `profiles.role` |
| **Session Management** | Token expiry theo Supabase config. Admin session timeout ngắn hơn user session (khuyến nghị 2h) |
| **Multi-factor Auth** | Phase 2 — Bật MFA bắt buộc cho tài khoản admin via Supabase Auth MFA |

### 6.2 Audit Logs

- **Ghi log mọi hành động** — Không riêng destructive actions, mà tất cả reads lên dữ liệu nhạy cảm (user detail, audit logs) cũng nên log.
- **Audit logs immutable** — Không cho phép xóa/sửa audit logs (kể cả Super Admin). Sử dụng database-level policies.
- **Retention** — Giữ audit logs tối thiểu 90 ngày. Archive sang cold storage sau 1 năm.

### 6.3 Sensitive Actions Protection

| Hành Động | Biện Pháp Bảo Vệ |
|-----------|-------------------|
| **Hard-delete user** | Chỉ Super Admin + confirmation dialog + gõ lại username |
| **Change user role** | Chỉ Super Admin + audit log + không thể tự thay đổi role mình |
| **Update system config** | Chỉ Super Admin + hiển thị old/new value trong confirmation |
| **View audit logs** | Rate-limited + logged (prevent info exfiltration) |
| **Bulk operations** | Giới hạn batch size (max 50) + confirmation cho mỗi batch |

### 6.4 Network & API Security

- **CORS** — Admin Panel domain được whitelist riêng trong `CORS_ORIGINS`.
- **Rate Limiting** — Admin endpoints có rate limit riêng (cao hơn user nhưng vẫn cần limit).
- **IP Whitelisting** (Optional — Phase 3) — Chỉ cho phép access admin từ trusted IPs.
- **Request Signing** (Optional — Phase 3) — Mỗi admin request kèm HMAC signature.

---

## 7. Development Roadmap

### Phase 1 — MVP (4–6 tuần)

> Xây dựng nền tảng admin cơ bản với các chức năng thiết yếu.

| Tuần | Task | Chi Tiết |
|------|------|----------|
| 1 | **Setup & Infrastructure** | Khởi tạo React (Vite) project mới. Setup routing, layout (sidebar + main content). Tích hợp Supabase Auth login |
| 1 | **DB Schema Updates** | Migration: thêm `role`, `is_banned`, `banned_at`, `banned_reason` vào `profiles`. Tạo bảng `audit_logs`, `system_config` |
| 2 | **Auth Middleware** | Implement `requireAdmin()` middleware. Setup admin route namespace `/api/v1/admin/*` |
| 2 | **Dashboard** | API endpoints cho basic stats. Frontend dashboard page với cards + 1-2 charts |
| 3 | **User Management** | List users (paginated, searchable). View user detail. Ban/unban user |
| 4 | **Post Management** | List posts (paginated). View post detail. Soft-delete / restore |
| 5 | **Comment Management** | List comments. Soft-delete / restore. View in context (post thread) |
| 5 | **Audit Logging** | Implement audit log middleware. Audit logs list page (view only) |
| 6 | **Testing & Polish** | Integration testing. UI polish. Bug fixes. Deployment setup |

**Deliverables Phase 1:**
- ✅ Admin login & role-based access
- ✅ Dashboard với basic metrics
- ✅ User list / detail / ban
- ✅ Post & comment management (soft-delete)
- ✅ Audit logs

---

### Phase 2 — Advanced Features (4–6 tuần)

> Mở rộng tính năng quản trị nâng cao.

| Task | Chi Tiết |
|------|----------|
| **Reports System** | Bảng `reports`. API endpoints. Report queue UI cho moderator |
| **Role Management UI** | Giao diện assign/revoke roles. Role history |
| **System Configuration UI** | Giao diện CRUD `system_config`. Áp dụng config vào business logic |
| **Advanced Dashboard** | Thêm charts: user growth trend, engagement over time, content type breakdown. Date range selector |
| **User Analytics** | Activity timeline, login history, device info |
| **Bulk Operations** | Multi-select → bulk ban, bulk delete posts |
| **MFA Enforcement** | Bắt buộc MFA cho tài khoản admin |
| **Email Notifications** | Gửi email khi ban user, resolve report |

**Deliverables Phase 2:**
- ✅ Report handling workflow
- ✅ Full role management
- ✅ System config UI
- ✅ Advanced analytics dashboard
- ✅ MFA cho admin accounts

---

### Phase 3 — Optimization & Scaling (3–4 tuần)

> Tối ưu hiệu suất, bảo mật, và khả năng mở rộng.

| Task | Chi Tiết |
|------|----------|
| **Performance** | Caching dashboard stats (Redis hoặc in-memory). Optimize heavy queries (materialized views cho aggregations) |
| **Search Enhancement** | Full-text search cho users, posts, comments (Postgres `tsvector` hoặc external search engine) |
| **Export** | CSV/Excel export cho user list, post list, audit logs |
| **IP Whitelisting** | Chỉ cho phép admin access từ trusted networks |
| **Audit Log Archives** | Auto-archive logs cũ hơn 1 năm |
| **Monitoring Integration** | Tích hợp với monitoring tools (Sentry, Grafana) |
| **Automated Alerts** | Alert khi có spike bất thường (mass report, login failures, error rate) |
| **Load Testing** | Stress test admin APIs |

**Deliverables Phase 3:**
- ✅ Optimized query performance
- ✅ Data export functionality
- ✅ Enhanced security (IP whitelist, alerts)
- ✅ Monitoring & observability integration

---

## 8. Future Extension

### 8.1 Khả Năng Mở Rộng Module

Admin Panel được thiết kế theo kiến trúc **module-based**, cho phép dễ dàng thêm module mới:

```
admin-panel/src/
├── modules/
│   ├── dashboard/          ← Mỗi module là một folder
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── index.js        ← Module export (routes, sidebar items)
│   ├── users/
│   ├── posts/
│   ├── comments/
│   ├── reports/
│   ├── roles/
│   ├── config/
│   ├── audit-logs/
│   └── [new-module]/       ← Thêm module mới tại đây
├── shared/                  ← Shared components, hooks, utils
├── layouts/                 ← Admin layout (sidebar, header)
└── App.jsx
```

**Quy trình thêm module mới:**
1. Tạo folder trong `modules/`.
2. Implement pages, components, API hooks.
3. Export routes + sidebar config từ `index.js`.
4. Register module trong `App.jsx` router.
5. Thêm permission check nếu module cần restricted access.

### 8.2 Các Module Tiềm Năng Tương Lai

| Module | Mô Tả | Ưu Tiên |
|--------|--------|---------|
| **Hashtag Management** | Quản lý trending hashtags, blacklist hashtags | Trung bình |
| **Media Moderation** | AI-assisted content moderation (NSFW detection) | Cao |
| **Push Notification Manager** | Gửi push notification đến users/segments | Trung bình |
| **A/B Testing** | Quản lý feature flags + experiment tracking | Thấp |
| **Analytics Deep-dive** | Cohort analysis, retention, funnel analysis | Trung bình |
| **API Key Management** | Quản lý third-party API keys | Thấp |
| **Localization** | Quản lý multi-language content | Thấp |

---

## Appendix — Current System Reference

### A. Database Tables (Current)

| Table | Mô Tả | Key Relations |
|-------|--------|---------------|
| `profiles` | User profiles (1-1 with `auth.users`) | PK: `user_id` (UUID) |
| `posts` | User posts | FK: `owner_id` → `profiles` |
| `post_media` | Media attachments per post | FK: `post_id` → `posts` |
| `follows` | Follow relationships | FK: `follower_id`, `following_id` → `profiles` |
| `post_likes` | Post likes | FK: `post_id` → `posts`, `user_id` → `profiles` |
| `comments` | Post comments (supports nesting) | FK: `post_id` → `posts`, `parent_id` → `comments` |
| `notifications` | System notifications | FK: `recipient_id`, `actor_id` → `profiles` |

### B. Existing API Routes

| Namespace | Endpoints |
|-----------|-----------|
| `/api/v1/` | `me`, `forgot-password`, `reset-password`, `logout` |
| `/api/v1/posts` | CRUD posts |
| `/api/v1/likes` | Like/unlike posts |
| `/api/v1/comments` | CRUD comments |
| `/api/v1/users` | Follow/unfollow |
| `/api/v1/follows` | Follow operations |
| `/api/v1/profiles` | Profile viewing/editing |
| `/api/v1/search` | User/content search |
| `/api/feed` | Feed generation |
| `/api/notifications` | Notification management |
| `/api/usernames` | Username availability check |

### C. Tech Stack Summary

| Component | Technology |
|-----------|------------|
| Backend | Express.js 4 (Node.js, ES Modules) |
| Database | PostgreSQL (hosted on Supabase) |
| ORM / Query | Knex.js (migrations, queries) |
| Auth | Supabase Auth (JWT-based) |
| Storage | Supabase Storage (media uploads) |
| Client | React (Vite) |
| Deployment | Render (backend) |

---

> **Next Step:** Review tài liệu này với team → Approve → Bắt đầu Phase 1 Sprint Planning.
