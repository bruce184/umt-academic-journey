// src/models/db.js
// Single Knex instance for the whole application.

import knex from "knex";
import knexConfig from "../../knexfile.js"; // path: from src/models to project root
import { env } from "../config/env.js";

// Determine current environment (development | test | production)
const environment = env.nodeEnv;

// Resolve configuration for current environment
const configForEnv = knexConfig[environment];

if (!configForEnv) {
  throw new Error(
    `[db] No Knex configuration found for NODE_ENV="${environment}". ` +
      `Please check knexfile.js.`
  );
}

// Create a single Knex instance
export const db = knex(configForEnv);

// Optional: export as default for simpler imports
// Usage in other files:  import db from "../models/db.js";
export default db;
