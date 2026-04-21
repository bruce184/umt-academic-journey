# OCMS - Online Course Management System

## 🎯 Tổng quan dự án
OCMS là hệ thống quản lý khóa học trực tuyến xây dựng theo mô hình **MVC (Model-View-Controller)** với React 18, TypeScript, Tailwind CSS. Hệ thống hỗ trợ 3 vai trò: Student, Lecturer, Admin với đầy đủ tính năng quản lý, giao diện hiện đại, màu sắc đồng bộ, không còn warning.

---

## 🏗️ Kiến trúc & Công nghệ
- **Frontend:** React 18 + TypeScript + Tailwind CSS
- **Routing:** React Router DOM v6
- **Icons:** Lucide React
- **State Management:** MVC Pattern với Controllers
- **Build Tool:** Create React App
- **Backend:** Node.js + Express + SQL Server
- **Authentication:** JWT Tokens
- **Database:** SQL Server với connection pooling

---

## 🎨 Color Scheme
- **Student:** Yellow theme (`#eab308`)
- **Lecturer:** Blue theme (`#3B82F6`)
- **Admin:** Green theme (`#16a34a`)

> **Lưu ý:** Tất cả chi tiết UI (avatar, banner, sidebar, text nổi bật) đã đồng bộ màu sắc theo vai trò. Giao diện hiện đại, nhất quán, không còn warning về màu sắc.

---

## 📚 Chức năng chính
### Student
- [x] Dashboard (banner vàng, stats, recent courses, schedule, quick actions)
- [x] Attendance (QR-scan)
- [x] Schedule (week-view)
- [x] Courses (list, detail)
- [x] Classes (list, detail)
- [x] Announcements (list, detail)
- [x] Tuition Fee (semester, detail)
- [x] Profile (tabs, avatar vàng, chỉnh sửa thông tin)

### Lecturer
- [x] Dashboard (stats, classes, announcements)
- [x] Attendance Management
- [x] Schedule
- [x] Courses
- [x] Classes
- [x] Announcements
- [x] Profile (avatar xanh dương, chỉnh sửa thông tin)

### Admin
- [x] Dashboard (system overview, analytics)
- [x] Accounts Management
- [x] Students Management
- [x] Lecturers Management
- [x] Courses Management
- [x] Classes Management
- [x] Enrollment Management
- [x] Announcements
- [x] Reports
- [x] Settings
- [ ] Profile (có thể bổ sung nếu cần)

---

## 📝 Checklist tổng thể
- [x] UI/UX đồng bộ, responsive, không warning
- [x] Màu sắc phân biệt rõ ràng từng vai trò
- [x] Avatar, banner, sidebar, text nổi bật đồng bộ màu
- [x] Code clean, tối ưu, không còn file/thư mục thừa
- [x] Tối ưu package.json, tsconfig, tailwind, postcss
- [x] Dọn dẹp dependencies, scripts
- [x] README.md đầy đủ, rõ ràng, không warning
- [x] Checklist cập nhật, trình bày đẹp, không warning

---

## 🗂️ Cấu trúc thư mục
```
OCMS/
├── src/
│   ├── models/           # Models (dữ liệu & logic nghiệp vụ)
│   ├── controllers/      # Controllers (logic điều khiển)
│   ├── views/            # Views (giao diện)
│   ├── components/       # Components chung
│   ├── assets/           # Hình ảnh, tài nguyên
│   └── ...
├── backend/              # Node.js API Server
├── database/             # SQL Server schema
├── reports/              # Project documentation
├── public/               # Static assets
├── ...
```

---

## 🚀 Hướng dẫn cài đặt & chạy
### 1. Cài đặt Node.js
```bash
node --version
npm --version
# Nếu chưa có, tải từ https://nodejs.org/
```
### 2. Cài dependencies
```bash
cd OCMS
npm install
```
### 3. Chạy ứng dụng
```bash
# Frontend
npm start
# Backend (trong thư mục backend)
cd backend
npm install
npm run dev
```
Ứng dụng: `http://localhost:3000`  |  API Backend: `http://localhost:5000`

---

## 🔑 Tài khoản demo
- **Student:** student1 / password123
- **Lecturer:** dr.smith / password123
- **Admin:** admin / password123

---

## 🛠️ Troubleshooting
- **Lỗi "react-scripts is not recognized":**
  - Xóa node_modules, cài lại: `npm install`
  - Hoặc: `npm install --force`
  - Clear cache: `npm cache clean --force`
- **Lỗi TypeScript:**
  - Kiểm tra phiên bản: `npx tsc --version`
  - Rebuild: `npm run build`
- **Database Connection:**
  - Kiểm tra SQL Server, import schema, chạy seeding script: `npm run seed` trong backend

---

## 🗺️ Roadmap
### Phase 1 - Core Features (✅ Hoàn thành)
- [x] Authentication system
- [x] Role-based routing
- [x] Complete MVC architecture
- [x] All user interfaces
- [x] Database integration
- [x] API development
### Phase 2 - Enhanced Features (🔄 Đang phát triển)
- [ ] Real QR code scanning
- [ ] File upload/download
- [ ] Advanced filtering
- [ ] Charts and analytics
- [ ] Real-time notifications
### Phase 3 - Advanced Features (📅 Kế hoạch)
- [ ] Mobile app
- [ ] Dark mode
- [ ] Internationalization
- [ ] Unit testing
- [ ] Performance optimization

---

## 👥 Team
- **Developer:** [Your Name]
- **Course:** Introduction to Software Engineering
- **University:** UMT

---

## 📄 License
Dự án này phát triển cho mục đích học tập và nghiên cứu.

---

**OCMS - Empowering Education Through Technology** 🎓✨

**Status: ✅ Production Ready** 🚀 