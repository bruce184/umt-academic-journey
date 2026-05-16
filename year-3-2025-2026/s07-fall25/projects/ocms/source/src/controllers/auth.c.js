// src/controllers/auth.c.js
// Authentication controllers for OCMS – ĐĂNG NHẬP BẰNG DB THẬT (PostgreSQL), KHÔNG DÙNG MOCK.

import path from "node:path";
import { fileURLToPath } from "node:url";
import { sendOk, sendError } from "./response-util.js";
import { db } from "../models/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Map role -> URL giao diện.
 * Lưu ý: các URL này phải khớp với cấu trúc src/views đã build.
 */
function getRedirectUrlForRole(role) {
  switch (role) {
    case "student":
      // Dashboard sinh viên
      return "/student/html/dashboard-student.html";

    case "lecturer":
      // Giao diện giảng viên (trỏ đến file dashboard-lecturer.html trong build views)
      return "/lecturer/html/dashboard-lecturer.html";

    case "department-head":
      // Giao diện Trưởng khoa / bộ môn (đặt trong folder html)
      return "/department-head/html/department-head.html";

    case "admin":
      // Giao diện admin
      return "/administrator/html/admin-dashboard.html";

    default:
      // Fallback – ghi danh sinh viên
      return "/student/html/student-registration.html";
  }
}

/**
 * GET /login – trả file login.html
 * Nếu đã có session → redirect thẳng theo role.
 */
export function getLogin(req, res) {
  try {
    if (req.session && req.session.user) {
      const redirectUrl = getRedirectUrlForRole(req.session.user.role);
      return res.redirect(redirectUrl);
    }

    const loginPath = path.join(__dirname, "../views/login/login.html");
    return res.sendFile(loginPath);
  } catch (err) {
    console.error("[auth] getLogin error:", err);
    return res
      .status(500)
      .send("Internal server error while rendering login.");
  }
}

/**
 * POST /api/login – JSON login từ login.js
 * Body: { email, password }
 *  - email: có thể là username hoặc email, backend tự handle.
 */
export async function loginApi(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return sendError(
        res,
        400,
        "BAD_REQUEST",
        "Thiếu tên đăng nhập hoặc mật khẩu.",
      );
    }

    // Đăng nhập bằng DB thật: accounts + users (PostgreSQL qua Knex)
    // accounts.user_name OR users.email trùng "email" từ FE và password trùng.
    const acc = await db("accounts as a")
      .join("users as u", "u.user_id", "a.user_id")
      .where(function whereIdentifier() {
        this.where("a.user_name", email).orWhere("u.email", email);
      })
      .andWhere({ "a.password": password })
      .first();

    if (!acc) {
      return sendError(
        res,
        401,
        "INVALID_CREDENTIALS",
        "Sai tài khoản hoặc mật khẩu.",
      );
    }

    // Map DB role (ví dụ: STUDENT, LECTURER, DEPARTMENT_HEAD, ADMIN) -> role string cho UI
    const roleMap = {
      LECTURER: "lecturer",
      STUDENT: "student",
      DEPARTMENT_HEAD: "department-head",
      ADMIN: "admin",
    };

    const roleKey = (acc.user_role || "").toUpperCase();
    const role =
      roleMap[roleKey] || (acc.user_role || "").toLowerCase() || "student";

    const user = {
      id: acc.user_id,
      name: acc.full_name || acc.user_name || "User",
      email: acc.email || acc.user_name,
      role,
    };

    // Lưu thông tin user lên session để dùng cho guard các route sau này
    if (!req.session) {
      // Trường hợp rất hiếm: không có session middleware
      return sendError(
        res,
        500,
        "SESSION_NOT_AVAILABLE",
        "Session is not available on request.",
      );
    }

    // Chuẩn mới: lưu full user object
    req.session.user = user;
    // Chuẩn cũ (compat với middleware/web guard cũ nếu còn dùng)
    req.session.userId = user.id;
    req.session.userRole = user.role;

    const redirectUrl = getRedirectUrlForRole(role);

    return sendOk(res, {
      message: "Đăng nhập thành công.",
      redirectUrl,
      user,
    });
  } catch (err) {
    console.error("[auth] loginApi error:", err);
    return sendError(
      res,
      500,
      "SERVER_ERROR",
      "Internal server error during login.",
    );
  }
}

/**
 * POST /logout + GET /logout – xoá session và quay lại /login
 */
export function logout(req, res) {
  try {
    if (!req.session) {
      return res.redirect("/login");
    }

    req.session.destroy((err) => {
      if (err) {
            console.error("[auth] logout error:", err);
      }
      res.clearCookie("connect.sid");
      return res.redirect("/login");
    });
  } catch (err) {
    console.error("[auth] logout exception:", err);
    return res.redirect("/login");
  }
}

/**
 * POST /api/logout – dùng cho nút Sign Out ở FE nếu cần.
 */
export function apiLogout(req, res) {
  try {
    if (!req.session) {
      return sendOk(res, { message: "No session" });
    }

    req.session.destroy((err) => {
      if (err) {
            console.error("[auth] apiLogout error:", err);
        return sendError(
          res,
          500,
          "SERVER_ERROR",
          "Failed to clear session",
        );
      }
      return sendOk(res, { message: "Logged out" });
    });
  } catch (err) {
    console.error("[auth] apiLogout exception:", err);
    return sendError(
      res,
      500,
      "SERVER_ERROR",
      "Internal logout error",
    );
  }
}
