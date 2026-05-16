import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import ClientNavigation from "../components/layout/ClientNavigation";
import ThemeToggle from "../components/layout/ThemeToggle";
import { useAuth } from "../context/AuthContext";

const ClientLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const goToSystemPage = () => {
    navigate("/admin/users");
  };

  return (
    <div className="dashboard-shell">
      <div className="app-topbar glass-panel">
        <div className="brand-block">
          <span className="brand-kicker">Player Console</span>
          <h1>Web Board Game</h1>
        </div>

        <ClientNavigation />

        <div className="topbar-actions">
          {["admin", "moderator"].includes(user?.role) && (
            <button
              type="button"
              className="control-btn action-btn topbar-btn"
              onClick={goToSystemPage}
            >
              Switch to System Page
            </button>
          )}
          <div className="user-badge">
            <strong>{user?.displayName || user?.username}</strong>
            <span>
              {user?.favoriteGame
                ? `Likes ${user.favoriteGame}`
                : "Ready to play"}
            </span>
          </div>
          <ThemeToggle />
          <button
            type="button"
            className="control-btn action-btn topbar-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
};

export default ClientLayout;
