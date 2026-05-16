import { config } from "../config";
import { getAccessToken } from "./tokenService";

export async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${config.apiUrl}${path}`, {
    ...options,
    headers
  });

  let data = {};
  try {
    data = await response.json();
  } catch (error) {
    data = {};
  }

  if (!response.ok) {
    const err = new Error(data.message || "Request failed");
    err.status = response.status;
    err.payload = data;
    throw err;
  }

  return data;
}

export const authApi = {
  signup: (body) => apiFetch("/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => apiFetch("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  refresh: (body) => apiFetch("/auth/refresh", { method: "POST", body: JSON.stringify(body) }),
  logout: (body) => apiFetch("/auth/logout", { method: "POST", body: JSON.stringify(body) }),
  me: () => apiFetch("/auth/me")
};

export const taskApi = {
  getTasks: () => apiFetch("/tasks"),
  createTask: (body) => apiFetch("/tasks", { method: "POST", body: JSON.stringify(body) }),
  toggleTask: (id) => apiFetch(`/tasks/${id}/toggle`, { method: "PATCH" })
};

export const userApi = {
  getAllUsers: () => apiFetch("/users"),
  getPoll: (version) => apiFetch(`/users/poll?version=${version}`),
  getSseUrl: (accessToken) => `${config.apiUrl}/users/sse?accessToken=${encodeURIComponent(accessToken)}`
};
