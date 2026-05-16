import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { FollowController } from "../controllers/follows.controller.js";

const router = Router();

router.post("/:userId/follow", requireAuth, FollowController.followUser);
router.delete("/:userId/follow", requireAuth, FollowController.unfollowUser);

export default router;
