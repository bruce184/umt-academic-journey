// src/routers/admin.r.js
import express from "express";
import { sendOk, sendError } from "../controllers/response-util.js";
import * as adminC from "../controllers/admin.c.js";

// Middleware: ensure the requester is an authenticated admin
const ensureAdmin = (req, res, next) => {
  try {
    if (req.session && req.session.user && req.session.user.role === "admin") return next();
    return sendError(res, 403, "FORBIDDEN", "Admin access required");
  } catch (err) {
    console.error("[admin.r] ensureAdmin error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Internal server error in admin auth");
  }
};

// Separate routers for web pages and JSON APIs
export const webRouter = express.Router();
export const apiRouter = express.Router();

// ----- 1. WEB ROUTES (placeholder cho giao diện HTML nếu sau này cần) -----

// Minimal admin web router stub to avoid import errors during startup
webRouter.get("/", (_req, res) => {
  res.send("Admin interface placeholder");
});

// ----- 2. API ROUTES (JSON, mount ở /admin) -----

// Simple API placeholder
apiRouter.get("/", (_req, res) => {
  return sendOk(res, { message: "Admin API placeholder" });
});

// Protect all admin API routes starting from here
apiRouter.use(ensureAdmin);

// Admin API: basic endpoints used by front-end
apiRouter.get("/stats", async (req, res) => {
  try {
    const r = await adminC.getStats(req);
    if (!r || !r.ok) return sendError(res, 500, r?.error?.code || "SERVER_ERROR", r?.error?.message || "Failed to fetch stats");
    return sendOk(res, r.data);
  } catch (err) {
    console.error("[admin.r] /stats error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Internal error fetching admin stats");
  }
});

apiRouter.get("/users", async (req, res) => {
  try {
    const r = await adminC.getUsers(req);
    if (!r || !r.ok) return sendError(res, 500, r?.error?.code || "SERVER_ERROR", r?.error?.message || "Failed to fetch users");
    return sendOk(res, r.data);
  } catch (err) {
    console.error("[admin.r] /users error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Internal error fetching admin users");
  }
});

// Users CRUD
apiRouter.get("/users/:id", async (req, res) => {
  try {
    const r = await adminC.getUserById(req);
    if (!r || !r.ok) return sendError(res, 404, r?.error?.code || "NOT_FOUND", r?.error?.message || "User not found");
    return sendOk(res, r.data);
  } catch (err) {
    console.error("[admin.r] GET /users/:id error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Internal error");
  }
});

apiRouter.post("/users", async (req, res) => {
  try {
    const r = await adminC.createUser(req);
    if (!r || !r.ok) return sendError(res, 400, r?.error?.code || "BAD_REQUEST", r?.error?.message || "Failed to create user");
    return sendOk(res, r.data);
  } catch (err) {
    console.error("[admin.r] POST /users error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Internal error");
  }
});

apiRouter.put("/users/:id", async (req, res) => {
  try {
    const r = await adminC.updateUser(req);
    if (!r || !r.ok) return sendError(res, 400, r?.error?.code || "BAD_REQUEST", r?.error?.message || "Failed to update user");
    return sendOk(res, r.data);
  } catch (err) {
    console.error("[admin.r] PUT /users/:id error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Internal error");
  }
});

apiRouter.delete("/users/:id", async (req, res) => {
  try {
    const r = await adminC.deleteUser(req);
    if (!r || !r.ok) return sendError(res, 400, r?.error?.code || "BAD_REQUEST", r?.error?.message || "Failed to delete user");
    return sendOk(res, r.data);
  } catch (err) {
    console.error("[admin.r] DELETE /users/:id error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Internal error");
  }
});

// Courses
apiRouter.get("/courses", async (req, res) => {
  try {
    const r = await adminC.getCourses(req);
    if (!r || !r.ok) return sendError(res, 500, r?.error?.code || "SERVER_ERROR", r?.error?.message || "Failed to get courses");
    return sendOk(res, r.data);
  } catch (err) {
    console.error("[admin.r] GET /courses error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Internal error");
  }
});

apiRouter.get("/courses/:id", async (req, res) => {
  try {
    const r = await adminC.getCourseById(req);
    if (!r || !r.ok) return sendError(res, 404, r?.error?.code || "NOT_FOUND", r?.error?.message || "Course not found");
    return sendOk(res, r.data);
  } catch (err) {
    console.error("[admin.r] GET /courses/:id error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Internal error");
  }
});

apiRouter.post("/courses", async (req, res) => {
  try {
    const r = await adminC.createCourse(req);
    if (!r || !r.ok) return sendError(res, 400, r?.error?.code || "BAD_REQUEST", r?.error?.message || "Failed to create course");
    return sendOk(res, r.data);
  } catch (err) {
    console.error("[admin.r] POST /courses error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Internal error");
  }
});

apiRouter.put("/courses/:id", async (req, res) => {
  try {
    const r = await adminC.updateCourse(req);
    if (!r || !r.ok) return sendError(res, 400, r?.error?.code || "BAD_REQUEST", r?.error?.message || "Failed to update course");
    return sendOk(res, r.data);
  } catch (err) {
    console.error("[admin.r] PUT /courses/:id error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Internal error");
  }
});

apiRouter.delete("/courses/:id", async (req, res) => {
  try {
    const r = await adminC.deleteCourse(req);
    if (!r || !r.ok) return sendError(res, 400, r?.error?.code || "BAD_REQUEST", r?.error?.message || "Failed to delete course");
    return sendOk(res, r.data);
  } catch (err) {
    console.error("[admin.r] DELETE /courses/:id error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Internal error");
  }
});

// Backups
apiRouter.get("/backups", async (req, res) => {
  try {
    const r = await adminC.listBackups(req);
    return r && r.ok ? sendOk(res, r.data) : sendError(res, 500, "SERVER_ERROR", "Failed to list backups");
  } catch (err) {
    console.error("[admin.r] GET /backups error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Internal error");
  }
});

apiRouter.post("/backups", async (req, res) => {
  try {
    const r = await adminC.createBackup(req);
    return r && r.ok ? sendOk(res, r.data) : sendError(res, 500, "SERVER_ERROR", "Failed to create backup");
  } catch (err) {
    console.error("[admin.r] POST /backups error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Internal error");
  }
});

apiRouter.delete("/backups/:id", async (req, res) => {
  try {
    const r = await adminC.deleteBackup(req);
    return r && r.ok ? sendOk(res, r.data) : sendError(res, 404, r?.error?.code || "NOT_FOUND", r?.error?.message || "Backup not found");
  } catch (err) {
    console.error("[admin.r] DELETE /backups/:id error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Internal error");
  }
});

apiRouter.post("/backups/:id/restore", async (req, res) => {
  try {
    const r = await adminC.restoreBackup(req);
    return r && r.ok ? sendOk(res, r.data) : sendError(res, 404, r?.error?.code || "NOT_FOUND", r?.error?.message || "Backup not found");
  } catch (err) {
    console.error("[admin.r] POST /backups/:id/restore error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Internal error");
  }
});

// Logs
apiRouter.get("/logs", async (req, res) => {
  try {
    const r = await adminC.listLogs(req);
    return r && r.ok ? sendOk(res, r.data) : sendError(res, 500, "SERVER_ERROR", "Failed to list logs");
  } catch (err) {
    console.error("[admin.r] GET /logs error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Internal error");
  }
});

apiRouter.post("/logs", async (req, res) => {
  try {
    const r = await adminC.createLog(req);
    return r && r.ok ? sendOk(res, r.data) : sendError(res, 400, r?.error?.code || "BAD_REQUEST", r?.error?.message || "Failed to create log");
  } catch (err) {
    console.error("[admin.r] POST /logs error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Internal error");
  }
});

// Default export: dùng API router cho app.use("/admin", adminRouter)
export default apiRouter;
