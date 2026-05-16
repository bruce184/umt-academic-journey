const db = require('../db/db');

exports.getRankings = async ({ gameId, scope, userId, page, pageSize }) => {
    const offset = (page - 1) * pageSize;

    // Check game
    const game = await db('games').where('id', gameId).first();
    if (!game) {
        throw new Error('Game not found');
    }

    const { score_type } = game;
    // score_type can be 'wins', 'score', 'time', 'none'
    let orderColumn = 'best_score';
    let orderDirection = 'desc';
    let aggregateSql = 'MAX(score) as best_score';

    if (score_type === 'time') {
        orderColumn = 'best_time';
        orderDirection = 'asc';
        aggregateSql = 'MIN(duration) as best_time';
    } else if (score_type === 'none') {
        // Just order by recent played
        aggregateSql = 'MAX(played_at) as last_played';
        orderColumn = 'last_played';
        orderDirection = 'desc';
    }

    // Build base query
    let query = db('game_sessions')
        .where('game_sessions.game_id', gameId)
        .join('users', 'game_sessions.user_id', 'users.id')
        .select('users.id as user_id', 'users.username', db.raw(aggregateSql))
        .groupBy('users.id', 'users.username');

    if (scope === 'me' && userId) {
        query = query.where('users.id', userId);
    } else if (scope === 'friends' && userId) {
        const friendshipRows = await db('friendships')
            .select('user_one_id', 'user_two_id')
            .where((builder) => {
                builder.where('user_one_id', userId).orWhere('user_two_id', userId);
            });

        const friendIds = friendshipRows
            .map((row) => (row.user_one_id === userId ? row.user_two_id : row.user_one_id))
            .filter(Boolean);
        const visibleUserIds = [...new Set([userId, ...friendIds])];

        query = query.whereIn('users.id', visibleUserIds);
    }

    const allRecords = await query.clone().clearSelect().count('* as total_users').groupBy('users.id');
    const totalItems = allRecords.length;

    const rankings = await query
        .orderBy(orderColumn, orderDirection)
        .limit(pageSize)
        .offset(offset);

    const rankingsWithViewerState = rankings.map((entry) => ({
        ...entry,
        isCurrentUser: Boolean(userId && entry.user_id === userId),
    }));
    
    return { rankings: rankingsWithViewerState, totalItems };
};
