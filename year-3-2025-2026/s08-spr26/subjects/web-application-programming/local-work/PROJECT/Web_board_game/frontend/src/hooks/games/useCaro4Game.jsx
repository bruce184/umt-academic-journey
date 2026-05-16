import { useCaroBaseGame } from './useCaroBaseGame';

export const useCaro4Game = ({ onGameOver, gameMeta }) =>
    useCaroBaseGame({
        onGameOver,
        gameMeta,
        targetLength: 4,
        title: 'Caro 4',
    });
