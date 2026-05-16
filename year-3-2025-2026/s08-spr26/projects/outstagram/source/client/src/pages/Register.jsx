import AuthLayout from "../layouts/AuthLayout";
import RegisterForm from "../components/RegisterForm";
import "../styles/Login.css";

export default function Register() {
    return (
        <AuthLayout>
            <RegisterForm />
        </AuthLayout>
    );
}
