import db from './db.js';

async function main() {
  try {
    const r = await db.raw('SELECT NOW()');
    console.log('✅ Connected! NOW() =', r.rows[0].now);
  } catch (e) {
    console.error('❌ Connection failed:', e.message);
  } finally {
    await db.destroy();
  }
}
main();
