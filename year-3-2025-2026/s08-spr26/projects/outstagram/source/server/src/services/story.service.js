import { db } from "../db/knex.js";

export const StoryService = {
    async createStory({ ownerId, mediaUrl, mediaPath, mediaType, caption }) {
        const [story] = await db("stories")
            .insert({
                owner_id: ownerId,
                media_url: mediaUrl,
                media_path: mediaPath || null,
                media_type: mediaType || "image",
                caption: caption ? caption.trim().slice(0, 200) : null,
            })
            .returning("*");
        return story;
    },

    async getFeedStories(userId) {
        const followRows = await db("follows")
            .where("follower_id", userId)
            .select("following_id");
        const userIds = [userId, ...followRows.map(r => r.following_id)];

        const stories = await db("stories as s")
            .join("profiles as p", "p.user_id", "s.owner_id")
            .whereIn("s.owner_id", userIds)
            .where("s.is_deleted", false)
            .where("s.expires_at", ">", db.fn.now())
            .select(
                "s.id", "s.owner_id", "s.media_url", "s.media_type",
                "s.caption", "s.created_at", "s.expires_at",
                "p.username", "p.display_name", "p.avatar_url",
                db.raw(`(SELECT count(*) FROM story_likes sl WHERE sl.story_id = s.id)::int as like_count`),
                db.raw(`EXISTS(SELECT 1 FROM story_likes sl WHERE sl.story_id = s.id AND sl.user_id = ?) as liked_by_viewer`, [userId])
            )
            .orderBy("s.created_at", "asc");

        if (!stories.length) return [];

        const storyIds = stories.map(s => s.id);
        const viewedRows = await db("story_views")
            .where("viewer_id", userId)
            .whereIn("story_id", storyIds)
            .select("story_id");
        const viewedSet = new Set(viewedRows.map(v => v.story_id));

        const grouped = {};
        for (const s of stories) {
            if (!grouped[s.owner_id]) {
                grouped[s.owner_id] = {
                    user: {
                        user_id: s.owner_id,
                        username: s.username,
                        display_name: s.display_name,
                        avatar_url: s.avatar_url,
                    },
                    stories: [],
                    has_unseen: false,
                };
            }
            const seen = viewedSet.has(s.id);
            grouped[s.owner_id].stories.push({
                id: s.id,
                media_url: s.media_url,
                media_type: s.media_type,
                caption: s.caption,
                created_at: s.created_at,
                expires_at: s.expires_at,
                seen,
                like_count: s.like_count,
                liked_by_viewer: s.liked_by_viewer,
            });
            if (!seen) grouped[s.owner_id].has_unseen = true;
        }

        const result = Object.values(grouped).sort((a, b) => {
            if (a.user.user_id === userId) return -1;
            if (b.user.user_id === userId) return 1;
            if (a.has_unseen !== b.has_unseen) return a.has_unseen ? -1 : 1;
            const aLatest = a.stories[a.stories.length - 1].created_at;
            const bLatest = b.stories[b.stories.length - 1].created_at;
            return new Date(bLatest) - new Date(aLatest);
        });

        return result;
    },

    async getMyStories(userId) {
        const stories = await db("stories")
            .where("owner_id", userId)
            .where("is_deleted", false)
            .where("expires_at", ">", db.fn.now())
            .orderBy("created_at", "asc")
            .select("*");

        const enriched = await Promise.all(stories.map(async (s) => {
            const viewers = await db("story_views as sv")
                .join("profiles as p", "p.user_id", "sv.viewer_id")
                .where("sv.story_id", s.id)
                .select("p.user_id", "p.username", "p.display_name", "p.avatar_url", "sv.viewed_at")
                .orderBy("sv.viewed_at", "desc");
            return { ...s, viewers, view_count: viewers.length };
        }));

        return enriched;
    },

    async viewStory({ storyId, viewerId }) {
        const story = await db("stories").where("id", storyId).first();
        if (!story) {
            const err = new Error("Story not found");
            err.code = "NOT_FOUND";
            throw err;
        }
        if (story.owner_id === viewerId) return { viewed: false };

        try {
            await db("story_views").insert({ story_id: storyId, viewer_id: viewerId });
        } catch (e) {
            if (e?.code !== "23505") throw e;
        }
        return { viewed: true };
    },

    async deleteStory({ storyId, ownerId }) {
        const story = await db("stories").where("id", storyId).first();
        if (!story) {
            const err = new Error("Story not found");
            err.code = "NOT_FOUND";
            throw err;
        }
        if (story.owner_id !== ownerId) {
            const err = new Error("Not authorized");
            err.code = "FORBIDDEN";
            throw err;
        }
        await db("stories").where("id", storyId).update({ is_deleted: true });
        return { deleted: true };
    },

    // ─── Like / Unlike ──────────────────────────────────

    async likeStory({ storyId, userId }) {
        try {
            await db("story_likes").insert({ story_id: storyId, user_id: userId });
        } catch (e) {
            if (e?.code === "23505") return { liked: true, already: true };
            throw e;
        }
        return { liked: true };
    },

    async unlikeStory({ storyId, userId }) {
        const deleted = await db("story_likes")
            .where({ story_id: storyId, user_id: userId })
            .del();
        return { unliked: deleted > 0 };
    },

    // ─── Reply ───────────────────────────────────────────

    async replyToStory({ storyId, userId, content }) {
        const story = await db("stories").where("id", storyId).first();
        if (!story) {
            const err = new Error("Story not found");
            err.code = "NOT_FOUND";
            throw err;
        }
        const [reply] = await db("story_replies")
            .insert({
                story_id: storyId,
                user_id: userId,
                content: content.trim().slice(0, 500),
            })
            .returning("*");
        return reply;
    },

    async getReplies(storyId) {
        return db("story_replies as sr")
            .join("profiles as p", "p.user_id", "sr.user_id")
            .where("sr.story_id", storyId)
            .select("sr.*", "p.username", "p.display_name", "p.avatar_url")
            .orderBy("sr.created_at", "asc");
    },

    // ─── Check if user has active stories ────────────────

    async hasActiveStories(userId) {
        const row = await db("stories")
            .where("owner_id", userId)
            .where("is_deleted", false)
            .where("expires_at", ">", db.fn.now())
            .first();
        return !!row;
    },

    async getUserStories({ targetUserId, viewerId }) {
        const stories = await db("stories as s")
            .join("profiles as p", "p.user_id", "s.owner_id")
            .where("s.owner_id", targetUserId)
            .where("s.is_deleted", false)
            .where("s.expires_at", ">", db.fn.now())
            .select(
                "s.id", "s.owner_id", "s.media_url", "s.media_type",
                "s.caption", "s.created_at", "s.expires_at",
                "p.username", "p.display_name", "p.avatar_url",
                db.raw(`(SELECT count(*) FROM story_likes sl WHERE sl.story_id = s.id)::int as like_count`),
                db.raw(`EXISTS(SELECT 1 FROM story_likes sl WHERE sl.story_id = s.id AND sl.user_id = ?) as liked_by_viewer`, [viewerId])
            )
            .orderBy("s.created_at", "asc");

        if (!stories.length) return null;

        const storyIds = stories.map(s => s.id);
        const viewedRows = await db("story_views")
            .where("viewer_id", viewerId)
            .whereIn("story_id", storyIds)
            .select("story_id");
        const viewedSet = new Set(viewedRows.map(v => v.story_id));

        const s0 = stories[0];
        return {
            user: {
                user_id: s0.owner_id,
                username: s0.username,
                display_name: s0.display_name,
                avatar_url: s0.avatar_url,
            },
            stories: stories.map(s => ({
                id: s.id,
                media_url: s.media_url,
                media_type: s.media_type,
                caption: s.caption,
                created_at: s.created_at,
                expires_at: s.expires_at,
                seen: viewedSet.has(s.id),
                like_count: s.like_count,
                liked_by_viewer: s.liked_by_viewer,
            })),
            has_unseen: stories.some(s => !viewedSet.has(s.id)),
        };
    },
};
