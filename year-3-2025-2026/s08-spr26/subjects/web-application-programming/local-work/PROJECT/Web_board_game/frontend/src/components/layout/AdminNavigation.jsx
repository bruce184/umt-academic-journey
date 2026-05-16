import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const links = [
    { to: '/admin', label: 'Dashboard', roles: ['admin'] },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/games', label: 'Games', roles: ['admin'] },
    { to: '/admin/stats', label: 'Stats', roles: ['admin'] },
    { to: '/admin/api-docs', label: 'API Docs', roles: ['admin'] },
];

const AdminNavigation = () => {
    const { user } = useAuth();
    const visibleLinks = links.filter((link) => !link.roles || link.roles.includes(user?.role));

    return (
        <nav className="shell-nav admin-shell-nav" aria-label="Admin navigation">
            {visibleLinks.map((link) => (
                <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/admin'}
                    className={({ isActive }) => `shell-nav-link admin-shell-nav-link${isActive ? ' shell-nav-link-active' : ''}`}
                >
                    {link.label}
                </NavLink>
            ))}
        </nav>
    );
};

export default AdminNavigation;
