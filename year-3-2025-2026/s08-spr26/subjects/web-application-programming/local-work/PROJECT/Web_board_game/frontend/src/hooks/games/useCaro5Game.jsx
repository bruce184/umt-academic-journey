import { useCaroBaseGame } from './useCaroBaseGame';

export const useCaro5Game = ({ onGameOver, gameMeta }) =>
    useCaroBaseGame({
        onGameOver,
        gameMeta,
        targetLength: 5,
        title: 'Caro 5',
    });
