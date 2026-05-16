// student/js/dashboard-student.js
// Phase 2: use real API for today's schedule (PostgreSQL backend via router + controller)

import { initLayout } from "../../common/layout-common.js";

const STUDENT_API_BASE = "/students";

/**
 * Resolve current studentId từ:
 * 1. sessionStorage (ưu tiên)
 * 2. URL query (?studentId= / ?student_id=)
 * 3. localStorage (legacy)
 */
function resolveCurrentStudentId() {
  try {
    // 1) sessionStorage (set sau login)
    const fromSession =
      window.sessionStorage.getItem("student_id") ||
      window.sessionStorage.getItem("user_id");
    if (fromSession && !Number.isNaN(Number(fromSession))) {
      return Number(fromSession);
    }

    // 2) URL query
    const params = new URLSearchParams(window.location.search);
    const fromQuery =
      params.get("studentId") || params.get("student_id") || null;
    if (fromQuery && !Number.isNaN(Number(fromQuery))) {
      return Number(fromQuery);
    }

    // 3) localStorage (legacy flow)
    const fromStorage = window.localStorage.getItem("ocmsCurrentStudentId");
    if (fromStorage && !Number.isNaN(Number(fromStorage))) {
      return Number(fromStorage);
    }
  } catch (err) {
    console.warn("[Student Dashboard] Cannot resolve studentId.", err);
  }

  return null;
}

/**
 * Gọi API lịch học hôm nay.
 *
 * Backend route đề xuất:
 *   GET /students/:studentId/today-schedule
 *
 * Response accepted:
 *   A) { ok: true, data: { date, items: [...] } }
 *   B) { date, items: [...] }
 *   C) [ ...items ]  // plain array
 */
async function fetchTodaySchedule(studentId) {
  const url = `${STUDENT_API_BASE}/${studentId}/today-schedule`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
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
      `[Student Dashboard] Cannot parse JSON payload: ${
        err && err.message ? err.message : String(err)
      }`,
    );
  }

  // Case A: { ok, data }
  if (
    payload &&
    typeof payload === "object" &&
    Object.prototype.hasOwnProperty.call(payload, "data")
  ) {
    return payload.data;
  }

  // Case B: { date, items }
  if (
    payload &&
    typeof payload === "object" &&
    (Array.isArray(payload.items) || payload.date)
  ) {
    return payload;
  }

  // Case C: plain array of items
  if (Array.isArray(payload)) {
    return {
      date: null,
      items: payload,
    };
  }

  throw new Error(
    "[Student Dashboard] Unexpected API response shape for today schedule.",
  );
}

/**
 * Helper lấy element nhanh.
 */
function $(id) {
  return document.getElementById(id);
}

/**
 * Hiển thị/ẩn thông báo lỗi.
 * (Optional) Thêm trong dashboard-student.html nếu muốn:
 *
 * <p id="todayScheduleError"
 *    class="text-sm text-red-500 mt-2 hidden">
 * </p>
 */
function showError(message) {
  const el = $("todayScheduleError");
  if (!el) return;
  el.textContent = message;
  el.classList.remove("hidden");
}

function hideError() {
  const el = $("todayScheduleError");
  if (!el) return;
  el.classList.add("hidden");
}

/**
 * Hiển thị/ẩn thông báo "không có lớp hôm nay".
 * (Optional) Thêm trong HTML:
 *
 * <p id="todayScheduleEmpty"
 *    class="text-sm text-slate-500 mt-2 hidden">
 *   No classes today.
 * </p>
 */
function showEmpty() {
  const el = $("todayScheduleEmpty");
  if (!el) return;
  el.classList.remove("hidden");
}

function hideEmpty() {
  const el = $("todayScheduleEmpty");
  if (!el) return;
  el.classList.add("hidden");
}

/**
 * Render danh sách lịch học hôm nay.
 *
 * HTML gợi ý:
 * <ul id="todayScheduleList" class="space-y-2"></ul>
 */
function renderTodaySchedule(items) {
  const listEl = $("todayScheduleList");
  if (!listEl) return;

  listEl.innerHTML = "";

  if (!items || !items.length) {
    showEmpty();
    return;
  }

  hideEmpty();

  items.forEach((item) => {
    const li = document.createElement("li");
    li.className =
      "flex items-start justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm";

    const left = document.createElement("div");
    left.className = "flex flex-col";

    const title = document.createElement("p");
    title.className = "font-medium text-slate-900";
    title.textContent =
      item.course_name ||
      item.courseCode ||
      item.course_code ||
      "Course";

    const sub = document.createElement("p");
    sub.className = "text-xs text-slate-500 mt-0.5";
    const code =
      item.course_code || item.courseCode
        ? `(${item.course_code || item.courseCode})`
        : "";
    const clazz = item.class_group || item.className || "";
    const room = item.room || item.room_name || "";
    const lecturer = item.lecturer_name || item.lecturer || "";
    sub.textContent = [code, clazz, room, lecturer]
      .filter((x) => x && String(x).trim() !== "")
      .join(" · ");

    left.appendChild(title);
    left.appendChild(sub);

    const right = document.createElement("div");
    right.className = "flex flex-col items-end text-xs text-slate-600";

    const time = document.createElement("p");
    const start = item.start_time || item.startTime || "";
    const end = item.end_time || item.endTime || "";
    time.textContent =
      start && end ? `${start} - ${end}` : start || end || "--:--";

    const status = document.createElement("span");
    status.className = "mt-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px]";
    status.textContent = item.session_type || item.type || "Class";

    right.appendChild(time);
    right.appendChild(status);

    li.appendChild(left);
    li.appendChild(right);

    listEl.appendChild(li);
  });
}

/**
 * Cập nhật hiển thị ngày hôm nay (nếu backend trả date).
 *
 * HTML gợi ý:
 * <p id="todayScheduleDate" class="text-xs text-slate-500"></p>
 */
function updateTodayDateLabel(dateStr) {
  const el = $("todayScheduleDate");
  if (!el || !dateStr) return;
  el.textContent = dateStr;
}

/**
 * Main: load dashboard data.
 */
async function loadDashboard() {
  const studentId = resolveCurrentStudentId();

  if (!studentId) {
    console.warn("[Student Dashboard] Cannot resolve current studentId.");
    showError("Cannot detect current student. Please log in again.");
    renderTodaySchedule([]);
    return;
  }

  hideError();

  try {
    const result = await fetchTodaySchedule(studentId);

    const items = Array.isArray(result.items) ? result.items : [];
    renderTodaySchedule(items);

    if (result.date) {
      updateTodayDateLabel(result.date);
    }
  } catch (err) {
    console.error("[Student Dashboard] Failed to load today schedule:", err);
    showError("Failed to load today's schedule. Please try again later.");
    renderTodaySchedule([]);
  }
}

// Entry
document.addEventListener("DOMContentLoaded", () => {
  try {
    initLayout("student-dashboard");
  } catch (err) {
    console.warn("[Student Dashboard] initLayout error:", err);
  }

  loadDashboard();
});
