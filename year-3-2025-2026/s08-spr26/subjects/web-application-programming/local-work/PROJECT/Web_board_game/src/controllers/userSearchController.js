const userSearchService = require('../services/userSearchService');

exports.searchUsers = async (req, res) => {
    try {
        const result = await userSearchService.searchUsers({
            currentUserId: req.user.id,
            query: req.query.q,
            page: req.query.page,
            pageSize: req.query.pageSize,
        });

        res.json({
            status: 'success',
            data: {
                items: result.items,
                pagination: result.pagination,
            },
        });
    } catch (error) {
        console.error('User search error:', error);
        res.status(500).json({ error: 'Failed to search users' });
    }
};
