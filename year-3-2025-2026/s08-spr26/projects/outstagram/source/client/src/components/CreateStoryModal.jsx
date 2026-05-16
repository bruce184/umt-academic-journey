import { useState, useRef } from "react";
import { uploadStoryMedia } from "../lib/storyStorage";
import { supabase } from "../lib/supabase";
import { X, ImagePlus, Loader2, Sparkles, Film, Image as ImageIcon } from "lucide-react";
import "../styles/Stories.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default function CreateStoryModal({ isOpen, onClose, onStoryCreated }) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [mediaType, setMediaType] = useState("image");
    const [caption, setCaption] = useState("");
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const inputRef = useRef(null);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setError("");
        const isVideo = f.type.startsWith("video/");
        setMediaType(isVideo ? "video" : "image");
        setFile(f);
        setPreview(URL.createObjectURL(f));
    };

    const handleSubmit = async () => {
        if (!file) return;
        setUploading(true);
        setError("");

        try {
            // 1. Upload to Supabase Storage
            const { publicUrl, path, mediaType: type } = await uploadStoryMedia(file);

            // 2. Create story via API
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_BASE}/api/v1/stories`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({
                    mediaUrl: publicUrl,
                    mediaPath: path,
                    mediaType: type,
                    caption: caption.trim() || null,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data?.error?.message || "Failed to create story");
            }

            // Success
            setFile(null);
            setPreview(null);
            setCaption("");
            onStoryCreated?.();
            onClose();
        } catch (e) {
            setError(e.message);
        } finally {
            setUploading(false);
        }
    };

    const reset = () => {
        setFile(null);
        setPreview(null);
        setCaption("");
        setError("");
        onClose();
    };

    return (
        <div className="create-story-overlay" onClick={reset}>
            <div className="create-story-modal" onClick={e => e.stopPropagation()}>
                <div className="create-story-header">
                    <div className="create-story-heading">
                        <div className="create-story-kicker">
                            <Sparkles size={14} />
                            Story composer
                        </div>
                        <h3>Create story</h3>
                        <p>Share a quick photo or video update with your followers.</p>
                    </div>
                    <button className="create-story-close" onClick={reset} aria-label="Close story composer"><X size={20} /></button>
                </div>
                <div className="create-story-body">
                    <div
                        className="create-story-dropzone"
                        onClick={() => inputRef.current?.click()}
                    >
                        {preview ? (
                            mediaType === "video"
                                ? <video src={preview} muted autoPlay loop />
                                : <img src={preview} alt="Preview" />
                        ) : (
                            <div className="create-story-empty">
                                <div className="create-story-empty-icon">
                                    <ImagePlus size={34} />
                                </div>
                                <strong>Select a photo or video</strong>
                                <span>Vertical visuals work best for story layout.</span>
                                <div className="create-story-empty-actions">
                                    <span><ImageIcon size={14} /> Photos</span>
                                    <span><Film size={14} /> Videos</span>
                                </div>
                            </div>
                        )}
                        {preview ? (
                            <div className="create-story-preview-badge">
                                {mediaType === "video" ? <><Film size={14} /> Video story</> : <><ImageIcon size={14} /> Photo story</>}
                            </div>
                        ) : null}
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                        />
                    </div>

                    <textarea
                        className="create-story-caption"
                        placeholder="Add a caption (optional, max 200)"
                        value={caption}
                        onChange={e => setCaption(e.target.value.slice(0, 200))}
                        rows={3}
                    />

                    <div className="create-story-meta">
                        <span>{preview ? "Ready to share" : "No media selected yet"}</span>
                        <span>{caption.length}/200</span>
                    </div>

                    {error && <div className="create-story-error">{error}</div>}

                    <div className="create-story-actions">
                        <button type="button" className="create-story-secondary" onClick={() => inputRef.current?.click()}>
                            {preview ? "Change media" : "Choose file"}
                        </button>
                        <button
                            className="create-story-submit"
                            onClick={handleSubmit}
                            disabled={!file || uploading}
                            type="button"
                        >
                            {uploading ? <><Loader2 size={16} className="spinning" /> Sharing...</> : "Share story"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
