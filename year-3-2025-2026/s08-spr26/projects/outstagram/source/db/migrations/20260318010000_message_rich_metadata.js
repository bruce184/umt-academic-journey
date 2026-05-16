/**
 * Add structured message support for rich previews like shared posts.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    await knex.raw(`
        ALTER TABLE public.messages
        ADD COLUMN IF NOT EXISTS message_type text NOT NULL DEFAULT 'text';
    `);

    await knex.raw(`
        ALTER TABLE public.messages
        ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;
    `);

    await knex.raw(`
        CREATE INDEX IF NOT EXISTS idx_messages_type ON public.messages (message_type);
    `);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.raw(`DROP INDEX IF EXISTS idx_messages_type;`);
    await knex.raw(`ALTER TABLE public.messages DROP COLUMN IF EXISTS metadata;`);
    await knex.raw(`ALTER TABLE public.messages DROP COLUMN IF EXISTS message_type;`);
}
