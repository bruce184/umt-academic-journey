import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { db as knex } from '../src/db/knex.js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const email = 'admin@admin.com';
    // Supabase usually requires 6 characters for password
    const password = process.env.OUTSTAGRAM_ADMIN_PASSWORD || 'demo-password';

    console.log(`Attempting to create user ${email} with password ${password}...`);

    let { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            username: 'admin',
            full_name: 'Super Admin'
        }
    });

    let userId;

    if (error) {
        if (error.message.includes('already exists')) {
            console.log('User already exists in auth.users. Trying to fetch ID...');

            const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
            if (listError) {
                console.error('Failed to list users', listError);
                process.exit(1);
            }
            const existingUser = usersData.users.find(u => u.email === email);
            if (existingUser) {
                userId = existingUser.id;

                // update password to be sure
                await supabase.auth.admin.updateUserById(userId, { password });
            }
        } else {
            console.error('Error creating user:', error);
            process.exit(1);
        }
    } else {
        userId = data.user.id;
        console.log('User created in auth.users with ID:', userId);
        // Wait for trigger to create profile
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    if (userId) {
        try {
            // Check if profile exists
            const profile = await knex('profiles').where({ user_id: userId }).first();
            if (profile) {
                await knex('profiles').where({ user_id: userId }).update({
                    role: 'super_admin',
                    username: 'admin'
                });
                console.log("Successfully updated profile role to super_admin and username to admin.");
            } else {
                // Insert profile forcefully if trigger failed
                await knex('profiles').insert({
                    user_id: userId,
                    username: 'admin',
                    display_name: 'Super Admin',
                    role: 'super_admin'
                });
                console.log("Successfully manually inserted profile for admin.");
            }
            console.log(`\n\n--- SUCCESS ---`);
            console.log(`Admin account is ready.`);
            console.log(`Login Email: ${email}`);
            console.log(`Password: ${password}`);
            console.log(`(Note: Supabase requires minimum 6 characters for password, so a demo password is used).`);
        } catch (dbError) {
            console.error('Database update error:', dbError);
        }
    }

    process.exit(0);
}

main();
