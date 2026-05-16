import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Grid, Loader2, MessageCircle, MessageSquare, Play, Rows3, User } from "lucide-react";
import { supabase } from "../lib/supabase";
import { readApiData, readApiErrorMessage } from "../lib/api";
import MainLayout from "../layouts/MainLayout";
import FollowButton from "../components/FollowButton";
import Avatar from "../components/Avatar";
import StoryViewer from "../components/StoryViewer";
import ExplorePostModal from "../components/ExplorePostModal";
import FeedMessagesWidget from "../components/FeedMessagesWidget";
import FollowListModal from "../components/FollowListModal";
import "../styles/Profile.css";
import "../styles/Stories.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default function Profile() {
    const { username } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [hasStory, setHasStory] = useState(false);
    const [storySeen, setStorySeen] = useState(true);
    const [storyGroup, setStoryGroup] = useState(null);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [activePostIndex, setActivePostIndex] = useState(null);
    const [activeFollowModal, setActiveFollowModal] = useState(null);

    useEffect(() => {
        loadProfile();
    }, [username]);

    const loadProfile = async () => {
        try {
            setLoading(true);
            setError("");

            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            if (!token) {
                navigate("/login");
                return;
            }

            const profileRes = await fetch(`${API_BASE}/api/v1/profiles/${username}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!profileRes.ok) {
                setError("Profile not found");
                return;
            }

            const profileJson = await profileRes.json();
            const profileData = readApiData(profileJson);

            if (!profileData) {
                setError(readApiErrorMessage(profileJson, "Profile not found"));
                return;
            }

            setProfile(profileData);

            const postsRes = await fetch(`${API_BASE}/api/v1/profiles/${username}/posts?limit=12`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (postsRes.ok) {
                const postsJson = await postsRes.json();
                setPosts(readApiData(postsJson) || []);
            }

            if (profileData.user_id) {
                try {
                    const storyRes = await fetch(`${API_BASE}/api/v1/stories/user/${profileData.user_id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    if (storyRes.ok) {
                        const storyData = await storyRes.json();
                        const sg = storyData.data?.storyGroup;
                        if (sg && sg.stories?.length > 0) {
                            setHasStory(true);
                            setStoryGroup(sg);
                            setStorySeen(!sg.has_unseen);
                        } else {
                            setHasStory(false);
                        }
                    }
                } catch (_) {
                    setHasStory(false);
                }
            }
        } catch (loadError) {
            console.error(loadError);
            setError("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const handleFollowToggle = (isFollowing) => {
        setProfile((prev) => ({
            ...prev,
            is_following: isFollowing,
            follower_count: isFollowing
                ? prev.follower_count + 1
                : Math.max(0, prev.follower_count - 1),
        }));
    };

    const activePost = useMemo(() => {
        if (activePostIndex === null) return null;
        return posts[activePostIndex] || null;
    }, [posts, activePostIndex]);

    if (loading) {
        return (
            <MainLayout variant="feed">
                <div className="profile-loading"><Loader2 className="animate-spin" /></div>
            </MainLayout>
        );
    }

    if (error || !profile) {
        return (
            <MainLayout variant="feed">
                <div className="profile-error">{error || "Profile not found"}</div>
            </MainLayout>
        );
    }

    return (
        <MainLayout variant="feed">
            <div className="profile-container">
                <div className="profile-header">
                    <div className="profile-avatar">
                        <div
                            className={hasStory ? `profile-avatar-story-ring ${storySeen ? "seen" : ""}` : ""}
                            onClick={() => {
                                if (hasStory && storyGroup) {
                                    setViewerOpen(true);
                                }
                            }}
                            style={hasStory ? { cursor: "pointer" } : {}}
                        >
                            <Avatar
                                url={profile.avatar_url}
                                alt={profile.username}
                                size={170}
                                className="profile-avatar-img"
                            />
                        </div>

                        {hasStory ? (
                            <button
                                type="button"
                                className="profile-story-cta"
                                onClick={() => setViewerOpen(true)}
                            >
                                {storySeen ? "View story" : "New story"}
                            </button>
                        ) : null}
                    </div>

                    <div className="profile-info">
                        <div className="profile-info-header">
                            <h2 className="profile-username">{profile.username}</h2>

                            {profile.is_own_profile ? (
                                <Link to="/profile/edit" className="profile-action-btn profile-btn-secondary">
                                    Edit Profile
                                </Link>
                            ) : (
                                <>
                                    <FollowButton
                                        userId={profile.user_id}
                                        initialIsFollowing={profile.is_following}
                                        onToggle={handleFollowToggle}
                                        className="profile-action-btn"
                                    />
                                    <button
                                        type="button"
                                        className="profile-action-btn profile-btn-secondary"
                                        onClick={() => navigate("/messages")}
                                    >
                                        <MessageSquare size={16} />
                                        Message
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="profile-stats">
                            <div className="profile-stat">
                                <span className="stat-count">{profile.post_count}</span> posts
                            </div>
                            <button
                                type="button"
                                className="profile-stat profile-stat-button"
                                onClick={() => setActiveFollowModal("followers")}
                            >
                                <span className="stat-count">{profile.follower_count}</span> followers
                            </button>
                            <button
                                type="button"
                                className="profile-stat profile-stat-button"
                                onClick={() => setActiveFollowModal("following")}
                            >
                                <span className="stat-count">{profile.following_count}</span> following
                            </button>
                        </div>

                        <div className="profile-bio">
                            <div className="profile-display-name">{profile.display_name}</div>
                            <div className="profile-bio-text">{profile.bio || "No bio yet."}</div>
                        </div>
                    </div>
                </div>

                <div className="profile-posts-header">
                    <span className="posts-tab active">
                        <Grid size={12} /> POSTS
                    </span>
                </div>

                <div className="profile-posts-grid">
                    {posts.length === 0 ? (
                        <div className="profile-no-posts">No posts yet</div>
                    ) : (
                        posts.map((post, index) => {
                            const thumbnail = post.media?.[0];
                            const isVideo = thumbnail?.type === "video";
                            const isMultiMedia = (post.media?.length || 0) > 1;

                            return (
                                <button
                                    key={post.id}
                                    type="button"
                                    className="profile-post-item"
                                    onClick={() => setActivePostIndex(index)}
                                >
                                    {thumbnail ? (
                                        isVideo ? (
                                            <video
                                                src={thumbnail.url || thumbnail.media_url}
                                                className="profile-post-image"
                                                muted
                                                playsInline
                                            />
                                        ) : (
                                            <img
                                                src={thumbnail.url || thumbnail.media_url}
                                                alt={post.caption || `Post by ${post.username}`}
                                                className="profile-post-image"
                                            />
                                        )
                                    ) : (
                                        <div className="profile-post-placeholder">
                                            <User size={34} />
                                        </div>
                                    )}

                                    <div className="profile-post-overlay">
                                        <div className="post-overlay-stats">
                                            <span><HeartIcon /> {post.like_count || 0}</span>
                                            <span><MessageCircle size={16} /> {post.comment_count || 0}</span>
                                        </div>
                                    </div>

                                    {isVideo ? (
                                        <span className="profile-post-badge">
                                            <Play size={14} fill="currentColor" />
                                        </span>
                                    ) : null}

                                    {isMultiMedia ? (
                                        <span className="profile-post-badge profile-post-badge--stack">
                                            <Rows3 size={14} />
                                        </span>
                                    ) : null}
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            <FeedMessagesWidget />

            <FollowListModal
                open={Boolean(activeFollowModal)}
                mode={activeFollowModal || "followers"}
                username={username}
                onClose={() => setActiveFollowModal(null)}
            />

            {activePost ? (
                <ExplorePostModal
                    postId={activePost.id}
                    onClose={() => setActivePostIndex(null)}
                    hasPrev={activePostIndex > 0}
                    hasNext={activePostIndex < posts.length - 1}
                    onPrev={() => setActivePostIndex((prev) => Math.max(0, prev - 1))}
                    onNext={() => setActivePostIndex((prev) => Math.min(posts.length - 1, prev + 1))}
                    onPostDeleted={(deletedId) => {
                        setPosts((prev) => prev.filter((item) => item.id !== deletedId));
                        setActivePostIndex(null);
                    }}
                />
            ) : null}

            {viewerOpen && storyGroup ? (
                <StoryViewer
                    storyGroups={[storyGroup]}
                    initialGroupIndex={0}
                    onClose={() => {
                        setViewerOpen(false);
                        setStorySeen(true);
                    }}
                />
            ) : null}
        </MainLayout>
    );
}

function HeartIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
    );
}
