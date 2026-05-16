// src/controllers/health.c.js
// Controller cho endpoint /health

import db from "../models/db.js";
import { sendOk, sendError } from "./response-util.js";

/**
 * GET /health
 * - Kiểm tra server đang chạy (mặc định: OK nếu vào được hàm này)
 * - Thử ping database (nếu cấu hình db + knex ok)
 * - Không để error “rơi” ra ngoài, luôn trả JSON.
 */
export const checkHealth = async (_req, res) => {
  let dbStatus = "unknown";

  try {
    // Nếu có db và có hàm raw (Knex instance)
    if (db && typeof db.raw === "function") {
      // Câu query đơn giản để ping DB
      await db.raw("SELECT 1");
      dbStatus = "up";
      return sendOk(res, { db: dbStatus });
    }

    // Trường hợp không có db hoặc không phải Knex -> coi như chưa cấu hình
    dbStatus = "not_configured";
    return sendError(res, 200, "DB_NOT_CONFIGURED", "Database client is not configured");
  } catch (error) {
    console.error("Health DB check failed:", error);

    dbStatus = "down";
    return sendError(res, 500, "DB_DOWN", "Database check failed");
  }
};
