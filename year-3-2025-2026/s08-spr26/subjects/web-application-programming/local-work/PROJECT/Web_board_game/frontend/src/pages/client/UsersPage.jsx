import React, { useEffect, useState } from 'react';
import { searchUsers } from '../../services/userService';

const UsersPage = () => {
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 6,
        totalItems: 0,
        totalPages: 1,
    });

    const fetchUsers = async (page = 1, activeQuery = query) => {
        setLoading(true);
        setError('');

        try {
            const data = await searchUsers({
                query: activeQuery,
                page,
                pageSize: pagination.pageSize,
            });

            setUsers(data.data.items);
            setPagination(data.data.pagination);
        } catch (err) {
            setError(err.message || 'Failed to search users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(1, '');
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        await fetchUsers(1, query);
    };

    const handlePageChange = async (nextPage) => {
        await fetchUsers(nextPage, query);
    };

    return (
        <div className="content-grid single-column-grid">
            <section className="page-panel glass-panel">
                <div className="section-heading">
                    <div>
                        <span className="section-kicker">User Search</span>
                        <h2>Find other players</h2>
                    </div>
                    <p className="muted-copy">Search by username, display name, location, or favorite game.</p>
                </div>

                <form onSubmit={handleSubmit} className="inline-form">
                    <input
                        type="text"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search players..."
                    />
                    <button type="submit">Search</button>
                </form>

                {error && <div className="error-message">{error}</div>}

                {loading ? (
                    <div className="page-center-state">
                        <p>Loading players...</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="page-center-state">
                        <p>No users match your search.</p>
                    </div>
                ) : (
                    <div className="user-card-grid users-search-list">
                        {users.map((player) => (
                            <article key={player.id} className="user-card users-search-card">
                                <div className="user-card-heading">
                                    <div className="user-card-avatar">
                                        {player.profilePicture ? (
                                            <img src={player.profilePicture} alt={player.displayName} className="profile-avatar-image" />
                                        ) : (
                                            (player.displayName || player.username).slice(0, 1).toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <h3>{player.displayName || player.username}</h3>
                                        <p className="muted-copy">@{player.username}</p>
                                    </div>
                                </div>

                                <p className="user-card-copy">{player.bio || 'This player has not added a bio yet.'}</p>

                                <dl className="user-card-meta">
                                    <div>
                                        <dt>Location</dt>
                                        <dd>{player.location || 'Unknown'}</dd>
                                    </div>
                                    <div>
                                        <dt>Favorite Game</dt>
                                        <dd>{player.favoriteGame || 'Not set'}</dd>
                                    </div>
                                    <div>
                                        <dt>Role</dt>
                                        <dd>{player.role}</dd>
                                    </div>
                                    <div>
                                        <dt>Joined</dt>
                                        <dd>{player.createdAt ? new Date(player.createdAt).toLocaleDateString() : 'N/A'}</dd>
                                    </div>
                                </dl>
                            </article>
                        ))}
                    </div>
                )}

                <div className="pagination-row">
                    <button
                        type="button"
                        className="control-btn nav-btn pagination-btn"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1 || loading}
                    >
                        Previous
                    </button>
                    <span className="pagination-meta">
                        Page {pagination.page} / {pagination.totalPages} ({pagination.totalItems} players)
                    </span>
                    <button
                        type="button"
                        className="control-btn nav-btn pagination-btn"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages || loading}
                    >
                        Next
                    </button>
                </div>
            </section>
        </div>
    );
};

export default UsersPage;
