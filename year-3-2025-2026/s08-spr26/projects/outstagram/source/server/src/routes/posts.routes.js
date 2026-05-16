import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { createPost, getPostById, deletePost, updatePost, reportPost } from "../controllers/posts.controller.js";

const router = Router();
router.post("/", requireAuth, createPost);
router.get("/:id", requireAuth, getPostById);
router.post("/:id/report", requireAuth, reportPost);
router.delete("/:id", requireAuth, deletePost);
router.patch("/:id", requireAuth, updatePost);
export default router;
