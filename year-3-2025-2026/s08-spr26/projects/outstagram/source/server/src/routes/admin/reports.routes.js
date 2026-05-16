import { Router } from 'express';
import { db as knex } from '../../db/knex.js';
import { requireAdmin } from '../../middlewares/admin-auth.js';
import { errors } from '../../utils/api-error.js';

const router = Router();

async function appendAuditLog(actorId, action, targetId, metadata = {}) {
    await knex('audit_logs').insert({
        actor_id: actorId,
        action,
        target_type: 'report',
        target_id: String(targetId),
        metadata: JSON.stringify(metadata)
    }).catch((err) => console.error('Failed to insert audit log', err));
}

async function getReportRecord(id) {
    return knex('reports')
        .leftJoin('profiles as reporter', 'reports.reporter_id', 'reporter.user_id')
        .leftJoin('profiles as resolver', 'reports.resolved_by', 'resolver.user_id')
        .select(
            'reports.id',
            'reports.target_type',
            'reports.target_id',
            'reports.reason',
            'reports.status',
            'reports.created_at',
            'reports.resolved_at',
            'reporter.user_id as reporter_id',
            'reporter.username as reporter_username',
            'resolver.username as resolved_by_username'
        )
        .where('reports.id', id)
        .first();
}

function parseProblemReason(reason = '') {
    const match = String(reason).match(/^\[(.+?)\]\s*(.*?)(?:\s*\|\s*page:\s*(.+))?$/);
    if (!match) {
        return {
            category: 'general',
            description: String(reason),
            page: ''
        };
    }

    return {
        category: match[1] || 'general',
        description: match[2] || '',
        page: match[3] || ''
    };
}

async function fetchTargetReportInsights(report, problemContext = null) {
    let countsQuery = knex('reports').select('status').count('* as count').groupBy('status');
    let recentQuery = knex('reports')
        .leftJoin('profiles as reporter', 'reports.reporter_id', 'reporter.user_id')
        .leftJoin('profiles as resolver', 'reports.resolved_by', 'resolver.user_id')
        .select(
            'reports.id',
            'reports.reason',
            'reports.status',
            'reports.created_at',
            'reporter.username as reporter_username',
            'resolver.username as resolved_by_username'
        )
        .orderBy('reports.created_at', 'desc')
        .limit(5);

    if (report.target_type === 'problem') {
        countsQuery = countsQuery.where('reports.target_type', 'problem');
        recentQuery = recentQuery.where('reports.target_type', 'problem');

        if (problemContext?.page) {
            countsQuery = countsQuery.whereILike('reports.reason', `%| page: ${problemContext.page}%`);
            recentQuery = recentQuery.whereILike('reports.reason', `%| page: ${problemContext.page}%`);
        } else if (problemContext?.category) {
            countsQuery = countsQuery.whereILike('reports.reason', `[${problemContext.category}]%`);
            recentQuery = recentQuery.whereILike('reports.reason', `[${problemContext.category}]%`);
        }
    } else {
        countsQuery = countsQuery.where({
            'reports.target_type': report.target_type,
            'reports.target_id': String(report.target_id)
        });
        recentQuery = recentQuery.where({
            'reports.target_type': report.target_type,
            'reports.target_id': String(report.target_id)
        });
    }

    const [countRows, recent] = await Promise.all([countsQuery, recentQuery]);
    const counts = {
        total: 0,
        pending: 0,
        resolved: 0,
        dismissed: 0
    };

    countRows.forEach((row) => {
        const count = Number.parseInt(row.count || 0, 10);
        counts.total += count;
        counts[row.status] = count;
    });

    return { counts, recent };
}

async function fetchPostMedia(postId) {
    return knex('post_media')
        .select('id', 'media_type', 'media_url')
        .where('post_id', postId)
        .orderBy('position', 'asc');
}

async function fetchPostSummary(postId) {
    const post = await knex('posts as p')
        .leftJoin('profiles as owner', 'p.owner_id', 'owner.user_id')
        .select(
            'p.id',
            'p.caption',
            'p.is_deleted',
            'p.created_at',
            'owner.user_id as owner_id',
            'owner.username as owner_username',
            'owner.display_name as owner_display_name',
            'owner.avatar_url as owner_avatar_url',
            'owner.role as owner_role',
            'owner.is_banned as owner_is_banned'
        )
        .where('p.id', postId)
        .first();

    if (!post) return null;

    const [media, likesCount, commentsCount] = await Promise.all([
        fetchPostMedia(postId),
        knex('post_likes').where({ post_id: postId }).count('user_id as count').first(),
        knex('comments').where({ post_id: postId, is_deleted: false }).count('id as count').first()
    ]);

    return {
        ...post,
        media,
        stats: {
            likes: Number.parseInt(likesCount?.count || 0, 10),
            comments: Number.parseInt(commentsCount?.count || 0, 10)
        }
    };
}

async function buildTargetDetails(report) {
    switch (report.target_type) {
        case 'post':
            return fetchPostSummary(report.target_id);

        case 'comment': {
            const comment = await knex('comments as c')
                .leftJoin('profiles as author', 'c.user_id', 'author.user_id')
                .select(
                    'c.id',
                    'c.post_id',
                    'c.content',
                    'c.parent_id',
                    'c.is_deleted',
                    'c.created_at',
                    'author.user_id as author_id',
                    'author.username as author_username',
                    'author.display_name as author_display_name',
                    'author.avatar_url as author_avatar_url',
                    'author.role as author_role',
                    'author.is_banned as author_is_banned'
                )
                .where('c.id', report.target_id)
                .first();

            if (!comment) return null;

            const post = await fetchPostSummary(comment.post_id);

            return {
                ...comment,
                post
            };
        }

        case 'user': {
            const profile = await knex('profiles')
                .select(
                    'user_id',
                    'username',
                    'display_name',
                    'avatar_url',
                    'bio',
                    'role',
                    'is_private',
                    'is_banned',
                    'banned_reason',
                    'created_at'
                )
                .where('user_id', report.target_id)
                .first();

            if (!profile) return null;

            const recentPosts = await knex('posts')
                .select('id', 'caption', 'created_at', 'is_deleted')
                .where({ owner_id: profile.user_id })
                .orderBy('created_at', 'desc')
                .limit(3);

            const recentPostsWithMedia = await Promise.all(
                recentPosts.map(async (post) => ({
                    ...post,
                    media: await fetchPostMedia(post.id)
                }))
            );

            const [postsCount, reportsCount, followersCount, followingCount, commentsCount] = await Promise.all([
                knex('posts').where({ owner_id: profile.user_id, is_deleted: false }).count('id as count').first(),
                knex('reports').where({ target_type: 'user', target_id: String(profile.user_id), status: 'pending' }).count('id as count').first(),
                knex('follows').where({ following_id: profile.user_id }).count('* as count').first(),
                knex('follows').where({ follower_id: profile.user_id }).count('* as count').first(),
                knex('comments').where({ user_id: profile.user_id, is_deleted: false }).count('id as count').first()
            ]);

            return {
                ...profile,
                active_posts: Number.parseInt(postsCount?.count || 0, 10),
                pending_reports: Number.parseInt(reportsCount?.count || 0, 10),
                followers: Number.parseInt(followersCount?.count || 0, 10),
                following: Number.parseInt(followingCount?.count || 0, 10),
                active_comments: Number.parseInt(commentsCount?.count || 0, 10),
                recent_posts: recentPostsWithMedia
            };
        }

        case 'story': {
            const story = await knex('stories as s')
                .leftJoin('profiles as owner', 's.owner_id', 'owner.user_id')
                .select(
                    's.id',
                    's.caption',
                    's.media_type',
                    's.media_url',
                    's.is_deleted',
                    's.created_at',
                    's.expires_at',
                    'owner.user_id as owner_id',
                    'owner.username as owner_username',
                    'owner.display_name as owner_display_name',
                    'owner.avatar_url as owner_avatar_url',
                    'owner.role as owner_role',
                    'owner.is_banned as owner_is_banned'
                )
                .where('s.id', report.target_id)
                .first();

            if (!story) return null;

            const viewsCount = await knex('story_views').where({ story_id: report.target_id }).count('id as count').first();

            return {
                ...story,
                views: Number.parseInt(viewsCount?.count || 0, 10)
            };
        }

        case 'problem':
            return parseProblemReason(report.reason);

        default:
            return null;
    }
}

async function resolveReport(id, userId, status) {
    await knex('reports').where({ id }).update({
        status,
        resolved_by: userId,
        resolved_at: knex.fn.now()
    });
}

async function reopenReport(id) {
    await knex('reports').where({ id }).update({
        status: 'pending',
        resolved_by: null,
        resolved_at: null
    });
}

const REPORT_CLOSING_ACTIONS = new Set(['remove_post', 'remove_comment', 'remove_story', 'ban_user']);
const TARGET_RESTORE_ACTIONS = new Set(['restore_post', 'restore_comment', 'restore_story', 'unban_user']);

// List reports (paginated, filterable)
router.get('/', requireAdmin('moderator'), async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status, target_type } = req.query;
        const offset = (page - 1) * limit;

        const query = knex('reports')
            .leftJoin('profiles as reporter', 'reports.reporter_id', 'reporter.user_id')
            .leftJoin('profiles as resolver', 'reports.resolved_by', 'resolver.user_id')
            .select(
                'reports.id', 'reports.target_type', 'reports.target_id',
                'reports.reason', 'reports.status', 'reports.created_at',
                'reports.resolved_at',
                'reporter.username as reporter_username',
                'resolver.username as resolved_by_username'
            )
            .orderBy('reports.created_at', 'desc');

        if (status) {
            query.where('reports.status', status);
        }
        if (target_type) {
            query.where('reports.target_type', target_type);
        }

        const [{ count }] = await query.clone().clearSelect().clearOrder().count();
        const reports = await query.limit(limit).offset(offset);

        res.json({
            message: 'Reports fetched successfully',
            data: {
                reports,
                total: parseInt(count, 10),
                page: parseInt(page, 10),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        next(error);
    }
});

// Report details for review workflow
router.get('/:id', requireAdmin('moderator'), async (req, res, next) => {
    try {
        const report = await getReportRecord(req.params.id);
        if (!report) return next(errors.notFound('Report not found'));

        const target = await buildTargetDetails(report);
        const reportInsights = await fetchTargetReportInsights(
            report,
            report.target_type === 'problem' ? target : null
        );

        res.json({
            message: 'Report details fetched successfully',
            data: {
                report,
                target,
                insights: reportInsights
            }
        });
    } catch (error) {
        next(error);
    }
});

// Moderate the reported target and resolve the report
router.patch('/:id/moderate', requireAdmin('moderator'), async (req, res, next) => {
    try {
        const { action } = req.body;
        const report = await knex('reports').where({ id: req.params.id }).first();

        if (!report) return next(errors.notFound('Report not found'));
        if (!action) {
            return next(errors.validation('Moderation action is required.'));
        }
        if (REPORT_CLOSING_ACTIONS.has(action) && report.status !== 'pending') {
            return next(errors.forbidden('Report has already been processed. Reopen it before taking a new moderation action.'));
        }

        let moderationSummary = {};

        if (action === 'remove_post' && report.target_type === 'post') {
            const post = await knex('posts').where({ id: report.target_id }).first();
            if (!post) return next(errors.notFound('Post not found'));

            if (!post.is_deleted) {
                await knex('posts').where({ id: report.target_id }).update({ is_deleted: true });
            }

            moderationSummary = { action, removed: true, already_removed: Boolean(post.is_deleted) };
        } else if (action === 'restore_post' && report.target_type === 'post') {
            const post = await knex('posts').where({ id: report.target_id }).first();
            if (!post) return next(errors.notFound('Post not found'));
            if (!post.is_deleted) {
                return next(errors.validation('Post is already active.'));
            }

            await knex('posts').where({ id: report.target_id }).update({ is_deleted: false });
            moderationSummary = { action, restored: true };
        } else if (action === 'remove_comment' && report.target_type === 'comment') {
            const comment = await knex('comments').where({ id: report.target_id }).first();
            if (!comment) return next(errors.notFound('Comment not found'));

            if (!comment.is_deleted) {
                await knex('comments').where({ id: report.target_id }).update({ is_deleted: true });
            }

            moderationSummary = { action, removed: true, already_removed: Boolean(comment.is_deleted), post_id: comment.post_id };
        } else if (action === 'restore_comment' && report.target_type === 'comment') {
            const comment = await knex('comments').where({ id: report.target_id }).first();
            if (!comment) return next(errors.notFound('Comment not found'));
            if (!comment.is_deleted) {
                return next(errors.validation('Comment is already active.'));
            }

            await knex('comments').where({ id: report.target_id }).update({ is_deleted: false });
            moderationSummary = { action, restored: true, post_id: comment.post_id };
        } else if (action === 'remove_story' && report.target_type === 'story') {
            const story = await knex('stories').where({ id: report.target_id }).first();
            if (!story) return next(errors.notFound('Story not found'));

            if (!story.is_deleted) {
                await knex('stories').where({ id: report.target_id }).update({ is_deleted: true });
            }

            moderationSummary = { action, removed: true, already_removed: Boolean(story.is_deleted) };
        } else if (action === 'restore_story' && report.target_type === 'story') {
            const story = await knex('stories').where({ id: report.target_id }).first();
            if (!story) return next(errors.notFound('Story not found'));
            if (!story.is_deleted) {
                return next(errors.validation('Story is already active.'));
            }

            await knex('stories').where({ id: report.target_id }).update({ is_deleted: false });
            moderationSummary = { action, restored: true };
        } else if (action === 'ban_user' && report.target_type === 'user') {
            if (!['admin', 'super_admin'].includes(req.userRole)) {
                return next(errors.forbidden('Only admin or super admin can ban users from reports.'));
            }

            const profile = await knex('profiles').where({ user_id: report.target_id }).first();
            if (!profile) return next(errors.notFound('User not found'));
            if (profile.user_id === req.userId) {
                return next(errors.forbidden('Cannot ban yourself.'));
            }
            if (profile.role === 'super_admin' && req.userRole !== 'super_admin') {
                return next(errors.forbidden('Cannot ban a super admin.'));
            }

            if (!profile.is_banned) {
                await knex('profiles').where({ user_id: report.target_id }).update({
                    is_banned: true,
                    banned_at: knex.fn.now(),
                    banned_reason: `Moderated from report #${report.id}`
                });
            }

            moderationSummary = { action, banned: true, already_banned: Boolean(profile.is_banned) };
        } else if (action === 'unban_user' && report.target_type === 'user') {
            if (!['admin', 'super_admin'].includes(req.userRole)) {
                return next(errors.forbidden('Only admin or super admin can unban users from reports.'));
            }

            const profile = await knex('profiles').where({ user_id: report.target_id }).first();
            if (!profile) return next(errors.notFound('User not found'));
            if (profile.role === 'super_admin' && req.userRole !== 'super_admin') {
                return next(errors.forbidden('Cannot unban a super admin.'));
            }
            if (!profile.is_banned) {
                return next(errors.validation('User is already active.'));
            }

            await knex('profiles').where({ user_id: report.target_id }).update({
                is_banned: false,
                banned_at: null,
                banned_reason: null
            });

            moderationSummary = { action, restored: true };
        } else {
            return next(errors.validation('Invalid moderation action for this report.'));
        }

        if (REPORT_CLOSING_ACTIONS.has(action)) {
            await resolveReport(report.id, req.userId, 'resolved');
        }

        await appendAuditLog(
            req.userId,
            TARGET_RESTORE_ACTIONS.has(action) ? 'report.restore_target' : 'report.moderate',
            report.id,
            {
            action,
            report_id: report.id,
            target_type: report.target_type,
            target_id: report.target_id
            }
        );

        res.json({
            message: TARGET_RESTORE_ACTIONS.has(action)
                ? 'Target restored successfully'
                : 'Report moderated and resolved successfully',
            data: {
                moderation: moderationSummary,
                report_status: REPORT_CLOSING_ACTIONS.has(action) ? 'resolved' : report.status
            }
        });
    } catch (error) {
        next(error);
    }
});

// Resolve a report without target action
router.patch('/:id/resolve', requireAdmin('moderator'), async (req, res, next) => {
    try {
        const report = await knex('reports').where({ id: req.params.id }).first();
        if (!report) return next(errors.notFound('Report not found'));
        if (report.status !== 'pending') {
            return next(errors.forbidden('Report has already been processed.'));
        }

        await resolveReport(report.id, req.userId, 'resolved');
        await appendAuditLog(req.userId, 'report.resolve', report.id, {
            reason: report.reason,
            target_type: report.target_type,
            target_id: report.target_id
        });

        res.json({ message: 'Report resolved successfully' });
    } catch (error) {
        next(error);
    }
});

// Dismiss a report
router.patch('/:id/dismiss', requireAdmin('moderator'), async (req, res, next) => {
    try {
        const report = await knex('reports').where({ id: req.params.id }).first();
        if (!report) return next(errors.notFound('Report not found'));
        if (report.status !== 'pending') {
            return next(errors.forbidden('Report has already been processed.'));
        }

        await resolveReport(report.id, req.userId, 'dismissed');
        await appendAuditLog(req.userId, 'report.dismiss', report.id, {
            reason: report.reason,
            target_type: report.target_type,
            target_id: report.target_id
        });

        res.json({ message: 'Report dismissed successfully' });
    } catch (error) {
        next(error);
    }
});

// Reopen a processed report for review again
router.patch('/:id/reopen', requireAdmin('moderator'), async (req, res, next) => {
    try {
        const report = await knex('reports').where({ id: req.params.id }).first();
        if (!report) return next(errors.notFound('Report not found'));
        if (report.status === 'pending') {
            return next(errors.forbidden('Report is already pending review.'));
        }

        await reopenReport(report.id);
        await appendAuditLog(req.userId, 'report.reopen', report.id, {
            previous_status: report.status,
            target_type: report.target_type,
            target_id: report.target_id
        });

        res.json({
            message: 'Report reopened successfully',
            data: {
                status: 'pending'
            }
        });
    } catch (error) {
        next(error);
    }
});

export default router;
