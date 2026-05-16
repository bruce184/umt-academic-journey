import express from "express";
import { LikeController } from "../controllers/likes.controller.js";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();
router.post("/:postId/toggle", requireAuth, LikeController.toggleLike);
export default router;
