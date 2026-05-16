/**
 * FEE SERVICE (API-backed)
 * Endpoints assumed:
 *  - GET  /admin/fees
 *  - GET  /admin/fees/:id
 *  - POST /admin/fees
 *  - PUT  /admin/fees/:id
 *  - DELETE /admin/fees/:id
 */

/* exported FeeAPI */
const FeeAPI = {
  getAll: async (params = "") => {
    try {
      const res = await fetch(`/admin/fees${params ? `?${params}` : ""}`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) return [];
      const payload = await res.json();
      return Array.isArray(payload) ? payload : payload.data || [];
    } catch (err) {
      console.error("FeeAPI.getAll error:", err);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const res = await fetch(`/admin/fees/${encodeURIComponent(id)}`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) return null;
      const payload = await res.json();
      return payload && payload.data ? payload.data : payload;
    } catch (err) {
      console.error("FeeAPI.getById error:", err);
      return null;
    }
  },

  create: async (feeData) => {
    try {
      const res = await fetch(`/admin/fees`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(feeData),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      const payload = await res.json().catch(() => null);

      if (typeof LogAPI !== "undefined") {
        LogAPI.log("TẠO MỚI (CREATE)", `Thêm khoản phí: ${feeData.name || "(no-name)"}`);
      }

      // Return authoritative server response if present, otherwise null
      return (payload && (payload.data || payload)) || null;
    } catch (err) {
      console.error("FeeAPI.create error:", err);
      throw err;
    }
  },

  update: async (id, updatedData) => {
    try {
      const res = await fetch(`/admin/fees/${encodeURIComponent(id)}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      const payload = await res.json().catch(() => null);

      if (typeof LogAPI !== "undefined") {
        LogAPI.log("CẬP NHẬT (UPDATE)", `Cập nhật khoản phí (Mã: ${id})`);
      }

      // Return authoritative server response if present, otherwise null
      return (payload && (payload.data || payload)) || null;
    } catch (err) {
      console.error("FeeAPI.update error:", err);
      throw err;
    }
  },

  delete: async (id) => {
    try {
      const res = await fetch(`/admin/fees/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }

      if (typeof LogAPI !== "undefined") {
        LogAPI.log("XÓA (DELETE)", `Xóa khoản phí (Mã: ${id})`);
      }

      return true;
    } catch (err) {
      console.error("FeeAPI.delete error:", err);
      throw err;
    }
  },
};

// Expose globally for admin pages
if (typeof window !== "undefined") window.FeeAPI = FeeAPI;
