import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { uploadPostMedia } from "../lib/storage";
import { ArrowLeft, Loader2 } from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import Avatar from "../components/Avatar";
import AvatarEditorModal from "../components/AvatarEditorModal";
import FeedMessagesWidget from "../components/FeedMessagesWidget";
import "../styles/EditProfile.css";

export default function EditProfile() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [displayName, setDisplayName] = useState("");
    const [bio, setBio] = useState("");
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("");
    const [avatarEditorOpen, setAvatarEditorOpen] = useState(false);
    const [avatarDraftUrl, setAvatarDraftUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            if (!token) {
                navigate("/login");
                return;
            }

            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const data = await res.json();
                setProfile(data.data.profile);
                setDisplayName(data.data.profile.display_name || "");
                setBio(data.data.profile.bio || "");
                setAvatarPreview(data.data.profile.avatar_url || "");
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleAvatarChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const draftUrl = URL.createObjectURL(file);
            setAvatarDraftUrl(draftUrl);
            setAvatarEditorOpen(true);
        }
    };

    const handleApplyAvatar = async (blob) => {
        const croppedFile = new File([blob], `avatar-${Date.now()}.jpg`, { type: "image/jpeg" });
        setAvatarFile(croppedFile);
        setAvatarPreview(URL.createObjectURL(croppedFile));
        setAvatarEditorOpen(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            let avatarUrl = profile.avatar_url;
            let avatarPath = profile.avatar_path;

            if (avatarFile) {
                const { publicUrl, path } = await uploadPostMedia(avatarFile);
                avatarUrl = publicUrl;
                avatarPath = path;

                await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/profiles/me/avatar`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ avatar_url: avatarUrl, avatar_path: avatarPath }),
                });
            }

            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/profiles/me`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ display_name: displayName, bio }),
            });

            if (res.ok) {
                navigate(`/profile/${profile.username}`);
            } else {
                const data = await res.json();
                setError(data.error || "Failed to update profile");
            }
        } catch (e) {
            console.error(e);
            setError("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (!profile) {
        return (
            <MainLayout variant="feed">
                <div className="edit-profile-loading">
                    <Loader2 className="animate-spin" />
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout variant="feed">
            <div className="edit-profile-page">
                <div className="edit-profile-shell">
                    <div className="edit-profile-topbar">
                        <button
                            onClick={() => navigate(-1)}
                            className="edit-profile-back-btn"
                            type="button"
                        >
                            <ArrowLeft size={18} />
                            <span>Back</span>
                        </button>

                        <div className="edit-profile-topbar-copy">
                            <h1>Edit profile</h1>
                            <p>Update your public details and keep your account presentation consistent across feed, profile, messages, and explore.</p>
                        </div>
                    </div>

                    <div className="edit-profile-panel">
                        <aside className="edit-profile-summary">
                            <div className="edit-profile-summary-card">
                                <div className="edit-avatar-preview-wrapper">
                                    <Avatar
                                        url={avatarPreview}
                                        alt="Avatar"
                                        size={96}
                                        className="edit-avatar-img"
                                    />
                                </div>

                                <div className="edit-profile-summary-copy">
                                    <div className="edit-username">@{profile.username}</div>
                                    <div className="edit-profile-display-name">{displayName || "No display name yet"}</div>
                                    <div className="edit-profile-summary-bio">
                                        {bio || "A short bio helps people understand who you are."}
                                    </div>
                                </div>

                                <label htmlFor="avatar-upload" className="change-avatar-btn">
                                    Change profile photo
                                </label>
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden-input"
                                />
                            </div>
                        </aside>

                        <div className="edit-profile-form-card">
                            <form onSubmit={handleSubmit} className="edit-profile-form-wrapper">
                                <div className="edit-profile-section-head">
                                    <h2>Public profile</h2>
                                    <span>These details are visible anywhere someone sees your account.</span>
                                </div>

                                <div className="edit-profile-field">
                                    <label htmlFor="displayName">Display name</label>
                                    <div className="edit-profile-input-wrap">
                                        <input
                                            id="displayName"
                                            type="text"
                                            value={displayName}
                                            onChange={(event) => setDisplayName(event.target.value)}
                                            placeholder="Display name"
                                        />
                                        <small>Use the name people should recognize in the app.</small>
                                    </div>
                                </div>

                                <div className="edit-profile-field">
                                    <label htmlFor="bio">Bio</label>
                                    <div className="edit-profile-input-wrap">
                                        <textarea
                                            id="bio"
                                            value={bio}
                                            onChange={(event) => setBio(event.target.value)}
                                            placeholder="Write a short bio"
                                            maxLength={500}
                                            rows={5}
                                        />
                                        <div className="edit-profile-counter">{bio.length}/500</div>
                                    </div>
                                </div>

                                {error ? <div className="edit-profile-error">{error}</div> : null}

                                <div className="edit-profile-actions">
                                    <button type="submit" disabled={loading} className="save-btn">
                                        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                                        <span>{loading ? "Saving..." : "Save changes"}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/profile/${profile.username}`)}
                                        className="cancel-btn"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <FeedMessagesWidget />

            <AvatarEditorModal
                isOpen={avatarEditorOpen}
                imageUrl={avatarDraftUrl}
                onCancel={() => {
                    setAvatarEditorOpen(false);
                    setAvatarDraftUrl("");
                }}
                onApply={handleApplyAvatar}
            />
        </MainLayout>
    );
}
