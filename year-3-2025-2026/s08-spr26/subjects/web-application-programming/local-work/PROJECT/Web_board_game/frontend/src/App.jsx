import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyResetPage from "./pages/VerifyResetPage";
import VerifyRegisterPage from "./pages/VerifyRegisterPage";
import PublicLayout from "./layouts/PublicLayout";
import ClientLayout from "./layouts/ClientLayout";
import AdminLayout from "./layouts/AdminLayout";
import HubPage from "./pages/client/HubPage";
import GamePage from "./pages/client/GamePage";
import ProfilePage from "./pages/client/ProfilePage";
import UsersPage from "./pages/client/UsersPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminGamesPage from "./pages/admin/AdminGamesPage";
import AdminStatsPage from "./pages/admin/AdminStatsPage";
import ApiDocsPage from "./pages/admin/ApiDocsPage";
import FriendsPage from "./pages/client/FriendsPage";
import MessagesPage from "./pages/client/MessagesPage";
import AchievementsPage from "./pages/client/AchievementsPage";
import RankingsPage from "./pages/client/RankingsPage";

const LoadingScreen = () => (
  <div className="auth-container">
    <div className="auth-card" style={{ textAlign: "center" }}>
      <h2>Loading</h2>
      <p>Restoring your session...</p>
    </div>
  </div>
);

const getRedirectPathForRole = (role) => {
  if (role === "admin") return "/admin";
  if (role === "moderator") return "/admin/users";
  return "/hub";
};

const ProtectedRoute = ({ role }) => {
  const { token, user, loading } = useAuth();
  const allowedRoles = Array.isArray(role) ? role : role ? [role] : [];

  if (loading) return <LoadingScreen />;
  if (!token) return <Navigate to="/login" replace />;

  if (allowedRoles.length && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={getRedirectPathForRole(user.role)} replace />;
  }

  return <Outlet />;
};

const HomeRedirect = () => {
  const { token, user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!token) return <Navigate to="/login" replace />;

  return <Navigate to={getRedirectPathForRole(user?.role)} replace />;
};

const App = () => (
  <AuthProvider>
    <Router>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-reset/:token" element={<VerifyResetPage />} />
          <Route
            path="/verify-register/:token"
            element={<VerifyRegisterPage />}
          />
        </Route>

        <Route
          element={<ProtectedRoute role={["user", "admin", "moderator"]} />}
        >
          <Route element={<ClientLayout />}>
            <Route path="/hub" element={<HubPage />} />
            <Route path="/games/:id" element={<GamePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/rankings" element={<RankingsPage />} />
            <Route path="/user" element={<Navigate to="/hub" replace />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute role={["admin", "moderator"]} />}>
          <Route element={<AdminLayout />}>
            <Route element={<ProtectedRoute role="admin" />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
            </Route>
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route element={<ProtectedRoute role="admin" />}>
              <Route path="/admin/games" element={<AdminGamesPage />} />
              <Route path="/admin/stats" element={<AdminStatsPage />} />
              <Route path="/admin/api-docs" element={<ApiDocsPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;
