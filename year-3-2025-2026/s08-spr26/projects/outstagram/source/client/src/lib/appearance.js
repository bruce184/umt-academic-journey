const APPEARANCE_STORAGE_KEY = "outstagram:appearance";

export function getStoredAppearance() {
    if (typeof window === "undefined") return "dark";
    const stored = window.localStorage.getItem(APPEARANCE_STORAGE_KEY);
    return stored === "light" ? "light" : "dark";
}

export function applyAppearance(mode) {
    if (typeof document === "undefined") return "dark";
    const nextMode = mode === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nextMode);
    document.body.setAttribute("data-theme", nextMode);
    return nextMode;
}

export function setAppearance(mode) {
    if (typeof window === "undefined") return "dark";
    const nextMode = mode === "light" ? "light" : "dark";
    window.localStorage.setItem(APPEARANCE_STORAGE_KEY, nextMode);
    applyAppearance(nextMode);
    window.dispatchEvent(
        new CustomEvent("outstagram:appearance-change", {
            detail: { mode: nextMode },
        })
    );
    return nextMode;
}

export function initAppearance() {
    return applyAppearance(getStoredAppearance());
}

