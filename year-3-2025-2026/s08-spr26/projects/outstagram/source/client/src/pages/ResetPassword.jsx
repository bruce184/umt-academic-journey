import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useToast } from "../components/ToastProvider";
import AuthLayout from "../layouts/AuthLayout";
import "../styles/Login.css";

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [token, setToken] = useState("");
    const toast = useToast();

    useEffect(() => {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");

        if (accessToken) {
            setToken(accessToken);
        } else {
            setError("Invalid or expired reset link");
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) {
                console.error("Reset password error:", error);
                if (error.message.includes("Auth session missing")) {
                    setError("Session expired or invalid. Please request a new reset link.");
                } else {
                    setError(error.message);
                }
            } else {
                toast.success("Password reset successfully! Redirecting to login.");
                await supabase.auth.signOut();
                navigate("/login");
            }
        } catch (err) {
            console.error(err);
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="auth-card">
                <div className="auth-card-header">
                    <h2 className="login-title">Create new password</h2>
                    <p className="auth-description">
                        Enter your new password below.
                    </p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label" htmlFor="new-password">New password</label>
                        <input
                            id="new-password"
                            type="password"
                            placeholder="New password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="login-input"
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label" htmlFor="confirm-password">Confirm password</label>
                        <input
                            id="confirm-password"
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                            className="login-input"
                        />
                    </div>

                    <button className="login-btn" type="submit" disabled={loading || !token}>
                        {loading ? "Resetting..." : "Reset password"}
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
