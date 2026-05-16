import { Link, useNavigate } from "react-router-dom";
import ProfileCard from "../../components/auth/ProfileCard";
import { useAuth } from "../../contexts/AuthContext";
import { ProtectedPage } from "./ProtectedPage";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <ProtectedPage>
      <div className="stack-lg">
        <ProfileCard />

        <section className="card action-panel">
          <p className="eyebrow">Next Step</p>
          <h2>Continue exploring the app</h2>
          <p className="muted">
            {user?.email === "admin@example.com"
              ? "You can open any of the admin realtime pages from here."
              : "Open your task list, or log out to test the auth flow again."}
          </p>

          <div className="hero-actions">
            <Link className="secondary-btn" to="/tasks">
              Go to tasks
            </Link>
            {user?.email === "admin@example.com" ? (
              <Link className="secondary-btn" to="/admin-p">
                Open admin
              </Link>
            ) : null}
            <button className="nav-btn danger" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </section>
      </div>
    </ProtectedPage>
  );
}
