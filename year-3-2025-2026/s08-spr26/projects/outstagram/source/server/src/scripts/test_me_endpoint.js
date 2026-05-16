import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
// import fetch from "node-fetch"; // Node 18+ has native fetch

// Setup Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function main() {
    console.log("🔹 Testing /api/auth/me endpoint...");

    // 1. Login to get token
    const email = "user@example.com"; // Email for bruce740305
    const password = process.env.TEST_USER_PASSWORD || "<set-local-password>";

    console.log(`🔹 Logging in as ${email}...`);
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: process.env.TEST_USER_PASSWORD || "<set-local-password>" // Using the demo password or 123456? User said 123456 for bruce.
    });

    if (error) {
        // Try 123456
         const { data: data2, error: error2 } = await supabase.auth.signInWithPassword({
            email,
            password: process.env.TEST_USER_PASSWORD_FALLBACK || "<set-local-password>"
        });
        if (error2) {
             console.error("❌ Login failed:", error2.message);
             return;
        }
        console.log("✅ Login successful (Retried with 123456).");
        testEndpoint(data2.session.access_token);
        return;
    }

    console.log("✅ Login successful.");
    testEndpoint(data.session.access_token);
}

async function testEndpoint(token) {
    // 2. Call /api/auth/me
    console.log("🔹 Calling /api/auth/me...");
    try {
        const res = await fetch("http://localhost:3000/api/auth/me", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) {
            console.error(`❌ Request failed: ${res.status} ${res.statusText}`);
            const text = await res.text();
            console.log("Response body:", text);
            return;
        }

        const json = await res.json();
        console.log("✅ Response JSON:");
        console.log(JSON.stringify(json, null, 2));

        if (json.profile && json.profile.username) {
            console.log("✅ Username found:", json.profile.username);
        } else {
            console.error("❌ Username missing in profile!");
        }

    } catch (err) {
        console.error("❌ Fetch error:", err);
    }
}

main();
