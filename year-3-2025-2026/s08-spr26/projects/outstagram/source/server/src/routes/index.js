import { Router } from "express";
import feedRoutes from "./feed.routes.js";
import postsRoutes from "./posts.routes.js";
import usernamesRoutes from "./usernames.routes.js";
import authRoutes from "./auth.routes.js";
import followsRoutes from "./follows.routes.js";
import profilesRoutes from "./profiles.routes.js";
import notificationsRoutes from "./notifications.routes.js";
import configRoutes from "./config.routes.js";

import adminRoutes from "./admin/index.js";
import messagesRoutes from "./messages.routes.js";
import storiesRoutes from "./stories.routes.js";
import { requireAuth } from "../middlewares/auth.js";
import reportRoutes from "./report.routes.js";

const router = Router();

const v1Router = Router();
v1Router.use("/", authRoutes); // /api/v1/me, /api/v1/forgot-password, /api/v1/reset-password, /api/v1/logout
v1Router.use("/posts", postsRoutes); // /api/v1/posts

// Mount new social features
v1Router.use("/users", followsRoutes); // /api/v1/users/:id/follow
v1Router.use("/profiles", profilesRoutes); // /api/v1/profiles/:username
v1Router.use("/config", configRoutes);
v1Router.use("/feed", feedRoutes); // /api/v1/feed

// Mount Admin routes
v1Router.use("/admin", requireAuth, adminRoutes);

// Mount Messages (DMs) routes
v1Router.use("/messages", requireAuth, messagesRoutes);

// Mount Stories routes
v1Router.use("/stories", requireAuth, storiesRoutes);
v1Router.use("/notifications", requireAuth, notificationsRoutes);

v1Router.use("/report", requireAuth, reportRoutes);

router.use("/feed", feedRoutes); // Keep legacy /api/feed for now if used
router.use("/posts", postsRoutes); // Keep legacy /api/posts for safety
router.use("/usernames", usernamesRoutes);
router.use("/notifications", notificationsRoutes);

// V1 Routes
router.use("/v1", v1Router);

import likesRoutes from "./likes.routes.js";
v1Router.use("/likes", likesRoutes);

import commentsRoutes from "./comments.routes.js";
v1Router.use("/comments", commentsRoutes);
v1Router.use("/follows", followsRoutes);

import searchRoutes from "./search.routes.js";
v1Router.use("/search", searchRoutes);

export default router;
