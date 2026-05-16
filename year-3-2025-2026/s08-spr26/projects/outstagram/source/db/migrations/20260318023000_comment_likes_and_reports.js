export async function up(knex) {
    const hasCommentLikes = await knex.schema.hasTable("comment_likes");
    if (!hasCommentLikes) {
        await knex.schema.createTable("comment_likes", (t) => {
            t.bigInteger("comment_id").notNullable();
            t.uuid("user_id").notNullable();
            t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

            t.primary(["comment_id", "user_id"]);
            t.foreign("comment_id").references("id").inTable("comments").onDelete("CASCADE");
            t.foreign("user_id").references("user_id").inTable("profiles").onDelete("CASCADE");
        });

        await knex.schema.raw(`
            CREATE INDEX IF NOT EXISTS idx_comment_likes_comment ON public.comment_likes (comment_id);
        `);
        await knex.schema.raw(`
            CREATE INDEX IF NOT EXISTS idx_comment_likes_user ON public.comment_likes (user_id);
        `);
    }

    const hasReports = await knex.schema.hasTable("reports");
    if (!hasReports) {
        await knex.schema.createTable("reports", (t) => {
            t.bigIncrements("id").primary();
            t.uuid("reporter_id").notNullable();
            t.text("target_type").notNullable();
            t.text("target_id").notNullable();
            t.text("reason").notNullable();
            t.text("status").notNullable().defaultTo("pending");
            t.uuid("resolved_by").nullable();
            t.timestamp("resolved_at", { useTz: true }).nullable();
            t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

            t.foreign("reporter_id").references("user_id").inTable("profiles").onDelete("CASCADE");
            t.foreign("resolved_by").references("user_id").inTable("profiles").onDelete("SET NULL");
        });

        await knex.raw(`
            ALTER TABLE public.reports
            ADD CONSTRAINT reports_status_chk
            CHECK (status IN ('pending', 'resolved', 'dismissed'));
        `);
        await knex.raw(`
            ALTER TABLE public.reports
            ADD CONSTRAINT reports_target_type_chk
            CHECK (target_type IN ('post', 'comment', 'user', 'story'));
        `);

        await knex.schema.raw(`
            CREATE INDEX IF NOT EXISTS idx_reports_target ON public.reports (target_type, target_id);
        `);
        await knex.schema.raw(`
            CREATE INDEX IF NOT EXISTS idx_reports_reporter ON public.reports (reporter_id, created_at DESC);
        `);
        await knex.schema.raw(`
            CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports (status, created_at DESC);
        `);
    }
}

export async function down(knex) {
    await knex.schema.dropTableIfExists("comment_likes");
    await knex.schema.dropTableIfExists("reports");
}
