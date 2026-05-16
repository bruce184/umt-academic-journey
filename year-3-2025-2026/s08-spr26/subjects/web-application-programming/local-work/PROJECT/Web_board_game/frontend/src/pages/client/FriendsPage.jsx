import React, { useEffect, useState } from 'react';
import PlayerCard from '../../components/social/PlayerCard';
import {
    acceptFriendRequest,
    deleteFriendRequest,
    getFriendRequests,
    getFriends,
    removeFriend,
    sendFriendRequest,
} from '../../services/friendService';
import { searchUsers } from '../../services/userService';

const FRIEND_PAGE_SIZE = 6;
const SEARCH_PAGE_SIZE = 4;

const FriendsPage = () => {
    const [friends, setFriends] = useState([]);
    const [friendPagination, setFriendPagination] = useState({
        page: 1,
        pageSize: FRIEND_PAGE_SIZE,
        totalItems: 0,
        totalPages: 1,
    });
    const [requests, setRequests] = useState({
        incoming: [],
        outgoing: [],
        counts: {
            incoming: 0,
            outgoing: 0,
        },
    });
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [actionKey, setActionKey] = useState('');
    const [error, setError] = useState('');
    const [feedback, setFeedback] = useState('');
    const normalizedQuery = query.trim();

    const loadFriends = async (page = 1) => {
        const data = await getFriends({ page, pageSize: FRIEND_PAGE_SIZE });
        setFriends(data.data.items);
        setFriendPagination(data.data.pagination);
    };

    const loadRequests = async () => {
        const data = await getFriendRequests();
        setRequests(data.data);
    };

    const loadPageData = async (page = 1) => {
        setLoading(true);
        setError('');

        try {
            await Promise.all([loadFriends(page), loadRequests()]);
        } catch (err) {
            setError(err.message || 'Failed to load social data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPageData(1);
    }, []);

    const handleFriendPageChange = async (page) => {
        setFeedback('');
        await loadPageData(page);
    };

    const loadSearchResults = async ({ searchTerm = query, showSpinner = true } = {}) => {
        const trimmedQuery = String(searchTerm || '').trim();

        if (!trimmedQuery) {
            setSearchResults([]);
            return;
        }

        if (showSpinner) {
            setSearching(true);
        }

        try {
            const data = await searchUsers({
                query: trimmedQuery,
                page: 1,
                pageSize: SEARCH_PAGE_SIZE,
            });

            setSearchResults(data.data.items);
        } finally {
            if (showSpinner) {
                setSearching(false);
            }
        }
    };

    const handleSearchSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setFeedback('');

        try {
            await loadSearchResults({ searchTerm: query, showSpinner: true });
        } catch (err) {
            setError(err.message || 'Failed to search users');
        }
    };

    const runAction = async (key, action, successMessage) => {
        setActionKey(key);
        setError('');
        setFeedback('');

        try {
            await action();
            setFeedback(successMessage);

            const refreshTasks = [loadFriends(friendPagination.page), loadRequests()];
            if (normalizedQuery) {
                refreshTasks.push(loadSearchResults({ searchTerm: normalizedQuery, showSpinner: false }));
            }

            await Promise.all(refreshTasks);
        } catch (err) {
            setError(err.message || 'Action failed');
        } finally {
            setActionKey('');
        }
    };

    const incomingRequests = requests.incoming || [];
    const outgoingRequests = requests.outgoing || [];

    return (
        <div className="content-grid single-column-grid">
            <section className="page-panel glass-panel">
                <div className="section-heading">
                    <div>
                        <span className="section-kicker">Friends</span>
                        <h2>Manage your social graph</h2>
                    </div>
                    <div className="social-summary-chips">
                        <span className="video-meta-chip">Friends: {friendPagination.totalItems}</span>
                        <span className="video-meta-chip">Incoming: {requests.counts?.incoming || 0}</span>
                        <span className="video-meta-chip">Outgoing: {requests.counts?.outgoing || 0}</span>
                    </div>
                </div>

                <p className="muted-copy">
                    Send requests from the search panel, accept incoming invites, and keep your playable friends list paginated.
                </p>

                {error && <div className="error-message">{error}</div>}
                {feedback && <div className="success-message">{feedback}</div>}
            </section>

            <section className="page-panel glass-panel">
                <div className="section-heading">
                    <div>
                        <span className="section-kicker">Add Players</span>
                        <h2>Search and send requests</h2>
                    </div>
                </div>

                <form onSubmit={handleSearchSubmit} className="inline-form">
                    <input
                        type="text"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search by username, display name, or location"
                    />
                    <button type="submit" disabled={searching}>
                        {searching ? 'Searching...' : 'Search'}
                    </button>
                </form>

                {searchResults.length > 0 ? (
                    <div className="user-card-grid">
                        {searchResults.map((player) => {
                            let actions = (
                                <button
                                    type="button"
                                    className="control-btn enter-btn"
                                    disabled={actionKey === `request-${player.id}`}
                                    onClick={() =>
                                        runAction(
                                            `request-${player.id}`,
                                            () => sendFriendRequest(player.id),
                                            `Friend request sent to ${player.displayName || player.username}.`
                                        )
                                    }
                                >
                                    {actionKey === `request-${player.id}` ? 'Sending...' : 'Send Request'}
                                </button>
                            );

                            if (player.relationship === 'friend') {
                                actions = (
                                    <button type="button" className="control-btn nav-btn" disabled>
                                        Friends
                                    </button>
                                );
                            } else if (player.relationship === 'incoming_request' && player.pendingRequestId) {
                                actions = (
                                    <>
                                        <button
                                            type="button"
                                            className="control-btn enter-btn"
                                            disabled={actionKey === `accept-search-${player.pendingRequestId}`}
                                            onClick={() =>
                                                runAction(
                                                    `accept-search-${player.pendingRequestId}`,
                                                    () => acceptFriendRequest(player.pendingRequestId),
                                                    `You are now friends with ${player.displayName || player.username}.`
                                                )
                                            }
                                        >
                                            {actionKey === `accept-search-${player.pendingRequestId}`
                                                ? 'Accepting...'
                                                : 'Accept'}
                                        </button>
                                        <button
                                            type="button"
                                            className="control-btn nav-btn"
                                            disabled={actionKey === `reject-search-${player.pendingRequestId}`}
                                            onClick={() =>
                                                runAction(
                                                    `reject-search-${player.pendingRequestId}`,
                                                    () => deleteFriendRequest(player.pendingRequestId),
                                                    `Request from ${player.displayName || player.username} was rejected.`
                                                )
                                            }
                                        >
                                            {actionKey === `reject-search-${player.pendingRequestId}`
                                                ? 'Rejecting...'
                                                : 'Reject'}
                                        </button>
                                    </>
                                );
                            } else if (player.relationship === 'outgoing_request' && player.pendingRequestId) {
                                actions = (
                                    <button
                                        type="button"
                                        className="control-btn action-btn"
                                        disabled={actionKey === `cancel-search-${player.pendingRequestId}`}
                                        onClick={() =>
                                            runAction(
                                                `cancel-search-${player.pendingRequestId}`,
                                                () => deleteFriendRequest(player.pendingRequestId),
                                                `Friend request to ${player.displayName || player.username} was cancelled.`
                                            )
                                        }
                                    >
                                        {actionKey === `cancel-search-${player.pendingRequestId}`
                                            ? 'Removing...'
                                            : 'Remove Request'}
                                    </button>
                                );
                            }

                            return (
                                <PlayerCard
                                    key={player.id}
                                    player={player}
                                    subtitle={player.bio || 'No bio yet.'}
                                    meta={[
                                        { label: 'Location', value: player.location || 'Unknown' },
                                        { label: 'Favorite', value: player.favoriteGame || 'Not set' },
                                    ]}
                                    actions={actions}
                                />
                            );
                        })}
                    </div>
                ) : query && !searching ? (
                    <div className="page-center-state social-empty-state">
                        <p>No players matched that search.</p>
                    </div>
                ) : null}
            </section>

            <div className="content-grid two-column-grid social-two-column friends-page-layout">
                <section className="page-panel glass-panel">
                    <div className="section-heading">
                        <div>
                            <span className="section-kicker">Current Friends</span>
                            <h2>Paginated friend list</h2>
                        </div>
                    </div>

                    {loading ? (
                        <div className="page-center-state">
                            <p>Loading friends...</p>
                        </div>
                    ) : friends.length === 0 ? (
                        <div className="page-center-state social-empty-state">
                            <p>No friends connected yet.</p>
                        </div>
                    ) : (
                        <div className="user-card-grid">
                            {friends.map((friend) => (
                                <PlayerCard
                                    key={friend.id}
                                    player={friend}
                                    subtitle={friend.bio || 'This friend has not added a bio yet.'}
                                    meta={[
                                        {
                                            label: 'Connected',
                                            value: friend.connectedAt
                                                ? new Date(friend.connectedAt).toLocaleDateString()
                                                : 'Unknown',
                                        },
                                        { label: 'Favorite', value: friend.favoriteGame || 'Not set' },
                                    ]}
                                    actions={
                                        <button
                                            type="button"
                                            className="control-btn action-btn"
                                            disabled={actionKey === `remove-${friend.id}`}
                                            onClick={() =>
                                                runAction(
                                                    `remove-${friend.id}`,
                                                    () => removeFriend(friend.id),
                                                    `${friend.displayName || friend.username} was removed from your friends list.`
                                                )
                                            }
                                        >
                                            {actionKey === `remove-${friend.id}` ? 'Removing...' : 'Remove Friend'}
                                        </button>
                                    }
                                />
                            ))}
                        </div>
                    )}

                    <div className="pagination-row">
                        <button
                            type="button"
                            className="control-btn nav-btn pagination-btn"
                            onClick={() => handleFriendPageChange(friendPagination.page - 1)}
                            disabled={loading || friendPagination.page <= 1}
                        >
                            Previous
                        </button>
                        <span className="pagination-meta">
                            Page {friendPagination.page} / {friendPagination.totalPages} ({friendPagination.totalItems} friends)
                        </span>
                        <button
                            type="button"
                            className="control-btn nav-btn pagination-btn"
                            onClick={() => handleFriendPageChange(friendPagination.page + 1)}
                            disabled={loading || friendPagination.page >= friendPagination.totalPages}
                        >
                            Next
                        </button>
                    </div>
                </section>

                <section className="page-panel glass-panel">
                    <div className="section-heading">
                        <div>
                            <span className="section-kicker">Requests</span>
                            <h2>Incoming and outgoing</h2>
                        </div>
                    </div>

                    <div className="social-request-block">
                        <h3>Incoming</h3>
                        {incomingRequests.length === 0 ? (
                            <p className="muted-copy">No incoming requests right now.</p>
                        ) : (
                            <div className="social-stack-list">
                                {incomingRequests.map((request) => (
                                    <PlayerCard
                                        key={request.id}
                                        player={request.user}
                                        subtitle={request.user.bio || 'No bio yet.'}
                                        meta={[
                                            {
                                                label: 'Sent',
                                                value: request.createdAt
                                                    ? new Date(request.createdAt).toLocaleString()
                                                    : 'Unknown',
                                            },
                                            { label: 'Favorite', value: request.user.favoriteGame || 'Not set' },
                                        ]}
                                        actions={
                                            <>
                                                <button
                                                    type="button"
                                                    className="control-btn enter-btn"
                                                    disabled={actionKey === `accept-${request.id}`}
                                                    onClick={() =>
                                                        runAction(
                                                            `accept-${request.id}`,
                                                            () => acceptFriendRequest(request.id),
                                                            `You are now friends with ${request.user.displayName || request.user.username}.`
                                                        )
                                                    }
                                                >
                                                    {actionKey === `accept-${request.id}` ? 'Accepting...' : 'Accept'}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="control-btn nav-btn"
                                                    disabled={actionKey === `reject-${request.id}`}
                                                    onClick={() =>
                                                        runAction(
                                                            `reject-${request.id}`,
                                                            () => deleteFriendRequest(request.id),
                                                            `Request from ${request.user.displayName || request.user.username} was rejected.`
                                                        )
                                                    }
                                                >
                                                    {actionKey === `reject-${request.id}` ? 'Rejecting...' : 'Reject'}
                                                </button>
                                            </>
                                        }
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="social-request-block">
                        <h3>Outgoing</h3>
                        {outgoingRequests.length === 0 ? (
                            <p className="muted-copy">No outgoing requests pending.</p>
                        ) : (
                            <div className="social-stack-list">
                                {outgoingRequests.map((request) => (
                                    <PlayerCard
                                        key={request.id}
                                        player={request.user}
                                        subtitle={request.user.bio || 'No bio yet.'}
                                        meta={[
                                            {
                                                label: 'Sent',
                                                value: request.createdAt
                                                    ? new Date(request.createdAt).toLocaleString()
                                                    : 'Unknown',
                                            },
                                            { label: 'Location', value: request.user.location || 'Unknown' },
                                        ]}
                                        actions={
                                            <button
                                                type="button"
                                                className="control-btn action-btn"
                                                disabled={actionKey === `cancel-${request.id}`}
                                                onClick={() =>
                                                    runAction(
                                                        `cancel-${request.id}`,
                                                        () => deleteFriendRequest(request.id),
                                                        `Friend request to ${request.user.displayName || request.user.username} was cancelled.`
                                                    )
                                                }
                                            >
                                                {actionKey === `cancel-${request.id}` ? 'Removing...' : 'Remove Request'}
                                            </button>
                                        }
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default FriendsPage;
