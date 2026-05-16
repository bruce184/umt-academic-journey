document.addEventListener("DOMContentLoaded", () => {
  // --- 1. INIT & VARIABLES ---
  // Sidebar & UI Elements
  const sidebar = document.getElementById("sidebar");
  const toggleSidebar = document.getElementById("toggleSidebar");
  const sidebarTexts = document.querySelectorAll(".sidebar-text");
  const sidebarLogo = document.getElementById("sidebarLogo");
  const sidebarLogoSmall = document.getElementById("sidebarLogoSmall");
  const avatarButton = document.getElementById("avatarButton");
  const avatarDropdown = document.getElementById("avatarDropdown");

  // Modal & Form Elements
  const courseModal = document.getElementById("courseModal");
  const openModalBtn = document.getElementById("openModalBtn");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const cancelModalBtn = document.getElementById("cancelModalBtn");
  const modalTitle = document.getElementById("modalTitle");
  const saveCourseBtn = document.getElementById("saveCourseBtn");

  // Data Elements
  const coursesTableBody = document.getElementById("coursesTableBody");
  const prerequisitesSelect = document.getElementById("coursePrerequisites");
  const courseEditId = document.getElementById("courseEditId");

  // --- 2. UI HANDLERS (Sidebar, Avatar, Modal) ---
  // (Logic giao diện giữ nguyên để tiết kiệm không gian, code giống như cũ)
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
    courseModal.classList.remove("hidden");
    courseModal.classList.add("modal-open");
  };
  const closeModal = () => {
    courseModal.classList.add("hidden");
    courseModal.classList.remove("modal-open");
    document.getElementById("courseForm").reset();
    courseEditId.value = "";
  };

  if (openModalBtn)
    openModalBtn.addEventListener("click", () => {
      modalTitle.textContent = "Thêm Môn học Mới";
      document.getElementById("courseCode").disabled = false;
      openModal();
    });
  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
  if (cancelModalBtn) cancelModalBtn.addEventListener("click", closeModal);

  // --- 3. DATA LOGIC (KẾT NỐI VỚI COURSE SERVICE) ---

  // Hàm Render Bảng (READ)
  async function renderTable() {
    try {
      // GỌI API: Lấy danh sách môn học
      const courses = await CourseAPI.getAll();

      coursesTableBody.innerHTML = "";
      if (!courses || courses.length === 0) {
        coursesTableBody.innerHTML =
          '<tr><td colspan="4" class="text-center p-4">Chưa có dữ liệu.</td></tr>';
        updatePrerequisiteSelect([]);
        return;
      }

      courses.forEach((course) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-semibold text-gray-900">${course.name}</div>
                        <div class="text-xs text-gray-500">${course.id}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${course.credits}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-red-600">${course.requires || "Không"}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button class="btn btn-edit" data-id="${course.id}">Sửa</button>
                        <button class="btn btn-delete" data-id="${course.id}">Xóa</button>
                    </td>
                `;
        coursesTableBody.appendChild(row);
      });

      // Cập nhật luôn dropdown tiên quyết
      updatePrerequisiteSelect(courses);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      coursesTableBody.innerHTML =
        '<tr><td colspan="4" class="text-center text-red-500">Lỗi kết nối dữ liệu.</td></tr>';
    }
  }

  // Hàm cập nhật Dropdown (Helper)
  function updatePrerequisiteSelect(courses) {
    const currentVal = prerequisitesSelect.value;
    prerequisitesSelect.innerHTML =
      '<option value="">Không có môn tiên quyết</option>';
    courses.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = `${c.id} - ${c.name}`;
      prerequisitesSelect.appendChild(opt);
    });
    prerequisitesSelect.value = currentVal;
  }

  // Xử lý nút LƯU (CREATE / UPDATE)
  saveCourseBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    // Thu thập dữ liệu từ Form
    const formData = {
      id: document.getElementById("courseCode").value.trim().toUpperCase(),
      name: document.getElementById("courseName").value.trim(),
      credits: parseInt(document.getElementById("courseCredits").value),
      requires: document.getElementById("coursePrerequisites").value || null,
      schedule: {
        day: parseInt(document.getElementById("courseDay").value),
        time: document.getElementById("courseTime").value.trim(),
        room: document.getElementById("courseRoom").value.trim(),
      },
      instructor: document.getElementById("courseInstructor").value.trim(),
    };

    // Validate cơ bản
    if (!formData.id || !formData.name || isNaN(formData.credits)) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc!");
      return;
    }

    try {
      if (courseEditId.value) {
        // GỌI API: Cập nhật
        await CourseAPI.update(courseEditId.value, formData);
        alert("Cập nhật thành công!");
      } else {
        // GỌI API: Tạo mới
        await CourseAPI.create(formData);
        alert("Thêm mới thành công!");
      }

      await renderTable();
      closeModal();
    } catch (error) {
      alert(error.message); // Hiển thị lỗi từ Service (ví dụ: Trùng ID)
    }
  });

  // Xử lý Click trên Bảng (EDIT / DELETE)
  coursesTableBody.addEventListener("click", (e) => {
    const target = e.target;
    const id = target.getAttribute("data-id");

    // Nút SỬA
    if (target.classList.contains("btn-edit")) {
      (async () => {
        const course = await CourseAPI.getById(id); // GỌI API: Lấy chi tiết
        if (!course) return;

        modalTitle.textContent = `Sửa Môn học: ${course.name}`;
        courseEditId.value = course.id;

        // Điền form
        document.getElementById("courseCode").value = course.id;
        document.getElementById("courseCode").disabled = true; // ID không được sửa
        document.getElementById("courseName").value = course.name;
        document.getElementById("courseCredits").value = course.credits;
        document.getElementById("coursePrerequisites").value =
          course.requires || "";
        if (course.schedule) {
          document.getElementById("courseDay").value = course.schedule.day;
          document.getElementById("courseTime").value = course.schedule.time;
          document.getElementById("courseRoom").value = course.schedule.room;
        }
        document.getElementById("courseInstructor").value =
          course.instructor || "";

        openModal();
      })();
    }

    // Nút XÓA
    if (target.classList.contains("btn-delete")) {
      (async () => {
        if (!confirm(`Bạn có chắc chắn muốn xóa môn ${id}?`)) return;
        try {
          await CourseAPI.delete(id); // GỌI API: Xóa
          await renderTable(); // Refresh bảng
        } catch (error) {
          alert(error.message || "Lỗi khi xóa môn"); // Hiển thị lỗi ràng buộc
        }
      })();
    }
  });

  // Khởi chạy lần đầu
  (async () => {
    await renderTable();
  })();
});
