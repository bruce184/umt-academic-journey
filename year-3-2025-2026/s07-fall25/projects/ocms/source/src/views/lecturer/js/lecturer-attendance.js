// src/views/lecturer/js/lecturer-attendance.js

const API_BASE = "/lecturers";
const DEFAULT_LECTURER_ID = 1;

// --- Helper: lấy lecturerId hiện tại (query / localStorage / default) ---
function getCurrentLecturerId() {
  try {
    const params = new URLSearchParams(window.location.search);
    const fromQuery =
      params.get("lecturer_id") || params.get("lecturerId") || null;

    if (fromQuery && !Number.isNaN(Number(fromQuery))) {
      return Number(fromQuery);
    }

    const fromStorage = window.localStorage.getItem("ocms.lecturerId");
    if (fromStorage && !Number.isNaN(Number(fromStorage))) {
      return Number(fromStorage);
    }
  } catch {
    // ignore
  }

  return DEFAULT_LECTURER_ID;
}

// --- API: lấy danh sách lớp từ Analytics (dùng lại) ---
async function fetchLecturerClasses() {
  const lecturerId = getCurrentLecturerId();

  const res = await fetch(`${API_BASE}/${lecturerId}/analytics`, {
    headers: {
      "Content-Type": "application/json",
      "X-Requested-By": "ocms-lecturer-attendance-classes",
    },
  });

  if (!res.ok) {
    console.error("Failed to fetch lecturer analytics:", res.status);
    throw new Error("Failed to fetch lecturer analytics");
  }

  const json = await res.json();
  const data = json.data || json;

  return Array.isArray(data.classes) ? data.classes : [];
}

// --- API: GET template điểm danh ---
async function fetchAttendanceTemplate(classId, date) {
  const params = new URLSearchParams();
  if (date) params.set("date", date);

  const query = params.toString();
  const url = `${API_BASE}/attendance/${encodeURIComponent(classId)}${
    query ? `?${query}` : ""
  }`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "X-Requested-By": "ocms-lecturer-attendance-template",
    },
  });

  if (!res.ok) {
    console.error("Failed to fetch attendance template:", res.status);
    throw new Error("Failed to fetch attendance template");
  }

  const json = await res.json();
  return json.data || json;
}

// --- API: POST lưu điểm danh ---
async function saveAttendance(classId, date, studentAttendanceList) {
  const res = await fetch(
    `${API_BASE}/attendance/${encodeURIComponent(classId)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-By": "ocms-lecturer-attendance-save",
      },
      body: JSON.stringify({
        date,
        studentAttendanceList,
      }),
    }
  );

  if (!res.ok) {
    console.error("Failed to save attendance:", res.status);
    throw new Error("Failed to save attendance");
  }

  const json = await res.json();
  return json.data || json;
}

// --- Render select lớp ---
function renderClassOptions(classes) {
  const select = document.getElementById("attendance-class-select");
  if (!select) return;

  if (!Array.isArray(classes) || classes.length === 0) {
    select.innerHTML =
      '<option value="">No classes found for this lecturer</option>';
    return;
  }

  const options = classes
    .map((c) => {
      const id = c.courseId ?? c.id ?? "";
      const name = c.courseName ?? "Unnamed course";
      return `<option value="${id}">${id} — ${name}</option>`;
    })
    .join("");

  select.innerHTML = options;
}

// --- Render bảng điểm danh ---
function renderAttendanceTable(attendance) {
  const container = document.getElementById("attendance-list-container");
  if (!container) return;

  const students = Array.isArray(attendance.students)
    ? attendance.students
    : [];

  if (!students.length) {
    container.innerHTML = `
      <div class="text-sm text-gray-500">
        No students found for this class.
      </div>
    `;
    return;
  }

  const rows = students
    .map((s, index) => {
      const sid = s.studentId || "";
      const name = s.fullName || "";
      const checked = s.present ? "checked" : "";

      return `
        <tr class="border-t">
          <td class="px-3 py-2 text-sm">${index + 1}</td>
          <td class="px-3 py-2 text-sm font-mono">${sid}</td>
          <td class="px-3 py-2 text-sm">${name}</td>
          <td class="px-3 py-2 text-center">
            <input
              type="checkbox"
              class="attendance-checkbox w-4 h-4"
              data-student-id="${sid}"
              ${checked}
            />
          </td>
        </tr>
      `;
    })
    .join("");

  container.innerHTML = `
    <table class="min-w-full text-sm">
      <thead>
        <tr class="bg-gray-50">
          <th class="px-3 py-2 text-left font-medium text-gray-700">#</th>
          <th class="px-3 py-2 text-left font-medium text-gray-700">Student ID</th>
          <th class="px-3 py-2 text-left font-medium text-gray-700">Student Name</th>
          <th class="px-3 py-2 text-center font-medium text-gray-700">Present</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

// --- Lấy dữ liệu từ UI để gửi POST ---
function collectAttendanceFromUI() {
  const checkboxes = document.querySelectorAll(
    "#attendance-list-container .attendance-checkbox"
  );

  const list = [];
  checkboxes.forEach((cb) => {
    list.push({
      studentId: cb.getAttribute("data-student-id") || "",
      present: cb.checked,
    });
  });

  return list;
}

// --- Load attendance cho class + date hiện tại ---
async function loadAttendanceForCurrentSelection() {
  const select = document.getElementById("attendance-class-select");
  const dateInput = document.getElementById("attendance-date-input");
  const container = document.getElementById("attendance-list-container");

  if (!select || !dateInput || !container) return;

  const classId = select.value;
  const date = dateInput.value;

  if (!classId) {
    container.innerHTML = `
      <div class="text-sm text-gray-500">
        Please select a class to load the student list.
      </div>
    `;
    return;
  }

  try {
    container.innerHTML = `
      <div class="text-sm text-gray-500">
        Loading attendance data...
      </div>
    `;
    const attendance = await fetchAttendanceTemplate(classId, date);
    renderAttendanceTable(attendance);
  } catch (err) {
    console.error("Error loading attendance:", err);
    container.innerHTML = `
      <div class="text-sm text-red-600">
        Cannot load attendance right now. Please try again later.
      </div>
    `;
  }
}

// --- Gán sự kiện ---
function wireAttendanceEvents() {
  const reloadBtn = document.getElementById("attendance-reload-btn");
  const saveBtn = document.getElementById("attendance-save-btn");
  const select = document.getElementById("attendance-class-select");
  const dateInput = document.getElementById("attendance-date-input");

  if (reloadBtn) {
    reloadBtn.addEventListener("click", () => {
      loadAttendanceForCurrentSelection();
    });
  }

  if (select) {
    select.addEventListener("change", () => {
      loadAttendanceForCurrentSelection();
    });
  }

  if (dateInput) {
    dateInput.addEventListener("change", () => {
      loadAttendanceForCurrentSelection();
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      const selectEl = document.getElementById("attendance-class-select");
      const dateEl = document.getElementById("attendance-date-input");

      if (!selectEl || !dateEl) return;

      const classId = selectEl.value;
      const date = dateEl.value;

      if (!classId) {
        alert("Please select a class before saving attendance.");
        return;
      }

      const list = collectAttendanceFromUI();
      if (!list.length) {
        alert("No students to save.");
        return;
      }

      try {
        const result = await saveAttendance(classId, date, list);
        const present = result.presentCount ?? list.filter((s) => s.present).length;
        const total = result.total ?? list.length;

        alert(
          `Attendance saved.\nPresent: ${present}/${total} students.`
        );
      } catch (err) {
        console.error("Error saving attendance:", err);
        alert("Failed to save attendance. Please try again later.");
      }
    });
  }
}

// --- Entry point ---
async function initLecturerAttendance() {
  const attendanceTab = document.getElementById("content-attendance");
  if (!attendanceTab) return; // Không phải trang này thì thôi

  // Set default date = today nếu chưa có
  const dateInput = document.getElementById("attendance-date-input");
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().slice(0, 10);
  }

  try {
    const classes = await fetchLecturerClasses();
    renderClassOptions(classes);
  } catch (err) {
    console.error("Error fetching classes for attendance:", err);
    const select = document.getElementById("attendance-class-select");
    if (select) {
      select.innerHTML =
        '<option value="">Cannot load classes. Please try again later.</option>';
    }
  }

  wireAttendanceEvents();
  // Sau khi render lớp, auto load lần đầu (nếu có lớp)
  const select = document.getElementById("attendance-class-select");
  if (select && select.value) {
    loadAttendanceForCurrentSelection();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initLecturerAttendance();
});
