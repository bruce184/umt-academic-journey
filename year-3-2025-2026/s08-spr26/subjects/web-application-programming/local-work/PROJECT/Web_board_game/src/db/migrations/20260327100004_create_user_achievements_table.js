/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('user_achievements', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.uuid('achievement_id').notNullable().references('id').inTable('achievements').onDelete('CASCADE');
        table.integer('progress_value').notNullable().defaultTo(0);
        table.timestamp('unlocked_at');
        table.timestamps(true, true);

        table.unique(['user_id', 'achievement_id']);
        table.index(['user_id']);
        table.index(['achievement_id']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('user_achievements');
};
