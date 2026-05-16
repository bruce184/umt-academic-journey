/**
 * Direct Messages Schema Migration
 * - conversations (1:1 DMs, normalized UUID order to prevent duplicates)
 * - messages (individual messages, soft-delete support)
 * - RLS policies for privacy
 *
 * Uses raw SQL with IF NOT EXISTS guards for idempotency.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    // 1) conversations table
    await knex.raw(`
        CREATE TABLE IF NOT EXISTS public.conversations (
            id          bigserial PRIMARY KEY,
            user1_id    uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
            user2_id    uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
            user1_last_read timestamptz,
            user2_last_read timestamptz,
            last_msg_at timestamptz,
            created_at  timestamptz NOT NULL DEFAULT now(),
            CONSTRAINT no_self_conversation CHECK (user1_id <> user2_id),
            CONSTRAINT user_id_order CHECK (user1_id < user2_id),
            UNIQUE (user1_id, user2_id)
        );
    `);

    await knex.raw(`CREATE INDEX IF NOT EXISTS idx_conversations_user1 ON public.conversations (user1_id, last_msg_at DESC NULLS LAST);`);
    await knex.raw(`CREATE INDEX IF NOT EXISTS idx_conversations_user2 ON public.conversations (user2_id, last_msg_at DESC NULLS LAST);`);

    // 2) messages table
    await knex.raw(`
        CREATE TABLE IF NOT EXISTS public.messages (
            id              bigserial PRIMARY KEY,
            conversation_id bigint NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
            sender_id       uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
            body            text NOT NULL,
            is_deleted      boolean NOT NULL DEFAULT false,
            created_at      timestamptz NOT NULL DEFAULT now(),
            CONSTRAINT message_body_len CHECK (length(body) BETWEEN 1 AND 2000)
        );
    `);

    await knex.raw(`CREATE INDEX IF NOT EXISTS idx_messages_conv_created ON public.messages (conversation_id, created_at DESC);`);
    await knex.raw(`CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages (sender_id);`);

    // 3) RLS for conversations
    await knex.raw(`ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;`);
    await knex.raw(`
        DROP POLICY IF EXISTS conv_select_own ON public.conversations;
        CREATE POLICY conv_select_own ON public.conversations
            FOR SELECT USING (user1_id = auth.uid() OR user2_id = auth.uid());
    `);
    await knex.raw(`
        DROP POLICY IF EXISTS conv_insert_own ON public.conversations;
        CREATE POLICY conv_insert_own ON public.conversations
            FOR INSERT WITH CHECK (user1_id = auth.uid() OR user2_id = auth.uid());
    `);
    await knex.raw(`
        DROP POLICY IF EXISTS conv_update_own ON public.conversations;
        CREATE POLICY conv_update_own ON public.conversations
            FOR UPDATE USING (user1_id = auth.uid() OR user2_id = auth.uid());
    `);

    // 4) RLS for messages
    await knex.raw(`ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;`);
    await knex.raw(`
        DROP POLICY IF EXISTS msg_select_member ON public.messages;
        CREATE POLICY msg_select_member ON public.messages
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.conversations c
                    WHERE c.id = conversation_id
                      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
                )
            );
    `);
    await knex.raw(`
        DROP POLICY IF EXISTS msg_insert_member ON public.messages;
        CREATE POLICY msg_insert_member ON public.messages
            FOR INSERT WITH CHECK (
                sender_id = auth.uid()
                AND EXISTS (
                    SELECT 1 FROM public.conversations c
                    WHERE c.id = conversation_id
                      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
                )
            );
    `);
    await knex.raw(`
        DROP POLICY IF EXISTS msg_update_sender ON public.messages;
        CREATE POLICY msg_update_sender ON public.messages
            FOR UPDATE USING (sender_id = auth.uid());
    `);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.raw(`DROP TABLE IF EXISTS public.messages CASCADE;`);
    await knex.raw(`DROP TABLE IF EXISTS public.conversations CASCADE;`);
}
