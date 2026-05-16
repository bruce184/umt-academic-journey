import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api/v1/admin`;
let authSubscription = null;

async function verifyAdminAccess(session) {
    if (!session?.access_token) {
        return null;
    }

    const response = await fetch(`${API_BASE}/ping`, {
        headers: {
            Authorization: `Bearer ${session.access_token}`,
        },
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(payload?.error?.message || payload?.message || 'Access Denied');
    }

    return payload?.data ?? payload ?? null;
}

async function signOutSafely() {
    try {
        await supabase.auth.signOut();
    } catch (error) {
        console.error('Admin sign out failed', error);
    }
}

const useAuthStore = create((set) => ({
    user: null,
    session: null,
    role: null,
    isLoading: true,
    error: null,

    initialize: async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                try {
                    const payload = await verifyAdminAccess(session);
                    set({ user: session.user, session, role: payload?.role ?? null, isLoading: false, error: null });
                } catch (err) {
                    set({ user: null, session: null, role: null, isLoading: false, error: err.message || 'Access Denied' });
                    await signOutSafely();
                }
            } else {
                set({ user: null, session: null, role: null, isLoading: false });
            }
        } catch (error) {
            set({ isLoading: false, error: error.message });
        }

        if (authSubscription) {
            return;
        }

        const { data } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                set({ user: null, session: null, role: null, error: null, isLoading: false });
                return;
            }

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
                set({ isLoading: true, error: null });

                // Do not await extra auth calls inside the auth state callback.
                Promise.resolve().then(async () => {
                    if (!session) {
                        set({ user: null, session: null, role: null, error: null, isLoading: false });
                        return;
                    }

                    try {
                        const payload = await verifyAdminAccess(session);
                        set({
                            user: session.user,
                            session,
                            role: payload?.role ?? null,
                            error: null,
                            isLoading: false,
                        });
                    } catch (err) {
                        set({
                            user: null,
                            session: null,
                            role: null,
                            error: err.message || 'Access Denied',
                            isLoading: false,
                        });
                        await signOutSafely();
                    }
                });
            }
        });

        authSubscription = data.subscription;
    },

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    logout: async () => {
        set({ isLoading: true });
        await supabase.auth.signOut();
        set({ user: null, session: null, role: null, isLoading: false });
    }
}));

export default useAuthStore;
