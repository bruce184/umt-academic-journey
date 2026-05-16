import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GameMatrix from '../../components/hub/GameMatrix';
import GameControls from '../../components/hub/GameControls';
import {
    getCaroArt,
    getDrawArt,
    getMatch3Art,
    getMemoryArt,
    getSnakeArt,
    getTicTacToeArt,
} from '../../utils/pixelArt';
import { gameService } from '../../services/gameService';
import { usePhysicalControls } from '../../hooks/games/engine/usePhysicalControls';
import { normalizeGameKey } from '../../hooks/games/gameUtils';

const ART_MAP = {
    CARO5: getCaroArt,
    CARO4: getCaroArt,
    TICTACTOE: getTicTacToeArt,
    MEMORY: getMemoryArt,
    SNAKE: getSnakeArt,
    MATCH3: getMatch3Art,
    FREEDRAW: getDrawArt,
};

const HUB_HELP_CONTENT = {
    CARO5: {
        title: 'Caro 5 Preview',
        summary: 'A larger connection game focused on long-term positioning and defensive reads.',
        quickGuide: [
            'Objective: connect 5 stones before the computer does.',
            'Flow: move the cursor with the d-pad and press Enter on an empty tile.',
            'Tip: build open lines while blocking the computer early.',
        ],
    },
    CARO4: {
        title: 'Caro 4 Preview',
        summary: 'A slightly faster connection battle where shorter patterns become dangerous very quickly.',
        quickGuide: [
            'Objective: connect 4 stones in a row.',
            'Flow: move with the d-pad and place a stone with Enter.',
            'Tip: watch for double-threat setups on the next turn.',
        ],
    },
    TICTACTOE: {
        title: 'Tic-Tac-Toe Preview',
        summary: 'A compact three-in-a-row duel with fast turns and simple rules.',
        quickGuide: [
            'Objective: complete a line of 3 before the computer.',
            'Flow: move around the 3x3 grid and press Enter to place your mark.',
            'Tip: center control is often the strongest opening.',
        ],
    },
    SNAKE: {
        title: 'Snake Preview',
        summary: 'An arcade survival run where movement never stops for long.',
        quickGuide: [
            'Objective: eat food, grow longer, and avoid crashing.',
            'Flow: use the d-pad to steer and press Enter to pause or resume.',
            'Tip: leave yourself open lanes before chasing food near walls.',
        ],
    },
    MATCH3: {
        title: 'Match-3 Preview',
        summary: 'A quick combo puzzle built around swapping adjacent tiles to create matches.',
        quickGuide: [
            'Objective: make lines of 3 or more matching tiles to score.',
            'Flow: press Enter to select a tile, then Enter again on an adjacent tile to swap.',
            'Tip: moves near the bottom can trigger stronger cascades.',
        ],
    },
    MEMORY: {
        title: 'Memory Preview',
        summary: 'A card-matching challenge that rewards observation and recall.',
        quickGuide: [
            'Objective: reveal every matching pair before time runs out.',
            'Flow: move tile by tile and press Enter to flip cards.',
            'Tip: remember positions instead of guessing repeatedly.',
        ],
    },
    FREEDRAW: {
        title: 'Free Draw Preview',
        summary: 'A creative pixel canvas for sketching patterns, icons, and simple art.',
        quickGuide: [
            'Objective: create your own drawing on the board.',
            'Flow: move upward into the palette, choose a color with Enter, then paint on the canvas.',
            'Tip: block shapes first, then refine details.',
        ],
    },
};

const HubPage = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    
    const [games, setGames] = useState([]);
    const [gameIndex, setGameIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    const [saveFoundModal, setSaveFoundModal] = useState(null);
    const [hintModal, setHintModal] = useState(null);
    const [saveMetaMap, setSaveMetaMap] = useState({}); // mapped by game.id

    useEffect(() => {
        if (!token) return;
        const fetchHubData = async () => {
            try {
                const dbGames = await gameService.getAllGames();
                const merged = dbGames.map(g => ({
                    ...g,
                    render: ART_MAP[normalizeGameKey(g.name || g.id)] || getDrawArt,
                    enabled: g.enabled ?? g.is_active,
                }));
                setGames(merged);
                
                const meta = {};
                for (const g of dbGames) {
                    try {
                        const save = await gameService.loadProgress(g.id);
                        if (save && save.savedAt) {
                            meta[g.id] = save.savedAt;
                        }
                    } catch (e) {
                        // ignore 404
                    }
                }
                setSaveMetaMap(meta);
            } catch (err) {
                console.error('Failed to load hub data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchHubData();
    }, [token]);

    const activeGame = games[gameIndex];

    const handleLeft = () => {
        if (saveFoundModal || hintModal) return;
        if (games.length === 0) return;
        setGameIndex(prev => (prev === 0 ? games.length - 1 : prev - 1));
    };

    const handleRight = () => {
        if (saveFoundModal || hintModal) return;
        if (games.length === 0) return;
        setGameIndex(prev => (prev === games.length - 1 ? 0 : prev + 1));
    };

    const handleEnter = () => {
        if (saveFoundModal || hintModal || !activeGame) return;
        
        if (activeGame.enabled === false) {
            return;
        }

        if (saveMetaMap[activeGame.id]) {
            setSaveFoundModal({
                gameId: activeGame.id,
                onLoad: () => {
                    navigate(`/games/${activeGame.id}?load=true`);
                },
                onCreateNew: async () => {
                    await gameService.deleteProgress(activeGame.id);
                    navigate(`/games/${activeGame.id}`);
                },
                onCancel: () => setSaveFoundModal(null)
            });
            return;
        }

        navigate(`/games/${activeGame.id}`);
    };

    const handleBack = () => {};

    const handleHint = () => {
        if (saveFoundModal || hintModal || !activeGame) return;

        const activeGameKey = normalizeGameKey(activeGame.name || activeGame.id);
        const helpContent = HUB_HELP_CONTENT[activeGameKey] || {
            title: `${activeGame.name || 'Game'} Preview`,
            summary: 'Use this preview to browse the game before starting a round.',
            quickGuide: [
                'Move left or right to choose a game.',
                'Press Enter to open the highlighted game.',
                'Open the in-game Help screen for the full rules and details.',
            ],
        };

        setHintModal({
            title: helpContent.title,
            description:
                `${helpContent.summary}\n\n` +
                helpContent.quickGuide.join('\n'),
            onClose: () => setHintModal(null)
        });
    };

    usePhysicalControls({
        onLeft: handleLeft,
        onRight: handleRight,
        onEnter: handleEnter,
        onBack: handleBack,
        onHint: handleHint
    }, true);

    if (loading) {
        return <div className="video-stage-caption">LOADING HUB...</div>;
    }

    if (games.length === 0) {
        return <div className="video-stage-caption">NO GAMES FOUND</div>;
    }

    const currentSaveText = saveMetaMap[activeGame.id]
        ? new Date(saveMetaMap[activeGame.id]).toLocaleString()
        : 'No save';

    const isAvailable = activeGame.enabled !== false; 

    return (
        <div className="video-hub-shell">
            <div className="video-stage">
                <GameMatrix
                    gridPixels={activeGame.render()}
                    showSideIndicators={true}
                />

                <GameControls 
                    onLeft={handleLeft}
                    onRight={handleRight}
                    onEnter={handleEnter}
                    onBack={handleBack}
                    onHint={handleHint}
                    showDirectionalPad={false}
                />

                <div className="video-stage-caption">Choose a game with Left or Right, then press Enter</div>

                <div className="video-stage-meta">
                    <span className="video-meta-chip">{activeGame.name || activeGame.title}</span>
                    <span className={`video-meta-chip ${isAvailable ? 'video-meta-chip-success' : 'video-meta-chip-danger'}`}>
                        {isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'}
                    </span>
                    <span className="video-meta-chip">SAVE: {currentSaveText}</span>
                </div>
            </div>

            {/* MODALS */}
            {saveFoundModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    backgroundColor: 'var(--modal-overlay-bg)', backdropFilter: 'blur(8px)',
                    zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div className="glass-panel" style={{ 
                        textAlign: 'center', background: 'var(--bg-primary)', 
                        minWidth: '450px', padding: '2.5rem', borderRadius: '24px',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)'
                    }}>
                        <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Existing Progress Found</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>A saved session exists for this game.</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button onClick={saveFoundModal.onLoad} className="control-btn enter-btn" style={{padding: '1rem', fontSize: '1.1rem'}}>Load Saved Game</button>
                            <button onClick={saveFoundModal.onCreateNew} className="control-btn action-btn" style={{padding: '1rem', fontSize: '1.1rem'}}>Start New Game (Delete Save)</button>
                            <button onClick={saveFoundModal.onCancel} className="control-btn nav-btn" style={{padding: '0.75rem', fontSize: '0.9rem', marginTop: '0.5rem'}}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {hintModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    backgroundColor: 'var(--modal-overlay-bg)', backdropFilter: 'blur(8px)',
                    zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div className="glass-panel" style={{ 
                        textAlign: 'center', background: 'var(--bg-primary)', 
                        minWidth: '450px', padding: '2.5rem', borderRadius: '24px',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)'
                    }}>
                        <h2 style={{ fontSize: '2.2rem', marginBottom: '1.5rem' }}>{hintModal.title}</h2>
                        <div style={{ color: 'var(--text-secondary)', marginBottom: '2rem', textAlign: 'left', whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                            {hintModal.description}
                        </div>
                        <button onClick={hintModal.onClose} className="control-btn nav-btn" style={{width: '100%', padding: '1rem', fontSize: '1.1rem'}}>Close Guide</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HubPage;
