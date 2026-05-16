import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../styles/SwitchAccountModal.css";

export default function SwitchAccountModal({ isOpen, onClose }) {
    const navigate = useNavigate();
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [saveLoginInfo, setSaveLoginInfo] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isOpen) return;

        const originalOverflow = document.body.style.overflow;
        const rememberedIdentifier = localStorage.getItem("outstagram:last-switch-identifier");
        document.body.style.overflow = "hidden";
        setIdentifier(rememberedIdentifier || "");
        setPassword("");
        setSaveLoginInfo(Boolean(rememberedIdentifier));
        setError("");

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleEscape);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (loading) return;

        setLoading(true);
        setError("");

        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: identifier.trim(),
                password,
            });

            if (signInError) {
                setError(signInError.message);
                return;
            }

            if (saveLoginInfo) {
                localStorage.setItem("outstagram:last-switch-identifier", identifier.trim());
            } else {
                localStorage.removeItem("outstagram:last-switch-identifier");
            }

            onClose();
            window.location.href = "/feed";
        } catch (submitError) {
            console.error(submitError);
            setError("Unable to switch accounts right now.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="switch-account-overlay" onClick={onClose}>
            <div className="switch-account-modal" onClick={(event) => event.stopPropagation()}>
                <button type="button" className="switch-account-close" onClick={onClose} aria-label="Close switch account modal">
                    ×
                </button>

                <div className="switch-account-brand">Instagram</div>

                {error ? <div className="switch-account-error">{error}</div> : null}

                <form className="switch-account-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        className="switch-account-input"
                        placeholder="Email"
                        value={identifier}
                        onChange={(event) => setIdentifier(event.target.value)}
                        autoFocus
                        required
                    />
                    <input
                        type="password"
                        className="switch-account-input"
                        placeholder="Password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                    />

                    <label className="switch-account-checkbox">
                        <input
                            type="checkbox"
                            checked={saveLoginInfo}
                            onChange={(event) => setSaveLoginInfo(event.target.checked)}
                        />
                        <span>Save login info</span>
                    </label>

                    <button type="submit" className="switch-account-submit" disabled={loading || !identifier.trim() || !password.trim()}>
                        {loading ? "Logging in..." : "Log in"}
                    </button>
                </form>

                <button
                    type="button"
                    className="switch-account-forgot"
                    onClick={() => {
                        onClose();
                        navigate("/forgot-password");
                    }}
                >
                    Forgot password?
                </button>
            </div>
        </div>
    );
}
