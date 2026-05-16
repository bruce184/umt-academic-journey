import { Router } from 'express';
import { db as knex } from '../../db/knex.js';
import { requireAdmin } from '../../middlewares/admin-auth.js';

const router = Router();

// List audit logs
router.get('/', requireAdmin('admin'), async (req, res, next) => {
    try {
        const { page = 1, limit = 20, action, actor_id, actor_username, start_date, end_date } = req.query;
        const offset = (page - 1) * limit;

        const query = knex('audit_logs')
            .leftJoin('profiles', 'audit_logs.actor_id', 'profiles.user_id')
            .select(
                'audit_logs.id', 'audit_logs.action', 'audit_logs.target_type', 'audit_logs.target_id',
                'audit_logs.metadata', 'audit_logs.created_at',
                'profiles.username as actor_username', 'profiles.user_id as actor_id'
            )
            .orderBy('audit_logs.created_at', 'desc');

        if (action) {
            query.where('audit_logs.action', action);
        }
        if (actor_id) {
            query.where('audit_logs.actor_id', actor_id);
        }
        if (actor_username) {
            query.whereILike('profiles.username', `%${actor_username}%`);
        }
        if (start_date) {
            query.where('audit_logs.created_at', '>=', new Date(start_date));
        }
        if (end_date) {
            query.where('audit_logs.created_at', '<=', new Date(end_date));
        }

        const [{ count }] = await query.clone().clearSelect().clearOrder().count();
        const logs = await query.limit(limit).offset(offset);

        res.json({
            message: 'Audit logs fetched successfully',
            data: {
                logs,
                total: parseInt(count, 10),
                page: parseInt(page, 10),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        next(error);
    }
});

export default router;
