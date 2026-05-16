import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getProfile } from '../../services/profileService';

const createFormState = (user) => ({
    username: user?.username || '',
    displayName: user?.displayName || '',
    profilePicture: user?.profilePicture || '',
    location: user?.location || '',
    favoriteGame: user?.favoriteGame || '',
    bio: user?.bio || '',
});

const ProfilePage = () => {
    const { user, updateProfile } = useAuth();
    const [profile, setProfile] = useState(user);
    const [form, setForm] = useState(createFormState(user));
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError('');

            try {
                const data = await getProfile();
                setProfile(data.data.user);
                setForm(createFormState(data.data.user));
            } catch (err) {
                setError(err.message || 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const updatedUser = await updateProfile(form);
            setProfile(updatedUser);
            setForm(createFormState(updatedUser));
            setSuccess('Profile updated successfully.');
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="page-panel glass-panel page-center-state">
                <p>Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="content-grid two-column-grid">
            <section className="page-panel glass-panel profile-summary-panel">
                <div className="profile-avatar-frame">
                    {profile?.profilePicture ? (
                        <img src={profile.profilePicture} alt={profile.displayName} className="profile-avatar-image" />
                    ) : (
                        <div className="profile-avatar-fallback">
                            {(profile?.displayName || profile?.username || 'U').slice(0, 1).toUpperCase()}
                        </div>
                    )}
                </div>

                <h2>{profile?.displayName || profile?.username}</h2>
                <p className="muted-copy">@{profile?.username}</p>
                <p className="profile-bio-preview">{profile?.bio || 'No bio added yet.'}</p>

                <div className="stat-grid">
                    <div className="stat-card">
                        <span className="stat-label">Tic-Tac-Toe Wins</span>
                        <strong>{profile?.stats?.tictactoeWins || 0}</strong>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Caro Wins</span>
                        <strong>{profile?.stats?.caroWins || 0}</strong>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Memory Highscore</span>
                        <strong>{profile?.stats?.memoryHighscore || 0}</strong>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Member Since</span>
                        <strong>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}</strong>
                    </div>
                </div>
            </section>

            <section className="page-panel glass-panel">
                <div className="section-heading">
                    <div>
                        <span className="section-kicker">Profile Settings</span>
                        <h2>Edit your public card</h2>
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form onSubmit={handleSubmit} className="form-group">
                    <label>Username</label>
                    <input name="username" value={form.username} onChange={handleChange} maxLength={30} required />

                    <label>Display Name</label>
                    <input name="displayName" value={form.displayName} onChange={handleChange} maxLength={60} />

                    <label>Profile Picture URL</label>
                    <input
                        name="profilePicture"
                        value={form.profilePicture}
                        onChange={handleChange}
                        placeholder="https://..."
                        maxLength={255}
                    />

                    <label>Location</label>
                    <input name="location" value={form.location} onChange={handleChange} maxLength={80} />

                    <label>Favorite Game</label>
                    <input name="favoriteGame" value={form.favoriteGame} onChange={handleChange} maxLength={60} />

                    <label>Bio</label>
                    <textarea
                        name="bio"
                        rows="5"
                        value={form.bio}
                        onChange={handleChange}
                        maxLength={280}
                        placeholder="Tell other players what you like to play."
                    />

                    <button type="submit" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                </form>
            </section>
        </div>
    );
};

export default ProfilePage;
