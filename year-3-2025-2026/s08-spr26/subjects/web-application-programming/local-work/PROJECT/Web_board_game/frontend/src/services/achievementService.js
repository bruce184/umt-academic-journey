import { apiRequest } from './http';

export const getAchievementCatalog = () => apiRequest('/api/achievements');

export const getMyAchievements = () => apiRequest('/api/achievements/me');
