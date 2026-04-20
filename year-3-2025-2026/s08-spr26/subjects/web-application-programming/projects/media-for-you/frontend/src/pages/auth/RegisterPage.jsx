import { Navigate, useNavigate } from "react-router-dom";
import RegisterForm from "../../components/auth/RegisterForm";
import { useAuth } from "../../contexts/AuthContext";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <RegisterForm
      onSuccess={() => navigate("/profile", { replace: true })}
      onSwitchLogin={() => navigate("/login")}
    />
  );
}
