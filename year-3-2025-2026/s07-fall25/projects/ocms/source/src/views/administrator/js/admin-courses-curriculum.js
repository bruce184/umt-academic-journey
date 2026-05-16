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
  const saveCurriculumBtn = document.getElementById("saveCurriculumBtn");
  const programName = document.getElementById("programName");
  const totalCreditsRequired = document.getElementById("totalCreditsRequired");
  const compulsoryCredits = document.getElementById("compulsoryCredits");
  const electiveCredits = document.getElementById("electiveCredits");
  const coreCourses = document.getElementById("coreCourses");

  // Key lưu trữ
  const STORAGE_KEY = "config_academic_curriculum";

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

  // Tải cấu hình cũ (chạy khi F5)
  function loadSettings() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const config = JSON.parse(savedData);

      if (programName) programName.value = config.programName || "";
      if (totalCreditsRequired)
        totalCreditsRequired.value = config.totalCreditsRequired || "";
      if (compulsoryCredits)
        compulsoryCredits.value = config.compulsoryCredits || "";
      if (electiveCredits) electiveCredits.value = config.electiveCredits || "";
      if (coreCourses) coreCourses.value = config.coreCourses || "";
    }
  }

  // Xử lý nút LƯU
  if (saveCurriculumBtn) {
    saveCurriculumBtn.addEventListener("click", (e) => {
      e.preventDefault(); // Ngăn reload

      // Validate cơ bản
      if (!programName.value || !totalCreditsRequired.value) {
        alert("Vui lòng nhập tên chương trình và tổng tín chỉ.");
        return;
      }

      // 1. Lấy giá trị
      const config = {
        programName: programName.value,
        totalCreditsRequired: totalCreditsRequired.value,
        compulsoryCredits: compulsoryCredits.value,
        electiveCredits: electiveCredits.value,
        coreCourses: coreCourses.value,
        updatedAt: new Date().toISOString(),
      };

      // 2. Lưu vào LocalStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));

      // 3. Ghi Log (Nếu có Log Service)
      if (typeof LogAPI !== "undefined") {
        LogAPI.log(
          "CẤU HÌNH (CONFIG)",
          `Cập nhật CTĐT: ${config.programName} (${config.totalCreditsRequired} tín chỉ)`
        );
      }

      // 4. Hiệu ứng nút bấm & Thông báo
      const originalText = saveCurriculumBtn.textContent;
      saveCurriculumBtn.textContent = "Đã lưu thành công!";
      saveCurriculumBtn.classList.add("btn-disabled");

      // Thông báo giả lập cho sinh động hơn
      alert(
        `Đã lưu chương trình: ${config.programName}\nTổng tín chỉ: ${config.totalCreditsRequired}`
      );

      setTimeout(() => {
        saveCurriculumBtn.textContent = originalText;
        saveCurriculumBtn.classList.remove("btn-disabled");
      }, 1500);
    });
  }

  // --- CHẠY KHI KHỞI ĐỘNG ---
  loadSettings();
});
