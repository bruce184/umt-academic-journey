import AuthLayout from "../layouts/AuthLayout";
import LoginForm from "../components/LoginForm";
import "../styles/Login.css";

export default function Login() {
    return (
        <AuthLayout>
            <LoginForm />
        </AuthLayout>
    );
}
