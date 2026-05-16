document.addEventListener("DOMContentLoaded", () => {
  // --- 1. KHỞI TẠO & LẤY ELEMENTS ---
  const sidebar = document.getElementById("sidebar");
  const toggleSidebar = document.getElementById("toggleSidebar");
  const sidebarTexts = document.querySelectorAll(".sidebar-text");
  const sidebarLogo = document.getElementById("sidebarLogo");
  const sidebarLogoSmall = document.getElementById("sidebarLogoSmall");
  const avatarButton = document.getElementById("avatarButton");
  const avatarDropdown = document.getElementById("avatarDropdown");

  const saveProfilePolicyBtn = document.getElementById("saveProfilePolicyBtn");

  // Inputs - Student
  const studentCanChangeAvatar = document.getElementById(
    "studentCanChangeAvatar"
  );
  const studentCanChangePhone = document.getElementById(
    "studentCanChangePhone"
  );
  const studentCanChangeAddress = document.getElementById(
    "studentCanChangeAddress"
  );

  // Inputs - Lecturer
  const lecturerCanChangeAvatar = document.getElementById(
    "lecturerCanChangeAvatar"
  );
  const lecturerCanChangeOfficeHours = document.getElementById(
    "lecturerCanChangeOfficeHours"
  );

  // Key lưu trữ
  const STORAGE_KEY = "config_user_profile_policy";

  // Demo notice: these profile policy settings are stored locally in the browser.
  // In production, replace this with a server-backed settings endpoint to persist centrally.
  (function showDemoNotice() {
    try {
      const note = document.createElement("div");
      note.style.cssText = "background:#e8f4ff;border:1px solid #cfe9ff;padding:8px;margin-bottom:8px;border-radius:4px;color:#0b5394;font-size:13px;";
      note.textContent = "NOTE: Profile policy settings are stored only in your browser (demo-only). Replace with server-backed persistence for production.";
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

  // Tải cấu hình cũ
  function loadSettings() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const config = JSON.parse(savedData);

      // Student
      if (studentCanChangeAvatar)
        studentCanChangeAvatar.checked = config.student.avatar;
      if (studentCanChangePhone)
        studentCanChangePhone.checked = config.student.phone;
      if (studentCanChangeAddress)
        studentCanChangeAddress.checked = config.student.address;

      // Lecturer
      if (lecturerCanChangeAvatar)
        lecturerCanChangeAvatar.checked = config.lecturer.avatar;
      if (lecturerCanChangeOfficeHours)
        lecturerCanChangeOfficeHours.checked = config.lecturer.officeHours;
    }
  }

  // Xử lý nút LƯU
  if (saveProfilePolicyBtn) {
    saveProfilePolicyBtn.addEventListener("click", (e) => {
      e.preventDefault(); // Ngăn reload

      // 1. Tạo object config
      const config = {
        student: {
          avatar: studentCanChangeAvatar.checked,
          phone: studentCanChangePhone.checked,
          address: studentCanChangeAddress.checked,
        },
        lecturer: {
          avatar: lecturerCanChangeAvatar.checked,
          officeHours: lecturerCanChangeOfficeHours.checked,
        },
        updatedAt: new Date().toISOString(),
      };

      // 2. Lưu vào LocalStorage (demo-only)
      // NOTE: This is intentionally local-only. To persist centrally, implement a
      // server endpoint (e.g. POST/PUT /admin/policy/user-profile) and call it here.
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      } catch (e) {
        console.warn("Unable to persist policy to localStorage", e);
      }

      // 3. Ghi Log
      if (typeof LogAPI !== "undefined") {
        const studentPerms = [];
        if (config.student.avatar) studentPerms.push("Avatar");
        if (config.student.phone) studentPerms.push("SĐT");
        if (config.student.address) studentPerms.push("Địa chỉ");

        LogAPI.log(
          "CẤU HÌNH (CONFIG)",
          `Cập nhật Chính sách Hồ sơ: SV được sửa [${studentPerms.join(", ")}]`
        );
      }

      // 4. Hiệu ứng nút bấm
      const originalText = saveProfilePolicyBtn.textContent;
      saveProfilePolicyBtn.textContent = "Đã lưu thành công!";
      saveProfilePolicyBtn.classList.add("btn-disabled");

      setTimeout(() => {
        saveProfilePolicyBtn.textContent = originalText;
        saveProfilePolicyBtn.classList.remove("btn-disabled");
      }, 1500);
    });
  }

  // --- CHẠY KHI KHỞI ĐỘNG ---
  loadSettings();
});
