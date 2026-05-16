import { Router } from 'express';
import { db as knex } from '../../db/knex.js';
import { requireAdmin } from '../../middlewares/admin-auth.js';
import { errors } from '../../utils/api-error.js';
import { SystemConfigService } from '../../services/system-config.service.js';

const router = Router();

// Get all config
router.get('/', requireAdmin('super_admin'), async (req, res, next) => {
    try {
        const configs = await SystemConfigService.listForAdmin();

        res.json({
            message: 'System config fetched successfully',
            data: { configs }
        });
    } catch (error) {
        next(error);
    }
});

// Update a single config value
router.patch('/:key', requireAdmin('super_admin'), async (req, res, next) => {
    try {
        const { key } = req.params;
        const { value } = req.body;

        if (value === undefined || value === null) {
            return next(errors.validation('Value is required.'));
        }

        const existing = await knex('system_config').where({ key }).first();
        if (!existing) {
            return next(errors.notFound(`Config key "${key}" not found.`));
        }

        await knex('system_config').where({ key }).update({
            value: JSON.stringify(value),
            updated_by: req.userId,
            updated_at: knex.fn.now()
        });
        SystemConfigService.invalidateCache();

        await knex('audit_logs').insert({
            actor_id: req.userId,
            action: 'config.update',
            target_type: 'system_config',
            target_id: key,
            metadata: JSON.stringify({ old_value: existing.value, new_value: value })
        }).catch((err) => console.error('Failed to insert audit log', err));

        res.json({ message: `Config "${key}" updated successfully` });
    } catch (error) {
        next(error);
    }
});

export default router;
