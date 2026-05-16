/** @param { import('knex').Knex } knex */
export async function up(knex) {
  // --- categories: đảm bảo có các cột cần thiết
  await knex.raw(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='categories' AND column_name='name'
      ) THEN
        ALTER TABLE categories ADD COLUMN name text;
      END IF;

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

  // --- products: đảm bảo có các cột cần thiết
  await knex.raw(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='products' AND column_name='image'
      ) THEN
        ALTER TABLE products ADD COLUMN image text;
      END IF;

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
  await knex.raw(`
    ALTER TABLE products   DROP COLUMN IF EXISTS image;
    ALTER TABLE products   DROP COLUMN IF EXISTS created_at;
    ALTER TABLE products   DROP COLUMN IF EXISTS updated_at;
    ALTER TABLE categories DROP COLUMN IF EXISTS name;
    ALTER TABLE categories DROP COLUMN IF EXISTS description;
    ALTER TABLE categories DROP COLUMN IF EXISTS created_at;
    ALTER TABLE categories DROP COLUMN IF EXISTS updated_at;
  `);
}
