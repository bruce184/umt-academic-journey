import { db } from "../db/knex.js";
import { errors } from "../utils/api-error.js";
import { SystemConfigService } from "../services/system-config.service.js";

export const CommentController = {
    getComments: async (req, res, next) => {
        const { postId } = req.params;
        const userId = req.userId;
        try {
            const comments = await db("public.comments")
                .select([
                    "comments.id",
                    "comments.content",
                    "comments.created_at",
                    "comments.parent_id",
                    "comments.post_id",
                    "profiles.username",
                    "profiles.display_name",
                    "profiles.avatar_url",
                    "comments.user_id",
                    db.raw(`(SELECT COUNT(*) FROM public.comment_likes cl WHERE cl.comment_id = comments.id)::int as like_count`),
                    db.raw(`EXISTS(SELECT 1 FROM public.comment_likes cl WHERE cl.comment_id = comments.id AND cl.user_id = ?) as liked_by_viewer`, [userId])
                ])
                .join("public.profiles", "comments.user_id", "profiles.user_id")
                .where("comments.post_id", postId)
                .andWhere("comments.is_deleted", false)
                .orderBy("comments.created_at", "asc");

            const byParent = new Map();

            comments.forEach((comment) => {
                const key = comment.parent_id ?? "root";
                if (!byParent.has(key)) byParent.set(key, []);
                byParent.get(key).push({ ...comment, replies: [] });
            });

            const buildTree = (parentId = "root") => (byParent.get(parentId) || []).map((comment) => ({
                ...comment,
                replies: buildTree(comment.id),
            }));

            return res.ok({ comments: buildTree() });
        } catch (e) {
            return next(e);
        }
    },

    createComment: async (req, res, next) => {
        const { postId } = req.params;
        const userId = req.userId;
        const { content, parent_id } = req.body;

        if (!content || !content.trim()) {
            return next(errors.validation("Comment cannot be empty"));
        }

        try {
            const allowComments = await SystemConfigService.getValue("allow_comments", true);
            if (!allowComments) {
                return next(errors.forbidden("Comments are currently disabled by the administrator."));
            }

            if (parent_id) {
                const parentComment = await db("public.comments")
                    .where({ id: parent_id, post_id: postId, is_deleted: false })
                    .first();

                if (!parentComment) {
                    return next(errors.notFound("Parent comment not found"));
                }
            }

            const [comment] = await db("public.comments")
                .insert({
                    post_id: postId,
                    user_id: userId,
                    content: content.trim(),
                    parent_id: parent_id || null,
                })
                .returning("*");

            // Notification is now created automatically by DB trigger

            // Enrich with profile for immediate display
            const profile = await db("public.profiles").where("user_id", userId).first();

            return res.ok(
                {
                    comment: {
                        ...comment,
                        username: profile.username,
                        display_name: profile.display_name,
                        avatar_url: profile.avatar_url,
                        like_count: 0,
                        liked_by_viewer: false,
                        replies: [],
                    }
                },
                { status: 201 }
            );
        } catch (e) {
            return next(e);
        }
    },

    toggleCommentLike: async (req, res, next) => {
        const commentId = Number.parseInt(req.params.commentId, 10);
        const userId = req.userId;

        if (!Number.isInteger(commentId) || commentId <= 0) {
            return next(errors.validation("Invalid comment id"));
        }

        try {
            const comment = await db("public.comments")
                .where({ id: commentId, is_deleted: false })
                .first();

            if (!comment) {
                return next(errors.notFound("Comment not found"));
            }

            const existing = await db("public.comment_likes")
                .where({ comment_id: commentId, user_id: userId })
                .first();

            let liked;
            if (existing) {
                await db("public.comment_likes")
                    .where({ comment_id: commentId, user_id: userId })
                    .del();
                liked = false;
            } else {
                await db("public.comment_likes").insert({
                    comment_id: commentId,
                    user_id: userId,
                });
                liked = true;
            }

            const result = await db("public.comment_likes")
                .where({ comment_id: commentId })
                .count("* as count")
                .first();

            return res.ok({
                liked,
                like_count: Number.parseInt(result?.count || 0, 10),
            });
        } catch (e) {
            return next(e);
        }
    },

    reportComment: async (req, res, next) => {
        const commentId = Number.parseInt(req.params.commentId, 10);
        const reporterId = req.userId;
        const { reason } = req.body;

        if (!Number.isInteger(commentId) || commentId <= 0) {
            return next(errors.validation("Invalid comment id"));
        }

        if (!reason || !String(reason).trim()) {
            return next(errors.validation("Report reason is required"));
        }

        try {
            const comment = await db("public.comments")
                .join("public.profiles", "comments.user_id", "profiles.user_id")
                .select(
                    "comments.id",
                    "comments.user_id",
                    "comments.content",
                    "profiles.username"
                )
                .where("comments.id", commentId)
                .andWhere("comments.is_deleted", false)
                .first();

            if (!comment) {
                return next(errors.notFound("Comment not found"));
            }

            const existing = await db("public.reports")
                .where({
                    reporter_id: reporterId,
                    target_type: "comment",
                    target_id: String(commentId),
                    status: "pending",
                })
                .first();

            if (existing) {
                return res.ok({
                    report: existing,
                    already_reported: true,
                    target_username: comment.username,
                });
            }

            const [report] = await db("public.reports")
                .insert({
                    reporter_id: reporterId,
                    target_type: "comment",
                    target_id: String(commentId),
                    reason: String(reason).trim(),
                    status: "pending",
                })
                .returning("*");

            return res.ok(
                {
                    report,
                    already_reported: false,
                    target_username: comment.username,
                },
                { status: 201 }
            );
        } catch (e) {
            return next(e);
        }
    },

    deleteComment: (req, res) => res.ok({ message: "Delete comment - TODO" }),
};
