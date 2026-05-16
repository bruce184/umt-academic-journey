import { StoryService } from "../services/story.service.js";
import { errors } from "../utils/api-error.js";

const firstNonEmptyString = (...values) => {
    for (const value of values) {
        if (typeof value === "string") {
            const trimmed = value.trim();
            if (trimmed) return trimmed;
        }
    }
    return null;
};

export const StoryController = {
    createStory: async (req, res, next) => {
        const mediaUrl = firstNonEmptyString(req.body?.mediaUrl, req.body?.media_url, req.body?.mediaURL);
        const mediaPath = firstNonEmptyString(req.body?.mediaPath, req.body?.media_path);
        const mediaType = firstNonEmptyString(req.body?.mediaType, req.body?.media_type) || "image";
        const caption = firstNonEmptyString(req.body?.caption);

        if (!mediaUrl) {
            return next(errors.validation("mediaUrl is required"));
        }
        try {
            const story = await StoryService.createStory({
                ownerId: req.userId, mediaUrl, mediaPath, mediaType, caption,
            });
            return res.ok({ story }, { status: 201 });
        } catch (e) { return next(e); }
    },

    getFeedStories: async (req, res, next) => {
        try {
            const storyGroups = await StoryService.getFeedStories(req.userId);
            return res.ok({ storyGroups });
        } catch (e) { return next(e); }
    },

    getMyStories: async (req, res, next) => {
        try {
            const stories = await StoryService.getMyStories(req.userId);
            return res.ok({ stories });
        } catch (e) { return next(e); }
    },

    viewStory: async (req, res, next) => {
        const storyId = parseInt(req.params.id, 10);
        if (!Number.isInteger(storyId) || storyId <= 0)
            return next(errors.validation("Invalid story id"));
        try {
            const result = await StoryService.viewStory({ storyId, viewerId: req.userId });
            return res.ok(result);
        } catch (e) {
            if (e?.code === "NOT_FOUND") return next(errors.notFound("Story not found"));
            return next(e);
        }
    },

    deleteStory: async (req, res, next) => {
        const storyId = parseInt(req.params.id, 10);
        if (!Number.isInteger(storyId) || storyId <= 0)
            return next(errors.validation("Invalid story id"));
        try {
            const result = await StoryService.deleteStory({ storyId, ownerId: req.userId });
            return res.ok(result);
        } catch (e) {
            if (e?.code === "NOT_FOUND") return next(errors.notFound("Story not found"));
            if (e?.code === "FORBIDDEN") return next(errors.forbidden("Not authorized"));
            return next(e);
        }
    },

    // ─── Like / Unlike ──────────────────────────────────

    likeStory: async (req, res, next) => {
        const storyId = parseInt(req.params.id, 10);
        if (!Number.isInteger(storyId) || storyId <= 0)
            return next(errors.validation("Invalid story id"));
        try {
            const result = await StoryService.likeStory({ storyId, userId: req.userId });
            return res.ok(result);
        } catch (e) { return next(e); }
    },

    unlikeStory: async (req, res, next) => {
        const storyId = parseInt(req.params.id, 10);
        if (!Number.isInteger(storyId) || storyId <= 0)
            return next(errors.validation("Invalid story id"));
        try {
            const result = await StoryService.unlikeStory({ storyId, userId: req.userId });
            return res.ok(result);
        } catch (e) { return next(e); }
    },

    // ─── Reply ───────────────────────────────────────────

    replyToStory: async (req, res, next) => {
        const storyId = parseInt(req.params.id, 10);
        if (!Number.isInteger(storyId) || storyId <= 0)
            return next(errors.validation("Invalid story id"));
        const { content } = req.body;
        if (!content || typeof content !== "string" || !content.trim())
            return next(errors.validation("Reply content is required"));
        try {
            const reply = await StoryService.replyToStory({ storyId, userId: req.userId, content });
            return res.ok({ reply }, { status: 201 });
        } catch (e) {
            if (e?.code === "NOT_FOUND") return next(errors.notFound("Story not found"));
            return next(e);
        }
    },

    getReplies: async (req, res, next) => {
        const storyId = parseInt(req.params.id, 10);
        if (!Number.isInteger(storyId) || storyId <= 0)
            return next(errors.validation("Invalid story id"));
        try {
            const replies = await StoryService.getReplies(storyId);
            return res.ok({ replies });
        } catch (e) { return next(e); }
    },

    // ─── Active stories check (for profile ring) ─────────

    hasActiveStories: async (req, res, next) => {
        const userId = req.params.userId;
        if (!userId) return next(errors.validation("userId is required"));
        try {
            const hasStories = await StoryService.hasActiveStories(userId);
            return res.ok({ hasStories });
        } catch (e) { return next(e); }
    },

    getUserStories: async (req, res, next) => {
        const userId = req.params.userId;
        if (!userId) return next(errors.validation("userId is required"));
        try {
            const storyGroup = await StoryService.getUserStories({ targetUserId: userId, viewerId: req.userId });
            return res.ok({ storyGroup });
        } catch (e) { return next(e); }
    },
};
