import { useEffect, useMemo, useRef, useState } from "react";
import {
    Check,
    Copy,
    Facebook,
    Link as LinkIcon,
    Mail,
    MessageCircle,
    Search,
    Send,
    X,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import Avatar from "./Avatar";
import "../styles/SharePostModal.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const RECENT_SHARE_USERS_KEY = "outstagram_recent_share_users";

function dedupeUsers(users) {
    const seen = new Set();
    return users.filter((user) => {
        const id = user?.user_id || user?.id;
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
    });
}

function readRecentShareUsers() {
    try {
        const raw = window.localStorage.getItem(RECENT_SHARE_USERS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function writeRecentShareUsers(users) {
    try {
        window.localStorage.setItem(
            RECENT_SHARE_USERS_KEY,
            JSON.stringify(dedupeUsers(users).slice(0, 12))
        );
    } catch {
        // ignore
    }
}

function buildShareText({ caption, postUrl, note }) {
    const parts = [];
    if (note?.trim()) parts.push(note.trim());
    if (caption?.trim()) parts.push(caption.trim());
    parts.push(postUrl);
    return parts.join("\n");
}

function buildPlatformUrl(platform, postUrl, caption) {
    const safeUrl = encodeURIComponent(postUrl);
    const safeText = encodeURIComponent(caption || "Check out this post on Outstagram");
    const combined = encodeURIComponent(`${caption || "Check out this post on Outstagram"} ${postUrl}`);

    switch (platform) {
        case "facebook":
            return `https://www.facebook.com/sharer/sharer.php?u=${safeUrl}`;
        case "whatsapp":
            return `https://api.whatsapp.com/send?text=${combined}`;
        case "email":
            return `mailto:?subject=${encodeURIComponent("Shared post from Outstagram")}&body=${combined}`;
        case "threads":
            return `https://www.threads.net/intent/post?text=${combined}`;
        case "x":
            return `https://twitter.com/intent/tweet?url=${safeUrl}&text=${safeText}`;
        default:
            return postUrl;
    }
}

async function apiFetch(path, options = {}) {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    const res = await fetch(`${API_BASE_URL}${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...options,
    });

    if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody?.error?.message || "Request failed");
    }

    return res.json();
}

function getFocusableElements(container) {
    if (!container) return [];
    return Array.from(
        container.querySelectorAll(
            'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
        )
    ).filter((element) => !element.hasAttribute("disabled"));
}

export default function SharePostModal({
    isOpen,
    onClose,
    postId,
    postUrl,
    caption = "",
    username = "",
    ownerAvatarUrl = "",
    thumbnailUrl = "",
    mediaType = "image",
    likeCount = 0,
    commentCount = 0,
}) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [note, setNote] = useState("");
    const [searching, setSearching] = useState(false);
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState({ type: "", message: "" });
    const modalRef = useRef(null);
    const resolvedPostUrl = postUrl || (postId ? `${window.location.origin}/p/${postId}` : window.location.href);
    const shareCaption = caption?.trim() || `Check out ${username || "this"} post on Outstagram`;

    useEffect(() => {
        if (!isOpen) return;

        setQuery("");
        setResults([]);
        setSelectedUsers([]);
        setNote("");
        setSearching(false);
        setStatus({ type: "", message: "" });

        const bootstrapSuggestions = async () => {
            try {
                const [recentUsers, conversationsRes] = await Promise.all([
                    Promise.resolve(readRecentShareUsers()),
                    apiFetch("/api/v1/messages/conversations"),
                ]);

                const conversationUsers = (conversationsRes.data?.conversations || conversationsRes.conversations || [])
                    .map((conversation) => conversation.other_user)
                    .filter(Boolean);

                setSuggestedUsers(dedupeUsers([...recentUsers, ...conversationUsers]));
            } catch (error) {
                console.error("Failed to load share suggestions", error);
                setSuggestedUsers(readRecentShareUsers());
            }
        };

        bootstrapSuggestions();
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        if (!query.trim()) {
            setSearching(false);
            setResults([]);
            return;
        }

        setSearching(true);
        const timer = setTimeout(async () => {
            try {
                const res = await apiFetch(`/api/v1/search/users/${encodeURIComponent(query.trim())}`);
                setResults(dedupeUsers(res.data || res || []));
            } catch (error) {
                console.error("Share search failed", error);
                setResults([]);
            } finally {
                setSearching(false);
            }
        }, 280);

        return () => clearTimeout(timer);
    }, [isOpen, query]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onClose();
                return;
            }

            if (event.key === "Tab" && modalRef.current) {
                const focusable = getFocusableElements(modalRef.current);
                if (!focusable.length) return;

                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                const active = document.activeElement;

                if (event.shiftKey && active === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && active === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen) return;
        const focusable = getFocusableElements(modalRef.current);
        focusable[0]?.focus();
    }, [isOpen]);

    const visibleUsers = useMemo(
        () => (query.trim() ? results : suggestedUsers),
        [query, results, suggestedUsers]
    );

    const toggleUser = (user) => {
        const id = user?.user_id || user?.id;
        if (!id) return;
        setStatus({ type: "", message: "" });

        setSelectedUsers((prev) => {
            const exists = prev.some((item) => (item.user_id || item.id) === id);
            if (exists) {
                return prev.filter((item) => (item.user_id || item.id) !== id);
            }
            return [...prev, user];
        });
    };

    const handleCopyLink = async (label = "Copied link") => {
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(resolvedPostUrl);
                setStatus({ type: "success", message: label });
                return;
            }

            const temp = document.createElement("textarea");
            temp.value = resolvedPostUrl;
            document.body.appendChild(temp);
            temp.select();
            document.execCommand("copy");
            temp.remove();
            setStatus({ type: "success", message: label });
        } catch (error) {
            console.error("Copy failed", error);
            setStatus({ type: "error", message: "Unable to copy link right now." });
        }
    };

    const handleExternalShare = async (platform) => {
        if (platform === "copy") {
            await handleCopyLink("Copied link");
            return;
        }

        if (platform === "messenger" || platform === "threads") {
            const label = platform === "messenger" ? "Copied link for Messenger" : "Copied link for Threads";
            await handleCopyLink(label);
            return;
        }

        try {
            const url = buildPlatformUrl(platform, resolvedPostUrl, shareCaption);
            window.open(url, "_blank", "noopener,noreferrer");
        } catch (error) {
            console.error("External share failed", error);
            await handleCopyLink("Copied link");
        }
    };

    const handleSend = async () => {
        if (!selectedUsers.length || sending) return;
        setSending(true);
        setStatus({ type: "", message: "" });

        const trimmedNote = note.trim();

        try {
            await Promise.all(
                selectedUsers.map(async (user) => {
                    const receiverId = user.user_id || user.id;
                    const conversationRes = await apiFetch("/api/v1/messages/conversations", {
                        method: "POST",
                        body: JSON.stringify({ recipientId: receiverId }),
                    });

                    const conversation = conversationRes.data?.conversation || conversationRes.conversation;
                    await apiFetch(`/api/v1/messages/conversations/${conversation.id}/messages`, {
                        method: "POST",
                        body: JSON.stringify({
                            body: trimmedNote || "__shared_post__",
                            messageType: "post_share",
                            metadata: {
                                post: {
                                    id: postId,
                                    url: resolvedPostUrl,
                                    caption: caption || "",
                                    owner_username: username || "",
                                    owner_avatar_url: ownerAvatarUrl || "",
                                    thumbnail_url: thumbnailUrl || "",
                                    media_type: mediaType || "image",
                                    like_count: likeCount || 0,
                                    comment_count: commentCount || 0,
                                },
                            },
                        }),
                    });
                })
            );

            const nextRecent = dedupeUsers([...selectedUsers, ...suggestedUsers]);
            writeRecentShareUsers(nextRecent);
            setSuggestedUsers(nextRecent);
            setStatus({
                type: "success",
                message: `Sent to ${selectedUsers.length} ${selectedUsers.length > 1 ? "people" : "person"}.`,
            });
            setSelectedUsers([]);
            setNote("");
        } catch (error) {
            console.error("Share to inbox failed", error);
            setStatus({ type: "error", message: error.message || "Failed to send share." });
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) return null;

    const externalActions = [
        { key: "copy", label: "Copy link", icon: <LinkIcon size={20} /> },
        { key: "facebook", label: "Facebook", icon: <Facebook size={20} /> },
        { key: "messenger", label: "Messenger", icon: <MessageCircle size={20} /> },
        { key: "whatsapp", label: "WhatsApp", icon: <MessageCircle size={20} /> },
        { key: "email", label: "Email", icon: <Mail size={20} /> },
        { key: "threads", label: "Threads", icon: <Copy size={20} /> },
        { key: "x", label: "X", icon: <X size={20} /> },
    ];

    return (
        <div className="share-post-overlay" onClick={onClose}>
            <div
                ref={modalRef}
                className="share-post-modal"
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Share post"
            >
                <div className="share-post-header">
                    <button
                        type="button"
                        className="share-post-close"
                        onClick={onClose}
                        aria-label="Close share modal"
                    >
                        <X size={22} />
                    </button>
                    <h3>Share</h3>
                    <div className="share-post-header-spacer" />
                </div>

                <div className="share-post-search">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        aria-label="Search users to share post"
                    />
                </div>

                {selectedUsers.length > 0 ? (
                    <div className="share-post-selected">
                        {selectedUsers.map((user) => {
                            const id = user.user_id || user.id;
                            return (
                                <button
                                    key={id}
                                    type="button"
                                    className="share-post-chip"
                                    onClick={() => toggleUser(user)}
                                >
                                    <Avatar url={user.avatar_url} alt={user.username} size={24} />
                                    <span>{user.display_name || user.username}</span>
                                    <X size={12} />
                                </button>
                            );
                        })}
                    </div>
                ) : null}

                <div className="share-post-users">
                    <div className="share-post-users-heading">
                        {query.trim() ? "Results" : "Suggested"}
                    </div>
                    {searching ? <div className="share-post-empty">Searching users...</div> : null}
                    {!searching && !visibleUsers.length ? (
                        <div className="share-post-empty">
                            {query.trim() ? "No users found." : "No suggestions yet. Start typing to search users."}
                        </div>
                    ) : null}

                    {!searching && visibleUsers.length ? (
                        <div className="share-post-user-grid">
                            {visibleUsers.map((user) => {
                                const id = user.user_id || user.id;
                                const selected = selectedUsers.some((item) => (item.user_id || item.id) === id);

                                return (
                                    <button
                                        key={id}
                                        type="button"
                                        className={`share-post-user ${selected ? "selected" : ""}`}
                                        onClick={() => toggleUser(user)}
                                    >
                                        <div className="share-post-user-avatar">
                                            <Avatar
                                                url={user.avatar_url}
                                                alt={user.username}
                                                size={72}
                                            />
                                            {selected ? (
                                                <span className="share-post-user-check">
                                                    <Check size={14} />
                                                </span>
                                            ) : null}
                                        </div>
                                        <span className="share-post-user-name">
                                            {user.display_name || user.username}
                                        </span>
                                        <span className="share-post-user-username">@{user.username}</span>
                                    </button>
                                );
                            })}
                        </div>
                    ) : null}
                </div>

                <div className="share-post-footer">
                    {selectedUsers.length > 0 ? (
                        <div className="share-post-send-box">
                            <textarea
                                value={note}
                                onChange={(event) => setNote(event.target.value)}
                                placeholder="Add a message (optional)"
                                rows={2}
                            />
                            <button
                                type="button"
                                className="share-post-send-button"
                                onClick={handleSend}
                                disabled={sending}
                            >
                                <Send size={16} />
                                {sending ? "Sending..." : `Send${selectedUsers.length ? ` (${selectedUsers.length})` : ""}`}
                            </button>
                        </div>
                    ) : null}

                    {status.message ? (
                        <div className={`share-post-status ${status.type}`}>
                            {status.message}
                        </div>
                    ) : null}

                    <div className="share-post-actions">
                        {externalActions.map((action) => (
                            <button
                                key={action.key}
                                type="button"
                                className="share-post-action"
                                onClick={() => handleExternalShare(action.key)}
                            >
                                <span className="share-post-action-icon">{action.icon}</span>
                                <span>{action.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
