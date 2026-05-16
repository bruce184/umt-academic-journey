// JS layout dùng chung cho mọi role (sidebar + avatar dropdown)

// Flag để tránh gắn nhiều lần document listeners nếu initLayout() bị gọi lặp
let avatarOutsideHandlerAttached = false;

/**
 * Hàm khởi tạo layout chung:
 * - Dropdown avatar (header)
 * - Sidebar toggle (nếu có #toggleSidebar)
 */
export function initLayout() {
  // Sidebar elements (nếu không có, phần toggle sẽ tự bỏ qua)
  const sidebar = document.getElementById("sidebar");
  const toggleSidebar = document.getElementById("toggleSidebar");
  const sidebarTexts = document.querySelectorAll(".sidebar-text");
  const sidebarLogo = document.getElementById("sidebarLogo");
  const sidebarLogoSmall = document.getElementById("sidebarLogoSmall");
  const sidebarLogoText = document.getElementById("sidebarLogoText");

  // Avatar elements (header)
  const avatarButton = document.getElementById("avatarButton");
  const avatarDropdown = document.getElementById("avatarDropdown");

  // Khởi tạo từng phần
  initAvatarDropdown(avatarButton, avatarDropdown);
  initSidebarToggle({
    sidebar,
    toggleSidebar,
    sidebarTexts,
    sidebarLogo,
    sidebarLogoSmall,
    sidebarLogoText,
  });
}

/**
 * Khởi tạo dropdown avatar:
 * - Click avatarButton => toggle dropdown
 * - Click ra ngoài => đóng dropdown
 * - ESC => đóng dropdown
 */
function initAvatarDropdown(avatarButton, avatarDropdown) {
  if (!avatarButton || !avatarDropdown) return;

  // Đảm bảo dropdown ẩn mặc định nếu chưa có class hidden
  if (!avatarDropdown.classList.contains("hidden")) {
    avatarDropdown.classList.add("hidden");
  }

  // Click vào avatar => bật/tắt dropdown
  avatarButton.addEventListener("click", (event) => {
    event.stopPropagation(); // chặn nổi bọt để không bị document click đóng ngay
    avatarDropdown.classList.toggle("hidden");
  });

  // Gắn listener click ngoài + ESC chỉ 1 lần cho page
  if (!avatarOutsideHandlerAttached) {
    document.addEventListener("click", (event) => {
      // Nếu dropdown đang ẩn thì khỏi check
      if (avatarDropdown.classList.contains("hidden")) return;

      // Nếu click vào chính avatarButton hoặc bên trong dropdown thì bỏ qua
      if (
        avatarButton.contains(event.target) ||
        avatarDropdown.contains(event.target)
      ) {
        return;
      }

      // Còn lại: click ra ngoài => đóng dropdown
      avatarDropdown.classList.add("hidden");
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        avatarDropdown.classList.add("hidden");
      }
    });

    avatarOutsideHandlerAttached = true;
  }
}

/**
 * Khởi tạo toggle cho sidebar (chỉ hoạt động nếu có #toggleSidebar):
 * - Mặc định: sidebar rộng (w-64)
 * - Thu gọn: w-20, ẩn .sidebar-text, ẩn logo chữ, hiện logo nhỏ
 */
function initSidebarToggle({
  sidebar,
  toggleSidebar,
  sidebarTexts,
  sidebarLogo,
  sidebarLogoSmall,
  sidebarLogoText,
}) {
  if (!sidebar || !toggleSidebar) return;

  toggleSidebar.addEventListener("click", () => {
    const isExpanded = sidebar.classList.contains("w-64");

    if (isExpanded) {
      // Thu nhỏ
      sidebar.classList.remove("w-64");
      sidebar.classList.add("w-20");

      sidebarTexts.forEach((el) => el.classList.add("hidden"));
      if (sidebarLogo) sidebarLogo.classList.add("hidden");
      if (sidebarLogoText) sidebarLogoText.classList.add("hidden");
      if (sidebarLogoSmall) sidebarLogoSmall.classList.remove("hidden");

      toggleSidebar.classList.add("justify-center");
    } else {
      // Mở rộng
      sidebar.classList.remove("w-20");
      sidebar.classList.add("w-64");

      sidebarTexts.forEach((el) => el.classList.remove("hidden"));
      if (sidebarLogo) sidebarLogo.classList.remove("hidden");
      if (sidebarLogoText) sidebarLogoText.classList.remove("hidden");
      if (sidebarLogoSmall) sidebarLogoSmall.classList.add("hidden");

      toggleSidebar.classList.remove("justify-center");
    }
  });
}
