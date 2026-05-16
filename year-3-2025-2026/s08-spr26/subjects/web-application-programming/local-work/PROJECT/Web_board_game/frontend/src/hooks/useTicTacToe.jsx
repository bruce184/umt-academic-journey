import { useState, useEffect, useRef } from 'react';

const GRID_SIZE = 20;
const BOARD_START = 3;
const CELL_SIZE = 4;
const COLOR_LINE = '#111827';
const COLOR_X = '#ef4444'; // Red
const COLOR_O = '#3b82f6'; // Blue
const COLOR_CURSOR = '#93c5fd';

const getCellOrigin = (idx) => ({
    rowStart: BOARD_START + Math.floor(idx / 3) * (CELL_SIZE + 1),
    colStart: BOARD_START + (idx % 3) * (CELL_SIZE + 1),
});

export const useTicTacToe = ({ onGameOver }) => {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [cursorIdx, setCursorIdx] = useState(0);
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [winner, setWinner] = useState(null);
    const [playerSide, setPlayerSide] = useState('X'); // 'X' or 'O'
    const [isDirty, setIsDirty] = useState(false);
    const [showCursor, setShowCursor] = useState(true);

    // Lateral movement
    const handleLeft = () => {
        if (!isPlayerTurn || winner) return;
        setCursorIdx((prev) => {
            const row = Math.floor(prev / 3);
            const col = prev % 3;
            const nextCol = col === 0 ? 2 : col - 1;
            return row * 3 + nextCol;
        });
    };

    const handleRight = () => {
        if (!isPlayerTurn || winner) return;
        setCursorIdx((prev) => {
            const row = Math.floor(prev / 3);
            const col = prev % 3;
            const nextCol = col === 2 ? 0 : col + 1;
            return row * 3 + nextCol;
        });
    };

    const handleUp = () => {
        if (!isPlayerTurn || winner) return;
        setCursorIdx((prev) => {
            const row = Math.floor(prev / 3);
            const col = prev % 3;
            const nextRow = row === 0 ? 2 : row - 1;
            return nextRow * 3 + col;
        });
    };

    const handleDown = () => {
        if (!isPlayerTurn || winner) return;
        setCursorIdx((prev) => {
            const row = Math.floor(prev / 3);
            const col = prev % 3;
            const nextRow = row === 2 ? 0 : row + 1;
            return nextRow * 3 + col;
        });
    };

    const onGameOverRef = useRef(onGameOver);
    useEffect(() => {
        onGameOverRef.current = onGameOver;
    }, [onGameOver]);

    const checkWinner = (squares) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a];
            }
        }
        if (!squares.includes(null)) return 'DRAW';
        return null;
    };

    useEffect(() => {
        const foundWinner = checkWinner(board);
        if (foundWinner) {
            setWinner(foundWinner);
            const timer = setTimeout(() => {
                const resultFlag = foundWinner === 'DRAW' ? 'DRAW' : (foundWinner === playerSide ? 'WIN' : 'DEFEAT');
                const mockScore = foundWinner === playerSide ? 100 : 0;
                const mockDuration = 45; // 45s mock time
                onGameOverRef.current(resultFlag, mockScore, mockDuration);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [board]);

    useEffect(() => {
        if (!isPlayerTurn || winner) {
            setShowCursor(true);
            return undefined;
        }

        setShowCursor(true);
        const interval = window.setInterval(() => {
            setShowCursor((prev) => !prev);
        }, 250);

        return () => window.clearInterval(interval);
    }, [cursorIdx, isPlayerTurn, winner]);

    const triggerAiMove = (currentBoard, overrideAiSymbol) => {
        const aiSymbol = overrideAiSymbol || (playerSide === 'X' ? 'O' : 'X');
        setTimeout(() => {
            const available = currentBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
            if (available.length > 0 && !checkWinner(currentBoard)) {
                const aiMove = available[Math.floor(Math.random() * available.length)];
                const nextBoard = [...currentBoard];
                nextBoard[aiMove] = aiSymbol;
                setBoard(nextBoard);
                setIsPlayerTurn(true);
            }
        }, 600);
    };

    const handleEnter = () => {
        if (!isPlayerTurn || board[cursorIdx] !== null || winner) return;

        const newBoard = [...board];
        newBoard[cursorIdx] = playerSide;
        setBoard(newBoard);
        setIsPlayerTurn(false);
        setIsDirty(true);

        const currentWinner = checkWinner(newBoard);
        if (!currentWinner) {
            triggerAiMove(newBoard);
        }
    };

    const renderGrid = () => {
        const grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));

        const firstLine = BOARD_START + CELL_SIZE;
        const secondLine = BOARD_START + CELL_SIZE * 2 + 1;
        const boardEnd = BOARD_START + CELL_SIZE * 3 + 1;

        for (let i = BOARD_START; i <= boardEnd; i++) {
            grid[firstLine][i] = COLOR_LINE;
            grid[secondLine][i] = COLOR_LINE;
            grid[i][firstLine] = COLOR_LINE;
            grid[i][secondLine] = COLOR_LINE;
        }

        if (showCursor) {
            const { rowStart, colStart } = getCellOrigin(cursorIdx);
            for (let r = 0; r < CELL_SIZE; r++) {
                for (let c = 0; c < CELL_SIZE; c++) {
                    grid[rowStart + r][colStart + c] = COLOR_CURSOR;
                }
            }
        }

        board.forEach((val, idx) => {
            const { rowStart, colStart } = getCellOrigin(idx);
            if (val === 'X') {
                for (let i = 0; i < CELL_SIZE; i++) {
                    grid[rowStart + i][colStart + i] = COLOR_X;
                    grid[rowStart + i][colStart + (CELL_SIZE - 1 - i)] = COLOR_X;
                }
            } else if (val === 'O') {
                grid[rowStart][colStart + 1] = COLOR_O;
                grid[rowStart][colStart + 2] = COLOR_O;
                grid[rowStart + 1][colStart] = COLOR_O;
                grid[rowStart + 1][colStart + 3] = COLOR_O;
                grid[rowStart + 2][colStart] = COLOR_O;
                grid[rowStart + 2][colStart + 3] = COLOR_O;
                grid[rowStart + 3][colStart + 1] = COLOR_O;
                grid[rowStart + 3][colStart + 2] = COLOR_O;
            }
        });

        return grid;
    };

    const reset = (preferredSide = 'X') => {
        setBoard(Array(9).fill(null));
        setCursorIdx(0);
        setWinner(null);
        setPlayerSide(preferredSide);
        setIsDirty(false);

        if (preferredSide === 'X') {
            setIsPlayerTurn(true);
        } else {
            setIsPlayerTurn(false);
            // If player is O, AI must be X. Pass 'X' explicitly to avoid stale state
            triggerAiMove(Array(9).fill(null), 'X');
        }
    };

    const getState = () => ({
        board,
        cursorIdx,
        isPlayerTurn,
        playerSide
    });

    const loadState = (state) => {
        if (!state) return;
        setBoard(state.board);
        setCursorIdx(state.cursorIdx);
        setIsPlayerTurn(state.isPlayerTurn);
        setPlayerSide(state.playerSide || 'X');
        setIsDirty(false); // Loading doesn't count as "making a move" in the current session
        
        if (!state.isPlayerTurn && !checkWinner(state.board)) {
            triggerAiMove(state.board);
        }
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
        playerSide
    };
};
