import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

const AdminUsersPage = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ totalPages: 1, totalItems: 0 });
    const [search, setSearch] = useState('');
    const [role, setRole] = useState('');
    const [active, setActive] = useState('');
    const [error, setError] = useState('');

    const loadUsers = async () => {
        try {
            setError('');
            const response = await adminService.getUsers({ page, pageSize: 8, search, role, active });
            setUsers(response.items);
            setMeta({
                totalPages: response.totalPages,
                totalItems: response.totalItems,
            });
        } catch (loadError) {
            setError(loadError.message);
        }
    };

    useEffect(() => {
        loadUsers();
    }, [page, search, role, active]);

    const patchUser = async (userId, payload) => {
        try {
            await adminService.updateUser(userId, payload);
            await loadUsers();
        } catch (patchError) {
            setError(patchError.message);
        }
    };

    const getRoleAction = (targetUser) => {
        const isSelf = currentUser?.id === targetUser.id;

        if (currentUser?.role !== 'admin' || isSelf || targetUser.role === 'admin') {
            return null;
        }

        if (targetUser.role === 'moderator') {
            return {
                label: 'Demote to user',
                payload: { role: 'user' },
            };
        }

        if (targetUser.role === 'user') {
            return {
                label: 'Promote moderator',
                payload: { role: 'moderator' },
            };
        }

        return null;
    };

    const canToggleActive = (targetUser) => {
        const isSelf = currentUser?.id === targetUser.id;

        if (isSelf) {
            return false;
        }

        if (currentUser?.role === 'admin') {
            return true;
        }

        return currentUser?.role === 'moderator' && targetUser.role === 'user';
    };

    return (
        <div className="content-grid single-column-grid">
            <section className="glass-panel page-panel">
                <div className="section-heading">
                    <div>
                        <span className="section-kicker">User management</span>
                        <h2>Accounts</h2>
                    </div>
                    <span className="admin-users-matched">{meta.totalItems} users matched</span>
                </div>

                <div className="admin-filter-bar">
                    <input className="admin-input" value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} placeholder="Search username or email" />
                    <select className="admin-select" value={role} onChange={(event) => { setPage(1); setRole(event.target.value); }}>
                        <option value="">All roles</option>
                        <option value="admin">Admin</option>
                        <option value="moderator">Moderator</option>
                        <option value="user">User</option>
                    </select>
                    <select className="admin-select" value={active} onChange={(event) => { setPage(1); setActive(event.target.value); }}>
                        <option value="">All statuses</option>
                        <option value="true">Enabled</option>
                        <option value="false">Disabled</option>
                    </select>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="admin-user-list">
                    {users.map((user) => {
                        const isSelf = currentUser?.id === user.id;
                        const roleAction = getRoleAction(user);

                        return (
                            <article key={user.id} className="admin-user-row">
                                <div className="admin-user-row-main">
                                    <div className="user-card-avatar user-card-avatar-muted admin-user-row-avatar">
                                        <User size={20} />
                                    </div>
                                    <div className="admin-user-row-identity">
                                        <div className="admin-user-row-title">
                                            <h3>{user.username}</h3>
                                            {isSelf && <span className="admin-user-chip">You</span>}
                                        </div>
                                        <p className="muted-copy">{user.email}</p>
                                    </div>
                                </div>

                                <div className="admin-user-row-stat">
                                    <span className="admin-row-label">Role</span>
                                    <strong>{user.role}</strong>
                                </div>

                                <div className="admin-user-row-stat">
                                    <span className="admin-row-label">Status</span>
                                    <strong>{user.is_active ? 'Enabled' : 'Disabled'}</strong>
                                </div>

                                <div className="admin-user-row-actions">
                                    {roleAction && (
                                        <button
                                            type="button"
                                            className="control-btn enter-btn admin-action-btn"
                                            onClick={() => patchUser(user.id, roleAction.payload)}
                                        >
                                            {roleAction.label}
                                        </button>
                                    )}
                                    {canToggleActive(user) && (
                                        <button
                                            type="button"
                                            className="control-btn nav-btn admin-action-btn"
                                            onClick={() => patchUser(user.id, { is_active: !user.is_active })}
                                        >
                                            {user.is_active ? 'Disable' : 'Enable'}
                                        </button>
                                    )}
                                    {isSelf && <span className="admin-row-note">Current account</span>}
                                </div>
                            </article>
                        );
                    })}
                </div>

                <div className="pagination-row">
                    <span className="pagination-meta">Page {page} of {meta.totalPages || 1}</span>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button type="button" className="control-btn nav-btn pagination-btn" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
                            Previous
                        </button>
                        <button type="button" className="control-btn nav-btn pagination-btn" disabled={page >= (meta.totalPages || 1)} onClick={() => setPage((current) => current + 1)}>
                            Next
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AdminUsersPage;
