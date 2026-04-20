import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function LoadingCard({ message }) {
  return (
    <section className="card">
      <p className="muted">{message}</p>
    </section>
  );
}

export function ProtectedPage({ children }) {
  const location = useLocation();
  const { booting, isAuthenticated } = useAuth();

  if (booting) {
    return <LoadingCard message="Checking login state..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export function AdminPage({ children }) {
  const location = useLocation();
  const { booting, isAuthenticated, user } = useAuth();

  if (booting) {
    return <LoadingCard message="Preparing admin dashboard..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user?.email !== "admin@example.com") {
    return <Navigate to="/profile" replace />;
  }

  return children;
}
