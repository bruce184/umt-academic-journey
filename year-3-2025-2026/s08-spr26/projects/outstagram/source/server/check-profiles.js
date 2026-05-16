import "dotenv/config";
import { db } from "./src/db/knex.js";

try {
    // Check profiles table columns
    const cols = await db.raw(`
        SELECT column_name, column_default, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'role'
    `);
    console.log("=== 'role' column info ===");
    console.log(JSON.stringify(cols.rows, null, 2));

    // Check all profiles and their roles
    const profiles = await db("profiles").select("username", "role", "user_id").limit(10);
    console.log("\n=== Profile roles ===");
    profiles.forEach(p => console.log(`  ${p.username}: role = ${p.role}`));

} catch (e) {
    console.error("Error:", e.message);
} finally {
    await db.destroy();
}
