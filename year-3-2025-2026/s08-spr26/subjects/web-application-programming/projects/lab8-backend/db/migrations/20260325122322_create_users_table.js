// Tạo bảng users
export async function up(knex) {
  await knex.schema.createTable("users", (table) => {
    // Khóa chính
    table.increments("id").primary();

    // Tên người dùng
    table.string("name", 100).notNullable();

    // Email dùng để login, phải unique
    table.string("email", 255).notNullable().unique();

    // Mật khẩu đã hash
    table.string("password", 255).notNullable();

    // Thời gian tạo/cập nhật
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("users");
}