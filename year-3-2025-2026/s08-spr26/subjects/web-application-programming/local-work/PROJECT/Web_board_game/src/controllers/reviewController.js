const db = require('../db/db');
const { createApiListResponse } = require('../shared/contracts');

exports.getReviewsByGameId = async (req, res) => {
    try {
        const gameId = req.params.id;
        const { page, pageSize } = req.pagination;

        const offset = (page - 1) * pageSize;

        // Verify game exists
        const game = await db('games').where('id', gameId).first();
        if (!game) {
            return res.status(404).json({ error: 'Game not found' });
        }

        // Count total
        const [{ count }] = await db('ratings').where('game_id', gameId).count('id as count');
        const totalItems = parseInt(count, 10) || 0;

        // Get reviews
        const reviews = await db('ratings')
            .join('users', 'ratings.user_id', 'users.id')
            .where('ratings.game_id', gameId)
            .select('ratings.id', 'ratings.user_id', 'users.username', 'ratings.rating', 'ratings.comment', 'ratings.created_at')
            .orderBy('ratings.created_at', 'desc')
            .limit(pageSize)
            .offset(offset);

        res.status(200).json(createApiListResponse(reviews, page, pageSize, totalItems));
    } catch (error) {
        console.error('getReviewsByGameId error:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
};

exports.addOrUpdateReview = async (req, res) => {
    try {
        const gameId = req.params.id;
        const userId = req.user.id; // From auth middleware
        const { rating, comment } = req.body;

        if (rating === undefined || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
        }

        // Verify game exists
        const game = await db('games').where('id', gameId).first();
        if (!game) {
            return res.status(404).json({ error: 'Game not found' });
        }

        // Insert or Update logic: Postgres ON CONFLICT DO UPDATE
        await db('ratings')
            .insert({
                user_id: userId,
                game_id: gameId,
                rating,
                comment: comment || ''
            })
            .onConflict(['user_id', 'game_id'])
            .merge(['rating', 'comment', 'updated_at']);

        // Fetch the updated review
        const updatedReview = await db('ratings')
            .where({ user_id: userId, game_id: gameId })
            .first();

        res.status(200).json({
            status: 'success',
            message: 'Review saved',
            data: updatedReview
        });
    } catch (error) {
        console.error('addOrUpdateReview error:', error);
        res.status(500).json({ error: 'Failed to save review' });
    }
};
