document.addEventListener("DOMContentLoaded", () => {
  // --- 1. INIT & VARIABLES ---
  const sidebar = document.getElementById("sidebar");
  const toggleSidebar = document.getElementById("toggleSidebar");
  const sidebarTexts = document.querySelectorAll(".sidebar-text");
  const sidebarLogo = document.getElementById("sidebarLogo");
  const sidebarLogoSmall = document.getElementById("sidebarLogoSmall");
  const avatarButton = document.getElementById("avatarButton");
  const avatarDropdown = document.getElementById("avatarDropdown");

  // Form Elements
  const savePrereqBtn = document.getElementById("savePrereqBtn");
  const enablePrereq = document.getElementById("enablePrereq");
  const maxCredits = document.getElementById("maxCredits");
  const minCredits = document.getElementById("minCredits");

  // Key lưu trữ trong bộ nhớ trình duyệt
  const STORAGE_KEY = "config_academic_prereq";

  // Demo notice: prerequisite rules are stored only in the browser (demo-only).
  (function showDemoNotice() {
    try {
      const note = document.createElement("div");
      note.style.cssText = "background:#e8f4ff;border:1px solid #cfe9ff;padding:8px;margin-bottom:8px;border-radius:4px;color:#0b5394;font-size:13px;";
      note.textContent = "NOTE: Course prerequisite settings are stored only in your browser (demo-only). Replace with server persistence for production.";
      const target = document.querySelector("main") || document.body;
      if (target && target.firstChild) target.insertBefore(note, target.firstChild);
    } catch (e) { void e; }
  })();

  // --- 2. LOGIC GIAO DIỆN (Sidebar/Avatar) ---
  if (toggleSidebar) {
    toggleSidebar.addEventListener("click", () => {
      if (sidebar.classList.contains("w-64")) {
        sidebar.classList.remove("w-64");
        sidebar.classList.add("w-20");
        sidebarTexts.forEach((text) => text.classList.add("hidden"));
        sidebarLogo.classList.add("hidden");
        sidebarLogoSmall.classList.remove("hidden");
      } else {
        sidebar.classList.remove("w-20");
        sidebar.classList.add("w-64");
        sidebarTexts.forEach((text) => text.classList.remove("hidden"));
        sidebarLogo.classList.remove("hidden");
        sidebarLogoSmall.classList.add("hidden");
      }
    });
  }

  if (avatarButton) {
    avatarButton.addEventListener("click", (e) => {
      avatarDropdown.classList.toggle("hidden");
      e.stopPropagation();
    });
  }
  document.addEventListener("click", (e) => {
    if (
      avatarDropdown &&
      avatarButton &&
      !avatarButton.contains(e.target) &&
      !avatarDropdown.contains(e.target)
    ) {
      avatarDropdown.classList.add("hidden");
    }
  });

  // --- 3. LOGIC LƯU & TẢI CẤU HÌNH (REAL STORAGE) ---

  // Hàm tải cấu hình cũ (chạy khi F5)
  function loadSettings() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const config = JSON.parse(savedData);

      // Đổ dữ liệu vào form
      if (enablePrereq) enablePrereq.checked = config.enablePrereq;
      if (maxCredits) maxCredits.value = config.maxCredits;
      if (minCredits) minCredits.value = config.minCredits;
    }
  }

  // Hàm lưu cấu hình mới
  if (savePrereqBtn) {
    savePrereqBtn.addEventListener("click", (e) => {
      e.preventDefault(); // Ngăn reload trang

      // 1. Lấy giá trị từ form
      const config = {
        enablePrereq: enablePrereq.checked,
        maxCredits: maxCredits.value,
        minCredits: minCredits.value,
      };

      // 2. Lưu vào LocalStorage (demo-only)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      } catch (e) {
        console.warn("Unable to persist prereq config to localStorage", e);
      }

      // 3. Ghi Log (Nếu có Log Service)
      if (typeof LogAPI !== "undefined") {
        LogAPI.log(
          "CẤU HÌNH (CONFIG)",
          `Cập nhật quy tắc tín chỉ: Max ${config.maxCredits}, Min ${config.minCredits}`
        );
      }

      // 4. Thông báo giao diện
      const originalText = savePrereqBtn.textContent;
      savePrereqBtn.textContent = "Đã lưu thành công!";
      savePrereqBtn.classList.add("btn-disabled"); // Tạm khóa nút
      savePrereqBtn.style.backgroundColor = "#10B981"; // Màu xanh lá (Tailwind green-500)

      setTimeout(() => {
        savePrereqBtn.textContent = originalText;
        savePrereqBtn.classList.remove("btn-disabled");
        savePrereqBtn.style.backgroundColor = ""; // Reset màu
      }, 1500);
    });
  }

  // --- CHẠY KHI KHỞI ĐỘNG ---
  loadSettings();
});
