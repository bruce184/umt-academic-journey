import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Users } from "lucide-react";
import { supabase } from "../lib/supabase";
import { readApiData } from "../lib/api";
import MainLayout from "../layouts/MainLayout";
import Avatar from "../components/Avatar";
import FollowButton from "../components/FollowButton";
import FeedMessagesWidget from "../components/FeedMessagesWidget";
import "../styles/Suggestions.css";

export default function Suggestions() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentUser, setCurrentUser] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        let ignore = false;

        const loadSuggestions = async () => {
            setLoading(true);
            setError("");

            try {
                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token;

                if (!token) {
                    navigate("/login");
                    return;
                }

                const [meRes, feedRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/me`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/feed?limit=60`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                if (!meRes.ok || !feedRes.ok) {
                    throw new Error("Failed to load suggestions");
                }

                const meJson = await meRes.json();
                const feedJson = await feedRes.json();
                const me = meJson.data;
                const feedItems = feedJson.data?.items || [];

                const baseSuggestions = feedItems
                    .map((post) => ({
                        owner_id: post.owner_id,
                        user_id: post.owner_id,
                        username: post.username,
                        avatar_url: post.avatar_url,
                        display_name: post.display_name,
                    }))
                    .filter((user, index, array) =>
                        user.username &&
                        user.owner_id !== me?.profile?.user_id &&
                        array.findIndex((candidate) => candidate.owner_id === user.owner_id) === index
                    );

                const enriched = await Promise.all(baseSuggestions.map(async (user) => {
                    try {
                        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/profiles/${user.username}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        if (!res.ok) return user;
                        const json = await res.json();
                        const data = readApiData(json);
                        return {
                            ...user,
                            user_id: data?.user_id,
                            avatar_url: data?.avatar_url || user.avatar_url,
                            display_name: data?.display_name || user.display_name,
                            bio: data?.bio || "",
                            is_following: data?.is_following,
                            follower_count: data?.follower_count,
                        };
                    } catch {
                        return user;
                    }
                }));

                if (!ignore) {
                    setCurrentUser(me);
                    setSuggestions(enriched);
                }
            } catch (err) {
                console.error(err);
                if (!ignore) setError(err.message || "Failed to load suggestions");
            } finally {
                if (!ignore) setLoading(false);
            }
        };

        loadSuggestions();
        return () => { ignore = true; };
    }, [navigate]);

    const suggestionCount = useMemo(() => suggestions.length, [suggestions]);

    return (
        <MainLayout variant="feed">
            <div className="suggestions-page">
                <div className="suggestions-header">
                    <div className="suggestions-eyebrow">
                        <Sparkles size={15} />
                        Suggested for you
                    </div>
                    <h1>Discover people to follow</h1>
                    <p>Profiles picked from your current feed and activity context.</p>
                    <div className="suggestions-meta">
                        <span><Users size={14} /> {suggestionCount} profiles</span>
                        {currentUser?.profile?.username ? <span>For @{currentUser.profile.username}</span> : null}
                    </div>
                </div>

                {loading ? (
                    <div className="suggestions-empty">Loading suggestions...</div>
                ) : error ? (
                    <div className="suggestions-empty">{error}</div>
                ) : suggestions.length === 0 ? (
                    <div className="suggestions-empty">No suggestions available yet.</div>
                ) : (
                    <div className="suggestions-grid">
                        {suggestions.map((user) => (
                            <div key={user.user_id || user.username} className="suggestion-card">
                                <button
                                    type="button"
                                    className="suggestion-card-main"
                                    onClick={() => navigate(`/profile/${user.username}`)}
                                >
                                    <Avatar
                                        url={user.avatar_url}
                                        alt={user.username}
                                        size={72}
                                    />
                                    <div className="suggestion-card-copy">
                                        <div className="suggestion-card-username">@{user.username}</div>
                                        <div className="suggestion-card-name">{user.display_name || "Outstagram user"}</div>
                                        <div className="suggestion-card-bio">
                                            {user.bio?.trim() || `${user.follower_count || 0} followers`}
                                        </div>
                                    </div>
                                </button>

                                {user.user_id ? (
                                    <FollowButton
                                        userId={user.user_id}
                                        initialIsFollowing={Boolean(user.is_following)}
                                    />
                                ) : null}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <FeedMessagesWidget />
        </MainLayout>
    );
}
