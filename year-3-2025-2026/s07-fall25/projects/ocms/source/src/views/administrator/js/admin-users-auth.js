document.addEventListener("DOMContentLoaded", () => {
  // --- 1. KHỞI TẠO & LẤY ELEMENTS ---
  const sidebar = document.getElementById("sidebar");
  const toggleSidebar = document.getElementById("toggleSidebar");
  const sidebarTexts = document.querySelectorAll(".sidebar-text");
  const sidebarLogo = document.getElementById("sidebarLogo");
  const sidebarLogoSmall = document.getElementById("sidebarLogoSmall");
  const avatarButton = document.getElementById("avatarButton");
  const avatarDropdown = document.getElementById("avatarDropdown");

  const saveAuthPolicyBtn = document.getElementById("saveAuthPolicyBtn");

  // Inputs
  const twoFaAdmin = document.getElementById("2faAdmin");
  const twoFaLecturer = document.getElementById("2faLecturer");
  const twoFaStudent = document.getElementById("2faStudent");
  const lockoutAttempts = document.getElementById("lockoutAttempts");
  const lockoutDuration = document.getElementById("lockoutDuration");

  const STORAGE_KEY = "config_user_auth";

  // Demo notice: these auth settings are stored only in the browser (demo-only).
  (function showDemoNotice() {
    try {
      const note = document.createElement("div");
      note.style.cssText = "background:#e8f4ff;border:1px solid #cfe9ff;padding:8px;margin-bottom:8px;border-radius:4px;color:#0b5394;font-size:13px;";
      note.textContent = "NOTE: Auth settings are stored only in your browser (demo-only). Replace with server persistence for production.";
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

      if (twoFaAdmin) twoFaAdmin.checked = config.twoFa.admin;
      if (twoFaLecturer) twoFaLecturer.checked = config.twoFa.lecturer;
      if (twoFaStudent) twoFaStudent.checked = config.twoFa.student;

      if (lockoutAttempts) lockoutAttempts.value = config.lockout.attempts || 5;
      if (lockoutDuration)
        lockoutDuration.value = config.lockout.duration || 15;
    }
  }

  if (saveAuthPolicyBtn) {
    saveAuthPolicyBtn.addEventListener("click", (e) => {
      e.preventDefault();

      const config = {
        twoFa: {
          admin: twoFaAdmin.checked,
          lecturer: twoFaLecturer.checked,
          student: twoFaStudent.checked,
        },
        lockout: {
          attempts: parseInt(lockoutAttempts.value),
          duration: parseInt(lockoutDuration.value),
        },
        updatedAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      } catch (e) {
        console.warn("Unable to persist auth config to localStorage", e);
      }

      if (typeof LogAPI !== "undefined") {
        LogAPI.log(
          "CẤU HÌNH (CONFIG)",
          `Cập nhật Chính sách Bảo mật: Lockout sau ${config.lockout.attempts} lần sai`
        );
      }

      const originalText = saveAuthPolicyBtn.textContent;
      saveAuthPolicyBtn.textContent = "Đã lưu thành công!";
      saveAuthPolicyBtn.classList.add("btn-disabled");

      setTimeout(() => {
        saveAuthPolicyBtn.textContent = originalText;
        saveAuthPolicyBtn.classList.remove("btn-disabled");
      }, 1500);
    });
  }

  loadSettings();
});
