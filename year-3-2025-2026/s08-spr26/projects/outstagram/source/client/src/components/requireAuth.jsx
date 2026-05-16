import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function RequireAuth({ children }) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        (async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!mounted) return;

            if (!session?.access_token) {
                window.location.href = "/login";
                return;
            }
            setLoading(false);
        })();

        return () => { mounted = false; };
    }, []);

    if (loading) return <div>Loading...</div>;
    return children;
}
