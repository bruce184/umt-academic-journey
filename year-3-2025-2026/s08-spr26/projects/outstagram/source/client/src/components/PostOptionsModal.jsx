import React from "react";
import "../styles/PostOptionsModal.css";

export default function PostOptionsModal({
    isOpen,
    onClose,
    isOwner,
    onDelete,
    onEdit,
    onCopyLink,
    onShare,
    onGoToPost,
    onAboutAccount,
    onReport,
}) {
    if (!isOpen) return null;

    const ownerActions = [
        onDelete ? { key: "delete", label: "Delete", className: "delete", onClick: onDelete } : null,
        onEdit ? { key: "edit", label: "Edit", onClick: onEdit } : null,
        onGoToPost ? { key: "goto", label: "Go to post", onClick: onGoToPost } : null,
        onShare ? { key: "share", label: "Share to...", onClick: onShare } : null,
        onCopyLink ? { key: "copy", label: "Copy link", onClick: onCopyLink } : null,
    ].filter(Boolean);

    const viewerActions = [
        onReport ? { key: "report", label: "Report", className: "danger", onClick: onReport } : null,
        onGoToPost ? { key: "goto", label: "Go to post", onClick: onGoToPost } : null,
        onShare ? { key: "share", label: "Share to...", onClick: onShare } : null,
        onCopyLink ? { key: "copy", label: "Copy link", onClick: onCopyLink } : null,
        onAboutAccount ? { key: "about", label: "About this account", onClick: onAboutAccount } : null,
    ].filter(Boolean);

    const actions = isOwner ? ownerActions : viewerActions;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="options-modal" onClick={e => e.stopPropagation()}>
                {actions.map((action) => (
                    <button
                        key={action.key}
                        className={`option-btn ${action.className || ""}`}
                        onClick={action.onClick}
                    >
                        {action.label}
                    </button>
                ))}
                <button className="option-btn cancel" onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
}
