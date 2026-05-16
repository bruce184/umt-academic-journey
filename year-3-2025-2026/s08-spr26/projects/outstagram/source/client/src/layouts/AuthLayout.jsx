import React from "react";
import "../styles/Layout.css";
import "../styles/Login.css";

export default function AuthLayout({ children }) {
    return (
        <div className="auth-shell">
            <div className="auth-hero">
                <div className="auth-hero-logo">●</div>
                <h1 className="auth-hero-title">
                    See everyday moments from your <span>close friends.</span>
                </h1>
                <div className="auth-hero-cards">
                    <div className="auth-hero-card auth-hero-card--one" />
                    <div className="auth-hero-card auth-hero-card--two" />
                    <div className="auth-hero-card auth-hero-card--three" />
                </div>
            </div>

            <div className="auth-panel">
                {children}
            </div>
        </div>
    );
}
