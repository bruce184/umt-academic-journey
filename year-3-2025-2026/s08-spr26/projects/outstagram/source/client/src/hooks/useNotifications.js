import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export function useNotifications({ enabled = true } = {}) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState(null);
    const cursorRef = useRef(null);
    const subscriptionRef = useRef(null);

    const getToken = useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.access_token;
    }, []);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const res = await fetch(`${API_BASE}/api/notifications/unread-count`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUnreadCount(data.data?.unreadCount || 0);
            }
        } catch (e) {
            console.error("Failed to fetch unread count", e);
        }
    }, [getToken]);

    const fetchNotifications = useCallback(async (cursor = null, append = false) => {
        if (!append) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }
        setError(null);

        try {
            const token = await getToken();
            if (!token) {
                setError("Not authenticated");
                return;
            }

            let url = `${API_BASE}/api/notifications?limit=20`;
            if (cursor) {
                url += `&cursor=${encodeURIComponent(cursor)}`;
            }

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                throw new Error("Failed to fetch notifications");
            }

            const json = await res.json();
            const items = json.data?.items || [];
            const nextCursor = json.meta?.pagination?.nextCursor;

            if (append) {
                setNotifications(prev => {
                    const existingIds = new Set(prev.map(n => n.id));
                    const newItems = items.filter(n => !existingIds.has(n.id));
                    return [...prev, ...newItems];
                });
            } else {
                setNotifications(items);
            }

            cursorRef.current = nextCursor;
            setHasMore(!!nextCursor && items.length > 0);
        } catch (e) {
            console.error("Failed to fetch notifications", e);
            setError(e.message);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [getToken]);

    const loadMore = useCallback(() => {
        if (!loadingMore && hasMore && cursorRef.current) {
            fetchNotifications(cursorRef.current, true);
        }
    }, [fetchNotifications, loadingMore, hasMore]);

    const markAsRead = useCallback(async (id) => {
        try {
            const token = await getToken();
            if (!token) return;

            const res = await fetch(`${API_BASE}/api/notifications/${id}/read`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                setNotifications(prev =>
                    prev.map(n => n.id === id ? { ...n, is_read: true } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (e) {
            console.error("Failed to mark notification as read", e);
        }
    }, [getToken]);

    const markBatchAsRead = useCallback(async (ids) => {
        try {
            const token = await getToken();
            if (!token) return;

            const res = await fetch(`${API_BASE}/api/notifications/mark-read`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ ids })
            });

            if (res.ok) {
                const idSet = new Set(ids);
                setNotifications(prev =>
                    prev.map(n => idSet.has(n.id) ? { ...n, is_read: true } : n)
                );
                await fetchUnreadCount();
            }
        } catch (e) {
            console.error("Failed to mark notifications as read", e);
        }
    }, [getToken, fetchUnreadCount]);

    const markAllAsRead = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const res = await fetch(`${API_BASE}/api/notifications/mark-all-read`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                setNotifications(prev =>
                    prev.map(n => ({ ...n, is_read: true }))
                );
                setUnreadCount(0);
            }
        } catch (e) {
            console.error("Failed to mark all as read", e);
        }
    }, [getToken]);

    const refresh = useCallback(() => {
        cursorRef.current = null;
        fetchNotifications();
        fetchUnreadCount();
    }, [fetchNotifications, fetchUnreadCount]);

    // Setup realtime subscription
    useEffect(() => {
        if (!enabled) return;

        const setupSubscription = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user?.id) return;

            const userId = session.user.id;

            // Subscribe to INSERT on notifications where recipient_id = current user
            const channel = supabase
                .channel("notifications-realtime")
                .on(
                    "postgres_changes",
                    {
                        event: "INSERT",
                        schema: "public",
                        table: "notifications",
                        filter: `recipient_id=eq.${userId}`
                    },
                    async (payload) => {
                        // Fetch full notification with actor info
                        const token = await getToken();
                        if (!token) return;

                        // Just refresh the first page and unread count
                        // This is simpler than trying to construct the full object
                        refresh();
                    }
                )
                .subscribe();

            subscriptionRef.current = channel;
        };

        setupSubscription();

        return () => {
            if (subscriptionRef.current) {
                supabase.removeChannel(subscriptionRef.current);
            }
        };
    }, [enabled, getToken, refresh]);

    // Initial fetch
    useEffect(() => {
        if (enabled) {
            fetchNotifications();
            fetchUnreadCount();
        }
    }, [enabled, fetchNotifications, fetchUnreadCount]);

    return {
        notifications,
        unreadCount,
        loading,
        loadingMore,
        hasMore,
        error,
        loadMore,
        markAsRead,
        markBatchAsRead,
        markAllAsRead,
        refresh,
        fetchUnreadCount
    };
}
