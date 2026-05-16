export function readApiData(payload) {
    return payload?.data ?? payload ?? null;
}

export function readApiErrorMessage(payload, fallback = "Request failed") {
    return payload?.error?.message || payload?.message || fallback;
}
