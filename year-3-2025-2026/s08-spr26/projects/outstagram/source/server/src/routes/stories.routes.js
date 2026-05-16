import { Router } from "express";
import { StoryController } from "../controllers/stories.controller.js";

const router = Router();

// Static routes FIRST
router.get("/feed", StoryController.getFeedStories);
router.get("/mine", StoryController.getMyStories);

// Create story
router.post("/", StoryController.createStory);

// User-specific (profile ring)
router.get("/user/:userId/active", StoryController.hasActiveStories);
router.get("/user/:userId", StoryController.getUserStories);

// Story actions (parameterized — MUST be after static routes)
router.post("/:id/view", StoryController.viewStory);
router.post("/:id/like", StoryController.likeStory);
router.delete("/:id/like", StoryController.unlikeStory);
router.post("/:id/reply", StoryController.replyToStory);
router.get("/:id/replies", StoryController.getReplies);
router.delete("/:id", StoryController.deleteStory);

export default router;
