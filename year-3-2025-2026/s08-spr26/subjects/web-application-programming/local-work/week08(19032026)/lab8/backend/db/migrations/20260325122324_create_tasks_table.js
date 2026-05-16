// Tạo bảng tasks
export async function up(knex) {
  await knex.schema.createTable("tasks", (table) => {
    // Khóa chính
    table.increments("id").primary();

    // Chủ sở hữu task
    table
      .integer("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    // Nội dung task
    table.string("title", 255).notNullable();
    table.text("description").nullable();

    // Trạng thái task
    table.string("status", 20).notNullable().defaultTo("pending");
    table.boolean("completed").notNullable().defaultTo(false);

    // Thời gian tạo/cập nhật
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("tasks");
}