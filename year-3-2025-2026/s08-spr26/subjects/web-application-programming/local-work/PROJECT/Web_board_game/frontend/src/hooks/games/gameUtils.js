export const GRID_SIZE = 20;

export const COLORS = {
    background: '#020617',
    board: '#0f172a',
    boardMuted: 'rgba(148, 163, 184, 0.4)',
    frame: '#334155',
    cursor: '#93c5fd',
    player: '#f97316',
    ai: '#38bdf8',
    success: '#22c55e',
    danger: '#ef4444',
    warning: '#facc15',
    neutral: '#cbd5e1',
    palette: ['#ef4444', '#f97316', '#facc15', '#22c55e', '#38bdf8', '#a855f7'],
    match3: ['#ef4444', '#f97316', '#facc15', '#22c55e', '#38bdf8'],
    memory: ['#ef4444', '#f97316', '#facc15', '#22c55e', '#38bdf8', '#a855f7', '#ec4899', '#14b8a6'],
};

export const createGrid = (fill = null) =>
    Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(fill));

export const fillRect = (grid, top, left, height, width, color) => {
    for (let row = top; row < top + height; row += 1) {
        for (let col = left; col < left + width; col += 1) {
            if (grid[row] && grid[row][col] !== undefined) {
                grid[row][col] = color;
            }
        }
    }
};

export const normalizeGameKey = (value = '') => value.toUpperCase().replace(/[^A-Z0-9]/g, '');

export const randomItem = (items) => items[Math.floor(Math.random() * items.length)];

export const shuffle = (items) => {
    const next = [...items];

    for (let index = next.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    }

    return next;
};

export const formatDuration = (seconds = 0) => {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
};

export const clampInteger = (value, { min = 0, max = GRID_SIZE, fallback = min } = {}) => {
    const parsed = Number.parseInt(value, 10);

    if (Number.isNaN(parsed)) {
        return fallback;
    }

    return Math.min(max, Math.max(min, parsed));
};

const clampEven = (value, min, max) => {
    let next = value;

    if (next % 2 !== 0) {
        next = next < max ? next + 1 : next - 1;
    }

    return Math.min(max, Math.max(min, next));
};

export const resolveBoardLayout = ({
    requestedSize,
    fallbackSize,
    minSize = 1,
    maxSize = GRID_SIZE,
    preferredMaxCellSize = 1,
    topPadding = 0,
    bottomPadding = 0,
    leftPadding = 0,
    rightPadding = 0,
    requireEven = false,
} = {}) => {
    const availableRows = Math.max(1, GRID_SIZE - topPadding - bottomPadding);
    const availableCols = Math.max(1, GRID_SIZE - leftPadding - rightPadding);
    const hardMaxSize = Math.max(1, Math.min(maxSize, availableRows, availableCols));

    let resolvedSize = clampInteger(requestedSize, {
        min: minSize,
        max: hardMaxSize,
        fallback: clampInteger(fallbackSize, {
            min: minSize,
            max: hardMaxSize,
            fallback: minSize,
        }),
    });

    if (requireEven) {
        const evenMin = minSize % 2 === 0 ? minSize : minSize + 1;
        const evenMax = hardMaxSize % 2 === 0 ? hardMaxSize : hardMaxSize - 1;
        resolvedSize = clampEven(resolvedSize, evenMin, Math.max(evenMin, evenMax));
    }

    const cellSize = Math.max(
        1,
        Math.min(
            preferredMaxCellSize,
            Math.floor(Math.min(availableRows, availableCols) / resolvedSize)
        )
    );

    return {
        size: resolvedSize,
        cellSize,
        rowOrigin:
            topPadding +
            Math.max(0, Math.floor((availableRows - resolvedSize * cellSize) / 2)),
        colOrigin:
            leftPadding +
            Math.max(0, Math.floor((availableCols - resolvedSize * cellSize) / 2)),
    };
};

export const resolveTimerLimit = (value, fallback = 0) =>
    clampInteger(value, { min: 0, max: 3600, fallback });

export const getTileSpan = (cellSize) => Math.max(1, cellSize - 1);
