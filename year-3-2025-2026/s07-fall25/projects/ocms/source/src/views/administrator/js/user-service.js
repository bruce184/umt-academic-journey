 
/**
 * USER SERVICE (API-backed)
 * Endpoints assumed:
 *  - GET  /admin/users
 *  - GET  /admin/users/:id
 *  - POST /admin/users
 *  - PUT  /admin/users/:id
 *  - DELETE /admin/users/:id
 */
/* exported UserAPI */
const UserAPI = {
  getAll: async (params = "") => {
    try {
      const res = await fetch(`/admin/users${params ? `?${params}` : ""}`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) return [];
      const payload = await res.json();
      // Support multiple server response shapes:
      //  - Array (legacy)
      //  - { data: [ ... ] }
      //  - { data: { items: [ ... ] } }
      if (Array.isArray(payload)) return payload;
      if (payload && payload.data) {
        if (Array.isArray(payload.data)) return payload.data;
        if (payload.data.items && Array.isArray(payload.data.items)) return payload.data.items;
        return payload.data;
      }
      return [];
    } catch (err) {
      console.error("UserAPI.getAll error:", err);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const res = await fetch(`/admin/users/${encodeURIComponent(id)}`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) return null;
      const payload = await res.json();
      return payload && payload.data ? payload.data : payload;
    } catch (err) {
      console.error("UserAPI.getById error:", err);
      return null;
    }
  },

  create: async (userData) => {
    try {
      const res = await fetch(`/admin/users`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(userData),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      const payload = await res.json().catch(() => null);

      if (typeof LogAPI !== "undefined") {
        LogAPI.log("TẠO MỚI (CREATE)", `Thêm người dùng: ${userData.name || "(no-name)"}`);
      }

      // Return authoritative server response if present, otherwise null
      return (payload && (payload.data || payload)) || null;
    } catch (err) {
      console.error("UserAPI.create error:", err);
      throw err;
    }
  },

  update: async (id, updatedData) => {
    try {
      const res = await fetch(`/admin/users/${encodeURIComponent(id)}`, {
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
        LogAPI.log("CẬP NHẬT (UPDATE)", `Cập nhật thông tin người dùng (ID: ${id})`);
      }

      // Return authoritative server response if present, otherwise null
      return (payload && (payload.data || payload)) || null;
    } catch (err) {
      console.error("UserAPI.update error:", err);
      throw err;
    }
  },

  delete: async (id) => {
    try {
      const res = await fetch(`/admin/users/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }

      if (typeof LogAPI !== "undefined") {
        LogAPI.log("XÓA (DELETE)", `Xóa người dùng (ID: ${id})`);
      }

      return true;
    } catch (err) {
      console.error("UserAPI.delete error:", err);
      throw err;
    }
  },
};

// Expose globally for admin pages
if (typeof window !== "undefined") window.UserAPI = UserAPI;
