import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { UserPlus } from "lucide-react";
import { useToast } from "./ToastProvider";
import { usePublicConfig } from "../lib/publicConfig";
import "../styles/Login.css";

export default function RegisterForm() {
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // idle | checking | available | taken | invalid
    const [usernameStatus, setUsernameStatus] = useState("idle");
    const toast = useToast();
    const publicConfig = usePublicConfig();
    const registrationEnabled = publicConfig.registration_enabled;
    const siteName = publicConfig.site_name || "Outstagram";

    useEffect(() => {
        document.title = `Create account | ${siteName}`;
    }, [siteName]);

    const checkUsername = async (currentUsername) => {
        const u = currentUsername.trim().toLowerCase();
        if (u.length < 3 || u.length > 30 || !/^[a-zA-Z0-9_.]+$/.test(u)) {
            setUsernameStatus("invalid");
            return;
        }

        setUsernameStatus("checking");
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/usernames/${u}/available`);
            const data = await res.json();

            if (data.data?.available) {
                setUsernameStatus("available");
            } else {
                setUsernameStatus("taken");
            }
        } catch (err) {
            console.error("Check username error", err);
            setUsernameStatus("idle");
        }
    };

    const onUsernameBlur = () => {
        if (username) checkUsername(username);
    };

    const onRegister = async (e) => {
        e.preventDefault();
        setError("");

        if (!registrationEnabled) {
            setError("Registration is currently disabled by the administrator.");
            return;
        }

        if (usernameStatus === "taken") {
            setError("Username is already taken");
            return;
        }

        if (usernameStatus === "invalid") {
            setError("Invalid username");
            return;
        }

        setLoading(true);

        const u = username.trim().toLowerCase();

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            setLoading(false);
            return;
        }

        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        display_name: fullName.trim(),
                        username: u,
                    },
                },
            });

            if (signUpError) {
                setError(signUpError.message);
            } else {
                if (data?.session) {
                    window.location.href = "/feed";
                } else {
                    toast.success("Registration successful! Please check your email to confirm your account.");
                    window.location.href = "/login";
                }
            }
        } catch (err) {
            setError("An unexpected error occurred");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const onGoogleSignUp = async () => {
        setError("");
        if (!registrationEnabled) {
            setError("Registration is currently disabled by the administrator.");
            return;
        }

        const { error: oauthError } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (oauthError) {
            setError(oauthError.message);
        }
    };

    return (
        <div className="auth-card">
            <div className="auth-card-header">
                <div className="login-brand">{siteName}</div>
                <h2 className="login-title">Create your account</h2>
                <p className="login-subtitle">Join {siteName} to share everyday moments.</p>
            </div>

            {error && <div className="login-error">{error}</div>}

            <form className="login-form" onSubmit={onRegister}>
                <div className="input-group">
                    <label className="input-label" htmlFor="reg-email">Email</label>
                    <input
                        id="reg-email"
                        className="login-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        type="email"
                        required
                    />
                </div>

                <div className="input-group">
                    <label className="input-label" htmlFor="reg-fullname">Full name</label>
                    <input
                        id="reg-fullname"
                        className="login-input"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your name"
                        required
                    />
                </div>

                <div className="input-group">
                    <label className="input-label" htmlFor="reg-username">Username</label>
                    <input
                        id="reg-username"
                        className="login-input"
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value);
                            setUsernameStatus("idle");
                        }}
                        onBlur={onUsernameBlur}
                        placeholder="username"
                        required
                    />
                    {usernameStatus === "taken" && <p className="username-error-text" style={{ margin: 0 }}>Username taken</p>}
                </div>

                <div className="input-group">
                    <label className="input-label" htmlFor="reg-password">Password</label>
                    <input
                        id="reg-password"
                        className="login-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a password"
                        type="password"
                        required
                    />
                </div>

                <p className="auth-description">
                    By signing up, you agree to our Terms, Privacy Policy and Cookies Policy.
                </p>

                <button
                    className="login-btn"
                    type="submit"
                    disabled={!registrationEnabled || loading || usernameStatus === "taken" || usernameStatus === "checking"}
                >
                    <UserPlus size={20} /> {loading ? "Signing up..." : "Create Account"}
                </button>
            </form>

            <div className="separator">
                <div className="line"></div>
                <div className="or-text">OR</div>
                <div className="line"></div>
            </div>

            <button type="button" className="ghost-btn" onClick={onGoogleSignUp} disabled={!registrationEnabled}>
                Sign up with Google
            </button>

            {!registrationEnabled ? (
                <div className="login-error" style={{ marginTop: 16 }}>
                    Registration is disabled at the moment.
                </div>
            ) : null}

            <div className="signup-box">
                <p className="signup-text">
                    Have an account? <Link to="/login" className="signup-link">Log in</Link>
                </p>
            </div>
        </div>
    );
}
