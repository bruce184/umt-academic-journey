// Tạo bảng refresh_tokens theo hướng LAB5/LAB8
export async function up(knex) {
  await knex.schema.createTable("refresh_tokens", (table) => {
    // Khóa chính
    table.increments("id").primary();

    // User sở hữu token
    table
      .integer("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    // Refresh token thực tế
    table.text("token").notNullable().unique();

    // Family để hỗ trợ rotate token
    table.string("family", 255).notNullable();

    // Hạn hết token
    table.timestamp("expires_at", { useTz: true }).notNullable();

    // Cờ revoke
    table.boolean("is_revoked").notNullable().defaultTo(false);

    // Thời điểm revoke
    table.timestamp("revoked_at", { useTz: true }).nullable();

    // Thời gian tạo
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("refresh_tokens");
}