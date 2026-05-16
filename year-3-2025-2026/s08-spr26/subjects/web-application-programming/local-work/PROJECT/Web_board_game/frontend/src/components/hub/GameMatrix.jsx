import React, { useEffect, useMemo, useState } from 'react';

const SIDE_HINTS = {
    left: [
        [7, 1],
        [8, 0],
        [9, 1],
        [10, 0],
        [11, 1],
    ],
    right: [
        [7, 18],
        [8, 19],
        [9, 18],
        [10, 19],
        [11, 18],
    ],
};

const GameMatrix = ({ gridPixels, showSideIndicators = false, sideIndicatorColor = '#64748b' }) => {
    // gridPixels is expected to be a 2D array of color strings, e.g., 20x20
    if (!gridPixels || gridPixels.length === 0) return null;

    const [showBlink, setShowBlink] = useState(true);

    useEffect(() => {
        if (!showSideIndicators) {
            setShowBlink(true);
            return undefined;
        }

        const intervalId = window.setInterval(() => {
            setShowBlink((prev) => !prev);
        }, 250);

        return () => window.clearInterval(intervalId);
    }, [showSideIndicators]);

    const renderedGrid = useMemo(() => {
        const nextGrid = gridPixels.map((row) => [...row]);

        if (showSideIndicators && showBlink) {
            [...SIDE_HINTS.left, ...SIDE_HINTS.right].forEach(([row, col]) => {
                if (nextGrid[row] && nextGrid[row][col] !== undefined && !nextGrid[row][col]) {
                    nextGrid[row][col] = sideIndicatorColor;
                }
            });
        }

        return nextGrid;
    }, [gridPixels, showBlink, showSideIndicators, sideIndicatorColor]);

    return (
        <div className="game-matrix-container glass-panel">
            <div className="game-matrix">
                {renderedGrid.map((row, rIdx) => (
                    <div key={rIdx} className="matrix-row">
                        {row.map((color, cIdx) => (
                            (() => {
                                const isCursor = color === '#93c5fd';
                                return (
                            <div 
                                key={`${rIdx}-${cIdx}`} 
                                className="matrix-dot" 
                                style={{ 
                                    backgroundColor: color || 'var(--matrix-off)',
                                    boxShadow: color
                                        ? isCursor
                                            ? `0 0 12px ${color}, 0 0 20px ${color}aa, inset 0 0 2px rgba(255,255,255,0.9)`
                                            : `0 2px 8px ${color}55, inset 0 -1px 1px rgba(255,255,255,0.35)`
                                        : undefined,
                                    transform: isCursor ? 'scale(1.05)' : undefined,
                                }}
                            />
                                );
                            })()
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GameMatrix;
