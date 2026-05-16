import express from "express";

import { CommentController } from "../controllers/comments.controller.js";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();

router.post("/id/:commentId/like", requireAuth, CommentController.toggleCommentLike);
router.post("/id/:commentId/report", requireAuth, CommentController.reportComment);
router.get("/:postId", requireAuth, CommentController.getComments);
router.post("/:postId", requireAuth, CommentController.createComment);

export default router;
