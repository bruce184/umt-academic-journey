import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.email === "admin@example.com";

  return (
    <div className="stack-lg">
      <section className="hero card">
        <h1>Media For You</h1>

        <div className="hero-actions">
          {!isAuthenticated ? (
            <>
              <Link className="primary-btn" to="/login">
                Login
              </Link>
              <Link className="secondary-btn" to="/register">
                Register
              </Link>
            </>
          ) : (
            <>
              <Link className="primary-btn" to="/profile">
                Open profile
              </Link>
              <Link className="secondary-btn" to="/tasks">
                Open tasks
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="info-grid">

        <article className="card mini-card">
          <p className="eyebrow">Demo User</p>
          <h3>bruce@example.com</h3>
          <p className="muted">Password: Abc12345</p>
        </article>
      </section>

      {isAdmin ? (
        <section className="card">
          <p className="eyebrow">Admin Shortcuts</p>
          <div className="hero-actions">
            <Link className="secondary-btn" to="/admin-p">
              Polling
            </Link>
            <Link className="secondary-btn" to="/admin-lp">
              Long Polling
            </Link>
            <Link className="secondary-btn" to="/admin-sse">
              SSE
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}
