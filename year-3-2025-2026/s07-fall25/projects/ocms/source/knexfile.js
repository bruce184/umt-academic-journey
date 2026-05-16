// knexfile.js
// Knex configuration for different environments (ES Modules version)

import dotenv from "dotenv";

dotenv.config();

/**
 * Common connection object using environment variables.
 * These variables MUST be set in .env (or your deployment environment).
 */
const baseConnection = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export default {
  development: {
    client: "pg",
    connection: baseConnection,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },

  // You can customize test environment separately if needed
  test: {
    client: "pg",
    connection: baseConnection,
    pool: {
      min: 1,
      max: 5,
    },
    migrations: {
      tableName: "knex_migrations_test",
    },
  },

  // Production config — adjust according to your deployment setup
  production: {
    client: "pg",
    connection: baseConnection,
    pool: {
      min: 2,
      max: 20,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },
};
