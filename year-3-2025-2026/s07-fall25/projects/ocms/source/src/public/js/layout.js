// src/public/js/layout.js

document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");

  // Hỗ trợ cả id="sidebar-toggle" (mới) và id="toggleSidebar" (đang dùng ở student)
  const sidebarToggle =
    document.getElementById("sidebar-toggle") ||
    document.getElementById("toggleSidebar");

  // Lấy toàn bộ .sidebar-item trong document
  const menuItems = Array.from(document.querySelectorAll(".sidebar-item"));

  // ==============================
  // 1. ACTIVE MENU HIGHLIGHT (tùy chọn)
  // ==============================
  const currentRoute = document.body.dataset.page; // ví dụ: "overview"

  if (currentRoute && menuItems.length > 0) {
    menuItems.forEach((item) => {
      const route = item.getAttribute("data-route"); // nếu chưa set thì undefined
      if (route === currentRoute) {
        item.classList.add("active");
      }
    });
  }

  // ==============================
  // 2. SIDEBAR TOGGLE (MOBILE ONLY)
  // ==============================
  if (sidebar && sidebarToggle) {
    // Nếu lúc load mà màn hình < 1024px: ẩn sidebar
    if (window.innerWidth < 1024) {
      sidebar.classList.add("hidden");
    }

    sidebarToggle.addEventListener("click", () => {
      if (window.innerWidth < 1024) {
        sidebar.classList.toggle("hidden");
      }
    });

    // Click menu item trên mobile thì tự ẩn sidebar
    menuItems.forEach((item) => {
      item.addEventListener("click", () => {
        if (window.innerWidth < 1024) {
          sidebar.classList.add("hidden");
        }
      });
    });
  }

  // ==============================
  // 3. RESIZE BEHAVIOR
  // ==============================
  window.addEventListener("resize", () => {
    if (!sidebar) return;

    // >= 1024px: luôn hiện sidebar
    if (window.innerWidth >= 1024) {
      sidebar.classList.remove("hidden");
    } else {
      // < 1024px: để ẩn, user bấm nút để mở
      sidebar.classList.add("hidden");
    }
  });
});
