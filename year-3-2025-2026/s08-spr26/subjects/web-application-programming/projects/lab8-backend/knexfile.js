import dotenv from "dotenv";

dotenv.config();

/** @type {import('knex').Knex.Config} */
const baseConfig = {
  client: process.env.DB_CLIENT || "pg",
  connection: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  migrations: {
    directory: "./db/migrations",
    extension: "js",
  },
  seeds: {
    directory: "./db/seeds",
    extension: "js",
  },
};

export default {
  development: baseConfig,
};