import React from 'react';
import { useAuth } from '../context/AuthContext';

const AdminHome = () => {
    const { user, logout } = useAuth();
    return (
        <div className="home-container">
            <h1 className="home-title" style={{ color: 'var(--accent-primary)' }}>Admin Dashboard</h1>
            <p>This is the <strong>Admin Home Page</strong>. Confirming admin access for {user?.username}.</p>
            <button onClick={logout} style={{ marginTop: '2rem', padding: '0.5rem 1.5rem', background: '#ccc', color: '#000' }}>
                Logout
            </button>
        </div>
    );
};

export default AdminHome;
