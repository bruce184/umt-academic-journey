/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    // 1. Update profiles schema
    await knex.schema.alterTable("profiles", (table) => {
        table.string("username").notNullable().alter();
        table.string("display_name").notNullable().alter();
    });

    // 2. Create Trigger Function to handle new user signup
    await knex.raw(`
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER SET search_path = public
    AS $$
    BEGIN
      INSERT INTO public.profiles (user_id, display_name, username)
      VALUES (
        new.id,
        new.raw_user_meta_data->>'display_name',
        new.raw_user_meta_data->>'username'
      );
      RETURN new;
    END;
    $$;
  `);

    // 3. Create Trigger
    await knex.raw(`
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    // 1. Drop Trigger
    await knex.raw(`DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;`);

    // 2. Drop Function
    await knex.raw(`DROP FUNCTION IF EXISTS public.handle_new_user();`);

    // 3. Revert schema changes (make nullable)
    await knex.schema.alterTable("profiles", (table) => {
        table.string("username").nullable().alter();
        table.string("display_name").nullable().alter();
    });
};
