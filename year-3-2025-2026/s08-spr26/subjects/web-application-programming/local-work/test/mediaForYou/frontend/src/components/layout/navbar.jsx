import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function navClassName({ isActive }) {
  return isActive ? "nav-btn active" : "nav-btn";
}

export default function Navbar() {
  const navigate = useNavigate();
  const { booting, isAuthenticated, user, logout } = useAuth();
  const isAdmin = user?.email === "admin@example.com";

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <header className="navbar">
      <button className="brand" onClick={() => navigate("/")}>
        Bài tập Cá Nhân 2
      </button>

      <nav className="nav-right">
        <NavLink to="/" className={navClassName}>
          Home
        </NavLink>

        {booting ? (
          <span className="nav-status">Checking session...</span>
        ) : null}

        {!booting && !isAuthenticated ? (
          <>
            <NavLink to="/login" className={navClassName}>
              Login
            </NavLink>
            <NavLink to="/register" className={navClassName}>
              Register
            </NavLink>
          </>
        ) : null}

        {!booting && isAuthenticated ? (
          <>
            <NavLink to="/profile" className={navClassName}>
              {user?.name || "Profile"}
            </NavLink>
            <NavLink to="/tasks" className={navClassName}>
              Tasks
            </NavLink>
            {isAdmin ? (
              <>
                <NavLink to="/admin-p" className={navClassName}>
                  Admin Poll
                </NavLink>
                <NavLink to="/admin-lp" className={navClassName}>
                  Admin Long Poll
                </NavLink>
                <NavLink to="/admin-sse" className={navClassName}>
                  Admin SSE
                </NavLink>
              </>
            ) : null}
            <button className="nav-btn danger" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : null}
      </nav>
    </header>
  );
}
