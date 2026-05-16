import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Maximize2, Minimize2, MessageCircle, PenSquare, Send, X, ArrowLeft } from "lucide-react";
import { useMessages } from "../hooks/useMessages";
import { supabase } from "../lib/supabase";
import Avatar from "./Avatar";
import NewMessageModal from "./NewMessageModal";
import "../styles/FeedMessagesWidget.css";

function timeAgo(dateStr) {
    if (!dateStr) return "";
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
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}


export default function FeedMessagesWidget() {
    const {
        conversations,
        activeConvId,
        setActiveConvId,
        messages,
        unreadCount,
        loading,
        loadingMessages,
        sending,
        sendMessage,
        openConversation,
    } = useMessages();

    const [open, setOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [inputText, setInputText] = useState("");
    const [showNewModal, setShowNewModal] = useState(false);
    const [myId, setMyId] = useState(null);
    const messagesEndRef = useRef(null);

    const handleCloseWidget = useCallback(() => {
        setShowNewModal(false);
        setExpanded(false);
        setActiveConvId(null);
        setOpen(false);
    }, [setActiveConvId]);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setMyId(session?.user?.id || null);
        });
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, activeConvId]);

    useEffect(() => {
        if (!open && !showNewModal) return;

        const handleEscape = (event) => {
            if (event.key !== "Escape") return;

            if (showNewModal) {
                setShowNewModal(false);
                return;
            }

            if (activeConvId) {
                setActiveConvId(null);
                return;
            }

            handleCloseWidget();
        };

        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [activeConvId, handleCloseWidget, open, setActiveConvId, showNewModal]);

    const activeConversation = useMemo(
        () => conversations.find((conversation) => conversation.id === activeConvId) || null,
        [conversations, activeConvId]
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

    const suggestedUsers = useMemo(
        () => conversations.map((conversation) => conversation.other_user).filter(Boolean),
        [conversations]
    );

    const handleOpenWidget = () => {
        setOpen(true);
        setExpanded(false);
        setActiveConvId(null);
    };

    const handleSend = useCallback(async () => {
        if (!inputText.trim() || sending) return;
        const text = inputText;
        setInputText("");
        await sendMessage(text);
    }, [inputText, sending, sendMessage]);

    const handleSelectNewUser = useCallback(async (user) => {
        setShowNewModal(false);
        const conversation = await openConversation(user.user_id || user.id);
        if (conversation?.id) {
            setActiveConvId(conversation.id);
        }
    }, [openConversation, setActiveConvId]);

    if (!open) {
        return (
            <>
                <button type="button" className="feed-message-dock" onClick={handleOpenWidget}>
                    <div className="feed-message-dock-icon">
                        <MessageCircle size={22} />
                        {unreadCount > 0 ? (
                            <span className="feed-message-dock-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
                        ) : null}
                    </div>
                    <span className="feed-message-dock-label">Messages</span>
                    <div className="feed-message-dock-avatars">
                        {conversations.slice(0, 3).map((conversation) => (
                            <Avatar
                                key={conversation.id}
                                url={conversation.other_user?.avatar_url}
                                alt={conversation.other_user?.username || "User"}
                                size={30}
                            />
                        ))}
                    </div>
                </button>
                {showNewModal ? (
                    <NewMessageModal
                        onClose={() => setShowNewModal(false)}
                        onSelect={handleSelectNewUser}
                        suggestedUsers={suggestedUsers}
                    />
                ) : null}
            </>
        );
    }

    return (
        <>
            <div className={`feed-message-widget ${expanded ? "expanded" : ""}`}>
                {!activeConversation ? (
                    <>
                        <div className="feed-message-widget-header">
                            <div className="feed-message-widget-title">
                                <span>Messages</span>
                                {unreadCount > 0 ? <span className="feed-message-widget-badge">{unreadCount}</span> : null}
                            </div>
                            <div className="feed-message-widget-actions">
                                <button type="button" className="feed-message-icon-button" onClick={() => setExpanded((prev) => !prev)}>
                                    {expanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                                </button>
                                <button type="button" className="feed-message-icon-button" onClick={handleCloseWidget}>
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="feed-message-widget-list">
                            {loading ? <div className="feed-message-empty">Loading conversations...</div> : null}
                            {!loading && !conversations.length ? (
                                <div className="feed-message-empty">No conversations yet. Start a new message.</div>
                            ) : null}
                            {conversations.map((conversation) => (
                                <button
                                    key={conversation.id}
                                    type="button"
                                    className="feed-message-conversation"
                                    onClick={() => setActiveConvId(conversation.id)}
                                >
                                    <div className="feed-message-conversation-avatar">
                                        <Avatar
                                            url={conversation.other_user?.avatar_url}
                                            alt={conversation.other_user?.username || "User"}
                                            size={48}
                                        />
                                        {conversation.unread_count > 0 ? <span className="feed-message-conversation-dot" /> : null}
                                    </div>
                                    <div className="feed-message-conversation-copy">
                                        <div className="feed-message-conversation-top">
                                            <span className="feed-message-conversation-name">
                                                {conversation.other_user?.display_name || conversation.other_user?.username || "User"}
                                            </span>
                                            <span className="feed-message-conversation-time">{timeAgo(conversation.last_msg_at)}</span>
                                        </div>
                                        <div className={`feed-message-conversation-preview ${conversation.unread_count > 0 ? "unread" : ""}`}>
                                            {conversation.last_message?.is_deleted
                                                ? "Message deleted"
                                                : conversation.last_message?.body || "Start chatting"}
                                        </div>
                                    </div>
                                    {conversation.unread_count > 0 ? (
                                        <span className="feed-message-conversation-count">
                                            {conversation.unread_count > 9 ? "9+" : conversation.unread_count}
                                        </span>
                                    ) : null}
                                </button>
                            ))}
                        </div>

                        <button
                            type="button"
                            className="feed-message-compose-button"
                            onClick={() => setShowNewModal(true)}
                            title="New message"
                        >
                            <PenSquare size={18} />
                        </button>
                    </>
                ) : (
                    <>
                        <div className="feed-message-widget-header">
                            <div className="feed-message-widget-title detail">
                                <button type="button" className="feed-message-icon-button" onClick={() => setActiveConvId(null)}>
                                    <ArrowLeft size={18} />
                                </button>
                                <Avatar
                                    url={activeConversation.other_user?.avatar_url}
                                    alt={activeConversation.other_user?.username || "User"}
                                    size={36}
                                />
                                <span className="feed-message-chat-meta">
                                    <strong>{activeConversation.other_user?.display_name || activeConversation.other_user?.username || "User"}</strong>
                                    <span>{activeConversation.last_msg_at ? `Active ${timeAgo(activeConversation.last_msg_at)} ago` : "Active recently"}</span>
                                </span>
                            </div>
                            <div className="feed-message-widget-actions">
                                <button type="button" className="feed-message-icon-button" onClick={() => setExpanded((prev) => !prev)}>
                                    {expanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                                </button>
                                <button type="button" className="feed-message-icon-button" onClick={handleCloseWidget}>
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="feed-message-chat-body">
                            {loadingMessages ? <div className="feed-message-empty">Loading chat...</div> : null}
                            {!loadingMessages && !groupedMessages.length ? (
                                <div className="feed-message-chat-empty">
                                    <Avatar
                                        url={activeConversation.other_user?.avatar_url}
                                        alt={activeConversation.other_user?.username || "User"}
                                        size={56}
                                    />
                                    <strong>{activeConversation.other_user?.display_name || activeConversation.other_user?.username || "User"}</strong>
                                    <span>Start the conversation with a quick message.</span>
                                </div>
                            ) : null}
                            {!loadingMessages && groupedMessages.map((item, index) => {
                                if (item.type === "divider") {
                                    return (
                                        <div key={`${item.label}-${index}`} className="feed-message-day-divider">
                                            {item.label}
                                        </div>
                                    );
                                }

                                const message = item.value;
                                const mine = message.sender_id === myId;

                                return (
                                    <div key={message.id} className={`feed-message-row ${mine ? "mine" : "theirs"}`}>
                                        {!mine ? (
                                            <Avatar
                                                url={message.sender_avatar_url}
                                                alt={message.sender_username || "User"}
                                                size={26}
                                            />
                                        ) : null}
                                        <div className="feed-message-bubble-wrap">
                                            <div className={`feed-message-bubble ${mine ? "mine" : "theirs"} ${message.is_deleted ? "deleted" : ""}`}>
                                                {message.is_deleted ? "Message deleted" : message.body}
                                            </div>
                                            <span className="feed-message-bubble-time">{timeAgo(message.created_at)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="feed-message-input-bar">
                            <input
                                className="feed-message-input"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="Message..."
                            />
                            <button
                                type="button"
                                className="feed-message-send"
                                onClick={handleSend}
                                disabled={!inputText.trim() || sending}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </>
                )}
            </div>

            {showNewModal ? (
                <NewMessageModal
                    onClose={() => setShowNewModal(false)}
                    onSelect={handleSelectNewUser}
                    suggestedUsers={suggestedUsers}
                />
            ) : null}
        </>
    );
}
