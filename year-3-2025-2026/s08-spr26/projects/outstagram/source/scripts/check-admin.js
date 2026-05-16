import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import knex from "knex";

const db = knex({
    client: "pg",
    connection: { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } },
});

try {
    // Check all profiles and their roles
    const profiles = await db("profiles").select("user_id", "username", "display_name", "role", "is_banned");
    console.log("=== All Profiles ===");
    profiles.forEach(p => {
        console.log(`  ${p.username} (${p.display_name}) — role: ${p.role}, banned: ${p.is_banned}, uid: ${p.user_id}`);
    });

    // Try to find admin by searching for admin-related roles
    const admins = profiles.filter(p => p.role && p.role !== 'user');
    console.log("\n=== Non-user roles ===");
    if (admins.length === 0) {
        console.log("  No admin/moderator accounts found!");
    } else {
        admins.forEach(a => console.log(`  ${a.username}: ${a.role}`));
    }
} catch (e) {
    console.error("Error:", e.message);
} finally {
    await db.destroy();
}
