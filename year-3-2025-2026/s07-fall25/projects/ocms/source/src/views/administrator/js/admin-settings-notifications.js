document.addEventListener("DOMContentLoaded", () => {
  // --- 1. INIT & VARIABLES ---
  const sidebar = document.getElementById("sidebar");
  const toggleSidebar = document.getElementById("toggleSidebar");
  const sidebarTexts = document.querySelectorAll(".sidebar-text");
  const sidebarLogo = document.getElementById("sidebarLogo");
  const sidebarLogoSmall = document.getElementById("sidebarLogoSmall");
  const avatarButton = document.getElementById("avatarButton");
  const avatarDropdown = document.getElementById("avatarDropdown");

  const saveBtn = document.getElementById("saveNotificationBtn");

  // Checkboxes (Academic)
  const notifAssignEmail = document.getElementById("notif_assign_email");
  const notifAssignApp = document.getElementById("notif_assign_app");
  const notifGradeEmail = document.getElementById("notif_grade_email");
  const notifGradeApp = document.getElementById("notif_grade_app");
  const notifQaEmail = document.getElementById("notif_qa_email");
  const notifQaApp = document.getElementById("notif_qa_app");

  // Checkboxes (Finance)
  const notifFeeEmail = document.getElementById("notif_fee_email");
  const notifFeeApp = document.getElementById("notif_fee_app");
  const notifPayEmail = document.getElementById("notif_pay_email");
  const notifPayApp = document.getElementById("notif_pay_app");

  const STORAGE_KEY = "config_system_notifications";

  // Demo notice: these settings are stored locally in the browser (demo-only).
  (function showDemoNotice() {
    try {
      const note = document.createElement("div");
      note.style.cssText = "background:#e8f4ff;border:1px solid #cfe9ff;padding:8px;margin-bottom:8px;border-radius:4px;color:#0b5394;font-size:13px;";
      note.textContent = "NOTE: Notification settings are stored only in your browser (demo-only). Replace with server-backed persistence for production.";
      const target = document.querySelector("main") || document.body;
      if (target && target.firstChild) target.insertBefore(note, target.firstChild);
    } catch (e) { void e; }
  })();
  // --- 2. LOGIC GIAO DIỆN ---
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

      // Academic
      if (notifAssignEmail)
        notifAssignEmail.checked = config.academic.assignEmail;
      if (notifAssignApp) notifAssignApp.checked = config.academic.assignApp;
      if (notifGradeEmail) notifGradeEmail.checked = config.academic.gradeEmail;
      if (notifGradeApp) notifGradeApp.checked = config.academic.gradeApp;
      if (notifQaEmail) notifQaEmail.checked = config.academic.qaEmail;
      if (notifQaApp) notifQaApp.checked = config.academic.qaApp;

      // Finance
      if (notifFeeEmail) notifFeeEmail.checked = config.finance.feeEmail;
      if (notifFeeApp) notifFeeApp.checked = config.finance.feeApp;
      if (notifPayEmail) notifPayEmail.checked = config.finance.payEmail;
      if (notifPayApp) notifPayApp.checked = config.finance.payApp;
    }
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", (e) => {
      e.preventDefault();

      const config = {
        academic: {
          assignEmail: notifAssignEmail.checked,
          assignApp: notifAssignApp.checked,
          gradeEmail: notifGradeEmail.checked,
          gradeApp: notifGradeApp.checked,
          qaEmail: notifQaEmail.checked,
          qaApp: notifQaApp.checked,
        },
        finance: {
          feeEmail: notifFeeEmail.checked,
          feeApp: notifFeeApp.checked,
          payEmail: notifPayEmail.checked,
          payApp: notifPayApp.checked,
        },
        updatedAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      } catch (e) {
        console.warn("Unable to persist notification config to localStorage", e);
      }

      if (typeof LogAPI !== "undefined") {
        LogAPI.log(
          "CẤU HÌNH (CONFIG)",
          "Cập nhật cấu hình Kênh thông báo & Nhắc hạn"
        );
      }

        const originalText = saveBtn.textContent;
      saveBtn.textContent = "Đã lưu thành công!";
      saveBtn.classList.add("btn-disabled");

      setTimeout(() => {
          saveBtn.textContent = originalText;
        saveBtn.classList.remove("btn-disabled");
      }, 1500);
    });
  }

  loadSettings();
});
