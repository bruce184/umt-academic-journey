import express from "express";
import { requireAuth } from "../middlewares/auth.js";
import {
    getProfile,
    getUserPosts,
    updateProfile,
    uploadAvatar,
    getFollowers,
    getFollowing,
    completeProfile
} from "../controllers/profiles.controller.js";

const router = express.Router();

// Get profile by username
router.get("/:username", requireAuth, getProfile);

// Get user's posts
router.get("/:username/posts", requireAuth, getUserPosts);

// Update own profile
router.patch("/me", requireAuth, updateProfile);

// Upload avatar
router.post("/me/avatar", requireAuth, uploadAvatar);

// Complete Profile
router.post("/complete", requireAuth, completeProfile);

// Get followers list
router.get("/:username/followers", requireAuth, getFollowers);

// Get following list
router.get("/:username/following", requireAuth, getFollowing);

export default router;
