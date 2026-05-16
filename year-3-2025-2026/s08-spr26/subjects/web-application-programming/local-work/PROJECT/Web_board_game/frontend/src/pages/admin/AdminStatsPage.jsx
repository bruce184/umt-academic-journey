import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';

const formatGrowthDay = (value) => {
    if (!value) {
        return 'Unknown date';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value).split('T')[0];
    }

    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const AdminStatsPage = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadStats = async () => {
            try {
                const response = await adminService.getStats();
                setData(response.data);
            } catch (loadError) {
                setError(loadError.message);
            }
        };

        loadStats();
    }, []);

    if (error) {
        return <div className="glass-panel error-message">{error}</div>;
    }

    if (!data) {
        return <div className="glass-panel page-center-state">Loading admin statistics...</div>;
    }

    return (
        <div className="content-grid two-column-grid">
            <section className="glass-panel page-panel">
                <div className="section-heading">
                    <div>
                        <span className="section-kicker">Popularity</span>
                        <h2>Games by sessions</h2>
                    </div>
                </div>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {data.gamePopularity.map((item) => (
                        <div key={item.name} className="stat-card">
                            <strong>{item.name}</strong>
                            <span className="stat-label">{item.playCount} sessions</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="glass-panel page-panel">
                <div className="section-heading">
                    <div>
                        <span className="section-kicker">Review spread</span>
                        <h2>Ratings distribution</h2>
                    </div>
                </div>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {data.reviewDistribution.map((item) => (
                        <div key={item.rating} className="stat-card">
                            <strong>{item.rating} star</strong>
                            <span className="stat-label">{item.total} reviews</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="glass-panel page-panel">
                <div className="section-heading">
                    <div>
                        <span className="section-kicker">Growth</span>
                        <h2>Accounts by day</h2>
                    </div>
                </div>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {data.accountGrowth.map((item) => (
                        <div key={item.day} className="stat-card">
                            <strong>{formatGrowthDay(item.day)}</strong>
                            <span className="stat-label">{item.users} users created</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="glass-panel page-panel">
                <div className="section-heading">
                    <div>
                        <span className="section-kicker">Totals</span>
                        <h2>Platform snapshot</h2>
                    </div>
                </div>
                <div className="stat-grid">
                    <div className="stat-card">
                        <span className="stat-label">Unique players</span>
                        <strong>{data.totals.uniquePlayers}</strong>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Total sessions</span>
                        <strong>{data.totals.totalSessions}</strong>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AdminStatsPage;
