import { useEffect } from 'react';

/**
 * Mappings physical key presses to our unified 5-button contract.
 * Also includes directional up/down just in case but they are optional.
 */
export const usePhysicalControls = (handlers, isActive = true) => {
    useEffect(() => {
        if (!isActive) return;

        const handleKeyDown = (e) => {
            // Prevent default behavior to stop window scrolling when pressing arrows or space
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }

            switch (e.key) {
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    if (handlers.onLeft) handlers.onLeft();
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    if (handlers.onRight) handlers.onRight();
                    break;
                case 'ArrowUp':
                case 'w':
                case 'W':
                    if (handlers.onUp) handlers.onUp();
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    if (handlers.onDown) handlers.onDown();
                    break;
                case 'Enter':
                case ' ':
                    if (handlers.onEnter) handlers.onEnter();
                    break;
                case 'Escape':
                case 'Backspace':
                    if (handlers.onBack) handlers.onBack();
                    break;
                case 'h':
                case 'H':
                    if (handlers.onHint) handlers.onHint();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handlers, isActive]);
};
