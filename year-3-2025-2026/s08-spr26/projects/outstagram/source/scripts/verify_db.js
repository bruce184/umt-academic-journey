import knex from "knex";
import config from "../knexfile.js";

const db = knex(config.development);

async function verify() {
    console.log("Verifying DB State...");

    try {
        // 1. Check profiles columns (nullable?)
        const columns = await db("information_schema.columns")
            .select("column_name", "is_nullable")
            .where({ table_schema: "public", table_name: "profiles" })
            .whereIn("column_name", ["username", "display_name"]);

        console.log("Column Constraints:");
        columns.forEach((col) => {
            console.log(`- ${col.column_name}: is_nullable=${col.is_nullable}`);
        });

        // 2. Check Trigger existence
        const trigger = await db.raw(`
      SELECT trigger_name
      FROM information_schema.triggers
      WHERE event_object_table = 'users'
      AND event_object_schema = 'auth'
      AND trigger_name = 'on_auth_user_created';
    `);

        console.log("Trigger Check:");
        if (trigger.rows.length > 0) {
            console.log("- Trigger 'on_auth_user_created' EXISTS on auth.users ✅");
        } else {
            console.error("- Trigger 'on_auth_user_created' MISSING ❌");
        }

    } catch (err) {
        console.error("Verification failed:", err);
    } finally {
        await db.destroy();
    }
}

verify();
