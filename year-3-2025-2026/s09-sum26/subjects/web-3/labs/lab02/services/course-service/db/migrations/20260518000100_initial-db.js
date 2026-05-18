export async function up(knex) {
  await knex.schema.createTable("courses", (table) => {
    table.increments("id").primary();
    table.string("title").notNullable();
    table.text("description").notNullable().defaultTo("");
    table.integer("credits").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("courses");
}
