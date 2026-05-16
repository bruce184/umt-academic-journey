import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCheck, Heart, MessageCircle, UserPlus, X } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";
import Avatar from "./Avatar";
import "../styles/NotificationsDrawer.css";

function timeAgo(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.max(0, Math.floor((now - d) / 1000));

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1d";
    if (diffInDays < 7) return `${diffInDays}d`;
    return d.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
}

function getNotificationIcon(type) {
    switch (type) {
        case "follow":
            return <UserPlus size={16} className="notifications-drawer-type follow" />;
        case "like":
            return <Heart size={16} className="notifications-drawer-type like" fill="#ed4956" color="#ed4956" />;
        case "comment":
            return <MessageCircle size={16} className="notifications-drawer-type comment" />;
        default:
            return null;
    }
}

function getNotificationMessage(notification) {
    const username = notification.actor?.username || "Someone";
    switch (notification.type) {
        case "follow":
            return <><strong>{username}</strong> started following you</>;
        case "like":
            return <><strong>{username}</strong> liked your post</>;
        case "comment":
            return <><strong>{username}</strong> commented on your post</>;
        default:
            return <><strong>{username}</strong> interacted with you</>;
    }
}

function getSectionLabel(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    if (date >= startOfToday) return "Today";
    if (date >= startOfYesterday) return "Yesterday";
    if (date >= startOfWeek) return "This week";
    if (date >= startOfMonth) return "This month";
    return "Earlier";
}

export default function NotificationsDrawer({ open, onClose }) {
    const [activeTab, setActiveTab] = useState("all");
    const navigate = useNavigate();
    const {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
    } = useNotifications({ enabled: open });

    useEffect(() => {
        if (!open) return;

        const handleEscape = (event) => {
            if (event.key === "Escape") onClose();
        };

        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [onClose, open]);

    const filteredNotifications = useMemo(() => {
        if (activeTab === "comments") {
            return notifications.filter((notification) => notification.type === "comment");
        }
        return notifications;
    }, [activeTab, notifications]);

    const groupedNotifications = useMemo(() => {
        return filteredNotifications.reduce((acc, notification) => {
            const label = getSectionLabel(notification.created_at);
            if (!acc[label]) acc[label] = [];
            acc[label].push(notification);
            return acc;
        }, {});
    }, [filteredNotifications]);

    const orderedSections = ["Today", "Yesterday", "This week", "This month", "Earlier"].filter(
        (label) => groupedNotifications[label]?.length
    );

    const handleNotificationClick = async (notification) => {
        if (!notification.is_read) {
            await markAsRead(notification.id);
        }

        onClose();

        if (notification.type === "follow") {
            navigate(`/profile/${notification.actor.username}`);
        } else if ((notification.type === "like" || notification.type === "comment") && notification.post_id) {
            navigate(`/p/${notification.post_id}`);
        }
    };

    return (
        <aside className={`notifications-drawer ${open ? "open" : ""}`}>
            <div className="notifications-drawer-header">
                <h2>Notifications</h2>
                <button type="button" className="notifications-drawer-close" onClick={onClose}>
                    <X size={22} />
                </button>
            </div>

            <div className="notifications-drawer-tabs">
                <button
                    type="button"
                    className={`notifications-drawer-tab ${activeTab === "all" ? "active" : ""}`}
                    onClick={() => setActiveTab("all")}
                >
                    All
                </button>
                <button
                    type="button"
                    className={`notifications-drawer-tab ${activeTab === "comments" ? "active" : ""}`}
                    onClick={() => setActiveTab("comments")}
                >
                    Comments
                </button>
                {unreadCount > 0 ? (
                    <button
                        type="button"
                        className="notifications-drawer-mark-all"
                        onClick={markAllAsRead}
                        title="Mark all as read"
                    >
                        <CheckCheck size={16} />
                    </button>
                ) : null}
            </div>

            <div className="notifications-drawer-body">
                {loading ? <div className="notifications-drawer-empty">Loading notifications...</div> : null}
                {!loading && !filteredNotifications.length ? (
                    <div className="notifications-drawer-empty">No notifications yet.</div>
                ) : null}

                {!loading && orderedSections.map((section) => (
                    <section key={section} className="notifications-drawer-section">
                        <h3>{section}</h3>
                        <div className="notifications-drawer-list">
                            {groupedNotifications[section].map((notification) => (
                                <button
                                    key={notification.id}
                                    type="button"
                                    className={`notifications-drawer-item ${!notification.is_read ? "unread" : ""}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="notifications-drawer-avatar">
                                        <Avatar
                                            url={notification.actor?.avatar_url}
                                            alt={notification.actor?.username || "User"}
                                            size={46}
                                        />
                                        <span className="notifications-drawer-badge">
                                            {getNotificationIcon(notification.type)}
                                        </span>
                                    </div>

                                    <span className="notifications-drawer-copy">
                                        <span className="notifications-drawer-text">
                                            {getNotificationMessage(notification)} <span className="notifications-drawer-time">{timeAgo(notification.created_at)}</span>
                                        </span>
                                    </span>

                                    {notification.post_thumbnail ? (
                                        <span className="notifications-drawer-thumb">
                                            <img src={notification.post_thumbnail} alt="Post" />
                                        </span>
                                    ) : null}

                                    {!notification.is_read ? <span className="notifications-drawer-dot" /> : null}
                                </button>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </aside>
    );
}
