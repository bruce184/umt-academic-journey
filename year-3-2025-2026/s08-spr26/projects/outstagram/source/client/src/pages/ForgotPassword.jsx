import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import "../styles/Login.css";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
            } else {
                setError(data.error || "Failed to send reset email");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <AuthLayout>
                <div className="auth-card">
                    <div className="auth-card-header">
                        <h2 className="login-title">Email sent</h2>
                        <p className="auth-description">
                            If an account exists with this email, a password reset link has been sent.
                        </p>
                    </div>
                    <Link to="/login" className="login-btn auth-link-btn">
                        Back to Login
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <div className="auth-card">
                <div className="auth-card-header">
                    <h2 className="login-title">Reset password</h2>
                    <p className="auth-description">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label" htmlFor="reset-email">Email address</label>
                        <input
                            id="reset-email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="login-input"
                        />
                    </div>

                    <button className="login-btn" type="submit" disabled={loading}>
                        {loading ? "Sending..." : "Send reset link"}
                    </button>

                    {error && <p className="login-error">{error}</p>}
                </form>

                <div className="signup-box">
                    <Link to="/login" className="signup-link">Back to Login</Link>
                </div>
            </div>
        </AuthLayout>
    );
}
