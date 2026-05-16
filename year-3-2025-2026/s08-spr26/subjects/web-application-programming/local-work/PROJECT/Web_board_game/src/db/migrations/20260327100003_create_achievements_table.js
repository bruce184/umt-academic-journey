/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('achievements', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.string('code').notNullable().unique();
        table.string('name').notNullable();
        table.text('description').notNullable();
        table.string('category').notNullable().defaultTo('social');
        table.string('icon').notNullable().defaultTo('badge');
        table.string('metric_key').notNullable();
        table.integer('goal_value').notNullable().defaultTo(1);
        table.timestamps(true, true);

        table.index(['metric_key']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('achievements');
};
