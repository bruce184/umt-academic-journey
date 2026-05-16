import { Router } from 'express';
import { db as knex } from '../../db/knex.js';
import { requireAdmin } from '../../middlewares/admin-auth.js';
import { errors } from '../../utils/api-error.js';

const router = Router();

const VALID_ROLES = ['user', 'moderator', 'admin', 'super_admin'];

// List all users for role management
router.get('/admins', requireAdmin('super_admin'), async (req, res, next) => {
    try {
        const users = await knex('profiles')
            .select('user_id', 'username', 'display_name', 'avatar_url', 'role', 'created_at')
            .orderBy('created_at', 'desc');

        res.json({
            message: 'Users fetched successfully for role management',
            data: { users }
        });
    } catch (error) {
        next(error);
    }
});

// Change a user's role (Super Admin only)
router.patch('/:id/role', requireAdmin('super_admin'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!role || !VALID_ROLES.includes(role)) {
            return next(errors.validation(`Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`));
        }

        const target = await knex('profiles').where({ user_id: id }).first();
        if (!target) return next(errors.notFound('User not found'));

        // Cannot change own role
        if (target.user_id === req.userId) {
            return next(errors.forbidden('Cannot change your own role.'));
        }

        if (target.role === 'super_admin' && role !== 'super_admin') {
            const [{ count }] = await knex('profiles')
                .where({ role: 'super_admin' })
                .count('* as count');

            if (Number.parseInt(count, 10) <= 1) {
                return next(errors.forbidden('Cannot demote the last super admin.'));
            }
        }

        const oldRole = target.role;
        await knex('profiles').where({ user_id: id }).update({ role });

        await knex('audit_logs').insert({
            actor_id: req.userId,
            action: 'user.role_change',
            target_type: 'user',
            target_id: id,
            metadata: JSON.stringify({ old_role: oldRole, new_role: role })
        }).catch(err => console.error('Failed to insert audit log', err));

        res.json({ message: `User role updated to ${role} successfully` });
    } catch (error) {
        next(error);
    }
});

export default router;
