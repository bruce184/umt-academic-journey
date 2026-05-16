// views/administrator/js/admin-dashboard.js
// Dùng layout chung cho avatar dropdown + sidebar
import { initLayout } from "../../common/layout-common.js";

document.addEventListener("DOMContentLoaded", () => {
  // Khởi tạo avatar dropdown + sidebar (nếu có)
  initLayout();

  // Load thống kê cho Dashboard Admin
  loadDashboardStats();
});

/**
 * Load số liệu tổng quan cho Dashboard Admin:
 * - Tổng môn học (totalCoursesStat)
 * - Tổng người dùng (totalUsersStat)
 *
 * Ưu tiên:
 * 1. localStorage ("allCourses", "allUsers")
 * 2. Fallback từ biến global trên window (allCourses / allUsers từ file data)
 * 3. Nếu không có data => hiển thị "0"
 */
function loadDashboardStats() {
  const totalCoursesStat = document.getElementById("totalCoursesStat");
  const totalUsersStat = document.getElementById("totalUsersStat");
  // Prefer real data from server (/admin/stats). Do not rely on static file fallbacks.
  (async () => {
    try {
      const res = await fetch(`/admin/stats`, { method: "GET", credentials: "include", headers: { Accept: "application/json" } });
      if (!res.ok) {
        if (totalCoursesStat) totalCoursesStat.textContent = "0";
        if (totalUsersStat) totalUsersStat.textContent = "0";
        return;
      }
      const payload = await res.json().catch(() => null);
      const data = payload && payload.data ? payload.data : payload || {};
      if (totalCoursesStat) totalCoursesStat.textContent = String(data.totalCourses || 0);
      if (totalUsersStat) totalUsersStat.textContent = String(data.totalUsers || 0);
      // Do not persist placeholder arrays to localStorage; keep data authoritative from server
    } catch (err) {
      console.error("Failed to load admin stats:", err);
      if (totalCoursesStat) totalCoursesStat.textContent = "0";
      if (totalUsersStat) totalUsersStat.textContent = "0";
    }
  })();
}
