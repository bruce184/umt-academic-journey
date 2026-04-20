/**
 * Knex configuration (ESM)
 *
 * Converted to ESM `export default` so it can be imported with:
 *   `import knexConfig from '../knexfile.js';`
 *
 * Migration/seeds/pool are placed inside each environment object.
 */
export default {
  development: {
    client: 'pg',
    // Use DATABASE_URL when provided (e.g., cloud DB). For cloud DBs that
    // require SSL set DATABASE_SSL=true. For local development fall back to
    // explicit connection options.
    connection: process.env.DATABASE_URL
      ? process.env.DATABASE_SSL === 'true'
        ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
        : process.env.DATABASE_URL
      : {
          host: process.env.PG_HOST || '127.0.0.1',
          user: process.env.PG_USER || 'postgres',
          password: process.env.PG_PASSWORD || '',
          database: process.env.PG_DATABASE || 'midterm'
        },
    migrations: {
      directory: './db/migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './db/seeds'
    }
  }
};

