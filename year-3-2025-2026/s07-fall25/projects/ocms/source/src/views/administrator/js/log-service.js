/**
 * LOG SERVICE
 * Sends logs to backend (/admin/logs). No client-side localStorage fallback is used.
 */
/* exported LogAPI */
const LogAPI = {
  getAll: async (params = "") => {
    try {
      const url = `/admin/logs${params ? `?${params}` : ""}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) return [];
      const payload = await res.json();
      return Array.isArray(payload) ? payload : payload.data || [];
    } catch (err) {
      console.error("LogAPI.getAll error:", err);
      // On error, return empty list (do not fallback to localStorage)
      return [];
    }
  },

  // Fire-and-forget log to backend; on failure we only warn (no local persistence)
  log: (action, details, user = "administrator@umt.edu.vn (Admin)") => {
    const newLog = {
      timestamp: new Date().toLocaleString("vi-VN"),
      user,
      action,
      details,
    };

    // Attempt to send to backend without blocking caller
    (async () => {
      try {
        await fetch(`/admin/logs`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(newLog),
        });
      } catch (err) {
        // on failure, do not persist locally (server logging expected)
        console.warn("LogAPI.log: failed to send log to server", err);
      }
    })();
  },
};

// Expose globally for admin pages
if (typeof window !== "undefined") window.LogAPI = LogAPI;
