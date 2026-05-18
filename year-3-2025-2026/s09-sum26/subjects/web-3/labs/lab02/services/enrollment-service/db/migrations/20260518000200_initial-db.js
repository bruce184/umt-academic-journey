export async function up(knex) {
  await knex.schema.createTable("enrollments", (table) => {
    table.increments("id").primary();
    table.string("student_id").notNullable();
    table.string("course_id").notNullable();
    table.string("status").notNullable().defaultTo("ACTIVE");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.unique(["student_id", "course_id"]);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("enrollments");
}
