import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GameMatrix from '../../components/hub/GameMatrix';
import GameControls from '../../components/hub/GameControls';
import { gameService } from '../../services/gameService';
import { reviewService } from '../../services/reviewService';
import { usePhysicalControls } from '../../hooks/games/engine/usePhysicalControls';
import { normalizeGameKey } from '../../hooks/games/gameUtils';
import { useTicTacToeGame } from '../../hooks/games/useTicTacToeGame';
import { useCaro5Game } from '../../hooks/games/useCaro5Game';
import { useCaro4Game } from '../../hooks/games/useCaro4Game';
import { useSnakeGame } from '../../hooks/games/useSnakeGame';
import { useMatch3Game } from '../../hooks/games/useMatch3Game';
import { useMemoryGame } from '../../hooks/games/useMemoryGame';
import { useDrawGame } from '../../hooks/games/useDrawGame';

const resolveGameKey = (gameMeta, routeId) => normalizeGameKey(gameMeta?.name || routeId);

const GameRuntimeShell = ({ gameMeta, gameId, useGameHook }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sideSelectionModal, setSideSelectionModal] = useState(null);
    const [exitConfirmModal, setExitConfirmModal] = useState(null);
    const [gameOverModal, setGameOverModal] = useState(null);
    const [hintModal, setHintModal] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const handleGameOver = async (resultFlag, currentScore = 0, currentDuration = 0) => {
        setIsPlaying(false);

        try {
            await gameService.submitSession(gameId, currentScore, currentDuration);
            await gameService.deleteProgress(gameId);
        } catch (error) {
            console.error('Failed to submit session on game over', error);
        }

        setGameOverModal({
            title: resultFlag === 'DRAW' ? 'Draw' : resultFlag === 'WIN' ? 'Victory!' : 'Defeat',
            statsText: `Score: ${currentScore} | Time: ${currentDuration}s`,
            onPlayAgain: () => {
                setGameOverModal(null);
                startFreshRound();
            },
            onQuit: () => navigate('/hub'),
        });
    };

    const gameInstance = useGameHook({ onGameOver: handleGameOver, gameMeta });

    const startFreshRound = () => {
        if (!gameInstance.requiresSideSelection) {
            gameInstance.reset();
            setIsPlaying(true);
            return;
        }

        setSideSelectionModal({
            onSelect: (side) => {
                gameInstance.reset(side);
                setIsPlaying(true);
                setSideSelectionModal(null);
            },
            onCancel: () => navigate('/hub'),
        });
    };

    useEffect(() => {
        const initGame = async () => {
            try {
                const queryParams = new URLSearchParams(location.search);
                const shouldLoad = queryParams.get('load') === 'true';

                if (shouldLoad) {
                    try {
                        const save = await gameService.loadProgress(gameId);

                        if (save && save.state) {
                            gameInstance.loadState(save.state);
                            await gameService.deleteProgress(gameId);
                            setIsPlaying(true);
                            return;
                        }
                    } catch (error) {
                        if (error.status !== 404) {
                            throw error;
                        }
                    }

                    if (!gameInstance.isDirty) {
                        startFreshRound();
                    }
                } else {
                    startFreshRound();
                }
            } catch (error) {
                console.error('Failed to initialize game runtime', error);
                navigate('/hub');
            }
        };

        initGame();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameId, location.search]);

    const handleLeft = () => {
        if (gameOverModal || exitConfirmModal || sideSelectionModal || hintModal) return;
        if (isPlaying) gameInstance.handleLeft?.();
    };

    const handleRight = () => {
        if (gameOverModal || exitConfirmModal || sideSelectionModal || hintModal) return;
        if (isPlaying) gameInstance.handleRight?.();
    };

    const handleUp = () => {
        if (gameOverModal || exitConfirmModal || sideSelectionModal || hintModal) return;
        if (isPlaying) gameInstance.handleUp?.();
    };

    const handleDown = () => {
        if (gameOverModal || exitConfirmModal || sideSelectionModal || hintModal) return;
        if (isPlaying) gameInstance.handleDown?.();
    };

    const handleEnter = () => {
        if (gameOverModal || exitConfirmModal || sideSelectionModal || hintModal) return;
        if (isPlaying) {
            gameInstance.handleEnter?.();
        }
    };

    const handleBack = () => {
        if (gameOverModal || exitConfirmModal || sideSelectionModal || hintModal) return;

        if (!gameInstance.isDirty) {
            navigate('/hub');
            return;
        }

        setExitConfirmModal({
            title: 'Save progress and exit?',
            desc: 'If you discard now, the current run will be lost.',
            onSave: async () => {
                await gameService.saveProgress(gameId, gameInstance.getState());
                navigate('/hub');
            },
            onDiscard: async () => {
                await gameService.deleteProgress(gameId);
                navigate('/hub');
            },
            onCancel: () => setExitConfirmModal(null),
        });
    };

    const handleHint = () => {
        if (gameOverModal || exitConfirmModal || sideSelectionModal || hintModal) return;

        const resolvedBoardSize = gameInstance.runtimeConfig?.boardSize ?? gameMeta?.board_size;
        const resolvedTimer = gameInstance.runtimeConfig?.defaultTimer ?? gameMeta?.default_timer ?? 0;

        setHintModal({
            title: `${gameMeta?.name || 'Game'} Guide`,
            summary: gameInstance.guideSummary || gameInstance.instructions,
            facts: [
                { label: 'Score Type', value: gameMeta?.score_type || 'N/A' },
                { label: 'Board Size', value: resolvedBoardSize ? `${resolvedBoardSize}x${resolvedBoardSize}` : 'N/A' },
                { label: 'Default Timer', value: resolvedTimer ? `${resolvedTimer}s` : 'No limit' },
            ],
            sections:
                gameInstance.guideSections || [
                    {
                        title: 'How To Play',
                        body: gameInstance.instructions,
                    },
                ],
            onClose: () => setHintModal(null),
        });
    };

    usePhysicalControls(
        {
            onLeft: handleLeft,
            onRight: handleRight,
            onUp: handleUp,
            onDown: handleDown,
            onEnter: handleEnter,
            onBack: handleBack,
            onHint: handleHint,
        },
        true
    );

    return (
        <div className="video-hub-shell">
            <div className="video-stage">
                <GameMatrix gridPixels={gameInstance.gridPixels} showSideIndicators={false} />

                <GameControls
                    onLeft={handleLeft}
                    onRight={handleRight}
                    onUp={handleUp}
                    onDown={handleDown}
                    onEnter={handleEnter}
                    onBack={handleBack}
                    onHint={handleHint}
                    showDirectionalPad={true}
                />

                <div className="video-stage-caption">
                    {isPlaying ? gameInstance.statusText : 'Press Enter to start a round or load a saved game'}
                </div>
                <div className="video-stage-meta">
                    <span className="video-meta-chip">{gameMeta.name}</span>
                    {(gameInstance.metaChips || []).map((chip) => (
                        <span key={chip} className="video-meta-chip">{chip}</span>
                    ))}
                </div>
            </div>

            {sideSelectionModal && (
                <div className="modal-overlay" style={modalOverlayStyle}>
                    <div className="glass-panel" style={modalCardStyle}>
                        <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Pick Your Side</h2>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <button
                                onClick={() => sideSelectionModal.onSelect('X')}
                                className="control-btn enter-btn"
                                style={largeButtonStyle}
                            >
                                PLAY AS X
                            </button>
                            <button
                                onClick={() => sideSelectionModal.onSelect('O')}
                                className="control-btn action-btn"
                                style={largeButtonStyle}
                            >
                                PLAY AS O
                            </button>
                        </div>
                        <button onClick={sideSelectionModal.onCancel} className="control-btn nav-btn" style={fullWidthButtonStyle}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {exitConfirmModal && (
                <div className="modal-overlay" style={modalOverlayStyle}>
                    <div className="glass-panel" style={modalCardStyle}>
                        <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>{exitConfirmModal.title}</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{exitConfirmModal.desc}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button onClick={exitConfirmModal.onSave} className="control-btn enter-btn" style={stackButtonStyle}>
                                Save and Exit
                            </button>
                            <button onClick={exitConfirmModal.onDiscard} className="control-btn action-btn" style={stackButtonStyle}>
                                Exit and Discard Progress
                            </button>
                            <button onClick={exitConfirmModal.onCancel} className="control-btn nav-btn" style={smallButtonStyle}>
                                Keep Playing
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {gameOverModal && (
                <div className="modal-overlay" style={modalOverlayStyle}>
                    <div className="glass-panel" style={{ ...modalCardStyle, padding: '3rem' }}>
                        <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>{gameOverModal.title}</h2>
                        <h3 style={{ fontSize: '1.5rem', margin: '1rem 0', color: 'var(--accent-primary)' }}>
                            {gameOverModal.statsText}
                        </h3>
                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2.5rem' }}>
                            <button onClick={gameOverModal.onPlayAgain} className="control-btn enter-btn" style={flexButtonStyle}>
                                Play Again
                            </button>
                            <button onClick={gameOverModal.onQuit} className="control-btn action-btn" style={flexButtonStyle}>
                                Quit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {hintModal && (
                <div className="modal-overlay" style={modalOverlayStyle}>
                    <div className="glass-panel" style={{ ...modalCardStyle, ...hintModalCardStyle }}>
                        <h2 style={{ fontSize: '2.2rem', marginBottom: '1.5rem' }}>{hintModal.title}</h2>

                        <p
                            style={{
                                color: 'var(--text-secondary)',
                                margin: '0 0 1.5rem',
                                textAlign: 'left',
                                lineHeight: '1.7',
                            }}
                        >
                            {hintModal.summary}
                        </p>

                        <div className="video-stage-meta" style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '1.5rem' }}>
                            {hintModal.facts?.map((fact) => (
                                <span key={fact.label} className="video-meta-chip">
                                    {fact.label}: {fact.value}
                                </span>
                            ))}
                        </div>

                        <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                            {hintModal.sections?.map((section) => (
                                <div
                                    key={section.title}
                                    style={{
                                        textAlign: 'left',
                                        padding: '1rem 1.1rem',
                                        borderRadius: '18px',
                                        border: '1px solid var(--glass-border)',
                                        background: 'rgba(255,255,255,0.08)',
                                    }}
                                >
                                    <h3 style={{ margin: '0 0 0.55rem', fontSize: '1rem' }}>{section.title}</h3>
                                    <p
                                        style={{
                                            margin: 0,
                                            color: 'var(--text-secondary)',
                                            whiteSpace: 'pre-line',
                                            lineHeight: '1.65',
                                        }}
                                    >
                                        {section.body}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <button onClick={hintModal.onClose} className="control-btn nav-btn" style={fullWidthButtonStyle}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'var(--modal-overlay-bg)',
    backdropFilter: 'blur(8px)',
    zIndex: 9999,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
};

const modalCardStyle = {
    textAlign: 'center',
    background: 'var(--bg-primary)',
    padding: '2.5rem',
    borderRadius: '24px',
};

const hintModalCardStyle = {
    width: 'min(720px, calc(100vw - 2rem))',
    maxHeight: 'min(88vh, 920px)',
    overflowY: 'auto',
};

const largeButtonStyle = {
    padding: '1.5rem',
    fontSize: '1.5rem',
};

const stackButtonStyle = {
    padding: '1rem',
    fontSize: '1.1rem',
};

const smallButtonStyle = {
    padding: '0.75rem',
    fontSize: '0.9rem',
    marginTop: '0.5rem',
};

const fullWidthButtonStyle = {
    width: '100%',
    marginTop: '1.5rem',
    padding: '1rem',
    fontSize: '1.1rem',
};

const flexButtonStyle = {
    flex: 1,
    padding: '1rem',
    fontSize: '1.1rem',
};

const TicTacToeRuntime = (props) => <GameRuntimeShell {...props} useGameHook={useTicTacToeGame} />;
const Caro5Runtime = (props) => <GameRuntimeShell {...props} useGameHook={useCaro5Game} />;
const Caro4Runtime = (props) => <GameRuntimeShell {...props} useGameHook={useCaro4Game} />;
const SnakeRuntime = (props) => <GameRuntimeShell {...props} useGameHook={useSnakeGame} />;
const Match3Runtime = (props) => <GameRuntimeShell {...props} useGameHook={useMatch3Game} />;
const MemoryRuntime = (props) => <GameRuntimeShell {...props} useGameHook={useMemoryGame} />;
const DrawRuntime = (props) => <GameRuntimeShell {...props} useGameHook={useDrawGame} />;

const GAME_RUNTIME_COMPONENTS = {
    TICTACTOE: TicTacToeRuntime,
    CARO5: Caro5Runtime,
    CARO4: Caro4Runtime,
    SNAKE: SnakeRuntime,
    MATCH3: Match3Runtime,
    MEMORY: MemoryRuntime,
    FREEDRAW: DrawRuntime,
};

const REVIEW_PAGE_SIZE = 5;

const GamePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token, user } = useAuth();
    const [gameMeta, setGameMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [reviewPagination, setReviewPagination] = useState({
        page: 1,
        pageSize: REVIEW_PAGE_SIZE,
        totalItems: 0,
        totalPages: 1,
    });
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [reviewSaving, setReviewSaving] = useState(false);
    const [reviewError, setReviewError] = useState('');
    const [reviewSuccess, setReviewSuccess] = useState('');
    const [reviewForm, setReviewForm] = useState({
        rating: '5',
        comment: '',
    });

    useEffect(() => {
        if (!token) {
            return;
        }

        const fetchMeta = async () => {
            try {
                const meta = await gameService.getGameById(id);
                setGameMeta(meta);
            } catch (error) {
                console.error('Failed to fetch game metadata', error);
                navigate('/hub');
            } finally {
                setLoading(false);
            }
        };

        fetchMeta();
    }, [id, navigate, token]);

    const loadReviews = async (page = 1) => {
        setReviewsLoading(true);

        try {
            const response = await reviewService.getReviews(id, page, REVIEW_PAGE_SIZE);
            const nextReviews = response.items || [];
            setReviews(nextReviews);
            setReviewPagination({
                page: response.page || page,
                pageSize: response.pageSize || REVIEW_PAGE_SIZE,
                totalItems: response.totalItems || 0,
                totalPages: response.totalPages || 1,
            });

            const ownReview = nextReviews.find((item) => item.user_id === user?.id);
            if (ownReview) {
                setReviewForm({
                    rating: String(ownReview.rating),
                    comment: ownReview.comment || '',
                });
            }
        } catch (error) {
            setReviewError(error.message || 'Failed to load reviews');
        } finally {
            setReviewsLoading(false);
        }
    };

    useEffect(() => {
        if (!token) {
            return;
        }

        setReviewError('');
        loadReviews(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, token, user?.id]);

    const gameKey = useMemo(() => resolveGameKey(gameMeta, id), [gameMeta, id]);
    const RuntimeComponent = GAME_RUNTIME_COMPONENTS[gameKey];

    const handleReviewSubmit = async (event) => {
        event.preventDefault();
        setReviewSaving(true);
        setReviewError('');
        setReviewSuccess('');

        try {
            await reviewService.addReview(id, Number(reviewForm.rating), reviewForm.comment);
            setReviewSuccess('Review saved. Submitting again will update your previous rating.');
            await loadReviews(1);
        } catch (error) {
            setReviewError(error.message || 'Failed to save review');
        } finally {
            setReviewSaving(false);
        }
    };

    if (loading || !gameMeta) {
        return <div className="video-stage-caption">LOADING GAME ASSETS...</div>;
    }

    if (!RuntimeComponent) {
        return (
            <div className="video-hub-shell">
                <div className="video-stage-caption" style={{ color: 'red' }}>
                    GAME HOOK MISSING FOR {gameMeta.name}
                </div>
                <button onClick={() => navigate('/hub')} className="control-btn nav-btn">BACK TO HUB</button>
            </div>
        );
    }

    return (
        <div className="content-grid single-column-grid">
            <RuntimeComponent key={`${gameKey}-${id}`} gameMeta={gameMeta} gameId={id} />

            <section className="page-panel glass-panel review-shell">
                <div className="section-heading">
                    <div>
                        <span className="section-kicker">Game Feedback</span>
                        <h2>{gameMeta.name} rankings and reviews</h2>
                    </div>
                    <button
                        type="button"
                        className="control-btn nav-btn topbar-btn"
                        onClick={() => navigate(`/rankings?gameId=${gameMeta.id}`)}
                    >
                        Open Full Rankings
                    </button>
                </div>

                <div className="review-summary-row">
                    <span className="video-meta-chip">Score Type: {gameMeta.score_type}</span>
                    <span className="video-meta-chip">Board Size: {gameMeta.board_size}</span>
                    <span className="video-meta-chip">Default Timer: {gameMeta.default_timer || 0}s</span>
                    <span className="video-meta-chip">Reviews: {reviewPagination.totalItems}</span>
                </div>

                {reviewError && <div className="error-message">{reviewError}</div>}
                {reviewSuccess && <div className="success-message">{reviewSuccess}</div>}

                <div className="content-grid two-column-grid review-two-column">
                    <div className="page-panel">
                        <div>
                            <span className="section-kicker">Your Rating</span>
                            <h3 className="review-block-title">Leave a score and comment</h3>
                        </div>

                        <form className="review-form" onSubmit={handleReviewSubmit}>
                            <label htmlFor="rating">Rating</label>
                            <select
                                id="rating"
                                className="social-select"
                                value={reviewForm.rating}
                                onChange={(event) =>
                                    setReviewForm((current) => ({
                                        ...current,
                                        rating: event.target.value,
                                    }))
                                }
                            >
                                <option value="5">5 stars</option>
                                <option value="4">4 stars</option>
                                <option value="3">3 stars</option>
                                <option value="2">2 stars</option>
                                <option value="1">1 star</option>
                            </select>

                            <label htmlFor="comment">Comment</label>
                            <textarea
                                id="comment"
                                rows="5"
                                value={reviewForm.comment}
                                onChange={(event) =>
                                    setReviewForm((current) => ({
                                        ...current,
                                        comment: event.target.value,
                                    }))
                                }
                                placeholder={`Share what worked well in ${gameMeta.name} or what should improve.`}
                            />

                            <button type="submit" disabled={reviewSaving}>
                                {reviewSaving ? 'Saving review...' : 'Save Review'}
                            </button>
                        </form>
                    </div>

                    <div className="page-panel">
                        <div>
                            <span className="section-kicker">Community Notes</span>
                            <h3 className="review-block-title">Latest player comments</h3>
                        </div>

                        {reviewsLoading ? (
                            <div className="page-center-state social-empty-state">
                                <p>Loading reviews...</p>
                            </div>
                        ) : reviews.length === 0 ? (
                            <div className="page-center-state social-empty-state">
                                <p>No reviews yet. Be the first to rate this game.</p>
                            </div>
                        ) : (
                            <div className="review-list">
                                {reviews.map((review) => (
                                    <article key={review.id} className="review-card">
                                        <div className="review-card-header">
                                            <div>
                                                <strong>{review.username}</strong>
                                                <span>{new Date(review.created_at).toLocaleString()}</span>
                                            </div>
                                            <span className="achievement-pill">{review.rating}/5</span>
                                        </div>
                                        <p>{review.comment || 'No written comment was provided.'}</p>
                                    </article>
                                ))}
                            </div>
                        )}

                        <div className="pagination-row">
                            <button
                                type="button"
                                className="control-btn nav-btn pagination-btn"
                                disabled={reviewsLoading || reviewPagination.page <= 1}
                                onClick={() => loadReviews(reviewPagination.page - 1)}
                            >
                                Previous
                            </button>
                            <span className="pagination-meta">
                                Page {reviewPagination.page} / {reviewPagination.totalPages}
                            </span>
                            <button
                                type="button"
                                className="control-btn nav-btn pagination-btn"
                                disabled={reviewsLoading || reviewPagination.page >= reviewPagination.totalPages}
                                onClick={() => loadReviews(reviewPagination.page + 1)}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default GamePage;
