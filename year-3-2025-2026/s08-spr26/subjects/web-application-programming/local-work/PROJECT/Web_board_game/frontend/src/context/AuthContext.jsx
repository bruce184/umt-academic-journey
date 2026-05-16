import React, { createContext, useState, useContext, useEffect } from 'react';
import {
    getCurrentUser,
    loginUser,
    registerUser,
    requestPasswordResetEmail,
    verifyRegisterToken,
    verifyResetToken,
} from '../services/authService';
import { updateProfile as updateProfileRequest } from '../services/profileService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const clearSession = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
    };

    const logout = () => {
        clearSession();
    };

    const refreshUser = async (activeToken = token) => {
        if (!activeToken) return null;

        const data = await getCurrentUser(activeToken);
        setUser(data.data.user);
        return data.data.user;
    };

    const login = async (email, password) => {
        const data = await loginUser(email, password);
        const nextToken = data.token;

        setUser(data.data.user);
        setToken(nextToken);
        localStorage.setItem('token', nextToken);

        try {
            return await refreshUser(nextToken);
        } catch (error) {
            return data.data.user;
        }
    };

    const register = async (username, email, password) => {
        const data = await registerUser(username, email, password);
        return data.message || 'Verification email sent';
    };

    const verifyRegister = async (token) => {
        return verifyRegisterToken(token);
    };

    const requestPasswordReset = async (email, newPassword) => {
        const data = await requestPasswordResetEmail(email, newPassword);
        return data.message;
    };

    const verifyPasswordReset = async (token) => {
        return verifyResetToken(token);
    };

    const updateProfile = async (payload) => {
        const data = await updateProfileRequest(payload);
        setUser(data.data.user);
        return data.data.user;
    };

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    useEffect(() => {
        let cancelled = false;

        const fetchUser = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            setLoading(true);

            try {
                const data = await getCurrentUser(token);
                if (!cancelled) {
                    setUser(data.data.user);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                if (!cancelled) {
                    clearSession();
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchUser();

        return () => {
            cancelled = true;
        };
    }, [token]);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                theme,
                toggleTheme,
                login,
                register,
                verifyRegister,
                requestPasswordReset,
                verifyPasswordReset,
                logout,
                loading,
                refreshUser,
                updateProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
