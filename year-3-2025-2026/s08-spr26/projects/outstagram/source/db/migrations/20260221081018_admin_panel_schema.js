/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Add new values to existing custom ENUM 'user_role' gracefully.
  // We use DO blocks to avoid errors if the value already exists.
  await knex.raw(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'user_role' AND e.enumlabel = 'moderator'
      ) THEN
        ALTER TYPE user_role ADD VALUE 'moderator';
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'user_role' AND e.enumlabel = 'super_admin'
      ) THEN
        ALTER TYPE user_role ADD VALUE 'super_admin';
      END IF;
    END $$;
  `);

  const hasRole = await knex.schema.hasColumn('profiles', 'role');
  const hasIsBanned = await knex.schema.hasColumn('profiles', 'is_banned');

  if (!hasRole) {
    await knex.raw(`ALTER TABLE public.profiles ADD COLUMN role user_role NOT NULL DEFAULT 'user'`);
  }

  await knex.schema.alterTable('profiles', (t) => {
    if (!hasIsBanned) {
      t.boolean('is_banned').notNullable().defaultTo(false);
      t.timestamp('banned_at', { useTz: true }).nullable();
      t.text('banned_reason').nullable();
    }
  });

  // audit_logs table
  await knex.schema.createTable('audit_logs', (t) => {
    t.bigIncrements('id').primary();
    t.uuid('actor_id').notNullable();
    t.text('action').notNullable();
    t.text('target_type').nullable();
    t.text('target_id').nullable();
    t.jsonb('metadata').defaultTo('{}');
    t.specificType('ip_address', 'inet').nullable();
    t.text('user_agent').nullable();
    t.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    t.foreign('actor_id').references('user_id').inTable('profiles').onDelete('CASCADE');
  });

  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs (actor_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs (action, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON public.audit_logs (target_type, target_id);
  `);

  // system_config table
  await knex.schema.createTable('system_config', (t) => {
    t.text('key').primary();
    t.jsonb('value').notNullable();
    t.uuid('updated_by').nullable();
    t.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    t.foreign('updated_by').references('user_id').inTable('profiles').onDelete('SET NULL');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('system_config');
  await knex.schema.dropTableIfExists('audit_logs');

  await knex.raw(`
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS chk_profiles_role;
  `);

  await knex.schema.alterTable('profiles', (t) => {
    t.dropColumn('role');
    t.dropColumn('is_banned');
    t.dropColumn('banned_at');
    t.dropColumn('banned_reason');
  });
}
