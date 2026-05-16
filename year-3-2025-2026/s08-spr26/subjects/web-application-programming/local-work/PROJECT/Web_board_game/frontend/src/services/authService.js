import { apiRequest } from './http';

export const loginUser = (email, password) =>
    apiRequest('/api/auth/login', {
        method: 'POST',
        body: { email, password },
        skipAuth: true,
    });

export const registerUser = (username, email, password) =>
    apiRequest('/api/auth/register', {
        method: 'POST',
        body: { username, email, password },
        skipAuth: true,
    });

export const verifyRegisterToken = (token) =>
    apiRequest('/api/auth/verify-register', {
        method: 'POST',
        body: { token },
        skipAuth: true,
    });

export const requestPasswordResetEmail = (email, newPassword) =>
    apiRequest('/api/auth/request-password-reset', {
        method: 'POST',
        body: { email, newPassword },
        skipAuth: true,
    });

export const verifyResetToken = (token) =>
    apiRequest('/api/auth/verify-reset', {
        method: 'POST',
        body: { token },
        skipAuth: true,
    });

export const getCurrentUser = (token) => apiRequest('/api/profile', { token });
