/** @param { import('knex').Knex } knex */
export async function up(knex) {
  // Nếu chỉ có 'title' mà chưa có 'name' -> rename 'title' => 'name'
  await knex.raw(`
    DO $$
    DECLARE
      has_title boolean;
      has_name  boolean;
    BEGIN
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='categories' AND column_name='title'
      ) INTO has_title;

      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='categories' AND column_name='name'
      ) INTO has_name;

      IF has_title AND NOT has_name THEN
        EXECUTE 'ALTER TABLE categories RENAME COLUMN title TO name';
      ELSIF has_title AND has_name THEN
        -- nếu cả 2 cùng tồn tại, ưu tiên 'name' rồi xoá 'title'
        EXECUTE 'ALTER TABLE categories ALTER COLUMN title DROP NOT NULL';
        EXECUTE 'ALTER TABLE categories DROP COLUMN title';
      END IF;
    END $$;
  `);

  await knex.raw(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='categories' AND column_name='name'
      ) THEN
        ALTER TABLE categories ADD COLUMN name text;
      END IF;

      -- name NOT NULL (fill tạm từ '' nếu cần)
      UPDATE categories SET name = COALESCE(NULLIF(name, ''), 'Uncategorized') WHERE name IS NULL OR name = '';
      ALTER TABLE categories ALTER COLUMN name SET NOT NULL;
    END $$;
  `);
}

/** @param { import('knex').Knex } knex */
export async function down(knex) {
  // Không khôi phục 'title' để tránh quay lại trạng thái lỗi
  // Chỉ bỏ NOT NULL của name (an toàn cho rollback)
  await knex.raw(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='categories' AND column_name='name'
      ) THEN
        ALTER TABLE categories ALTER COLUMN name DROP NOT NULL;
      END IF;
    END $$;
  `);
}
