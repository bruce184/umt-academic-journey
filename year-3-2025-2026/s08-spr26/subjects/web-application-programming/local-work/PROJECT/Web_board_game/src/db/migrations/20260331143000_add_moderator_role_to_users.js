/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    await knex.raw(`
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM pg_type
                WHERE typname = 'users_role'
            ) THEN
                BEGIN
                    ALTER TYPE "users_role" ADD VALUE IF NOT EXISTS 'moderator';
                EXCEPTION
                    WHEN duplicate_object THEN NULL;
                END;
            ELSE
                ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_role_check";
                ALTER TABLE "users"
                    ADD CONSTRAINT "users_role_check"
                    CHECK ("role" IN ('admin', 'moderator', 'user'));
            END IF;
        END
        $$;
    `);
};

/**
 * PostgreSQL enums cannot safely remove a single value without rebuilding the type.
 * Keep down as a no-op to avoid destructive role rewrites.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function () {
    return Promise.resolve();
};
