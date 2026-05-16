const db = require('../db/db');
const achievementService = require('./achievementService');

const USER_FIELDS = [
    'users.id',
    'users.username',
    'users.role',
    'users.profile_picture',
    'users.created_at',
    'profiles.display_name',
    'profiles.bio',
    'profiles.location',
    'profiles.favorite_game',
];

const normalizePagination = ({ page = 1, pageSize = 6 } = {}) => {
    const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
    const safePageSize = Math.min(12, Math.max(1, Number.parseInt(pageSize, 10) || 6));

    return {
        page: safePage,
        pageSize: safePageSize,
    };
};

const normalizePair = (firstId, secondId) => {
    return [firstId, secondId].sort();
};

const mapUserPreview = (row) => ({
    id: row.id,
    username: row.username,
    role: row.role,
    profilePicture: row.profile_picture,
    displayName: row.display_name || row.username,
    bio: row.bio || '',
    location: row.location || '',
    favoriteGame: row.favorite_game || '',
    createdAt: row.created_at,
});

const fetchUsersByIds = async (executor, userIds) => {
    if (!userIds || userIds.length === 0) {
        return new Map();
    }

    const rows = await executor('users')
        .leftJoin('profiles', 'profiles.user_id', 'users.id')
        .select(USER_FIELDS)
        .whereIn('users.id', userIds);

    return new Map(rows.map((row) => [row.id, mapUserPreview(row)]));
};

const fetchUserById = async (executor, userId) => {
    const rowsById = await fetchUsersByIds(executor, [userId]);
    return rowsById.get(userId) || null;
};

const findFriendship = async (executor, userId, friendId) => {
    const [userOneId, userTwoId] = normalizePair(userId, friendId);

    return executor('friendships')
        .where({
            user_one_id: userOneId,
            user_two_id: userTwoId,
        })
        .first();
};

const mapRequestPreview = (row) => ({
    id: row.id,
    status: row.status,
    createdAt: row.created_at,
    respondedAt: row.responded_at,
    user: {
        id: row.user_id,
        username: row.username,
        role: row.role,
        profilePicture: row.profile_picture,
        displayName: row.display_name || row.username,
        bio: row.bio || '',
        location: row.location || '',
        favoriteGame: row.favorite_game || '',
        createdAt: row.user_created_at,
    },
});

exports.getFriends = async ({ userId, page, pageSize }) => {
    const { page: requestedPage, pageSize: safePageSize } = normalizePagination({ page, pageSize });
    const baseQuery = db('friendships').where((builder) => {
        builder.where('user_one_id', userId).orWhere('user_two_id', userId);
    });

    const totalResult = await baseQuery.clone().count('* as total').first();
    const totalItems = Number.parseInt(totalResult?.total || '0', 10);
    const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));
    const currentPage = Math.min(requestedPage, totalPages);

    const friendshipRows = await baseQuery
        .clone()
        .orderBy('created_at', 'desc')
        .limit(safePageSize)
        .offset((currentPage - 1) * safePageSize);

    const friendIds = friendshipRows.map((row) => (row.user_one_id === userId ? row.user_two_id : row.user_one_id));
    const usersById = await fetchUsersByIds(db, friendIds);

    const items = friendshipRows.map((row) => {
        const friendId = row.user_one_id === userId ? row.user_two_id : row.user_one_id;

        return {
            friendshipId: row.id,
            connectedAt: row.created_at,
            ...usersById.get(friendId),
        };
    });

    return {
        items,
        pagination: {
            page: currentPage,
            pageSize: safePageSize,
            totalItems,
            totalPages,
        },
    };
};

exports.getFriendRequests = async (userId) => {
    const [incoming, outgoing] = await Promise.all([
        db('friend_requests')
            .join('users', 'users.id', 'friend_requests.sender_id')
            .leftJoin('profiles', 'profiles.user_id', 'users.id')
            .select(
                'friend_requests.id',
                'friend_requests.status',
                'friend_requests.created_at',
                'friend_requests.responded_at',
                'users.id as user_id',
                'users.username',
                'users.role',
                'users.profile_picture',
                'users.created_at as user_created_at',
                'profiles.display_name',
                'profiles.bio',
                'profiles.location',
                'profiles.favorite_game'
            )
            .where({
                'friend_requests.receiver_id': userId,
                'friend_requests.status': 'pending',
            })
            .orderBy('friend_requests.created_at', 'desc'),
        db('friend_requests')
            .join('users', 'users.id', 'friend_requests.receiver_id')
            .leftJoin('profiles', 'profiles.user_id', 'users.id')
            .select(
                'friend_requests.id',
                'friend_requests.status',
                'friend_requests.created_at',
                'friend_requests.responded_at',
                'users.id as user_id',
                'users.username',
                'users.role',
                'users.profile_picture',
                'users.created_at as user_created_at',
                'profiles.display_name',
                'profiles.bio',
                'profiles.location',
                'profiles.favorite_game'
            )
            .where({
                'friend_requests.sender_id': userId,
                'friend_requests.status': 'pending',
            })
            .orderBy('friend_requests.created_at', 'desc'),
    ]);

    return {
        incoming: incoming.map(mapRequestPreview),
        outgoing: outgoing.map(mapRequestPreview),
        counts: {
            incoming: incoming.length,
            outgoing: outgoing.length,
        },
    };
};

exports.sendFriendRequest = async ({ senderId, receiverId }) => {
    if (!receiverId) {
        const error = new Error('Receiver is required');
        error.statusCode = 400;
        throw error;
    }

    if (senderId === receiverId) {
        const error = new Error('You cannot send a friend request to yourself');
        error.statusCode = 400;
        throw error;
    }

    return db.transaction(async (trx) => {
        const receiver = await fetchUserById(trx, receiverId);
        if (!receiver) {
            const error = new Error('Player not found');
            error.statusCode = 404;
            throw error;
        }

        const existingFriendship = await findFriendship(trx, senderId, receiverId);
        if (existingFriendship) {
            const error = new Error('You are already friends with this player');
            error.statusCode = 400;
            throw error;
        }

        const existingPending = await trx('friend_requests')
            .where({ status: 'pending' })
            .andWhere((builder) => {
                builder
                    .where({
                        sender_id: senderId,
                        receiver_id: receiverId,
                    })
                    .orWhere({
                        sender_id: receiverId,
                        receiver_id: senderId,
                    });
            })
            .first();

        if (existingPending) {
            const error = new Error(
                existingPending.sender_id === senderId
                    ? 'A friend request is already pending for this player'
                    : 'This player has already sent you a friend request'
            );
            error.statusCode = 400;
            throw error;
        }

        const [requestRow] = await trx('friend_requests')
            .insert({
                sender_id: senderId,
                receiver_id: receiverId,
                status: 'pending',
                created_at: trx.fn.now(),
                updated_at: trx.fn.now(),
            })
            .returning(['id', 'status', 'created_at']);

        await achievementService.syncUsersAchievements(trx, [senderId, receiverId]);

        return {
            id: requestRow.id,
            status: requestRow.status,
            createdAt: requestRow.created_at,
            user: receiver,
        };
    });
};

exports.acceptFriendRequest = async ({ requestId, userId }) => {
    return db.transaction(async (trx) => {
        const request = await trx('friend_requests')
            .where({
                id: requestId,
                receiver_id: userId,
                status: 'pending',
            })
            .first();

        if (!request) {
            const error = new Error('Friend request not found');
            error.statusCode = 404;
            throw error;
        }

        const [userOneId, userTwoId] = normalizePair(request.sender_id, request.receiver_id);
        const existingFriendship = await trx('friendships')
            .where({
                user_one_id: userOneId,
                user_two_id: userTwoId,
            })
            .first();

        let friendship = existingFriendship;

        if (!existingFriendship) {
            [friendship] = await trx('friendships')
                .insert({
                    user_one_id: userOneId,
                    user_two_id: userTwoId,
                    created_at: trx.fn.now(),
                    updated_at: trx.fn.now(),
                })
                .returning(['id', 'user_one_id', 'user_two_id', 'created_at']);
        }

        await trx('friend_requests')
            .where({ id: requestId })
            .update({
                status: 'accepted',
                responded_at: trx.fn.now(),
                updated_at: trx.fn.now(),
            });

        await achievementService.syncUsersAchievements(trx, [request.sender_id, request.receiver_id]);

        const friendUser = await fetchUserById(trx, request.sender_id);

        return {
            friendshipId: friendship.id,
            connectedAt: friendship.created_at,
            ...friendUser,
        };
    });
};

exports.deleteFriendRequest = async ({ requestId, userId }) => {
    return db.transaction(async (trx) => {
        const request = await trx('friend_requests')
            .where({
                id: requestId,
                status: 'pending',
            })
            .andWhere((builder) => {
                builder.where('sender_id', userId).orWhere('receiver_id', userId);
            })
            .first();

        if (!request) {
            const error = new Error('Friend request not found');
            error.statusCode = 404;
            throw error;
        }

        const nextStatus = request.sender_id === userId ? 'cancelled' : 'rejected';

        await trx('friend_requests')
            .where({ id: requestId })
            .update({
                status: nextStatus,
                responded_at: trx.fn.now(),
                updated_at: trx.fn.now(),
            });

        await achievementService.syncUsersAchievements(trx, [request.sender_id, request.receiver_id]);

        return {
            status: nextStatus,
        };
    });
};

exports.removeFriend = async ({ userId, friendId }) => {
    return db.transaction(async (trx) => {
        const friendship = await findFriendship(trx, userId, friendId);

        if (!friendship) {
            const error = new Error('Friendship not found');
            error.statusCode = 404;
            throw error;
        }

        await trx('friendships').where({ id: friendship.id }).del();
        await achievementService.syncUsersAchievements(trx, [userId, friendId]);
    });
};
