/** @param { import('knex').Knex } knex */
export async function up(knex) {
  // Table: categories
  await knex.schema.createTable('categories', (t) => {
    t.increments('id').primary();
    t.string('name').notNullable().unique();
    t.text('description');
    t.timestamps(true, true); // created_at, updated_at (default now)
  });

  // Table: products
  await knex.schema.createTable('products', (t) => {
    t.increments('id').primary();
    t.string('title').notNullable();
    t.text('description');
    t.decimal('price', 10, 2).notNullable().defaultTo(0); // >= 0 (check bên dưới)
    t.integer('category_id')
      .references('id')
      .inTable('categories')
      .onUpdate('CASCADE')
      .onDelete('SET NULL');
    t.decimal('rating_rate', 3, 2);   // 0.00–5.00 (check bên dưới)
    t.integer('rating_count');        // >= 0 (check bên dưới)
    t.string('image');                // đường dẫn local hoặc URL Supabase Storage
    t.timestamps(true, true);
    t.index(['category_id']);
    t.index(['title']);               // hỗ trợ tìm kiếm theo tên
  });

  // Check constraints (Postgres)
  await knex.raw(`
    ALTER TABLE products
      ADD CONSTRAINT products_price_nonneg CHECK (price >= 0),
      ADD CONSTRAINT products_rating_rate_range CHECK (rating_rate IS NULL OR (rating_rate >= 0 AND rating_rate <= 5)),
      ADD CONSTRAINT products_rating_count_nonneg CHECK (rating_count IS NULL OR rating_count >= 0)
  `);
}

/** @param { import('knex').Knex } knex */
export async function down(knex) {
  await knex.schema.dropTableIfExists('products');
  await knex.schema.dropTableIfExists('categories');
}
