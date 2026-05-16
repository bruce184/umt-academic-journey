const db = require('../db/db');

const mapSearchResult = (row) => ({
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

const normalizePair = (firstId, secondId) => {
    return [firstId, secondId].sort();
};

exports.searchUsers = async ({ currentUserId, query, page = 1, pageSize = 6 }) => {
    const normalizedQuery = String(query || '').trim();
    const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
    const safePageSize = Math.min(12, Math.max(1, Number.parseInt(pageSize, 10) || 6));

    const baseQuery = db('users')
        .leftJoin('profiles', 'profiles.user_id', 'users.id')
        .whereNot('users.id', currentUserId);

    if (normalizedQuery) {
        const searchTerm = `%${normalizedQuery}%`;
        baseQuery.andWhere((builder) => {
            builder
                .whereILike('users.username', searchTerm)
                .orWhereILike('users.email', searchTerm)
                .orWhereILike('profiles.display_name', searchTerm)
                .orWhereILike('profiles.favorite_game', searchTerm)
                .orWhereILike('profiles.location', searchTerm);
        });
    }

    const totalResult = await baseQuery
        .clone()
        .countDistinct('users.id as total')
        .first();

    const totalItems = Number.parseInt(totalResult?.total || '0', 10);
    const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));
    const currentPage = Math.min(safePage, totalPages);

    const users = await baseQuery
        .clone()
        .select(
            'users.id',
            'users.username',
            'users.role',
            'users.profile_picture',
            'users.created_at',
            'profiles.display_name',
            'profiles.bio',
            'profiles.location',
            'profiles.favorite_game'
        )
        .orderBy('users.username', 'asc')
        .limit(safePageSize)
        .offset((currentPage - 1) * safePageSize);

    const userIds = users.map((user) => user.id);
    let friendships = [];
    let pendingRequests = [];

    if (userIds.length > 0) {
        [friendships, pendingRequests] = await Promise.all([
            db('friendships')
                .select('id', 'user_one_id', 'user_two_id')
                .where((builder) => {
                    builder
                        .where('user_one_id', currentUserId)
                        .whereIn('user_two_id', userIds)
                        .orWhere((nested) => {
                            nested
                                .where('user_two_id', currentUserId)
                                .whereIn('user_one_id', userIds);
                        });
                }),
            db('friend_requests')
                .select('id', 'sender_id', 'receiver_id')
                .where({ status: 'pending' })
                .andWhere((builder) => {
                    builder
                        .where('sender_id', currentUserId)
                        .whereIn('receiver_id', userIds)
                        .orWhere((nested) => {
                            nested
                                .where('receiver_id', currentUserId)
                                .whereIn('sender_id', userIds);
                        });
                }),
        ]);
    }

    const friendshipPairs = new Set(
        friendships.map((friendship) => normalizePair(friendship.user_one_id, friendship.user_two_id).join(':'))
    );
    const pendingRequestsByOtherUserId = new Map(
        pendingRequests.map((request) => {
            const otherUserId =
                request.sender_id === currentUserId ? request.receiver_id : request.sender_id;
            const direction =
                request.sender_id === currentUserId ? 'outgoing_request' : 'incoming_request';

            return [
                otherUserId,
                {
                    id: request.id,
                    direction,
                },
            ];
        })
    );

    return {
        items: users.map((user) => {
            const pairKey = normalizePair(currentUserId, user.id).join(':');
            const pendingRequest = pendingRequestsByOtherUserId.get(user.id);

            return {
                ...mapSearchResult(user),
                relationship: friendshipPairs.has(pairKey)
                    ? 'friend'
                    : pendingRequest?.direction || 'none',
                pendingRequestId: pendingRequest?.id || null,
            };
        }),
        pagination: {
            page: currentPage,
            pageSize: safePageSize,
            totalItems,
            totalPages,
        },
    };
};
