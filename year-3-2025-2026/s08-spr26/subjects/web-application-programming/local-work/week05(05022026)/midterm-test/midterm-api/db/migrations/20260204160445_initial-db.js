export async function up(knex) {
  await knex.schema.createTable("users", (t) => {
    t.increments("id").primary();
    t.string("name").notNullable();
    t.string("email").notNullable().unique();
    t.string("password_hash").notNullable();
    t.timestamp("created_at").defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("todos", (t) => {
    t.increments("id").primary();
    t.integer("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    t.string("title").notNullable();
    t.text("description").nullable();
    t.enu("status", ["PENDING", "DONE"]).defaultTo("PENDING");
    t.date("due_date").nullable();

    t.timestamp("created_at").defaultTo(knex.fn.now());
    t.timestamp("updated_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("todos");
  await knex.schema.dropTableIfExists("users");
}
