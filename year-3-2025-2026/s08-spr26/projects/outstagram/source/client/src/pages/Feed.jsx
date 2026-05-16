import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase";
import PostCard from "../components/PostCard";
import MainLayout from "../layouts/MainLayout";
import FeedRightRail from "../components/FeedRightRail";
import FeedMessagesWidget from "../components/FeedMessagesWidget";
import SwitchAccountModal from "../components/SwitchAccountModal";
import { Loader2 } from "lucide-react";
import StoryRing from "../components/StoryRing";
import "../styles/Feed.css";

export default function Feed() {
    const [posts, setPosts] = useState([]);
    const [nextCursor, setNextCursor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [err, setErr] = useState("");
    const [currentUser, setCurrentUser] = useState(null);
    const [showSwitchAccount, setShowSwitchAccount] = useState(false);

    // Ref for the intersection observer target
    const observerTarget = useRef(null);

    const fetchFeed = useCallback(async (cursor = null) => {
        try {
            setErr("");
            if (cursor) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            if (!token) {
                window.location.href = "/login";
                return;
            }

            // If it's the initial load or a refresh, we might want to ensure we have the user profile
            // Only fetch user if we don't have it yet (or on refresh if desired)
            if (!currentUser) {
                const meRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (meRes.ok) {
                    const meJson = await meRes.json();
                    setCurrentUser(meJson.data);
                }
            }

            // Build URL
            let url = `${import.meta.env.VITE_API_BASE_URL}/api/feed`;
            if (cursor) {
                url += `?cursor=${encodeURIComponent(cursor)}`;
            }

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.status === 401) {
                await supabase.auth.signOut();
                window.location.href = "/login";
                return;
            }

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Feed request failed: ${res.status} ${text.slice(0, 100)}`);
            }

            const json = await res.json();

            // The server response structure is wrapped in { data: { items: [] }, meta: ... }
            const items = json.data?.items || [];
            const nextCursor = json.meta?.pagination?.nextCursor;

            if (!cursor) {
                // Initial load or refresh: replace all posts
                setPosts(items);
            } else {
                // Append new posts
                setPosts(prev => {
                    // Filter out potential duplicates just in case
                    const existingIds = new Set(prev.map(p => p.id));
                    const newItems = items.filter(p => !existingIds.has(p.id));
                    return [...prev, ...newItems];
                });
            }

            setNextCursor(nextCursor);

        } catch (e) {
            console.error(e);
            setErr(e?.message || "Unknown error");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [currentUser]);

    // Initial load
    useEffect(() => {
        fetchFeed();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Intersection Observer for Infinite Scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && nextCursor && !loadingMore && !loading) {
                    fetchFeed(nextCursor);
                }
            },
            { threshold: 0.1 } // Trigger when 10% of the sentinel is visible
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [nextCursor, loadingMore, loading, fetchFeed]);

    const suggestedUsers = posts
        .map((post) => ({
            owner_id: post.owner_id,
            username: post.username,
            avatar_url: post.avatar_url,
            subtitle: post.owner_id === currentUser?.profile?.user_id ? "Your activity" : "From your feed",
        }))
        .filter((user, index, arr) =>
            user.username &&
            user.owner_id !== currentUser?.profile?.user_id &&
            arr.findIndex((candidate) => candidate.owner_id === user.owner_id) === index
        )
        .slice(0, 5);

    if (err) return <div className="feed-error">Error: {err} <button onClick={() => fetchFeed()} className="retry-btn">Retry</button></div>;

    return (
        <MainLayout
            variant="feed"
            rightSidebar={
                <FeedRightRail
                    currentUser={currentUser}
                    suggestedUsers={suggestedUsers}
                    onSwitchAccount={() => setShowSwitchAccount(true)}
                />
            }
        >
            <div className="feed-immersive">
                <div className="feed-story-shell">
                    <StoryRing />
                </div>

                {loading && !posts.length ? (
                    <div className="feed-message"><Loader2 className="spinning" size={32} /> Loading feed...</div>
                ) : (
                    <>
                        {posts.length === 0 ? (
                            <div className="feed-message">No posts found. Follow some users to see their posts!</div>
                        ) : (
                            posts.map(post => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    currentUser={currentUser}
                                    onPostDeleted={(deletedId) => {
                                        setPosts(prev => prev.filter(p => p.id !== deletedId));
                                    }}
                                />
                            ))
                        )}

                        <div ref={observerTarget} className="feed-loader-sentinel">
                            {loadingMore && <div className="loading-more"><Loader2 className="spinning" size={24} /> Loading more...</div>}
                        </div>
                    </>
                )}
            </div>
            <FeedMessagesWidget />
            <SwitchAccountModal isOpen={showSwitchAccount} onClose={() => setShowSwitchAccount(false)} />
        </MainLayout>
    );
}
