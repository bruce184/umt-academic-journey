import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

/**
 * Seed #1: Create or get demo users in Supabase Auth.
 * Stores mapping in public.seed_meta so other seeds can reuse IDs.
 *
 * Required env:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 *
 * @param { import("knex").Knex } knex
 */
export async function seed(knex) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SERVICE_ROLE) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.");
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 0) Ensure a tiny meta table exists to pass IDs between seeds
  const hasMeta = await knex.schema.hasTable("seed_meta");
  if (!hasMeta) {
    await knex.schema.createTable("seed_meta", (t) => {
      t.text("key").primary(); // e.g. 'demo_users'
      t.jsonb("value").notNullable(); // arbitrary json
      t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
      t.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    });
  }

  const demoUsers = [
    {
      email: "demo1@outstagram.local",
      password: "12345678",
      name: "Demo 1",
      username: "demo1",
      display_name: "Demo User 1",
      bio: "Hello Outstagram",
    },
    {
      email: "demo2@outstagram.local",
      password: "12345678",
      name: "Demo 2",
      username: "demo2",
      display_name: "Demo User 2",
      bio: "Second profile",
    },
    {
      email: "demo3@outstagram.local",
      password: "12345678",
      name: "Demo 3",
      username: "demo3",
      display_name: "Demo User 3",
      bio: "Third profile — lots of comments 😄",
    },
  ];

  // Helper: find user by email (paged list)
  async function findUserIdByEmail(email) {
    let page = 1;
    const perPage = 200;

    while (true) {
      const res = await supabase.auth.admin.listUsers({ page, perPage });
      if (res.error) throw res.error;

      const users = res.data?.users || [];
      const hit = users.find((u) => u.email === email);
      if (hit) return hit.id;

      if (users.length < perPage) break; // no more pages
      page += 1;
    }
    return null;
  }

  async function getOrCreateUser(u) {
    const existingId = await findUserIdByEmail(u.email);
    if (existingId) return existingId;

    const created = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: {
        display_name: u.display_name,
        username: u.username
      },
    });

    if (created.error) throw created.error;
    return created.data.user.id;
  }

  const mapping = {};
  for (const u of demoUsers) {
    const id = await getOrCreateUser(u);
    mapping[u.email] = {
      user_id: id,
      username: u.username,
      display_name: u.display_name,
      bio: u.bio,
    };
  }

  // Store mapping for next seed file
  await knex("seed_meta")
    .insert({
      key: "demo_users",
      value: mapping,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    })
    .onConflict("key")
    .merge({ value: mapping, updated_at: knex.fn.now() });

  // Quick sanity output to console (optional)
  // console.log("Seed demo users mapping:", mapping);
}
