// db/seed.js
const db = require('./index');
const s002 = require('./seeds/002_seed_users');

async function seed() {
  try {
    console.log('Seeding: 002_seed_users');
    await s002.seed(db);
    console.log('Seeding done.');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
