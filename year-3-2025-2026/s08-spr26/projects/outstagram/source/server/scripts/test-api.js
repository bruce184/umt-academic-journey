import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';


dotenv.config({ path: '../.env' }); // Load Server .env

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    // 1. Sign in as admin to get the token
    const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email: process.env.TEST_ADMIN_EMAIL || 'admin@example.com',
        password: process.env.TEST_ADMIN_PASSWORD || '<set-local-password>'
    });

    if (error) {
        console.error("Login failed:", error.message);
        return;
    }

    const token = session.access_token;
    console.log("Logged in successfully. Fetching users...");

    // 2. Fetch users using fetch (simulating frontend)
    try {
        const response = await fetch('http://localhost:3000/api/v1/admin/users', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();
        console.log("Response Data:", JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("API Error:", err);
    }
}

main();
