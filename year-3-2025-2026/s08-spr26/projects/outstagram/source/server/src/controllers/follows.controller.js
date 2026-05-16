import { db } from "../db/knex.js";
import { errors } from "../utils/api-error.js";

export const FollowController = {
    followUser: async (req, res, next) => {
        const followerId = req.userId;
        const followingId = req.params.userId || req.body?.userId;

        if (!followingId) {
            return next(errors.validation("Missing userId to follow"));
        }
        if (followingId === followerId) {
            return next(errors.validation("Cannot follow yourself"));
        }

        try {
            const existing = await db("public.follows")
                .where({ follower_id: followerId, following_id: followingId })
                .first();

            if (existing) {
                return res.ok({ following: true }, { status: 200 });
            }

            await db("public.follows").insert({
                follower_id: followerId,
                following_id: followingId
            });

            // Notification is now created automatically by DB trigger

            return res.ok({ following: true }, { status: 201 });
        } catch (e) {
            return next(e);
        }
    },

    unfollowUser: async (req, res, next) => {
        const followerId = req.userId;
        const followingId = req.params.userId || req.body?.userId;

        if (!followingId) {
            return next(errors.validation("Missing userId to unfollow"));
        }

        try {
            await db("public.follows")
                .where({ follower_id: followerId, following_id: followingId })
                .del();
            return res.ok({ following: false });
        } catch (e) {
            return next(e);
        }
    },
};
