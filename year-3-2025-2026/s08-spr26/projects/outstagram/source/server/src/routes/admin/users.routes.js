import { Router } from 'express';
import { db as knex } from '../../db/knex.js';
import { requireAdmin } from '../../middlewares/admin-auth.js';
import { errors } from '../../utils/api-error.js';

const router = Router();
const STAFF_ROLES = ['moderator', 'admin', 'super_admin'];
const CREATEABLE_ROLES = ['user', 'moderator', 'admin'];

// List users (paginated, searchable)
router.get('/', requireAdmin('admin'), async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search = '', include_staff = 'false' } = req.query;
        const offset = (page - 1) * limit;
        const canIncludeStaff = req.userRole === 'super_admin' && include_staff === 'true';

        const query = knex('profiles')
            .select('user_id', 'username', 'display_name', 'avatar_url', 'is_private', 'created_at', 'role', 'is_banned')
            .orderBy('created_at', 'desc');

        if (!canIncludeStaff) {
            query.whereNotIn('role', STAFF_ROLES);
        }

        if (search) {
            query.where((builder) => {
                builder.where('username', 'ilike', `%${search}%`)
                    .orWhere('display_name', 'ilike', `%${search}%`);
            });
        }

        const [{ count }] = await query.clone().clearSelect().clearOrder().count();
        const users = await query.limit(limit).offset(offset);

        res.json({
            message: 'Users fetched successfully',
            data: {
                users,
                total: parseInt(count, 10),
                page: parseInt(page, 10),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        next(error);
    }
});

// View user details
router.get('/:id', requireAdmin('admin'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const profile = await knex('profiles').where({ user_id: id }).first();
        if (!profile) return next(errors.notFound('User not found'));
        if (req.userRole !== 'super_admin' && STAFF_ROLES.includes(profile.role)) {
            return next(errors.forbidden('Only super admin can view staff accounts.'));
        }

        const [postsCount, followersCount, followingCount, commentsCount] = await Promise.all([
            knex('posts').where({ owner_id: id }).count('id as count').first(),
            knex('follows').where({ following_id: id }).count('* as count').first(),
            knex('follows').where({ follower_id: id }).count('* as count').first(),
            knex('comments').where({ user_id: id }).count('id as count').first(),
        ]);

        res.json({
            message: 'User details fetched successfully',
            data: {
                profile,
                stats: {
                    posts: parseInt(postsCount.count, 10),
                    followers: parseInt(followersCount.count, 10),
                    following: parseInt(followingCount.count, 10),
                    comments: parseInt(commentsCount.count, 10)
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

// Ban user
router.post('/:id/ban', requireAdmin('admin'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        // Cannot ban self or super_admins if you are admin
        const target = await knex('profiles').where({ user_id: id }).first();
        if (!target) return next(errors.notFound('User not found'));
        if (target.user_id === req.userId) return next(errors.forbidden("Cannot ban yourself"));
        if (req.userRole !== 'super_admin' && STAFF_ROLES.includes(target.role)) {
            return next(errors.forbidden('Only super admin can ban staff accounts.'));
        }
        if (target.role === 'super_admin' && req.userRole !== 'super_admin') {
            return next(errors.forbidden("Cannot ban a super admin"));
        }

        await knex('profiles').where({ user_id: id }).update({
            is_banned: true,
            banned_at: knex.fn.now(),
            banned_reason: reason || 'Violation of terms'
        });

        // Add audit log
        await knex('audit_logs').insert({
            actor_id: req.userId,
            action: 'user.ban',
            target_type: 'user',
            target_id: id,
            metadata: JSON.stringify({ reason })
        }).catch(err => console.error("Failed to insert audit log", err));

        res.json({ message: 'User banned successfully' });
    } catch (error) {
        next(error);
    }
});

// Unban user
router.post('/:id/unban', requireAdmin('admin'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const target = await knex('profiles').where({ user_id: id }).first();
        if (!target) return next(errors.notFound('User not found'));
        if (req.userRole !== 'super_admin' && STAFF_ROLES.includes(target.role)) {
            return next(errors.forbidden('Only super admin can unban staff accounts.'));
        }
        if (target.role === 'super_admin' && req.userRole !== 'super_admin') {
            return next(errors.forbidden("Cannot unban a super admin"));
        }

        await knex('profiles').where({ user_id: id }).update({
            is_banned: false,
            banned_at: null,
            banned_reason: null
        });

        // Add audit log
        await knex('audit_logs').insert({
            actor_id: req.userId,
            action: 'user.unban',
            target_type: 'user',
            target_id: id
        }).catch(err => console.error("Failed to insert audit log", err));

        res.json({ message: 'User unbanned successfully' });
    } catch (error) {
        next(error);
    }
});
// Create a new user (Admin+)
router.post('/', requireAdmin('admin'), async (req, res, next) => {
    try {
        const { email, username, display_name, password, role = 'user' } = req.body;

        if (!email || !username) {
            return next(errors.validation('Email and username are required.'));
        }
        if (!CREATEABLE_ROLES.includes(role)) {
            return next(errors.validation(`Invalid role. Must be one of: ${CREATEABLE_ROLES.join(', ')}`));
        }
        if (req.userRole !== 'super_admin' && role !== 'user') {
            return next(errors.forbidden('Only super admin can create staff accounts.'));
        }
        if (password && String(password).length < 6) {
            return next(errors.validation('Password must be at least 6 characters.'));
        }

        // Check if username already exists
        const existingUser = await knex('profiles').where({ username }).first();
        if (existingUser) {
            return next(errors.validation('Username already taken.'));
        }

        // Use Supabase Admin API (service role key) to create user — skips email confirmation
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseAdmin = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        const finalPassword = password || Math.random().toString(36).slice(-10) + 'A1!';

        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: finalPassword,
            email_confirm: true, // auto-confirm
            user_metadata: { username, display_name: display_name || username }
        });

        if (authError) {
            return next(errors.validation(authError.message));
        }

        // Supabase auth trigger already creates the profile row.
        // Merge here so super_admin-created staff accounts get the intended role.
        await knex('profiles')
            .insert({
                user_id: authData.user.id,
                username,
                display_name: display_name || username,
                role
            })
            .onConflict('user_id')
            .merge({
                username,
                display_name: display_name || username,
                role
            });

        // Audit log
        await knex('audit_logs').insert({
            actor_id: req.userId,
            action: 'user.create',
            target_type: 'user',
            target_id: authData.user.id,
            metadata: JSON.stringify({ email, username, role })
        }).catch(err => console.error('Failed to insert audit log', err));

        res.status(201).json({
            message: 'User created successfully',
            data: {
                user_id: authData.user.id,
                email,
                username,
                role,
                generated_password: password ? undefined : finalPassword
            }
        });
    } catch (error) {
        next(error);
    }
});

export default router;
