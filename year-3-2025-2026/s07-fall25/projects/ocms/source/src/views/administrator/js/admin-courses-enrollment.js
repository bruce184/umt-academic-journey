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
  const saveEnrollmentBtn = document.getElementById("saveEnrollmentBtn");
  const toggleEnrollmentBtn = document.getElementById("toggleEnrollmentBtn");
  const systemStatus = document.getElementById("systemStatus");

  // Inputs
  const startDate = document.getElementById("startDate");
  const endDate = document.getElementById("endDate");
  const dropDeadline = document.getElementById("dropDeadline");
  const withdrawalDeadline = document.getElementById("withdrawalDeadline");

  // Key lưu trữ
  const STORAGE_KEY = "config_academic_enrollment";

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

  // --- 3. HÀM HỖ TRỢ CẬP NHẬT UI TRẠNG THÁI ---
  function setStatusUI(isOpen) {
    if (isOpen) {
      systemStatus.textContent = "ĐANG MỞ";
      systemStatus.classList.remove("bg-red-100", "text-red-800");
      systemStatus.classList.add("bg-green-100", "text-green-800");
      toggleEnrollmentBtn.textContent = "Tạm dừng Ghi danh";
      toggleEnrollmentBtn.classList.remove("btn-primary");
      toggleEnrollmentBtn.classList.add("btn-secondary");
    } else {
      systemStatus.textContent = "ĐÃ ĐÓNG";
      systemStatus.classList.remove("bg-green-100", "text-green-800");
      systemStatus.classList.add("bg-red-100", "text-red-800");
      toggleEnrollmentBtn.textContent = "Mở Ghi danh";
      toggleEnrollmentBtn.classList.remove("btn-secondary");
      toggleEnrollmentBtn.classList.add("btn-primary");
    }
  }

  // --- 4. LOGIC LƯU & TẢI CẤU HÌNH ---

  // Tải cấu hình cũ (chạy khi F5)
  function loadSettings() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const config = JSON.parse(savedData);

      // Đổ dữ liệu ngày tháng
      if (startDate) startDate.value = config.startDate || "";
      if (endDate) endDate.value = config.endDate || "";
      if (dropDeadline) dropDeadline.value = config.dropDeadline || "";
      if (withdrawalDeadline)
        withdrawalDeadline.value = config.withdrawalDeadline || "";

      // Cập nhật trạng thái Mở/Đóng
      setStatusUI(config.isOpen);
    }
  }

  // Xử lý nút Tạm dừng/Mở (Chỉ đổi UI, chưa lưu ngay)
  if (toggleEnrollmentBtn) {
    toggleEnrollmentBtn.addEventListener("click", () => {
      const isCurrentlyOpen = systemStatus.textContent === "ĐANG MỞ";
      setStatusUI(!isCurrentlyOpen); // Đảo ngược trạng thái
    });
  }

  // Xử lý nút LƯU (Ghi xuống Storage)
  if (saveEnrollmentBtn) {
    saveEnrollmentBtn.addEventListener("click", (e) => {
      e.preventDefault(); // Ngăn reload

      if (!startDate.value || !endDate.value) {
        alert("Vui lòng chọn ngày bắt đầu và kết thúc.");
        return;
      }

      // 1. Lấy giá trị
      const config = {
        startDate: startDate.value,
        endDate: endDate.value,
        dropDeadline: dropDeadline.value,
        withdrawalDeadline: withdrawalDeadline.value,
        isOpen: systemStatus.textContent === "ĐANG MỞ", // Lưu trạng thái hiện tại
        updatedAt: new Date().toISOString(),
      };

      // 2. Lưu vào LocalStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));

      // 3. Ghi Log (Nếu có Log Service)
      if (typeof LogAPI !== "undefined") {
        const statusText = config.isOpen ? "MỞ" : "ĐÓNG";
        LogAPI.log(
          "CẤU HÌNH (CONFIG)",
          `Cập nhật kỳ ghi danh: Trạng thái ${statusText}, Từ ${config.startDate} đến ${config.endDate}`
        );
      }

      // 4. Hiệu ứng nút bấm
      const originalText = saveEnrollmentBtn.textContent;
      saveEnrollmentBtn.textContent = "Đã lưu thành công!";
      saveEnrollmentBtn.classList.add("btn-disabled");

      setTimeout(() => {
        saveEnrollmentBtn.textContent = originalText;
        saveEnrollmentBtn.classList.remove("btn-disabled");
      }, 1500);
    });
  }

  // --- CHẠY KHI KHỞI ĐỘNG ---
  loadSettings();
});
