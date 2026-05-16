import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Heart, MessageCircle, Send, MoreHorizontal } from "lucide-react";
import PostOptionsModal from "./PostOptionsModal";
import EditPostModal from "./EditPostModal";
import SharePostModal from "./SharePostModal";
import AboutAccountModal from "./AboutAccountModal";
import ReportModal from "./CommentReportModal";
import { useToast } from "./ToastProvider";
import "../styles/PostCard.css";
import Avatar from "./Avatar";

export default function PostCard({ post: initialPost, currentUser, onPostDeleted }) {
    const navigate = useNavigate();
    const [post, setPost] = useState(initialPost); // Local state for optimistic updates (edit)
    const [liked, setLiked] = useState(post.liked_by_viewer);
    const [likeCount, setLikeCount] = useState(post.like_count);
    const [showReport, setShowReport] = useState(false);
    const [reporting, setReporting] = useState(false);
    const toast = useToast();

    // Modals
    const [showOptions, setShowOptions] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showShare, setShowShare] = useState(false);
    const [showAboutAccount, setShowAboutAccount] = useState(false);

    // Media handling
    const mediaList = post.media || [];
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const currentMedia = mediaList.length > 0 ? mediaList[currentImageIndex] : null;

    const nextImage = (e) => {
        e.preventDefault();
        if (mediaList.length > 1) {
            setCurrentImageIndex((prev) => (prev + 1) % mediaList.length);
        }
    };

    const prevImage = (e) => {
        e.preventDefault();
        if (mediaList.length > 1) {
            setCurrentImageIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
        }
    };

    // Like Handler
    const handleToggleLike = async () => {
        const originalLiked = liked;
        const originalCount = likeCount;

        setLiked(!liked);
        setLikeCount(liked ? likeCount - 1 : likeCount + 1);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/likes/${post.id}/toggle`, {
                method: "POST",
                headers: { Authorization: `Bearer ${session.access_token}` },
            });

            if (!res.ok) throw new Error("Like failed");

        } catch (e) {
            console.error(e);
            setLiked(originalLiked);
            setLikeCount(originalCount);
        }
    };

    // Options Handlers
    const isOwner = currentUser && (
        currentUser.id === post.owner_id ||
        currentUser.user_id === post.owner_id ||
        currentUser.profile?.user_id === post.owner_id
    );

    const handleDeletePost = async () => {
        const confirmed = await toast.confirm({
            title: "Delete this post?",
            message: "This action cannot be undone.",
            confirmText: "Delete",
            cancelText: "Keep post",
            tone: "danger",
        });
        if (!confirmed) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/posts/${post.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${session.access_token}` },
            });
            if (res.ok) {
                if (onPostDeleted) onPostDeleted(post.id);
            } else {
                toast.error("Failed to delete post");
            }
        } catch (e) {
            console.error(e);
            toast.error("Unable to delete post right now.");
        }
    };

    const handleCopyLink = () => {
        const link = `${window.location.origin}/p/${post.id}`;
        navigator.clipboard.writeText(link);
        setShowOptions(false);
        toast.success("Link copied to clipboard");
    };

    const handleShare = () => {
        setShowOptions(false);
        setShowShare(true);
    };

    const handleGoToPost = () => {
        setShowOptions(false);
        navigate(`/p/${post.id}`);
    };

    const handleAboutAccount = () => {
        setShowOptions(false);
        setShowAboutAccount(true);
    };

    const handleReportPost = () => {
        setShowOptions(false);
        setShowReport(true);
    };

    const submitReport = async (reason) => {
        setReporting(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/posts/${post.id}/report`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
                },
                body: JSON.stringify({ reason }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body?.error || body?.message || "Unable to submit report");
            }
        } finally {
            setReporting(false);
        }
    };

    // Time formatting
    const timeAgo = (dateStr) => {
        const d = new Date(dateStr);
        const now = new Date();
        const diffInSeconds = Math.max(0, Math.floor((now - d) / 1000));

        if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;
        return d.toLocaleDateString();
    };

    return (
        <div className="post-card">
            {/* Header */}
            <div className="post-header">
                <Link to={`/profile/${post.username}`} className="post-header-link">
                    <Avatar
                        url={post.avatar_url}
                        alt={post.username}
                        size={32}
                        className="user-avatar"
                    />
                    <span className="username">{post.username}</span>
                </Link>
                <button
                    onClick={() => setShowOptions(true)}
                    className="post-options-btn"
                >
                    <MoreHorizontal size={20} />
                </button>
            </div>

            {/* Media */}
            <div className="post-media-container">
                {currentMedia ? (
                    <img
                        src={currentMedia.url || currentMedia.media_url}
                        alt="Post Content"
                        className="post-image"
                        onDoubleClick={handleToggleLike}
                    />
                ) : (
                    <div className="no-media">No Media</div>
                )}

                {/* Arrows */}
                {mediaList.length > 1 && (
                    <>
                        <button className={`carousel-btn left ${mediaList.length > 1 ? '' : 'carousel-btn--hidden'}`} onClick={prevImage}>&lt;</button>
                        <button className="carousel-btn right" onClick={nextImage}>&gt;</button>
                        <div
                            style={{
                                position: "absolute",
                                top: 12,
                                right: 12,
                                padding: "4px 8px",
                                borderRadius: 999,
                                background: "rgba(0, 0, 0, 0.6)",
                                color: "#fff",
                                fontSize: 12,
                                zIndex: 2,
                            }}
                        >
                            {currentImageIndex + 1}/{mediaList.length}
                        </div>
                    </>
                )}

                {/* Dots */}
                {mediaList.length > 1 && (
                    <div className="carousel-dots">
                        {mediaList.map((_, idx) => (
                            <div
                                key={idx}
                                className={`carousel-dot ${idx === currentImageIndex ? 'active' : ''}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="post-footer">
                <div className="post-actions">
                    <div className="action-group">
                        <button onClick={handleToggleLike} className="action-btn">
                            <Heart size={24} fill={liked ? "#ed4956" : "none"} color={liked ? "#ed4956" : "currentColor"} />
                        </button>
                        <span className="action-count">{likeCount || 0}</span>
                    </div>

                    <div className="action-group">
                        <Link to={`/p/${post.id}`} className="action-btn">
                            <MessageCircle size={24} />
                        </Link>
                        <span className="action-count">{post.comment_count || 0}</span>
                    </div>

                    <div className="action-group">
                        <button className="action-btn" onClick={handleShare}>
                            <Send size={24} />
                        </button>
                        <span className="action-count">Share</span>
                    </div>
                </div>

                <div className="post-caption">
                    <span className="username post-caption-username">{post.username}</span>
                    <span>{post.caption}</span>
                </div>

                <div className="post-date">
                    {timeAgo(post.created_at)}
                </div>
            </div>

            {/* Modals */}
            <PostOptionsModal
                isOpen={showOptions}
                onClose={() => setShowOptions(false)}
                isOwner={isOwner}
                onDelete={handleDeletePost}
                onEdit={() => { setShowOptions(false); setShowEdit(true); }}
                onCopyLink={handleCopyLink}
                onShare={handleShare}
                onGoToPost={handleGoToPost}
                onAboutAccount={handleAboutAccount}
                onReport={handleReportPost}
            />

            <EditPostModal
                isOpen={showEdit}
                onClose={() => setShowEdit(false)}
                post={post}
                onUpdate={(updatedPost) => {
                    setPost(prev => ({ ...prev, caption: updatedPost.caption }));
                }}
            />

            <SharePostModal
                isOpen={showShare}
                onClose={() => setShowShare(false)}
                postId={post.id}
                postUrl={`${window.location.origin}/p/${post.id}`}
                caption={post.caption}
                username={post.username}
                ownerAvatarUrl={post.avatar_url}
                thumbnailUrl={currentMedia?.url || currentMedia?.media_url || ""}
                mediaType={currentMedia?.type || "image"}
                likeCount={likeCount}
                commentCount={post.comment_count || 0}
            />

            <AboutAccountModal
                isOpen={showAboutAccount}
                username={post.username}
                onClose={() => setShowAboutAccount(false)}
            />

            <ReportModal
                isOpen={showReport}
                onClose={() => setShowReport(false)}
                onSubmit={submitReport}
                submitting={reporting}
                title="Report post"
                question="Why are you reporting this post?"
                targetLabel="post"
                targetName={post.username}
            />
        </div>
    );
}
