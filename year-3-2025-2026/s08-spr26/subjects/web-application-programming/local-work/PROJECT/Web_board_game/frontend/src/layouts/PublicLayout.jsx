import React from 'react';
import { Outlet } from 'react-router-dom';
import ThemeToggle from '../components/layout/ThemeToggle';

const PublicLayout = () => {
    return (
        <div className="public-shell">
            <div className="public-header">
                <ThemeToggle />
            </div>
            <Outlet />
        </div>
    );
};

export default PublicLayout;
