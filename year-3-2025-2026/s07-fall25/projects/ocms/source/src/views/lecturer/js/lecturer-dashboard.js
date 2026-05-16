// views/lecturer/js/lecturer-dashboard.js
import { initLayout } from "../../common/layout-common.js";

document.addEventListener("DOMContentLoaded", () => {
  // Layout chung: sidebar toggle, avatar dropdown, v.v.
  initLayout();

  setupMainTabs();
  setupClassSubmenu();
  setupClassSubTabs();
  setupNewTestsModal();
});

/**
 * Xử lý click các item menu chính (Dashboard, Attendance, My schedule, Announcement, Class, Courses)
 * - Thêm/bỏ class active-link cho menu
 * - Ẩn/hiện các khối nội dung #content-*
 */
function setupMainTabs() {
  const menuLinks = document.querySelectorAll(".menu-link[data-content]");
  const tabs = document.querySelectorAll(".main-content-tab");

  if (!menuLinks.length || !tabs.length) return;

  menuLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      const contentKey = link.getAttribute("data-content"); // vd: "dashboard", "attendance", "class", ...

      // Active cho menu chính
      menuLinks.forEach((l) => l.classList.remove("active-link"));
      link.classList.add("active-link");

      // Ẩn tất cả tab nội dung
      tabs.forEach((tab) => tab.classList.add("hidden"));

      // Xác định id khối nội dung tương ứng
      const targetId =
        contentKey === "class" ? "content-class" : `content-${contentKey}`;
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.classList.remove("hidden");
      }

      // Nếu là menu "Class" thì auto mở submenu (nếu đang đóng)
      if (contentKey === "class") {
        const submenu = document.getElementById("class-submenu");
        const arrow = document.getElementById("class-menu-arrow");
        if (submenu && (submenu.style.display === "none" || !submenu.style.display)) {
          submenu.style.display = "flex";
        }
        if (arrow) {
          arrow.classList.add("rotate-180");
        }
      }
    });
  });
}

/**
 * Toggle submenu "Class" (Tests / Grades / Material) ở sidebar
 */
function setupClassSubmenu() {
  const toggle = document.getElementById("class-menu-toggle");
  const submenu = document.getElementById("class-submenu");
  const arrow = document.getElementById("class-menu-arrow");

  if (!toggle || !submenu || !arrow) return;

  // Khởi tạo: ẩn submenu
  if (!submenu.style.display) {
    submenu.style.display = "none";
  }

  toggle.addEventListener("click", (e) => {
    e.preventDefault();
    const isHidden = submenu.style.display === "none";
    submenu.style.display = isHidden ? "flex" : "none";
    arrow.classList.toggle("rotate-180", isHidden);
  });

  // Click submenu để nhảy thẳng tới tab Class + sub-tab tương ứng
  const subMenuLinks = submenu.querySelectorAll(".sub-menu-link[data-content]");
  subMenuLinks.forEach((subLink) => {
    subLink.addEventListener("click", (e) => {
      e.preventDefault();
      const targetContent = subLink.getAttribute("data-content"); // "tests" | "grades" | "material"

      // Hiện main tab "Class"
      const classContent = document.getElementById("content-class");
      const mainTabs = document.querySelectorAll(".main-content-tab");
      mainTabs.forEach((t) => t.classList.add("hidden"));
      if (classContent) classContent.classList.remove("hidden");

      // Active cho menu chính "Class"
      const menuLinks = document.querySelectorAll(".menu-link[data-content]");
      menuLinks.forEach((l) => l.classList.remove("active-link"));
      const classMenu = document.querySelector('.menu-link[data-content="class"]');
      if (classMenu) classMenu.classList.add("active-link");

      // Chọn sub-tab bên trong Class
      const targetId = `class-sub-${targetContent}`; // "class-sub-tests" | ...
      setClassSubTab(targetId);
    });
  });
}

/**
 * Xử lý sub-tabs bên trong phần Class:
 * - .sub-tab-link có data-target="class-sub-tests" | "class-sub-grades" | "class-sub-material"
 */
function setupClassSubTabs() {
  const subTabLinks = document.querySelectorAll(
    ".sub-tab-link[data-target]"
  );
  if (!subTabLinks.length) return;

  subTabLinks.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute("data-target");
      setClassSubTab(targetId);
    });
  });
}

/**
 * Helper: bật 1 sub-tab, tắt các sub-tab còn lại
 */
function setClassSubTab(targetId) {
  const subContents = document.querySelectorAll(".sub-tab-content");
  const subTabLinks = document.querySelectorAll(".sub-tab-link[data-target]");

  subContents.forEach((content) => {
    content.classList.add("hidden");
  });

  const targetContent = document.getElementById(targetId);
  if (targetContent) {
    targetContent.classList.remove("hidden");
  }

  subTabLinks.forEach((btn) => {
    const isActive = btn.getAttribute("data-target") === targetId;
    if (isActive) {
      btn.classList.add("text-[#003366]", "border-[#003366]");
      btn.classList.remove("text-gray-500", "border-transparent");
    } else {
      btn.classList.remove("text-[#003366]", "border-[#003366]");
      btn.classList.add("text-gray-500", "border-transparent");
    }
  });
}

/**
 * Mở / đóng modal NEW TESTS:
 * - Mở khi click #add-tests-btn
 * - Đóng khi click nút Submit (data-dismiss="modal")
 * - Đóng khi click ra ngoài panel (overlay)
 */
function setupNewTestsModal() {
  const openBtn = document.getElementById("add-tests-btn");
  const modal = document.getElementById("newTestsModal");
  if (!openBtn || !modal) return;

  const closeBtn = modal.querySelector('[data-dismiss="modal"]');

  const openModal = () => {
    modal.classList.remove("hidden");
  };

  const closeModal = () => {
    modal.classList.add("hidden");
  };

  openBtn.addEventListener("click", (e) => {
    e.preventDefault();
    openModal();
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      closeModal();
    });
  }

  // Click ra ngoài panel để đóng
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Đóng bằng phím ESC (optional nhưng tiện dùng)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
      closeModal();
    }
  });
}
