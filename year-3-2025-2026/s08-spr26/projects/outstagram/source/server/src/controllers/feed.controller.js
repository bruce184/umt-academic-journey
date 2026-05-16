import { db } from "../db/knex.js";
import { SystemConfigService } from "../services/system-config.service.js";

export async function getFeed(req, res, next) {
    try {
        const configuredPageSize = Number.parseInt(
            String(await SystemConfigService.getValue("posts_per_page", 20)),
            10
        );
        const safePageSize = Number.isInteger(configuredPageSize) && configuredPageSize > 0
            ? configuredPageSize
            : 20;
        const requestedLimit = Number.parseInt(req.query.limit || String(safePageSize), 10);
        const limit = Math.min(
            Number.isInteger(requestedLimit) && requestedLimit > 0 ? requestedLimit : safePageSize,
            safePageSize,
            50
        );
        const cursor = req.query.cursor ? new Date(req.query.cursor) : null;

        const currentUserId = req.userId; // Provided by auth middleware

        const rows = await db
            .select([
                "p.id",
                "p.owner_id",
                "p.caption",
                "p.created_at",
                "pr.username",
                "pr.display_name",
                "pr.avatar_url",
                // Media Array
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
            .where("p.is_deleted", false)
            .modify((qb) => {
                if (cursor) qb.andWhere("p.created_at", "<", cursor);
            })
            .orderBy("p.created_at", "desc")
            .limit(limit);

        const nextCursor = rows.length ? rows[rows.length - 1].created_at : null;
        return res.ok(
            { items: rows },
            { meta: { pagination: { limit, nextCursor } } }
        );
    } catch (e) {
        return next(e);
    }
}
