import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadPostMedia } from "../lib/storage";
import { supabase } from "../lib/supabase";
import MainLayout from "../layouts/MainLayout";
import "../styles/NewPost.css";

export default function NewPost() {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [caption, setCaption] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (!selected) return;

        // Basic client validation
        if (!selected.type.startsWith("image/")) {
            setError("Please select an image file");
            return;
        }

        setFile(selected);
        setError("");

        // Create preview
        const objectUrl = URL.createObjectURL(selected);
        setPreview(objectUrl);
    };

    const handleShare = async () => {
        if (!file) {
            setError("Please select an image");
            return;
        }

        try {
            setLoading(true);
            setError("");

            // 1. Upload to Storage
            const { publicUrl, path } = await uploadPostMedia(file);

            // 2. Create Post in Backend
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) throw new Error("You must be logged in");

            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/posts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    caption,
                    media: [
                        {
                            media_type: "image",
                            media_url: publicUrl,
                            media_path: path,
                            position: 0
                        }
                    ]
                })
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Failed to create post");
            }

            // Success
            navigate("/feed");

        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to share post");
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="new-post-container">
                <h2>Create new post</h2>

                {/* File Picker / Preview */}
                <div className="new-post-dropzone">
                    {preview ? (
                        <img src={preview} alt="Preview" className="new-post-preview-image" />
                    ) : (
                        <div className="new-post-upload-prompt">
                            <p>Drag photos and videos here</p>
                            <label htmlFor="file-upload" className="new-post-file-label">
                                Select from computer
                            </label>
                            <input
                                id="file-upload"
                                type="file"
                                accept="image/*"
                                className="hidden-input"
                                onChange={handleFileChange}
                            />
                        </div>
                    )}
                </div>

                {/* Caption */}
                <textarea
                    placeholder="Write a caption..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="new-post-caption-input"
                    maxLength={2200}
                    disabled={loading}
                />

                {/* Error */}
                {error && <p className="new-post-error">{error}</p>}

                {/* Actions */}
                <div className="new-post-actions">
                    <button
                        onClick={() => navigate("/feed")}
                        className="new-post-btn--cancel"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleShare}
                        disabled={loading || !file}
                        className="new-post-btn--submit"
                    >
                        {loading ? "Sharing..." : "Share"}
                    </button>
                </div>
            </div>
        </MainLayout>
    );
}
