import express from "express";
import db from "../models/db.js";
import { sendOk, sendError } from "../controllers/response-util.js";

const router = express.Router();

// Basic health check endpoint:
// - ok: true if the server is up
// - db: "up" if a simple DB query succeeds, otherwise "down"
router.get("/health", async (_req, res) => {
  try {
    // Simple lightweight query to verify DB connectivity
    await db.raw("select 1 + 1 as result");

    return sendOk(res, { db: "up" });
  } catch (err) {
    console.error("[health] DB check failed:", err.message);
    return sendError(res, 500, "DB_DOWN", err.message || "Database check failed");
  }
});

export default router;
