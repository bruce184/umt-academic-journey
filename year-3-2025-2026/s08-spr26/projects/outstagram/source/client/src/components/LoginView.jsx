import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useSiteName } from "../lib/publicConfig";
import "../styles/Login.css";

export default function LoginView({
    email,
    setEmail,
    password,
    setPassword,
    onLogin,
    onGoogleLogin,
    err
}) {
    const siteName = useSiteName();

    useEffect(() => {
        document.title = `Log in | ${siteName}`;
    }, [siteName]);

    return (
        <div className="auth-card">
            <div className="auth-card-header">
                <div className="login-brand">{siteName}</div>
                <h2 className="login-title">Log into {siteName}</h2>
                <p className="login-subtitle">Pick up where you left off with your friends.</p>
            </div>

            {err && <div className="login-error">{err}</div>}

            <form className="login-form" onSubmit={onLogin}>
                <div className="input-group">
                    <label className="input-label" htmlFor="login-identifier">Mobile number, username or email</label>
                    <input
                        id="login-identifier"
                        className="login-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                    />
                </div>

                <div className="input-group">
                    <label className="input-label" htmlFor="login-password">Password</label>
                    <input
                        id="login-password"
                        className="login-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        type="password"
                        required
                    />
                </div>

                <button className="login-btn" type="submit">
                    <LogIn size={20} /> Log in
                </button>
            </form>

            <div className="auth-links">
                <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
                <Link to="/register" className="signup-link">Create new account</Link>
            </div>

            <div className="separator">
                <div className="line"></div>
                <div className="or-text">OR</div>
                <div className="line"></div>
            </div>

            <button type="button" className="ghost-btn" onClick={onGoogleLogin}>
                Log in with Google
            </button>

            <div className="signup-box">
                <p className="signup-text">
                    New here? <Link to="/register" className="signup-link">Sign up</Link>
                </p>
            </div>
        </div>
    );
}
