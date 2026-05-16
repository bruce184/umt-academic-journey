import { db } from "../db/knex.js";
import { errors } from "../utils/api-error.js";

function normalizeMedia(media) {
    if (!Array.isArray(media) || media.length === 0) return [];
    return media.map((m, i) => ({
        media_type: m.media_type === "video" ? "video" : "image",
        media_url: String(m.media_url || "").trim(),
        media_path: m.media_path ? String(m.media_path).trim() : null,
        position: Number.isInteger(m.position) ? m.position : i,
    }));
}

export async function createPost(req, res, next) {
    const ownerId = req.user.id;

    try {
        const caption = (req.body.caption ?? "").toString();

        // Strict caption length check
        if (caption.length > 2200) {
            return res.status(400).json({ error: "VALIDATION_ERROR", message: "Caption cannot exceed 2200 characters" });
        }

        const media = normalizeMedia(req.body.media);

        if (media.length === 0) {
            return res.status(400).json({ error: "VALIDATION_ERROR", message: "Post must have at least 1 media item" });
        }
        if (media.some((m) => !m.media_url)) {
            return res.status(400).json({ error: "VALIDATION_ERROR", message: "Each media must have media_url" });
        }

        const pos = new Set(media.map((m) => m.position));
        if (pos.size !== media.length) {
            return res.status(400).json({ error: "VALIDATION_ERROR", message: "Media positions must be unique" });
        }

        const post = await db.transaction(async (trx) => {
            const [p] = await trx("public.posts")
                .insert([{ owner_id: ownerId, caption }])
                .returning(["id", "owner_id", "caption", "created_at"]);

            await trx("public.post_media").insert(
                media.map((m) => ({
                    post_id: p.id,
                    media_type: m.media_type,
                    media_url: m.media_url,
                    media_path: m.media_path,
                    position: m.position,
                }))
            );

            return p;
        });

        return res.ok({ post }, { status: 201 });
    } catch (e) {
        if (e?.code === "23505") {
            return res.status(409).json({ error: "DUPLICATE_ERROR", message: "Duplicate media position" });
        }
        console.error("Create post error:", e);
        return res.status(500).json({ error: "CREATE_POST_FAILED", message: String(e?.message || e) });
    }
}

export async function getPostById(req, res, next) {
    const { id } = req.params;
    const currentUserId = req.userId;

    try {
        const post = await db
            .select([
                "p.id",
                "p.owner_id",
                "p.caption",
                "p.created_at",
                "pr.username",
                "pr.display_name",
                "pr.avatar_url",
                // Media
                db.raw(`
                    COALESCE(
                        (
                            SELECT json_agg(json_build_object(
                                'url', pm.media_url,
                                'type', pm.media_type,
                                'position', pm.position
                            ) ORDER BY pm.position ASC)
                            FROM public.post_media pm
                            WHERE pm.post_id = p.id
                        ),
                        '[]'
                    ) as media
                `),
                // Counts
                db.raw(`(select count(*) from public.post_likes l where l.post_id = p.id)::int as like_count`),
                db.raw(`(select count(*) from public.comments c where c.post_id = p.id and c.is_deleted=false)::int as comment_count`),
                // Liked By Viewer
                db.raw(`
                    EXISTS(
                        SELECT 1 FROM public.post_likes pl 
                        WHERE pl.post_id = p.id AND pl.user_id = ?
                    ) as liked_by_viewer
                `, [currentUserId])
            ])
            .from({ p: "public.posts" })
            .join({ pr: "public.profiles" }, "pr.user_id", "p.owner_id")
            .where("p.id", id)
            .andWhere("p.is_deleted", false)
            .first();

        if (!post) {
            return next(errors.notFound("Post not found"));
        }

        return res.ok({ post });
    } catch (e) {
        console.error("Get post error:", e);
        return res.status(500).json({ error: "GET_POST_FAILED", message: String(e?.message || e) });
    }
}

export async function deletePost(req, res, next) {
    const { id } = req.params;
    const ownerId = req.user.id;

    try {
        const post = await db("public.posts").where("id", id).first();
        if (!post) return next(errors.notFound("Post not found"));

        if (post.owner_id !== ownerId) {
            return next(errors.forbidden("Not authorized to delete this post"));
        }

        await db("public.posts").where("id", id).update({ is_deleted: true });
        return res.ok({ message: "Post deleted" });
    } catch (e) {
        console.error("Delete post error:", e);
        return res.status(500).json({ error: "DELETE_FAILED", message: e.message });
    }
}

export async function updatePost(req, res, next) {
    const { id } = req.params;
    const ownerId = req.user.id;
    const { caption } = req.body;

    try {
        const post = await db("public.posts").where("id", id).first();
        if (!post) return next(errors.notFound("Post not found"));

        if (post.owner_id !== ownerId) {
            return next(errors.forbidden("Not authorized to edit this post"));
        }

        if (caption !== undefined && caption.length > 2200) {
            return res.status(400).json({ error: "VALIDATION_ERROR", message: "Caption cannot exceed 2200 characters" });
        }

        const [updated] = await db("public.posts")
            .where("id", id)
            .update({ caption, updated_at: db.fn.now() })
            .returning("*");

        return res.ok({ post: updated });
    } catch (e) {
        console.error("Update post error:", e);
        return res.status(500).json({ error: "UPDATE_FAILED", message: e.message });
    }
}

export async function reportPost(req, res, next) {
    const postId = Number.parseInt(req.params.id, 10);
    const reporterId = req.userId;
    const { reason } = req.body;

    if (!Number.isInteger(postId) || postId <= 0) {
        return next(errors.validation("Invalid post id"));
    }

    if (!reason || !String(reason).trim()) {
        return next(errors.validation("Report reason is required"));
    }

    try {
        const post = await db("public.posts")
            .join("public.profiles", "posts.owner_id", "profiles.user_id")
            .select(
                "posts.id",
                "posts.owner_id",
                "profiles.username"
            )
            .where({ "posts.id": postId, "posts.is_deleted": false })
            .first();

        if (!post) {
            return next(errors.notFound("Post not found"));
        }

        const existing = await db("public.reports")
            .where({
                reporter_id: reporterId,
                target_type: "post",
                target_id: String(postId),
                status: "pending",
            })
            .first();

        if (existing) {
            return res.ok({
                report: existing,
                already_reported: true,
                target_username: post.username,
            });
        }

        const [report] = await db("public.reports")
            .insert({
                reporter_id: reporterId,
                target_type: "post",
                target_id: String(postId),
                reason: String(reason).trim(),
                status: "pending",
            })
            .returning("*");

        return res.ok(
            {
                report,
                already_reported: false,
                target_username: post.username,
            },
            { status: 201 }
        );
    } catch (e) {
        console.error("Report post error:", e);
        return next(errors.internal("Unable to submit report"));
    }
}
