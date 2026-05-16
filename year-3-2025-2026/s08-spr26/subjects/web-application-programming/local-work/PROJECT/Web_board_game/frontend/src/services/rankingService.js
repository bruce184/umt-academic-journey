import { apiRequest } from './http';

export const rankingService = {
    getRankings: async (gameId, scope = 'global', page = 1, pageSize = 10) => {
        return await apiRequest(`/api/rankings?gameId=${gameId}&scope=${scope}&page=${page}&pageSize=${pageSize}`);
    }
};
