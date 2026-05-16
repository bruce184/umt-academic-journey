import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { MapPin, Users, ChevronDown } from "lucide-react";
import Avatar from "./Avatar";
import { useToast } from "./ToastProvider";
import "../styles/EditPostModal.css";

export default function EditPostModal({ isOpen, onClose, post, onUpdate }) {
    const [caption, setCaption] = useState(post?.caption || "");
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    if (!isOpen || !post) return null;

    const firstMedia = post.media && post.media.length > 0 ? post.media[0] : null;

    const handleSave = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/posts/${post.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ caption })
            });

            if (res.ok) {
                const data = await res.json();
                onUpdate(data.post); // Pass updated post back
                onClose();
            } else {
                toast.error("Failed to update post");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error updating post");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="edit-post-container">
                {/* Header */}
                <div className="edit-post-header">
                    <button className="header-btn cancel" onClick={onClose}>Cancel</button>
                    <span>Edit info</span>
                    <button className="header-btn" style={{ color: "var(--primary)", fontWeight: 600 }} onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : "Done"}
                    </button>
                </div>

                {/* Body - Split View */}
                <div className="edit-post-body">
                    {/* Left: Media */}
                    <div className="edit-post-media">
                        {firstMedia ? (
                            <img src={firstMedia.url} alt="Post" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                            <div style={{ color: 'var(--text-main)' }}>No Media</div>
                        )}
                    </div>

                    {/* Right: Form */}
                    <div className="edit-post-form">
                        <div className="form-user">
                            <Avatar
                                url={post.avatar_url}
                                alt={post.username}
                                size={32}
                                className="edit-post-avatar-preview"
                            />
                            <span style={{ fontWeight: 600 }}>{post.username}</span>
                        </div>
                        <textarea
                            className="form-caption"
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="Write a caption..."
                            maxLength={2200}
                        />
                        <div style={{ flex: 1 }}></div> {/* Spacer */}
                        <div style={{ padding: '15px 0', borderTop: '1px solid var(--border)' }}>
                            <div className="form-row">
                                <span>Add location</span>
                                <MapPin size={16} />
                            </div>
                            <div className="form-row">
                                <span>Add collaborators</span>
                                <Users size={16} />
                            </div>
                            <div className="form-row">
                                <span>Accessibility</span>
                                <ChevronDown size={16} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
