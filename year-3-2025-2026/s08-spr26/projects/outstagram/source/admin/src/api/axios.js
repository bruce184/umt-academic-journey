import axios from 'axios';
import { supabase } from '../lib/supabase.js';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/v1/admin`,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

api.interceptors.response.use((response) => response, (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
        // If unauthorized/forbidden, should normally redirect or logout
        // Handled in components or auth store for now
        console.error("Admin API Error:", error.response?.data?.message || "Unauthorized / Forbidden");
    }
    return Promise.reject(error);
});

export default api;
