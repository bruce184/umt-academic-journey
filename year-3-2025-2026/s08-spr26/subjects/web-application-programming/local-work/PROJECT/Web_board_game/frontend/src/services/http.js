const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const buildUrl = (path) => `${API_BASE_URL}${path}`;

export const apiRequest = async (path, options = {}) => {
    const {
        method = 'GET',
        body,
        headers = {},
        token,
        skipAuth = false,
    } = options;

    const finalHeaders = { ...headers };
    const authToken = token || (!skipAuth ? localStorage.getItem('token') : null);

    if (authToken && !finalHeaders.Authorization) {
        finalHeaders.Authorization = `Bearer ${authToken}`;
    }

    if (body !== undefined && !(body instanceof FormData) && !finalHeaders['Content-Type']) {
        finalHeaders['Content-Type'] = 'application/json';
    }

    const response = await fetch(buildUrl(path), {
        method,
        headers: finalHeaders,
        body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
    });

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json') ? await response.json() : await response.text();

    if (!response.ok) {
        const message = typeof payload === 'object' ? payload.error || payload.message : 'Request failed';
        const error = new Error(message);
        error.status = response.status;
        error.payload = payload;
        throw error;
    }

    return payload;
};
