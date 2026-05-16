import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { getFeed } from "../controllers/feed.controller.js";

const router = Router();
router.get("/", requireAuth, getFeed);
export default router;
