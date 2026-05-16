document.addEventListener("DOMContentLoaded", () => {
  // ... (Logic Sidebar/Avatar giữ nguyên) ...
  const sidebar = document.getElementById("sidebar");
  const toggleSidebar = document.getElementById("toggleSidebar");
  const sidebarTexts = document.querySelectorAll(".sidebar-text");
  const sidebarLogo = document.getElementById("sidebarLogo");
  const sidebarLogoSmall = document.getElementById("sidebarLogoSmall");
  const avatarButton = document.getElementById("avatarButton");
  const avatarDropdown = document.getElementById("avatarDropdown");
  if (toggleSidebar) {
    toggleSidebar.addEventListener("click", () => {
      const isExpanded = sidebar.classList.contains("w-64");
      sidebar.classList.toggle("w-64", !isExpanded);
      sidebar.classList.toggle("w-20", isExpanded);
      sidebarTexts.forEach((t) => t.classList.toggle("hidden", isExpanded));
      sidebarLogo.classList.toggle("hidden", isExpanded);
      sidebarLogoSmall.classList.toggle("hidden", !isExpanded);
    });
  }
  if (avatarButton) {
    avatarButton.addEventListener("click", (e) => {
      avatarDropdown.classList.toggle("hidden");
      e.stopPropagation();
    });
    document.addEventListener("click", (e) => {
      if (
        !avatarButton.contains(e.target) &&
        !avatarDropdown.contains(e.target)
      ) {
        avatarDropdown.classList.add("hidden");
      }
    });
  }

  // --- LOGIC HIỂN THỊ & TÌM KIẾM LOG ---
  const logTableBody = document.getElementById("logTableBody");
  const searchInput = document.getElementById("logSearchInput");

  // Lấy dữ liệu log
  let logs = [];
  (async () => {
    if (typeof LogAPI !== "undefined") {
      logs = await LogAPI.getAll();
    } else if (typeof allAuditLogs !== "undefined") {
      logs = allAuditLogs;
    }

    // Render lần đầu sau khi có logs
    renderLogTable(logs);
  })();

  function renderLogTable(data) {
    logTableBody.innerHTML = "";
    if (data.length === 0) {
      logTableBody.innerHTML =
        '<tr><td colspan="4" class="text-center p-4 text-gray-500">Không tìm thấy nhật ký phù hợp.</td></tr>';
      return;
    }

    data.forEach((log) => {
      const row = document.createElement("tr");

      let actionColor = "bg-gray-200 text-gray-800";
      // Logic màu sắc
      const act = log.action.toUpperCase();
      if (
        act.includes("UPDATE") ||
        act.includes("SỬA") ||
        act.includes("CẬP NHẬT")
      )
        actionColor = "bg-blue-100 text-blue-800";
      if (act.includes("CREATE") || act.includes("THÊM") || act.includes("TẠO"))
        actionColor = "bg-green-100 text-green-800";
      if (act.includes("DELETE") || act.includes("XÓA"))
        actionColor = "bg-red-100 text-red-800";
      if (act.includes("CONFIG") || act.includes("CẤU HÌNH"))
        actionColor = "bg-purple-100 text-purple-800";

      row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${log.timestamp}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">${log.user}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${actionColor}">
                        ${log.action}
                    </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">${log.details}</td>
            `;
      logTableBody.appendChild(row);
    });
  }

  // Event Listener cho ô tìm kiếm
  if (searchInput) {
    searchInput.addEventListener("keyup", (e) => {
      const term = e.target.value.toLowerCase();
      const filteredLogs = logs.filter(
        (log) =>
          log.user.toLowerCase().includes(term) ||
          log.action.toLowerCase().includes(term) ||
          log.details.toLowerCase().includes(term)
      );
      renderLogTable(filteredLogs);
    });
  }

  // Note: initial render is invoked after logs are loaded above
});
