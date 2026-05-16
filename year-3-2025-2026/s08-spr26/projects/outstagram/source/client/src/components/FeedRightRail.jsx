import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "./Avatar";
import FollowButton from "./FollowButton";
import { supabase } from "../lib/supabase";
import { readApiData } from "../lib/api";
import { useToast } from "./ToastProvider";

export default function FeedRightRail({ currentUser, suggestedUsers = [], onSwitchAccount }) {
    const [enriched, setEnriched] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const toast = useToast();

    const uniqueSuggestions = useMemo(() => {
        const seen = new Set();
        return suggestedUsers.filter((user) => {
            const key = user.owner_id || user.user_id || user.username;
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        }).slice(0, 6);
    }, [suggestedUsers]);

    useEffect(() => {
        let ignore = false;
        const hydrate = async () => {
            if (!uniqueSuggestions.length) {
                setEnriched([]);
                return;
            }
            setLoading(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token;
                const results = await Promise.all(uniqueSuggestions.map(async (user) => {
                    try {
                        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/profiles/${user.username}`, {
                            headers: token ? { Authorization: `Bearer ${token}` } : {},
                        });
                        if (res.ok) {
                            const json = await res.json();
                            const data = readApiData(json);
                            return {
                                ...user,
                                user_id: data?.user_id,
                                avatar_url: data?.avatar_url || user.avatar_url,
                                display_name: data?.display_name,
                                is_following: data?.is_following,
                            };
                        }
                    } catch (err) {
                        console.error("Suggestion hydrate error", err);
                    }
                    return {
                        ...user,
                        user_id: user.owner_id || user.user_id,
                        is_following: false,
                    };
                }));

                if (!ignore) setEnriched(results.filter(Boolean));
            } catch (err) {
                if (!ignore) {
                    console.error(err);
                    setEnriched(uniqueSuggestions);
                }
            } finally {
                if (!ignore) setLoading(false);
            }
        };

        hydrate();
        return () => { ignore = true; };
    }, [uniqueSuggestions]);

    const handleToggleLocal = (userId, nextState) => {
        setEnriched((prev) => prev.map((user) => user.user_id === userId ? { ...user, is_following: nextState } : user));
    };

    return (
        <div className="feed-right-rail">
            <div className="feed-right-profile">
                <div className="feed-right-profile-main">
                    <Avatar
                        url={currentUser?.profile?.avatar_url}
                        alt={currentUser?.profile?.username || "You"}
                        size={56}
                    />
                    <div className="feed-right-profile-copy">
                        <div className="feed-right-username">{currentUser?.profile?.username || "your_profile"}</div>
                        <div className="feed-right-name">{currentUser?.profile?.display_name || currentUser?.email || "Outstagram user"}</div>
                    </div>
                </div>
                <button type="button" className="feed-rail-link" onClick={onSwitchAccount}>Switch</button>
            </div>

            <div className="feed-right-section-header">
                <span>Suggested for you</span>
                <button type="button" className="feed-rail-link feed-rail-link-muted" onClick={() => navigate("/suggestions")}>See all</button>
            </div>

            <div className="feed-right-suggestions">
                {loading ? (
                    <div className="feed-right-empty">Loading suggestions…</div>
                ) : enriched.length === 0 ? (
                    <div className="feed-right-empty">Follow more people to get better suggestions.</div>
                ) : (
                    enriched.map((user) => (
                        <div key={user.user_id || user.owner_id || user.username} className="feed-right-user">
                            <div className="feed-right-profile-main">
                                <Avatar
                                    url={user.avatar_url}
                                    alt={user.username}
                                    size={44}
                                />
                                <div className="feed-right-profile-copy">
                                    <div className="feed-right-username">{user.username}</div>
                                    <div className="feed-right-meta">{user.display_name || user.subtitle || "Suggested for you"}</div>
                                </div>
                            </div>
                            {user.user_id ? (
                                <FollowButton
                                    userId={user.user_id}
                                    initialIsFollowing={Boolean(user.is_following)}
                                    onToggle={(state) => handleToggleLocal(user.user_id, state)}
                                />
                            ) : (
                                <button type="button" className="feed-rail-link" onClick={() => toast.info("Cannot follow this profile right now")}>Follow</button>
                            )}
                        </div>
                    ))
                )}
            </div>

            <div className="feed-right-footer">
                <div>About . Help . Press . API . Jobs . Privacy . Terms</div>
                <div>Locations . Language . Meta Verified</div>
                <div className="feed-right-copyright">(c) 2026 INSTAGRAM FROM META</div>
            </div>
        </div>
    );
}
