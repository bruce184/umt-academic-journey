const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
    // Hash passwords
    const admin1Hash = await bcrypt.hash('demo-password', 12);
    const user1Hash = await bcrypt.hash('user123', 12);

    // Deletes ALL existing entries
    await knex('users').del();

    await knex('users').insert([
        {
            username: 'admin1',
            email: 'admin1@example.com',
            password_hash: admin1Hash,
            role: 'admin',
            is_active: true,
        },
        {
            username: 'user1',
            email: 'user1@example.com',
            password_hash: user1Hash,
            role: 'user',
            is_active: true,
        },
        {
            username: 'user2',
            email: 'user2@example.com',
            password_hash: user1Hash,
            role: 'moderator',
            is_active: true,
        },
        {
            username: 'user3',
            email: 'user3@example.com',
            password_hash: user1Hash,
            role: 'user',
            is_active: true,
        },
        {
            username: 'user4',
            email: 'user4@example.com',
            password_hash: user1Hash,
            role: 'user',
            is_active: true,
        },
        {
            username: 'user5',
            email: 'user5@example.com',
            password_hash: user1Hash,
            role: 'user',
            is_active: false,
        }
    ]);
};
