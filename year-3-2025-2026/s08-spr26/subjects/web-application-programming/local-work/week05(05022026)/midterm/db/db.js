import knex from "knex";
import knexConfig from "../knexfile.js";

// Note: knexfile.js was converted to ESM and now exports a default config object.
// We import the default and select the environment-specific configuration.
const env = process.env.NODE_ENV || "development";
const db = knex(knexConfig[env]);

export default db;
