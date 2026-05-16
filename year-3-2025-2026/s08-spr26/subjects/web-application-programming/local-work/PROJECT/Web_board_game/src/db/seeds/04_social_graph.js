const at = (value) => new Date(value);

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
    await knex('messages').del();
    await knex('friend_requests').del();
    await knex('friendships').del();

    const users = await knex('users').select('id', 'username');
    const userByName = users.reduce((acc, user) => {
        acc[user.username] = user.id;
        return acc;
    }, {});

    const friendships = [
        ['user1', 'user2', at('2026-03-12T09:30:00Z')],
        ['user1', 'user3', at('2026-03-13T14:15:00Z')],
        ['user4', 'user5', at('2026-03-14T18:45:00Z')],
    ]
        .filter(([userOne, userTwo]) => userByName[userOne] && userByName[userTwo])
        .map(([userOne, userTwo, createdAt]) => {
            const [firstUserId, secondUserId] = [userByName[userOne], userByName[userTwo]].sort();

            return {
                user_one_id: firstUserId,
                user_two_id: secondUserId,
                created_at: createdAt,
                updated_at: createdAt,
            };
        });

    if (friendships.length > 0) {
        await knex('friendships').insert(friendships);
    }

    const friendRequests = [
        ['user1', 'user4', 'pending', at('2026-03-18T08:00:00Z')],
        ['user2', 'user5', 'pending', at('2026-03-18T09:45:00Z')],
        ['user5', 'user1', 'pending', at('2026-03-18T11:20:00Z')],
    ]
        .filter(([sender, receiver]) => userByName[sender] && userByName[receiver])
        .map(([sender, receiver, status, createdAt]) => ({
            sender_id: userByName[sender],
            receiver_id: userByName[receiver],
            status,
            created_at: createdAt,
            updated_at: createdAt,
        }));

    if (friendRequests.length > 0) {
        await knex('friend_requests').insert(friendRequests);
    }

    const messages = [
        ['user1', 'user2', 'Ready for another Tic-Tac-Toe round tonight?', at('2026-03-18T19:05:00Z')],
        ['user2', 'user1', 'Yes. I want a rematch after that draw.', at('2026-03-18T19:10:00Z')],
        ['user1', 'user2', 'Deal. I also found a faster route through the hub menu.', at('2026-03-18T19:15:00Z')],
        ['user2', 'user1', 'Send it over after class and I will test it.', at('2026-03-18T19:20:00Z')],
        ['user1', 'user3', 'Can you review my memory board strategy?', at('2026-03-19T08:40:00Z')],
        ['user3', 'user1', 'Sure. Focus on corner pairs first and the timer gets easier.', at('2026-03-19T08:43:00Z')],
        ['user1', 'user3', 'That helps. I am trying to unlock the next badge.', at('2026-03-19T08:48:00Z')],
        ['user4', 'user5', 'The free draw palette looks better in light mode.', at('2026-03-19T16:00:00Z')],
        ['user5', 'user4', 'Agreed. I saved a board sketch for tomorrow.', at('2026-03-19T16:07:00Z')],
        ['user4', 'user5', 'Let us present that version during the demo.', at('2026-03-19T16:15:00Z')],
    ]
        .filter(([sender, recipient]) => userByName[sender] && userByName[recipient])
        .map(([sender, recipient, content, createdAt], index) => ({
            sender_id: userByName[sender],
            recipient_id: userByName[recipient],
            content,
            read_at: index % 3 === 0 ? null : createdAt,
            created_at: createdAt,
            updated_at: createdAt,
        }));

    if (messages.length > 0) {
        await knex('messages').insert(messages);
    }
};
