import { apiRequest } from './http';

export const getProfile = () => apiRequest('/api/profile');

export const updateProfile = (payload) =>
    apiRequest('/api/profile', {
        method: 'PATCH',
        body: payload,
    });
