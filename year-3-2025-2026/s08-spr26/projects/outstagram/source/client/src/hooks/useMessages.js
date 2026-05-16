import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const POLL_INTERVAL_MS = 4000; // 4 seconds

async function apiFetch(path, options = {}) {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    const res = await fetch(`${API_BASE}/api/v1/messages${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...options,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || "Request failed");
    }
    const json = await res.json();
    // Unwrap the res.ok() wrapper: { ok, data: {...}, meta }
    return json.data || json;
}


export function useMessages() {
    const [conversations, setConversations] = useState([]);
    const [activeConvId, setActiveConvId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const pollRef = useRef(null);
    const activeConvRef = useRef(null);

    // Keep ref in sync so polling closure always has latest convId
    useEffect(() => {
        activeConvRef.current = activeConvId;
    }, [activeConvId]);

    // ── Conversations ──────────────────────────────────────────────
    const fetchConversations = useCallback(async () => {
        try {
            const data = await apiFetch("/conversations");
            setConversations(data.conversations || []);
            const total = (data.conversations || []).reduce(
                (sum, c) => sum + (c.unread_count || 0),
                0
            );
            setUnreadCount(total);
        } catch (e) {
            setError(e.message);
        }
    }, []);

    // ── Messages ───────────────────────────────────────────────────
    const fetchMessages = useCallback(async (convId) => {
        if (!convId) return;
        setLoadingMessages(true);
        try {
            const data = await apiFetch(`/conversations/${convId}/messages`);
            setMessages(data.messages || []);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoadingMessages(false);
        }
    }, []);

    // ── Poll: conversations + messages when tab visible ────────────
    const startPolling = useCallback(() => {
        if (pollRef.current) return;
        pollRef.current = setInterval(async () => {
            await fetchConversations();
            if (activeConvRef.current) {
                try {
                    const data = await apiFetch(`/conversations/${activeConvRef.current}/messages`);
                    setMessages(data.messages || []);
                } catch (_) { }
            }
        }, POLL_INTERVAL_MS);
    }, [fetchConversations]);

    const stopPolling = useCallback(() => {
        if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
    }, []);

    // Start/stop on mount and visibility change
    useEffect(() => {
        setLoading(true);
        fetchConversations().finally(() => setLoading(false));
        startPolling();

        const onVisibility = () => {
            if (document.hidden) stopPolling();
            else startPolling();
        };
        document.addEventListener("visibilitychange", onVisibility);

        return () => {
            stopPolling();
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, [fetchConversations, startPolling, stopPolling]);

    // ── Load messages when active conv changes ─────────────────────
    useEffect(() => {
        if (activeConvId) {
            fetchMessages(activeConvId);
        } else {
            setMessages([]);
        }
    }, [activeConvId, fetchMessages]);

    // ── Actions ────────────────────────────────────────────────────
    const openConversation = useCallback(async (recipientId) => {
        try {
            const data = await apiFetch("/conversations", {
                method: "POST",
                body: JSON.stringify({ recipientId }),
            });
            const conv = data.conversation;
            await fetchConversations();
            setActiveConvId(conv.id);
            return conv;
        } catch (e) {
            setError(e.message);
        }
    }, [fetchConversations]);

    const sendMessage = useCallback(async (body) => {
        if (!activeConvId || !body.trim()) return;
        setSending(true);
        try {
            const data = await apiFetch(`/conversations/${activeConvId}/messages`, {
                method: "POST",
                body: JSON.stringify({ body: body.trim() }),
            });
            setMessages((prev) => [...prev, data.message]);
            // Bump last_msg_at locally
            setConversations((prev) =>
                prev.map((c) =>
                    c.id === activeConvId
                        ? { ...c, last_message: data.message, last_msg_at: data.message.created_at }
                        : c
                )
            );
        } catch (e) {
            setError(e.message);
        } finally {
            setSending(false);
        }
    }, [activeConvId]);

    const deleteMessage = useCallback(async (messageId) => {
        try {
            await apiFetch(`/${messageId}`, { method: "PATCH" });
            setMessages((prev) =>
                prev.map((m) => (m.id === messageId ? { ...m, is_deleted: true } : m))
            );
        } catch (e) {
            setError(e.message);
        }
    }, []);

    return {
        conversations,
        activeConvId,
        setActiveConvId,
        messages,
        unreadCount,
        loading,
        loadingMessages,
        sending,
        error,
        sendMessage,
        deleteMessage,
        openConversation,
        refresh: fetchConversations,
    };
}
