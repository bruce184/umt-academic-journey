import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import { supabase } from "../lib/supabase";
import { fetchPublicConfig } from "../lib/publicConfig";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const AUTH_ALLOWED_PATHS = new Set([
    "/login",
    "/forgot-password",
    "/reset-password",
    "/auth/callback",
]);

function MaintenanceScreen({ siteName, isAuthenticated }) {
    const [signingOut, setSigningOut] = useState(false);

    useEffect(() => {
        document.title = `Maintenance | ${siteName}`;
    }, [siteName]);

    const handleSignOut = async () => {
        try {
            setSigningOut(true);
            await supabase.auth.signOut();
        } finally {
            window.location.href = "/login";
        }
    };

    return (
        <AuthLayout>
            <div className="auth-card">
                <div className="auth-card-header">
                    <div className="login-brand">{siteName}</div>
                    <h2 className="login-title">Maintenance mode</h2>
                    <p className="login-subtitle">
                        The platform is temporarily unavailable while the team is working on updates.
                    </p>
                </div>

                <div className="login-error" style={{ marginBottom: 20 }}>
                    Only moderators and admins can access the platform during maintenance.
                </div>

                <div style={{ display: "grid", gap: 12 }}>
                    {!isAuthenticated ? (
                        <button className="login-btn" type="button" onClick={() => { window.location.href = "/login"; }}>
                            Go to login
                        </button>
                    ) : null}
                    <button className="login-btn" type="button" onClick={() => window.location.reload()}>
                        Refresh
                    </button>
                    {isAuthenticated ? (
                        <button
                            className="ghost-btn"
                            type="button"
                            onClick={handleSignOut}
                            disabled={signingOut}
                        >
                            {signingOut ? "Signing out..." : "Sign out"}
                        </button>
                    ) : null}
                </div>
            </div>
        </AuthLayout>
    );
}

export default function MaintenanceGate({ children }) {
    const location = useLocation();
    const [state, setState] = useState({
        loading: true,
        showMaintenance: false,
        siteName: "Outstagram",
        isAuthenticated: false,
    });
    const allowAuthRoute = useMemo(() => AUTH_ALLOWED_PATHS.has(location.pathname), [location.pathname]);

    useEffect(() => {
        let mounted = true;

        const checkMaintenance = async () => {
            const config = await fetchPublicConfig({ forceRefresh: true });
            const siteName = config.site_name || "Outstagram";

            if (!mounted) return;

            const { data: { session } } = await supabase.auth.getSession();
            const isAuthenticated = Boolean(session?.access_token);

            if (!config.maintenance_mode || allowAuthRoute) {
                setState({
                    loading: false,
                    showMaintenance: false,
                    siteName,
                    isAuthenticated,
                });
                return;
            }

            let allowBypass = false;

            try {
                if (session?.access_token) {
                    const res = await fetch(`${API_BASE}/api/v1/admin/ping`, {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    });
                    allowBypass = res.ok;
                }
            } catch (error) {
                console.error("Failed to verify maintenance bypass", error);
            }

            if (mounted) {
                setState({
                    loading: false,
                    showMaintenance: !allowBypass,
                    siteName,
                    isAuthenticated,
                });
            }
        };

        checkMaintenance();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            checkMaintenance();
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [allowAuthRoute]);

    if (state.loading) {
        return (
            <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
                Loading...
            </div>
        );
    }

    if (state.showMaintenance) {
        return <MaintenanceScreen siteName={state.siteName} isAuthenticated={state.isAuthenticated} />;
    }

    return children;
}
