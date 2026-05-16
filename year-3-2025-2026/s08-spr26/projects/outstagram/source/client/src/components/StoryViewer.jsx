import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { X, Heart, Send } from "lucide-react";
import "../styles/Stories.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const DURATION_MS = 5000;

function timeAgo(dateStr) {
    const d = new Date(dateStr);
    const diff = Math.floor((Date.now() - d) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return d.toLocaleDateString();
}

export default function StoryViewer({ storyGroups, initialGroupIndex, onClose }) {
    const [groupIdx, setGroupIdx] = useState(initialGroupIndex || 0);
    const [storyIdx, setStoryIdx] = useState(0);
    const [progress, setProgress] = useState(0);
    const [paused, setPaused] = useState(false);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [replyText, setReplyText] = useState("");
    const [replySending, setReplySending] = useState(false);
    const [replySuccess, setReplySuccess] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const timerRef = useRef(null);
    const startTime = useRef(Date.now());
    const elapsed = useRef(0);
    const replyInputRef = useRef(null);

    const group = storyGroups[groupIdx];
    const story = group?.stories?.[storyIdx];
    const isOwnStory = currentUserId && group?.user?.user_id === currentUserId;

    // Get current user ID on mount
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user?.id) setCurrentUserId(session.user.id);
        });
    }, []);

    // Sync like state from story data
    useEffect(() => {
        if (story) {
            setLiked(!!story.liked_by_viewer);
            setLikeCount(story.like_count || 0);
            setReplyText("");
            setReplySuccess(false);
        }
    }, [groupIdx, storyIdx]);

    const getToken = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.access_token;
    };

    // Mark story as viewed
    const markViewed = useCallback(async (id) => {
        try {
            const token = await getToken();
            await fetch(`${API_BASE}/api/v1/stories/${id}/view`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (_) { }
    }, []);

    // Like/Unlike
    const toggleLike = async () => {
        if (!story) return;
        setPaused(true);
        const token = await getToken();
        const method = liked ? "DELETE" : "POST";
        try {
            const res = await fetch(`${API_BASE}/api/v1/stories/${story.id}/like`, {
                method,
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setLiked(!liked);
                setLikeCount(prev => liked ? Math.max(0, prev - 1) : prev + 1);
            }
        } catch (_) { }
        setPaused(false);
    };

    // Reply → send as DM to story owner
    const sendReply = async () => {
        if (!story || !replyText.trim() || !group?.user?.user_id) return;
        setReplySending(true);
        setPaused(true);
        try {
            const token = await getToken();
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            };

            // 1. Create or get conversation with story owner
            const convRes = await fetch(`${API_BASE}/api/v1/messages/conversations`, {
                method: "POST",
                headers,
                body: JSON.stringify({ recipientId: group.user.user_id }),
            });
            if (!convRes.ok) throw new Error("Failed to create conversation");
            const convData = await convRes.json();
            const conversationId = convData.data?.conversation?.id;
            if (!conversationId) throw new Error("No conversation ID");

            // 2. Send the reply as a DM
            const msgContent = `↩️ Replied to your story: "${replyText.trim()}"`;
            const msgRes = await fetch(`${API_BASE}/api/v1/messages/conversations/${conversationId}/messages`, {
                method: "POST",
                headers,
                body: JSON.stringify({ body: msgContent }),
            });
            if (msgRes.ok) {
                setReplyText("");
                setReplySuccess(true);
                setTimeout(() => setReplySuccess(false), 2000);
            }
        } catch (_) { }
        setReplySending(false);
        setPaused(false);
    };

    // Progress timer
    const startTimer = useCallback(() => {
        if (timerRef.current) cancelAnimationFrame(timerRef.current);
        startTime.current = Date.now() - elapsed.current;

        const tick = () => {
            const now = Date.now();
            const el = now - startTime.current;
            const pct = Math.min(el / DURATION_MS, 1);
            setProgress(pct * 100);

            if (pct >= 1) {
                goNext();
                return;
            }
            timerRef.current = requestAnimationFrame(tick);
        };
        timerRef.current = requestAnimationFrame(tick);
    }, []);

    const stopTimer = useCallback(() => {
        if (timerRef.current) cancelAnimationFrame(timerRef.current);
        elapsed.current = Date.now() - startTime.current;
    }, []);

    // Navigate
    const goNext = useCallback(() => {
        elapsed.current = 0;
        if (storyIdx < group.stories.length - 1) {
            setStoryIdx(i => i + 1);
        } else if (groupIdx < storyGroups.length - 1) {
            setGroupIdx(i => i + 1);
            setStoryIdx(0);
        } else {
            onClose();
        }
    }, [storyIdx, groupIdx, group, storyGroups.length, onClose]);

    const goPrev = useCallback(() => {
        elapsed.current = 0;
        if (storyIdx > 0) {
            setStoryIdx(i => i - 1);
        } else if (groupIdx > 0) {
            setGroupIdx(i => i - 1);
            const prevGroup = storyGroups[groupIdx - 1];
            setStoryIdx(prevGroup.stories.length - 1);
        }
    }, [storyIdx, groupIdx, storyGroups]);

    // Timer lifecycle
    useEffect(() => {
        elapsed.current = 0;
        setProgress(0);
        if (!paused) startTimer();
        if (story) markViewed(story.id);
        return () => stopTimer();
    }, [groupIdx, storyIdx]);

    useEffect(() => {
        if (paused) stopTimer();
        else startTimer();
    }, [paused]);

    // Keyboard
    useEffect(() => {
        const handler = (e) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowRight") goNext();
            if (e.key === "ArrowLeft") goPrev();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [goNext, goPrev, onClose]);

    if (!group || !story) return null;

    const user = group.user;

    return (
        <div className="story-viewer-overlay" onClick={onClose}>
            <div className="story-viewer" onClick={e => e.stopPropagation()}>
                {/* Progress bars */}
                <div className="story-progress-bar">
                    {group.stories.map((_, i) => (
                        <div key={i} className="story-progress-segment">
                            <div
                                className="story-progress-fill"
                                style={{
                                    width: i < storyIdx ? "100%" : i === storyIdx ? `${progress}%` : "0%"
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div className="story-viewer-header">
                    {user.avatar_url
                        ? <img src={user.avatar_url} alt={user.username} />
                        : <div className="story-viewer-header-fallback">{(user.username || "?")[0].toUpperCase()}</div>
                    }
                    <div>
                        <div className="story-viewer-username">{user.username}</div>
                        <div className="story-viewer-time">{timeAgo(story.created_at)}</div>
                    </div>
                    <button className="story-viewer-close" onClick={onClose}><X size={24} /></button>
                </div>

                {/* Media */}
                <div
                    className="story-viewer-media"
                    onMouseDown={() => setPaused(true)}
                    onMouseUp={() => setPaused(false)}
                    onTouchStart={() => setPaused(true)}
                    onTouchEnd={() => setPaused(false)}
                >
                    {story.media_type === "video" ? (
                        <video src={story.media_url} autoPlay muted playsInline />
                    ) : (
                        <img src={story.media_url} alt="Story" />
                    )}

                    {story.caption && (
                        <div className="story-viewer-caption">{story.caption}</div>
                    )}

                    {/* Tap zones */}
                    <div className="story-viewer-tap-left" onClick={goPrev} />
                    <div className="story-viewer-tap-right" onClick={goNext} />
                </div>

                {/* Like & Reply Footer */}
                <div className="story-viewer-footer">
                    {isOwnStory ? (
                        <div className="story-reply-bar">
                            <input
                                type="text"
                                className="story-reply-input"
                                placeholder="Viewers can reply to your story"
                                disabled
                            />
                        </div>
                    ) : (
                        <div className="story-reply-bar">
                            <input
                                ref={replyInputRef}
                                type="text"
                                className="story-reply-input"
                                placeholder={replySuccess ? "✓ Sent to DM!" : "Reply to story..."}
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                onFocus={() => setPaused(true)}
                                onBlur={() => { if (!replyText) setPaused(false); }}
                                onKeyDown={e => { if (e.key === "Enter") sendReply(); }}
                                disabled={replySending}
                            />
                            {replyText.trim() && (
                                <button className="story-reply-send" onClick={sendReply} disabled={replySending}>
                                    <Send size={18} />
                                </button>
                            )}
                        </div>
                    )}
                    <button
                        className={`story-like-btn ${liked ? "liked" : ""}`}
                        onClick={toggleLike}
                    >
                        <Heart size={24} fill={liked ? "#ed4956" : "none"} color={liked ? "#ed4956" : "#fff"} />
                    </button>
                    {likeCount > 0 && <span className="story-like-count">{likeCount}</span>}
                </div>
            </div>
        </div>
    );
}
