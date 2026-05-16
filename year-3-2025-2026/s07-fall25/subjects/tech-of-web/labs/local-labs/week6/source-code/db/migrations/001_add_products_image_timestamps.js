/** @param { import('knex').Knex } knex */
export async function up(knex) {
  // Thêm cột image nếu thiếu
  await knex.schema.alterTable('products', (t) => {
    t.text('image').nullable();
  }).catch(() => {}); // nếu đã tồn tại thì bỏ qua

  // Thêm created_at, updated_at nếu thiếu (backfill NOW() cho bản ghi cũ)
  await knex.raw(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='products' AND column_name='created_at'
      ) THEN
        ALTER TABLE products ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='products' AND column_name='updated_at'
      ) THEN
        ALTER TABLE products ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
      END IF;
    END $$;
  `);
}

/** @param { import('knex').Knex } knex */
export async function down(knex) {
  await knex.schema.alterTable('products', (t) => {
    t.dropColumn('image');
    t.dropColumn('created_at');
    t.dropColumn('updated_at');
  });
}
