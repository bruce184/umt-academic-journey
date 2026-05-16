import { apiRequest } from './http';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const adminService = {
    getDashboard: async () => apiRequest('/api/admin/dashboard'),

    getUsers: async ({ page = 1, pageSize = 10, search = '', role = '', active = '' } = {}) => {
        const params = new URLSearchParams({
            page: String(page),
            pageSize: String(pageSize),
        });

        if (search) params.set('search', search);
        if (role) params.set('role', role);
        if (active) params.set('active', active);

        return apiRequest(`/api/admin/users?${params.toString()}`);
    },

    updateUser: async (id, payload) =>
        apiRequest(`/api/admin/users/${id}`, {
            method: 'PATCH',
            body: payload,
        }),

    getGames: async ({ page = 1, pageSize = 20 } = {}) =>
        apiRequest(`/api/admin/games?page=${page}&pageSize=${pageSize}`),

    updateGame: async (id, payload) =>
        apiRequest(`/api/admin/games/${id}`, {
            method: 'PATCH',
            body: payload,
        }),

    getStats: async () => apiRequest('/api/admin/stats'),

    getApiDocsHtml: async (apiKey) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api-docs`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'x-api-key': apiKey,
            },
        });

        const payload = await response.text();

        if (!response.ok) {
            throw new Error(payload || 'Failed to load API docs');
        }

        return payload;
    },
};
