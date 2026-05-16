import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { User, Search, MessageCircle, House, Compass, Heart, PlusSquare, Menu, Grid2x2, Settings, ChartColumnIncreasing, Moon, CircleAlert, ChevronLeft } from "lucide-react";
import NotificationBell from "./NotificationBell";
import Avatar from "./Avatar";
import SwitchAccountModal from "./SwitchAccountModal";
import { getStoredAppearance, setAppearance } from "../lib/appearance";
import ReportProblemModal from "./ReportProblemModal";
import { useToast } from "./ToastProvider";
import { useSiteName } from "../lib/publicConfig";
import "../styles/Layout.css";

export default function AppHeader({
    onOpenCreate,
    onOpenSearch,
    onOpenNotifications,
    isSearchOpen = false,
    isNotificationsOpen = false,
    variant = "default",
}) {
    const [username, setUsername] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [morePanel, setMorePanel] = useState("root");
    const [showSwitchAccount, setShowSwitchAccount] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);
    const [messageCount, setMessageCount] = useState(0);
    const [appearanceMode, setAppearanceMode] = useState(() => getStoredAppearance());
    const [showProblemModal, setShowProblemModal] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();
    const siteName = useSiteName();

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim().length >= 1) {
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    const token = session?.access_token;

                    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/search/users/${encodeURIComponent(searchQuery)}`, {
                        headers: { Authorization: token ? `Bearer ${token}` : "" }
                    });

                    if (res.ok) {
                        const data = await res.json();
                        setSuggestions(data.data || data || []);
                        setShowDropdown(true);
                    }
                } catch (e) {
                    console.error("Autocomplete error", e);
                }
            } else {
                setSuggestions([]);
                setShowDropdown(false);
            }
        }, 250);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchProfile = async (session) => {
        if (session?.access_token) {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/me`, {
                    headers: { Authorization: `Bearer ${session.access_token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.data?.profile?.username) {
                        setUsername(data.data.profile.username);
                        setAvatarUrl(data.data.profile.avatar_url || "");
                    }
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
            }
        }
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) fetchProfile(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) fetchProfile(session);
            else {
                setUsername("");
                setAvatarUrl("");
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.access_token) {
                await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/logout`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${session.access_token}` },
                });
            }

            await supabase.auth.signOut();
        } catch (error) {
            console.error("Logout error:", error);
            toast.error("Could not log out. Please try again.");
        } finally {
            window.location.href = "/login";
        }
    };

    useEffect(() => {
        const handlePointerDown = (event) => {
            if (!event.target.closest(".feed-sidebar-more-wrap")) {
                setShowMoreMenu(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setShowMoreMenu(false);
                setMorePanel("root");
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        window.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            window.removeEventListener("keydown", handleEscape);
        };
    }, []);

    useEffect(() => {
        setShowMoreMenu(false);
        setMorePanel("root");
    }, [location.pathname]);

    useEffect(() => {
        const handleAppearanceChange = (event) => {
            setAppearanceMode(event.detail?.mode === "light" ? "light" : "dark");
        };

        window.addEventListener("outstagram:appearance-change", handleAppearanceChange);
        return () => window.removeEventListener("outstagram:appearance-change", handleAppearanceChange);
    }, []);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token;
                if (!token) return;

                const [notifRes, messageRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/notifications/unread-count`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/messages/conversations`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                ]);

                if (notifRes.ok) {
                    const notifJson = await notifRes.json();
                    setNotificationCount(notifJson.data?.unreadCount || 0);
                }

                if (messageRes.ok) {
                    const messageJson = await messageRes.json();
                    const totalUnread = (messageJson.data?.conversations || []).reduce(
                        (sum, conversation) => sum + (conversation.unread_count || 0),
                        0
                    );
                    setMessageCount(totalUnread);
                }
            } catch (error) {
                console.error("Failed to fetch sidebar counts", error);
            }
        };

        fetchCounts();
        const timer = setInterval(fetchCounts, 15000);
        return () => clearInterval(timer);
    }, []);

    const handleBrandClick = () => {
        if (location.pathname === "/feed") {
            window.location.reload();
            return;
        }

        navigate("/feed");
    };

    if (variant === "feed") {
        const navItems = [
            { key: "home", label: "Home", icon: <House size={26} />, onClick: () => navigate("/feed") },
            { key: "messages", label: "Messages", icon: <MessageCircle size={26} />, onClick: () => navigate("/messages"), badge: messageCount },
            { key: "search", label: "Search", icon: <Search size={26} />, onClick: () => onOpenSearch?.("") },
            { key: "explore", label: "Explore", icon: <Compass size={26} />, onClick: () => navigate("/search") },
            { key: "notifications", label: "Notifications", icon: <Heart size={26} />, onClick: onOpenNotifications, badge: notificationCount },
            { key: "create", label: "Create", icon: <PlusSquare size={26} />, onClick: onOpenCreate },
        ];

        const moreItems = [
            {
                key: "settings",
                label: "Settings",
                icon: <Settings size={20} />,
                onClick: () => {
                    if (username) navigate("/profile/edit");
                },
            },
            {
                key: "activity",
                label: "Your activity",
                icon: <ChartColumnIncreasing size={20} />,
                onClick: () => {
                    navigate("/activity");
                },
            },
            {
                key: "appearance",
                label: "Switch appearance",
                icon: <Moon size={20} />,
                onClick: () => setMorePanel("appearance"),
            },
            {
                key: "report",
                label: "Report a problem",
                icon: <CircleAlert size={20} />,
                onClick: () => {
                    setShowMoreMenu(false);
                    setShowProblemModal(true);
                },
            },
        ];

        return (
            <aside className="feed-sidebar">
                <button type="button" className="feed-sidebar-brand" onClick={handleBrandClick}>
                    <span className="feed-sidebar-brand-icon">◎</span>
                    <span className="feed-sidebar-brand-text">{siteName}</span>
                </button>

                <nav className="feed-sidebar-nav">
                    {navItems.map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            className={`feed-sidebar-item ${(item.key === "search" && isSearchOpen) || (item.key === "notifications" && isNotificationsOpen) ? "feed-sidebar-item-active" : ""}`}
                            onClick={item.onClick}
                        >
                            <span className="feed-sidebar-icon">
                                {item.icon}
                                {item.badge ? (
                                    <span className="feed-sidebar-badge">
                                        {item.badge > 99 ? "99+" : item.badge}
                                    </span>
                                ) : null}
                            </span>
                            <span className="feed-sidebar-label">{item.label}</span>
                        </button>
                    ))}

                    {username ? (
                        <button
                            type="button"
                            className="feed-sidebar-item"
                            onClick={() => navigate(`/profile/${username}`)}
                        >
                            <span className="feed-sidebar-icon">
                                <Avatar url={avatarUrl} size={28} alt={username} />
                            </span>
                            <span className="feed-sidebar-label">Profile</span>
                        </button>
                    ) : null}
                </nav>

                <div className="feed-sidebar-bottom">
                    <div className="feed-sidebar-more-wrap">
                        {showMoreMenu ? (
                            <div className={`feed-sidebar-more-menu ${morePanel === "appearance" ? "feed-sidebar-more-menu--appearance" : ""}`}>
                                {morePanel === "root" ? (
                                    <>
                                        <div className="feed-sidebar-more-list">
                                            {moreItems.map((item) => (
                                                <button
                                                    key={item.key}
                                                    type="button"
                                                    className="feed-sidebar-more-item"
                                                    onClick={() => {
                                                        item.onClick();
                                                    }}
                                                >
                                                    <span className="feed-sidebar-more-icon">{item.icon}</span>
                                                    <span>{item.label}</span>
                                                </button>
                                            ))}
                                        </div>

                                        <div className="feed-sidebar-more-divider" />

                                        <button
                                            type="button"
                                            className="feed-sidebar-more-item"
                                            onClick={() => {
                                                setShowMoreMenu(false);
                                                setShowSwitchAccount(true);
                                            }}
                                        >
                                            <span>Switch accounts</span>
                                        </button>

                                        <div className="feed-sidebar-more-divider" />

                                        <button
                                            type="button"
                                            className="feed-sidebar-more-item"
                                            onClick={() => {
                                                setShowMoreMenu(false);
                                                handleLogout();
                                            }}
                                        >
                                            <span>Log out</span>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="feed-sidebar-more-subheader">
                                            <button
                                                type="button"
                                                className="feed-sidebar-more-back"
                                                onClick={() => setMorePanel("root")}
                                                aria-label="Back"
                                            >
                                                <ChevronLeft size={18} />
                                            </button>
                                            <div className="feed-sidebar-more-subtitle">Switch appearance</div>
                                            <div className="feed-sidebar-more-subicon">
                                                <Moon size={18} />
                                            </div>
                                        </div>

                                        <div className="feed-sidebar-more-divider" />

                                        <div className="feed-sidebar-appearance-row">
                                            <div className="feed-sidebar-appearance-copy">Dark mode</div>
                                            <button
                                                type="button"
                                                className={`feed-sidebar-appearance-switch ${appearanceMode === "dark" ? "is-on" : ""}`}
                                                onClick={() => {
                                                    const nextMode = appearanceMode === "dark" ? "light" : "dark";
                                                    setAppearanceMode(setAppearance(nextMode));
                                                }}
                                                aria-pressed={appearanceMode === "dark"}
                                                aria-label="Toggle dark mode"
                                            >
                                                <span className="feed-sidebar-appearance-knob" />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : null}

                        <button
                            type="button"
                            className={`feed-sidebar-item ${showMoreMenu ? "feed-sidebar-item-active" : ""}`}
                            onClick={() => setShowMoreMenu((prev) => !prev)}
                        >
                            <span className="feed-sidebar-icon"><Menu size={26} /></span>
                            <span className="feed-sidebar-label">More</span>
                        </button>
                    </div>
                    <button type="button" className="feed-sidebar-item feed-sidebar-item-muted">
                        <span className="feed-sidebar-icon"><Grid2x2 size={22} /></span>
                        <span className="feed-sidebar-label">Also from Meta</span>
                    </button>
                </div>

                <SwitchAccountModal
                    isOpen={showSwitchAccount}
                    onClose={() => setShowSwitchAccount(false)}
                />
                <ReportProblemModal
                    open={showProblemModal}
                    onClose={() => setShowProblemModal(false)}
                    contextPath={location.pathname}
                />
            </aside>
        );
    }

    return (
        <header className="app-header">
            <div className="app-header-shell">
                <h1 className="header-title" onClick={() => window.location.href = "/feed"}>{siteName}</h1>

                <div className="header-search">
                    <input
                        className="header-search-input"
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => {
                            if (searchQuery.length >= 1 && suggestions.length > 0) setShowDropdown(true);
                        }}
                        onBlur={() => {
                            setTimeout(() => setShowDropdown(false), 200);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && searchQuery.trim().length >= 1) {
                                setShowDropdown(false);
                                onOpenSearch?.(searchQuery.trim());
                            }
                        }}
                    />
                    <button
                        className="header-search-button"
                        onClick={() => {
                            if (searchQuery.trim().length >= 1) {
                                setShowDropdown(false);
                                onOpenSearch?.(searchQuery.trim());
                            }
                        }}
                    >
                        <Search size={16} />
                    </button>

                    {showDropdown && suggestions.length > 0 && (
                        <div className="header-search-dropdown">
                            {suggestions.map((user) => (
                                <div
                                    key={user.user_id || user.id || user.username}
                                    className="header-search-item"
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        setShowDropdown(false);
                                        setSearchQuery("");
                                        navigate(`/profile/${user.username}`);
                                    }}
                                >
                                    <div className="header-search-avatar">
                                        <Avatar
                                            url={user.avatar_url}
                                            alt={user.username}
                                            size={32}
                                        />
                                    </div>
                                    <div className="header-search-copy">
                                        <div className="header-search-username">{user.username}</div>
                                        <div className="header-search-name">{user.display_name}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="header-actions">
                    <button
                        onClick={onOpenCreate}
                        className="header-icon-button header-create-button"
                        title="Create Post"
                    >
                        +
                    </button>

                    <NotificationBell onClick={() => navigate("/notifications")} />

                    <button
                        onClick={() => navigate("/messages")}
                        className="header-icon-button"
                        title="Direct Messages"
                    >
                        <MessageCircle size={24} />
                    </button>

                    {username && (
                        <button
                            onClick={() => window.location.href = `/profile/${username}`}
                            className="header-icon-button"
                            title="My Profile"
                        >
                            <User size={24} />
                        </button>
                    )}

                    <button className="logout-btn" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
}
