// student/js/student-schedule.js
// Student Schedule – hiển thị thời khóa biểu theo tuần (Thứ 2–Thứ 7)
// Phase 2: dùng API thật, bỏ phụ thuộc student-data.js mock.

import { initLayout } from "../../common/layout-common.js";

const STUDENT_API_BASE = "/students";

// Cấu hình lưới: 4 ca, 6 ngày (Thứ 2–Thứ 7)
const NUM_SLOTS = 4;
const NUM_DAYS = 6;

// =====================
// Helpers chung
// =====================

/**
 * Lấy studentId hiện tại:
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
    console.warn("[Student Schedule] Cannot resolve studentId.", err);
  }

  return null;
}

/**
 * Gọi API lấy thời khóa biểu.
 *
 * Backend đề xuất:
 *   GET /students/:studentId/schedule
 *
 * Query (optional):
 *   - from, to (YYYY-MM-DD) nếu muốn filter theo tuần/kỳ
 *
 * Accepted responses:
 *   A) { ok: true, data: { items: [...] } }
 *   B) { items: [...] }
 *   C) [ ... ]  // plain array
 */
async function fetchStudentSchedule(studentId) {
  // Hiện tại không truyền from/to -> backend tự chọn (VD: tuần hiện tại)
  const url = `${STUDENT_API_BASE}/${studentId}/schedule`;

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
      `[Student Schedule] Cannot parse JSON payload: ${
        err && err.message ? err.message : String(err)
      }`,
    );
  }

  // Case A: { ok, data: { items } }
  if (
    payload &&
    typeof payload === "object" &&
    Object.prototype.hasOwnProperty.call(payload, "data")
  ) {
    const data = payload.data || {};
    if (Array.isArray(data.items)) {
      return data.items;
    }
  }

  // Case B: { items: [...] }
  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray(payload.items)
  ) {
    return payload.items;
  }

  // Case C: plain array
  if (Array.isArray(payload)) {
    return payload;
  }

  throw new Error(
    "[Student Schedule] Unexpected API response shape for schedule.",
  );
}

// =====================
// Mapping slot & ngày
// =====================

/**
 * Suy luận chỉ số ca (0–3) từ dữ liệu:
 * - Ưu tiên: item.slot_index (1–4) hoặc item.slot (1–4)
 * - Nếu không có: suy luận từ start_time (HH:MM / HH:MM:SS)
 *
 * Mặc định:
 *   Ca 1: 07:30
 *   Ca 2: 09:30
 *   Ca 3: 13:30
 *   Ca 4: 15:30
 */
function inferSlotIndex(item) {
  const direct =
    Number(item.slot_index ?? item.slot ?? item.session_index ?? NaN);
  if (!Number.isNaN(direct) && direct >= 1 && direct <= NUM_SLOTS) {
    return direct - 1; // về 0–3
  }

  const startRaw = item.start_time || item.startTime || "";
  const match = String(startRaw).match(/(\d{1,2}):(\d{2})/);
  if (!match) {
    return 0; // fallback Ca 1
  }

  const h = Number(match[1]);
  const m = Number(match[2]);
  const minutes = h * 60 + m;

  // phút bắt đầu chuẩn của 4 ca
  const slots = [7 * 60 + 30, 9 * 60 + 30, 13 * 60 + 30, 15 * 60 + 30];

  let bestIndex = 0;
  let bestDiff = Infinity;
  slots.forEach((slotMin, idx) => {
    const diff = Math.abs(minutes - slotMin);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIndex = idx;
    }
  });

  return bestIndex;
}

/**
 * Suy luận thứ trong tuần (0–5 tương ứng Thứ 2–Thứ 7) từ:
 * - item.weekday (1–7, 1 = Monday) nếu có
 * - hoặc item.date (YYYY-MM-DD / ISO string), dùng Date.getDay()
 */
function inferDayIndex(item) {
  const weekday = Number(item.weekday ?? item.day_of_week ?? NaN);
  if (!Number.isNaN(weekday)) {
    // Giả định 1: Monday, 7: Sunday
    if (weekday >= 1 && weekday <= 6) {
      return weekday - 1; // 0–5
    }
    // nếu weekday = 7 (Sunday) -> bỏ qua
  }

  const dateStr = item.date || item.class_date || item.session_date;
  if (!dateStr) return null;

  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;

  // JS: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const jsDay = d.getDay();
  if (jsDay >= 1 && jsDay <= 6) {
    return jsDay - 1; // 0–5
  }

  // Sunday không nằm trong lưới Thứ 2–Thứ 7 -> bỏ qua
  return null;
}

// =====================
// Render timetable
// =====================

/**
 * Lấy danh sách cell "day-column" theo thứ tự:
 * row 0: Ca 1, Thứ 2..Thứ 7 -> 6 ô
 * row 1: Ca 2, Thứ 2..Thứ 7 -> 6 ô
 * ...
 */
function getDayColumnsGrid() {
  const calendarBody = document.getElementById("calendarBody");
  if (!calendarBody) return [];

  const cols = calendarBody.querySelectorAll(".day-column");
  return Array.from(cols);
}

/**
 * Xóa nội dung các cell day-column (không đụng time-slot).
 */
function clearScheduleCells() {
  const cells = getDayColumnsGrid();
  cells.forEach((cell) => {
    cell.innerHTML = "";
  });
}

/**
 * Tạo card hiển thị 1 buổi học.
 */
function createClassCard(item) {
  const card = document.createElement("div");
  card.className =
    "mb-1 rounded-lg border border-slate-200 bg-sky-50 px-2 py-1 text-[11px] leading-tight shadow-sm";

  const title = document.createElement("p");
  title.className = "font-semibold text-slate-900";
  const courseName =
    item.course_name || item.courseName || "Môn học";
  const courseCode = item.course_code || item.courseCode || "";
  title.textContent = courseCode ? `${courseName} (${courseCode})` : courseName;

  const meta = document.createElement("p");
  meta.className = "mt-0.5 text-[10px] text-slate-600";

  const room = item.room || item.room_name || item.classroom || "";
  const classGroup = item.class_group || item.className || item.class_group_code || "";
  const lecturer = item.lecturer_name || item.lecturer || "";

  const pieces = [];
  if (classGroup) pieces.push(`Lớp: ${classGroup}`);
  if (room) pieces.push(`Phòng: ${room}`);
  if (lecturer) pieces.push(`GV: ${lecturer}`);
  meta.textContent = pieces.join(" · ");

  const timeLine = document.createElement("p");
  timeLine.className = "mt-0.5 text-[10px] text-slate-500";
  const start = item.start_time || item.startTime || "";
  const end = item.end_time || item.endTime || "";
  if (start || end) {
    timeLine.textContent = start && end ? `${start} - ${end}` : start || end;
  }

  card.appendChild(title);
  if (meta.textContent) card.appendChild(meta);
  if (timeLine.textContent) card.appendChild(timeLine);

  return card;
}

/**
 * Render danh sách buổi học vào lưới.
 */
function renderSchedule(items) {
  const cells = getDayColumnsGrid();
  if (!cells.length) {
    console.warn("[Student Schedule] No .day-column cells found in DOM.");
    return;
  }

  // Số ô phải >= NUM_SLOTS * NUM_DAYS, nếu không thì map động theo length
  const totalCells = cells.length;
  const daysPerRow = NUM_DAYS;
  const slots = Math.floor(totalCells / daysPerRow) || NUM_SLOTS;

  // Xóa cũ
  clearScheduleCells();

  if (!items || !items.length) {
    // không có buổi học -> lưới trống
    return;
  }

  items.forEach((item) => {
    const dayIndex = inferDayIndex(item); // 0–5
    const slotIndex = inferSlotIndex(item); // 0–3

    if (
      dayIndex === null ||
      dayIndex < 0 ||
      dayIndex >= daysPerRow ||
      slotIndex < 0 ||
      slotIndex >= slots
    ) {
      // ngoài phạm vi lưới -> bỏ qua
      return;
    }

    const cellIndex = slotIndex * daysPerRow + dayIndex;
    if (cellIndex < 0 || cellIndex >= totalCells) return;

    const cell = cells[cellIndex];
    const card = createClassCard(item);
    cell.appendChild(card);
  });
}

// =====================
// ENTRYPOINT
// =====================

async function loadStudentSchedule() {
  const studentId = resolveCurrentStudentId();

  if (!studentId) {
    console.warn("[Student Schedule] Cannot resolve current studentId.");
    // Hiện tại không có vùng hiển thị lỗi riêng -> log + để trống
    clearScheduleCells();
    return;
  }

  try {
    const items = await fetchStudentSchedule(studentId);
    renderSchedule(items);
  } catch (err) {
    console.error("[Student Schedule] Failed to load schedule:", err);
    clearScheduleCells();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  try {
    // Layout chung (sidebar + avatar dropdown)
    initLayout("student-schedule");
  } catch (err) {
    console.warn("[Student Schedule] initLayout error:", err);
  }

  loadStudentSchedule();
});
