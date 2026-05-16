import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import Avatar from "./Avatar";
import "../styles/NewMessageModal.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function getUserId(user) {
    return user?.user_id || user?.id;
}

function dedupeUsers(users) {
    const seen = new Set();
    return users.filter((user) => {
        const id = getUserId(user);
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
    });
}

export default function NewMessageModal({
    onClose,
    onSelect,
    suggestedUsers = [],
    title = "New message",
    actionLabel = "Chat",
}) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        setSearching(true);
        const timer = setTimeout(async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token;
                const res = await fetch(
                    `${API_BASE_URL}/api/v1/search/users/${encodeURIComponent(query)}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (res.ok) {
                    const data = await res.json();
                    setResults(dedupeUsers(data.data || []));
                } else {
                    setResults([]);
                }
            } catch (_) {
                setResults([]);
            } finally {
                setSearching(false);
            }
        }, 280);

        return () => clearTimeout(timer);
    }, [query]);

    const visibleUsers = useMemo(
        () => (query.trim() ? results : dedupeUsers(suggestedUsers)),
        [query, results, suggestedUsers]
    );

    const handleSubmit = async () => {
        if (!selectedUser || submitting) return;
        setSubmitting(true);
        try {
            await onSelect(selectedUser);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="new-message-modal-overlay" onClick={onClose}>
            <div className="new-message-modal" onClick={(event) => event.stopPropagation()}>
                <div className="new-message-modal-header">
                    <div className="new-message-modal-header-spacer" />
                    <h3>{title}</h3>
                    <button type="button" className="new-message-modal-close" onClick={onClose}>
                        <X size={22} />
                    </button>
                </div>

                <div className="new-message-modal-recipient-row">
                    <strong>To:</strong>
                    <div className="new-message-modal-recipient-input">
                        {selectedUser ? (
                            <span className="new-message-selected-chip">
                                <Avatar
                                    url={selectedUser.avatar_url}
                                    alt={selectedUser.username}
                                    size={24}
                                />
                                <span>{selectedUser.display_name || selectedUser.username}</span>
                                <button
                                    type="button"
                                    className="new-message-selected-remove"
                                    onClick={() => setSelectedUser(null)}
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        ) : null}

                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search..."
                            autoFocus
                        />
                    </div>
                </div>

                <div className="new-message-modal-results">
                    <div className="new-message-modal-section-title">
                        {query.trim() ? "Search results" : "Suggested"}
                    </div>

                    {searching ? <div className="new-message-modal-empty">Searching...</div> : null}

                    {!searching && !visibleUsers.length ? (
                        <div className="new-message-modal-empty">
                            {query.trim() ? "No users found" : "No suggestions yet"}
                        </div>
                    ) : null}

                    {!searching && visibleUsers.map((user) => {
                        const userId = getUserId(user);
                        const selected = getUserId(selectedUser) === userId;

                        return (
                            <button
                                key={userId}
                                type="button"
                                className={`new-message-modal-user ${selected ? "selected" : ""}`}
                                onClick={() => setSelectedUser(user)}
                            >
                                <div className="new-message-modal-user-main">
                                    <Avatar
                                        url={user.avatar_url}
                                        alt={user.username}
                                        size={48}
                                    />
                                    <span className="new-message-modal-user-copy">
                                        <span className="new-message-modal-user-name">
                                            {user.display_name || user.username}
                                        </span>
                                        <span className="new-message-modal-user-username">
                                            @{user.username}
                                        </span>
                                    </span>
                                </div>
                                <span className={`new-message-modal-radio ${selected ? "selected" : ""}`} />
                            </button>
                        );
                    })}
                </div>

                <div className="new-message-modal-footer">
                    <button
                        type="button"
                        className="new-message-modal-submit"
                        onClick={handleSubmit}
                        disabled={!selectedUser || submitting}
                    >
                        {submitting ? "Opening..." : actionLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
