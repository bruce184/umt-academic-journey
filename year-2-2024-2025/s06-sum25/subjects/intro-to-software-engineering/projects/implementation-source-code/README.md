# OCMS - Online Course Management System

## đŸ¯ Tá»•ng quan dá»± Ă¡n
OCMS lĂ  há»‡ thá»‘ng quáº£n lĂ½ khĂ³a há»c trá»±c tuyáº¿n xĂ¢y dá»±ng theo mĂ´ hĂ¬nh **MVC (Model-View-Controller)** vá»›i React 18, TypeScript, Tailwind CSS. Há»‡ thá»‘ng há»— trá»£ 3 vai trĂ²: Student, Lecturer, Admin vá»›i Ä‘áº§y Ä‘á»§ tĂ­nh nÄƒng quáº£n lĂ½, giao diá»‡n hiá»‡n Ä‘áº¡i, mĂ u sáº¯c Ä‘á»“ng bá»™, khĂ´ng cĂ²n warning.

---

## đŸ—ï¸ Kiáº¿n trĂºc & CĂ´ng nghá»‡
- **Frontend:** React 18 + TypeScript + Tailwind CSS
- **Routing:** React Router DOM v6
- **Icons:** Lucide React
- **State Management:** MVC Pattern vá»›i Controllers
- **Build Tool:** Create React App
- **Backend:** Node.js + Express + SQL Server
- **Authentication:** JWT Tokens
- **Database:** SQL Server vá»›i connection pooling

---

## đŸ¨ Color Scheme
- **Student:** Yellow theme (`#eab308`)
- **Lecturer:** Blue theme (`#3B82F6`)
- **Admin:** Green theme (`#16a34a`)

> **LÆ°u Ă½:** Táº¥t cáº£ chi tiáº¿t UI (avatar, banner, sidebar, text ná»•i báº­t) Ä‘Ă£ Ä‘á»“ng bá»™ mĂ u sáº¯c theo vai trĂ². Giao diá»‡n hiá»‡n Ä‘áº¡i, nháº¥t quĂ¡n, khĂ´ng cĂ²n warning vá» mĂ u sáº¯c.

---

## đŸ“ Chá»©c nÄƒng chĂ­nh
### Student
- [x] Dashboard (banner vĂ ng, stats, recent courses, schedule, quick actions)
- [x] Attendance (QR-scan)
- [x] Schedule (week-view)
- [x] Courses (list, detail)
- [x] Classes (list, detail)
- [x] Announcements (list, detail)
- [x] Tuition Fee (semester, detail)
- [x] Profile (tabs, avatar vĂ ng, chá»‰nh sá»­a thĂ´ng tin)

### Lecturer
- [x] Dashboard (stats, classes, announcements)
- [x] Attendance Management
- [x] Schedule
- [x] Courses
- [x] Classes
- [x] Announcements
- [x] Profile (avatar xanh dÆ°Æ¡ng, chá»‰nh sá»­a thĂ´ng tin)

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
- [ ] Profile (cĂ³ thá»ƒ bá»• sung náº¿u cáº§n)

---

## đŸ“ Checklist tá»•ng thá»ƒ
- [x] UI/UX Ä‘á»“ng bá»™, responsive, khĂ´ng warning
- [x] MĂ u sáº¯c phĂ¢n biá»‡t rĂµ rĂ ng tá»«ng vai trĂ²
- [x] Avatar, banner, sidebar, text ná»•i báº­t Ä‘á»“ng bá»™ mĂ u
- [x] Code clean, tá»‘i Æ°u, khĂ´ng cĂ²n file/thÆ° má»¥c thá»«a
- [x] Tá»‘i Æ°u package.json, tsconfig, tailwind, postcss
- [x] Dá»n dáº¹p dependencies, scripts
- [x] README.md Ä‘áº§y Ä‘á»§, rĂµ rĂ ng, khĂ´ng warning
- [x] Checklist cáº­p nháº­t, trĂ¬nh bĂ y Ä‘áº¹p, khĂ´ng warning

---

## đŸ—‚ï¸ Cáº¥u trĂºc thÆ° má»¥c
```
OCMS/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ models/           # Models (dá»¯ liá»‡u & logic nghiá»‡p vá»¥)
â”‚   â”œâ”€â”€ controllers/      # Controllers (logic Ä‘iá»u khiá»ƒn)
â”‚   â”œâ”€â”€ views/            # Views (giao diá»‡n)
â”‚   â”œâ”€â”€ components/       # Components chung
â”‚   â”œâ”€â”€ assets/           # HĂ¬nh áº£nh, tĂ i nguyĂªn
â”‚   â””â”€â”€ ...
â”œâ”€â”€ backend/              # Node.js API Server
â”œâ”€â”€ database/             # SQL Server schema
â”œâ”€â”€ reports/              # Project documentation
â”œâ”€â”€ public/               # Static assets
â”œâ”€â”€ ...
```

---

## đŸ€ HÆ°á»›ng dáº«n cĂ i Ä‘áº·t & cháº¡y
### 1. CĂ i Ä‘áº·t Node.js
```bash
node --version
npm --version
# Náº¿u chÆ°a cĂ³, táº£i tá»« https://nodejs.org/
```
### 2. CĂ i dependencies
```bash
cd OCMS
npm install
```
### 3. Cháº¡y á»©ng dá»¥ng
```bash
# Frontend
npm start
# Backend (trong thÆ° má»¥c backend)
cd backend
npm install
npm run dev
```
á»¨ng dá»¥ng: `http://localhost:3000`  |  API Backend: `http://localhost:5000`

---

## đŸ”‘ TĂ i khoáº£n demo
- **Student:** student1 / demo-password
- **Lecturer:** dr.smith / demo-password
- **Admin:** admin / demo-password

---

## đŸ› ï¸ Troubleshooting
- **Lá»—i "react-scripts is not recognized":**
  - XĂ³a node_modules, cĂ i láº¡i: `npm install`
  - Hoáº·c: `npm install --force`
  - Clear cache: `npm cache clean --force`
- **Lá»—i TypeScript:**
  - Kiá»ƒm tra phiĂªn báº£n: `npx tsc --version`
  - Rebuild: `npm run build`
- **Database Connection:**
  - Kiá»ƒm tra SQL Server, import schema, cháº¡y seeding script: `npm run seed` trong backend

---

## đŸ—ºï¸ Roadmap
### Phase 1 - Core Features (âœ… HoĂ n thĂ nh)
- [x] Authentication system
- [x] Role-based routing
- [x] Complete MVC architecture
- [x] All user interfaces
- [x] Database integration
- [x] API development
### Phase 2 - Enhanced Features (đŸ”„ Äang phĂ¡t triá»ƒn)
- [ ] Real QR code scanning
- [ ] File upload/download
- [ ] Advanced filtering
- [ ] Charts and analytics
- [ ] Real-time notifications
### Phase 3 - Advanced Features (đŸ“… Káº¿ hoáº¡ch)
- [ ] Mobile app
- [ ] Dark mode
- [ ] Internationalization
- [ ] Unit testing
- [ ] Performance optimization

---

## đŸ‘¥ Team
- **Developer:** [Your Name]
- **Course:** Introduction to Software Engineering
- **University:** UMT

---

## đŸ“„ License
Dá»± Ă¡n nĂ y phĂ¡t triá»ƒn cho má»¥c Ä‘Ă­ch há»c táº­p vĂ  nghiĂªn cá»©u.

---

**OCMS - Empowering Education Through Technology** đŸ“âœ¨

**Status: âœ… Production Ready** đŸ€ 