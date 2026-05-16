import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    ArrowRight,
    Bookmark,
    Heart,
    MessageCircle,
    MoreHorizontal,
    Send,
    X,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import Avatar from "./Avatar";
import FollowButton from "./FollowButton";
import PostOptionsModal from "./PostOptionsModal";
import EditPostModal from "./EditPostModal";
import SharePostModal from "./SharePostModal";
import ReportModal from "./CommentReportModal";
import AboutAccountModal from "./AboutAccountModal";
import { useToast } from "./ToastProvider";
import "../styles/ExplorePostModal.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

async function authFetch(path, options = {}) {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        },
        ...options,
    });

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.error?.message || body?.message || "Request failed");
    }

    return response.json();
}

function timeAgo(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.max(0, Math.floor((now - d) / 1000));

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    return d.toLocaleDateString();
}

function insertReply(items, parentId, reply) {
    return items.map((item) => {
        if (item.id === parentId) {
            return {
                ...item,
                replies: [...(item.replies || []), reply],
            };
        }

        if (item.replies?.length) {
            return {
                ...item,
                replies: insertReply(item.replies, parentId, reply),
            };
        }

        return item;
    });
}

function updateCommentById(items, targetId, updater) {
    return items.map((item) => {
        if (item.id === targetId) {
            return updater(item);
        }

        if (item.replies?.length) {
            return {
                ...item,
                replies: updateCommentById(item.replies, targetId, updater),
            };
        }

        return item;
    });
}

function countNestedReplies(replies = []) {
    return replies.reduce((total, reply) => total + 1 + countNestedReplies(reply.replies || []), 0);
}

export default function ExplorePostModal({
    postId,
    onClose,
    hasPrev = false,
    hasNext = false,
    onPrev,
    onNext,
    onPostDeleted,
}) {
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [newComment, setNewComment] = useState("");
    const [replyDrafts, setReplyDrafts] = useState({});
    const [activeReplyId, setActiveReplyId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [showOptions, setShowOptions] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showShare, setShowShare] = useState(false);
    const [showAboutAccount, setShowAboutAccount] = useState(false);
    const [expandedReplies, setExpandedReplies] = useState({});
    const [commentActionTarget, setCommentActionTarget] = useState(null);
    const [reportCommentTarget, setReportCommentTarget] = useState(null);
    const [reportingComment, setReportingComment] = useState(false);
    const [showPostReport, setShowPostReport] = useState(false);
    const [reportingPost, setReportingPost] = useState(false);
    const toast = useToast();
    const commentInputRef = useRef(null);

    useEffect(() => {
        if (!postId) return;

        let cancelled = false;
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const fetchData = async () => {
            setLoading(true);
            setError("");
            setCurrentMediaIndex(0);
            setActiveReplyId(null);
            setReplyDrafts({});
            setExpandedReplies({});
            setCommentActionTarget(null);
            setReportCommentTarget(null);
            setNewComment("");

            try {
                const [meRes, postRes, commentsRes] = await Promise.all([
                    authFetch("/api/v1/me"),
                    authFetch(`/api/v1/posts/${postId}`),
                    authFetch(`/api/v1/comments/${postId}`),
                ]);

                if (cancelled) return;

                setCurrentUser(meRes.data);
                setPost(postRes.data.post);
                setLiked(Boolean(postRes.data.post.liked_by_viewer));
                setLikeCount(postRes.data.post.like_count || 0);
                setComments(commentsRes.data.comments || []);
            } catch (fetchError) {
                if (!cancelled) {
                    console.error(fetchError);
                    setError(fetchError.message || "Failed to load post");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            cancelled = true;
            document.body.style.overflow = originalOverflow;
        };
    }, [postId]);

    useEffect(() => {
        if (!postId) return;

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                if (showShare) {
                    setShowShare(false);
                    return;
                }
                if (showOptions) {
                    setShowOptions(false);
                    return;
                }
                onClose();
                return;
            }

            if (event.key === "ArrowLeft" && hasPrev) {
                if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
                onPrev?.();
            }

            if (event.key === "ArrowRight" && hasNext) {
                if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
                onNext?.();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [postId, onClose, hasPrev, hasNext, onPrev, onNext, showOptions, showShare]);

    const mediaList = useMemo(() => post?.media || [], [post]);
    const currentMedia = mediaList[currentMediaIndex] || null;
    const isOwner = currentUser && post && currentUser.profile?.user_id === post.owner_id;

    const handleToggleLike = async () => {
        if (!post) return;

        const previousLiked = liked;
        const previousLikeCount = likeCount;

        setLiked(!previousLiked);
        setLikeCount(previousLiked ? previousLikeCount - 1 : previousLikeCount + 1);

        try {
            await authFetch(`/api/v1/likes/${post.id}/toggle`, { method: "POST" });
        } catch (toggleError) {
            console.error(toggleError);
            setLiked(previousLiked);
            setLikeCount(previousLikeCount);
        }
    };

    const handlePostComment = async () => {
        if (!newComment.trim() || !post) return;
        setSubmitting(true);

        try {
            const res = await authFetch(`/api/v1/comments/${post.id}`, {
                method: "POST",
                body: JSON.stringify({ content: newComment.trim() }),
            });

            setComments((prev) => [...prev, res.data.comment]);
            setNewComment("");
        } catch (commentError) {
            console.error(commentError);
        } finally {
            setSubmitting(false);
        }
    };

    const handleReplySubmit = async (parentId) => {
        const content = replyDrafts[parentId]?.trim();
        if (!content || !post) return;

        setSubmitting(true);
        try {
            const res = await authFetch(`/api/v1/comments/${post.id}`, {
                method: "POST",
                body: JSON.stringify({ content, parent_id: parentId }),
            });

            setComments((prev) => insertReply(prev, parentId, res.data.comment));
            setReplyDrafts((prev) => ({ ...prev, [parentId]: "" }));
            setActiveReplyId(null);
        } catch (replyError) {
            console.error(replyError);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeletePost = async () => {
        if (!post) return;
        const confirmed = await toast.confirm({
            title: "Delete this post?",
            message: "This action cannot be undone.",
            confirmText: "Delete",
            cancelText: "Keep post",
            tone: "danger",
        });
        if (!confirmed) return;

        try {
            await authFetch(`/api/v1/posts/${post.id}`, { method: "DELETE" });
            onPostDeleted?.(post.id);
            setShowOptions(false);
            onClose();
        } catch (deleteError) {
            console.error(deleteError);
            toast.error("Failed to delete post");
        }
    };

    const handleCopyLink = async () => {
        const shareUrl = `${window.location.origin}/p/${post?.id}`;

        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(shareUrl);
                setShowOptions(false);
                toast.success("Link copied to clipboard");
                return;
            }

            const temp = document.createElement("textarea");
            temp.value = shareUrl;
            document.body.appendChild(temp);
            temp.select();
            document.execCommand("copy");
            temp.remove();
            setShowOptions(false);
            toast.success("Link copied to clipboard");
        } catch (copyError) {
            console.error(copyError);
            toast.error("Unable to copy link right now");
        }
    };

    const handleGoToPost = () => {
        if (!post?.id) return;
        setShowOptions(false);
        navigate(`/p/${post.id}`);
    };

    const handleAboutAccount = () => {
        setShowOptions(false);
        setShowAboutAccount(true);
    };

    const handleReportPost = () => {
        setShowOptions(false);
        setShowPostReport(true);
    };

    const handleSubmitPostReport = async (reason) => {
        if (!post?.id) return;
        setReportingPost(true);
        try {
            await authFetch(`/api/v1/posts/${post.id}/report`, {
                method: "POST",
                body: JSON.stringify({ reason }),
            });
        } finally {
            setReportingPost(false);
        }
    };

    const handleToggleCommentLike = async (commentId, currentLiked, currentCount) => {
        setComments((prev) =>
            updateCommentById(prev, commentId, (comment) => ({
                ...comment,
                liked_by_viewer: !currentLiked,
                like_count: currentLiked ? Math.max(0, currentCount - 1) : currentCount + 1,
            }))
        );

        try {
            const res = await authFetch(`/api/v1/comments/id/${commentId}/like`, {
                method: "POST",
            });

            setComments((prev) =>
                updateCommentById(prev, commentId, (comment) => ({
                    ...comment,
                    liked_by_viewer: Boolean(res.data?.liked ?? res.liked),
                    like_count: res.data?.like_count ?? res.like_count ?? comment.like_count,
                }))
            );
        } catch (toggleError) {
            console.error(toggleError);
            setComments((prev) =>
                updateCommentById(prev, commentId, (comment) => ({
                    ...comment,
                    liked_by_viewer: currentLiked,
                    like_count: currentCount,
                }))
            );
        }
    };

    const handleReportComment = async (reason) => {
        if (!reportCommentTarget?.id) return;

        setReportingComment(true);
        try {
            await authFetch(`/api/v1/comments/id/${reportCommentTarget.id}/report`, {
                method: "POST",
                body: JSON.stringify({ reason }),
            });
        } finally {
            setReportingComment(false);
        }
    };

    const renderComments = (items, depth = 0) => items.map((comment) => (
        <div key={comment.id} className="explore-post-comment-thread" style={{ marginLeft: depth ? 20 : 0 }}>
            <div className="explore-post-comment-item">
                <Link to={`/profile/${comment.username}`} className="explore-post-comment-avatar-link">
                    <Avatar url={comment.avatar_url} alt={comment.username} size={32} />
                </Link>
                <div className="explore-post-comment-copy">
                    <div className="explore-post-comment-row">
                        <div className="explore-post-comment-body">
                            <Link to={`/profile/${comment.username}`} className="explore-post-comment-username">
                                {comment.username}
                            </Link>
                            <span>{comment.content}</span>
                        </div>
                        <div className="explore-post-comment-side">
                            <button
                                type="button"
                                className={`explore-post-comment-heart ${comment.liked_by_viewer ? "liked" : ""}`}
                                onClick={() => handleToggleCommentLike(comment.id, Boolean(comment.liked_by_viewer), comment.like_count || 0)}
                                title={comment.liked_by_viewer ? "Unlike comment" : "Like comment"}
                            >
                                <Heart
                                    size={16}
                                    fill={comment.liked_by_viewer ? "#ff3040" : "none"}
                                    color={comment.liked_by_viewer ? "#ff3040" : "currentColor"}
                                />
                            </button>
                            {comment.user_id !== currentUser?.profile?.user_id ? (
                                <button
                                    type="button"
                                    className="explore-post-comment-more"
                                    onClick={() => setCommentActionTarget(comment)}
                                    title="Comment options"
                                >
                                    <MoreHorizontal size={15} />
                                </button>
                            ) : null}
                        </div>
                    </div>
                    <div className="explore-post-comment-meta">
                        <span>{timeAgo(comment.created_at)}</span>
                        {comment.like_count ? (
                            <span>{comment.like_count} {comment.like_count === 1 ? "like" : "likes"}</span>
                        ) : null}
                        <button
                            type="button"
                            onClick={() => setActiveReplyId((prev) => (prev === comment.id ? null : comment.id))}
                        >
                            Reply
                        </button>
                    </div>

                    {activeReplyId === comment.id ? (
                        <div className="explore-post-reply-box">
                            <input
                                type="text"
                                value={replyDrafts[comment.id] || ""}
                                onChange={(event) =>
                                    setReplyDrafts((prev) => ({ ...prev, [comment.id]: event.target.value }))
                                }
                                placeholder={`Reply to @${comment.username}...`}
                                onKeyDown={(event) => event.key === "Enter" && handleReplySubmit(comment.id)}
                            />
                            <button
                                type="button"
                                onClick={() => handleReplySubmit(comment.id)}
                                disabled={!replyDrafts[comment.id]?.trim() || submitting}
                            >
                                Reply
                            </button>
                        </div>
                    ) : null}

                    {comment.replies?.length ? (
                        <button
                            type="button"
                            className="explore-post-view-replies"
                            onClick={() =>
                                setExpandedReplies((prev) => ({
                                    ...prev,
                                    [comment.id]: !prev[comment.id],
                                }))
                            }
                        >
                            <span className="explore-post-view-replies-line" />
                            <span>
                                {expandedReplies[comment.id]
                                    ? "Hide replies"
                                    : `View replies (${countNestedReplies(comment.replies)})`}
                            </span>
                        </button>
                    ) : null}
                </div>
            </div>

            {comment.replies?.length && expandedReplies[comment.id] ? (
                <div className="explore-post-comment-nested">
                    {renderComments(comment.replies, depth + 1)}
                </div>
            ) : null}
        </div>
    ));

    if (!postId) return null;

    return (
        <div className="explore-post-modal-overlay" onClick={onClose}>
            <button type="button" className="explore-post-modal-close" onClick={onClose} aria-label="Close post detail">
                <X size={26} />
            </button>

            {hasPrev ? (
                <button
                    type="button"
                    className="explore-post-modal-nav explore-post-modal-nav--left"
                    onClick={(event) => {
                        event.stopPropagation();
                        onPrev?.();
                    }}
                >
                    <ArrowLeft size={22} />
                </button>
            ) : null}

            {hasNext ? (
                <button
                    type="button"
                    className="explore-post-modal-nav explore-post-modal-nav--right"
                    onClick={(event) => {
                        event.stopPropagation();
                        onNext?.();
                    }}
                >
                    <ArrowRight size={22} />
                </button>
            ) : null}

            <div className="explore-post-modal-shell" onClick={(event) => event.stopPropagation()}>
                {loading ? (
                    <div className="explore-post-modal-state">Loading post...</div>
                ) : error ? (
                    <div className="explore-post-modal-state">{error}</div>
                ) : post ? (
                    <>
                        <div className="explore-post-media-panel">
                            {currentMedia?.type === "video" ? (
                                <video
                                    src={currentMedia.url || currentMedia.media_url}
                                    className="explore-post-media"
                                    controls
                                    playsInline
                                />
                            ) : (
                                <img
                                    src={currentMedia?.url || currentMedia?.media_url}
                                    alt={post.caption || `Post by ${post.username}`}
                                    className="explore-post-media"
                                />
                            )}

                            {mediaList.length > 1 ? (
                                <>
                                    <button
                                        type="button"
                                        className="explore-post-carousel-btn explore-post-carousel-btn--left"
                                        onClick={() =>
                                            setCurrentMediaIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length)
                                        }
                                    >
                                        <ArrowLeft size={18} />
                                    </button>
                                    <button
                                        type="button"
                                        className="explore-post-carousel-btn explore-post-carousel-btn--right"
                                        onClick={() =>
                                            setCurrentMediaIndex((prev) => (prev + 1) % mediaList.length)
                                        }
                                    >
                                        <ArrowRight size={18} />
                                    </button>
                                    <div className="explore-post-carousel-count">
                                        {currentMediaIndex + 1}/{mediaList.length}
                                    </div>
                                </>
                            ) : null}
                        </div>

                        <div className="explore-post-sidebar">
                            <div className="explore-post-sidebar-header">
                                <div className="explore-post-author">
                                    <Link to={`/profile/${post.username}`} className="explore-post-author-link">
                                        <Avatar url={post.avatar_url} alt={post.username} size={34} />
                                        <span>{post.username}</span>
                                    </Link>
                                    {!isOwner ? (
                                        <FollowButton
                                            userId={post.owner_id}
                                            initialIsFollowing={false}
                                            className="explore-post-follow-btn"
                                        />
                                    ) : null}
                                </div>

                                <button
                                    type="button"
                                    className="explore-post-icon-btn"
                                    onClick={() => setShowOptions(true)}
                                >
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>

                            <div className="explore-post-sidebar-scroll">
                                {post.caption ? (
                                    <div className="explore-post-caption-block">
                                        <Link to={`/profile/${post.username}`} className="explore-post-caption-link">
                                            <Avatar url={post.avatar_url} alt={post.username} size={32} />
                                            <div className="explore-post-caption-copy">
                                                <span className="explore-post-comment-username">{post.username}</span>
                                                <span>{post.caption}</span>
                                                <div className="explore-post-caption-time">{timeAgo(post.created_at)}</div>
                                            </div>
                                        </Link>
                                    </div>
                                ) : null}

                                <div className="explore-post-comments">
                                    {comments.length ? renderComments(comments) : (
                                        <div className="explore-post-comments-empty">
                                            No comments yet. Start the conversation.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="explore-post-sidebar-footer">
                                <div className="explore-post-actions">
                                    <div className="explore-post-actions-left">
                                        <button type="button" className="explore-post-icon-btn" onClick={handleToggleLike}>
                                            <Heart
                                                size={24}
                                                fill={liked ? "#ff3040" : "none"}
                                                color={liked ? "#ff3040" : "currentColor"}
                                            />
                                        </button>
                                        <button
                                            type="button"
                                            className="explore-post-icon-btn"
                                            onClick={() => commentInputRef.current?.focus()}
                                        >
                                            <MessageCircle size={24} />
                                        </button>
                                        <button type="button" className="explore-post-icon-btn" onClick={() => setShowShare(true)}>
                                            <Send size={24} />
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        className="explore-post-icon-btn explore-post-icon-btn--muted"
                                        title="Saved posts are not available yet"
                                    >
                                        <Bookmark size={24} />
                                    </button>
                                </div>

                                <div className="explore-post-like-count">{likeCount} likes</div>
                                <div className="explore-post-date">{timeAgo(post.created_at)}</div>

                                <div className="explore-post-comment-form">
                                    <input
                                        ref={commentInputRef}
                                        type="text"
                                        value={newComment}
                                        onChange={(event) => setNewComment(event.target.value)}
                                        onKeyDown={(event) => event.key === "Enter" && handlePostComment()}
                                        placeholder="Add a comment..."
                                        disabled={submitting}
                                    />
                                    <button
                                        type="button"
                                        onClick={handlePostComment}
                                        disabled={!newComment.trim() || submitting}
                                    >
                                        Post
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : null}
            </div>

            <PostOptionsModal
                isOpen={showOptions}
                onClose={() => setShowOptions(false)}
                isOwner={isOwner}
                onDelete={handleDeletePost}
                onEdit={() => {
                    setShowOptions(false);
                    setShowEdit(true);
                }}
                onCopyLink={handleCopyLink}
                onShare={() => {
                    setShowOptions(false);
                    setShowShare(true);
                }}
                onGoToPost={handleGoToPost}
                onAboutAccount={handleAboutAccount}
                onReport={handleReportPost}
            />

            <EditPostModal
                isOpen={showEdit}
                onClose={() => setShowEdit(false)}
                post={post}
                onUpdate={(updatedPost) => {
                    setPost((prev) => ({ ...prev, caption: updatedPost.caption }));
                }}
            />

            <SharePostModal
                isOpen={showShare}
                onClose={() => setShowShare(false)}
                postId={post?.id}
                postUrl={post ? `${window.location.origin}/p/${post.id}` : ""}
                caption={post?.caption || ""}
                username={post?.username || ""}
            />

            {commentActionTarget ? (
                <div className="explore-comment-action-overlay" onClick={() => setCommentActionTarget(null)}>
                    <div className="explore-comment-action-sheet" onClick={(event) => event.stopPropagation()}>
                        <button
                            type="button"
                            className="explore-comment-action-sheet-btn danger"
                            onClick={() => {
                                setCommentActionTarget(null);
                                setReportCommentTarget(commentActionTarget);
                            }}
                        >
                            Report
                        </button>
                        <button
                            type="button"
                            className="explore-comment-action-sheet-btn"
                            onClick={() => setCommentActionTarget(null)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : null}

            <ReportModal
                isOpen={Boolean(reportCommentTarget)}
                targetName={reportCommentTarget?.username || ""}
                targetLabel="comment"
                title="Report comment"
                question="Why are you reporting this comment?"
                onClose={() => setReportCommentTarget(null)}
                onSubmit={handleReportComment}
                submitting={reportingComment}
            />

            <ReportModal
                isOpen={showPostReport}
                targetName={post?.username || ""}
                targetLabel="post"
                title="Report post"
                question="Why are you reporting this post?"
                onClose={() => setShowPostReport(false)}
                onSubmit={handleSubmitPostReport}
                submitting={reportingPost}
            />

            <AboutAccountModal
                isOpen={showAboutAccount}
                username={post?.username || ""}
                onClose={() => setShowAboutAccount(false)}
            />
        </div>
    );
}
