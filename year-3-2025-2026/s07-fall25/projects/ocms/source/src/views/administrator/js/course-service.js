/**
 * COURSE SERVICE (API-backed)
 * Replaces previous localStorage mock with real admin endpoints.
 * Endpoint assumptions:
 *  - GET  /admin/courses
 *  - GET  /admin/courses/:id
 *  - POST /admin/courses
 *  - PUT  /admin/courses/:id
 *  - DELETE /admin/courses/:id
 */
/* exported CourseAPI */
const CourseAPI = {
  getAll: async (params = "") => {
    try {
      const res = await fetch(`/admin/courses${params ? `?${params}` : ""}`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) return [];
      const payload = await res.json();
      return Array.isArray(payload) ? payload : payload.data || [];
    } catch (err) {
      console.error("CourseAPI.getAll error:", err);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const res = await fetch(`/admin/courses/${encodeURIComponent(id)}`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) return null;
      const payload = await res.json();
      return payload && payload.data ? payload.data : payload;
    } catch (err) {
      console.error("CourseAPI.getById error:", err);
      return null;
    }
  },

  create: async (courseData) => {
    try {
      const res = await fetch(`/admin/courses`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(courseData),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `HTTP ${res.status}`);
      }
      const payload = await res.json().catch(() => null);

      if (typeof LogAPI !== "undefined") {
        LogAPI.log("TẠO MỚI (CREATE)", `Thêm môn học mới: ${courseData.name} (${courseData.id || "-"})`);
      }

      return (payload && (payload.data || payload)) || courseData;
    } catch (err) {
      console.error("CourseAPI.create error:", err);
      throw err;
    }
  },

  update: async (id, updatedData) => {
    try {
      const res = await fetch(`/admin/courses/${encodeURIComponent(id)}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `HTTP ${res.status}`);
      }
      const payload = await res.json().catch(() => null);

      if (typeof LogAPI !== "undefined") {
        LogAPI.log("CẬP NHẬT (UPDATE)", `Cập nhật môn học: ${updatedData.name || "(id:" + id + ")"}`);
      }

      return (payload && (payload.data || payload)) || updatedData;
    } catch (err) {
      console.error("CourseAPI.update error:", err);
      throw err;
    }
  },

  delete: async (id) => {
    try {
      const res = await fetch(`/admin/courses/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `HTTP ${res.status}`);
      }

      if (typeof LogAPI !== "undefined") {
        LogAPI.log("XÓA (DELETE)", `Xóa môn học: ${id}`);
      }

      return true;
    } catch (err) {
      console.error("CourseAPI.delete error:", err);
      throw err;
    }
  },
};

// Expose globally for admin pages
if (typeof window !== "undefined") window.CourseAPI = CourseAPI;
