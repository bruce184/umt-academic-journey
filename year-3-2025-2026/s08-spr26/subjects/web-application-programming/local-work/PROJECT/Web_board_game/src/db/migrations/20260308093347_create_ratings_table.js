/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('ratings', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.uuid('game_id').references('id').inTable('games').onDelete('CASCADE');
        table.integer('rating').checkBetween([1, 5]);
        table.text('comment');
        table.timestamps(true, true);
        table.unique(['user_id', 'game_id']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('ratings');
};
