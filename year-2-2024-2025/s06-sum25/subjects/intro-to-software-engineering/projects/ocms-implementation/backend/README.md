# 🚀 OCMS Backend API

Backend API cho hệ thống quản lý khóa học trực tuyến (OCMS) sử dụng Node.js, Express và SQL Server.

## 📋 **Tính năng**

- ✅ **Authentication & Authorization** với JWT
- ✅ **User Management** (Students, Lecturers, Admins)
- ✅ **Course Management** (CRUD operations)
- ✅ **Class Management** với scheduling
- ✅ **Student Management** với enrollments
- ✅ **Database Integration** với SQL Server
- ✅ **Security** với rate limiting, CORS, helmet
- ✅ **Error Handling** comprehensive
- ✅ **Data Seeding** cho testing

## 🛠️ **Tech Stack**

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** SQL Server (OCMS1)
- **Authentication:** JWT + bcryptjs
- **Security:** Helmet, CORS, Rate Limiting
- **Validation:** Express Validator
- **File Upload:** Multer
- **Logging:** Morgan

## 📦 **Installation**

### 1. **Clone và Setup**
```bash
cd OCMS-FRONTEND-UI/backend
npm install
```

### 2. **Environment Setup**
```bash
# Copy environment file
cp env.example .env

# Edit .env với thông tin database của bạn
```

### 3. **Database Setup**
```bash
# Đảm bảo SQL Server đang chạy
# Database OCMS1 đã được tạo với schema từ database/OCMS_Bruce/SQLQuery1.sql
```

### 4. **Seed Data (Optional)**
```bash
# Chạy script để tạo dữ liệu mẫu
node scripts/seedData.js
```

### 5. **Start Server**
```bash
# Development
npm run dev

# Production
npm start
```

## 🔧 **Configuration**

### **Environment Variables**
```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_SERVER=DESKTOP-RF2L4D3\\SQLEXPRESS
DB_NAME=OCMS1
DB_USER=
DB_PASSWORD=
DB_TRUST_SERVER_CERTIFICATE=true
DB_ENCRYPTION=true

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:3000
```

## 📡 **API Endpoints**

### **Authentication**
```
POST   /api/auth/login          # Đăng nhập
GET    /api/auth/me             # Lấy thông tin user hiện tại
POST   /api/auth/register       # Đăng ký user (Admin only)
```

### **Courses**
```
GET    /api/courses             # Lấy tất cả courses
GET    /api/courses/:id         # Lấy course theo ID
POST   /api/courses             # Tạo course mới (Admin)
PUT    /api/courses/:id         # Cập nhật course (Admin)
DELETE /api/courses/:id         # Xóa course (Admin)
GET    /api/courses/:id/classes # Lấy classes của course
```

### **Students**
```
GET    /api/students            # Lấy tất cả students (Admin)
GET    /api/students/:id        # Lấy thông tin student
GET    /api/students/:id/enrollments    # Lấy enrollments
GET    /api/students/:id/attendance     # Lấy attendance
GET    /api/students/:id/schedule       # Lấy schedule
GET    /api/students/:id/assignments    # Lấy assignments
GET    /api/students/:id/tuition        # Lấy tuition payments
```

### **Health Check**
```
GET    /api/health              # Kiểm tra trạng thái API
GET    /                      # API info
```

## 🔐 **Authentication**

### **Login Request**
```json
{
  "username": "admin",
  "password": "password123"
}
```

### **Login Response**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": "ADMIN001",
    "username": "admin",
    "fullName": "System Administrator",
    "role": "admin",
    "email": "admin@ocms.edu"
  }
}
```

### **Protected Routes**
```javascript
// Thêm header cho requests
Authorization: Bearer <token>
```

## 👥 **User Roles**

### **Admin**
- Quản lý tất cả users, courses, classes
- Xem tất cả data và reports
- Full system access

### **Lecturer**
- Xem courses và classes được assign
- Quản lý attendance, assignments
- Upload materials

### **Student**
- Xem courses và enrollments
- Submit assignments
- View attendance và schedule

## 🧪 **Test Accounts**

Sau khi chạy `seedData.js`:

```
👨‍💼 Admin: admin / password123
👨‍🏫 Lecturer: dr.smith / password123
👨‍🎓 Student: student1 / password123
```

## 📊 **Database Schema**

Backend sync với database schema OCMS1:

- **users** - Thông tin chung của tất cả users
- **students, lecturers, admins** - Role-specific tables
- **courses** - Khóa học
- **classes** - Lớp học
- **schedules** - Lịch học
- **enrollments** - Đăng ký học
- **assignments** - Bài tập
- **attendance_records** - Điểm danh
- **tuition_payments** - Thanh toán học phí

## 🚀 **Development**

### **Scripts**
```bash
npm run dev      # Development với nodemon
npm start        # Production
npm test         # Run tests
npm run lint     # ESLint
```

### **File Structure**
```
backend/
├── config/          # Database config
├── controllers/     # Business logic
├── middleware/      # Auth, error handling
├── routes/          # API routes
├── scripts/         # Data seeding
├── server.js        # Main server file
└── package.json
```

## 🔗 **Frontend Integration**

Backend được thiết kế để tích hợp với React frontend:

```javascript
// Frontend API calls
const API_BASE = 'http://localhost:5000/api';

// Login
const response = await fetch(`${API_BASE}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
});

// Protected requests
const response = await fetch(`${API_BASE}/courses`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## 🛡️ **Security Features**

- **JWT Authentication** với expiration
- **Password Hashing** với bcryptjs
- **Rate Limiting** để prevent abuse
- **CORS Protection** cho cross-origin requests
- **Helmet** cho security headers
- **Input Validation** với express-validator
- **SQL Injection Protection** với parameterized queries

## 📝 **Error Handling**

API trả về consistent error format:

```json
{
  "success": false,
  "error": "Error message",
  "stack": "Error stack (development only)"
}
```

## 🚀 **Deployment**

### **Production Setup**
1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure `JWT_SECRET`
4. Configure CORS origins
5. Setup SSL certificates
6. Use PM2 hoặc Docker

### **Docker (Optional)**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📞 **Support**

Backend API sẵn sàng cho:
- ✅ **Frontend Integration**
- ✅ **Mobile App Development**
- ✅ **Third-party Integrations**
- ✅ **Production Deployment**

---

**OCMS Backend API - Ready for Production!** 🎉 