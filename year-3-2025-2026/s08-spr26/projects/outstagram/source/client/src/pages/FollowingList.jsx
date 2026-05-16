import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { readApiData } from "../lib/api";
import MainLayout from "../layouts/MainLayout";
import "../styles/FollowList.css";

import FollowButton from "../components/FollowButton";
import Avatar from "../components/Avatar";

export default function FollowingList() {
    const { username } = useParams();
    const [following, setFollowing] = useState([]);
    const [loading, setLoading] = useState(true);

    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        loadFollowing();
        getCurrentUser();
    }, [username]);

    const getCurrentUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            setCurrentUserId(session.user.id);
        }
    };

    const loadFollowing = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/profiles/${username}/following`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const data = await res.json();
                setFollowing(readApiData(data) || []);
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
                <h2>Following</h2>
                {loading ? (
                    <div className="follow-list-loading">Loading...</div>
                ) : following.length === 0 ? (
                    <div className="follow-list-empty">Not following anyone yet</div>
                ) : (
                    <div className="follow-list">
                        {following.map(user => (
                            <div key={user.user_id} className="follow-list-item">
                                <Link to={`/profile/${user.username}`} className="follow-user-info">
                                    <Avatar
                                        url={user.avatar_url}
                                        alt={user.username}
                                        size={40}
                                        className="follow-avatar"
                                    />
                                    <div>
                                        <div className="follow-username">{user.username}</div>
                                        <div className="follow-display-name">{user.display_name}</div>
                                    </div>
                                </Link>
                                {currentUserId === user.user_id ? (
                                    <span className="follow-you-badge">You</span>
                                ) : (
                                    <FollowButton
                                        userId={user.user_id}
                                        initialIsFollowing={user.is_following}
                                        onToggle={(newStatus) => {
                                            setFollowing(prev => prev.map(u =>
                                                u.user_id === user.user_id
                                                    ? { ...u, is_following: newStatus }
                                                    : u
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
