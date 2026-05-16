import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { readApiData } from "../lib/api";
import MainLayout from "../layouts/MainLayout";
import "../styles/FollowList.css";

import FollowButton from "../components/FollowButton";
import Avatar from "../components/Avatar";

export default function FollowersList() {
    const { username } = useParams();
    const [followers, setFollowers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        loadFollowers();
        getCurrentUser();
    }, [username]);

    const getCurrentUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            setCurrentUserId(session.user.id);
        }
    };

    const loadFollowers = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            // ... (rest of loadFollowers)


            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/profiles/${username}/followers`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const data = await res.json();
                setFollowers(readApiData(data) || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="follow-list-container">
                <h2>Followers</h2>
                {loading ? (
                    <div className="follow-list-loading">Loading...</div>
                ) : followers.length === 0 ? (
                    <div className="follow-list-empty">No followers yet</div>
                ) : (
                    <div className="follow-list">
                        {followers.map(follower => (
                            <div key={follower.user_id} className="follow-list-item">
                                <Link to={`/profile/${follower.username}`} className="follow-user-info">
                                    <Avatar
                                        url={follower.avatar_url}
                                        alt={follower.username}
                                        size={40}
                                        className="follow-avatar"
                                    />
                                    <div>
                                        <div className="follow-username">{follower.username}</div>
                                        <div className="follow-display-name">{follower.display_name}</div>
                                    </div>
                                </Link>
                                {currentUserId === follower.user_id ? (
                                    <span className="follow-you-badge">You</span>
                                ) : (
                                    <FollowButton
                                        userId={follower.user_id}
                                        initialIsFollowing={follower.is_following}
                                        onToggle={(newStatus) => {
                                            setFollowers(prev => prev.map(f =>
                                                f.user_id === follower.user_id
                                                    ? { ...f, is_following: newStatus }
                                                    : f
                                            ));
                                        }}
                                        className="follow-btn-sm"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
