document.addEventListener("DOMContentLoaded", () => {
  // --- 1. INIT & VARIABLES ---
  const sidebar = document.getElementById("sidebar");
  const toggleSidebar = document.getElementById("toggleSidebar");
  const sidebarTexts = document.querySelectorAll(".sidebar-text");
  const sidebarLogo = document.getElementById("sidebarLogo");
  const sidebarLogoSmall = document.getElementById("sidebarLogoSmall");
  const avatarButton = document.getElementById("avatarButton");
  const avatarDropdown = document.getElementById("avatarDropdown");

  const saveMessagingBtn = document.getElementById("saveMessagingBtn");

  // Inputs
  const allowStudentToLecturer = document.getElementById(
    "allowStudentToLecturer"
  );
  const allowStudentToStudent = document.getElementById(
    "allowStudentToStudent"
  );
  const allowAttachments = document.getElementById("allowAttachments");
  const retentionPolicy = document.getElementById("retentionPolicy");

  const STORAGE_KEY = "config_system_messaging";

  // Demo notice: these settings are stored locally in the browser (demo-only).
  (function showDemoNotice() {
    try {
      const note = document.createElement("div");
      note.style.cssText = "background:#e8f4ff;border:1px solid #cfe9ff;padding:8px;margin-bottom:8px;border-radius:4px;color:#0b5394;font-size:13px;";
      note.textContent = "NOTE: Messaging settings are stored only in your browser (demo-only). Replace with server-backed persistence for production.";
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

  // --- 3. LOGIC LƯU & TẢI CẤU HÌNH ---

  function loadSettings() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const config = JSON.parse(savedData);
      if (allowStudentToLecturer)
        allowStudentToLecturer.checked = config.allowStudentToLecturer;
      if (allowStudentToStudent)
        allowStudentToStudent.checked = config.allowStudentToStudent;
      if (allowAttachments) allowAttachments.checked = config.allowAttachments;
      if (retentionPolicy)
        retentionPolicy.value = config.retentionPolicy || 365;
    }
  }

  if (saveMessagingBtn) {
    saveMessagingBtn.addEventListener("click", (e) => {
      e.preventDefault();

      const config = {
        allowStudentToLecturer: allowStudentToLecturer.checked,
        allowStudentToStudent: allowStudentToStudent.checked,
        allowAttachments: allowAttachments.checked,
        retentionPolicy: parseInt(retentionPolicy.value),
        updatedAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      } catch (e) {
        console.warn("Unable to persist messaging config to localStorage", e);
      }

      if (typeof LogAPI !== "undefined") {
        const retentionText =
          config.retentionPolicy === 0
            ? "Vĩnh viễn"
            : `${config.retentionPolicy} ngày`;
        LogAPI.log(
          "CẤU HÌNH (CONFIG)",
          `Cập nhật Tin nhắn: Lưu trữ ${retentionText}, Đính kèm: ${config.allowAttachments ? "BẬT" : "TẮT"}`
        );
      }

      const originalText = saveMessagingBtn.textContent;
      saveMessagingBtn.textContent = "Đã lưu thành công!";
      saveMessagingBtn.classList.add("btn-disabled");

      setTimeout(() => {
        saveMessagingBtn.textContent = originalText;
        saveMessagingBtn.classList.remove("btn-disabled");
      }, 1500);
    });
  }

  loadSettings();
});
