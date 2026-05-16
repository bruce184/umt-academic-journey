/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    // Update the function to handle missing username from metadata (Google Auth case)
    await knex.raw(`
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER SET search_path = public
    AS $$
    DECLARE
      _username text;
      _display_name text;
    BEGIN
      -- 1. Determine Display Name: metadata or 'New User'
      _display_name := COALESCE(
        new.raw_user_meta_data->>'display_name',
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'name',
        'New User'
      );

      -- 2. Determine Username: metadata or auto-generate 'user_<uuid_part>'
      _username := new.raw_user_meta_data->>'username';
      
      IF _username IS NULL OR _username = '' THEN
        _username := 'user_' || substr(new.id::text, 1, 8);
      END IF;

      -- 3. Insert into profiles
      INSERT INTO public.profiles (user_id, display_name, username)
      VALUES (new.id, _display_name, _username);

      RETURN new;
    END;
    $$;
  `);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    // Revert to original simpler version (strictly expecting metadata)
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
}
