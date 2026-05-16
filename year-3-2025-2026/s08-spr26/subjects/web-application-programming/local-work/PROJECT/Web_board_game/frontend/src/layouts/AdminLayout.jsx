import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AdminNavigation from "../components/layout/AdminNavigation";
import ThemeToggle from "../components/layout/ThemeToggle";
import { useAuth } from "../context/AuthContext";

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="dashboard-shell">
      <div className="admin-layout-shell">
        <aside className="admin-sidebar glass-panel">
          <div className="brand-block admin-sidebar-brand">
            <span className="brand-kicker">Admin Console</span>
            <h1>Operations Deck</h1>
            <p className="muted-copy">
              Control the platform from one focused workspace.
            </p>
          </div>

          <AdminNavigation />

          <div className="admin-sidebar-footer">
            <div className="user-badge admin-sidebar-user">
              <strong>{user?.displayName || user?.username}</strong>
              <p className="muted-copy">{user?.email || "Administrator session"}</p>
            </div>

            <div className="admin-sidebar-actions">
              {["admin", "moderator"].includes(user?.role) && (
                <button
                  type="button"
                  className="control-btn action-btn admin-switch-btn"
                  onClick={() => navigate("/hub")}
                >
                  Switch to Main Page
                </button>
              )}
              <div className="admin-footer-subgroup">
                <ThemeToggle />
                <button
                  type="button"
                  className="control-btn action-btn admin-logout-btn"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </aside>

        <main className="app-content admin-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
