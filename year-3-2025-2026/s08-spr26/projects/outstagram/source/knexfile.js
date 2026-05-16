import "dotenv/config";

export default {
    development: {
        client: "pg",
        connection: process.env.DATABASE_URL,
        migrations: { directory: "./db/migrations" },
        seeds: { directory: "./db/seeds" },
        pool: { min: 2, max: 10 },
    },
};
