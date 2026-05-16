/**
 * Seed #2: Seed public tables (profiles/posts/media/follows/likes/comments/notifications)
 * using user ids from seed_meta('demo_users') produced by seed #1.
 *
 * @param { import("knex").Knex } knex
 */
export async function seed(knex) {
  // 0) Read user mapping created by seed #1
  const row = await knex("seed_meta").select("value").where({ key: "demo_users" }).first();
  if (!row?.value) {
    throw new Error("seed_meta.demo_users not found. Run seeds from start: knex seed:run");
  }

  const mapping = row.value;
  const demo1 = mapping["demo1@outstagram.local"]?.user_id;
  const demo2 = mapping["demo2@outstagram.local"]?.user_id;
  const demo3 = mapping["demo3@outstagram.local"]?.user_id;

  if (!demo1 || !demo2 || !demo3) {
    throw new Error("Missing demo user ids in seed_meta.demo_users.");
  }

  // Optional reset public data only (safe-ish for dev)
  const RESET = process.env.SEED_RESET === "true";
  if (RESET) {
    await knex("notifications").del();
    await knex("comments").del();
    await knex("post_likes").del();
    await knex("follows").del();
    await knex("post_media").del();
    await knex("posts").del();
    await knex("profiles").del();
  }

  // 1) Profiles (upsert)
  const profiles = [
    {
      user_id: demo1,
      username: mapping["demo1@outstagram.local"].username,
      display_name: mapping["demo1@outstagram.local"].display_name,
      bio: mapping["demo1@outstagram.local"].bio,
      is_private: false,
      updated_at: knex.fn.now(),
    },
    {
      user_id: demo2,
      username: mapping["demo2@outstagram.local"].username,
      display_name: mapping["demo2@outstagram.local"].display_name,
      bio: mapping["demo2@outstagram.local"].bio,
      is_private: false,
      updated_at: knex.fn.now(),
    },
    {
      user_id: demo3,
      username: mapping["demo3@outstagram.local"].username,
      display_name: mapping["demo3@outstagram.local"].display_name,
      bio: mapping["demo3@outstagram.local"].bio,
      is_private: false,
      updated_at: knex.fn.now(),
    },
  ];

  await knex("profiles")
    .insert(profiles)
    .onConflict("user_id")
    .merge({
      username: knex.raw("EXCLUDED.username"),
      display_name: knex.raw("EXCLUDED.display_name"),
      bio: knex.raw("EXCLUDED.bio"),
      is_private: knex.raw("EXCLUDED.is_private"),
      updated_at: knex.fn.now(),
    });

  // 2) Follows (demo2 + demo3 follow demo1)
  await knex("follows")
    .insert([
      { follower_id: demo2, following_id: demo1, created_at: knex.fn.now() },
      { follower_id: demo3, following_id: demo1, created_at: knex.fn.now() },
      { follower_id: demo3, following_id: demo2, created_at: knex.fn.now() },
    ])
    .onConflict(["follower_id", "following_id"])
    .ignore();

  // 3) Posts (return ids)
  const insertedPosts = await knex("posts")
    .insert([
      { owner_id: demo1, caption: "My first album post! 📸", created_at: knex.fn.now(), updated_at: knex.fn.now() },
      { owner_id: demo2, caption: "Coffee and code ☕💻", created_at: knex.fn.now(), updated_at: knex.fn.now() },
    ])
    .returning(["id", "owner_id"]);

  const p1 = insertedPosts[0];
  const p2 = insertedPosts[1];

  // 4) Post media (enum cast + unique positions)
  await knex("post_media")
    .insert([
      { post_id: p1.id, media_type: knex.raw("'image'::public.media_type"), media_url: "https://picsum.photos/seed/outstagram_seed_1a/900/900", position: 0, created_at: knex.fn.now() },
      { post_id: p1.id, media_type: knex.raw("'image'::public.media_type"), media_url: "https://picsum.photos/seed/outstagram_seed_1b/900/900", position: 1, created_at: knex.fn.now() },
      { post_id: p2.id, media_type: knex.raw("'image'::public.media_type"), media_url: "https://picsum.photos/seed/outstagram_seed_2a/900/900", position: 0, created_at: knex.fn.now() },
    ])
    .onConflict(["post_id", "position"])
    .ignore();

  // 5) Likes
  await knex("post_likes")
    .insert([
      { post_id: p1.id, user_id: demo2, created_at: knex.fn.now() },
      { post_id: p1.id, user_id: demo3, created_at: knex.fn.now() },
      { post_id: p2.id, user_id: demo1, created_at: knex.fn.now() },
    ])
    .onConflict(["post_id", "user_id"])
    .ignore();

  // 6) Comments + replies (need ids)
  const parentComments = await knex("comments")
    .insert([
      { post_id: p1.id, user_id: demo2, content: "Nice album!", parent_id: null, created_at: knex.fn.now(), updated_at: knex.fn.now() },
      { post_id: p1.id, user_id: demo3, content: "Congrats on launching 🚀", parent_id: null, created_at: knex.fn.now(), updated_at: knex.fn.now() },
      { post_id: p2.id, user_id: demo1, content: "Coffee is life 😄", parent_id: null, created_at: knex.fn.now(), updated_at: knex.fn.now() },
    ])
    .returning(["id", "post_id", "user_id"]);

  const c1 = parentComments[0]; // on p1 by demo2
  const c2 = parentComments[1]; // on p1 by demo3

  const replyComments = await knex("comments")
    .insert([
      { post_id: p1.id, user_id: demo1, content: "Thanks 🙌", parent_id: c1.id, created_at: knex.fn.now(), updated_at: knex.fn.now() },
      { post_id: p1.id, user_id: demo1, content: "Cảm ơn nhé!", parent_id: c2.id, created_at: knex.fn.now(), updated_at: knex.fn.now() },
    ])
    .returning(["id", "post_id", "user_id", "parent_id"]);

  // 7) Notifications (must satisfy your CHECK)
  // follow: post_id null, comment_id null
  // like: post_id not null, comment_id null
  // comment: post_id not null, comment_id not null
  // no_self_notify: recipient != actor
  const notifications = [
    // Follow notifications
    { recipient_id: demo1, actor_id: demo2, type: "follow", post_id: null, comment_id: null, is_read: false, created_at: knex.fn.now() },
    { recipient_id: demo1, actor_id: demo3, type: "follow", post_id: null, comment_id: null, is_read: false, created_at: knex.fn.now() },

    // Like notifications (recipient = post owner)
    { recipient_id: demo1, actor_id: demo2, type: "like", post_id: p1.id, comment_id: null, is_read: false, created_at: knex.fn.now() },
    { recipient_id: demo1, actor_id: demo3, type: "like", post_id: p1.id, comment_id: null, is_read: false, created_at: knex.fn.now() },
    { recipient_id: demo2, actor_id: demo1, type: "like", post_id: p2.id, comment_id: null, is_read: false, created_at: knex.fn.now() },

    // Comment notifications (recipient = post owner)
    { recipient_id: demo1, actor_id: demo2, type: "comment", post_id: p1.id, comment_id: c1.id, is_read: false, created_at: knex.fn.now() },
    { recipient_id: demo1, actor_id: demo3, type: "comment", post_id: p1.id, comment_id: c2.id, is_read: false, created_at: knex.fn.now() },
  ];

  await knex("notifications").insert(
    notifications.map((n) => ({
      ...n,
      type: knex.raw(`'${n.type}'::public.notification_type`),
    }))
  );
}
