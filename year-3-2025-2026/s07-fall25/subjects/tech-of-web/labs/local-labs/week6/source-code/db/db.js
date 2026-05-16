// db/db.js
import 'dotenv/config';
import knex from 'knex';
import cfg from '../knexfile.js';

const env = process.env.NODE_ENV || 'development';

function createKnex() {
  const db = knex(cfg[env]);

  // (Optional) Log SQL khi cần: set KNEX_DEBUG=true
  if ((process.env.KNEX_DEBUG || '').toLowerCase() === 'true') {
    db.on('query', (q) => {
      console.log('[SQL]', q.sql, q.bindings || []);
    });
  }
  return db;
}

// Singleton để tránh tạo nhiều pool khi nodemon reload
const db = globalThis.__knex ?? createKnex();
if (!globalThis.__knex) globalThis.__knex = db;

// Healthcheck tiện dùng ở /__health/db
export async function ping() {
  const r = await db.raw('select 1 as ok');
  return r.rows ? r.rows[0] : r[0];
}

// Đóng pool gọn gàng khi dừng app/tests
export async function closePool() {
  if (globalThis.__knex) {
    await globalThis.__knex.destroy();
    globalThis.__knex = undefined;
  }
}

if (process.env.NODE_ENV !== 'test') {
  const shutdown = async () => {
    try { await closePool(); } finally { /* không gọi process.exit tại đây */ }
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  process.on('beforeExit', shutdown);
}

export default db;
