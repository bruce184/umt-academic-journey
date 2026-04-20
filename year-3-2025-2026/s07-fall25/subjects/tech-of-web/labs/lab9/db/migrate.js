// db/migrate.js
const db = require('./index');                // { run, get, all, db: rawDb }
const m001 = require('./migrations/001_add_users');

async function migrate() {
  try {
    console.log('Running migration: 001_add_users');
    await m001.up(db);
    console.log('Migrations done.');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrate();
