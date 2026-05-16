import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { getMe, getMyCommentsActivity, forgotPassword, resetPassword, logout } from "../controllers/auth.controller.js";

const router = Router();

router.get("/me", requireAuth, getMe);
router.get("/me/comments", requireAuth, getMyCommentsActivity);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/logout", requireAuth, logout);

export default router;
