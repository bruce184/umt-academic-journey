import { useEffect, useMemo, useRef, useState } from 'react';
import { COLORS, createGrid, formatDuration, resolveBoardLayout } from './gameUtils';

const createBoard = (boardSize) => Array.from({ length: boardSize }, () => Array(boardSize).fill(null));

const hasLine = (board, row, col, targetLength) => {
    const symbol = board[row][col];
    const boardSize = board.length;

    if (!symbol) {
        return false;
    }

    const directions = [
        [1, 0],
        [0, 1],
        [1, 1],
        [1, -1],
    ];

    return directions.some(([rowStep, colStep]) => {
        let total = 1;

        for (const direction of [-1, 1]) {
            let nextRow = row + rowStep * direction;
            let nextCol = col + colStep * direction;

            while (
                nextRow >= 0 &&
                nextRow < boardSize &&
                nextCol >= 0 &&
                nextCol < boardSize &&
                board[nextRow][nextCol] === symbol
            ) {
                total += 1;
                nextRow += rowStep * direction;
                nextCol += colStep * direction;
            }
        }

        return total >= targetLength;
    });
};

export const useCaroBaseGame = ({ onGameOver, targetLength, title, gameMeta }) => {
    const boardLayout = useMemo(
        () =>
            resolveBoardLayout({
                requestedSize: gameMeta?.board_size,
                fallbackSize: 10,
                minSize: Math.max(5, targetLength),
                maxSize: 20,
                preferredMaxCellSize: 2,
            }),
        [gameMeta?.board_size, targetLength]
    );
    const defaultCursor = useMemo(
        () => ({
            row: Math.floor(boardLayout.size / 2),
            col: Math.floor(boardLayout.size / 2),
        }),
        [boardLayout.size]
    );
    const [board, setBoard] = useState(() => createBoard(boardLayout.size));
    const [cursor, setCursor] = useState(defaultCursor);
    const [playerSide, setPlayerSide] = useState('X');
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [winner, setWinner] = useState(null);
    const [isDirty, setIsDirty] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
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
        if (!winner) {
            return undefined;
        }

        const timeoutId = window.setTimeout(() => {
            const result = winner === 'DRAW' ? 'DRAW' : winner === playerSide ? 'WIN' : 'DEFEAT';
            const score = result === 'WIN' ? 150 : result === 'DRAW' ? 75 : 0;
            onGameOverRef.current(result, score, elapsedSeconds);
        }, 350);

        return () => window.clearTimeout(timeoutId);
    }, [elapsedSeconds, playerSide, winner]);

    const getAvailableMoves = (currentBoard) => {
        const moves = [];

        currentBoard.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (cell === null) {
                    moves.push({ row: rowIndex, col: colIndex });
                }
            });
        });

        return moves;
    };

    const evaluateBoard = (currentBoard, latestMove) => {
        if (latestMove && hasLine(currentBoard, latestMove.row, latestMove.col, targetLength)) {
            return currentBoard[latestMove.row][latestMove.col];
        }

        return getAvailableMoves(currentBoard).length ? null : 'DRAW';
    };

    const triggerAiMove = (currentBoard, aiSide) => {
        window.setTimeout(() => {
            const availableMoves = getAvailableMoves(currentBoard);

            if (!availableMoves.length || evaluateBoard(currentBoard)) {
                return;
            }

            const move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
            const nextBoard = currentBoard.map((row) => [...row]);
            nextBoard[move.row][move.col] = aiSide;
            setBoard(nextBoard);

            const result = evaluateBoard(nextBoard, move);

            if (result) {
                setWinner(result);
                return;
            }

            setIsPlayerTurn(true);
        }, 350);
    };

    const moveCursor = (rowStep, colStep) => {
        if (!isPlayerTurn || winner) {
            return;
        }

        setCursor((current) => ({
            row: (current.row + rowStep + boardLayout.size) % boardLayout.size,
            col: (current.col + colStep + boardLayout.size) % boardLayout.size,
        }));
    };

    const handleEnter = () => {
        if (!isPlayerTurn || winner || board[cursor.row][cursor.col] !== null) {
            return;
        }

        const nextBoard = board.map((row) => [...row]);
        nextBoard[cursor.row][cursor.col] = playerSide;
        setBoard(nextBoard);
        setIsDirty(true);
        setIsPlayerTurn(false);

        const result = evaluateBoard(nextBoard, cursor);

        if (result) {
            setWinner(result);
            return;
        }

        triggerAiMove(nextBoard, playerSide === 'X' ? 'O' : 'X');
    };

    const renderGrid = () => {
        const grid = createGrid();

        for (let row = 0; row < boardLayout.size; row += 1) {
            for (let col = 0; col < boardLayout.size; col += 1) {
                const top = boardLayout.rowOrigin + row * boardLayout.cellSize;
                const left = boardLayout.colOrigin + col * boardLayout.cellSize;
                const value = board[row][col];
                const baseColor = value === 'X' ? COLORS.player : value === 'O' ? COLORS.ai : COLORS.boardMuted;

                for (let innerRow = 0; innerRow < boardLayout.cellSize; innerRow += 1) {
                    for (let innerCol = 0; innerCol < boardLayout.cellSize; innerCol += 1) {
                        grid[top + innerRow][left + innerCol] = baseColor;
                    }
                }

                if (cursor.row === row && cursor.col === col && isPlayerTurn && !winner && value === null) {
                    grid[top][left] = COLORS.cursor;
                    if (boardLayout.cellSize > 1) {
                        grid[top][left + 1] = COLORS.cursor;
                        grid[top + 1][left] = COLORS.cursor;
                        grid[top + 1][left + 1] = COLORS.cursor;
                    }
                }
            }
        }

        return grid;
    };

    const reset = (preferredSide = 'X') => {
        const freshBoard = createBoard(boardLayout.size);
        setBoard(freshBoard);
        setCursor(defaultCursor);
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
        triggerAiMove(freshBoard, 'X');
    };

    const getState = () => ({
        board,
        cursor,
        playerSide,
        isPlayerTurn,
        elapsedSeconds,
    });

    const loadState = (state) => {
        if (!state) {
            return;
        }

        setBoard(state.board || createBoard(boardLayout.size));
        setCursor(state.cursor || defaultCursor);
        setPlayerSide(state.playerSide || 'X');
        setIsPlayerTurn(state.isPlayerTurn !== false);
        setElapsedSeconds(state.elapsedSeconds || 0);
        setWinner(null);
        setIsDirty(true);
        startedAtRef.current = Date.now() - ((state.elapsedSeconds || 0) * 1000);
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
        requiresSideSelection: true,
        runtimeConfig: {
            boardSize: boardLayout.size,
            defaultTimer: 0,
        },
        guideSummary:
            `${title} is a larger-form connection game with more space, longer planning, and stronger positional play than Tic-Tac-Toe.`,
        guideSections: [
            {
                title: 'Introduction',
                body: `${title} expands the classic line-making formula onto a larger board where spacing, defense, and future threats matter more.`,
            },
            {
                title: 'Objective',
                body: `Connect ${targetLength} of your stones in a straight line before the computer does.`,
            },
            {
                title: 'Controls',
                body: 'Move the cursor with the d-pad.\nPress Enter to place a stone on the highlighted empty tile.\nChoose your side before the round starts.',
            },
            {
                title: 'Rules',
                body: 'You cannot place on an occupied cell.\nAfter your move, the computer immediately makes a reply move.\nThe game ends in victory, defeat, or draw when the board is full.',
            },
            {
                title: 'Best Practices',
                body: 'Build multiple threats instead of chasing only one line.\nProtect open-ended sequences.\nBlock the computer early before its line becomes unavoidable.',
            },
        ],
        instructions: `${title} uses the full d-pad. Move the cursor, press Enter to place a stone, and connect ${targetLength} in a row before the computer does on a ${boardLayout.size}x${boardLayout.size} board.`,
        statusText: winner
            ? winner === 'DRAW'
                ? 'The board is full and the round is tied.'
                : winner === playerSide
                    ? `You connected ${targetLength}.`
                    : `The computer connected ${targetLength} first.`
            : isPlayerTurn
                ? 'Pick an open tile to place your next stone.'
                : 'Computer is selecting a reply move.',
        metaChips: [
            `Board: ${boardLayout.size}x${boardLayout.size}`,
            `Goal: ${targetLength} in a row`,
            `Time: ${formatDuration(elapsedSeconds)}`,
            winner
                ? `Result: ${winner === 'DRAW' ? 'Draw' : winner === playerSide ? 'Win' : 'Defeat'}`
                : `Turn: ${isPlayerTurn ? 'You' : 'Computer'}`,
        ],
    };
};
