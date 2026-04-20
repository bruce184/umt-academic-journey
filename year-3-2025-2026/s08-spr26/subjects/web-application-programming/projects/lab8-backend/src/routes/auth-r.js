import { Router } from "express";

const router = Router();

// Placeholder route để test auth module đã mount đúng chưa
router.get("/ping", (req, res) => {
  res.json({
    message: "Auth route is ready",
  });
});

export default router;