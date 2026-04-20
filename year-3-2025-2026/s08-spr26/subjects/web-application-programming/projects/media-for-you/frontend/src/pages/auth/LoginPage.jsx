import { Navigate, useLocation, useNavigate } from "react-router-dom";
import LoginForm from "../../components/auth/LoginForm";
import { useAuth } from "../../contexts/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  const nextPath = location.state?.from?.pathname || "/profile";

  return (
    <LoginForm
      onSuccess={() => navigate(nextPath, { replace: true })}
      onSwitchRegister={() => navigate("/register")}
    />
  );
}
