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

  // --- LOGIC BACKUP ---
  const backupNowBtn = document.getElementById("backupNowBtn");
  const backupList = document.getElementById("backupList");

  async function renderBackups() {
    if (typeof BackupAPI === "undefined" || !backupList) return;

    const backups = await BackupAPI.getAll();
    backupList.innerHTML = "";

    if (!backups || backups.length === 0) {
      backupList.innerHTML =
        '<li class="py-4 text-center text-gray-500">Chưa có bản sao lưu nào.</li>';
      return;
    }

    backups.forEach((bk) => {
      const li = document.createElement("li");
      li.className = "py-3 flex justify-between items-center";
      li.innerHTML = `
                <div>
                    <p class="text-sm font-medium text-gray-900">${bk.filename}</p>
                    <p class="text-xs text-gray-500">${bk.type} - ${bk.date} - ${bk.size}</p>
                </div>
                <div class="flex space-x-2">
                    <button class="btn btn-secondary !py-1 !px-2 text-xs btn-download" data-filename="${bk.filename}">Tải về</button>
                    <button class="btn btn-secondary !py-1 !px-2 text-xs btn-restore text-blue-600" data-id="${bk.id}">Phục hồi</button>
                    <button class="btn btn-delete !py-1 !px-2 text-xs btn-delete-bk" data-id="${bk.id}">Xóa</button>
                </div>
            `;
      backupList.appendChild(li);
    });
  }

  // Nút Tạo Backup
  if (backupNowBtn) {
    backupNowBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      backupNowBtn.innerHTML = `<svg class="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Đang xử lý...`;
      backupNowBtn.classList.add("btn-disabled");

      try {
        await BackupAPI.create();
        await renderBackups();
        alert("Sao lưu thành công!");
      } catch (err) {
        console.error("backup create error:", err);
        alert("Không thể tạo bản sao lưu.");
      } finally {
        // Reset nút
        backupNowBtn.innerHTML = `<svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>Tạo bản sao lưu mới`;
        backupNowBtn.classList.remove("btn-disabled");
      }
    });
  }

  // Xử lý sự kiện trong danh sách (Download, Restore, Delete)
  if (backupList) {
    backupList.addEventListener("click", (e) => {
      const target = e.target;

      // Download (Giả lập)
      if (target.classList.contains("btn-download")) {
        const filename = target.getAttribute("data-filename");
        alert(`Đang tải xuống: ${filename}...`);
      }

      // Restore
      if (target.classList.contains("btn-restore")) {
        (async () => {
          const id = target.getAttribute("data-id");
          if (
            !confirm(
              "CẢNH BÁO: Phục hồi sẽ ghi đè dữ liệu hiện tại. Bạn có chắc chắn không?"
            )
          )
            return;
          try {
            await BackupAPI.restore(id);
            alert("Hệ thống đã được phục hồi về trạng thái của bản sao lưu này.");
            window.location.reload(); // Reload để thấy hiệu ứng (nếu có)
          } catch (err) {
            console.error("restore error:", err);
            alert("Không thể phục hồi bản sao lưu.");
          }
        })();
      }

      // Delete
      if (target.classList.contains("btn-delete-bk")) {
        (async () => {
          const id = target.getAttribute("data-id");
          if (!confirm("Xóa bản sao lưu này vĩnh viễn?")) return;
          try {
            await BackupAPI.delete(id);
            await renderBackups();
          } catch (err) {
            console.error("delete backup error:", err);
            alert("Không thể xóa bản sao lưu.");
          }
        })();
      }
    });
  }

  (async () => {
    await renderBackups();
  })();
});
