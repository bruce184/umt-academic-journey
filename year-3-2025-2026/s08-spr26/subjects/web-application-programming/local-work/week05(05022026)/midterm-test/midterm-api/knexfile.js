import "dotenv/config";

export default {
  development: {
    client: "pg",
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false } // Supabase usually requires SSL
    },
    migrations: {
      directory: "./db/migrations",
      tableName: "knex_migrations"
    },
    seeds: {
      directory: "./db/seeds"
    },
    pool: { min: 2, max: 10 }
  }
};
