import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import "../styles/FollowButton.css";

export default function FollowButton({ userId, initialIsFollowing, onToggle, className = "" }) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [loading, setLoading] = useState(false);

    // Sync state with prop if it changes (e.g., from parent refresh)
    useEffect(() => {
        setIsFollowing(initialIsFollowing);
    }, [initialIsFollowing]);

    const handleToggle = async (e) => {
        e.preventDefault(); // Safer than just stopPropagation
        e.stopPropagation();

        if (loading) return;

        // Capture current state for reversion
        const previousState = isFollowing;
        const newState = !previousState;

        // Optimistic update
        setLoading(true);
        setIsFollowing(newState);
        if (onToggle) onToggle(newState);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            if (!token) {
                throw new Error("No session found");
            }

            const method = previousState ? "DELETE" : "POST";

            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/users/${userId}/follow`, {
                method: method,
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                throw new Error("Failed to toggle follow");
            }

            // Success: Keep the new state (already set)
        } catch (e) {
            console.error(e);
            // Revert on error
            setIsFollowing(previousState);
            if (onToggle) onToggle(previousState);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            className={`follow-btn ${isFollowing ? "following" : ""} ${className}`}
            onClick={handleToggle}
            disabled={loading}
        >
            {loading ? "..." : (isFollowing ? "Following" : "Follow")}
        </button>
    );
}
