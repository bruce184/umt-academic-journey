import { useEffect, useMemo, useRef, useState } from 'react';
import {
    COLORS,
    createGrid,
    fillRect,
    formatDuration,
    getTileSpan,
    resolveBoardLayout,
    resolveTimerLimit,
    shuffle,
} from './gameUtils';

const createDeck = (boardSize) => {
    const totalPairs = (boardSize * boardSize) / 2;
    const baseValues = shuffle(
        Array.from({ length: totalPairs }, (_, index) => index).flatMap((index) => [index, index])
    );
    return Array.from({ length: boardSize }, (_, row) =>
        Array.from({ length: boardSize }, (_, col) => baseValues[row * boardSize + col])
    );
};

export const useMemoryGame = ({ onGameOver, gameMeta }) => {
    const boardLayout = useMemo(
        () =>
            resolveBoardLayout({
                requestedSize: gameMeta?.board_size,
                fallbackSize: 4,
                minSize: 4,
                maxSize: 8,
                preferredMaxCellSize: 4,
                requireEven: true,
            }),
        [gameMeta?.board_size]
    );
    const timeLimit = useMemo(
        () => resolveTimerLimit(gameMeta?.default_timer, 180),
        [gameMeta?.default_timer]
    );
    const [deck, setDeck] = useState(() => createDeck(boardLayout.size));
    const [revealed, setRevealed] = useState([]);
    const [matched, setMatched] = useState([]);
    const [cursor, setCursor] = useState({ row: 0, col: 0 });
    const [moves, setMoves] = useState(0);
    const [secondsLeft, setSecondsLeft] = useState(timeLimit);
    const [isDirty, setIsDirty] = useState(false);
    const [statusText, setStatusText] = useState('Reveal two cards and remember their colors.');
    const [isResolving, setIsResolving] = useState(false);
    const [hasEnded, setHasEnded] = useState(false);
    const startedAtRef = useRef(Date.now());
    const onGameOverRef = useRef(onGameOver);

    useEffect(() => {
        onGameOverRef.current = onGameOver;
    }, [onGameOver]);

    useEffect(() => {
        if (hasEnded) {
            return undefined;
        }

        const timerId = window.setInterval(() => {
            if (!timeLimit) {
                return;
            }

            setSecondsLeft((current) => {
                if (current <= 1) {
                    window.clearInterval(timerId);
                    setHasEnded(true);
                    onGameOverRef.current('DEFEAT', 0, timeLimit);
                    return 0;
                }

                return current - 1;
            });
        }, 1000);

        return () => window.clearInterval(timerId);
    }, [hasEnded, timeLimit]);

    useEffect(() => {
        if (hasEnded || matched.length !== boardLayout.size * boardLayout.size || !matched.length) {
            return undefined;
        }

        const timeoutId = window.setTimeout(() => {
            setHasEnded(true);
            const elapsedSeconds = timeLimit ? Math.max(0, timeLimit - secondsLeft) : 0;
            const score = Math.max(1000 - moves * 25 - elapsedSeconds * 5, 100);
            onGameOverRef.current('WIN', score, elapsedSeconds);
        }, 350);

        return () => window.clearTimeout(timeoutId);
    }, [boardLayout.size, hasEnded, matched.length]); // Removed secondsLeft and moves to prevent timeout clearing

    const moveCursor = (rowStep, colStep) => {
        if (isResolving) {
            return;
        }

        setCursor((current) => ({
            row: (current.row + rowStep + boardLayout.size) % boardLayout.size,
            col: (current.col + colStep + boardLayout.size) % boardLayout.size,
        }));
    };

    const handleEnter = () => {
        if (isResolving) {
            return;
        }

        const key = `${cursor.row}-${cursor.col}`;

        if (matched.includes(key) || revealed.includes(key)) {
            return;
        }

        const nextRevealed = [...revealed, key];
        setRevealed(nextRevealed);
        setMoves((current) => current + 1);
        setIsDirty(true);

        if (nextRevealed.length % 2 === 1) {
            setStatusText('Select one more card to check for a match.');
            return;
        }

        const [firstKey, secondKey] = nextRevealed.slice(-2);
        const [firstRow, firstCol] = firstKey.split('-').map(Number);
        const [secondRow, secondCol] = secondKey.split('-').map(Number);

        if (deck[firstRow][firstCol] === deck[secondRow][secondCol]) {
            setMatched((current) => [...current, firstKey, secondKey]);
            setStatusText('Pair matched. Keep going.');
            return;
        }

        setIsResolving(true);
        setStatusText('Mismatch. Cards will flip back.');

        window.setTimeout(() => {
            setRevealed((current) => current.filter((item) => item !== firstKey && item !== secondKey));
            setIsResolving(false);
            setStatusText('Try a different pair.');
        }, 650);
    };

    const renderGrid = () => {
        const grid = createGrid();
        const tileSpan = getTileSpan(boardLayout.cellSize);

        for (let row = 0; row < boardLayout.size; row += 1) {
            for (let col = 0; col < boardLayout.size; col += 1) {
                const top = boardLayout.rowOrigin + row * boardLayout.cellSize;
                const left = boardLayout.colOrigin + col * boardLayout.cellSize;
                const key = `${row}-${col}`;
                const value = deck[row][col];
                const isVisible = revealed.includes(key) || matched.includes(key);
                
                fillRect(
                    grid,
                    top,
                    left,
                    tileSpan,
                    tileSpan,
                    isVisible ? COLORS.memory[value % COLORS.memory.length] : COLORS.boardMuted
                );

                if (cursor.row === row && cursor.col === col) {
                    // Fix: Fill entire tile span for cursor to avoid "missing light"
                    fillRect(grid, top, left, tileSpan, tileSpan, COLORS.cursor);
                }
            }
        }

        return grid;
    };

    const reset = () => {
        setDeck(createDeck(boardLayout.size));
        setRevealed([]);
        setMatched([]);
        setCursor({ row: 0, col: 0 });
        setMoves(0);
        setSecondsLeft(timeLimit);
        setIsDirty(false);
        setStatusText('Reveal two cards and remember their colors.');
        setIsResolving(false);
        setHasEnded(false);
        startedAtRef.current = Date.now();
    };

    const getState = () => ({
        deck,
        revealed,
        matched,
        cursor,
        moves,
        elapsedSeconds: timeLimit ? Math.max(0, timeLimit - secondsLeft) : 0,
        secondsLeft,
    });

    const loadState = (state) => {
        if (!state) {
            return;
        }

        setDeck(state.deck || createDeck(boardLayout.size));
        setRevealed(state.revealed || []);
        setMatched(state.matched || []);
        setCursor(state.cursor || { row: 0, col: 0 });
        setMoves(state.moves || 0);
        setSecondsLeft(
            state.secondsLeft ??
                (timeLimit ? Math.max(0, timeLimit - (state.elapsedSeconds || 0)) : 0)
        );
        setIsDirty(true);
        setStatusText('Saved memory board restored.');
        setIsResolving(false);
        setHasEnded(false);
        startedAtRef.current = Date.now();
    };

    return {
        gridPixels: renderGrid(),
        handleLeft: () => moveCursor(0, -1),
        handleRight: () => moveCursor(0, 1),
        handleUp: () => moveCursor(-1, 0),
        handleDown: () => moveCursor(1, 0),
        handleEnter,
        reset,
        getState,
        loadState,
        isDirty,
        requiresSideSelection: false,
        runtimeConfig: {
            boardSize: boardLayout.size,
            defaultTimer: timeLimit,
        },
        guideSummary:
            'Memory Match is a pattern-recall challenge. Flip cards, remember their positions, and clear the board efficiently before the timer expires.',
        guideSections: [
            {
                title: 'Introduction',
                body: 'This game rewards observation and recall more than speed alone. The fewer wasted flips you make, the better your outcome.',
            },
            {
                title: 'Objective',
                body: 'Find every matching pair on the board before time runs out.',
            },
            {
                title: 'Controls',
                body: 'Use the d-pad to move the cursor tile by tile.\nPress Enter to flip the selected card.',
            },
            {
                title: 'Rules',
                body: 'Two cards stay visible only if they match.\nA mismatch flips back after a short delay.\nMatched pairs remain revealed until the board is cleared.',
            },
            {
                title: 'Scoring Tips',
                body: 'Try to finish with fewer moves and less time spent.\nWhen you reveal a new card, connect it to known positions before exploring more of the board.',
            },
        ],
        instructions:
            `Move around the deck with the d-pad and press Enter to flip a card. Find all matching color pairs on a ${boardLayout.size}x${boardLayout.size} board before time expires.`,
        statusText,
        metaChips: [
            `Board: ${boardLayout.size}x${boardLayout.size}`,
            `Pairs: ${matched.length / 2}/${(boardLayout.size * boardLayout.size) / 2}`,
            `Moves: ${moves}`,
            timeLimit ? `Time left: ${formatDuration(secondsLeft)}` : 'Timer: Off',
        ],
    };
};
