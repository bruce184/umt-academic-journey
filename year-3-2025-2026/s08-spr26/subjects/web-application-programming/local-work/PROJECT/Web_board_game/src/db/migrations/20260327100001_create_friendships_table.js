/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('friendships', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('user_one_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.uuid('user_two_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.timestamps(true, true);

        table.unique(['user_one_id', 'user_two_id']);
        table.index(['user_one_id']);
        table.index(['user_two_id']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('friendships');
};
