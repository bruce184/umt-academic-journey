import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import CreatePostModal from "../components/CreatePostModal";
import NotificationsDrawer from "../components/NotificationsDrawer";
import SearchDrawer from "../components/SearchDrawer";
import "../styles/Layout.css";

export default function MainLayout({
    children,
    variant = "default",
    rightSidebar = null,
    shellClassName = "",
    mainClassName = "",
}) {
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isNotificationsOpen, setNotificationsOpen] = useState(false);
    const [searchInitialQuery, setSearchInitialQuery] = useState("");
    const location = useLocation();

    useEffect(() => {
        setSearchOpen(false);
        setNotificationsOpen(false);
    }, [location.pathname]);

    return (
        <div className={`main-layout ${variant === "feed" ? "feed-layout" : ""}`}>
            <AppHeader
                variant={variant}
                onOpenCreate={() => setCreateModalOpen(true)}
                onOpenSearch={(query = "") => {
                    setNotificationsOpen(false);
                    setSearchInitialQuery(query);
                    setSearchOpen((prev) => !prev);
                }}
                onOpenNotifications={() => {
                    setSearchOpen(false);
                    setNotificationsOpen((prev) => !prev);
                }}
                isSearchOpen={isSearchOpen}
                isNotificationsOpen={isNotificationsOpen}
            />

            <SearchDrawer
                open={isSearchOpen}
                onClose={() => setSearchOpen(false)}
                initialQuery={searchInitialQuery}
                variant={variant}
            />
            {variant === "feed" ? (
                <NotificationsDrawer open={isNotificationsOpen} onClose={() => setNotificationsOpen(false)} />
            ) : null}

            {variant === "feed" ? (
                <div className={`feed-layout-shell ${rightSidebar ? "" : "feed-layout-shell--single"} ${shellClassName}`.trim()}>
                    <main className={`feed-layout-main ${mainClassName}`.trim()}>
                        {children}
                    </main>
                    {rightSidebar ? (
                        <aside className="feed-layout-right">
                            {rightSidebar}
                        </aside>
                    ) : null}
                </div>
            ) : (
                <div className="main-content">
                    {children}
                </div>
            )}

            <CreatePostModal
                isOpen={isCreateModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onPostCreated={() => {
                    setCreateModalOpen(false);
                    // Force refresh? window.location.reload() is crude but effective for MVP
                    if (window.location.pathname === "/feed") {
                        window.location.reload();
                    } else {
                        window.location.href = "/feed";
                    }
                }}
            />
        </div>
    );
}
