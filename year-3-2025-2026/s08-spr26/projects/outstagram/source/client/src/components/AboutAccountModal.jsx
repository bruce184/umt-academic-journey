import { useEffect, useState } from "react";
import { CalendarDays, Lock, UserRound, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import { readApiData, readApiErrorMessage } from "../lib/api";
import Avatar from "./Avatar";
import "../styles/AboutAccountModal.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default function AboutAccountModal({ isOpen, username, onClose }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isOpen || !username) return undefined;

        let cancelled = false;

        const handleKeyDown = (event) => {
            if (event.key === "Escape") onClose?.();
        };

        const loadProfile = async () => {
            setLoading(true);
            setError("");

            try {
                const { data: { session } } = await supabase.auth.getSession();
                const response = await fetch(`${API_BASE_URL}/api/v1/profiles/${username}`, {
                    headers: session?.access_token
                        ? { Authorization: `Bearer ${session.access_token}` }
                        : {},
                });

                const payload = await response.json().catch(() => ({}));
                if (!response.ok) {
                    throw new Error(readApiErrorMessage(payload, "Unable to load account info"));
                }

                if (!cancelled) {
                    setProfile(readApiData(payload));
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || "Unable to load account info");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        loadProfile();

        return () => {
            cancelled = true;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, username, onClose]);

    if (!isOpen) return null;

    return (
        <div className="about-account-overlay" onClick={onClose}>
            <div className="about-account-modal" onClick={(event) => event.stopPropagation()}>
                <div className="about-account-header">
                    <h3>About this account</h3>
                    <button
                        type="button"
                        className="about-account-close"
                        onClick={onClose}
                        aria-label="Close account info"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="about-account-body">
                    {loading ? (
                        <div className="about-account-state">Loading account info...</div>
                    ) : error ? (
                        <div className="about-account-state about-account-state--error">{error}</div>
                    ) : profile ? (
                        <>
                            <div className="about-account-hero">
                                <Avatar
                                    url={profile.avatar_url}
                                    alt={profile.username}
                                    size={72}
                                    className="about-account-avatar"
                                />
                                <div className="about-account-meta">
                                    <div className="about-account-username">@{profile.username}</div>
                                    <div className="about-account-name">{profile.display_name || "Outstagram user"}</div>
                                    {profile.bio ? (
                                        <p className="about-account-bio">{profile.bio}</p>
                                    ) : (
                                        <p className="about-account-bio about-account-bio--muted">No bio yet.</p>
                                    )}
                                </div>
                            </div>

                            <div className="about-account-stats">
                                <div>
                                    <strong>{profile.post_count ?? 0}</strong>
                                    <span>posts</span>
                                </div>
                                <div>
                                    <strong>{profile.follower_count ?? 0}</strong>
                                    <span>followers</span>
                                </div>
                                <div>
                                    <strong>{profile.following_count ?? 0}</strong>
                                    <span>following</span>
                                </div>
                            </div>

                            <div className="about-account-facts">
                                <div className="about-account-fact">
                                    <Lock size={16} />
                                    <span>{profile.is_private ? "Private account" : "Public account"}</span>
                                </div>
                                <div className="about-account-fact">
                                    <UserRound size={16} />
                                    <span>
                                        {profile.is_own_profile
                                            ? "This is your account"
                                            : profile.is_following
                                                ? "You follow this account"
                                                : "You do not follow this account"}
                                    </span>
                                </div>
                                <div className="about-account-fact">
                                    <CalendarDays size={16} />
                                    <span>Profile information is shown from the public account card.</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="about-account-state">Account info is unavailable.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
