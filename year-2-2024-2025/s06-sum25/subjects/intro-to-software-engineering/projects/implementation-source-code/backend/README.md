# đŸ€ OCMS Backend API

Backend API cho há»‡ thá»‘ng quáº£n lĂ½ khĂ³a há»c trá»±c tuyáº¿n (OCMS) sá»­ dá»¥ng Node.js, Express vĂ  SQL Server.

## đŸ“‹ **TĂ­nh nÄƒng**

- âœ… **Authentication & Authorization** vá»›i JWT
- âœ… **User Management** (Students, Lecturers, Admins)
- âœ… **Course Management** (CRUD operations)
- âœ… **Class Management** vá»›i scheduling
- âœ… **Student Management** vá»›i enrollments
- âœ… **Database Integration** vá»›i SQL Server
- âœ… **Security** vá»›i rate limiting, CORS, helmet
- âœ… **Error Handling** comprehensive
- âœ… **Data Seeding** cho testing

## đŸ› ï¸ **Tech Stack**

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** SQL Server (OCMS1)
- **Authentication:** JWT + bcryptjs
- **Security:** Helmet, CORS, Rate Limiting
- **Validation:** Express Validator
- **File Upload:** Multer
- **Logging:** Morgan

## đŸ“¦ **Installation**

### 1. **Clone vĂ  Setup**
```bash
cd OCMS-FRONTEND-UI/backend
npm install
```

### 2. **Environment Setup**
```bash
# Copy environment file
cp env.example .env

# Edit .env vá»›i thĂ´ng tin database cá»§a báº¡n
```

### 3. **Database Setup**
```bash
# Äáº£m báº£o SQL Server Ä‘ang cháº¡y
# Database OCMS1 Ä‘Ă£ Ä‘Æ°á»£c táº¡o vá»›i schema tá»« database/OCMS_Bruce/SQLQuery1.sql
```

### 4. **Seed Data (Optional)**
```bash
# Cháº¡y script Ä‘á»ƒ táº¡o dá»¯ liá»‡u máº«u
node scripts/seedData.js
```

### 5. **Start Server**
```bash
# Development
npm run dev

# Production
npm start
```

## đŸ”§ **Configuration**

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

## đŸ“¡ **API Endpoints**

### **Authentication**
```
POST   /api/auth/login          # ÄÄƒng nháº­p
GET    /api/auth/me             # Láº¥y thĂ´ng tin user hiá»‡n táº¡i
POST   /api/auth/register       # ÄÄƒng kĂ½ user (Admin only)
```

### **Courses**
```
GET    /api/courses             # Láº¥y táº¥t cáº£ courses
GET    /api/courses/:id         # Láº¥y course theo ID
POST   /api/courses             # Táº¡o course má»›i (Admin)
PUT    /api/courses/:id         # Cáº­p nháº­t course (Admin)
DELETE /api/courses/:id         # XĂ³a course (Admin)
GET    /api/courses/:id/classes # Láº¥y classes cá»§a course
```

### **Students**
```
GET    /api/students            # Láº¥y táº¥t cáº£ students (Admin)
GET    /api/students/:id        # Láº¥y thĂ´ng tin student
GET    /api/students/:id/enrollments    # Láº¥y enrollments
GET    /api/students/:id/attendance     # Láº¥y attendance
GET    /api/students/:id/schedule       # Láº¥y schedule
GET    /api/students/:id/assignments    # Láº¥y assignments
GET    /api/students/:id/tuition        # Láº¥y tuition payments
```

### **Health Check**
```
GET    /api/health              # Kiá»ƒm tra tráº¡ng thĂ¡i API
GET    /                      # API info
```

## đŸ” **Authentication**

### **Login Request**
```json
{
  "username": "admin",
  "password": "demo-password"
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
// ThĂªm header cho requests
Authorization: Bearer <token>
```

## đŸ‘¥ **User Roles**

### **Admin**
- Quáº£n lĂ½ táº¥t cáº£ users, courses, classes
- Xem táº¥t cáº£ data vĂ  reports
- Full system access

### **Lecturer**
- Xem courses vĂ  classes Ä‘Æ°á»£c assign
- Quáº£n lĂ½ attendance, assignments
- Upload materials

### **Student**
- Xem courses vĂ  enrollments
- Submit assignments
- View attendance vĂ  schedule

## đŸ§ª **Test Accounts**

Sau khi cháº¡y `seedData.js`:

```
đŸ‘¨â€đŸ’¼ Admin: admin / demo-password
đŸ‘¨â€đŸ« Lecturer: dr.smith / demo-password
đŸ‘¨â€đŸ“ Student: student1 / demo-password
```

## đŸ“ **Database Schema**

Backend sync vá»›i database schema OCMS1:

- **users** - ThĂ´ng tin chung cá»§a táº¥t cáº£ users
- **students, lecturers, admins** - Role-specific tables
- **courses** - KhĂ³a há»c
- **classes** - Lá»›p há»c
- **schedules** - Lá»‹ch há»c
- **enrollments** - ÄÄƒng kĂ½ há»c
- **assignments** - BĂ i táº­p
- **attendance_records** - Äiá»ƒm danh
- **tuition_payments** - Thanh toĂ¡n há»c phĂ­

## đŸ€ **Development**

### **Scripts**
```bash
npm run dev      # Development vá»›i nodemon
npm start        # Production
npm test         # Run tests
npm run lint     # ESLint
```

### **File Structure**
```
backend/
â”œâ”€â”€ config/          # Database config
â”œâ”€â”€ controllers/     # Business logic
â”œâ”€â”€ middleware/      # Auth, error handling
â”œâ”€â”€ routes/          # API routes
â”œâ”€â”€ scripts/         # Data seeding
â”œâ”€â”€ server.js        # Main server file
â””â”€â”€ package.json
```

## đŸ”— **Frontend Integration**

Backend Ä‘Æ°á»£c thiáº¿t káº¿ Ä‘á»ƒ tĂ­ch há»£p vá»›i React frontend:

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

## đŸ›¡ï¸ **Security Features**

- **JWT Authentication** vá»›i expiration
- **Password Hashing** vá»›i bcryptjs
- **Rate Limiting** Ä‘á»ƒ prevent abuse
- **CORS Protection** cho cross-origin requests
- **Helmet** cho security headers
- **Input Validation** vá»›i express-validator
- **SQL Injection Protection** vá»›i parameterized queries

## đŸ“ **Error Handling**

API tráº£ vá» consistent error format:

```json
{
  "success": false,
  "error": "Error message",
  "stack": "Error stack (development only)"
}
```

## đŸ€ **Deployment**

### **Production Setup**
1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure `JWT_SECRET`
4. Configure CORS origins
5. Setup SSL certificates
6. Use PM2 hoáº·c Docker

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

## đŸ“ **Support**

Backend API sáºµn sĂ ng cho:
- âœ… **Frontend Integration**
- âœ… **Mobile App Development**
- âœ… **Third-party Integrations**
- âœ… **Production Deployment**

---

**OCMS Backend API - Ready for Production!** đŸ‰ 