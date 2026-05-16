// src/routers/auth.r.js
import { Router } from "express";
import {
  getLogin,
  loginApi,
  logout,
  apiLogout,
} from "../controllers/auth.c.js";

const router = Router();

/**
 * Root: khi truy cập http://localhost:5000/
 * → chuyển thẳng về trang login cho thân thiện.
 */
router.get("/", (req, res) => {
  return res.redirect("/login");
});

// Web login page
router.get("/login", getLogin);

// API login / logout
router.post("/api/login", loginApi);
router.post("/api/logout", apiLogout);

// Web logout (nút Đăng xuất trong UI)
router.get("/logout", logout);
router.post("/logout", logout);

/**
 * Legacy path: nhiều nút cũ vẫn href="/index/index.html"
 * → map route này thành logout luôn để tránh 404 JSON.
 */
router.get("/index/index.html", logout);

export default router;
