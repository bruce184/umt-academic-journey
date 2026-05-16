/**
 * BACKUP SERVICE (API-backed)
 * Endpoints assumed:
 *  - GET  /admin/backups
 *  - POST /admin/backups        (create)
 *  - DELETE /admin/backups/:id
 *  - POST /admin/backups/:id/restore
 *
 * Note: The backend must implement these endpoints. There is no client-side
 * localStorage persistence used by this API wrapper; UI should surface errors.
 */

/* exported BackupAPI */
const BackupAPI = {
  getAll: async () => {
    try {
      const res = await fetch(`/admin/backups`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) return [];
      const payload = await res.json();
      return Array.isArray(payload) ? payload : payload.data || [];
    } catch (err) {
      console.error("BackupAPI.getAll error:", err);
      // On error, return empty list (do not rely on client-side localStorage fallback)
      return [];
    }
  },

  create: async () => {
    try {
      const res = await fetch(`/admin/backups`, {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      const payload = await res.json().catch(() => null);

      if (typeof LogAPI !== "undefined") {
        LogAPI.log("SAO LƯU (BACKUP)", `Tạo bản sao lưu thành công`);
      }

      return (payload && (payload.data || payload)) || null;
    } catch (err) {
      console.error("BackupAPI.create error:", err);
      // On error, return null (let UI show an error)
      return null;
    }
  },

  delete: async (id) => {
    try {
      const res = await fetch(`/admin/backups/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }

      if (typeof LogAPI !== "undefined") {
        LogAPI.log("XÓA (DELETE)", `Xóa bản sao lưu: ${id}`);
      }

      return true;
    } catch (err) {
      console.error("BackupAPI.delete error:", err);
      // On error, signal failure
      return false;
    }
  },

  restore: async (id) => {
    try {
      const res = await fetch(`/admin/backups/${encodeURIComponent(id)}/restore`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      const payload = await res.json().catch(() => null);

      if (typeof LogAPI !== "undefined") {
        LogAPI.log("PHỤC HỒI (RESTORE)", `Khôi phục hệ thống từ bản: ${id}`);
      }

      return (payload && (payload.data || payload)) || null;
    } catch (err) {
      console.error("BackupAPI.restore error:", err);
      // On error, return null
      return null;
    }
  },
};

// Expose globally for inline scripts and admin pages
if (typeof window !== "undefined") window.BackupAPI = BackupAPI;
