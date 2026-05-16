const db = require('../db/db');

const parseCount = (value) => parseInt(value || 0, 10);
const parseFloatOrZero = (value) => Number.parseFloat(value || 0) || 0;

const applyUserFilters = (query, { search, role, active }) => {
    if (search) {
        query.where((builder) => {
            builder
                .whereILike('username', `%${search}%`)
                .orWhereILike('email', `%${search}%`);
        });
    }

    if (role) {
        query.andWhere('role', role);
    }

    if (active !== undefined) {
        query.andWhere('is_active', active);
    }

    return query;
};

exports.getDashboard = async () => {
    const [
        totalUsersRow,
        activeUsersRow,
        totalSessionsRow,
        averageRatingRow,
        hottestGameRow,
        recentUsers,
    ] = await Promise.all([
        db('users').count('id as count').first(),
        db('users').where('is_active', true).count('id as count').first(),
        db('game_sessions').count('id as count').first(),
        db('ratings').avg('rating as average').first(),
        db('game_sessions')
            .join('games', 'game_sessions.game_id', 'games.id')
            .select('games.id', 'games.name')
            .count('game_sessions.id as play_count')
            .groupBy('games.id', 'games.name')
            .orderBy('play_count', 'desc')
            .first(),
        db('users')
            .select('id', 'username', 'email', 'role', 'is_active', 'created_at')
            .orderBy('created_at', 'desc')
            .limit(5),
    ]);

    return {
        totalUsers: parseCount(totalUsersRow?.count),
        activeUsers: parseCount(activeUsersRow?.count),
        totalSessions: parseCount(totalSessionsRow?.count),
        averageRating: parseFloatOrZero(averageRatingRow?.average),
        hottestGame: hottestGameRow
            ? {
                id: hottestGameRow.id,
                name: hottestGameRow.name,
                playCount: parseCount(hottestGameRow.play_count),
            }
            : null,
        recentUsers,
    };
};

exports.getUsers = async ({ page, pageSize, search, role, active }) => {
    const offset = (page - 1) * pageSize;
    const filters = { search, role, active };
    const baseQuery = applyUserFilters(
        db('users').select('id', 'username', 'email', 'role', 'is_active', 'created_at', 'updated_at'),
        filters
    );

    const totalRow = await applyUserFilters(db('users').count('id as count').first(), filters);
    const items = await baseQuery.orderBy('created_at', 'desc').limit(pageSize).offset(offset);

    return {
        items,
        totalItems: parseCount(totalRow?.count),
    };
};

exports.updateUser = async ({ actor, targetUserId, payload }) => {
    const targetUser = await db('users').where({ id: targetUserId }).first();

    if (!targetUser) {
        throw new Error('User not found');
    }

    const patch = {};

    if (actor.id === targetUserId) {
        if (payload.role && payload.role !== targetUser.role) {
            throw new Error('You do not have permission to change your own role.');
        }

        if (payload.is_active === false) {
            throw new Error('You cannot disable your own account.');
        }
    }

    if (actor.role === 'moderator') {
        if (payload.role && payload.role !== targetUser.role) {
            throw new Error('Moderators do not have permission to change roles.');
        }

        if (targetUser.role !== 'user') {
            throw new Error('Moderators can only enable or disable user accounts.');
        }

        if (typeof payload.is_active === 'boolean') {
            patch.is_active = payload.is_active;
        }
    }

    if (actor.role === 'admin') {
        if (payload.role) {
            if (!['user', 'moderator'].includes(payload.role)) {
                throw new Error('Admins can only switch roles between user and moderator.');
            }

            if (targetUser.role === 'admin') {
                throw new Error('Admins cannot change another admin role.');
            }

            if (payload.role !== targetUser.role) {
                patch.role = payload.role;
            }
        }

        if (typeof payload.is_active === 'boolean') {
            patch.is_active = payload.is_active;
        }
    }

    if (!Object.keys(patch).length) {
        throw new Error('No valid user fields were provided.');
    }

    patch.updated_at = db.fn.now();

    const [updatedUser] = await db('users')
        .where({ id: targetUserId })
        .update(patch)
        .returning(['id', 'username', 'email', 'role', 'is_active', 'updated_at']);

    return updatedUser;
};

exports.getGames = async ({ page, pageSize }) => {
    const offset = (page - 1) * pageSize;
    const totalRow = await db('games').count('id as count').first();
    const items = await db('games')
        .leftJoin('game_sessions', 'games.id', 'game_sessions.game_id')
        .leftJoin('ratings', 'games.id', 'ratings.game_id')
        .select(
            'games.id',
            'games.name',
            'games.description',
            'games.instructions',
            'games.is_active',
            'games.board_size',
            'games.default_timer',
            'games.score_type'
        )
        .countDistinct('game_sessions.id as play_count')
        .avg('ratings.rating as average_rating')
        .groupBy(
            'games.id',
            'games.name',
            'games.description',
            'games.instructions',
            'games.is_active',
            'games.board_size',
            'games.default_timer',
            'games.score_type'
        )
        .orderBy('games.name', 'asc')
        .limit(pageSize)
        .offset(offset);

    return {
        items: items.map((item) => ({
            ...item,
            play_count: parseCount(item.play_count),
            average_rating: parseFloatOrZero(item.average_rating),
        })),
        totalItems: parseCount(totalRow?.count),
    };
};

exports.updateGame = async (gameId, payload) => {
    const patch = {};

    if (typeof payload.is_active === 'boolean') {
        patch.is_active = payload.is_active;
    }

    if (Number.isInteger(payload.board_size) && payload.board_size >= 3 && payload.board_size <= 20) {
        patch.board_size = payload.board_size;
    }

    if (Number.isInteger(payload.default_timer) && payload.default_timer >= 0) {
        patch.default_timer = payload.default_timer;
    }

    if (payload.score_type && ['wins', 'score', 'time', 'none'].includes(payload.score_type)) {
        patch.score_type = payload.score_type;
    }

    if (typeof payload.instructions === 'string') {
        patch.instructions = payload.instructions.trim();
    }

    if (!Object.keys(patch).length) {
        throw new Error('No valid game fields were provided.');
    }

    patch.updated_at = db.fn.now();

    const [updatedGame] = await db('games')
        .where({ id: gameId })
        .update(patch)
        .returning(['id', 'name', 'is_active', 'board_size', 'default_timer', 'score_type', 'instructions', 'updated_at']);

    if (!updatedGame) {
        throw new Error('Game not found');
    }

    return updatedGame;
};

exports.getStats = async () => {
    const [gamePopularity, accountGrowth, reviewDistribution, topPlayersRow, sessionsPerGame] = await Promise.all([
        db('game_sessions')
            .join('games', 'game_sessions.game_id', 'games.id')
            .select('games.name')
            .count('game_sessions.id as play_count')
            .groupBy('games.name')
            .orderBy('play_count', 'desc'),
        db('users')
            .select(db.raw(`DATE(created_at) as day`))
            .count('id as user_count')
            .groupByRaw('DATE(created_at)')
            .orderBy('day', 'asc'),
        db('ratings')
            .select('rating')
            .count('id as total')
            .groupBy('rating')
            .orderBy('rating', 'asc'),
        db('game_sessions').countDistinct('user_id as count').first(),
        db('game_sessions').count('id as count').first(),
    ]);

    return {
        gamePopularity: gamePopularity.map((item) => ({
            name: item.name,
            playCount: parseCount(item.play_count),
        })),
        accountGrowth: accountGrowth.map((item) => ({
            day: item.day,
            users: parseCount(item.user_count),
        })),
        reviewDistribution: reviewDistribution.map((item) => ({
            rating: item.rating,
            total: parseCount(item.total),
        })),
        totals: {
            uniquePlayers: parseCount(topPlayersRow?.count),
            totalSessions: parseCount(sessionsPerGame?.count),
        },
    };
};
