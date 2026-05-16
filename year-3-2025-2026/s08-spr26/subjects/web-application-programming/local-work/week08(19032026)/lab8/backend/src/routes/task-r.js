import { Router } from "express";

const router = Router();

// Placeholder route để test task module đã mount đúng chưa
router.get("/", (req, res) => {
  res.json({
    message: "Task route is ready",
    data: [],
  });
});

export default router;