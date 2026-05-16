import { useEffect, useMemo, useRef, useState } from 'react';
import {
    COLORS,
    createGrid,
    fillRect,
    formatDuration,
    getTileSpan,
    resolveBoardLayout,
    resolveTimerLimit,
} from './gameUtils';

const TOTAL_TIME = 90;

const createRandomTile = () => Math.floor(Math.random() * COLORS.match3.length);

const createBoard = (boardSize) => {
    const board = Array.from({ length: boardSize }, () => Array(boardSize).fill(0));

    for (let row = 0; row < boardSize; row += 1) {
        for (let col = 0; col < boardSize; col += 1) {
            let nextValue = createRandomTile();

            while (
                (col >= 2 && board[row][col - 1] === nextValue && board[row][col - 2] === nextValue) ||
                (row >= 2 && board[row - 1][col] === nextValue && board[row - 2][col] === nextValue)
            ) {
                nextValue = createRandomTile();
            }

            board[row][col] = nextValue;
        }
    }

    return board;
};

const collectMatches = (board) => {
    const boardSize = board.length;
    const matches = new Set();

    for (let row = 0; row < boardSize; row += 1) {
        let runLength = 1;

        for (let col = 1; col <= boardSize; col += 1) {
            if (col < boardSize && board[row][col] === board[row][col - 1]) {
                runLength += 1;
                continue;
            }

            if (runLength >= 3) {
                for (let offset = 0; offset < runLength; offset += 1) {
                    matches.add(`${row}-${col - 1 - offset}`);
                }
            }

            runLength = 1;
        }
    }

    for (let col = 0; col < boardSize; col += 1) {
        let runLength = 1;

        for (let row = 1; row <= boardSize; row += 1) {
            if (row < boardSize && board[row][col] === board[row - 1][col]) {
                runLength += 1;
                continue;
            }

            if (runLength >= 3) {
                for (let offset = 0; offset < runLength; offset += 1) {
                    matches.add(`${row - 1 - offset}-${col}`);
                }
            }

            runLength = 1;
        }
    }

    return [...matches].map((key) => key.split('-').map(Number));
};

const applyGravity = (board) => {
    const boardSize = board.length;
    const nextBoard = board.map((row) => [...row]);

    for (let col = 0; col < boardSize; col += 1) {
        const nextColumn = [];

        for (let row = boardSize - 1; row >= 0; row -= 1) {
            if (nextBoard[row][col] !== null) {
                nextColumn.push(nextBoard[row][col]);
            }
        }

        while (nextColumn.length < boardSize) {
            nextColumn.push(createRandomTile());
        }

        for (let row = boardSize - 1; row >= 0; row -= 1) {
            nextBoard[row][col] = nextColumn[boardSize - 1 - row];
        }
    }

    return nextBoard;
};

const resolveBoard = (board) => {
    let nextBoard = board.map((row) => [...row]);
    let totalMatches = 0;
    let matches = collectMatches(nextBoard);

    while (matches.length) {
        totalMatches += matches.length;
        matches.forEach(([row, col]) => {
            nextBoard[row][col] = null;
        });

        nextBoard = applyGravity(nextBoard);
        matches = collectMatches(nextBoard);
    }

    return {
        board: nextBoard,
        scoreGain: totalMatches * 15,
    };
};

const areAdjacent = (first, second) =>
    Math.abs(first.row - second.row) + Math.abs(first.col - second.col) === 1;

export const useMatch3Game = ({ onGameOver, gameMeta }) => {
    const boardLayout = useMemo(
        () =>
            resolveBoardLayout({
                requestedSize: gameMeta?.board_size,
                fallbackSize: 6,
                minSize: 4,
                maxSize: 8,
                preferredMaxCellSize: 3,
                topPadding: 1,
                bottomPadding: 1,
                leftPadding: 1,
                rightPadding: 1,
            }),
        [gameMeta?.board_size]
    );
    const timeLimit = useMemo(
        () => resolveTimerLimit(gameMeta?.default_timer, TOTAL_TIME),
        [gameMeta?.default_timer]
    );
    const [board, setBoard] = useState(() => createBoard(boardLayout.size));
    const [cursor, setCursor] = useState({ row: 0, col: 0 });
    const [selectedCell, setSelectedCell] = useState(null);
    const [score, setScore] = useState(0);
    const [secondsLeft, setSecondsLeft] = useState(timeLimit);
    const [isDirty, setIsDirty] = useState(false);
    const [statusText, setStatusText] = useState('Create swaps that form groups of three or more.');
    const [hasEnded, setHasEnded] = useState(false);
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
                    onGameOverRef.current(score > 0 ? 'WIN' : 'DEFEAT', score, timeLimit);
                    return 0;
                }

                return current - 1;
            });
        }, 1000);

        return () => window.clearInterval(timerId);
    }, [hasEnded, score, timeLimit]);

    const moveCursor = (rowStep, colStep) => {
        if (hasEnded) {
            return;
        }

        setCursor((current) => ({
            row: (current.row + rowStep + boardLayout.size) % boardLayout.size,
            col: (current.col + colStep + boardLayout.size) % boardLayout.size,
        }));
    };

    const handleEnter = () => {
        if (hasEnded) {
            return;
        }

        if (!selectedCell) {
            setSelectedCell(cursor);
            setStatusText('Select an adjacent tile to attempt a swap.');
            return;
        }

        if (selectedCell.row === cursor.row && selectedCell.col === cursor.col) {
            setSelectedCell(null);
            setStatusText('Selection cleared.');
            return;
        }

        if (!areAdjacent(selectedCell, cursor)) {
            setSelectedCell(cursor);
            setStatusText('Tiles must be adjacent. New source tile selected.');
            return;
        }

        const nextBoard = board.map((row) => [...row]);
        [nextBoard[selectedCell.row][selectedCell.col], nextBoard[cursor.row][cursor.col]] = [
            nextBoard[cursor.row][cursor.col],
            nextBoard[selectedCell.row][selectedCell.col],
        ];

        const matches = collectMatches(nextBoard);

        if (!matches.length) {
            setSelectedCell(null);
            setStatusText('No match formed. Swap reverted.');
            return;
        }

        const resolved = resolveBoard(nextBoard);
        setBoard(resolved.board);
        setScore((current) => current + resolved.scoreGain);
        setSelectedCell(null);
        setIsDirty(true);
        setStatusText(`Combo scored for ${resolved.scoreGain} points.`);
    };

    const renderGrid = () => {
        const grid = createGrid();
        const tileSpan = getTileSpan(boardLayout.cellSize);

        for (let row = 0; row < boardLayout.size; row += 1) {
            for (let col = 0; col < boardLayout.size; col += 1) {
                const top = boardLayout.rowOrigin + row * boardLayout.cellSize;
                const left = boardLayout.colOrigin + col * boardLayout.cellSize;
                fillRect(grid, top, left, tileSpan, tileSpan, COLORS.match3[board[row][col]]);

                if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
                    fillRect(grid, top, left, tileSpan, 1, COLORS.neutral);
                    fillRect(grid, top, left, 1, tileSpan, COLORS.neutral);
                } else if (cursor.row === row && cursor.col === col) {
                    fillRect(grid, top, left, tileSpan, 1, COLORS.cursor);
                    fillRect(grid, top, left, 1, tileSpan, COLORS.cursor);
                }
            }
        }

        return grid;
    };

    const reset = () => {
        setBoard(createBoard(boardLayout.size));
        setCursor({ row: 0, col: 0 });
        setSelectedCell(null);
        setScore(0);
        setSecondsLeft(timeLimit);
        setIsDirty(false);
        setHasEnded(false);
        setStatusText('Create swaps that form groups of three or more.');
    };

    const getState = () => ({
        board,
        cursor,
        selectedCell,
        score,
        secondsLeft,
    });

    const loadState = (state) => {
        if (!state) {
            return;
        }

        setBoard(state.board || createBoard(boardLayout.size));
        setCursor(state.cursor || { row: 0, col: 0 });
        setSelectedCell(state.selectedCell || null);
        setScore(state.score || 0);
        setSecondsLeft(state.secondsLeft ?? timeLimit);
        setIsDirty(true);
        setHasEnded(false);
        setStatusText('Saved puzzle state restored.');
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
            'Match-3 is a combo puzzle where you line up gems by swapping neighboring tiles. Better chains mean better scoring.',
        guideSections: [
            {
                title: 'Introduction',
                body: 'You are solving a compact puzzle board where each move should aim to create immediate matches or set up cascades.',
            },
            {
                title: 'Objective',
                body: 'Create lines of three or more matching tiles to score points before the timer ends.',
            },
            {
                title: 'Controls',
                body: 'Move the cursor with the d-pad.\nPress Enter once to select a tile.\nPress Enter again on an adjacent tile to attempt a swap.',
            },
            {
                title: 'Rules',
                body: 'Only adjacent tiles can be swapped.\nIf a swap does not create a match, it is cancelled.\nMatched tiles disappear, new tiles fall into place, and combo chains score additional points.',
            },
            {
                title: 'Strategy Tips',
                body: 'Look for moves near the bottom to trigger more cascades.\nThink one move ahead and set up future matches instead of only taking the first visible option.',
            },
        ],
        instructions:
            `Use the d-pad to position the cursor. Press Enter once to select a tile and again on an adjacent tile to swap. Make lines of three or more on a ${boardLayout.size}x${boardLayout.size} board before time runs out.`,
        statusText,
        metaChips: [
            `Board: ${boardLayout.size}x${boardLayout.size}`,
            `Score: ${score}`,
            timeLimit ? `Time left: ${formatDuration(secondsLeft)}` : 'Timer: Off',
            `Mode: ${selectedCell ? 'Swap target' : 'Move cursor'}`,
        ],
    };
};
