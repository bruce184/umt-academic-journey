import { useMemo, useState } from 'react';
import { COLORS, createGrid, fillRect, resolveBoardLayout } from './gameUtils';

const createCanvas = (canvasSize) => Array.from({ length: canvasSize }, () => Array(canvasSize).fill(null));

export const useDrawGame = ({ gameMeta }) => {
    const boardLayout = useMemo(
        () =>
            resolveBoardLayout({
                requestedSize: gameMeta?.board_size,
                fallbackSize: 16,
                minSize: 8,
                maxSize: 16,
                preferredMaxCellSize: 1,
                topPadding: 4,
            }),
        [gameMeta?.board_size]
    );
    const [pixels, setPixels] = useState(() => createCanvas(boardLayout.size));
    const [cursor, setCursor] = useState({ row: 0, col: 0 });
    const [mode, setMode] = useState('canvas');
    const [paletteCursor, setPaletteCursor] = useState(0);
    const [currentColorIndex, setCurrentColorIndex] = useState(0);
    const [isDirty, setIsDirty] = useState(false);

    const renderGrid = () => {
        const grid = createGrid();

        COLORS.palette.forEach((color, index) => {
            fillRect(grid, 0, 2 + index * 3, 2, 2, color);

            if (currentColorIndex === index) {
                grid[2][2 + index * 3] = COLORS.neutral;
                grid[2][3 + index * 3] = COLORS.neutral;
            }

            if (mode === 'palette' && paletteCursor === index) {
                grid[0][1 + index * 3] = COLORS.cursor;
                grid[1][1 + index * 3] = COLORS.cursor;
            }
        });

        for (let row = 0; row < boardLayout.size; row += 1) {
            for (let col = 0; col < boardLayout.size; col += 1) {
                grid[boardLayout.rowOrigin + row][boardLayout.colOrigin + col] = pixels[row][col] || COLORS.boardMuted;
            }
        }

        if (mode === 'canvas') {
            grid[boardLayout.rowOrigin + cursor.row][boardLayout.colOrigin + cursor.col] = COLORS.cursor;
        }

        return grid;
    };

    const handleLeft = () => {
        if (mode === 'palette') {
            setPaletteCursor((current) => (current === 0 ? COLORS.palette.length - 1 : current - 1));
            return;
        }

        setCursor((current) => ({
            ...current,
            col: current.col === 0 ? boardLayout.size - 1 : current.col - 1,
        }));
    };

    const handleRight = () => {
        if (mode === 'palette') {
            setPaletteCursor((current) => (current === COLORS.palette.length - 1 ? 0 : current + 1));
            return;
        }

        setCursor((current) => ({
            ...current,
            col: current.col === boardLayout.size - 1 ? 0 : current.col + 1,
        }));
    };

    const handleUp = () => {
        if (mode === 'palette') {
            return;
        }

        if (cursor.row === 0) {
            setMode('palette');
            return;
        }

        setCursor((current) => ({
            ...current,
            row: current.row - 1,
        }));
    };

    const handleDown = () => {
        if (mode === 'palette') {
            setMode('canvas');
            return;
        }

        setCursor((current) => ({
            ...current,
            row: current.row === boardLayout.size - 1 ? 0 : current.row + 1,
        }));
    };

    const handleEnter = () => {
        if (mode === 'palette') {
            setCurrentColorIndex(paletteCursor);
            return;
        }

        setPixels((current) =>
            current.map((row, rowIndex) =>
                row.map((value, colIndex) => {
                    if (rowIndex !== cursor.row || colIndex !== cursor.col) {
                        return value;
                    }

                    return value === COLORS.palette[currentColorIndex] ? null : COLORS.palette[currentColorIndex];
                })
            )
        );
        setIsDirty(true);
    };

    const reset = () => {
        setPixels(createCanvas(boardLayout.size));
        setCursor({ row: 0, col: 0 });
        setMode('canvas');
        setPaletteCursor(0);
        setCurrentColorIndex(0);
        setIsDirty(false);
    };

    const getState = () => ({
        pixels,
        cursor,
        mode,
        paletteCursor,
        currentColorIndex,
    });

    const loadState = (state) => {
        if (!state) {
            return;
        }

        setPixels(state.pixels || createCanvas(boardLayout.size));
        setCursor(state.cursor || { row: 0, col: 0 });
        setMode(state.mode || 'canvas');
        setPaletteCursor(state.paletteCursor || 0);
        setCurrentColorIndex(state.currentColorIndex || 0);
        setIsDirty(true);
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
        requiresSideSelection: false,
        runtimeConfig: {
            boardSize: boardLayout.size,
            defaultTimer: 0,
        },
        guideSummary:
            'Free Draw is a relaxed pixel canvas. Choose a color from the palette, move across the board, and paint or erase tiles to create your own design.',
        guideSections: [
            {
                title: 'Introduction',
                body: 'This mode is more of a creative sandbox than a competitive game. Use it to sketch icons, patterns, or simple pixel art.',
            },
            {
                title: 'Objective',
                body: 'There is no win condition. Your goal is simply to create or edit artwork on the canvas.',
            },
            {
                title: 'Controls',
                body: 'Use the d-pad to move around the canvas.\nMove upward from the top row to enter the color palette.\nPress Enter in palette mode to choose a color.\nPress Enter on the canvas to paint or erase the current pixel.',
            },
            {
                title: 'Rules',
                body: 'Painting the current color onto an empty tile fills it.\nPressing Enter on a tile that already has the selected color erases it.\nThe palette stays available at the top whenever you want to switch colors.',
            },
            {
                title: 'Creative Tips',
                body: 'Block in larger shapes first, then refine edges.\nUse color contrast to keep your drawing readable on the LED-style board.',
            },
        ],
        instructions:
            `Use the d-pad to move the cursor around the ${boardLayout.size}x${boardLayout.size} canvas. Move upward from the top row to enter palette mode, choose a color with Enter, then come back down to paint pixels.`,
        statusText: mode === 'palette' ? 'Palette mode active. Choose your paint color.' : 'Canvas mode active. Enter paints or erases the current pixel.',
        metaChips: [
            `Board: ${boardLayout.size}x${boardLayout.size}`,
            `Color: ${currentColorIndex + 1}`,
            `Mode: ${mode === 'palette' ? 'Palette' : 'Canvas'}`,
            `Changes: ${isDirty ? 'Unsaved' : 'Clean'}`,
        ],
    };
};
