// src/config/env.js
// Centralized environment configuration + validation

import dotenv from "dotenv";

// Load .env into process.env (if not already loaded)
dotenv.config();

/**
 * Helper: get required env var or throw an error on startup.
 * This ensures we fail fast when something critical is missing.
 */
function requireEnv(name) {
  const value = process.env[name];
  if (value === undefined || value === null || value === "") {
    throw new Error(
      `[env] Missing required environment variable: ${name}. ` +
        `Please check your .env or deployment config.`
    );
  }
  return value;
}

/**
 * Application-wide env configuration object.
 * Import this anywhere via:  import { env } from "../config/env.js";
 */
export const env = {
  // Node environment (development | test | production)
  nodeEnv: process.env.NODE_ENV || "development",

  // HTTP port for the Express app (default 5000)
  port: Number(process.env.PORT || 5000),

  // Session / JWT secrets
  // You can reuse SECRET for JWT if you don't want separate keys.
  sessionSecret: requireEnv("SECRET"),
  jwtSecret: process.env.JWT_SECRET || requireEnv("SECRET"),

  // Database (PostgreSQL via Knex)
  db: {
    host: requireEnv("DB_HOST"),
    port: Number(requireEnv("DB_PORT")), // e.g. 5432
    user: requireEnv("DB_USER"),
    password: requireEnv("DB_PASSWORD"),
    database: requireEnv("DB_NAME"),
  },
};

export default env;
