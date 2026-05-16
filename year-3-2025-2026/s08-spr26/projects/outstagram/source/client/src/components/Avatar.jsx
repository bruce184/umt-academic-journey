import React from 'react';
import { User } from 'lucide-react';
import '../styles/Avatar.css';

const Avatar = ({ url, alt, size = 40, className = '' }) => {
    // If URL is explicitly null/undefined/empty string, show placeholder
    const hasImage = !!url && url !== "https://via.placeholder.com/150" && !url.includes("via.placeholder");

    return (
        <div
            className={`avatar-container ${className}`}
            style={{ width: size, height: size }}
            title={alt}
        >
            {hasImage ? (
                <img
                    src={url}
                    alt={alt}
                    className="avatar-image"
                    onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                    }}
                />
            ) : (
                <div className="avatar-placeholder">
                    <User size={size * 0.6} />
                </div>
            )}
            {/* Fallback for error handling structure if needed, but the conditional above handles mostly. 
                The onError trick above renders the sibling if image fails loading. 
            */}
            {hasImage && (
                <div className="avatar-placeholder" style={{ display: 'none' }}>
                    <User size={size * 0.6} />
                </div>
            )}
        </div>
    );
};

export default Avatar;
