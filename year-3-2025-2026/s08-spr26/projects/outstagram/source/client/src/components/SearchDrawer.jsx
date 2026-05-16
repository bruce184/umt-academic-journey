import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import Avatar from "./Avatar";
import "../styles/SearchDrawer.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const RECENT_SEARCHES_KEY = "outstagram_recent_searches";

function readRecentSearches() {
    try {
        const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function writeRecentSearches(items) {
    try {
        window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(items.slice(0, 8)));
    } catch {
        // ignore localStorage failures
    }
}

function dedupeUsers(users) {
    const seen = new Set();
    return users.filter((user) => {
        const id = user?.user_id || user?.id;
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
    });
}

export default function SearchDrawer({ open, onClose, initialQuery = "", variant = "default" }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [recent, setRecent] = useState([]);
    const [searching, setSearching] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!open) return;
        setRecent(readRecentSearches());
        setQuery(initialQuery || "");
    }, [open, initialQuery]);

    useEffect(() => {
        if (!open) return;

        const handleEscape = (event) => {
            if (event.key === "Escape") onClose();
        };

        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [onClose, open]);

    useEffect(() => {
        if (!open) return;
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
                    `${API_BASE_URL}/api/v1/search/users/${encodeURIComponent(query.trim())}`,
                    { headers: { Authorization: token ? `Bearer ${token}` : "" } }
                );

                if (!res.ok) {
                    setResults([]);
                    return;
                }

                const data = await res.json();
                setResults(dedupeUsers(data.data || []));
            } catch {
                setResults([]);
            } finally {
                setSearching(false);
            }
        }, 250);

        return () => clearTimeout(timer);
    }, [open, query]);

    const visibleItems = useMemo(
        () => (query.trim() ? results : recent),
        [query, recent, results]
    );

    const handleSelectUser = (user) => {
        const id = user?.user_id || user?.id;
        if (!id || !user?.username) return;

        const nextRecent = dedupeUsers([user, ...recent]);
        setRecent(nextRecent);
        writeRecentSearches(nextRecent);
        setQuery("");
        onClose();
        navigate(`/profile/${user.username}`);
    };

    const handleRemoveRecent = (userId) => {
        const nextRecent = recent.filter((item) => (item.user_id || item.id) !== userId);
        setRecent(nextRecent);
        writeRecentSearches(nextRecent);
    };

    const handleClearAll = () => {
        setRecent([]);
        writeRecentSearches([]);
    };

    return (
        <aside className={`search-drawer ${open ? "open" : ""} ${variant !== "feed" ? "search-drawer--default" : ""}`.trim()}>
            <div className="search-drawer-header">
                <h2>Search</h2>
                <button type="button" className="search-drawer-close" onClick={onClose}>
                    <X size={22} />
                </button>
            </div>

            <div className="search-drawer-input-shell">
                <Search size={18} />
                <input
                    type="text"
                    placeholder="Search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    autoFocus={open}
                />
                {query ? (
                    <button
                        type="button"
                        className="search-drawer-clear"
                        onClick={() => setQuery("")}
                    >
                        <X size={14} />
                    </button>
                ) : null}
            </div>

            <div className="search-drawer-body">
                <div className="search-drawer-section">
                    <div className="search-drawer-section-head">
                        <strong>{query.trim() ? "Results" : "Recent"}</strong>
                        {!query.trim() && recent.length ? (
                            <button type="button" onClick={handleClearAll}>
                                Clear all
                            </button>
                        ) : null}
                    </div>

                    {searching ? <div className="search-drawer-empty">Searching...</div> : null}
                    {!searching && !visibleItems.length ? (
                        <div className="search-drawer-empty">
                            {query.trim() ? "No results found." : "No recent searches yet."}
                        </div>
                    ) : null}

                    {!searching && visibleItems.map((user) => {
                        const userId = user?.user_id || user?.id;
                        return (
                            <div key={userId} className="search-drawer-item">
                                <button
                                    type="button"
                                    className="search-drawer-item-main"
                                    onClick={() => handleSelectUser(user)}
                                >
                                    <Avatar
                                        url={user.avatar_url}
                                        alt={user.username}
                                        size={48}
                                    />
                                    <span className="search-drawer-item-copy">
                                        <span className="search-drawer-item-username">{user.username}</span>
                                        <span className="search-drawer-item-name">{user.display_name || "User"}</span>
                                    </span>
                                </button>

                                {!query.trim() ? (
                                    <button
                                        type="button"
                                        className="search-drawer-item-remove"
                                        onClick={() => handleRemoveRecent(userId)}
                                    >
                                        <X size={18} />
                                    </button>
                                ) : null}
                            </div>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
}
