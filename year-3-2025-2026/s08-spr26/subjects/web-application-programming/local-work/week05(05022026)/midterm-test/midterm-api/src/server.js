import "dotenv/config";
import app from "./app.js";
import db from "./db/db.js";

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    // Check DB connection (Supabase)
    // await db.raw("SELECT 1 as ok");
    console.log("Database connection check skipped (no credentials).");

    app.listen(PORT, () => console.log(`Server is listening on: http://localhost:${PORT}`));
  } catch (err) {
    console.error("Unable to start server:", err);
    process.exit(1);
  }
}

start();
