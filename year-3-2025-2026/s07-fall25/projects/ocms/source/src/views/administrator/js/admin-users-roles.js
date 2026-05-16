document.addEventListener("DOMContentLoaded", () => {
  // --- LẤY CÁC ĐỐI TƯỢNG (ELEMENTS) ---
  // Sidebar & Avatar
  const sidebar = document.getElementById("sidebar");
  const toggleSidebar = document.getElementById("toggleSidebar");
  const sidebarTexts = document.querySelectorAll(".sidebar-text");
  const sidebarLogo = document.getElementById("sidebarLogo");
  const sidebarLogoSmall = document.getElementById("sidebarLogoSmall");
  const avatarButton = document.getElementById("avatarButton");
  const avatarDropdown = document.getElementById("avatarDropdown");

  // Tab
  const tabButtonsContainer = document.getElementById("tabButtons");
  const tabContentsContainer = document.getElementById("tabContents");

  // --- LOGIC SIDEBAR (Giống hệt Dashboard) ---
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

  // --- LOGIC AVATAR DROPDOWN (Giống hệt Dashboard) ---
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
      !avatarButton.contains(e.target)
    ) {
      avatarDropdown.classList.add("hidden");
    }
  });

  // --- LOGIC TẠO TAB VAI TRÒ ---
  if (
    tabButtonsContainer &&
    tabContentsContainer &&
    typeof rolePermissions !== "undefined"
  ) {
    let isFirstTab = true;

    // Lặp qua dữ liệu 'rolePermissions' (được định nghĩa trong HTML)
    for (const roleName in rolePermissions) {
      const permissions = rolePermissions[roleName];

      // 1. Tạo Nút Tab
      const tabButton = document.createElement("button");
      tabButton.className = `tab-button py-3 px-1 border-b-2 border-transparent text-sm text-gray-500 hover:text-gray-700`;
      tabButton.textContent = roleName;
      tabButton.setAttribute("data-tab", roleName);

      // 2. Tạo Nội dung Tab
      const tabContent = document.createElement("div");
      tabContent.className = "tab-content";
      tabContent.id = roleName;

      // Tạo danh sách quyền
      const list = document.createElement("ul");
      list.className = "list-disc list-inside space-y-2 pl-4 text-gray-700";
      permissions.forEach((perm) => {
        const item = document.createElement("li");
        item.textContent = perm;
        list.appendChild(item);
      });
      tabContent.appendChild(list);

      // 3. Kích hoạt tab đầu tiên (Administrator)
      if (isFirstTab) {
        tabButton.classList.add("active");
        tabContent.classList.add("active");
        isFirstTab = false;
      }

      // 4. Thêm vào DOM
      tabButtonsContainer.appendChild(tabButton);
      tabContentsContainer.appendChild(tabContent);
    }

    // 5. Thêm sự kiện Click cho các nút Tab
    tabButtonsContainer.addEventListener("click", (e) => {
      if (e.target.classList.contains("tab-button")) {
        const tabId = e.target.getAttribute("data-tab");

        // Tắt active tất cả
        tabButtonsContainer
          .querySelectorAll(".tab-button")
          .forEach((btn) => btn.classList.remove("active"));
        tabContentsContainer
          .querySelectorAll(".tab-content")
          .forEach((content) => content.classList.remove("active"));

        // Bật active cho cái được click
        e.target.classList.add("active");
        document.getElementById(tabId).classList.add("active");
      }
    });
  } else {
    console.error("Không tìm thấy 'rolePermissions' hoặc container của tab.");
  }
});
