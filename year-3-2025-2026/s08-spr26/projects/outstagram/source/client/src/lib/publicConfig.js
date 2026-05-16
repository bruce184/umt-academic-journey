import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const DEFAULT_PUBLIC_CONFIG = {
    maintenance_mode: false,
    registration_enabled: true,
    max_upload_size_mb: 10,
    posts_per_page: 20,
    allow_comments: true,
    site_name: "Outstagram",
};

const CACHE_TTL_MS = 30000;

let cachedConfig = null;
let cacheExpiry = 0;
let inflightRequest = null;

export async function fetchPublicConfig({ forceRefresh = false } = {}) {
    const now = Date.now();
    if (!forceRefresh && cachedConfig && cacheExpiry > now) {
        return cachedConfig;
    }

    if (!forceRefresh && inflightRequest) {
        return inflightRequest;
    }

    inflightRequest = fetch(`${API_BASE}/api/v1/config/public`)
        .then(async (response) => {
            if (!response.ok) {
                throw new Error(`Failed to fetch public config (${response.status})`);
            }

            const payload = await response.json();
            const configs = payload?.data?.configs || {};
            cachedConfig = { ...DEFAULT_PUBLIC_CONFIG, ...configs };
            cacheExpiry = Date.now() + CACHE_TTL_MS;
            return cachedConfig;
        })
        .catch((error) => {
            console.error("Failed to fetch public config", error);
            cachedConfig = { ...DEFAULT_PUBLIC_CONFIG };
            cacheExpiry = Date.now() + 5000;
            return cachedConfig;
        })
        .finally(() => {
            inflightRequest = null;
        });

    return inflightRequest;
}

export async function getPublicConfigValue(key, fallback) {
    const config = await fetchPublicConfig();
    return config[key] ?? fallback;
}

export function usePublicConfig() {
    const [config, setConfig] = useState(cachedConfig || DEFAULT_PUBLIC_CONFIG);

    useEffect(() => {
        let mounted = true;
        fetchPublicConfig().then((nextConfig) => {
            if (mounted) {
                setConfig(nextConfig);
            }
        });

        return () => {
            mounted = false;
        };
    }, []);

    return config;
}

export function useSiteName() {
    const config = usePublicConfig();
    return config.site_name || DEFAULT_PUBLIC_CONFIG.site_name;
}
