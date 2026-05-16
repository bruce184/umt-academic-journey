/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export async function up (knex) {
    await knex.schema
    .createTable('students', function(table) {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('email').notNullable();
        table.string('password').notNullable();
        table.timestamps(true, true);
    })
    .createTable('courses', function(table) {
        table.increments('id').primary();
        table.string('title').notNullable();
        table.string('description').notNullable();
        table.timestamps(true, true);
    })
    .createTable('enrollments', function(table) {
        table.increments('id').primary();

        table 
            .integer('student_id')
            .notNullable()
            .references('id')
            .inTable('students')
            .onDelete('CASCADE');
        
        table 
            .integer('course_id')
            .notNullable()
            .references('id')
            .inTable('courses')
            .onDelete('CASCADE');

        table.timestamps(true, true);

        table.unique(['student_id', 'course_id'])
    });

}

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */

export async function down(knex) {
    await knex.schema
    .dropTableIfExists('enrollments')
    .dropTableIfExists('courses')
    .dropTableIfExists('students');
}   
