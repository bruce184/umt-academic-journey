import { useState, useRef, useEffect, useCallback } from "react";
import Cropper from "react-easy-crop";
import { ImagePlus, Images, X } from "lucide-react";
import getCroppedImg from "../lib/cropUtils";
import { uploadPostMedia } from "../lib/storage";
import { supabase } from "../lib/supabase";
import Avatar from "./Avatar";
import { useToast } from "./ToastProvider";
import "../styles/CreatePost.css";

export default function CreatePostModal({ isOpen, onClose, onPostCreated }) {
    const [step, setStep] = useState(0); // 0: Select, 1: Crop, 2: Details

    // Multi-File State
    const [originalFiles, setOriginalFiles] = useState([]); // Array of { id, file, url }
    const [currentIndex, setCurrentIndex] = useState(0); // Which image we are cropping
    const [croppedImages, setCroppedImages] = useState({}); // Map id -> { blob, url }

    // Cropper State (per image)
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const [caption, setCaption] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const toast = useToast();

    const fileInputRef = useRef(null);

    // Fetch user info
    useEffect(() => {
        if (isOpen) {
            // Reset
            setStep(0);
            setOriginalFiles([]);
            setCroppedImages({});
            setCurrentIndex(0);
            setCaption("");
            setCrop({ x: 0, y: 0 });
            setZoom(1);
            // Fetch User...
            (async () => {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/me`, {
                        headers: { Authorization: `Bearer ${session.access_token}` },
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setCurrentUser(data.data);
                    }
                }
            })();
        }
    }, [isOpen]);

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    // Save current crop and move to next or finish
    const handleSaveCrop = async () => {
        try {
            const currentObj = originalFiles[currentIndex];
            if (!currentObj || !croppedAreaPixels) return;
            const croppedBlob = await getCroppedImg(currentObj.url, croppedAreaPixels);

            // Save to state
            const croppedUrl = URL.createObjectURL(croppedBlob);
            setCroppedImages(prev => ({
                ...prev,
                [currentObj.id]: { blob: croppedBlob, url: croppedUrl }
            }));

            // Auto advance
            if (currentIndex < originalFiles.length - 1) {
                setCurrentIndex(currentIndex + 1);
                // Reset cropper for next image
                setCrop({ x: 0, y: 0 });
                setZoom(1);
            } else {
                // Done cropping all? Or just stay here?
                // Let's stay and allow review. User clicks "Next" to go to Step 2
            }
        } catch (e) {
            console.error("Crop failed", e);
        }
    };

    const handleNextToDetails = async () => {
        // Ensure current is saved if not already? 
        // For simplicity, we enforce hitting "Next" saves the current one too if needed.
        // But better flow: User crops each one. If they haven't cropped one, we might just use center crop or force them.
        // Let's assume we just trigger save for current one then go.
        await handleSaveCrop();
        setStep(2);
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files)
                .filter(f => f.type.startsWith("image/"))
                .map((f, i) => ({
                    id: Date.now() + i, // simple ID
                    file: f,
                    url: URL.createObjectURL(f)
                }));

            setOriginalFiles(newFiles);
            setCurrentIndex(0);
            setCrop({ x: 0, y: 0 });
            setZoom(1);
            setStep(1);
        }
    };

    const handleResetCrop = () => {
        setCrop({ x: 0, y: 0 });
        setZoom(1);
    };

    const handleShare = async () => {
        if (Object.keys(croppedImages).length === 0) return;
        setLoading(true);
        try {
            // Upload ALL images
            const mediaPayload = [];

            // Preserving order of originalFiles
            for (let i = 0; i < originalFiles.length; i++) {
                const fObj = originalFiles[i];
                const cropped = croppedImages[fObj.id];
                if (!cropped) continue; // Should warn or fail?

                // Upload
                const { publicUrl, path } = await uploadPostMedia(new File([cropped.blob], fObj.file.name, { type: fObj.file.type }));

                mediaPayload.push({
                    media_type: "image",
                    media_url: publicUrl,
                    media_path: path,
                    position: i
                });
            }

            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/posts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    caption,
                    media: mediaPayload
                })
            });

            if (!res.ok) throw new Error("Create post failed");
            onClose();
            if (onPostCreated) onPostCreated();
            toast.success("Post shared successfully");

        } catch (e) {
            console.error(e);
            toast.error(e?.message || "Failed to share post.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const currentFile = originalFiles[currentIndex];
    const currentPreview = croppedImages[originalFiles[currentIndex]?.id]?.url || currentFile?.url || "";
    const stepClassName = step === 0
        ? "create-post-container--select"
        : step === 1
            ? "create-post-container--crop"
            : "create-post-container--details";

    return (
        <div className="modal-overlay" onClick={onClose}>
            <button className="modal-close-btn" onClick={onClose} aria-label="Close create post modal">
                <X size={26} />
            </button>

            <div className={`create-post-container ${stepClassName}`} onClick={(e) => e.stopPropagation()}>
                {/* HEADER */}
                <div className="create-post-header">
                    {step === 0 && <span>Create new post</span>}
                    {step === 1 && (
                        <>
                            <button className="header-btn cancel" onClick={() => setStep(0)}>Back</button>
                            <span>Crop {originalFiles.length ? `${currentIndex + 1}/${originalFiles.length}` : ""}</span>
                            <button className="header-btn" onClick={handleNextToDetails}>Next</button>
                        </>
                    )}
                    {step === 2 && (
                        <>
                            <button className="header-btn cancel" onClick={() => setStep(1)}>Back</button>
                            <span>Create new post</span>
                            <button className="header-btn" onClick={handleShare} disabled={loading}>
                                {loading ? "Sharing..." : "Share"}
                            </button>
                        </>
                    )}
                </div>

                {/* BODY */}
                <div className="create-post-body">
                    {/* STEP 0: SELECT */}
                    {step === 0 && (
                        <div className="select-file-view">
                            <div className="select-file-icon">
                                <ImagePlus size={42} />
                            </div>
                            <p className="select-file-title">Create a new post</p>
                            <p className="select-file-subtitle">Choose one or more photos to crop, preview and share.</p>
                            <button className="select-file-btn" onClick={() => fileInputRef.current.click()}>
                                Select from computer
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple // ALLOW MULTIPLE
                                hidden
                                onChange={handleFileChange}
                            />
                        </div>
                    )}

                    {/* STEP 1: CROP */}
                    {step === 1 && currentFile && (
                        <div className="create-post-crop-layout">
                            {/* Main Cropper */}
                            <div className="create-post-cropper-stage">
                                <Cropper
                                    key={currentFile.id} // Reset cropper when switching images
                                    image={currentFile.url}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}
                                    onCropChange={setCrop}
                                    onCropComplete={onCropComplete}
                                    onZoomChange={setZoom}
                                    showGrid={true}
                                />
                                <div className="create-post-thumb-strip">
                                    {originalFiles.map((f, idx) => (
                                        <div
                                            key={f.id}
                                            onClick={async () => {
                                                await handleSaveCrop();
                                                setCurrentIndex(idx);
                                                setCrop({ x: 0, y: 0 });
                                                setZoom(1);
                                            }}
                                            className={`create-post-thumb ${idx === currentIndex ? "active" : ""}`}
                                            style={{ backgroundImage: `url(${f.url})` }}
                                        />
                                    ))}
                                    <button
                                        onClick={() => fileInputRef.current.click()}
                                        className="create-post-thumb create-post-thumb-add"
                                    >
                                        <Images size={18} />
                                    </button>
                                </div>

                                <div className="create-post-crop-actions">
                                    <button className="header-btn cancel" onClick={onClose}>Cancel</button>
                                    <button className="header-btn cancel" onClick={handleResetCrop}>Reset</button>
                                    <button className="header-btn" onClick={handleSaveCrop}>Apply</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: DETAILS */}
                    {step === 2 && (
                        <div className="details-view">
                            <div className="details-image-section">
                                <img
                                    src={currentPreview}
                                    className="crop-image"
                                    alt="Preview"
                                />
                                {originalFiles.length > 1 && (
                                    <>
                                        <div className="create-post-preview-count">
                                            {currentIndex + 1}/{originalFiles.length}
                                        </div>
                                        <div className="create-post-preview-dots">
                                            {originalFiles.map((f, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => setCurrentIndex(idx)}
                                                    className={`create-post-preview-dot ${idx === currentIndex ? "active" : ""}`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="details-form-section">
                                <div className="details-user-info">
                                    <Avatar
                                        url={currentUser?.profile?.avatar_url}
                                        alt={currentUser?.profile?.username || "Avatar"}
                                        size={32}
                                        className="details-avatar"
                                    />
                                    <span className="details-username">{currentUser?.profile?.username || "username"}</span>
                                </div>
                                <textarea
                                    className="details-caption"
                                    placeholder="Write a caption..."
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    maxLength={2200}
                                />
                                <div className="details-caption-footer">
                                    <span>{caption.length}/2,200</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
