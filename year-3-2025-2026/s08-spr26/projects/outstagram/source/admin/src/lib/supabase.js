import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
        auth: {
            // Keep admin auth isolated from the client app to avoid shared-session lock contention.
            storageKey: "outstagram-admin-auth",
        },
    }
);
