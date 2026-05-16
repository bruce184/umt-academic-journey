import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';

const AdminGamesPage = () => {
    const [games, setGames] = useState([]);
    const [drafts, setDrafts] = useState({});
    const [error, setError] = useState('');

    const loadGames = async () => {
        try {
            setError('');
            const response = await adminService.getGames();
            setGames(response.items);
            setDrafts(
                Object.fromEntries(
                    response.items.map((game) => [
                        game.id,
                        {
                            board_size: game.board_size,
                            default_timer: game.default_timer,
                            score_type: game.score_type,
                            instructions: game.instructions || '',
                        },
                    ])
                )
            );
        } catch (loadError) {
            setError(loadError.message);
        }
    };

    useEffect(() => {
        loadGames();
    }, []);

    const updateDraft = (gameId, field, value) => {
        setDrafts((current) => ({
            ...current,
            [gameId]: {
                ...current[gameId],
                [field]: value,
            },
        }));
    };

    const saveGame = async (gameId, payload) => {
        try {
            await adminService.updateGame(gameId, payload);
            await loadGames();
        } catch (saveError) {
            setError(saveError.message);
        }
    };

    return (
        <div className="content-grid single-column-grid">
            <section className="glass-panel page-panel">
                <div className="section-heading">
                    <div>
                        <span className="section-kicker">Game management</span>
                        <h2>Playable catalogue</h2>
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="admin-game-list">
                    {games.map((game) => (
                        <article key={game.id} className="admin-game-row">
                            <div className="admin-game-row-header">
                                <div className="admin-game-row-main">
                                    <div className="admin-user-row-title">
                                        <h3>{game.name}</h3>
                                        <span className="admin-user-chip">{game.is_active ? 'Active' : 'Disabled'}</span>
                                    </div>
                                    <p className="muted-copy">
                                        Board {game.board_size} x {game.board_size} | Timer {game.default_timer}s | Mode {game.score_type}
                                    </p>
                                </div>
                                <dl className="user-card-meta admin-game-row-meta">
                                    <div>
                                        <dt>Play count</dt>
                                        <dd>{game.play_count}</dd>
                                    </div>
                                    <div>
                                        <dt>Average rating</dt>
                                        <dd>{game.average_rating.toFixed(2)}</dd>
                                    </div>
                                </dl>
                            </div>

                            <div className="admin-game-row-form">
                                <div className="admin-game-settings-grid">
                                    <label className="admin-game-field">
                                        <span>Board size</span>
                                        <input
                                            type="number"
                                            value={drafts[game.id]?.board_size ?? game.board_size}
                                            onChange={(event) => updateDraft(game.id, 'board_size', Number(event.target.value))}
                                            placeholder="Board size"
                                        />
                                    </label>
                                    <label className="admin-game-field">
                                        <span>Default timer</span>
                                        <input
                                            type="number"
                                            value={drafts[game.id]?.default_timer ?? game.default_timer}
                                            onChange={(event) => updateDraft(game.id, 'default_timer', Number(event.target.value))}
                                            placeholder="Default timer"
                                        />
                                    </label>
                                    <label className="admin-game-field">
                                        <span>Score mode</span>
                                        <select
                                            value={drafts[game.id]?.score_type ?? game.score_type}
                                            onChange={(event) => updateDraft(game.id, 'score_type', event.target.value)}
                                            style={selectStyle}
                                        >
                                            <option value="wins">wins</option>
                                            <option value="score">score</option>
                                            <option value="time">time</option>
                                            <option value="none">none</option>
                                        </select>
                                    </label>
                                </div>
                                <label className="admin-game-field">
                                    <span>Instructions</span>
                                    <textarea
                                        value={drafts[game.id]?.instructions ?? ''}
                                        onChange={(event) => updateDraft(game.id, 'instructions', event.target.value)}
                                        placeholder="Instructions"
                                    />
                                </label>
                            </div>

                            <div className="admin-user-row-actions">
                                <button
                                    type="button"
                                    className="control-btn nav-btn admin-action-btn"
                                    onClick={() => saveGame(game.id, { is_active: !game.is_active })}
                                >
                                    {game.is_active ? 'Disable' : 'Enable'}
                                </button>
                                <button
                                    type="button"
                                    className="control-btn enter-btn admin-action-btn"
                                    onClick={() => saveGame(game.id, drafts[game.id])}
                                >
                                    Save settings
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
};

const selectStyle = {
    background: 'var(--bg-secondary)',
    border: '2px solid var(--glass-border)',
    borderRadius: '12px',
    padding: '0.75rem 1rem',
    color: 'var(--text-primary)',
};

export default AdminGamesPage;
