/* eslint-disable no-unused-vars */
// student/js/student-registration.js
// Phase 2: Student Registration – dùng API thật (API-only)

import { initLayout } from "../../common/layout-common.js";

const STUDENT_API_BASE = "/students";

// =====================
// Helpers chung
// =====================

/**
 * Resolve current studentId:
 * 1. sessionStorage (ưu tiên)
 * 2. URL query (?studentId= / ?student_id=)
 * 3. localStorage (legacy)
 */
function resolveCurrentStudentId() {
  try {
    const fromSession =
      window.sessionStorage.getItem("student_id") ||
      window.sessionStorage.getItem("user_id");
    if (fromSession && !Number.isNaN(Number(fromSession))) {
      return Number(fromSession);
    }

    const params = new URLSearchParams(window.location.search);
    const fromQuery =
      params.get("studentId") || params.get("student_id") || null;
    if (fromQuery && !Number.isNaN(Number(fromQuery))) {
      return Number(fromQuery);
    }

    const fromStorage = window.localStorage.getItem("ocmsCurrentStudentId");
    if (fromStorage && !Number.isNaN(Number(fromStorage))) {
      return Number(fromStorage);
    }
  } catch (err) {
    console.warn("[Student Registration] Cannot resolve studentId.", err);
  }

  return null;
}

function $(id) {
  return document.getElementById(id);
}

function showMessage(text, type = "info") {
  const el = $("registrationMessage");
  if (!el) return;
  el.textContent = text;
  el.classList.remove(
    "hidden",
    "text-red-600",
    "text-green-600",
    "text-slate-600",
  );

  if (type === "error") el.classList.add("text-red-600");
  else if (type === "success") el.classList.add("text-green-600");
  else el.classList.add("text-slate-600");
}

function hideMessage() {
  const el = $("registrationMessage");
  if (!el) return;
  el.classList.add("hidden");
}

function showLoading() {
  const el = $("registrationLoading");
  if (!el) return;
  el.classList.remove("hidden");
}

function hideLoading() {
  const el = $("registrationLoading");
  if (!el) return;
  el.classList.add("hidden");
}

// =====================
// Gọi API
// =====================

/**
 * GET /students/:studentId/registration/available
 *
 * Accepted:
 *  A) { ok, data: { items: [...] } }
 *  B) { items: [...] }
 *  C) [ ... ]
 */
async function fetchAvailableCourses(studentId) {
  const url = `${STUDENT_API_BASE}/${studentId}/registration/available`;

  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} when calling ${url}`);
  }

  let payload;
  try {
    payload = await res.json();
  } catch (err) {
    throw new Error(
      `[Student Registration] Cannot parse JSON payload (available): ${
        err && err.message ? err.message : String(err)
      }`,
    );
  }

  if (
    payload &&
    typeof payload === "object" &&
    Object.prototype.hasOwnProperty.call(payload, "data")
  ) {
    const data = payload.data || {};
    if (Array.isArray(data.items)) return data.items;
  }

  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray(payload.items)
  ) {
    return payload.items;
  }

  if (Array.isArray(payload)) return payload;

  throw new Error(
    "[Student Registration] Unexpected response shape for available courses.",
  );
}

/**
 * GET /students/:studentId/registration
 *
 * Accepted:
 *  A) { ok, data: { items: [{ course_id }, ...] } }
 *  B) { items: [ { course_id }, ... ] }
 *  C) { course_ids: [...] }
 *  D) [ ...course_ids ]
 */
async function fetchCurrentRegistration(studentId) {
  const url = `${STUDENT_API_BASE}/${studentId}/registration`;

  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} when calling ${url}`);
  }

  let payload;
  try {
    payload = await res.json();
  } catch (err) {
    throw new Error(
      `[Student Registration] Cannot parse JSON payload (current): ${
        err && err.message ? err.message : String(err)
      }`,
    );
  }

  // helper: convert bất cứ dạng nào thành Set<number>
  const toSetFromArray = (arr) => {
    const set = new Set();
    arr.forEach((x) => {
      const id =
        typeof x === "object" && x !== null
          ? Number(x.course_id ?? x.courseId ?? x.id ?? NaN)
          : Number(x);
      if (!Number.isNaN(id) && id > 0) set.add(id);
    });
    return set;
  };

  if (
    payload &&
    typeof payload === "object" &&
    Object.prototype.hasOwnProperty.call(payload, "data")
  ) {
    const data = payload.data || {};
    if (Array.isArray(data.items)) return toSetFromArray(data.items);
    if (Array.isArray(data.course_ids)) return toSetFromArray(data.course_ids);
  }

  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray(payload.items)
  ) {
    return toSetFromArray(payload.items);
  }

  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray(payload.course_ids)
  ) {
    return toSetFromArray(payload.course_ids);
  }

  if (Array.isArray(payload)) {
    return toSetFromArray(payload);
  }

  // không có gì -> rỗng
  return new Set();
}

/**
 * POST /students/:studentId/registration
 *
 * Body:
 *  { course_ids: [ ... ] }
 *
 * Accepted:
 *  A) { ok, data: { course_ids: [...] } }
 *  B) { course_ids: [...] }
 *  C) { ok: true } / {}
 */
async function saveRegistration(studentId, courseIds) {
  const url = `${STUDENT_API_BASE}/${studentId}/registration`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      course_ids: courseIds,
    }),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} when calling ${url}`);
  }

  let payload = null;
  try {
    payload = await res.json();
  } catch (err) {
    // 204 No Content cũng OK
    return courseIds;
  }

  if (
    payload &&
    typeof payload === "object" &&
    Object.prototype.hasOwnProperty.call(payload, "data") &&
    payload.data &&
    Array.isArray(payload.data.course_ids)
  ) {
    return payload.data.course_ids;
  }

  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray(payload.course_ids)
  ) {
    return payload.course_ids;
  }

  // Không có field rõ ràng -> assume backend đã lưu, trả lại input
  return courseIds;
}

// =====================
// Render UI
// =====================

let allCourses = []; // array course object
let selectedCourseIds = new Set(); // Set<number>

/**
 * Format weekday (1–7) thành "Thứ 2"..."Chủ nhật"
 */
function formatWeekdayLabel(weekday) {
  const labels = {
    1: "Thứ 2",
    2: "Thứ 3",
    3: "Thứ 4",
    4: "Thứ 5",
    5: "Thứ 6",
    6: "Thứ 7",
    7: "CN",
  };
  return labels[weekday] || "";
}

/**
 * Render danh sách courses vào container.
 *
 * HTML gợi ý:
 * <div id="registrationCoursesContainer" class="space-y-3"></div>
 */
function renderCoursesList() {
  const container = $("registrationCoursesContainer");
  if (!container) {
    console.warn(
      "[Student Registration] #registrationCoursesContainer not found.",
    );
    return;
  }

  container.innerHTML = "";

  if (!allCourses.length) {
    container.innerHTML = `
      <div class="text-sm text-slate-500 italic">
        Không có môn học nào được mở để đăng ký.
      </div>
    `;
    return;
  }

  allCourses.forEach((course) => {
    const id = Number(
      course.id ?? course.course_id ?? course.courseId ?? NaN,
    );
    const isSelected = selectedCourseIds.has(id);

    const card = document.createElement("article");
    card.className =
      "rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm flex flex-col gap-2";
    card.dataset.courseId = String(id);

    const firstRow = document.createElement("div");
    firstRow.className = "flex items-start justify-between gap-3";

    const left = document.createElement("div");
    left.className = "flex-1";

    const title = document.createElement("h3");
    title.className = "font-semibold text-slate-900 text-sm";
    const courseName = course.course_name || course.name || "Môn học";
    const courseCode = course.course_code || course.code || "";
    title.textContent = courseCode ? `${courseName} (${courseCode})` : courseName;

    const meta = document.createElement("p");
    meta.className = "text-xs text-slate-500 mt-0.5";

    const credits = Number(
      course.credits ?? course.credit ?? course.credit_hours ?? NaN,
    );
    const weekday = Number(
      course.weekday ?? course.day_of_week ?? course.dayOfWeek ?? NaN,
    );
    const start = course.start_time || course.startTime || "";
    const end = course.end_time || course.endTime || "";
    const room = course.room || course.room_name || course.classroom || "";
    const classGroup = course.class_group || course.className || "";

    const metaPieces = [];
    if (!Number.isNaN(credits)) metaPieces.push(`${credits} tín chỉ`);
    if (!Number.isNaN(weekday)) metaPieces.push(formatWeekdayLabel(weekday));
    if (start || end)
      metaPieces.push(start && end ? `${start}-${end}` : start || end);
    if (room) metaPieces.push(`Phòng: ${room}`);
    if (classGroup) metaPieces.push(`Lớp: ${classGroup}`);

    meta.textContent = metaPieces.join(" · ");

    left.appendChild(title);
    if (meta.textContent) left.appendChild(meta);

    const right = document.createElement("div");
    right.className =
      "flex flex-col items-end justify-between text-xs text-slate-600";

    const statusBadge = document.createElement("span");
    const isFull =
      course.is_full || course.isFull || course.status === "FULL";
    statusBadge.className =
      "inline-flex items-center rounded-full px-2 py-0.5 mb-1";
    if (isFull) {
      statusBadge.classList.add("bg-rose-50", "text-rose-700");
      statusBadge.textContent = "Đầy chỗ";
    } else {
      statusBadge.classList.add("bg-emerald-50", "text-emerald-700");
      statusBadge.textContent = "Còn chỗ";
    }

    const checkboxLabel = document.createElement("label");
    checkboxLabel.className =
      "inline-flex items-center gap-1 cursor-pointer select-none";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "registration-course-checkbox";
    checkbox.checked = isSelected;
    checkbox.dataset.courseId = String(id);
    checkbox.disabled = isFull && !isSelected; // đã full thì không cho tick mới

    const checkboxText = document.createElement("span");
    checkboxText.textContent = "Chọn";

    checkboxLabel.appendChild(checkbox);
    checkboxLabel.appendChild(checkboxText);

    right.appendChild(statusBadge);
    right.appendChild(checkboxLabel);

    firstRow.appendChild(left);
    firstRow.appendChild(right);

    card.appendChild(firstRow);

    // Optional: mô tả thêm
    if (course.description) {
      const desc = document.createElement("p");
      desc.className = "mt-1 text-xs text-slate-600";
      desc.textContent = course.description;
      card.appendChild(desc);
    }

    container.appendChild(card);
  });

  updateSummaryCounters();
}

/**
 * Cập nhật số môn + tổng tín chỉ đã chọn.
 *
 * Optional HTML:
 *  <span id="registrationSelectedCount"></span>
 *  <span id="registrationTotalCredits"></span>
 */
function updateSummaryCounters() {
  const countEl = $("registrationSelectedCount");
  const creditEl = $("registrationTotalCredits");

  const selectedIds = Array.from(selectedCourseIds);
  if (countEl) countEl.textContent = String(selectedIds.length);

  if (creditEl) {
    let totalCredits = 0;
    selectedIds.forEach((id) => {
      const c = allCourses.find((crs) => {
        const cid = Number(
          crs.id ?? crs.course_id ?? crs.courseId ?? NaN,
        );
        return cid === id;
      });
      if (!c) return;
      const credits = Number(
        c.credits ?? c.credit ?? c.credit_hours ?? NaN,
      );
      if (!Number.isNaN(credits)) totalCredits += credits;
    });
    creditEl.textContent = String(totalCredits);
  }
}

/**
 * Bind event đổi trạng thái checkbox (chọn/bỏ).
 */
function bindCourseSelectionEvents() {
  const container = $("registrationCoursesContainer");
  if (!container) return;

  container.addEventListener("change", (evt) => {
    const target = evt.target;
    if (!(target instanceof HTMLInputElement)) return;
    if (!target.classList.contains("registration-course-checkbox")) return;

    const id = Number(target.dataset.courseId || NaN);
    if (Number.isNaN(id) || id <= 0) return;

    if (target.checked) selectedCourseIds.add(id);
    else selectedCourseIds.delete(id);

    updateSummaryCounters();
  });
}

// No local mock sync: server is single source of truth for registered ids.

// =====================
// Entry: load + bind Save
// =====================

async function initStudentRegistrationPage() {
  const studentId = resolveCurrentStudentId();

  if (!studentId) {
    console.warn("[Student Registration] Cannot resolve current studentId.");
    showMessage(
      "Không xác định được sinh viên hiện tại. Vui lòng đăng nhập lại.",
      "error",
    );
    return;
  }

  hideMessage();
  showLoading();

  try {
    // 1) Lấy list môn được mở
    allCourses = await fetchAvailableCourses(studentId);

    // 2) Lấy list môn đã đăng ký (từ backend). Nếu backend trả rỗng -> để trống.
    selectedCourseIds = await fetchCurrentRegistration(studentId);

    renderCoursesList();
    bindCourseSelectionEvents();
  } catch (err) {
    console.error("[Student Registration] Failed to init page:", err);
    showMessage(
      "Không tải được danh sách môn đăng ký. Vui lòng thử lại sau.",
      "error",
    );
  } finally {
    hideLoading();
  }

  // Bind Save
  const saveBtn = $("registrationSaveButton");
  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      hideMessage();

      const idsArray = Array.from(selectedCourseIds);
      if (!idsArray.length) {
        showMessage(
          "Bạn chưa chọn môn nào. Nếu muốn hủy toàn bộ đăng ký, vẫn có thể lưu.",
          "info",
        );
      }

      saveBtn.disabled = true;
      showLoading();

      try {
        const savedIds = await saveRegistration(studentId, idsArray);
        // Cập nhật lại selectedCourseIds theo backend trả về (nếu có)
        if (Array.isArray(savedIds)) {
          selectedCourseIds = new Set(
            savedIds.map((x) => Number(x)).filter((x) => !Number.isNaN(x)),
          );
        }

        // Server is single source of truth; just re-render with backend-returned ids
        renderCoursesList(); // để trạng thái checkbox khớp lại
        showMessage("Lưu đăng ký môn học thành công.", "success");
      } catch (err) {
        console.error("[Student Registration] Failed to save registration:", err);
        showMessage(
          "Lưu đăng ký môn học thất bại. Vui lòng thử lại sau.",
          "error",
        );
      } finally {
        hideLoading();
        saveBtn.disabled = false;
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  try {
    initLayout("student-registration");
  } catch (err) {
    console.warn("[Student Registration] initLayout error:", err);
  }

  initStudentRegistrationPage();
});
