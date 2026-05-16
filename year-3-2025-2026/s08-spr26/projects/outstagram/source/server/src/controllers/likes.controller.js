import { db } from "../db/knex.js";

export const LikeController = {
    toggleLike: async (req, res, next) => {
        const { postId } = req.params;
        const userId = req.userId;

        try {
            await db.transaction(async (trx) => {
                const existing = await trx("public.post_likes")
                    .where({ post_id: postId, user_id: userId })
                    .first();

                if (existing) {
                    await trx("public.post_likes")
                        .where({ post_id: postId, user_id: userId })
                        .del();
                } else {
                    await trx("public.post_likes").insert({
                        post_id: postId,
                        user_id: userId,
                    });
                    // Notification is now created automatically by DB trigger
                }
            });

            return res.ok({ success: true });
        } catch (e) {
            return next(e);
        }
    }
};
