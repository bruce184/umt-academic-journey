import React from 'react';

const renderAvatar = (player) => {
    if (player.profilePicture) {
        return <img src={player.profilePicture} alt={player.displayName} className="profile-avatar-image" />;
    }

    return (player.displayName || player.username || 'U').slice(0, 1).toUpperCase();
};

const PlayerCard = ({ player, meta = [], actions = null, subtitle = null }) => {
    return (
        <article className="user-card social-card">
            <div className="user-card-heading">
                <div className="user-card-avatar">{renderAvatar(player)}</div>
                <div>
                    <h3>{player.displayName || player.username}</h3>
                    <p className="muted-copy">@{player.username}</p>
                </div>
            </div>

            {subtitle ? <p className="user-card-copy">{subtitle}</p> : null}

            {meta.length > 0 ? (
                <dl className="user-card-meta">
                    {meta.map((item) => (
                        <div key={item.label}>
                            <dt>{item.label}</dt>
                            <dd>{item.value}</dd>
                        </div>
                    ))}
                </dl>
            ) : null}

            {actions ? <div className="social-card-actions">{actions}</div> : null}
        </article>
    );
};

export default PlayerCard;
