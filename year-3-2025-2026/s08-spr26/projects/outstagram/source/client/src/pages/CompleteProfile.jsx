import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, LockKeyhole, Sparkles, UserRound } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useSiteName } from "../lib/publicConfig";
import AuthLayout from "../layouts/AuthLayout";
import Avatar from "../components/Avatar";
import "../styles/Login.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function normalizeUsername(value) {
    return String(value || "").trim().toLowerCase();
}

function isValidUsername(value) {
    return /^[a-zA-Z0-9_.]{3,30}$/.test(value);
}

export default function CompleteProfile() {
    const siteName = useSiteName();
    const [email, setEmail] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [usernameStatus, setUsernameStatus] = useState("idle");

    useEffect(() => {
        document.title = `Complete profile | ${siteName}`;
    }, [siteName]);

    useEffect(() => {
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                window.location.href = "/login";
                return;
            }

            const suggestedDisplayName =
                user.user_metadata?.display_name ||
                user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                "";

            const suggestedUsername = user.user_metadata?.username || "";

            setEmail(user.email || "");
            setDisplayName(suggestedDisplayName);
            setUsername(normalizeUsername(suggestedUsername));
            setAvatarUrl(user.user_metadata?.avatar_url || user.user_metadata?.picture || null);
        })();
    }, []);

    const usernameHint = useMemo(() => {
        if (usernameStatus === "checking") return "Checking username availability...";
        if (usernameStatus === "available") return "Username is available.";
        if (usernameStatus === "taken") return "Username is already taken.";
        if (usernameStatus === "invalid") return "Use 3-30 letters, numbers, dots, or underscores.";
        return "Choose the handle people will use to find you.";
    }, [usernameStatus]);

    const checkUsername = async (currentUsername) => {
        const nextUsername = normalizeUsername(currentUsername);

        if (!isValidUsername(nextUsername)) {
            setUsernameStatus(nextUsername ? "invalid" : "idle");
            return false;
        }

        setUsernameStatus("checking");

        try {
            const res = await fetch(`${API_BASE}/api/usernames/${nextUsername}/available`);
            const data = await res.json();
            const available = Boolean(data.data?.available);
            setUsernameStatus(available ? "available" : "taken");
            return available;
        } catch (err) {
            console.error("Check username error", err);
            setUsernameStatus("idle");
            return true;
        }
    };

    const onSubmit = async (event) => {
        event.preventDefault();
        setError("");

        const normalizedUsername = normalizeUsername(username);
        const trimmedDisplayName = String(displayName || "").trim();

        if (!trimmedDisplayName) {
            setError("Display name is required.");
            return;
        }

        if (!isValidUsername(normalizedUsername)) {
            setUsernameStatus(normalizedUsername ? "invalid" : "idle");
            setError("Username must be 3-30 characters and only contain letters, numbers, dots, or underscores.");
            return;
        }

        if (password && password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);

        try {
            const usernameAvailable =
                usernameStatus === "available" || await checkUsername(normalizedUsername);

            if (!usernameAvailable) {
                setError("Please choose another username.");
                return;
            }

            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            if (!token) {
                window.location.href = "/login";
                return;
            }

            if (password) {
                const { error: passwordError } = await supabase.auth.updateUser({ password });
                if (passwordError) throw passwordError;
            }

            const response = await fetch(`${API_BASE}/api/v1/profiles/complete`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    username: normalizedUsername,
                    display_name: trimmedDisplayName,
                    avatar_url: avatarUrl || undefined,
                }),
            });

            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(payload?.error?.message || payload?.message || "Failed to update profile");
            }

            window.location.href = "/feed";
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="auth-card complete-profile-card">
                <div className="auth-card-header">
                    <div className="login-brand">{siteName}</div>
                    <h2 className="login-title">Complete your profile</h2>
                    <p className="login-subtitle">
                        Choose your username and optionally add a password for future email sign-ins.
                    </p>
                </div>

                <div className="complete-profile-summary">
                    <Avatar
                        url={avatarUrl}
                        alt={displayName || email || "Profile avatar"}
                        size={68}
                    />
                    <div className="complete-profile-summary-copy">
                        <strong>{displayName || "New account"}</strong>
                        <span>{email || "Connected account"}</span>
                    </div>
                    <div className="complete-profile-badge">
                        <Sparkles size={14} />
                        Finish setup
                    </div>
                </div>

                {error ? <div className="login-error">{error}</div> : null}

                <form className="login-form" onSubmit={onSubmit}>
                    <div className="input-group">
                        <label className="input-label" htmlFor="complete-display-name">Display name</label>
                        <div className="complete-profile-input-shell">
                            <UserRound size={18} />
                            <input
                                id="complete-display-name"
                                className="login-input complete-profile-input"
                                value={displayName}
                                onChange={(event) => setDisplayName(event.target.value)}
                                placeholder="Your name"
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label" htmlFor="complete-username">Username</label>
                        <div className="complete-profile-input-shell">
                            <span className="complete-profile-at">@</span>
                            <input
                                id="complete-username"
                                className="login-input complete-profile-input"
                                value={username}
                                onChange={(event) => {
                                    setUsername(normalizeUsername(event.target.value));
                                    setUsernameStatus("idle");
                                }}
                                onBlur={() => {
                                    if (username) checkUsername(username);
                                }}
                                placeholder="username"
                                autoComplete="username"
                                required
                            />
                            <span className={`complete-profile-status complete-profile-status--${usernameStatus}`}>
                                {usernameStatus === "checking" ? <Loader2 size={14} className="animate-spin" /> : null}
                                {usernameStatus === "available" ? <CheckCircle2 size={14} /> : null}
                                {usernameStatus === "taken" ? "Taken" : null}
                                {usernameStatus === "invalid" ? "Invalid" : null}
                                {usernameStatus === "available" ? "Available" : null}
                            </span>
                        </div>
                        <p className={`complete-profile-hint complete-profile-hint--${usernameStatus}`}>{usernameHint}</p>
                    </div>

                    <div className="input-group">
                        <label className="input-label" htmlFor="complete-password">Password</label>
                        <div className="complete-profile-input-shell">
                            <LockKeyhole size={18} />
                            <input
                                id="complete-password"
                                className="login-input complete-profile-input"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="Leave blank to keep Google-only sign in"
                                type="password"
                                autoComplete="new-password"
                            />
                        </div>
                        <p className="complete-profile-hint">
                            Optional. Add a password if you want to log in later with email and password too.
                        </p>
                    </div>

                    <p className="auth-description">
                        Your username appears across profile, feed, search, and messages. You can update your public details later from Edit profile.
                    </p>

                    <button
                        className="login-btn"
                        type="submit"
                        disabled={loading || usernameStatus === "checking" || usernameStatus === "taken" || usernameStatus === "invalid"}
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                        {loading ? "Saving profile..." : "Complete profile"}
                    </button>
                </form>
            </div>
        </AuthLayout>
    );
}
