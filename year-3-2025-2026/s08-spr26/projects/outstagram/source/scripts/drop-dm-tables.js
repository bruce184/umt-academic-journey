import "dotenv/config";
import knex from "knex";

const db = knex({
    client: "pg",
    connection: { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } },
});

try {
    await db.raw("DROP TABLE IF EXISTS public.messages CASCADE;");
    console.log("Dropped messages table");
    await db.raw("DROP TABLE IF EXISTS public.conversations CASCADE;");
    console.log("Dropped conversations table");
} catch (e) {
    console.error("Error:", e.message);
} finally {
    await db.destroy();
}
