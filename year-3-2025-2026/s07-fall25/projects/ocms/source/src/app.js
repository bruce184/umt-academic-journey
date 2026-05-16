// src/app.js
import express from "express";
import cors from "cors";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import { attachDbUserContext } from "./middlewares/db-user-context.js";

// Routers / controllers
import authRouter from "./routers/auth.r.js";
import studentRouter from "./routers/student.r.js";
import lecturerRouter from "./routers/lecturer.r.js";
import departmentHeadRouter from "./routers/department-head.r.js";
import adminRouter from "./routers/admin.r.js";
import { checkHealth } from "./controllers/health.c.js";
import globalErrorHandler from "./middlewares/error-handler.js";

// ==== Resolve __dirname trong ESM ====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==== Khởi tạo app ====
const app = express();

// Port cho server.js lấy lại
app.set("port", process.env.PORT || 5000);

// ==== Middlewares cơ bản ====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==== CORS ====
const allowedOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

// ==== Session (dùng cho Auth) ====
app.use(
  session({
    secret: process.env.SECRET || "change_this_session_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // chỉ bật true khi có HTTPS (production)
    },
  })
);
// Populate `req.user` from session if available so downstream handlers
// can rely on a single canonical field. This makes controllers simpler
// and avoids repeated checks for `req.session.user` vs `req.session.userId`.
app.use((req, _res, next) => {
  try {
    if (!req.user && req.session && req.session.user) {
      req.user = {
        id: req.session.user.id ?? req.session.userId ?? null,
        role: req.session.user.role ?? req.session.userRole ?? null,
      };
    }
  } catch (err) {
    // don't block requests on this helper
    console.error("[app] error populating req.user from session:", err);
  }
  return next();
});

app.use(attachDbUserContext);

// ==== Static cho FE (CSS/JS/Images) ====
// Serve toàn bộ file tĩnh bên trong src/views
app.use(express.static(path.join(__dirname, "views")));

// Ảnh, logo, background nằm trong src/assets
app.use("/assets", express.static(path.join(__dirname, "assets")));

// ==== Routes ====

// Health check cho Docker / dev
app.get("/health", checkHealth);

// Auth & trang login
app.use("/", authRouter);

// Các API / view cho từng role
app.use("/students", studentRouter);
app.use("/lecturers", lecturerRouter);
app.use("/heads", departmentHeadRouter);
app.use("/admin", adminRouter);

// ==== 404 fallback ====
app.use((req, res) => {
  res.status(404).json({ ok: false, error: "Not found" });
});

// Global error handler (must be after all routes)
app.use(globalErrorHandler);

// Export cho server.js
export default app;
