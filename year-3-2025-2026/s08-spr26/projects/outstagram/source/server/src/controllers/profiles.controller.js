import { db } from "../db/knex.js";

export const getProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const currentUserId = req.userId;

        // Get profile by username
        const profile = await db("profiles").where({ username }).first();

        if (!profile) {
            return res.status(404).json({ error: "NOT_FOUND", message: "Profile not found" });
        }

        // Get stats
        const [postCount, followerCount, followingCount, isFollowing] = await Promise.all([
            db("posts").where({ owner_id: profile.user_id, is_deleted: false }).count("* as count").first(),
            db("follows").where({ following_id: profile.user_id }).count("* as count").first(),
            db("follows").where({ follower_id: profile.user_id }).count("* as count").first(),
            db("follows").where({ follower_id: currentUserId, following_id: profile.user_id }).first()
        ]);

        return res.ok({
            user_id: profile.user_id,
            username: profile.username,
            display_name: profile.display_name,
            bio: profile.bio,
            avatar_url: profile.avatar_url,
            is_private: profile.is_private,
            post_count: parseInt(postCount.count),
            follower_count: parseInt(followerCount.count),
            following_count: parseInt(followingCount.count),
            is_following: !!isFollowing,
            is_own_profile: profile.user_id === currentUserId
        });
    } catch (e) {
        console.error("Get profile error:", e);
        return res.status(500).json({ error: "INTERNAL_ERROR", message: "Internal server error" });
    }
};

export const getUserPosts = async (req, res) => {
    try {
        const { username } = req.params;
        const currentUserId = req.userId;
        const limit = parseInt(req.query.limit) || 12;
        const offset = parseInt(req.query.offset) || 0;

        // Get profile
        const profile = await db("profiles").where({ username }).first();
        if (!profile) {
            return res.status(404).json({ error: "NOT_FOUND", message: "Profile not found" });
        }

        // Get posts
        const posts = await db("posts")
            .select([
                "posts.id",
                "posts.caption",
                "posts.created_at",
                db.raw(`(
                    SELECT json_agg(json_build_object(
                        'url', pm.media_url,
                        'type', pm.media_type
                    ) ORDER BY pm.position ASC)
                    FROM post_media pm
                    WHERE pm.post_id = posts.id
                ) as media`),
                db.raw(`(SELECT COUNT(*) FROM post_likes WHERE post_id = posts.id)::int as like_count`),
                db.raw(`(SELECT COUNT(*) FROM comments WHERE post_id = posts.id AND is_deleted = false)::int as comment_count`)
            ])
            .where({ owner_id: profile.user_id, is_deleted: false })
            .orderBy("created_at", "desc")
            .limit(limit)
            .offset(offset);

        return res.ok(posts);
    } catch (e) {
        console.error("Get user posts error:", e);
        return res.status(500).json({ error: "INTERNAL_ERROR", message: "Internal server error" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { display_name, bio, avatar_url } = req.body;

        const updateData = {};

        if (display_name !== undefined) {
            const trimmedName = String(display_name).trim();
            if (trimmedName.length > 50) {
                return res.status(400).json({ error: "VALIDATION_ERROR", message: "Display name cannot exceed 50 characters" });
            }
            updateData.display_name = trimmedName;
        }

        if (bio !== undefined) {
            const trimmedBio = String(bio).trim();
            if (trimmedBio.length > 150) {
                return res.status(400).json({ error: "VALIDATION_ERROR", message: "Bio cannot exceed 150 characters" });
            }
            updateData.bio = trimmedBio;
        }

        if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: "VALIDATION_ERROR", message: "No fields to update" });
        }

        const [updated] = await db("profiles")
            .where({ user_id: userId })
            .update(updateData)
            .returning("*");

        return res.ok(updated);
    } catch (e) {
        console.error("Update profile error:", e);
        return res.status(500).json({ error: "INTERNAL_ERROR", message: "Internal server error" });
    }
};

export const uploadAvatar = async (req, res) => {
    try {
        const userId = req.userId;
        const { avatar_url, avatar_path } = req.body;

        if (!avatar_url) {
            return res.status(400).json({ error: "VALIDATION_ERROR", message: "avatar_url is required" });
        }

        const [updated] = await db("profiles")
            .where({ user_id: userId })
            .update({ avatar_url, avatar_path })
            .returning("*");

        return res.ok(updated);
    } catch (e) {
        console.error("Upload avatar error:", e);
        return res.status(500).json({ error: "INTERNAL_ERROR", message: "Internal server error" });
    }
};

export const getFollowers = async (req, res) => {
    try {
        const { username } = req.params;
        const currentUserId = req.userId;
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;

        // Get profile
        const profile = await db("profiles").where({ username }).first();
        if (!profile) {
            return res.status(404).json({ error: "NOT_FOUND", message: "Profile not found" });
        }

        // Get followers
        const followers = await db("follows")
            .join("profiles", "follows.follower_id", "profiles.user_id")
            .select([
                "profiles.user_id",
                "profiles.username",
                "profiles.display_name",
                "profiles.avatar_url",
                db.raw(`EXISTS(
                    SELECT 1 FROM follows f2
                    WHERE f2.follower_id = ? AND f2.following_id = profiles.user_id
                ) as is_following`, [currentUserId])
            ])
            .where({ "follows.following_id": profile.user_id })
            .orderBy("follows.created_at", "desc")
            .limit(limit)
            .offset(offset);

        return res.ok(followers);
    } catch (e) {
        console.error("Get followers error:", e);
        return res.status(500).json({ error: "INTERNAL_ERROR", message: "Internal server error" });
    }
};

export const getFollowing = async (req, res) => {
    try {
        const { username } = req.params;
        const currentUserId = req.userId;
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;

        // Get profile
        const profile = await db("profiles").where({ username }).first();
        if (!profile) {
            return res.status(404).json({ error: "NOT_FOUND", message: "Profile not found" });
        }

        // Get following
        const following = await db("follows")
            .join("profiles", "follows.following_id", "profiles.user_id")
            .select([
                "profiles.user_id",
                "profiles.username",
                "profiles.display_name",
                "profiles.avatar_url",
                db.raw(`EXISTS(
                    SELECT 1 FROM follows f2
                    WHERE f2.follower_id = ? AND f2.following_id = profiles.user_id
                ) as is_following`, [currentUserId])
            ])
            .where({ "follows.follower_id": profile.user_id })
            .orderBy("follows.created_at", "desc")
            .limit(limit)
            .offset(offset);

        return res.ok(following);
    } catch (e) {
        console.error("Get following error:", e);
        return res.status(500).json({ error: "INTERNAL_ERROR", message: "Internal server error" });
    }
};

export const completeProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { username, display_name, avatar_url } = req.body;

        if (!username || !display_name) {
            return res.status(400).json({ error: "VALIDATION_ERROR", message: "Tên người dùng và tên hiển thị là bắt buộc" });
        }

        const trimmedUsername = String(username).trim();
        const trimmedDisplayName = String(display_name).trim();

        if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
            return res.status(400).json({ error: "VALIDATION_ERROR", message: "Độ dài tên người dùng không hợp lệ" });
        }

        if (trimmedDisplayName.length > 50) {
            return res.status(400).json({ error: "VALIDATION_ERROR", message: "Tên hiển thị vượt quá độ dài tối đa" });
        }

        // Kiểm tra xem username đã tồn tại chưa (ngoại trừ user hiện tại)
        const existing = await db("profiles")
            .whereRaw("LOWER(username) = ?", [trimmedUsername.toLowerCase()])
            .whereNot({ user_id: userId })
            .first();

        if (existing) {
            return res.status(400).json({ error: "USERNAME_TAKEN", message: "Tên người dùng đã được sử dụng" });
        }

        const updateData = {
            username: trimmedUsername,
            display_name: trimmedDisplayName
        };

        if (avatar_url) {
            updateData.avatar_url = avatar_url;
        }

        const [updated] = await db("profiles")
            .where({ user_id: userId })
            .update(updateData)
            .returning("*");

        return res.ok(updated);
    } catch (e) {
        console.error("Complete profile error:", e);
        return res.status(500).json({ error: "INTERNAL_ERROR", message: "Internal server error" });
    }
};
