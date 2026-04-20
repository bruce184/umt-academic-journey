let accessToken = "";

const REFRESH_KEY = "lab8_refresh_token";

export function setAccessToken(token) {
  accessToken = token || "";
}

export function getAccessToken() {
  return accessToken;
}

export function clearAccessToken() {
  accessToken = "";
}

export function setRefreshToken(token) {
  if (!token) return;
  sessionStorage.setItem(REFRESH_KEY, token);
}

export function getRefreshToken() {
  return sessionStorage.getItem(REFRESH_KEY) || "";
}

export function clearRefreshToken() {
  sessionStorage.removeItem(REFRESH_KEY);
}

export function clearAllTokens() {
  clearAccessToken();
  clearRefreshToken();
}
