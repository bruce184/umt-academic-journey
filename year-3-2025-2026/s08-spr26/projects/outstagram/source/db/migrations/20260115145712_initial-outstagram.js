/**
 * Outstagram DB migration (MVP + Social Interactions)
 * - public schema tables + FK to auth.users
 * - Postgres enums: public.media_type, public.notification_type
 * - updated_at trigger helper
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    // 1) Enum types (Postgres native) - schema-safe check (public only)
    await knex.raw(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE t.typname = 'media_type' AND n.nspname = 'public'
      ) THEN
        CREATE TYPE public.media_type AS ENUM ('image', 'video');
      END IF;

      IF NOT EXISTS (
        SELECT 1
        FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE t.typname = 'notification_type' AND n.nspname = 'public'
      ) THEN
        CREATE TYPE public.notification_type AS ENUM ('follow', 'like', 'comment');
      END IF;
    END $$;
  `);

    // 2) updated_at trigger function
    await knex.raw(`
    CREATE OR REPLACE FUNCTION public.set_updated_at()
    RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END; $$;
  `);

    // 3) profiles (1-1 auth.users)
    await knex.schema.createTable("profiles", (t) => {
        t.uuid("user_id").primary();
        t.text("username").unique().nullable(); // @username
        t.text("display_name").notNullable().defaultTo("");
        t.text("bio").notNullable().defaultTo("");
        t.text("avatar_url").nullable();
        t.text("avatar_path").nullable();
        t.boolean("is_private").notNullable().defaultTo(false);
        t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
        t.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

        // FK -> auth.users(id)
        t.foreign("user_id").references("id").inTable("auth.users").onDelete("CASCADE");
    });

    await knex.raw(`
    ALTER TABLE public.profiles
      ADD CONSTRAINT username_len CHECK (username IS NULL OR length(username) BETWEEN 3 AND 30);
  `);
    await knex.raw(`
    ALTER TABLE public.profiles
      ADD CONSTRAINT bio_len CHECK (length(bio) <= 500);
  `);

    await knex.raw(`
    DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
    CREATE TRIGGER trg_profiles_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  `);

    await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles (username);
  `);

    // 4) posts
    await knex.schema.createTable("posts", (t) => {
        t.bigIncrements("id").primary();
        t.uuid("owner_id").notNullable();
        t.text("caption").notNullable().defaultTo("");
        t.boolean("is_deleted").notNullable().defaultTo(false);
        t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
        t.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

        t.foreign("owner_id").references("user_id").inTable("profiles").onDelete("CASCADE");
    });

    await knex.raw(`
    ALTER TABLE public.posts
      ADD CONSTRAINT caption_len CHECK (length(caption) <= 2200);
  `);

    await knex.raw(`
    DROP TRIGGER IF EXISTS trg_posts_updated_at ON public.posts;
    CREATE TRIGGER trg_posts_updated_at
      BEFORE UPDATE ON public.posts
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  `);

    await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_posts_created_at_desc ON public.posts (created_at DESC);
  `);
    await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_posts_owner_created_at_desc ON public.posts (owner_id, created_at DESC);
  `);
    // Helpful for feed queries that always filter soft-deleted posts
    await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_posts_active_created_at_desc
    ON public.posts (created_at DESC)
    WHERE is_deleted = false;
  `);

    // 5) post_media (multi images/videos per post)
    await knex.schema.createTable("post_media", (t) => {
        t.bigIncrements("id").primary();
        t.bigInteger("post_id").notNullable();
        t.specificType("media_type", "public.media_type")
            .notNullable()
            .defaultTo(knex.raw("'image'::public.media_type"));
        t.text("media_url").notNullable();
        t.text("media_path").nullable();
        t.integer("position").notNullable().defaultTo(0);
        t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

        t.foreign("post_id").references("id").inTable("posts").onDelete("CASCADE");
        t.unique(["post_id", "position"]);
    });

    await knex.raw(`
    ALTER TABLE public.post_media
      ADD CONSTRAINT chk_position_nonneg CHECK (position >= 0);
  `);
    await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_post_media_post_position ON public.post_media (post_id, position);
  `);

    // 6) follows (self many-to-many)
    await knex.schema.createTable("follows", (t) => {
        t.uuid("follower_id").notNullable();
        t.uuid("following_id").notNullable();
        t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

        t.primary(["follower_id", "following_id"]);
        t.foreign("follower_id").references("user_id").inTable("profiles").onDelete("CASCADE");
        t.foreign("following_id").references("user_id").inTable("profiles").onDelete("CASCADE");
    });

    await knex.raw(`
    ALTER TABLE public.follows
      ADD CONSTRAINT no_self_follow CHECK (follower_id <> following_id);
  `);

    await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows (follower_id);
  `);
    await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows (following_id);
  `);
    // Optional but useful for "list following/followers newest first"
    await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_follows_follower_created_at_desc
    ON public.follows (follower_id, created_at DESC);
  `);
    await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_follows_following_created_at_desc
    ON public.follows (following_id, created_at DESC);
  `);

    // 7) post_likes
    await knex.schema.createTable("post_likes", (t) => {
        t.bigInteger("post_id").notNullable();
        t.uuid("user_id").notNullable();
        t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

        t.primary(["post_id", "user_id"]);
        t.foreign("post_id").references("id").inTable("posts").onDelete("CASCADE");
        t.foreign("user_id").references("user_id").inTable("profiles").onDelete("CASCADE");
    });

    await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_post_likes_post ON public.post_likes (post_id);
  `);
    await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_post_likes_user ON public.post_likes (user_id);
  `);

    // 8) comments
    await knex.schema.createTable("comments", (t) => {
        t.bigIncrements("id").primary();
        t.bigInteger("post_id").notNullable();
        t.uuid("user_id").notNullable();
        t.text("content").notNullable();
        t.bigInteger("parent_id").nullable();
        t.boolean("is_deleted").notNullable().defaultTo(false);
        t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
        t.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

        t.foreign("post_id").references("id").inTable("posts").onDelete("CASCADE");
        t.foreign("user_id").references("user_id").inTable("profiles").onDelete("CASCADE");
        // Replies: keep thread safer if parent is hard-deleted
        t.foreign("parent_id").references("id").inTable("comments").onDelete("SET NULL");
    });

    await knex.raw(`
    ALTER TABLE public.comments
      ADD CONSTRAINT content_len CHECK (length(content) BETWEEN 1 AND 1000);
  `);

    await knex.raw(`
    DROP TRIGGER IF EXISTS trg_comments_updated_at ON public.comments;
    CREATE TRIGGER trg_comments_updated_at
      BEFORE UPDATE ON public.comments
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  `);

    await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_comments_post_created_at ON public.comments (post_id, created_at ASC);
  `);
    await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_comments_user ON public.comments (user_id);
  `);

    // 9) notifications
    await knex.schema.createTable("notifications", (t) => {
        t.bigIncrements("id").primary();
        t.uuid("recipient_id").notNullable();
        t.uuid("actor_id").notNullable();
        t.specificType("type", "public.notification_type").notNullable();
        t.bigInteger("post_id").nullable();
        t.bigInteger("comment_id").nullable();
        t.boolean("is_read").notNullable().defaultTo(false);
        t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

        t.foreign("recipient_id").references("user_id").inTable("profiles").onDelete("CASCADE");
        t.foreign("actor_id").references("user_id").inTable("profiles").onDelete("CASCADE");
        t.foreign("post_id").references("id").inTable("posts").onDelete("CASCADE");
        t.foreign("comment_id").references("id").inTable("comments").onDelete("CASCADE");
    });

    // Make this migration re-runnable (avoid duplicate constraint name errors)
    await knex.raw(`
    ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notif_type_link_chk;
    ALTER TABLE public.notifications
      ADD CONSTRAINT notif_type_link_chk CHECK (
        (type = 'follow' AND post_id IS NULL AND comment_id IS NULL)
        OR
        (type = 'like' AND post_id IS NOT NULL AND comment_id IS NULL)
        OR
        (type = 'comment' AND post_id IS NOT NULL AND comment_id IS NOT NULL)
      );
  `);

    await knex.raw(`
    ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS no_self_notify;
    ALTER TABLE public.notifications
      ADD CONSTRAINT no_self_notify CHECK (recipient_id <> actor_id);
  `);

    await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_notifications_recipient_created_at
    ON public.notifications (recipient_id, created_at DESC);
  `);
    await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_notifications_unread
    ON public.notifications (recipient_id)
    WHERE is_read = false;
  `);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    // Drop tables in reverse dependency order
    await knex.schema.dropTableIfExists("notifications");
    await knex.schema.dropTableIfExists("comments");
    await knex.schema.dropTableIfExists("post_likes");
    await knex.schema.dropTableIfExists("follows");
    await knex.schema.dropTableIfExists("post_media");
    await knex.schema.dropTableIfExists("posts");
    await knex.schema.dropTableIfExists("profiles");

    // Drop triggers/function/types
    await knex.raw(`DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;`);
    await knex.raw(`DROP TYPE IF EXISTS public.notification_type CASCADE;`);
    await knex.raw(`DROP TYPE IF EXISTS public.media_type CASCADE;`);
}
