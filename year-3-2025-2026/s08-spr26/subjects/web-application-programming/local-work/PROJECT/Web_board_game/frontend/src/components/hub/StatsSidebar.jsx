import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const BOARDS = [
    { id: 'CARO', title: 'Caro 5', label: 'Wins' },
    { id: 'TICTACTOE', title: 'Tic-Tac-Toe', label: 'Wins' },
    { id: 'MEMORY', title: 'Memory Match', label: 'High Score' }
];

const StatsSidebar = ({ activeGame, userStats = {}, lastSaveTime, onLoad }) => {
    const { user, token } = useAuth();
    const [boardIndex, setBoardIndex] = useState(0);
    const [filter, setFilter] = useState('global');
    const [leaderboard, setLeaderboard] = useState([]);
    const [displayedLabel, setDisplayedLabel] = useState(BOARDS[0].label);

    const handlePrevBoard = () => setBoardIndex(prev => (prev === 0 ? BOARDS.length - 1 : prev - 1));
    const handleNextBoard = () => setBoardIndex(prev => (prev === BOARDS.length - 1 ? 0 : prev + 1));

    const currentBoard = BOARDS[boardIndex];

    useEffect(() => {
        if (!token) return;
        const fetchLeaderboard = async () => {
            try {
                const res = await fetch(`/api/users/leaderboard/${currentBoard.id}?filter=${filter}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setLeaderboard(data);
                    setDisplayedLabel(currentBoard.label);
                }
            } catch (err) {
                console.error('Failed to fetch leaderboard');
            }
        };
        fetchLeaderboard();
    }, [currentBoard.id, filter, token, userStats]); // re-fetch if userStats changes

    const renderRankings = () => {
        const statKey = currentBoard.id === 'MEMORY' ? 'highScore' : 'wins';
        const userStatValue = userStats[currentBoard.id]?.[statKey] || 0;

        return (
            <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <button 
                        onClick={() => setFilter('global')}
                        className={`control-btn ${filter === 'global' ? 'enter-btn' : 'action-btn'}`}
                        style={{ flex: 1, padding: '0.25rem 0', fontSize: '0.8rem', borderRadius: '8px' }}
                    >Global</button>
                    <button 
                        onClick={() => setFilter('friends')}
                        className={`control-btn ${filter === 'friends' ? 'enter-btn' : 'action-btn'}`}
                        style={{ flex: 1, padding: '0.25rem 0', fontSize: '0.8rem', borderRadius: '8px' }}
                    >Friends</button>
                </div>
                
                <div className="placeholder-list" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {leaderboard.length === 0 ? (
                        <p style={{ textAlign: 'center', fontStyle: 'italic', margin: '0.5rem 0' }}>No ranking data yet...</p>
                    ) : (
                        leaderboard.map((entry, idx) => {
                            const isMe = entry.username === user?.username;
                            let color = 'inherit';
                            let fontWeight = 'normal';
                            let textShadow = 'none';
                            
                            if (idx === 0) { color = '#FFD700'; fontWeight = 'bold'; textShadow = '0 0 5px rgba(255, 215, 0, 0.4)'; }
                            else if (idx === 1) { color = '#C0C0C0'; fontWeight = 'bold'; textShadow = '0 0 5px rgba(192, 192, 192, 0.4)'; }
                            else if (idx === 2) { color = '#CD7F32'; fontWeight = 'bold'; textShadow = '0 0 5px rgba(205, 127, 50, 0.4)'; }
                            else if (isMe) { color = 'var(--accent-primary)'; fontWeight = 'bold'; textShadow = 'none'; }
                            
                            return (
                                <p key={idx} style={{ color, fontWeight, textShadow }}>
                                    {idx + 1}. {entry.username} - {entry.score} {displayedLabel}
                                </p>
                            );
                        })
                    )}
                    
                    <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '0.5rem 0' }} />
                    <p style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>You: {userStatValue} {displayedLabel}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="hub-sidebar right-sidebar">
            <div className="stats-section glass-panel" style={{ flex: 0.6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button onClick={handlePrevBoard} className="control-btn nav-btn" style={{ padding: '0.25rem 0.5rem' }}>◀</button>
                    <h4 style={{ margin: 0, textAlign: 'center', flex: 1, fontSize: '0.95rem' }}>{currentBoard.title}</h4>
                    <button onClick={handleNextBoard} className="control-btn nav-btn" style={{ padding: '0.25rem 0.5rem' }}>▶</button>
                </div>
                {renderRankings()}
            </div>
            
            <div className="config-section glass-panel" style={{ flex: 0.4, display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ marginBottom: '0.5rem' }}>{activeGame?.title || 'Game'} Progress</h4>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    {activeGame?.id === 'MEMORY' ? (
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Timer: 1 mins</p>
                    ) : activeGame?.id !== 'DRAW' ? (
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Versus: AI (Random)</p>
                    ) : (
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Mode: FreePlay</p>
                    )}

                    <div style={{ 
                        margin: '0.5rem 0', 
                        padding: '0.75rem', 
                        background: 'rgba(0,0,0,0.2)', 
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        textAlign: 'center',
                        color: 'var(--text-secondary)'
                    }}>
                        Last Save: <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{lastSaveTime || 'None'}</span>
                    </div>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                    <button onClick={onLoad} className="control-btn nav-btn" style={{ flex: 1, padding: '0.6rem' }}>LOAD LAST SAVE</button>
                </div>
            </div>
        </div>
    );
};

export default StatsSidebar;

