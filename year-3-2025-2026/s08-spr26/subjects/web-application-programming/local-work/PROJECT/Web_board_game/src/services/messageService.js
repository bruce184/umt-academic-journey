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

const normalizeText = (value, maxLength) => {
    const trimmed = String(value || '').trim();

    if (!trimmed) {
        const error = new Error('Message content is required');
        error.statusCode = 400;
        throw error;
    }

    if (trimmed.length > maxLength) {
        const error = new Error(`Message must not exceed ${maxLength} characters`);
        error.statusCode = 400;
        throw error;
    }

    return trimmed;
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
    const usersById = await fetchUsersByIds(executor, [userId]);
    return usersById.get(userId) || null;
};

const ensureFriendship = async (executor, userId, partnerId) => {
    const [userOneId, userTwoId] = [userId, partnerId].sort();

    const friendship = await executor('friendships')
        .where({
            user_one_id: userOneId,
            user_two_id: userTwoId,
        })
        .first();

    if (!friendship) {
        const error = new Error('You can only message players who are already friends');
        error.statusCode = 403;
        throw error;
    }
};

const buildConversationKey = (userId, row) => {
    return row.sender_id === userId ? row.recipient_id : row.sender_id;
};

exports.getConversations = async ({ userId, page, pageSize }) => {
    const { page: requestedPage, pageSize: safePageSize } = normalizePagination({ page, pageSize });
    const rows = await db('messages')
        .select('id', 'sender_id', 'recipient_id', 'content', 'read_at', 'created_at')
        .where((builder) => {
            builder.where('sender_id', userId).orWhere('recipient_id', userId);
        })
        .orderBy('created_at', 'desc');

    const conversationMap = new Map();

    rows.forEach((row) => {
        const partnerId = buildConversationKey(userId, row);
        const existingConversation = conversationMap.get(partnerId);

        if (!existingConversation) {
            conversationMap.set(partnerId, {
                userId: partnerId,
                lastMessage: row.content,
                lastMessageAt: row.created_at,
                unreadCount: row.recipient_id === userId && !row.read_at ? 1 : 0,
            });
            return;
        }

        if (row.recipient_id === userId && !row.read_at) {
            existingConversation.unreadCount += 1;
        }
    });

    const conversations = Array.from(conversationMap.values());
    const totalItems = conversations.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));
    const currentPage = Math.min(requestedPage, totalPages);
    const pagedConversations = conversations.slice(
        (currentPage - 1) * safePageSize,
        currentPage * safePageSize
    );

    const usersById = await fetchUsersByIds(
        db,
        pagedConversations.map((conversation) => conversation.userId)
    );

    return {
        items: pagedConversations.map((conversation) => ({
            ...usersById.get(conversation.userId),
            lastMessage: conversation.lastMessage,
            lastMessageAt: conversation.lastMessageAt,
            unreadCount: conversation.unreadCount,
        })),
        pagination: {
            page: currentPage,
            pageSize: safePageSize,
            totalItems,
            totalPages,
        },
    };
};

exports.getConversationMessages = async ({ userId, partnerId, page, pageSize }) => {
    const { page: requestedPage, pageSize: safePageSize } = normalizePagination({ page, pageSize });
    const partner = await fetchUserById(db, partnerId);

    if (!partner) {
        const error = new Error('Conversation partner not found');
        error.statusCode = 404;
        throw error;
    }

    await ensureFriendship(db, userId, partnerId);

    const baseQuery = db('messages').where((builder) => {
        builder
            .where((innerBuilder) => {
                innerBuilder.where({
                    sender_id: userId,
                    recipient_id: partnerId,
                });
            })
            .orWhere((innerBuilder) => {
                innerBuilder.where({
                    sender_id: partnerId,
                    recipient_id: userId,
                });
            });
    });

    const totalResult = await baseQuery.clone().count('* as total').first();
    const totalItems = Number.parseInt(totalResult?.total || '0', 10);
    const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));
    const currentPage = Math.min(requestedPage, totalPages);

    const rows = await baseQuery
        .clone()
        .select('id', 'sender_id', 'recipient_id', 'content', 'read_at', 'created_at')
        .orderBy('created_at', 'desc')
        .limit(safePageSize)
        .offset((currentPage - 1) * safePageSize);

    await db('messages')
        .where({
            sender_id: partnerId,
            recipient_id: userId,
        })
        .whereNull('read_at')
        .update({
            read_at: db.fn.now(),
            updated_at: db.fn.now(),
        });

    return {
        user: partner,
        items: rows
            .reverse()
            .map((row) => ({
                id: row.id,
                content: row.content,
                isMine: row.sender_id === userId,
                createdAt: row.created_at,
                readAt: row.read_at,
            })),
        pagination: {
            page: currentPage,
            pageSize: safePageSize,
            totalItems,
            totalPages,
        },
    };
};

exports.sendMessage = async ({ senderId, recipientId, content }) => {
    if (senderId === recipientId) {
        const error = new Error('You cannot message yourself');
        error.statusCode = 400;
        throw error;
    }

    const normalizedContent = normalizeText(content, 1000);

    return db.transaction(async (trx) => {
        const recipient = await fetchUserById(trx, recipientId);

        if (!recipient) {
            const error = new Error('Recipient not found');
            error.statusCode = 404;
            throw error;
        }

        await ensureFriendship(trx, senderId, recipientId);

        const [message] = await trx('messages')
            .insert({
                sender_id: senderId,
                recipient_id: recipientId,
                content: normalizedContent,
                created_at: trx.fn.now(),
                updated_at: trx.fn.now(),
            })
            .returning(['id', 'content', 'sender_id', 'recipient_id', 'read_at', 'created_at']);

        await achievementService.syncUsersAchievements(trx, [senderId, recipientId]);

        return {
            id: message.id,
            content: message.content,
            isMine: true,
            createdAt: message.created_at,
            readAt: message.read_at,
            recipient,
        };
    });
};
