import { db } from "../db/knex.js";
import { errors } from "../utils/api-error.js";

function resolveQuery(req) {
    const rawQuery = req.query.q ?? req.params.query ?? "";
    return String(rawQuery).trim();
}

export const searchUsers = async (req, res, next) => {
    const query = resolveQuery(req);

    // Basic validation
    if (!query || query.length < 1 || query.length > 30) {
        return next(errors.validation("Invalid query length"));
    }

    try {
        const normalizedQuery = `%${query.toLowerCase()}%`;
        const users = await db("profiles")
            .select([
                "profiles.user_id",
                "profiles.username",
                "profiles.display_name",
                "profiles.avatar_url"
            ])
            .select(db.raw("(SELECT COUNT(*) FROM follows WHERE following_id = profiles.user_id)::int as follower_count"))
            .where((qb) => {
                qb.whereRaw("LOWER(profiles.username) LIKE ?", [normalizedQuery])
                    .orWhereRaw("LOWER(profiles.display_name) LIKE ?", [normalizedQuery]);
            })
            .orderBy("follower_count", "desc")
            .orderBy("profiles.username", "asc")
            .limit(10);

        return res.ok(users);
    } catch (e) {
        return next(e);
    }
};

export const searchPosts = async (req, res, next) => {
    const query = resolveQuery(req);
    const viewerId = req.userId || null;

    // Basic validation
    if (!query || query.length < 1 || query.length > 30) {
        return next(errors.validation("Invalid query length"));
    }

    try {
        const normalizedQuery = `%${query.toLowerCase()}%`;
        const posts = await db
            .select([
                "p.id",
                "p.owner_id",
                "p.caption",
                "p.created_at",
                "p.updated_at",
                "pr.username",
                "pr.display_name",
                "pr.avatar_url",
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
                db.raw(`(SELECT count(*) FROM public.post_likes l WHERE l.post_id = p.id)::int as like_count`),
                db.raw(`(SELECT count(*) FROM public.comments c WHERE c.post_id = p.id AND c.is_deleted = false)::int as comment_count`),
                db.raw(`
                    EXISTS(
                        SELECT 1 FROM public.post_likes pl
                        WHERE pl.post_id = p.id AND pl.user_id = ?
                    ) as liked_by_viewer
                `, [viewerId])
            ])
            .from({ p: "public.posts" })
            .join({ pr: "public.profiles" }, "pr.user_id", "p.owner_id")
            .where("p.is_deleted", false)
            .whereRaw("LOWER(COALESCE(p.caption, '')) LIKE ?", [normalizedQuery])
            .orderBy("created_at", "desc")
            .limit(10);

        return res.ok(posts);
    } catch (e) {
        return next(e);
    }
};
