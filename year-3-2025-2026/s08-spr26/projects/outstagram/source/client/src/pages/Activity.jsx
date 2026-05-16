import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowDownUp,
    CalendarDays,
    ChartColumnIncreasing,
    Heart,
    History,
    Image as ImageIcon,
    MessageCircle,
    Reply,
    SearchCheck,
    Tag,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { readApiData } from "../lib/api";
import MainLayout from "../layouts/MainLayout";
import FeedMessagesWidget from "../components/FeedMessagesWidget";
import ExplorePostModal from "../components/ExplorePostModal";
import "../styles/Activity.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function timeAgo(dateStr) {
    if (!dateStr) return "Now";
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.max(0, Math.floor((now - date) / 1000));
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatFullDate(dateStr) {
    if (!dateStr) return "Unknown";
    return new Date(dateStr).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function getCoverMedia(post) {
    return post?.media?.[0] || null;
}

export default function Activity() {
    const navigate = useNavigate();
    const [section, setSection] = useState("interactions");
    const [tab, setTab] = useState("likes");
    const [sortOrder, setSortOrder] = useState("desc");
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [me, setMe] = useState(null);
    const [myPosts, setMyPosts] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [commentActivity, setCommentActivity] = useState([]);
    const [storyReplies, setStoryReplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activePostId, setActivePostId] = useState(null);
    const [activePhotoIndex, setActivePhotoIndex] = useState(null);

    useEffect(() => {
        const loadActivity = async () => {
            setLoading(true);
            setError("");

            try {
                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token;

                if (!token) {
                    navigate("/login");
                    return;
                }

                const meRes = await fetch(`${API_BASE}/api/v1/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!meRes.ok) {
                    throw new Error("Failed to load account");
                }

                const meJson = await meRes.json();
                const meData = meJson.data || meJson;
                setMe(meData);

                const [notificationsRes, conversationsRes, commentsRes] = await Promise.all([
                    fetch(`${API_BASE}/api/notifications?limit=50`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch(`${API_BASE}/api/v1/messages/conversations`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch(`${API_BASE}/api/v1/me/comments`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                if (notificationsRes.ok) {
                    const notificationsJson = await notificationsRes.json();
                    setNotifications(notificationsJson.data?.items || []);
                }

                if (conversationsRes.ok) {
                    const conversationsJson = await conversationsRes.json();
                    const conversations = conversationsJson.data?.conversations || [];
                    const derivedReplies = conversations
                        .map((conversation) => {
                            const message = conversation.last_message;
                            const body = message?.body || "";
                            const isStoryReply =
                                message?.message_type === "reply_story" ||
                                body.includes("Replied to your story");

                            if (!message || !isStoryReply) return null;

                            return {
                                id: `story-reply-${message.id}`,
                                body,
                                created_at: message.created_at || conversation.last_msg_at,
                                actor: conversation.other_user,
                            };
                        })
                        .filter(Boolean);

                    setStoryReplies(derivedReplies);
                }

                if (commentsRes.ok) {
                    const commentsJson = await commentsRes.json();
                    setCommentActivity(commentsJson.data?.comments || []);
                }

                if (meData.profile?.username) {
                    const postsRes = await fetch(`${API_BASE}/api/v1/profiles/${meData.profile.username}/posts?limit=30`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    if (postsRes.ok) {
                        const postsJson = await postsRes.json();
                        setMyPosts(readApiData(postsJson) || []);
                    }
                }
            } catch (loadError) {
                console.error(loadError);
                setError(loadError.message || "Failed to load activity");
            } finally {
                setLoading(false);
            }
        };

        loadActivity();
    }, [navigate]);

    useEffect(() => {
        setSelectionMode(false);
        setSelectedIds([]);
    }, [section, tab]);

    const sections = [
        {
            key: "interactions",
            title: "Interactions",
            description: "Review likes, comments, story replies, and recent feedback across your account.",
            icon: <ChartColumnIncreasing size={22} />,
        },
        {
            key: "photos-videos",
            title: "Photos and videos",
            description: "Review the posts you have shared and open them quickly in the current overlay viewer.",
            icon: <ImageIcon size={22} />,
        },
        {
            key: "account-history",
            title: "Account history",
            description: "Check live account info, profile identity, and recent sign-in context from your current session.",
            icon: <History size={22} />,
        },
    ];

    const tabs = [
        { key: "likes", label: "Likes", icon: <Heart size={16} /> },
        { key: "comments", label: "Comments", icon: <MessageCircle size={16} /> },
        { key: "story-replies", label: "Story replies", icon: <Reply size={16} /> },
        { key: "reviews", label: "Reviews", icon: <Tag size={16} /> },
    ];

    const interactionItems = useMemo(() => {
        if (tab === "likes") return notifications.filter((item) => item.type === "like");
        if (tab === "comments") return commentActivity;
        if (tab === "story-replies") return storyReplies;
        return notifications.filter((item) => item.type === "follow");
    }, [notifications, commentActivity, storyReplies, tab]);

    const sortedInteractions = useMemo(() => {
        return [...interactionItems].sort((a, b) => {
            const aTime = new Date(a.created_at || 0).getTime();
            const bTime = new Date(b.created_at || 0).getTime();
            return sortOrder === "desc" ? bTime - aTime : aTime - bTime;
        });
    }, [interactionItems, sortOrder]);

    const sortedPosts = useMemo(() => {
        return [...myPosts].sort((a, b) => {
            const aTime = new Date(a.created_at || 0).getTime();
            const bTime = new Date(b.created_at || 0).getTime();
            return sortOrder === "desc" ? bTime - aTime : aTime - bTime;
        });
    }, [myPosts, sortOrder]);

    const groupedCommentThreads = useMemo(() => {
        if (tab !== "comments") return [];

        const groups = new Map();

        sortedInteractions.forEach((item) => {
            const threadKey = `${item.post_id}:${item.parent_id || item.id}`;
            if (!groups.has(threadKey)) {
                groups.set(threadKey, {
                    key: threadKey,
                    post_id: item.post_id,
                    post_thumbnail: item.post_thumbnail,
                    items: [],
                    latest_at: item.created_at,
                });
            }

            const group = groups.get(threadKey);
            group.items.push(item);

            if (new Date(item.created_at) > new Date(group.latest_at)) {
                group.latest_at = item.created_at;
            }
        });

        return Array.from(groups.values())
            .map((group) => ({
                ...group,
                items: [...group.items].sort((a, b) => {
                    const aTime = new Date(a.created_at || 0).getTime();
                    const bTime = new Date(b.created_at || 0).getTime();
                    return aTime - bTime;
                }),
            }))
            .sort((a, b) => {
                const aTime = new Date(a.latest_at || 0).getTime();
                const bTime = new Date(b.latest_at || 0).getTime();
                return sortOrder === "desc" ? bTime - aTime : aTime - bTime;
            });
    }, [sortedInteractions, sortOrder, tab]);

    const accountHistory = useMemo(() => {
        if (!me) return [];

        const profile = me.profile || {};
        const latestPost = myPosts[0];

        return [
            {
                id: "profile-handle",
                title: "Current profile",
                meta: `@${profile.username || "outstagram"}`,
                description: profile.bio || "No bio added yet.",
                icon: <Tag size={18} />,
            },
            {
                id: "last-sign-in",
                title: "Last sign in",
                meta: me.user?.last_sign_in_at ? formatFullDate(me.user.last_sign_in_at) : "Unknown",
                description: me.user?.email || "Signed in user",
                icon: <CalendarDays size={18} />,
            },
            {
                id: "content-summary",
                title: "Published content",
                meta: `${myPosts.length} posts`,
                description: latestPost?.caption || "Your latest post appears here.",
                icon: <ImageIcon size={18} />,
            },
        ];
    }, [me, myPosts]);

    const activePhotoPost = activePhotoIndex !== null ? sortedPosts[activePhotoIndex] : null;

    const toggleSelected = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const renderInteractionGrid = () => {
        if (!sortedInteractions.length) {
            return <div className="activity-empty-state">No items yet for this tab.</div>;
        }

        return (
            <div className="activity-grid">
                {sortedInteractions.map((item) => {
                    const storyReply = tab === "story-replies";
                    const actor = item.actor || {};
                    const mediaUrl = item.post_thumbnail || null;
                    const isSelected = selectedIds.includes(item.id);

                    return (
                        <button
                            key={item.id}
                            type="button"
                            className={`activity-tile ${storyReply ? "activity-tile--story-reply" : ""} ${isSelected ? "selected" : ""}`}
                            onClick={() => {
                                if (selectionMode) {
                                    toggleSelected(item.id);
                                    return;
                                }

                                if (storyReply) {
                                    navigate("/messages");
                                    return;
                                }

                                if (item.post_id) {
                                    setActivePostId(item.post_id);
                                    return;
                                }

                                if (actor.username) {
                                    navigate(`/profile/${actor.username}`);
                                }
                            }}
                        >
                            {mediaUrl ? (
                                <img src={mediaUrl} alt="" className="activity-tile-media" />
                            ) : (
                                <div className="activity-tile-fallback">
                                    {actor.avatar_url ? (
                                        <img src={actor.avatar_url} alt={actor.username || "User"} className="activity-tile-avatar" />
                                    ) : (
                                        <div className="activity-tile-avatar activity-tile-avatar--placeholder" />
                                    )}
                                    <strong>{actor.username || "Activity"}</strong>
                                </div>
                            )}

                            <div className="activity-tile-overlay">
                                <div className="activity-tile-meta">{timeAgo(item.created_at)}</div>
                                <div className="activity-tile-copy">
                                    {storyReply
                                        ? item.body
                                        : `${actor.username || "Someone"} ${tab === "likes" ? "liked" : tab === "comments" ? "commented on" : "followed"} your content`}
                                </div>
                            </div>

                            {selectionMode ? (
                                <span className="activity-selection-dot">{isSelected ? "✓" : ""}</span>
                            ) : null}
                        </button>
                    );
                })}
            </div>
        );
    };

    const renderCommentThreads = () => {
        if (!groupedCommentThreads.length) {
            return <div className="activity-empty-state">No comments yet.</div>;
        }

        return (
            <div className="activity-comments-list">
                {groupedCommentThreads.map((thread) => (
                    <div key={thread.key} className="activity-comment-thread">
                        <div className="activity-comment-thread-items">
                            {thread.items.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    className={`activity-comment-row ${item.parent_id ? "is-reply" : ""}`}
                                    onClick={() => setActivePostId(item.post_id)}
                                >
                                    <img
                                        src={item.avatar_url || "https://placehold.co/48x48/1f2937/ffffff?text=U"}
                                        alt={item.username || "User"}
                                        className="activity-comment-avatar"
                                    />
                                    <div className="activity-comment-copy">
                                        <div className="activity-comment-text">
                                            <strong>{item.username}</strong>
                                            <span>{item.content}</span>
                                        </div>
                                        <div className="activity-comment-meta">
                                            <span>{timeAgo(item.created_at)}</span>
                                            {item.parent_id ? <span>Reply</span> : null}
                                            {!item.is_mine && item.parent_username ? <span>Replied to you</span> : null}
                                        </div>
                                    </div>
                                    <div className="activity-comment-thumb-wrap">
                                        {thread.post_thumbnail ? (
                                            thread.post_media_type === "video" ? (
                                                <video src={thread.post_thumbnail} className="activity-comment-thumb" muted playsInline />
                                            ) : (
                                                <img src={thread.post_thumbnail} alt="" className="activity-comment-thumb" />
                                            )
                                        ) : (
                                            <div className="activity-comment-thumb activity-comment-thumb--empty" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <button
                            type="button"
                            className="activity-comment-thread-link"
                            onClick={() => setActivePostId(thread.post_id)}
                        >
                            <span className="activity-comment-thread-line" />
                            <span>View entire thread</span>
                        </button>
                    </div>
                ))}
            </div>
        );
    };

    const renderPhotosGrid = () => {
        if (!sortedPosts.length) {
            return <div className="activity-empty-state">No posts yet.</div>;
        }

        return (
            <div className="activity-grid">
                {sortedPosts.map((post, index) => {
                    const cover = getCoverMedia(post);
                    const isSelected = selectedIds.includes(post.id);

                    return (
                        <button
                            key={post.id}
                            type="button"
                            className={`activity-tile ${isSelected ? "selected" : ""}`}
                            onClick={() => {
                                if (selectionMode) {
                                    toggleSelected(post.id);
                                    return;
                                }
                                setActivePhotoIndex(index);
                            }}
                        >
                            {cover ? (
                                cover.type === "video" ? (
                                    <video src={cover.url || cover.media_url} className="activity-tile-media" muted playsInline />
                                ) : (
                                    <img src={cover.url || cover.media_url} alt={post.caption || "Post"} className="activity-tile-media" />
                                )
                            ) : (
                                <div className="activity-tile-fallback">
                                    <ImageIcon size={28} />
                                </div>
                            )}

                            <div className="activity-tile-overlay">
                                <div className="activity-tile-meta">{timeAgo(post.created_at)}</div>
                                <div className="activity-tile-copy">{post.caption || "Untitled post"}</div>
                            </div>

                            {selectionMode ? (
                                <span className="activity-selection-dot">{isSelected ? "✓" : ""}</span>
                            ) : null}
                        </button>
                    );
                })}
            </div>
        );
    };

    const renderHistory = () => {
        if (!accountHistory.length) {
            return <div className="activity-empty-state">No account history available.</div>;
        }

        return (
            <div className="activity-history-list">
                {accountHistory.map((item) => (
                    <div key={item.id} className="activity-history-card">
                        <div className="activity-history-icon">{item.icon}</div>
                        <div className="activity-history-copy">
                            <strong>{item.title}</strong>
                            <span>{item.meta}</span>
                            <p>{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <MainLayout variant="feed">
            <div className="activity-page">
                <div className="activity-shell">
                    <aside className="activity-sidebar">
                        <div className="activity-sidebar-header">
                            <h1>Your activity</h1>
                        </div>

                        <div className="activity-sidebar-list">
                            {sections.map((item) => (
                                <button
                                    key={item.key}
                                    type="button"
                                    className={`activity-sidebar-item ${section === item.key ? "active" : ""}`}
                                    onClick={() => setSection(item.key)}
                                >
                                    <span className="activity-sidebar-icon">{item.icon}</span>
                                    <span className="activity-sidebar-copy">
                                        <strong>{item.title}</strong>
                                        <span>{item.description}</span>
                                    </span>
                                </button>
                            ))}
                        </div>
                    </aside>

                    <section className="activity-main">
                        {section === "interactions" ? (
                            <>
                                <div className="activity-top-tabs">
                                    {tabs.map((item) => (
                                        <button
                                            key={item.key}
                                            type="button"
                                            className={`activity-top-tab ${tab === item.key ? "active" : ""}`}
                                            onClick={() => setTab(item.key)}
                                        >
                                            {item.icon}
                                            <span>{item.label}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="activity-toolbar">
                                    <div className="activity-toolbar-title">
                                        {sortOrder === "desc" ? "Newest to oldest" : "Oldest to newest"}
                                    </div>
                                    <div className="activity-toolbar-actions">
                                        <button
                                            type="button"
                                            className="activity-filter-btn"
                                            onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
                                        >
                                            <ArrowDownUp size={16} />
                                            Sort & filter
                                        </button>
                                        <button
                                            type="button"
                                            className="activity-link-btn"
                                            onClick={() => setSelectionMode((prev) => !prev)}
                                        >
                                            {selectionMode ? "Done" : "Select"}
                                        </button>
                                    </div>
                                </div>

                                {loading ? <div className="activity-empty-state">Loading activity...</div> : null}
                                {!loading && error ? <div className="activity-empty-state">{error}</div> : null}
                                {!loading && !error ? (
                                    tab === "comments" ? renderCommentThreads() : renderInteractionGrid()
                                ) : null}
                            </>
                        ) : null}

                        {section === "photos-videos" ? (
                            <>
                                <div className="activity-toolbar">
                                    <div className="activity-toolbar-title">Photos and videos</div>
                                    <div className="activity-toolbar-actions">
                                        <button
                                            type="button"
                                            className="activity-filter-btn"
                                            onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
                                        >
                                            <ArrowDownUp size={16} />
                                            Sort
                                        </button>
                                        <button
                                            type="button"
                                            className="activity-link-btn"
                                            onClick={() => setSelectionMode((prev) => !prev)}
                                        >
                                            {selectionMode ? "Done" : "Select"}
                                        </button>
                                    </div>
                                </div>
                                {loading ? <div className="activity-empty-state">Loading posts...</div> : renderPhotosGrid()}
                            </>
                        ) : null}

                        {section === "account-history" ? (
                            <>
                                <div className="activity-toolbar">
                                    <div className="activity-toolbar-title">Account history</div>
                                    <div className="activity-toolbar-actions">
                                        <span className="activity-history-badge">
                                            <SearchCheck size={15} />
                                            Live account snapshot
                                        </span>
                                    </div>
                                </div>
                                {loading ? <div className="activity-empty-state">Loading account history...</div> : renderHistory()}
                            </>
                        ) : null}
                    </section>
                </div>
            </div>

            <FeedMessagesWidget />

            {activePostId ? (
                <ExplorePostModal postId={activePostId} onClose={() => setActivePostId(null)} />
            ) : null}

            {activePhotoPost ? (
                <ExplorePostModal
                    postId={activePhotoPost.id}
                    onClose={() => setActivePhotoIndex(null)}
                    hasPrev={activePhotoIndex > 0}
                    hasNext={activePhotoIndex < sortedPosts.length - 1}
                    onPrev={() => setActivePhotoIndex((prev) => Math.max(0, prev - 1))}
                    onNext={() => setActivePhotoIndex((prev) => Math.min(sortedPosts.length - 1, prev + 1))}
                    onPostDeleted={(deletedId) => {
                        setMyPosts((prev) => prev.filter((item) => item.id !== deletedId));
                        setActivePhotoIndex(null);
                    }}
                />
            ) : null}
        </MainLayout>
    );
}
