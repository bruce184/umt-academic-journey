import "dotenv/config";
import knex from "knex";

export const db = knex({
    client: "pg",
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    },
    pool: {
        min: 0,
        max: 10,
        acquireTimeoutMillis: 30000,
        idleTimeoutMillis: 10000,
    },
});
