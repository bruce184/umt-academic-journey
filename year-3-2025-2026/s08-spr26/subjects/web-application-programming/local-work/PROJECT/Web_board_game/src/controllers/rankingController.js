const rankingService = require('../services/rankingService');
const { createApiListResponse } = require('../shared/contracts');

exports.getGameRankings = async (req, res) => {
    try {
        const { gameId, scope } = req.query;
        const { page, pageSize } = req.pagination;

        if (!gameId) {
            return res.status(400).json({ error: 'gameId query parameter is required' });
        }

        const validScopes = ['global', 'friends', 'me'];
        const currentScope = validScopes.includes(scope) ? scope : 'global';

        const userId = req.user?.id || null;

        if (['me', 'friends'].includes(currentScope) && !userId) {
            return res.status(401).json({ error: 'Authentication required for this scope' });
        }

        const { rankings, totalItems } = await rankingService.getRankings({
            gameId,
            scope: currentScope,
            userId,
            page,
            pageSize
        });

        res.status(200).json(createApiListResponse(rankings, page, pageSize, totalItems));
    } catch (error) {
        console.error('getGameRankings error:', error);
        if (error.message === 'Game not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to fetch rankings' });
    }
};
