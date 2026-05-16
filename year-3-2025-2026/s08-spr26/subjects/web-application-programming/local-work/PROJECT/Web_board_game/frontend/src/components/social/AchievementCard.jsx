import React from 'react';

const AchievementCard = ({ achievement }) => {
    return (
        <article className={`achievement-card${achievement.isUnlocked ? ' achievement-card-unlocked' : ''}`}>
            <div className="achievement-card-header">
                <div>
                    <span className="section-kicker">{achievement.category}</span>
                    <h3>{achievement.name}</h3>
                </div>
                <span className={`achievement-pill${achievement.isUnlocked ? ' achievement-pill-unlocked' : ''}`}>
                    {achievement.isUnlocked ? 'Unlocked' : 'In progress'}
                </span>
            </div>

            <p className="muted-copy">{achievement.description}</p>

            <div className="achievement-progress-row">
                <div className="achievement-progress-track" aria-hidden="true">
                    <div
                        className="achievement-progress-fill"
                        style={{ width: `${achievement.progressPercent}%` }}
                    />
                </div>
                <span className="achievement-progress-meta">
                    {achievement.progressValue} / {achievement.goalValue}
                </span>
            </div>

            <div className="achievement-card-footer">
                <span>Metric: {achievement.metricKey.split('_').join(' ')}</span>
                <span>
                    {achievement.unlockedAt
                        ? `Earned ${new Date(achievement.unlockedAt).toLocaleDateString()}`
                        : 'Not unlocked yet'}
                </span>
            </div>
        </article>
    );
};

export default AchievementCard;
