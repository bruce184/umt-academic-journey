/**
 * Stories Schema Migration
 * - stories (ephemeral content, expires after 24h)
 * - story_views (who viewed which story)
 * - RLS policies
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    // 1) stories table
    await knex.raw(`
        CREATE TABLE IF NOT EXISTS public.stories (
            id           bigserial PRIMARY KEY,
            owner_id     uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
            media_url    text NOT NULL,
            media_path   text,
            media_type   text NOT NULL DEFAULT 'image',
            caption      text,
            created_at   timestamptz NOT NULL DEFAULT now(),
            expires_at   timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
            is_deleted   boolean NOT NULL DEFAULT false,
            CONSTRAINT story_media_type CHECK (media_type IN ('image', 'video')),
            CONSTRAINT story_caption_len CHECK (caption IS NULL OR length(caption) <= 200)
        );
    `);

    await knex.raw(`CREATE INDEX IF NOT EXISTS idx_stories_owner_expires ON public.stories (owner_id, expires_at DESC) WHERE is_deleted = false;`);
    await knex.raw(`CREATE INDEX IF NOT EXISTS idx_stories_expires ON public.stories (expires_at) WHERE is_deleted = false;`);

    // 2) story_views table
    await knex.raw(`
        CREATE TABLE IF NOT EXISTS public.story_views (
            id         bigserial PRIMARY KEY,
            story_id   bigint NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
            viewer_id  uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
            viewed_at  timestamptz NOT NULL DEFAULT now(),
            UNIQUE (story_id, viewer_id)
        );
    `);

    await knex.raw(`CREATE INDEX IF NOT EXISTS idx_story_views_story ON public.story_views (story_id);`);
    await knex.raw(`CREATE INDEX IF NOT EXISTS idx_story_views_viewer ON public.story_views (viewer_id);`);

    // 3) RLS for stories
    await knex.raw(`ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;`);
    await knex.raw(`
        DROP POLICY IF EXISTS stories_select_active ON public.stories;
        CREATE POLICY stories_select_active ON public.stories
            FOR SELECT USING (is_deleted = false AND expires_at > now());
    `);
    await knex.raw(`
        DROP POLICY IF EXISTS stories_insert_own ON public.stories;
        CREATE POLICY stories_insert_own ON public.stories
            FOR INSERT WITH CHECK (owner_id = auth.uid());
    `);
    await knex.raw(`
        DROP POLICY IF EXISTS stories_update_own ON public.stories;
        CREATE POLICY stories_update_own ON public.stories
            FOR UPDATE USING (owner_id = auth.uid());
    `);
    await knex.raw(`
        DROP POLICY IF EXISTS stories_delete_own ON public.stories;
        CREATE POLICY stories_delete_own ON public.stories
            FOR DELETE USING (owner_id = auth.uid());
    `);

    // 4) RLS for story_views
    await knex.raw(`ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;`);
    await knex.raw(`
        DROP POLICY IF EXISTS story_views_select ON public.story_views;
        CREATE POLICY story_views_select ON public.story_views
            FOR SELECT USING (
                viewer_id = auth.uid()
                OR EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.owner_id = auth.uid())
            );
    `);
    await knex.raw(`
        DROP POLICY IF EXISTS story_views_insert ON public.story_views;
        CREATE POLICY story_views_insert ON public.story_views
            FOR INSERT WITH CHECK (viewer_id = auth.uid());
    `);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.raw(`DROP TABLE IF EXISTS public.story_views CASCADE;`);
    await knex.raw(`DROP TABLE IF EXISTS public.stories CASCADE;`);
}
