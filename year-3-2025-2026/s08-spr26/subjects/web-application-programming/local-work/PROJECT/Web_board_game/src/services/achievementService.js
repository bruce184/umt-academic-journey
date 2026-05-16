const db = require('../db/db');

const ACHIEVEMENT_FIELDS = [
    'achievements.id',
    'achievements.code',
    'achievements.name',
    'achievements.description',
    'achievements.category',
    'achievements.icon',
    'achievements.metric_key',
    'achievements.goal_value',
    'user_achievements.progress_value',
    'user_achievements.unlocked_at',
];

const getExecutor = (executor) => executor || db;

const mapAchievement = (row) => {
    const progress = row.progress_value || 0;
    const goal = row.goal_value || 1;
    const isUnlocked = Boolean(row.unlocked_at);

    return {
        id: row.id,
        code: row.code,
        name: row.name,
        description: row.description,
        category: row.category,
        icon: row.icon,
        metricKey: row.metric_key,
        goalValue: goal,
        progressValue: progress,
        unlockedAt: row.unlocked_at,
        isUnlocked,
        progressPercent: Math.min(100, Math.round((progress / goal) * 100)),
    };
};

const countFriends = async (executor, userId) => {
    const result = await executor('friendships')
        .where((builder) => {
            builder.where('user_one_id', userId).orWhere('user_two_id', userId);
        })
        .count('* as total')
        .first();

    return Number.parseInt(result?.total || '0', 10);
};

const countFriendRequestsSent = async (executor, userId) => {
    const result = await executor('friend_requests')
        .where({ sender_id: userId })
        .count('* as total')
        .first();

    return Number.parseInt(result?.total || '0', 10);
};

const countMessagesSent = async (executor, userId) => {
    const result = await executor('messages')
        .where({ sender_id: userId })
        .count('* as total')
        .first();

    return Number.parseInt(result?.total || '0', 10);
};

const countConversations = async (executor, userId) => {
    const rows = await executor('messages')
        .select('sender_id', 'recipient_id')
        .where((builder) => {
            builder.where('sender_id', userId).orWhere('recipient_id', userId);
        });

    const partnerIds = new Set(
        rows.map((row) => (row.sender_id === userId ? row.recipient_id : row.sender_id))
    );

    return partnerIds.size;
};

const calculateMetrics = async (executor, userId) => {
    const [friendsCount, friendRequestsSent, messagesSent, conversationsCount] = await Promise.all([
        countFriends(executor, userId),
        countFriendRequestsSent(executor, userId),
        countMessagesSent(executor, userId),
        countConversations(executor, userId),
    ]);

    return {
        friends_count: friendsCount,
        friend_requests_sent: friendRequestsSent,
        messages_sent: messagesSent,
        conversations_count: conversationsCount,
    };
};

exports.syncUserAchievements = async (executor, userId) => {
    const activeExecutor = getExecutor(executor);
    const [achievements, metrics] = await Promise.all([
        activeExecutor('achievements').select('id', 'metric_key', 'goal_value'),
        calculateMetrics(activeExecutor, userId),
    ]);

    for (const achievement of achievements) {
        const progress = metrics[achievement.metric_key] || 0;
        const shouldUnlock = progress >= achievement.goal_value;

        await activeExecutor('user_achievements')
            .insert({
                user_id: userId,
                achievement_id: achievement.id,
                progress_value: progress,
                unlocked_at: shouldUnlock ? activeExecutor.fn.now() : null,
                created_at: activeExecutor.fn.now(),
                updated_at: activeExecutor.fn.now(),
            })
            .onConflict(['user_id', 'achievement_id'])
            .ignore();

        await activeExecutor('user_achievements')
            .where({
                user_id: userId,
                achievement_id: achievement.id,
            })
            .update({
                progress_value: progress,
                unlocked_at: shouldUnlock
                    ? activeExecutor.raw('COALESCE(unlocked_at, CURRENT_TIMESTAMP)')
                    : activeExecutor.raw('unlocked_at'),
                updated_at: activeExecutor.fn.now(),
            });
    }
};

exports.syncUsersAchievements = async (executor, userIds) => {
    const uniqueUserIds = [...new Set((userIds || []).filter(Boolean))];

    for (const userId of uniqueUserIds) {
        await exports.syncUserAchievements(executor, userId);
    }
};

exports.getAchievementCatalog = async () => {
    const rows = await db('achievements')
        .select(
            'id',
            'code',
            'name',
            'description',
            'category',
            'icon',
            'metric_key',
            'goal_value'
        )
        .orderBy('goal_value', 'asc')
        .orderBy('name', 'asc');

    return rows.map((row) =>
        mapAchievement({
            ...row,
            progress_value: 0,
            unlocked_at: null,
        })
    );
};

exports.getAchievementsForUser = async (userId) => {
    await exports.syncUserAchievements(null, userId);

    const rows = await db('achievements')
        .leftJoin('user_achievements', function joinUserAchievements() {
            this.on('user_achievements.achievement_id', '=', 'achievements.id').andOn(
                'user_achievements.user_id',
                '=',
                db.raw('?', [userId])
            );
        })
        .select(ACHIEVEMENT_FIELDS)
        .orderBy('achievements.goal_value', 'asc')
        .orderBy('achievements.name', 'asc');

    const items = rows.map(mapAchievement);
    const unlockedCount = items.filter((item) => item.isUnlocked).length;

    return {
        items,
        summary: {
            total: items.length,
            unlocked: unlockedCount,
            locked: Math.max(0, items.length - unlockedCount),
            completionPercent: items.length === 0 ? 0 : Math.round((unlockedCount / items.length) * 100),
        },
    };
};
