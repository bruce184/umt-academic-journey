import { Router } from 'express';
import { requireAdmin } from '../../middlewares/admin-auth.js';
import { db as knex } from '../../db/knex.js';

const router = Router();

// Dashboard Stats API
router.get('/stats', requireAdmin('moderator'), async (req, res, next) => {
    try {
        const [usersCountResult, postsCountResult, commentsCountResult, reportsCountResult] = await Promise.all([
            knex('profiles').count('user_id as count').first(),
            knex('posts').where({ is_deleted: false }).count('id as count').first(),
            knex('comments').where({ is_deleted: false }).count('id as count').first(),
            // Ensure this doesn't crash if reports table doesn't exist yet, but Phase 1 states we might not have reports fully implemented.
            // Let's use a try-catch for reports or omit if table is not planned yet. Wait, reports table was created in 20260204100000_create_reports_table.js.
            knex.schema.hasTable('reports').then(exists => exists ? knex('reports').where({ status: 'pending' }).count('id as count').first() : { count: 0 })
        ]);

        const totalUsers = parseInt(usersCountResult?.count || 0, 10);
        const totalPosts = parseInt(postsCountResult?.count || 0, 10);
        const totalComments = parseInt(commentsCountResult?.count || 0, 10);
        const totalReports = parseInt(reportsCountResult?.count || 0, 10);

        res.json({
            message: 'Dashboard stats fetched successfully',
            data: {
                totalUsers,
                totalPosts,
                totalComments,
                totalReports
            }
        });
    } catch (error) {
        next(error);
    }
});

// Chart: User growth (last 30 days)
router.get('/charts/user-growth', requireAdmin('moderator'), async (req, res, next) => {
    try {
        const rows = await knex.raw(`
            SELECT DATE(created_at) as date, COUNT(*) as count
            FROM profiles
            WHERE created_at >= NOW() - INTERVAL '30 days'
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `);
        // Fill in missing dates with 0
        const data = fillMissingDates(rows.rows, 30);
        res.json({ message: 'User growth data', data });
    } catch (error) {
        next(error);
    }
});

// Chart: Post activity (last 30 days)
router.get('/charts/post-activity', requireAdmin('moderator'), async (req, res, next) => {
    try {
        const rows = await knex.raw(`
            SELECT DATE(created_at) as date, COUNT(*) as count
            FROM posts
            WHERE created_at >= NOW() - INTERVAL '30 days' AND is_deleted = false
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `);
        const data = fillMissingDates(rows.rows, 30);
        res.json({ message: 'Post activity data', data });
    } catch (error) {
        next(error);
    }
});

// Chart: Engagement — likes + comments per day (last 30 days)
router.get('/charts/engagement', requireAdmin('moderator'), async (req, res, next) => {
    try {
        const [likesRows, commentsRows] = await Promise.all([
            knex.raw(`
                SELECT DATE(created_at) as date, COUNT(*) as count
                FROM post_likes
                WHERE created_at >= NOW() - INTERVAL '30 days'
                GROUP BY DATE(created_at)
                ORDER BY date ASC
            `).then(r => r.rows).catch(() => []),
            knex.raw(`
                SELECT DATE(created_at) as date, COUNT(*) as count
                FROM comments
                WHERE created_at >= NOW() - INTERVAL '30 days' AND is_deleted = false
                GROUP BY DATE(created_at)
                ORDER BY date ASC
            `).then(r => r.rows).catch(() => [])
        ]);

        const likesMap = Object.fromEntries(likesRows.map(r => [r.date, parseInt(r.count, 10)]));
        const commentsMap = Object.fromEntries(commentsRows.map(r => [r.date, parseInt(r.count, 10)]));

        const data = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            data.push({
                date: key,
                likes: likesMap[key] || 0,
                comments: commentsMap[key] || 0
            });
        }
        res.json({ message: 'Engagement data', data });
    } catch (error) {
        next(error);
    }
});

// Helper: fill missing dates with 0 count
function fillMissingDates(rows, days) {
    const map = Object.fromEntries(rows.map(r => [r.date instanceof Date ? r.date.toISOString().slice(0, 10) : String(r.date).slice(0, 10), parseInt(r.count, 10)]));
    const data = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        data.push({ date: key, count: map[key] || 0 });
    }
    return data;
}

export default router;
