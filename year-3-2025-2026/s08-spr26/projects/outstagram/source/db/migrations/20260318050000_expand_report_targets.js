export async function up(knex) {
    await knex.schema.raw(`
        ALTER TABLE public.reports
        DROP CONSTRAINT IF EXISTS reports_target_type_chk;
    `);
    await knex.schema.raw(`
        ALTER TABLE public.reports
        ADD CONSTRAINT reports_target_type_chk
        CHECK (target_type IN ('post', 'comment', 'user', 'story', 'problem'));
    `);
}

export async function down(knex) {
    await knex.schema.raw(`
        ALTER TABLE public.reports
        DROP CONSTRAINT IF EXISTS reports_target_type_chk;
    `);
    await knex.schema.raw(`
        ALTER TABLE public.reports
        ADD CONSTRAINT reports_target_type_chk
        CHECK (target_type IN ('post', 'comment', 'user', 'story'));
    `);
}
