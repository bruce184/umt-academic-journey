import db from './db/db.js';

(async () => {
  try {
    const users = await db('users').count('id as count').first();
    console.log(`User count: ${users.count}`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
