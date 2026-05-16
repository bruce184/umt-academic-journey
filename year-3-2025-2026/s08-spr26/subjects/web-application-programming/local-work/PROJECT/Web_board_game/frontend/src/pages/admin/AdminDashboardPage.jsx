import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { adminService } from '../../services/adminService';

const AdminDashboardPage = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const response = await adminService.getDashboard();
                setData(response.data);
            } catch (loadError) {
                setError(loadError.message);
            }
        };

        loadDashboard();
    }, []);

    if (error) {
        return <div className="glass-panel error-message">{error}</div>;
    }

    if (!data) {
        return <div className="glass-panel page-center-state">Loading dashboard metrics...</div>;
    }

    const cards = [
        { label: 'Total users', value: data.totalUsers },
        { label: 'Active users', value: data.activeUsers },
        { label: 'Total sessions', value: data.totalSessions },
        { label: 'Average rating', value: data.averageRating.toFixed(2) },
    ];

    return (
        <div className="content-grid single-column-grid">
            <section className="glass-panel page-panel">
                <div className="section-heading">
                    <div>
                        <span className="section-kicker">Admin Overview</span>
                        <h2>System dashboard</h2>
                    </div>
                    <p className="muted-copy">
                        Hottest game: {data.hottestGame ? `${data.hottestGame.name} (${data.hottestGame.playCount} plays)` : 'No session data yet'}
                    </p>
                </div>

                <div className="stat-grid">
                    {cards.map((card) => (
                        <article key={card.label} className="stat-card">
                            <span className="stat-label">{card.label}</span>
                            <strong style={{ fontSize: '2rem' }}>{card.value}</strong>
                        </article>
                    ))}
                </div>
            </section>

            <section className="glass-panel page-panel">
                <div className="section-heading">
                    <div>
                        <span className="section-kicker">Recently created</span>
                        <h2>Latest users</h2>
                    </div>
                </div>

                <div className="user-card-grid">
                    {data.recentUsers.map((user) => (
                        <article key={user.id} className="user-card">
                            <div className="user-card-heading">
                                <div className="user-card-avatar user-card-avatar-muted">
                                    <User size={22} />
                                </div>
                                <div>
                                    <h3>{user.username}</h3>
                                    <p className="muted-copy">{user.email}</p>
                                </div>
                            </div>
                            <dl className="user-card-meta">
                                <div>
                                    <dt>Role</dt>
                                    <dd>{user.role}</dd>
                                </div>
                                <div>
                                    <dt>Status</dt>
                                    <dd>{user.is_active ? 'Enabled' : 'Disabled'}</dd>
                                </div>
                            </dl>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default AdminDashboardPage;
