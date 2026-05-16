const ACHIEVEMENTS = [
    {
        code: 'SOCIAL_SPARK',
        name: 'Social Spark',
        description: 'Send your first friend request.',
        category: 'social',
        icon: 'spark',
        metric_key: 'friend_requests_sent',
        goal_value: 1,
    },
    {
        code: 'FIRST_PING',
        name: 'First Ping',
        description: 'Send your first direct message.',
        category: 'social',
        icon: 'message-circle',
        metric_key: 'messages_sent',
        goal_value: 1,
    },
    {
        code: 'TRUST_CIRCLE',
        name: 'Trust Circle',
        description: 'Reach two active friendships.',
        category: 'social',
        icon: 'users',
        metric_key: 'friends_count',
        goal_value: 2,
    },
    {
        code: 'SOCIAL_BUTTERFLY',
        name: 'Social Butterfly',
        description: 'Chat across three separate conversations.',
        category: 'social',
        icon: 'stars',
        metric_key: 'conversations_count',
        goal_value: 3,
    },
];

const countFriendships = async (knex, userId) => {
    const result = await knex('friendships')
        .where((builder) => {
            builder.where('user_one_id', userId).orWhere('user_two_id', userId);
        })
        .count('* as total')
        .first();

    return Number.parseInt(result?.total || '0', 10);
};

const countFriendRequestsSent = async (knex, userId) => {
    const result = await knex('friend_requests')
        .where({ sender_id: userId })
        .count('* as total')
        .first();

    return Number.parseInt(result?.total || '0', 10);
};

const countMessagesSent = async (knex, userId) => {
    const result = await knex('messages')
        .where({ sender_id: userId })
        .count('* as total')
        .first();

    return Number.parseInt(result?.total || '0', 10);
};

const countConversations = async (knex, userId) => {
    const rows = await knex('messages')
        .select('sender_id', 'recipient_id')
        .where((builder) => {
            builder.where('sender_id', userId).orWhere('recipient_id', userId);
        });

    const partnerIds = new Set(
        rows.map((row) => (row.sender_id === userId ? row.recipient_id : row.sender_id))
    );

    return partnerIds.size;
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
    await knex('user_achievements').del();
    await knex('achievements').del();

    await knex('achievements').insert(
        ACHIEVEMENTS.map((achievement) => ({
            ...achievement,
            created_at: knex.fn.now(),
            updated_at: knex.fn.now(),
        }))
    );

    const [users, achievements] = await Promise.all([
        knex('users').select('id'),
        knex('achievements').select('id', 'metric_key', 'goal_value'),
    ]);

    const userAchievementRows = [];

    for (const user of users) {
        const metrics = {
            friends_count: await countFriendships(knex, user.id),
            friend_requests_sent: await countFriendRequestsSent(knex, user.id),
            messages_sent: await countMessagesSent(knex, user.id),
            conversations_count: await countConversations(knex, user.id),
        };

        achievements.forEach((achievement) => {
            const progress = metrics[achievement.metric_key] || 0;

            userAchievementRows.push({
                user_id: user.id,
                achievement_id: achievement.id,
                progress_value: progress,
                unlocked_at: progress >= achievement.goal_value ? knex.fn.now() : null,
                created_at: knex.fn.now(),
                updated_at: knex.fn.now(),
            });
        });
    }

    if (userAchievementRows.length > 0) {
        await knex('user_achievements').insert(userAchievementRows);
    }
};
