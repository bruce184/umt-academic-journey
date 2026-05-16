import { db } from './src/db/knex.js';

async function main() {
    try {
        const cols = await db.raw("SELECT column_name FROM information_schema.columns WHERE table_name = 'post_media' ORDER BY ordinal_position");
        console.log('post_media columns:', cols.rows.map(r => r.column_name));

        const sample = await db('post_media').select('*').limit(2);
        console.log('Sample data:', JSON.stringify(sample, null, 2));
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        process.exit(0);
    }
}
main();
