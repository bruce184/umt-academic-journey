import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Image as ImageIcon, MessageCircle, Play, Rows3, Search as SearchIcon } from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import ExplorePostModal from "../components/ExplorePostModal";
import FeedMessagesWidget from "../components/FeedMessagesWidget";
import "../styles/SearchPage.css";

export default function SearchPage() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";
    const navigate = useNavigate();

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [activePostIndex, setActivePostIndex] = useState(null);

    useEffect(() => {
        const fetchExplorePosts = async () => {
            setLoading(true);
            setError("");

            try {
                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token;

                if (!token) {
                    navigate("/login");
                    return;
                }

                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/feed?limit=30`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    throw new Error("Failed to load explore posts");
                }

                const data = await res.json();
                setPosts(data.data?.items || []);
            } catch (err) {
                console.error("Explore load error", err);
                setError(err.message || "Failed to load explore posts");
            } finally {
                setLoading(false);
            }
        };

        fetchExplorePosts();
    }, [navigate]);

    const filteredPosts = useMemo(() => {
        const trimmed = query.trim().toLowerCase();
        if (!trimmed) return posts;

        return posts.filter((post) =>
            post.caption?.toLowerCase().includes(trimmed) ||
            post.username?.toLowerCase().includes(trimmed) ||
            post.display_name?.toLowerCase().includes(trimmed)
        );
    }, [posts, query]);

    const activePost = activePostIndex !== null ? filteredPosts[activePostIndex] : null;

    return (
        <MainLayout variant="feed">
            <div className="explore-page">
                <div className="explore-page-header">
                    <div>
                        <div className="explore-page-eyebrow">
                            <Rows3 size={15} />
                            <span>Explore</span>
                        </div>
                        <h1>{query ? `Results for "${query}"` : "Discover posts"}</h1>
                    </div>
                    <div className="explore-page-meta">
                        <SearchIcon size={16} />
                        <span>{filteredPosts.length} posts</span>
                    </div>
                </div>

                {loading ? (
                    <div className="explore-empty-state">Loading posts...</div>
                ) : error ? (
                    <div className="explore-empty-state">{error}</div>
                ) : filteredPosts.length === 0 ? (
                    <div className="explore-empty-state">
                        {query ? "No posts matched your search." : "No posts available yet."}
                    </div>
                ) : (
                    <div className="explore-grid">
                        {filteredPosts.map((post, index) => {
                            const thumbnail = post.media?.[0];
                            const isVideo = thumbnail?.type === "video";
                            const isMultiMedia = (post.media?.length || 0) > 1;

                            return (
                                <button
                                    key={post.id}
                                    type="button"
                                    className="explore-post-card"
                                    onClick={() => setActivePostIndex(index)}
                                >
                                    {thumbnail ? (
                                        isVideo ? (
                                            <video
                                                src={thumbnail.url || thumbnail.media_url}
                                                className="explore-post-card-media"
                                                muted
                                                playsInline
                                            />
                                        ) : (
                                            <img
                                                src={thumbnail.url || thumbnail.media_url}
                                                alt={post.caption || `Post by ${post.username}`}
                                                className="explore-post-card-media"
                                            />
                                        )
                                    ) : (
                                        <div className="explore-post-card-placeholder">
                                            <ImageIcon size={28} />
                                        </div>
                                    )}

                                    <div className="explore-post-card-overlay">
                                        <div className="explore-post-card-stats">
                                            <span><HeartIcon /> {post.like_count || 0}</span>
                                            <span><MessageCircle size={16} /> {post.comment_count || 0}</span>
                                        </div>
                                    </div>

                                    {isVideo ? (
                                        <span className="explore-post-card-badge">
                                            <Play size={14} fill="currentColor" />
                                        </span>
                                    ) : null}

                                    {isMultiMedia ? (
                                        <span className="explore-post-card-badge explore-post-card-badge--stack">
                                            <Rows3 size={14} />
                                        </span>
                                    ) : null}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            <FeedMessagesWidget />

            {activePost ? (
                <ExplorePostModal
                    postId={activePost.id}
                    onClose={() => setActivePostIndex(null)}
                    hasPrev={activePostIndex > 0}
                    hasNext={activePostIndex < filteredPosts.length - 1}
                    onPrev={() => setActivePostIndex((prev) => Math.max(0, prev - 1))}
                    onNext={() => setActivePostIndex((prev) => Math.min(filteredPosts.length - 1, prev + 1))}
                    onPostDeleted={(deletedId) => {
                        setPosts((prev) => prev.filter((item) => item.id !== deletedId));
                        setActivePostIndex(null);
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
