import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { useMessages } from "../hooks/useMessages";
import Avatar from "../components/Avatar";
import NewMessageModal from "../components/NewMessageModal";
import { supabase } from "../lib/supabase";
import {
    ArrowLeft,
    ChevronDown,
    Loader2,
    MessageCircle,
    PenSquare,
    Search,
    Send,
    UserRound,
} from "lucide-react";
import "../styles/DirectMessages.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function timeAgo(dateStr) {
    if (!dateStr) return "Now";
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    return `${Math.floor(diff / 604800)}w`;
}

function formatDayLabel(dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function isPlaceholderBody(message) {
    return message?.body === "__shared_post__";
}

function getConversationPreview(lastMessage, isCurrentUserSender) {
    if (!lastMessage) return "Start chatting";
    if (lastMessage.is_deleted) return "Message deleted";
    if (lastMessage.message_type === "post_share") {
        return isCurrentUserSender ? "You shared a post" : "Shared a post";
    }
    return lastMessage.body;
}

export default function DirectMessages() {
    const {
        conversations,
        activeConvId,
        setActiveConvId,
        messages,
        loadingMessages,
        sending,
        sendMessage,
        deleteMessage,
        openConversation,
        loading,
    } = useMessages();

    const [inputText, setInputText] = useState("");
    const [showNewModal, setShowNewModal] = useState(false);
    const [myId, setMyId] = useState(null);
    const [profile, setProfile] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const bootstrap = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setMyId(session?.user?.id || null);

            if (!session?.access_token) return;
            try {
                const res = await fetch(`${API_BASE_URL}/api/v1/me`, {
                    headers: { Authorization: `Bearer ${session.access_token}` },
                });
                if (!res.ok) return;
                const json = await res.json();
                setProfile(json.data?.profile || null);
            } catch (_) {
                setProfile(null);
            }
        };

        bootstrap();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, activeConvId]);

    const activeConversation = useMemo(
        () => conversations.find((conversation) => conversation.id === activeConvId) || null,
        [conversations, activeConvId]
    );

    const filteredConversations = useMemo(() => {
        if (!searchQuery.trim()) return conversations;
        const query = searchQuery.trim().toLowerCase();

        return conversations.filter((conversation) => {
            const displayName = conversation.other_user?.display_name?.toLowerCase() || "";
            const username = conversation.other_user?.username?.toLowerCase() || "";
            const lastMessage = conversation.last_message?.body?.toLowerCase() || "";
            return displayName.includes(query) || username.includes(query) || lastMessage.includes(query);
        });
    }, [conversations, searchQuery]);

    const quickPicks = useMemo(
        () => conversations.slice(0, 6),
        [conversations]
    );

    const suggestedUsers = useMemo(
        () => conversations.map((conversation) => conversation.other_user).filter(Boolean),
        [conversations]
    );

    const unreadConversationCount = useMemo(
        () => conversations.filter((conversation) => (conversation.unread_count || 0) > 0).length,
        [conversations]
    );

    const groupedMessages = useMemo(() => {
        const groups = [];
        let currentLabel = null;

        messages.forEach((message) => {
            const label = formatDayLabel(message.created_at);
            if (label !== currentLabel) {
                groups.push({ type: "divider", label });
                currentLabel = label;
            }
            groups.push({ type: "message", value: message });
        });

        return groups;
    }, [messages]);

    const handleSend = useCallback(async () => {
        if (!inputText.trim() || sending) return;
        const text = inputText;
        setInputText("");
        await sendMessage(text);
    }, [inputText, sending, sendMessage]);

    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    const handleSelectNewUser = useCallback(async (user) => {
        setShowNewModal(false);
        await openConversation(user.user_id || user.id);
    }, [openConversation]);

    return (
        <MainLayout
            variant="feed"
            shellClassName="feed-layout-shell--flush"
            mainClassName="feed-layout-main--stretch"
        >
            <div className={`dm-page ${activeConvId ? "chat-open" : ""}`}>
                <aside className="dm-sidebar">
                    <div className="dm-sidebar-top">
                        <div className="dm-profile-bar">
                            <div className="dm-profile-bar-main">
                                <Avatar
                                    url={profile?.avatar_url}
                                    alt={profile?.username || "Me"}
                                    size={46}
                                />
                                <div className="dm-profile-copy">
                                    <div className="dm-profile-name">
                                        <span>{profile?.username || "messages"}</span>
                                        <ChevronDown size={16} />
                                    </div>
                                    <div className="dm-profile-subtitle">
                                        {profile?.display_name || "Direct messages"}
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="dm-icon-button"
                                onClick={() => setShowNewModal(true)}
                                title="New message"
                            >
                                <PenSquare size={18} />
                            </button>
                        </div>

                        <div className="dm-search-bar">
                            <Search size={16} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Search conversations"
                            />
                        </div>

                        {quickPicks.length > 0 ? (
                            <div className="dm-quick-strip">
                                <div className="dm-section-label">Quick chats</div>
                                <div className="dm-quick-list">
                                    {quickPicks.map((conversation) => (
                                        <button
                                            key={conversation.id}
                                            type="button"
                                            className={`dm-quick-item ${conversation.id === activeConvId ? "active" : ""}`}
                                            onClick={() => setActiveConvId(conversation.id)}
                                        >
                                            <Avatar
                                                url={conversation.other_user?.avatar_url}
                                                alt={conversation.other_user?.username || "User"}
                                                size={56}
                                            />
                                            <span>{conversation.other_user?.username || "user"}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        <div className="dm-list-header">
                            <strong>Messages</strong>
                            <span className="dm-list-chip">
                                {unreadConversationCount > 0 ? `${unreadConversationCount} unread` : "All caught up"}
                            </span>
                        </div>
                    </div>

                    <div className="dm-conv-list">
                        {loading ? (
                            <div className="dm-conv-empty">
                                <Loader2 size={24} className="spinning" />
                            </div>
                        ) : null}

                        {!loading && !filteredConversations.length ? (
                            <div className="dm-conv-empty">
                                {searchQuery.trim() ? "No conversations match your search." : "No messages yet. Start a conversation."}
                            </div>
                        ) : null}

                        {!loading && filteredConversations.map((conversation) => {
                            const otherUser = conversation.other_user;
                            const lastMessage = conversation.last_message;
                            const isActive = conversation.id === activeConvId;
                            const hasUnread = (conversation.unread_count || 0) > 0;

                            return (
                                <button
                                    key={conversation.id}
                                    type="button"
                                    className={`dm-conv-item ${isActive ? "active" : ""}`}
                                    onClick={() => setActiveConvId(conversation.id)}
                                >
                                    <div className="dm-conv-avatar">
                                        <Avatar
                                            url={otherUser?.avatar_url}
                                            alt={otherUser?.username || "User"}
                                            size={52}
                                        />
                                        {hasUnread ? <span className="dm-unread-badge" /> : null}
                                    </div>

                                    <div className="dm-conv-info">
                                        <div className="dm-conv-topline">
                                            <span className="dm-conv-name">{otherUser?.display_name || otherUser?.username || "User"}</span>
                                            <span className="dm-conv-time">{timeAgo(conversation.last_msg_at)}</span>
                                        </div>
                                        <div className={`dm-conv-preview ${hasUnread ? "unread" : ""}`}>
                                            {getConversationPreview(lastMessage, lastMessage?.sender_id === myId)}
                                        </div>
                                        <div className="dm-conv-meta">
                                            @{otherUser?.username || "user"}
                                            {hasUnread ? (
                                                <span className="dm-conv-count">
                                                    {conversation.unread_count > 9 ? "9+" : conversation.unread_count}
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </aside>

                <section className="dm-chat">
                    {!activeConversation ? (
                        <div className="dm-chat-placeholder">
                            <div className="dm-chat-placeholder-icon">
                                <MessageCircle size={54} />
                            </div>
                            <h3>Your messages</h3>
                            <p>Send private messages to friends without leaving your desktop flow.</p>
                            <button
                                type="button"
                                className="dm-primary-btn"
                                onClick={() => setShowNewModal(true)}
                            >
                                Send message
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="dm-chat-header">
                                <div className="dm-chat-header-main">
                                    <button
                                        type="button"
                                        className="dm-icon-button dm-chat-back"
                                        onClick={() => setActiveConvId(null)}
                                        title="Back to conversations"
                                    >
                                        <ArrowLeft size={18} />
                                    </button>
                                    <Avatar
                                        url={activeConversation.other_user?.avatar_url}
                                        alt={activeConversation.other_user?.username || "User"}
                                        size={42}
                                    />
                                    <div className="dm-chat-header-copy">
                                        <strong>{activeConversation.other_user?.display_name || activeConversation.other_user?.username || "User"}</strong>
                                        <span>{activeConversation.last_msg_at ? `Active ${timeAgo(activeConversation.last_msg_at)} ago` : "Active recently"}</span>
                                    </div>
                                </div>

                                {activeConversation.other_user?.username ? (
                                    <button
                                        type="button"
                                        className="dm-secondary-btn"
                                        onClick={() => navigate(`/profile/${activeConversation.other_user.username}`)}
                                    >
                                        <UserRound size={16} />
                                        View profile
                                    </button>
                                ) : null}
                            </div>

                            <div className="dm-messages">
                                {loadingMessages ? (
                                    <div className="dm-messages-loading">
                                        <Loader2 size={24} className="spinning" />
                                    </div>
                                ) : null}

                                {!loadingMessages && !groupedMessages.length ? (
                                    <div className="dm-chat-empty-thread">
                                        <Avatar
                                            url={activeConversation.other_user?.avatar_url}
                                            alt={activeConversation.other_user?.username || "User"}
                                            size={62}
                                        />
                                        <strong>{activeConversation.other_user?.display_name || activeConversation.other_user?.username || "User"}</strong>
                                        <span>Start this conversation with a quick hello.</span>
                                    </div>
                                ) : null}

                                {!loadingMessages && groupedMessages.map((item, index) => {
                                    if (item.type === "divider") {
                                        return (
                                            <div key={`${item.label}-${index}`} className="dm-day-divider">
                                                {item.label}
                                            </div>
                                        );
                                    }

                                    const message = item.value;
                                    const isMine = message.sender_id === myId;

                                    return (
                                        <div key={message.id} className={`dm-msg-row ${isMine ? "mine" : "theirs"}`}>
                                            {!isMine ? (
                                                <Avatar
                                                    url={message.sender_avatar_url}
                                                    alt={message.sender_username || "User"}
                                                    size={28}
                                                />
                                            ) : null}
                                            <div className="dm-msg-bubble-wrap">
                                                {renderMessageContent({
                                                    message,
                                                    isMine,
                                                    navigate,
                                                })}
                                                <div className="dm-msg-meta">
                                                    <span className="dm-msg-time">{timeAgo(message.created_at)}</span>
                                                    {isMine && !message.is_deleted ? (
                                                        <button
                                                            type="button"
                                                            className="dm-msg-delete-btn"
                                                            onClick={() => deleteMessage(message.id)}
                                                            title="Delete"
                                                        >
                                                            Delete
                                                        </button>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                <div ref={messagesEndRef} />
                            </div>

                            <div className="dm-input-bar">
                                <textarea
                                    className="dm-input"
                                    placeholder="Message..."
                                    value={inputText}
                                    onChange={(event) => setInputText(event.target.value)}
                                    onKeyDown={handleKeyDown}
                                    rows={1}
                                />
                                <button
                                    type="button"
                                    className="dm-send-btn"
                                    onClick={handleSend}
                                    disabled={!inputText.trim() || sending}
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </>
                    )}
                </section>
            </div>

            {showNewModal ? (
                <NewMessageModal
                    onClose={() => setShowNewModal(false)}
                    onSelect={handleSelectNewUser}
                    suggestedUsers={suggestedUsers}
                />
            ) : null}
        </MainLayout>
    );
}

function msgIsDeletedClass(message) {
    if (message.is_deleted) return "dm-msg-deleted";
    return "";
}

function renderMessageContent({ message, isMine, navigate }) {
    if (message.is_deleted) {
        return <div className={`dm-msg-bubble ${msgIsDeletedClass(message)}`}>Message deleted</div>;
    }

    if (message.message_type === "post_share") {
        const post = message.metadata?.post || {};
        const hasCustomNote = message.body && !isPlaceholderBody(message);

        return (
            <>
                {hasCustomNote ? (
                    <div className={`dm-msg-bubble ${msgIsDeletedClass(message)}`}>
                        {message.body}
                    </div>
                ) : null}
                <button
                    type="button"
                    className={`dm-shared-post-card ${isMine ? "mine" : "theirs"}`}
                    onClick={() => post.id && navigate(`/p/${post.id}`)}
                    disabled={!post.id}
                >
                    <div className="dm-shared-post-header">
                        <div className="dm-shared-post-author">
                            <Avatar
                                url={post.owner_avatar_url}
                                alt={post.owner_username || "Post owner"}
                                size={34}
                            />
                            <span>{post.owner_username || "Outstagram"}</span>
                        </div>
                    </div>

                    <div className="dm-shared-post-media">
                        {post.thumbnail_url ? (
                            post.media_type === "video" ? (
                                <video src={post.thumbnail_url} muted playsInline />
                            ) : (
                                <img
                                    src={post.thumbnail_url}
                                    alt={post.caption || `Shared post by ${post.owner_username || "user"}`}
                                />
                            )
                        ) : (
                            <div className="dm-shared-post-placeholder">Post unavailable</div>
                        )}
                    </div>

                    <div className="dm-shared-post-footer">
                        <strong>{post.owner_username || "Outstagram"}</strong>
                        <span>{post.caption || "Shared a post"}</span>
                    </div>
                </button>
            </>
        );
    }

    return <div className={`dm-msg-bubble ${msgIsDeletedClass(message)}`}>{message.body}</div>;
}
