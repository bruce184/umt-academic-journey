import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, X, Camera } from "lucide-react";
import { supabase } from "../lib/supabase";
import { readApiData } from "../lib/api";
import Avatar from "./Avatar";
import FollowButton from "./FollowButton";
import "../styles/FollowListModal.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default function FollowListModal({
    open,
    mode = "followers",
    username,
    onClose,
}) {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState("");
    const [currentUserId, setCurrentUserId] = useState(null);
    const [previewUser, setPreviewUser] = useState(null);
    const [previewProfile, setPreviewProfile] = useState(null);
    const [previewPosts, setPreviewPosts] = useState([]);
    const [previewLoading, setPreviewLoading] = useState(false);

    useEffect(() => {
        if (!open) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [open]);

    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, onClose]);

    useEffect(() => {
        if (!open) return;

        let cancelled = false;

        const loadList = async () => {
            setLoading(true);
            setQuery("");
            setPreviewProfile(null);
            setPreviewPosts([]);

            try {
                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token;
                setCurrentUserId(session?.user?.id || null);

                const endpoint = mode === "followers" ? "followers" : "following";
                const res = await fetch(`${API_BASE}/api/v1/profiles/${username}/${endpoint}?limit=100`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    throw new Error(`Failed to load ${endpoint}`);
                }

                const data = await res.json();
                const nextItems = readApiData(data) || [];

                if (!cancelled) {
                    setItems(nextItems);
                    setPreviewUser(nextItems[0] || null);
                }
            } catch (error) {
                console.error(error);
                if (!cancelled) {
                    setItems([]);
                    setPreviewUser(null);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadList();

        return () => {
            cancelled = true;
        };
    }, [open, mode, username]);

    useEffect(() => {
        if (!open || !previewUser?.username) return;

        let cancelled = false;

        const loadPreview = async () => {
            try {
                setPreviewLoading(true);
                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token;

                const [profileRes, postsRes] = await Promise.all([
                    fetch(`${API_BASE}/api/v1/profiles/${previewUser.username}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch(`${API_BASE}/api/v1/profiles/${previewUser.username}/posts?limit=3`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                if (!profileRes.ok) {
                    throw new Error("Failed to load preview profile");
                }

                const profileJson = await profileRes.json();
                const postsJson = postsRes.ok ? await postsRes.json() : null;

                if (!cancelled) {
                    setPreviewProfile(readApiData(profileJson));
                    setPreviewPosts(readApiData(postsJson) || []);
                }
            } catch (error) {
                console.error(error);
                if (!cancelled) {
                    setPreviewProfile(null);
                    setPreviewPosts([]);
                }
            } finally {
                if (!cancelled) {
                    setPreviewLoading(false);
                }
            }
        };

        loadPreview();

        return () => {
            cancelled = true;
        };
    }, [open, previewUser]);

    const filteredItems = useMemo(() => {
        const trimmed = query.trim().toLowerCase();
        if (!trimmed) return items;

        return items.filter((item) =>
            item.username?.toLowerCase().includes(trimmed) ||
            item.display_name?.toLowerCase().includes(trimmed)
        );
    }, [items, query]);

    useEffect(() => {
        if (!filteredItems.length) {
            setPreviewUser(null);
            return;
        }

        if (!previewUser || !filteredItems.some((item) => item.user_id === previewUser.user_id)) {
            setPreviewUser(filteredItems[0]);
        }
    }, [filteredItems, previewUser]);

    if (!open) return null;

    return (
        <div className="follow-modal-overlay" onClick={onClose}>
            <div className="follow-modal-shell" onClick={(event) => event.stopPropagation()}>
                <div className="follow-modal-header">
                    <h3>{mode === "followers" ? "Followers" : "Following"}</h3>
                    <button type="button" className="follow-modal-close" onClick={onClose} aria-label="Close follow modal">
                        <X size={24} />
                    </button>
                </div>

                <div className="follow-modal-search">
                    <Search size={18} />
                    <input
                        type="text"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search"
                    />
                </div>

                <div className="follow-modal-body">
                    <div className="follow-modal-list">
                        {loading ? (
                            <div className="follow-modal-empty">Loading...</div>
                        ) : filteredItems.length === 0 ? (
                            <div className="follow-modal-empty">
                                {query.trim() ? "No matching users." : `No ${mode} yet.`}
                            </div>
                        ) : (
                            filteredItems.map((item) => (
                                <div
                                    key={item.user_id}
                                    className={`follow-modal-item ${previewUser?.user_id === item.user_id ? "active" : ""}`}
                                    onMouseEnter={() => setPreviewUser(item)}
                                >
                                    <button
                                        type="button"
                                        className="follow-modal-user"
                                        onClick={() => {
                                            onClose();
                                            navigate(`/profile/${item.username}`);
                                        }}
                                    >
                                        <Avatar url={item.avatar_url} alt={item.username} size={52} />
                                        <div className="follow-modal-copy">
                                            <div className="follow-modal-username">{item.username}</div>
                                            <div className="follow-modal-name">{item.display_name || item.username}</div>
                                        </div>
                                    </button>

                                    {currentUserId === item.user_id ? (
                                        <span className="follow-modal-you">You</span>
                                    ) : (
                                        <FollowButton
                                            userId={item.user_id}
                                            initialIsFollowing={Boolean(item.is_following)}
                                            onToggle={(newStatus) => {
                                                setItems((prev) => prev.map((entry) =>
                                                    entry.user_id === item.user_id
                                                        ? { ...entry, is_following: newStatus }
                                                        : entry
                                                ));
                                                setPreviewProfile((prev) => prev && prev.user_id === item.user_id
                                                    ? {
                                                        ...prev,
                                                        is_following: newStatus,
                                                        follower_count: newStatus
                                                            ? prev.follower_count + 1
                                                            : Math.max(0, prev.follower_count - 1),
                                                    }
                                                    : prev
                                                );
                                            }}
                                            className="follow-modal-btn"
                                        />
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="follow-modal-preview">
                        {previewUser ? (
                            previewLoading ? (
                                <div className="follow-modal-preview-empty">Loading preview...</div>
                            ) : previewProfile ? (
                                <>
                                    <div className="follow-preview-head">
                                        <Avatar url={previewProfile.avatar_url} alt={previewProfile.username} size={76} />
                                        <div className="follow-preview-meta">
                                            <div className="follow-preview-username">{previewProfile.username}</div>
                                            <div className="follow-preview-name">{previewProfile.display_name || previewProfile.username}</div>
                                        </div>
                                    </div>

                                    <div className="follow-preview-stats">
                                        <div><strong>{previewProfile.post_count}</strong><span>posts</span></div>
                                        <div><strong>{previewProfile.follower_count}</strong><span>followers</span></div>
                                        <div><strong>{previewProfile.following_count}</strong><span>following</span></div>
                                    </div>

                                    {previewPosts.length ? (
                                        <div className="follow-preview-grid">
                                            {previewPosts.map((post) => (
                                                <Link
                                                    key={post.id}
                                                    to={`/p/${post.id}`}
                                                    className="follow-preview-post"
                                                    onClick={onClose}
                                                >
                                                    {post.media?.[0]?.url || post.media?.[0]?.media_url ? (
                                                        <img
                                                            src={post.media[0].url || post.media[0].media_url}
                                                            alt={post.caption || `Post by ${previewProfile.username}`}
                                                        />
                                                    ) : (
                                                        <div className="follow-preview-post-empty">
                                                            <Camera size={18} />
                                                        </div>
                                                    )}
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="follow-preview-empty">
                                            <div className="follow-preview-empty-icon">
                                                <Camera size={24} />
                                            </div>
                                            <strong>No posts yet</strong>
                                            <span>When {previewProfile.username} shares photos and reels, you'll see them here.</span>
                                        </div>
                                    )}

                                    {currentUserId === previewProfile.user_id ? (
                                        <button
                                            type="button"
                                            className="follow-preview-action follow-preview-action--muted"
                                            onClick={() => {
                                                onClose();
                                                navigate(`/profile/${previewProfile.username}`);
                                            }}
                                        >
                                            View profile
                                        </button>
                                    ) : (
                                        <FollowButton
                                            userId={previewProfile.user_id}
                                            initialIsFollowing={Boolean(previewProfile.is_following)}
                                            onToggle={(newStatus) => {
                                                setItems((prev) => prev.map((entry) =>
                                                    entry.user_id === previewProfile.user_id
                                                        ? { ...entry, is_following: newStatus }
                                                        : entry
                                                ));
                                                setPreviewProfile((prev) => prev ? {
                                                    ...prev,
                                                    is_following: newStatus,
                                                    follower_count: newStatus
                                                        ? prev.follower_count + 1
                                                        : Math.max(0, prev.follower_count - 1),
                                                } : prev);
                                            }}
                                            className="follow-preview-action"
                                        />
                                    )}
                                </>
                            ) : (
                                <div className="follow-modal-preview-empty">Preview unavailable.</div>
                            )
                        ) : (
                            <div className="follow-modal-preview-empty">Select a user to preview.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
