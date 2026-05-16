/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('friend_requests', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('sender_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.uuid('receiver_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.enum('status', ['pending', 'accepted', 'rejected', 'cancelled']).notNullable().defaultTo('pending');
        table.timestamp('responded_at');
        table.timestamps(true, true);

        table.index(['sender_id']);
        table.index(['receiver_id']);
        table.index(['status']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('friend_requests');
};
