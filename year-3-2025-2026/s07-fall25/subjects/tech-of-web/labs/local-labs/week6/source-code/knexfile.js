import 'dotenv/config';

const fromUrl = (url) => ({
  connectionString: url,                     
  ssl: { rejectUnauthorized: false },        
});

const fromParts = () => ({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl:
    (process.env.DB_SSL || '').toLowerCase() === 'require' ||
    (process.env.DB_SSL || '').toLowerCase() === 'true'
      ? { rejectUnauthorized: false }
      : undefined,
});

const connection = process.env.DATABASE_URL ? fromUrl(process.env.DATABASE_URL) : fromParts();

const base = {
  client: 'pg',
  connection,
  // dùng schema 'public' mặc định của Supabase
  searchPath: ['public'],
  pool: { min: 2, max: 10, idleTimeoutMillis: 10_000 },
  // bật log SQL khi cần: KNEX_DEBUG=true
  debug: (process.env.KNEX_DEBUG || '').toLowerCase() === 'true',
  migrations: { directory: './db/migrations', tableName: 'knex_migrations' },
  seeds: { directory: './db/seeds' },
};

export default {
  development: { ...base },
  production:  { ...base },
  test:        { ...base, pool: { min: 1, max: 2, idleTimeoutMillis: 5_000 } },
};
