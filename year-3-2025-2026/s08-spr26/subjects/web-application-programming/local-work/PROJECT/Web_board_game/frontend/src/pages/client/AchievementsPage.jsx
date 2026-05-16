import React, { useEffect, useRef, useState } from 'react';
import AchievementCard from '../../components/social/AchievementCard';
import { getMyAchievements } from '../../services/achievementService';

const AchievementsPage = () => {
    const [items, setItems] = useState([]);
    const [summary, setSummary] = useState({
        total: 0,
        unlocked: 0,
        locked: 0,
        completionPercent: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const hasLoadedRef = useRef(false);

    useEffect(() => {
        if (hasLoadedRef.current) {
            return;
        }

        hasLoadedRef.current = true;

        const loadAchievements = async () => {
            setLoading(true);
            setError('');

            try {
                const data = await getMyAchievements();
                setItems(data.data.items);
                setSummary(data.data.summary);
            } catch (err) {
                setError(err.message || 'Failed to load achievements');
            } finally {
                setLoading(false);
            }
        };

        loadAchievements();
    }, []);

    return (
        <div className="content-grid single-column-grid">
            <section className="page-panel glass-panel">
                <div className="section-heading">
                    <div>
                        <span className="section-kicker">Achievements</span>
                        <h2>Track seeded progress and unlocks</h2>
                    </div>
                    <div className="social-summary-chips">
                        <span className="video-meta-chip">Unlocked: {summary.unlocked}</span>
                        <span className="video-meta-chip">Locked: {summary.locked}</span>
                        <span className="video-meta-chip">Completion: {summary.completionPercent}%</span>
                    </div>
                </div>

                <p className="muted-copy">
                    Social achievements are tied to sending requests, building friendships, and keeping conversations active.
                </p>
            </section>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <section className="page-panel glass-panel page-center-state">
                    <p>Loading achievements...</p>
                </section>
            ) : (
                <>
                    <section className="page-panel glass-panel">
                        <div className="stat-grid social-stat-grid">
                            <div className="stat-card">
                                <span className="stat-label">Total Achievements</span>
                                <strong>{summary.total}</strong>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Unlocked</span>
                                <strong>{summary.unlocked}</strong>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Locked</span>
                                <strong>{summary.locked}</strong>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Completion</span>
                                <strong>{summary.completionPercent}%</strong>
                            </div>
                        </div>
                    </section>

                    <section className="page-panel glass-panel">
                        {items.length === 0 ? (
                            <div className="page-center-state social-empty-state">
                                <p>No achievements found.</p>
                            </div>
                        ) : (
                            <div className="achievement-grid">
                                {items.map((achievement) => (
                                    <AchievementCard key={achievement.id} achievement={achievement} />
                                ))}
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
};

export default AchievementsPage;
