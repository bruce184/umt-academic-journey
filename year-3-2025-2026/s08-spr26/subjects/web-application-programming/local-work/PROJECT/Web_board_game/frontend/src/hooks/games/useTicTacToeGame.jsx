import { useEffect, useRef, useState } from 'react';
import { COLORS, createGrid, formatDuration } from './gameUtils';

const BOARD_START = 3;
const CELL_SIZE = 4;
const LINE_COLOR = 'rgba(148, 163, 184, 0.68)';

const WIN_LINES = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

const getCellOrigin = (index) => ({
    row: BOARD_START + Math.floor(index / 3) * (CELL_SIZE + 1),
    col: BOARD_START + (index % 3) * (CELL_SIZE + 1),
});

const checkWinner = (board) => {
    for (const [a, b, c] of WIN_LINES) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }

    if (!board.includes(null)) {
        return 'DRAW';
    }

    return null;
};

export const useTicTacToeGame = ({ onGameOver }) => {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [cursorIndex, setCursorIndex] = useState(0);
    const [playerSide, setPlayerSide] = useState('X');
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [winner, setWinner] = useState(null);
    const [isDirty, setIsDirty] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [showCursor, setShowCursor] = useState(true);
    const startedAtRef = useRef(Date.now());
    const onGameOverRef = useRef(onGameOver);

    useEffect(() => {
        onGameOverRef.current = onGameOver;
    }, [onGameOver]);

    useEffect(() => {
        if (!isDirty || winner) {
            return undefined;
        }

        const intervalId = window.setInterval(() => {
            setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
        }, 1000);

        return () => window.clearInterval(intervalId);
    }, [isDirty, winner]);

    useEffect(() => {
        if (!isPlayerTurn || winner) {
            setShowCursor(true);
            return undefined;
        }

        const intervalId = window.setInterval(() => {
            setShowCursor((current) => !current);
        }, 250);

        return () => window.clearInterval(intervalId);
    }, [cursorIndex, isPlayerTurn, winner]);

    useEffect(() => {
        const nextWinner = checkWinner(board);

        if (!nextWinner || winner) {
            return;
        }

        setWinner(nextWinner);
    }, [board, winner]);

    useEffect(() => {
        if (!winner) {
            return undefined;
        }

        const timeoutId = window.setTimeout(() => {
            const resultFlag =
                winner === 'DRAW' ? 'DRAW' : winner === playerSide ? 'WIN' : 'DEFEAT';
            const score = resultFlag === 'WIN' ? 100 : resultFlag === 'DRAW' ? 50 : 0;
            onGameOverRef.current(resultFlag, score, elapsedSeconds);
        }, 350);

        return () => window.clearTimeout(timeoutId);
    }, [winner, playerSide]);

    const triggerAiMove = (currentBoard, aiSide) => {
        window.setTimeout(() => {
            const availableMoves = currentBoard
                .map((cell, index) => (cell === null ? index : null))
                .filter((index) => index !== null);

            if (!availableMoves.length || checkWinner(currentBoard)) {
                return;
            }

            const nextIndex = availableMoves[Math.floor(Math.random() * availableMoves.length)];
            const nextBoard = [...currentBoard];
            nextBoard[nextIndex] = aiSide;
            setBoard(nextBoard);
            setIsPlayerTurn(true);
        }, 450);
    };

    const handleLeft = () => {
        if (!isPlayerTurn || winner) {
            return;
        }

        setCursorIndex((current) => {
            const row = Math.floor(current / 3);
            const col = current % 3;
            return row * 3 + (col === 0 ? 2 : col - 1);
        });
    };

    const handleRight = () => {
        if (!isPlayerTurn || winner) {
            return;
        }

        setCursorIndex((current) => {
            const row = Math.floor(current / 3);
            const col = current % 3;
            return row * 3 + (col === 2 ? 0 : col + 1);
        });
    };

    const handleUp = () => {
        if (!isPlayerTurn || winner) {
            return;
        }

        setCursorIndex((current) => {
            const row = Math.floor(current / 3);
            const col = current % 3;
            return (row === 0 ? 2 : row - 1) * 3 + col;
        });
    };

    const handleDown = () => {
        if (!isPlayerTurn || winner) {
            return;
        }

        setCursorIndex((current) => {
            const row = Math.floor(current / 3);
            const col = current % 3;
            return (row === 2 ? 0 : row + 1) * 3 + col;
        });
    };

    const handleEnter = () => {
        if (!isPlayerTurn || winner || board[cursorIndex] !== null) {
            return;
        }

        const nextBoard = [...board];
        nextBoard[cursorIndex] = playerSide;

        setBoard(nextBoard);
        setIsDirty(true);
        setIsPlayerTurn(false);

        if (!checkWinner(nextBoard)) {
            triggerAiMove(nextBoard, playerSide === 'X' ? 'O' : 'X');
        }
    };

    const renderGrid = () => {
        const grid = createGrid();
        const firstLine = BOARD_START + CELL_SIZE;
        const secondLine = BOARD_START + CELL_SIZE * 2 + 1;
        const boardEnd = BOARD_START + CELL_SIZE * 3 + 1;

        for (let index = BOARD_START; index <= boardEnd; index += 1) {
            grid[firstLine][index] = LINE_COLOR;
            grid[secondLine][index] = LINE_COLOR;
            grid[index][firstLine] = LINE_COLOR;
            grid[index][secondLine] = LINE_COLOR;
        }

        if (showCursor && isPlayerTurn && !winner && board[cursorIndex] === null) {
            const { row, col } = getCellOrigin(cursorIndex);

            for (let innerRow = 0; innerRow < CELL_SIZE; innerRow += 1) {
                for (let innerCol = 0; innerCol < CELL_SIZE; innerCol += 1) {
                    grid[row + innerRow][col + innerCol] = COLORS.cursor;
                }
            }
        }

        board.forEach((value, index) => {
            const { row, col } = getCellOrigin(index);

            if (value === 'X') {
                for (let offset = 0; offset < CELL_SIZE; offset += 1) {
                    grid[row + offset][col + offset] = COLORS.player;
                    grid[row + offset][col + CELL_SIZE - 1 - offset] = COLORS.player;
                }
            }

            if (value === 'O') {
                grid[row][col + 1] = COLORS.ai;
                grid[row][col + 2] = COLORS.ai;
                grid[row + 1][col] = COLORS.ai;
                grid[row + 1][col + 3] = COLORS.ai;
                grid[row + 2][col] = COLORS.ai;
                grid[row + 2][col + 3] = COLORS.ai;
                grid[row + 3][col + 1] = COLORS.ai;
                grid[row + 3][col + 2] = COLORS.ai;
            }
        });

        return grid;
    };

    const reset = (preferredSide = 'X') => {
        setBoard(Array(9).fill(null));
        setCursorIndex(0);
        setPlayerSide(preferredSide);
        setWinner(null);
        setIsDirty(false);
        setElapsedSeconds(0);
        startedAtRef.current = Date.now();

        if (preferredSide === 'X') {
            setIsPlayerTurn(true);
            return;
        }

        setIsPlayerTurn(false);
        triggerAiMove(Array(9).fill(null), 'X');
    };

    const getState = () => ({
        board,
        cursorIndex,
        playerSide,
        isPlayerTurn,
        elapsedSeconds,
    });

    const loadState = (state) => {
        if (!state) {
            return;
        }

        setBoard(state.board || Array(9).fill(null));
        setCursorIndex(state.cursorIndex || 0);
        setPlayerSide(state.playerSide || 'X');
        setIsPlayerTurn(state.isPlayerTurn !== false);
        setElapsedSeconds(state.elapsedSeconds || 0);
        setWinner(null);
        setIsDirty(true);
        startedAtRef.current = Date.now() - ((state.elapsedSeconds || 0) * 1000);
    };

    return {
        gridPixels: renderGrid(),
        handleLeft,
        handleRight,
        handleUp,
        handleDown,
        handleEnter,
        reset,
        getState,
        loadState,
        isDirty,
        requiresSideSelection: true,
        guideSummary:
            'A quick head-to-head grid duel where every move matters. You and the computer take turns placing marks, racing to create the first line of three.',
        guideSections: [
            {
                title: 'Introduction',
                body: 'Tic-Tac-Toe is a fast pattern game built around short turns, quick reads, and strong positioning.',
            },
            {
                title: 'Objective',
                body: 'Place three of your marks in a straight horizontal, vertical, or diagonal line before the computer does.',
            },
            {
                title: 'Controls',
                body: 'Use the d-pad to move the cursor across the 3x3 board.\nPress Enter to place your mark on an empty tile.',
            },
            {
                title: 'Rules',
                body: 'You can only place on empty spaces.\nTurns alternate between you and the computer.\nIf the board fills with no winning line, the round ends in a draw.',
            },
            {
                title: 'Strategy Tips',
                body: 'Take the center early when possible.\nWatch for two-in-a-row threats.\nBlock immediately if the computer can finish on the next turn.',
            },
        ],
        instructions:
            'Move the cursor with the arrow controls. Press Enter to place your symbol. Get three in a row before the computer does.',
        statusText: winner
            ? winner === 'DRAW'
                ? 'Round ended in a draw.'
                : winner === playerSide
                    ? 'You completed the winning line.'
                    : 'The computer closed the board first.'
            : isPlayerTurn
                ? 'Your turn to place a mark.'
                : 'Computer is thinking...',
        metaChips: [
            `Side: ${playerSide}`,
            `Time: ${formatDuration(elapsedSeconds)}`,
            winner
                ? `Result: ${winner === 'DRAW' ? 'Draw' : winner === playerSide ? 'Win' : 'Defeat'}`
                : `Turn: ${isPlayerTurn ? 'You' : 'Computer'}`,
        ],
    };
};
