import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { gameService } from '../../services/gameService';
import { rankingService } from '../../services/rankingService';
import { formatDuration } from '../../hooks/games/gameUtils';

const PAGE_SIZE = 8;

const SCOPE_OPTIONS = [
    { value: 'global', label: 'Global' },
    { value: 'friends', label: 'Friends' },
    { value: 'me', label: 'Personal' },
];

const getMetricMeta = (game) => {
    if (!game) {
        return {
            label: 'Best Score',
            readValue: (item) => item.best_score ?? 0,
            formatValue: (value) => value,
        };
    }

    switch (game.score_type) {
        case 'time':
            return {
                label: 'Best Time',
                readValue: (item) => item.best_time ?? 0,
                formatValue: (value) => formatDuration(Number(value || 0)),
            };
        case 'none':
            return {
                label: 'Last Played',
                readValue: (item) => item.last_played,
                formatValue: (value) =>
                    value ? new Date(value).toLocaleString() : 'No recent session',
            };
        case 'wins':
            return {
                label: 'Best Result',
                readValue: (item) => item.best_score ?? 0,
                formatValue: (value) => `${value} pts`,
            };
        case 'score':
        default:
            return {
                label: 'High Score',
                readValue: (item) => item.best_score ?? 0,
                formatValue: (value) => `${value} pts`,
            };
    }
};

const RankingsPage = () => {
    const location = useLocation();
    const { user } = useAuth();
    const [games, setGames] = useState([]);
    const [selectedGameId, setSelectedGameId] = useState('');
    const [scope, setScope] = useState('global');
    const [items, setItems] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: PAGE_SIZE,
        totalItems: 0,
        totalPages: 1,
    });
    const [loadingGames, setLoadingGames] = useState(true);
    const [loadingRankings, setLoadingRankings] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const initialGameId = queryParams.get('gameId');

        const loadGames = async () => {
            setLoadingGames(true);
            setError('');

            try {
                const response = await gameService.getAllGames();
                setGames(response);

                const preferredGame =
                    response.find((game) => game.id === initialGameId) ||
                    response.find((game) => game.is_active !== false) ||
                    response[0];

                if (preferredGame) {
                    setSelectedGameId(preferredGame.id);
                }
            } catch (loadError) {
                setError(loadError.message || 'Failed to load available games');
            } finally {
                setLoadingGames(false);
            }
        };

        loadGames();
    }, [location.search]);

    useEffect(() => {
        if (!selectedGameId) {
            return;
        }

        const loadRankings = async () => {
            setLoadingRankings(true);
            setError('');

            try {
                const response = await rankingService.getRankings(
                    selectedGameId,
                    scope,
                    pagination.page,
                    PAGE_SIZE
                );

                setItems(response.items || []);
                setPagination({
                    page: response.page || 1,
                    pageSize: response.pageSize || PAGE_SIZE,
                    totalItems: response.totalItems || 0,
                    totalPages: response.totalPages || 1,
                });
            } catch (loadError) {
                setError(loadError.message || 'Failed to load rankings');
            } finally {
                setLoadingRankings(false);
            }
        };

        loadRankings();
    }, [pagination.page, scope, selectedGameId]);

    const activeGame = useMemo(
        () => games.find((game) => game.id === selectedGameId) || null,
        [games, selectedGameId]
    );
    const metricMeta = useMemo(() => getMetricMeta(activeGame), [activeGame]);

    const handleGameChange = (event) => {
        setSelectedGameId(event.target.value);
        setPagination((current) => ({
            ...current,
            page: 1,
        }));
    };

    const handleScopeChange = (nextScope) => {
        setScope(nextScope);
        setPagination((current) => ({
            ...current,
            page: 1,
        }));
    };

    return (
        <div className="content-grid single-column-grid">
            <section className="page-panel glass-panel">
                <div className="section-heading">
                    <div>
                        <span className="section-kicker">Rankings</span>
                        <h2>Filter standings by game and scope</h2>
                    </div>
                    <div className="social-summary-chips">
                        <span className="video-meta-chip">
                            Game: {activeGame?.name || 'Loading'}
                        </span>
                        <span className="video-meta-chip">Scope: {scope}</span>
                        <span className="video-meta-chip">
                            Metric: {metricMeta.label}
                        </span>
                    </div>
                </div>

                <p className="muted-copy">
                    Use this page to show global standings, friend-only positions, and your personal results per game.
                </p>

                {error && <div className="error-message">{error}</div>}

                <div className="ranking-toolbar">
                    <label className="ranking-filter-field">
                        <span>Game</span>
                        <select
                            className="social-select"
                            value={selectedGameId}
                            onChange={handleGameChange}
                            disabled={loadingGames || games.length === 0}
                        >
                            {games.map((game) => (
                                <option key={game.id} value={game.id}>
                                    {game.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <div className="ranking-scope-group">
                        {SCOPE_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className={`control-btn ${
                                    scope === option.value ? 'enter-btn' : 'nav-btn'
                                }`}
                                onClick={() => handleScopeChange(option.value)}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section className="page-panel glass-panel">
                <div className="section-heading">
                    <div>
                        <span className="section-kicker">Leaderboard</span>
                        <h2>{activeGame ? `${activeGame.name} standings` : 'Standings'}</h2>
                    </div>
                </div>

                {loadingRankings ? (
                    <div className="page-center-state social-empty-state">
                        <p>Loading rankings...</p>
                    </div>
                ) : items.length === 0 ? (
                    <div className="page-center-state social-empty-state">
                        <p>No ranking data is available for this filter yet.</p>
                    </div>
                ) : (
                    <div className="ranking-list">
                        {items.map((entry, index) => {
                            const rankNumber =
                                (pagination.page - 1) * pagination.pageSize + index + 1;
                            const rawValue = metricMeta.readValue(entry);
                            const isCurrentUser =
                                entry.isCurrentUser || (user && entry.user_id === user.id);

                            return (
                                <article key={`${entry.user_id}-${rankNumber}`} className="ranking-card">
                                    <div className="ranking-rank-badge">#{rankNumber}</div>
                                    <div className="ranking-card-main">
                                        <strong>
                                            {entry.username}
                                            {isCurrentUser ? ' (You)' : ''}
                                        </strong>
                                        <span className="muted-copy">{metricMeta.label}</span>
                                    </div>
                                    <div className="ranking-card-score">
                                        {metricMeta.formatValue(rawValue)}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}

                <div className="pagination-row">
                    <button
                        type="button"
                        className="control-btn nav-btn pagination-btn"
                        disabled={loadingRankings || pagination.page <= 1}
                        onClick={() =>
                            setPagination((current) => ({
                                ...current,
                                page: current.page - 1,
                            }))
                        }
                    >
                        Previous
                    </button>
                    <span className="pagination-meta">
                        Page {pagination.page} / {pagination.totalPages} ({pagination.totalItems} entries)
                    </span>
                    <button
                        type="button"
                        className="control-btn nav-btn pagination-btn"
                        disabled={loadingRankings || pagination.page >= pagination.totalPages}
                        onClick={() =>
                            setPagination((current) => ({
                                ...current,
                                page: current.page + 1,
                            }))
                        }
                    >
                        Next
                    </button>
                </div>
            </section>
        </div>
    );
};

export default RankingsPage;
