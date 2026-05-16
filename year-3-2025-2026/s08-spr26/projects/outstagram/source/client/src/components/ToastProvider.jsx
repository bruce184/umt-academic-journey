import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import "../styles/Toast.css";

const ToastContext = createContext({
    success: () => { },
    error: () => { },
    info: () => { },
    confirm: async () => false,
});

const makeId = () => `toast-${Math.random().toString(16).slice(2)}-${Date.now()}`;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const remove = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const push = useCallback((payload) => {
        const id = payload.id || makeId();
        const duration = payload.duration ?? 3600;

        setToasts((prev) => [...prev, { ...payload, id }]);

        if (duration > 0 && payload.type !== "confirm") {
            window.setTimeout(() => remove(id), duration);
        }

        return id;
    }, [remove]);

    const confirm = useCallback(({ title = "Are you sure?", message = "", confirmText = "Confirm", cancelText = "Cancel", tone = "danger" }) => {
        return new Promise((resolve) => {
            const id = makeId();
            const onResolve = (value) => {
                remove(id);
                resolve(value);
            };

            push({
                id,
                type: "confirm",
                title,
                message,
                confirmText,
                cancelText,
                tone,
                duration: 0,
                onResolve,
            });
        });
    }, [push, remove]);

    const api = useMemo(() => ({
        success: (message, options = {}) => push({ type: "success", message, ...options }),
        error: (message, options = {}) => push({ type: "error", message, ...options }),
        info: (message, options = {}) => push({ type: "info", message, ...options }),
        confirm,
    }), [push, confirm]);

    const hasConfirm = toasts.some((t) => t.type === "confirm");

    return (
        <ToastContext.Provider value={api}>
            {children}
            {hasConfirm ? <div className="toast-overlay" /> : null}
            <div className="toast-stack" aria-live="assertive">
                {toasts.map((toast) => {
                    if (toast.type === "confirm") {
                        return (
                            <div key={toast.id} className="toast toast--confirm">
                                <div className="toast-head">
                                    <div className={`toast-icon toast-icon--${toast.tone || "info"}`} aria-hidden>
                                        <AlertTriangle size={18} />
                                    </div>
                                    <div className="toast-copy">
                                        <div className="toast-title">{toast.title}</div>
                                        {toast.message ? <div className="toast-message">{toast.message}</div> : null}
                                    </div>
                                </div>
                                <div className="toast-actions">
                                    <button type="button" className="toast-btn toast-btn--ghost" onClick={() => toast.onResolve?.(false)}>
                                        {toast.cancelText || "Cancel"}
                                    </button>
                                    <button
                                        type="button"
                                        className={`toast-btn toast-btn--${toast.tone === "danger" ? "danger" : "primary"}`}
                                        onClick={() => toast.onResolve?.(true)}
                                    >
                                        {toast.confirmText || "Confirm"}
                                    </button>
                                </div>
                            </div>
                        );
                    }

                    const iconMap = {
                        success: <CheckCircle2 size={18} />,
                        error: <AlertTriangle size={18} />,
                        info: <Info size={18} />,
                    };

                    return (
                        <div key={toast.id} className={`toast toast--${toast.type || "info"}`}>
                            <div className="toast-head">
                                <div className="toast-icon" aria-hidden>
                                    {iconMap[toast.type || "info"]}
                                </div>
                                <div className="toast-copy">
                                    {toast.title ? <div className="toast-title">{toast.title}</div> : null}
                                    <div className="toast-message">{toast.message}</div>
                                </div>
                                <button
                                    type="button"
                                    className="toast-close"
                                    onClick={() => remove(toast.id)}
                                    aria-label="Dismiss notification"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    return useContext(ToastContext);
}
