import { db as knex } from '../src/db/knex.js';

async function recreateReportsTable() {
    try {
        // Drop existing table with wrong schema
        await knex.schema.dropTableIfExists('reports');
        console.log('Dropped old reports table.');

        // Recreate with correct schema
        await knex.schema.createTable('reports', (table) => {
            table.bigIncrements('id').primary();
            table.uuid('reporter_id').notNullable().references('user_id').inTable('profiles');
            table.text('target_type').notNullable(); // 'post', 'comment', 'profile'
            table.text('target_id').notNullable();
            table.text('reason').notNullable();
            table.text('status').notNullable().defaultTo('pending'); // 'pending', 'reviewed', 'resolved', 'dismissed'
            table.uuid('resolved_by').references('user_id').inTable('profiles');
            table.timestamp('resolved_at', { useTz: true });
            table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
        });
        console.log('✅ reports table recreated successfully with correct schema.');
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        process.exit(0);
    }
}

recreateReportsTable();
