document.addEventListener("DOMContentLoaded", () => {
  // --- 1. INIT & VARIABLES ---
  const sidebar = document.getElementById("sidebar");
  const toggleSidebar = document.getElementById("toggleSidebar");
  const sidebarTexts = document.querySelectorAll(".sidebar-text");
  const sidebarLogo = document.getElementById("sidebarLogo");
  const sidebarLogoSmall = document.getElementById("sidebarLogoSmall");
  const avatarButton = document.getElementById("avatarButton");
  const avatarDropdown = document.getElementById("avatarDropdown");

  // Modal & Form
  const userModal = document.getElementById("userModal");
  const openModalBtn = document.getElementById("openModalBtn");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const cancelModalBtn = document.getElementById("cancelModalBtn");
  const modalTitle = document.getElementById("modalTitle");
  const saveUserBtn = document.getElementById("saveUserBtn");

  const usersTableBody = document.getElementById("usersTableBody");
  const userForm = document.getElementById("userForm");
  const userEditId = document.getElementById("userEditId");
  const passwordSection = document.getElementById("passwordSection");
  const resetPasswordBtn = document.getElementById("resetPasswordBtn");

  // --- 2. UI HANDLERS ---
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

  const openModal = () => {
    userModal.classList.remove("hidden");
    userModal.classList.add("modal-open");
  };
  const closeModal = () => {
    userModal.classList.add("hidden");
    userModal.classList.remove("modal-open");
    userForm.reset();
    userEditId.value = "";
  };

  if (openModalBtn) {
    openModalBtn.addEventListener("click", () => {
      modalTitle.textContent = "Thêm Người dùng mới";
      userForm.reset();
      userEditId.value = "";
      document.getElementById("userEmail").disabled = false; // Cho phép nhập email
      passwordSection.classList.remove("hidden");
      resetPasswordBtn.classList.add("hidden");
      openModal();
    });
  }
  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
  if (cancelModalBtn) cancelModalBtn.addEventListener("click", closeModal);

  // --- 3. DATA LOGIC (GỌI SERVICE) ---

  // Render Bảng
  async function renderUserTable() {
    try {
      const users = await UserAPI.getAll();

      usersTableBody.innerHTML = "";
      if (!users || users.length === 0) {
        usersTableBody.innerHTML =
          '<tr><td colspan="4" class="text-center p-4">Chưa có dữ liệu.</td></tr>';
        return;
      }

      users.forEach((user) => {
        const row = document.createElement("tr");
        // Tô màu vai trò
        let roleColor = "bg-gray-200 text-gray-800";
        switch (user.role) {
          case "Administrator":
            roleColor = "bg-gray-700 text-white";
            break;
          case "Student":
            roleColor = "bg-blue-600 text-white";
            break;
          case "Lecturer":
            roleColor = "bg-red-600 text-white";
            break;
          case "Department Head":
            roleColor = "bg-green-600 text-white";
            break;
          case "Registrar":
            roleColor = "bg-purple-600 text-white";
            break;
          case "Finance":
            roleColor = "bg-yellow-600 text-white";
            break;
        }

        row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-semibold text-gray-900">${user.name}</div>
                        <div class="text-xs text-gray-500">${user.id}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${user.email}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${roleColor}">
                            ${user.role}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button class="btn btn-edit" data-id="${user.id}">Sửa</button>
                        <button class="btn btn-delete" data-id="${user.id}">Xóa</button>
                    </td>
                `;
        usersTableBody.appendChild(row);
      });
    } catch (error) {
      console.error("Lỗi render:", error);
      usersTableBody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-red-500">Lỗi tải dữ liệu.</td></tr>`;
    }
  }

  // Xử lý LƯU (Create / Update)
  if (saveUserBtn) {
    saveUserBtn.addEventListener("click", async (e) => {
      e.preventDefault();

      const formData = {
        name: document.getElementById("userName").value.trim(),
        email: document.getElementById("userEmail").value.trim(),
        role: document.getElementById("userRole").value,
      };
      const editingId = userEditId.value;

      if (!formData.name || !formData.email || !formData.role) {
        alert("Vui lòng điền đầy đủ thông tin bắt buộc.");
        return;
      }

      try {
        if (editingId) {
          // UPDATE
          await UserAPI.update(editingId, formData);
          alert("Cập nhật thành công!");
        } else {
          // CREATE
          await UserAPI.create(formData);
          alert("Thêm người dùng thành công!");
        }
        await renderUserTable();
        closeModal();
      } catch (error) {
        alert(error.message || "Lỗi khi lưu người dùng");
      }
    });
  }

  // Xử lý Click Bảng (Sửa/Xóa)
  if (usersTableBody) {
    usersTableBody.addEventListener("click", (e) => {
      const target = e.target;
      const id = target.getAttribute("data-id");

      // Nút SỬA
      if (target.classList.contains("btn-edit")) {
        (async () => {
          const user = await UserAPI.getById(id);
          if (!user) return;

          modalTitle.textContent = `Sửa Người dùng: ${user.name}`;
          userEditId.value = user.id;
          document.getElementById("userName").value = user.name;
          document.getElementById("userEmail").value = user.email;
          document.getElementById("userRole").value = user.role;

          passwordSection.classList.add("hidden"); // Ẩn ô mật khẩu khi sửa
          resetPasswordBtn.classList.remove("hidden");
          openModal();
        })();
      }

      // Nút XÓA
      if (target.classList.contains("btn-delete")) {
        (async () => {
          if (!confirm(`Bạn có chắc chắn muốn xóa người dùng này không?`)) return;
          try {
            await UserAPI.delete(id);
            await renderUserTable();
          } catch (error) {
            alert(error.message || "Lỗi khi xóa người dùng");
          }
        })();
      }
    });
  }

  // Reset Password (Giả lập)
  if (resetPasswordBtn) {
    resetPasswordBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (confirm(`Đặt lại mật khẩu về mặc định (123456)?`)) {
        alert("Đã đặt lại mật khẩu thành công!");
        closeModal();
      }
    });
  }

  // Khởi chạy
  renderUserTable();
});
