import { useEffect, useMemo, useRef, useState } from 'react';
import {
    COLORS,
    GRID_SIZE,
    createGrid,
    formatDuration,
    randomItem,
    resolveBoardLayout,
    resolveTimerLimit,
} from './gameUtils';

const DIRECTIONS = {
    UP: { row: -1, col: 0 },
    DOWN: { row: 1, col: 0 },
    LEFT: { row: 0, col: -1 },
    RIGHT: { row: 0, col: 1 },
};

const createStartingSnake = (boardSize) => {
    const centerRow = Math.floor(boardSize / 2);
    const centerCol = Math.floor(boardSize / 2);

    return [
        { row: centerRow, col: centerCol },
        { row: centerRow, col: Math.max(0, centerCol - 1) },
        { row: centerRow, col: Math.max(0, centerCol - 2) },
    ];
};

const getRandomFood = (snake, boardSize) => {
    const occupied = new Set(snake.map(({ row, col }) => `${row}-${col}`));
    const slots = [];

    for (let row = 0; row < boardSize; row += 1) {
        for (let col = 0; col < boardSize; col += 1) {
            if (!occupied.has(`${row}-${col}`)) {
                slots.push({ row, col });
            }
        }
    }

    return randomItem(slots);
};

export const useSnakeGame = ({ onGameOver, gameMeta }) => {
    const boardLayout = useMemo(
        () =>
            resolveBoardLayout({
                requestedSize: gameMeta?.board_size,
                fallbackSize: GRID_SIZE,
                minSize: 8,
                maxSize: GRID_SIZE,
                preferredMaxCellSize: 1,
            }),
        [gameMeta?.board_size]
    );
    const timeLimit = useMemo(
        () => resolveTimerLimit(gameMeta?.default_timer, 0),
        [gameMeta?.default_timer]
    );
    const startingSnake = useMemo(
        () => createStartingSnake(boardLayout.size),
        [boardLayout.size]
    );
    const [snake, setSnake] = useState(startingSnake);
    const [food, setFood] = useState(() => getRandomFood(startingSnake, boardLayout.size));
    const [direction, setDirection] = useState('RIGHT');
    const [queuedDirection, setQueuedDirection] = useState('RIGHT');
    const [isRunning, setIsRunning] = useState(true);
    const [isDirty, setIsDirty] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [score, setScore] = useState(0);
    const [statusText, setStatusText] = useState('Snake is live. Use the d-pad to steer.');
    const [hasEnded, setHasEnded] = useState(false);
    const onGameOverRef = useRef(onGameOver);
    const startedAtRef = useRef(Date.now());

    useEffect(() => {
        onGameOverRef.current = onGameOver;
    }, [onGameOver]);

    useEffect(() => {
        if (!isRunning || hasEnded) {
            return undefined;
        }

        const timerId = window.setInterval(() => {
            setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
        }, 1000);

        return () => window.clearInterval(timerId);
    }, [hasEnded, isRunning]);

    useEffect(() => {
        if (!timeLimit || hasEnded || elapsedSeconds < timeLimit) {
            return;
        }

        setIsRunning(false);
        setHasEnded(true);
        setStatusText('Time limit reached. Round complete.');
        onGameOverRef.current(score > 0 ? 'WIN' : 'DEFEAT', score, timeLimit);
    }, [elapsedSeconds, hasEnded, score, timeLimit]);

    useEffect(() => {
        if (!isRunning || hasEnded) {
            return undefined;
        }

        const tickId = window.setInterval(() => {
            setSnake((currentSnake) => {
                const velocity = DIRECTIONS[queuedDirection];
                const nextHead = {
                    row: currentSnake[0].row + velocity.row,
                    col: currentSnake[0].col + velocity.col,
                };

                const hitsWall =
                    nextHead.row < 0 ||
                    nextHead.row >= boardLayout.size ||
                    nextHead.col < 0 ||
                    nextHead.col >= boardLayout.size;
                const hitsSelf = currentSnake.some(({ row, col }) => row === nextHead.row && col === nextHead.col);

                if (hitsWall || hitsSelf) {
                    setIsRunning(false);
                    setHasEnded(true);
                    setStatusText('Collision detected. Game over.');
                    onGameOverRef.current('DEFEAT', score, elapsedSeconds);
                    return currentSnake;
                }

                setDirection(queuedDirection);
                setIsDirty(true);

                if (nextHead.row === food.row && nextHead.col === food.col) {
                    const nextSnake = [nextHead, ...currentSnake];
                    setScore((current) => current + 10);
                    setFood(getRandomFood(nextSnake, boardLayout.size));
                    setStatusText('Food collected. Keep moving.');
                    return nextSnake;
                }

                return [nextHead, ...currentSnake.slice(0, currentSnake.length - 1)];
            });
        }, 220);

        return () => window.clearInterval(tickId);
    }, [boardLayout.size, elapsedSeconds, food, hasEnded, isRunning, queuedDirection, score]);

    const setNextDirection = (nextDirection) => {
        if (hasEnded) {
            return;
        }

        const opposite = {
            UP: 'DOWN',
            DOWN: 'UP',
            LEFT: 'RIGHT',
            RIGHT: 'LEFT',
        };

        setQueuedDirection((current) => (opposite[current] === nextDirection ? current : nextDirection));
    };

    const handleEnter = () => {
        if (hasEnded) {
            return;
        }

        setIsRunning((current) => !current);
        setStatusText(isRunning ? 'Snake paused. Press Enter to continue.' : 'Snake resumed.');
    };

    const renderGrid = () => {
        const grid = createGrid();

        for (let row = 0; row < boardLayout.size; row += 1) {
            for (let col = 0; col < boardLayout.size; col += 1) {
                grid[boardLayout.rowOrigin + row][boardLayout.colOrigin + col] = COLORS.boardMuted;
            }
        }

        snake.forEach(({ row, col }, index) => {
            grid[boardLayout.rowOrigin + row][boardLayout.colOrigin + col] =
                index === 0 ? COLORS.success : '#16a34a';
        });

        if (food) {
            grid[boardLayout.rowOrigin + food.row][boardLayout.colOrigin + food.col] = COLORS.danger;
        }

        return grid;
    };

    const reset = () => {
        const nextSnake = createStartingSnake(boardLayout.size);
        setSnake(nextSnake);
        setFood(getRandomFood(nextSnake, boardLayout.size));
        setDirection('RIGHT');
        setQueuedDirection('RIGHT');
        setIsRunning(true);
        setIsDirty(false);
        setElapsedSeconds(0);
        setScore(0);
        setStatusText('Snake is live. Use the d-pad to steer.');
        setHasEnded(false);
        startedAtRef.current = Date.now();
    };

    const getState = () => ({
        snake,
        food,
        direction,
        queuedDirection,
        elapsedSeconds,
        score,
        isRunning,
    });

    const loadState = (state) => {
        if (!state) {
            return;
        }

        const restoredSnake = state.snake || createStartingSnake(boardLayout.size);
        setSnake(restoredSnake);
        setFood(state.food || getRandomFood(restoredSnake, boardLayout.size));
        setDirection(state.direction || 'RIGHT');
        setQueuedDirection(state.queuedDirection || state.direction || 'RIGHT');
        setElapsedSeconds(state.elapsedSeconds || 0);
        setScore(state.score || 0);
        setIsRunning(state.isRunning !== false);
        setStatusText('Saved snake state restored.');
        setIsDirty(true);
        setHasEnded(false);
        startedAtRef.current = Date.now() - ((state.elapsedSeconds || 0) * 1000);
    };

    return {
        gridPixels: renderGrid(),
        handleLeft: () => setNextDirection('LEFT'),
        handleRight: () => setNextDirection('RIGHT'),
        handleUp: () => setNextDirection('UP'),
        handleDown: () => setNextDirection('DOWN'),
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
            'Snake is an arcade survival run. Stay in motion, collect food to grow your score, and avoid crashing into walls or yourself.',
        guideSections: [
            {
                title: 'Introduction',
                body: 'The snake moves continuously once the round begins, so this game is about rhythm, route planning, and fast corrections.',
            },
            {
                title: 'Objective',
                body: 'Eat food to increase your score and survive as long as possible within the arena.',
            },
            {
                title: 'Controls',
                body: 'Use the d-pad to change direction.\nPress Enter to pause or resume the run.',
            },
            {
                title: 'Rules',
                body: 'The snake cannot reverse directly into its own body.\nTouching a wall or your own body ends the round.\nIf a timer is enabled, the round ends when time runs out.',
            },
            {
                title: 'Survival Tips',
                body: 'Leave yourself escape lanes.\nAvoid trapping the snake in tight loops near the walls.\nUse open space to recover before chasing the next food.',
            },
        ],
        instructions:
            `Snake starts immediately on a ${boardLayout.size}x${boardLayout.size} arena. Use the d-pad to steer, avoid walls and your own body, and press Enter to pause or resume.`,
        statusText,
        metaChips: [
            `Board: ${boardLayout.size}x${boardLayout.size}`,
            `Score: ${score}`,
            timeLimit
                ? `Time left: ${formatDuration(Math.max(0, timeLimit - elapsedSeconds))}`
                : `Time: ${formatDuration(elapsedSeconds)}`,
            `Status: ${isRunning ? 'Live' : hasEnded ? 'Finished' : 'Paused'}`,
        ],
    };
};
