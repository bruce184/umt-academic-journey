require('dotenv').config();
const { Pool } = require('pg');

const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.PGHOST || 'localhost',
      port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
    };

const pool = new Pool(poolConfig);

(async () => {
  try {
    const res = await pool.query('SELECT 1 as ok');
    console.log('PG test OK', res.rows);
  } catch (err) {
    console.error('PG test failed', err && err.stack ? err.stack : err);
  } finally {
    await pool.end();
  }
})();
