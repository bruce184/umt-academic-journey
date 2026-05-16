/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('games', (table) => {
    table.integer('board_size').defaultTo(20);
    table.integer('default_timer').defaultTo(60).comment('Limit in seconds per turn/game');
    table.string('score_type').defaultTo('wins').comment('wins, score, time, none');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('games', (table) => {
    table.dropColumn('board_size');
    table.dropColumn('default_timer');
    table.dropColumn('score_type');
  });
};
