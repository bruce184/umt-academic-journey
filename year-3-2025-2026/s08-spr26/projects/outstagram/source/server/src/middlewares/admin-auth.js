import { db as knex } from '../db/knex.js';
import { errors } from '../utils/api-error.js';

const ROLE_HIERARCHY = {
    user: 0,
    moderator: 1,
    admin: 2,
    super_admin: 3
};

/**
 * Middleware to check if the user has an admin role of minRole or higher.
 * Must be used AFTER requireAuth middleware (which sets req.userId).
 * 
 * @param {'moderator' | 'admin' | 'super_admin'} minRole 
 */
export function requireAdmin(minRole = 'admin') {
    return async (req, res, next) => {
        try {
            if (!req.userId) {
                return next(errors.authMissingToken('User ID not found. Ensure requireAuth is called before requireAdmin.'));
            }

            const profile = await knex('profiles')
                .select('role', 'is_banned', 'banned_reason')
                .where({ user_id: req.userId })
                .first();

            if (!profile) {
                return next(errors.forbidden('User profile not found.'));
            }

            if (profile.is_banned) {
                return next(errors.forbidden(`Your account has been banned. Reason: ${profile.banned_reason || 'N/A'}`));
            }

            const userRoleWeight = ROLE_HIERARCHY[profile.role] || 0;
            const requiredRoleWeight = ROLE_HIERARCHY[minRole] || 2;

            if (userRoleWeight < requiredRoleWeight) {
                return next(errors.forbidden(`Insufficient permissions. Required role: ${minRole}. Your role: ${profile.role}`));
            }

            // Bind role to request for downstream use
            req.userRole = profile.role;
            next();
        } catch (error) {
            console.error('[requireAdmin] Error:', error);
            next(errors.internal('Failed to verify admin privileges.'));
        }
    };
}
