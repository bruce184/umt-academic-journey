const adminService = require('../services/adminService');
const { createApiListResponse } = require('../shared/contracts');

exports.getDashboard = async (req, res) => {
    try {
        const data = await adminService.getDashboard();
        res.status(200).json({ status: 'success', data });
    } catch (error) {
        console.error('getDashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const { page, pageSize } = req.pagination;
        const { search, role, active } = req.query;
        const activeFilter =
            active === 'true' ? true : active === 'false' ? false : undefined;

        const { items, totalItems } = await adminService.getUsers({
            page,
            pageSize,
            search,
            role,
            active: activeFilter,
        });

        res.status(200).json(createApiListResponse(items, page, pageSize, totalItems));
    } catch (error) {
        console.error('getUsers error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const user = await adminService.updateUser({
            actor: req.user,
            targetUserId: req.params.id,
            payload: req.body,
        });
        res.status(200).json({ status: 'success', data: user });
    } catch (error) {
        console.error('updateUser error:', error);
        const normalizedMessage = (error.message || '').toLowerCase();
        const statusCode =
            error.message === 'User not found'
                ? 404
                : normalizedMessage.includes('permission') || normalizedMessage.includes('cannot')
                    ? 403
                    : 400;
        res.status(statusCode).json({ error: error.message });
    }
};

exports.getGames = async (req, res) => {
    try {
        const { page, pageSize } = req.pagination;
        const { items, totalItems } = await adminService.getGames({ page, pageSize });
        res.status(200).json(createApiListResponse(items, page, pageSize, totalItems));
    } catch (error) {
        console.error('getGames error:', error);
        res.status(500).json({ error: 'Failed to fetch games' });
    }
};

exports.updateGame = async (req, res) => {
    try {
        const game = await adminService.updateGame(req.params.id, req.body);
        res.status(200).json({ status: 'success', data: game });
    } catch (error) {
        console.error('updateGame error:', error);
        const statusCode = error.message === 'Game not found' ? 404 : 400;
        res.status(statusCode).json({ error: error.message });
    }
};

exports.getStats = async (req, res) => {
    try {
        const data = await adminService.getStats();
        res.status(200).json({ status: 'success', data });
    } catch (error) {
        console.error('getStats error:', error);
        res.status(500).json({ error: 'Failed to fetch admin statistics' });
    }
};
