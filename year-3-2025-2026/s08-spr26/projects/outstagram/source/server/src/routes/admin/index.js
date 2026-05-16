import { Router } from 'express';
import { requireAdmin } from '../../middlewares/admin-auth.js';
import dashboardRoutes from './dashboard.routes.js';
import usersRoutes from './users.routes.js';
import postsRoutes from './posts.routes.js';
import auditLogsRoutes from './audit-logs.routes.js';
import reportsRoutes from './reports.routes.js';
import rolesRoutes from './roles.routes.js';
import configRoutes from './config.routes.js';

const adminRouter = Router();

// Ping endpoint to verify admin access
adminRouter.get('/ping', requireAdmin('moderator'), (req, res) => {
    res.status(200).json({
        message: 'Admin Panel Access Granted',
        role: req.userRole
    });
});

adminRouter.use('/dashboard', dashboardRoutes);
adminRouter.use('/users', usersRoutes);
adminRouter.use('/posts', postsRoutes);
adminRouter.use('/audit-logs', auditLogsRoutes);
adminRouter.use('/reports', reportsRoutes);
adminRouter.use('/roles', rolesRoutes);
adminRouter.use('/config', configRoutes);

export default adminRouter;
