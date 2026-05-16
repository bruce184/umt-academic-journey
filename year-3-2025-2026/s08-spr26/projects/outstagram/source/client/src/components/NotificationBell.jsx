import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { supabase } from "../lib/supabase";
import "../styles/NotificationBell.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function NotificationBell({ onClick }) {
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) return;

            const res = await fetch(`${API_BASE}/api/notifications/unread-count`, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setUnreadCount(data.data?.unreadCount || 0);
            }
        } catch (e) {
            console.error("Failed to fetch unread count", e);
        }
    };

    useEffect(() => {
        fetchUnreadCount();

        // Setup realtime listener for new notifications
        let channel = null;

        const setupRealtime = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user?.id) return;

            const userId = session.user.id;

            channel = supabase
                .channel("notification-bell-realtime")
                .on(
                    "postgres_changes",
                    {
                        event: "INSERT",
                        schema: "public",
                        table: "notifications",
                        filter: `recipient_id=eq.${userId}`
                    },
                    () => {
                        // Increment unread count when new notification arrives
                        setUnreadCount(prev => prev + 1);
                    }
                )
                .subscribe();
        };

        setupRealtime();

        // Also listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            fetchUnreadCount();
        });

        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
            subscription.unsubscribe();
        };
    }, []);

    return (
        <button
            className="notification-bell"
            onClick={onClick}
            title="Notifications"
        >
            <Bell size={24} />
            {unreadCount > 0 && (
                <span className="notification-badge">
                    {unreadCount > 99 ? "99+" : unreadCount}
                </span>
            )}
        </button>
    );
}
