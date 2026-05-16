/**
 * Story Likes & Replies tables
 * @param { import("knex").Knex } knex
 */
export async function up(knex) {
    // story_likes
    await knex.raw(`
        CREATE TABLE IF NOT EXISTS public.story_likes (
            id         bigserial PRIMARY KEY,
            story_id   bigint NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
            user_id    uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
            created_at timestamptz NOT NULL DEFAULT now(),
            UNIQUE (story_id, user_id)
        );
    `);
    await knex.raw(`CREATE INDEX IF NOT EXISTS idx_story_likes_story ON public.story_likes (story_id);`);

    // story_replies (DM-style text replies)
    await knex.raw(`
        CREATE TABLE IF NOT EXISTS public.story_replies (
            id         bigserial PRIMARY KEY,
            story_id   bigint NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
            user_id    uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
            content    text NOT NULL,
            created_at timestamptz NOT NULL DEFAULT now(),
            CONSTRAINT reply_content_len CHECK (length(content) <= 500)
        );
    `);
    await knex.raw(`CREATE INDEX IF NOT EXISTS idx_story_replies_story ON public.story_replies (story_id);`);

    // RLS
    await knex.raw(`ALTER TABLE public.story_likes ENABLE ROW LEVEL SECURITY;`);
    await knex.raw(`ALTER TABLE public.story_replies ENABLE ROW LEVEL SECURITY;`);

    // Likes: anyone can see, auth can insert/delete own
    await knex.raw(`
        CREATE POLICY story_likes_select ON public.story_likes FOR SELECT USING (true);
        CREATE POLICY story_likes_insert ON public.story_likes FOR INSERT WITH CHECK (user_id = auth.uid());
        CREATE POLICY story_likes_delete ON public.story_likes FOR DELETE USING (user_id = auth.uid());
    `);

    // Replies: story owner + replier can see, auth can insert own
    await knex.raw(`
        CREATE POLICY story_replies_select ON public.story_replies FOR SELECT USING (
            user_id = auth.uid()
            OR EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.owner_id = auth.uid())
        );
        CREATE POLICY story_replies_insert ON public.story_replies FOR INSERT WITH CHECK (user_id = auth.uid());
    `);
}

export async function down(knex) {
    await knex.raw(`DROP TABLE IF EXISTS public.story_replies CASCADE;`);
    await knex.raw(`DROP TABLE IF EXISTS public.story_likes CASCADE;`);
}
