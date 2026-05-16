/**
 * Notifications Triggers Migration
 * - Creates helper function for notification creation
 * - Creates triggers on follows, post_likes, comments tables
 * - Sets up RLS policies for notifications table
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    // 1) Create helper function to safely insert notifications
    // SECURITY DEFINER runs as the function owner (superuser), bypassing RLS
    await knex.raw(`
        CREATE OR REPLACE FUNCTION public.create_notification(
            p_type public.notification_type,
            p_actor_id uuid,
            p_recipient_id uuid,
            p_post_id bigint DEFAULT NULL,
            p_comment_id bigint DEFAULT NULL
        )
        RETURNS bigint
        LANGUAGE plpgsql
        SECURITY DEFINER
        SET search_path = public
        AS $$
        DECLARE
            v_notification_id bigint;
        BEGIN
            -- Skip self-notifications
            IF p_actor_id = p_recipient_id THEN
                RETURN NULL;
            END IF;

            -- Skip if recipient doesn't exist (profile deleted)
            IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = p_recipient_id) THEN
                RETURN NULL;
            END IF;

            -- Dedupe for follow and like (only one notification per actor-recipient-type-post combo)
            IF p_type IN ('follow', 'like') THEN
                SELECT id INTO v_notification_id
                FROM public.notifications
                WHERE type = p_type
                  AND actor_id = p_actor_id
                  AND recipient_id = p_recipient_id
                  AND (post_id IS NOT DISTINCT FROM p_post_id);
                
                IF v_notification_id IS NOT NULL THEN
                    RETURN v_notification_id;
                END IF;
            END IF;

            -- Insert notification (using SECURITY DEFINER bypasses RLS)
            INSERT INTO public.notifications (type, actor_id, recipient_id, post_id, comment_id, is_read)
            VALUES (p_type, p_actor_id, p_recipient_id, p_post_id, p_comment_id, false)
            RETURNING id INTO v_notification_id;

            RETURN v_notification_id;
        EXCEPTION
            WHEN others THEN
                -- Log error but don't fail the parent transaction
                RAISE WARNING 'create_notification error: %', SQLERRM;
                RETURN NULL;
        END;
        $$;
    `);

    // 2) Trigger function for follows
    await knex.raw(`
        CREATE OR REPLACE FUNCTION public.notify_on_follow()
        RETURNS trigger
        LANGUAGE plpgsql
        SECURITY DEFINER
        SET search_path = public
        AS $$
        BEGIN
            PERFORM public.create_notification(
                'follow'::public.notification_type,
                NEW.follower_id,
                NEW.following_id,
                NULL,
                NULL
            );
            RETURN NEW;
        END;
        $$;
    `);

    // 3) Trigger function for post_likes
    await knex.raw(`
        CREATE OR REPLACE FUNCTION public.notify_on_like()
        RETURNS trigger
        LANGUAGE plpgsql
        SECURITY DEFINER
        SET search_path = public
        AS $$
        DECLARE
            v_owner_id uuid;
        BEGIN
            -- Get post owner
            SELECT owner_id INTO v_owner_id
            FROM public.posts
            WHERE id = NEW.post_id;

            IF v_owner_id IS NOT NULL THEN
                PERFORM public.create_notification(
                    'like'::public.notification_type,
                    NEW.user_id,
                    v_owner_id,
                    NEW.post_id,
                    NULL
                );
            END IF;

            RETURN NEW;
        END;
        $$;
    `);

    // 4) Trigger function for comments
    await knex.raw(`
        CREATE OR REPLACE FUNCTION public.notify_on_comment()
        RETURNS trigger
        LANGUAGE plpgsql
        SECURITY DEFINER
        SET search_path = public
        AS $$
        DECLARE
            v_post_owner_id uuid;
            v_parent_owner_id uuid;
        BEGIN
            -- Get post owner
            SELECT owner_id INTO v_post_owner_id
            FROM public.posts
            WHERE id = NEW.post_id;

            -- Notify post owner
            IF v_post_owner_id IS NOT NULL THEN
                PERFORM public.create_notification(
                    'comment'::public.notification_type,
                    NEW.user_id,
                    v_post_owner_id,
                    NEW.post_id,
                    NEW.id
                );
            END IF;

            -- If this is a reply, also notify parent comment owner
            IF NEW.parent_id IS NOT NULL THEN
                SELECT user_id INTO v_parent_owner_id
                FROM public.comments
                WHERE id = NEW.parent_id;

                -- Only notify if parent owner is different from post owner (avoid duplicate)
                IF v_parent_owner_id IS NOT NULL AND v_parent_owner_id IS DISTINCT FROM v_post_owner_id THEN
                    PERFORM public.create_notification(
                        'comment'::public.notification_type,
                        NEW.user_id,
                        v_parent_owner_id,
                        NEW.post_id,
                        NEW.id
                    );
                END IF;
            END IF;

            RETURN NEW;
        END;
        $$;
    `);

    // 5) Create triggers
    await knex.raw(`
        DROP TRIGGER IF EXISTS trg_notify_follow ON public.follows;
        CREATE TRIGGER trg_notify_follow
            AFTER INSERT ON public.follows
            FOR EACH ROW
            EXECUTE FUNCTION public.notify_on_follow();
    `);

    await knex.raw(`
        DROP TRIGGER IF EXISTS trg_notify_like ON public.post_likes;
        CREATE TRIGGER trg_notify_like
            AFTER INSERT ON public.post_likes
            FOR EACH ROW
            EXECUTE FUNCTION public.notify_on_like();
    `);

    await knex.raw(`
        DROP TRIGGER IF EXISTS trg_notify_comment ON public.comments;
        CREATE TRIGGER trg_notify_comment
            AFTER INSERT ON public.comments
            FOR EACH ROW
            EXECUTE FUNCTION public.notify_on_comment();
    `);

    // 6) Enable RLS on notifications (if not already enabled)
    await knex.raw(`
        ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
    `);

    // 7) Drop existing policies if any (for idempotency)
    await knex.raw(`
        DROP POLICY IF EXISTS notifications_select_own ON public.notifications;
        DROP POLICY IF EXISTS notifications_update_own ON public.notifications;
        DROP POLICY IF EXISTS notifications_insert_trigger ON public.notifications;
    `);

    // 8) Create RLS policies
    // Users can only SELECT their own notifications
    await knex.raw(`
        CREATE POLICY notifications_select_own ON public.notifications
            FOR SELECT
            USING (recipient_id = auth.uid());
    `);

    // Users can only UPDATE their own notifications (for marking read)
    await knex.raw(`
        CREATE POLICY notifications_update_own ON public.notifications
            FOR UPDATE
            USING (recipient_id = auth.uid())
            WITH CHECK (recipient_id = auth.uid());
    `);

    // Allow INSERT for service role (triggers run as function owner which has elevated privileges)
    // This policy allows inserts but only if actor != recipient (no self-notifications)
    await knex.raw(`
        CREATE POLICY notifications_insert_trigger ON public.notifications
            FOR INSERT
            WITH CHECK (actor_id IS DISTINCT FROM recipient_id);
    `);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    // Drop triggers
    await knex.raw(`DROP TRIGGER IF EXISTS trg_notify_follow ON public.follows;`);
    await knex.raw(`DROP TRIGGER IF EXISTS trg_notify_like ON public.post_likes;`);
    await knex.raw(`DROP TRIGGER IF EXISTS trg_notify_comment ON public.comments;`);

    // Drop trigger functions
    await knex.raw(`DROP FUNCTION IF EXISTS public.notify_on_follow();`);
    await knex.raw(`DROP FUNCTION IF EXISTS public.notify_on_like();`);
    await knex.raw(`DROP FUNCTION IF EXISTS public.notify_on_comment();`);

    // Drop helper function
    await knex.raw(`DROP FUNCTION IF EXISTS public.create_notification(public.notification_type, uuid, uuid, bigint, bigint);`);

    // Drop RLS policies
    await knex.raw(`DROP POLICY IF EXISTS notifications_select_own ON public.notifications;`);
    await knex.raw(`DROP POLICY IF EXISTS notifications_update_own ON public.notifications;`);
    await knex.raw(`DROP POLICY IF EXISTS notifications_insert_trigger ON public.notifications;`);

    // Disable RLS
    await knex.raw(`ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;`);
}
