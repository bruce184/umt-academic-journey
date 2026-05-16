import { Router } from "express";
import authRoutes from "./auth-r.js";
import taskRoutes from "./task-r.js";

const router = Router();

// Health check để test server
router.get("/health", (req, res) => {
  res.json({
    message: "API is running",
    time: new Date().toISOString(),
  });
});

// Gom route auth
router.use("/auth", authRoutes);

// Gom route tasks
router.use("/tasks", taskRoutes);

export default router;