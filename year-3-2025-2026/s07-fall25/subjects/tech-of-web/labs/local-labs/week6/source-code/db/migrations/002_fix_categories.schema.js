/** @param { import('knex').Knex } knex */
export async function up(knex) {
  // Thêm cột còn thiếu cho bảng categories
  await knex.raw(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='categories' AND column_name='description'
      ) THEN
        ALTER TABLE categories ADD COLUMN description text;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='categories' AND column_name='created_at'
      ) THEN
        ALTER TABLE categories ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='categories' AND column_name='updated_at'
      ) THEN
        ALTER TABLE categories ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
      END IF;
    END $$;
  `);
}

/** @param { import('knex').Knex } knex */
export async function down(knex) {
  // Xoá các cột vừa thêm nếu cần rollback
  await knex.raw(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='categories' AND column_name='description'
      ) THEN
        ALTER TABLE categories DROP COLUMN description;
      END IF;

      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='categories' AND column_name='created_at'
      ) THEN
        ALTER TABLE categories DROP COLUMN created_at;
      END IF;

      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='categories' AND column_name='updated_at'
      ) THEN
        ALTER TABLE categories DROP COLUMN updated_at;
      END IF;
    END $$;
  `);
}
