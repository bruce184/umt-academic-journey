import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../lib/cropUtils";

export default function AvatarEditorModal({ isOpen, imageUrl, onCancel, onApply }) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [loading, setLoading] = useState(false);

    const onCropComplete = useCallback((_croppedArea, areaPixels) => {
        setCroppedAreaPixels(areaPixels);
    }, []);

    const handleApply = async () => {
        if (!imageUrl || !croppedAreaPixels) return;

        setLoading(true);
        try {
            const blob = await getCroppedImg(imageUrl, croppedAreaPixels);
            await onApply(blob);
            setCrop({ x: 0, y: 0 });
            setZoom(1);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !imageUrl) return null;

    return (
        <div className="modal-overlay">
            <div
                style={{
                    width: "min(90vw, 720px)",
                    height: "min(85vh, 640px)",
                    background: "var(--surface)",
                    color: "var(--text-main)",
                    border: "1px solid var(--border)",
                    borderRadius: 18,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "16px 20px",
                        borderBottom: "1px solid var(--border)",
                    }}
                >
                    <button className="header-btn cancel" onClick={onCancel}>Cancel</button>
                    <strong>Edit avatar</strong>
                    <button className="header-btn" onClick={handleApply} disabled={loading}>
                        {loading ? "Applying..." : "Apply"}
                    </button>
                </div>

                <div style={{ flex: 1, position: "relative", background: "var(--background-elevated)" }}>
                    <Cropper
                        image={imageUrl}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                    />
                </div>

                <div
                    style={{
                        display: "flex",
                        gap: 12,
                        alignItems: "center",
                        padding: "16px 20px",
                        borderTop: "1px solid var(--border)",
                    }}
                >
                    <label htmlFor="avatar-zoom" style={{ minWidth: 48, fontWeight: 600 }}>Zoom</label>
                    <input
                        id="avatar-zoom"
                        type="range"
                        min={1}
                        max={3}
                        step={0.1}
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        style={{ flex: 1 }}
                    />
                    <button className="header-btn cancel" onClick={() => { setCrop({ x: 0, y: 0 }); setZoom(1); }}>
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
}
