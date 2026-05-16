import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { useNotifications } from "../hooks/useNotifications";
import { Heart, UserPlus, MessageCircle, Loader2, CheckCheck } from "lucide-react";
import Avatar from "../components/Avatar";
import "../styles/Notifications.css";

export default function Notifications() {
    const navigate = useNavigate();
    const {
        notifications,
        unreadCount,
        loading,
        loadingMore,
        hasMore,
        error,
        loadMore,
        markAsRead,
        markAllAsRead,
        refresh
    } = useNotifications({ enabled: true });

    const observerTarget = useRef(null);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [hasMore, loadingMore, loading, loadMore]);

    const handleNotificationClick = useCallback((notification) => {
        // Mark as read
        if (!notification.is_read) {
            markAsRead(notification.id);
        }

        // Navigate based on type
        if (notification.type === "follow") {
            navigate(`/profile/${notification.actor.username}`);
        } else if (notification.type === "like" || notification.type === "comment") {
            if (notification.post_id) {
                navigate(`/p/${notification.post_id}`);
            }
        }
    }, [markAsRead, navigate]);

    const getNotificationIcon = (type) => {
        switch (type) {
            case "follow":
                return <UserPlus size={20} className="notif-icon follow" />;
            case "like":
                return <Heart size={20} className="notif-icon like" fill="#ed4956" color="#ed4956" />;
            case "comment":
                return <MessageCircle size={20} className="notif-icon comment" />;
            default:
                return null;
        }
    };

    const getNotificationMessage = (notification) => {
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
    };

    const timeAgo = (dateStr) => {
        const d = new Date(dateStr);
        const now = new Date();
        const diffInSeconds = Math.max(0, Math.floor((now - d) / 1000));

        if (diffInSeconds < 60) return `${diffInSeconds}s`;
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d`;
        return d.toLocaleDateString();
    };

    if (error) {
        return (
            <MainLayout>
                <div className="notifications-page">
                    <div className="notifications-header">
                        <h1>Notifications</h1>
                    </div>
                    <div className="notifications-error">
                        Error: {error}
                        <button onClick={refresh}>Retry</button>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="notifications-page">
                <div className="notifications-header">
                    <h1>Notifications</h1>
                    {unreadCount > 0 && (
                        <button
                            className="mark-all-read-btn"
                            onClick={markAllAsRead}
                        >
                            <CheckCheck size={18} />
                            Mark all as read
                        </button>
                    )}
                </div>

                {loading && notifications.length === 0 ? (
                    <div className="notifications-loading">
                        <Loader2 className="spinning" size={32} />
                        Loading notifications...
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="notifications-empty">
                        No notifications yet
                    </div>
                ) : (
                    <div className="notifications-list">
                        {notifications.map(notif => (
                            <div
                                key={notif.id}
                                className={`notification-item ${!notif.is_read ? "unread" : ""}`}
                                onClick={() => handleNotificationClick(notif)}
                            >
                                <div className="notification-avatar">
                                    <Avatar
                                        url={notif.actor?.avatar_url}
                                        alt={notif.actor?.username || "User"}
                                        size={44}
                                    />
                                    <div className="notification-type-badge">
                                        {getNotificationIcon(notif.type)}
                                    </div>
                                </div>

                                <div className="notification-content">
                                    <p className="notification-text">
                                        {getNotificationMessage(notif)}
                                    </p>
                                    <span className="notification-time">
                                        {timeAgo(notif.created_at)}
                                    </span>
                                </div>

                                {notif.post_thumbnail && (
                                    <div className="notification-thumbnail">
                                        <img
                                            src={notif.post_thumbnail}
                                            alt="Post thumbnail"
                                        />
                                    </div>
                                )}

                                {!notif.is_read && (
                                    <div className="notification-unread-dot" />
                                )}
                            </div>
                        ))}

                        {/* Sentinel for IntersectionObserver */}
                        <div ref={observerTarget} className="notifications-sentinel">
                            {loadingMore && (
                                <div className="loading-more">
                                    <Loader2 className="spinning" size={20} />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
