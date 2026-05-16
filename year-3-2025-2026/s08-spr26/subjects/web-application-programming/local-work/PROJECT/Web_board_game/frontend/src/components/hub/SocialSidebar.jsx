import React from 'react';
import { useAuth } from '../../context/AuthContext';

const SocialSidebar = () => {
    const { user, logout } = useAuth();
    
    return (
        <div className="hub-sidebar left-sidebar">
            <div className="profile-section glass-panel" style={{ textAlign: 'center' }}>
                <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)', marginBottom: '1rem', overflow: 'hidden' }}>
                    <h2 style={{ margin: 0, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.username}</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 'bold', fontSize: '0.9rem' }}>Rank</span>
                        <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '0.9rem' }}>Beginner</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 'bold', fontSize: '0.9rem' }}>Achievement</span>
                        <span style={{ color: 'var(--accent-secondary)', fontWeight: 'bold', fontSize: '0.9rem' }}>0 / 12</span>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button className="control-btn nav-btn" style={{ width: '100%', padding: '0.5rem' }}>My Profile</button>
                    <button onClick={logout} className="control-btn action-btn" style={{ width: '100%', padding: '0.5rem' }}>Logout</button>
                </div>
            </div>


            
            <div className="friends-section glass-panel" style={{ flex: 1 }}>
                <h4>Friends & Chat</h4>
                <div className="placeholder-list" style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <p>No friends online.</p>
                </div>
            </div>
        </div>
    );
};

export default SocialSidebar;
