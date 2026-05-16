import { db } from "../db/knex.js";
import { supabaseAnon } from "../../lib/supabase.js";
import { createClient } from "@supabase/supabase-js";
import { errors } from "../utils/api-error.js";

export const getMe = async (req, res, next) => {
    try {
        const userId = req.userId;
        const user = req.user;

        let profile = await db("profiles").where({ user_id: userId }).first();

        // Fallback: If profile missing, try to create it from metadata
        if (!profile) {
            const displayName = user.user_metadata?.display_name || user.user_metadata?.full_name || "";
            let username = user.user_metadata?.username || `user_${userId.slice(0, 8)}`;

            // Check username uniqueness if generating from metadata
            const existing = await db("profiles").where({ username }).first();
            if (existing) {
                username = `${username}_${Date.now().toString().slice(-4)}`;
            }

            try {
                const [newProfile] = await db("profiles").insert({
                    user_id: userId,
                    display_name: displayName,
                    username: username
                }).returning("*");
                profile = newProfile;
            } catch (insertError) {
                return res.status(404).json({ error: "PROFILE_CREATION_FAILED", message: "Profile not found and could not be created." });
            }
        }

        return res.ok({
            user: {
                id: user.id,
                email: user.email,
                last_sign_in_at: user.last_sign_in_at
            },
            profile: profile
        });
    } catch (e) {
        console.error("Get Me error:", e);
        return res.status(500).json({ error: "INTERNAL_ERROR", message: "Internal server error" });
    }
};

export const getMyCommentsActivity = async (req, res, next) => {
    try {
        const userId = req.userId;

        const myComments = await db("public.comments")
            .select("id")
            .where({ user_id: userId, is_deleted: false });

        const myCommentIds = myComments.map((item) => item.id);

        const comments = await db("public.comments as c")
            .leftJoin("public.profiles as p", "c.user_id", "p.user_id")
            .leftJoin("public.comments as parent", "c.parent_id", "parent.id")
            .leftJoin("public.profiles as pp", "parent.user_id", "pp.user_id")
            .select([
                "c.id",
                "c.post_id",
                "c.parent_id",
                "c.content",
                "c.created_at",
                "c.user_id",
                "p.username",
                "p.display_name",
                "p.avatar_url",
                "pp.username as parent_username",
                db.raw("CASE WHEN c.user_id = ? THEN true ELSE false END as is_mine", [userId]),
                db.raw(`
                    (
                        SELECT pm.media_url
                        FROM public.post_media pm
                        WHERE pm.post_id = c.post_id
                        ORDER BY pm.position ASC
                        LIMIT 1
                    ) as post_thumbnail
                `),
                db.raw(`
                    (
                        SELECT pm.media_type
                        FROM public.post_media pm
                        WHERE pm.post_id = c.post_id
                        ORDER BY pm.position ASC
                        LIMIT 1
                    ) as post_media_type
                `),
            ])
            .where("c.is_deleted", false)
            .modify((query) => {
                query.where("c.user_id", userId);
                if (myCommentIds.length) {
                    query.orWhereIn("c.parent_id", myCommentIds);
                }
            })
            .orderBy("c.created_at", "desc")
            .limit(120);

        return res.ok({ comments });
    } catch (e) {
        console.error("Get my comments activity error:", e);
        return res.status(500).json({ error: "GET_COMMENTS_ACTIVITY_FAILED", message: "Internal server error" });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "VALIDATION_ERROR", message: "Email is required" });
        }

        // Basic email regex validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "VALIDATION_ERROR", message: "Invalid email format" });
        }

        // Send password reset email via Supabase
        const { error } = await supabaseAnon.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.WEB_BASE_URL || 'http://localhost:5174'}/reset-password`,
        });

        if (error) {
            console.error("Forgot password error:", error);
            // Don't leak specific errors, but log them
            // In a real generic case we might just swallow it, but here we return standard error
            return res.status(400).json({ error: "RESET_FAILED", message: error.message });
        }

        // Always return success to prevent email enumeration
        return res.ok({
            message: "If an account exists with this email, a password reset link has been sent."
        });
    } catch (e) {
        console.error("Forgot password error:", e);
        return res.status(500).json({ error: "INTERNAL_ERROR", message: "Internal server error" });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({ error: "VALIDATION_ERROR", message: "Password must be at least 6 characters" });
        }

        // Get the access token from the request header
        const auth = req.headers.authorization || "";
        if (!auth.startsWith("Bearer ")) {
            return res.status(401).json({ error: "UNAUTHORIZED", message: "Missing or invalid token" });
        }

        const token = auth.slice(7).trim();

        // Create a temporary Supabase client with the token
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );

        // Set the session with the token
        const { error: sessionError } = await supabase.auth.setSession({ access_token: token, refresh_token: "" });
        if (sessionError) {
            return res.status(401).json({ error: "UNAUTHORIZED", message: "Invalid or expired session" });
        }

        // Update password
        const { data, error } = await supabase.auth.updateUser({ password });

        if (error) {
            console.error("Reset password error:", error);
            return res.status(400).json({ error: "UPDATE_FAILED", message: error.message });
        }

        return res.ok({
            message: "Password has been reset successfully",
            user: data.user
        });
    } catch (e) {
        console.error("Reset password error:", e);
        return res.status(500).json({ error: "INTERNAL_ERROR", message: "Internal server error" });
    }
};

export const logout = async (req, res) => {
    try {
        // Note: Since we're using JWT tokens, logout is primarily client-side
        // The client should remove the token from storage
        return res.ok({ message: "Logged out successfully" });
    } catch (e) {
        console.error("Logout error:", e);
        return res.status(500).json({ error: "INTERNAL_ERROR", message: "Internal server error" });
    }
};
