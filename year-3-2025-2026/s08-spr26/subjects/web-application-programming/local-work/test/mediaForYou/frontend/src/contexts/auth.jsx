import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../auth/api";
import {
  clearAllTokens,
  getRefreshToken,
  setAccessToken,
  setRefreshToken
} from "../auth/tokenService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  async function applyAuthPayload(payload) {
    setAccessToken(payload.accessToken);
    setRefreshToken(payload.refreshToken);
    setUser(payload.user);
    return payload.user;
  }

  async function register(formData) {
    const payload = await authApi.signup(formData);
    return applyAuthPayload(payload);
  }

  async function login(formData) {
    const payload = await authApi.login(formData);
    return applyAuthPayload(payload);
  }

  async function refreshSession() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token");
    }

    const payload = await authApi.refresh({ refreshToken });
    setAccessToken(payload.accessToken);
    setRefreshToken(payload.refreshToken);
    setUser(payload.user);
    return payload.user;
  }

  async function logout() {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await authApi.logout({ refreshToken });
      }
    } catch (error) {
      // bỏ qua lỗi logout để vẫn clear local token
    } finally {
      clearAllTokens();
      setUser(null);
    }
  }

  async function ensureAuth() {
    try {
      await refreshSession();
    } catch (error) {
      clearAllTokens();
      setUser(null);
    } finally {
      setBooting(false);
    }
  }

  async function runProtected(action) {
    try {
      return await action();
    } catch (error) {
      if (error.status === 401 && getRefreshToken()) {
        await refreshSession();
        return action();
      }
      throw error;
    }
  }

  useEffect(() => {
    ensureAuth();
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    booting,
    register,
    login,
    logout,
    refreshSession,
    runProtected
  }), [user, booting]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
