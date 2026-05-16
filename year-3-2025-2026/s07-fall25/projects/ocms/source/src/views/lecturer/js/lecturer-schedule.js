// src/views/lecturer/js/lecturer-schedule.js

const API_BASE = "/lecturers";
const DEFAULT_LECTURER_ID = 1;

// --- Helper: giống bên lecturer-analytics.js ---
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

// --- Gọi API schedule ---
async function fetchLecturerSchedule() {
  const lecturerId = getCurrentLecturerId();

  const res = await fetch(`${API_BASE}/${lecturerId}/schedule`, {
    headers: {
      "Content-Type": "application/json",
      "X-Requested-By": "ocms-lecturer-schedule",
    },
  });

  if (!res.ok) {
    console.error("Failed to fetch lecturer schedule:", res.status);
    throw new Error("Failed to fetch lecturer schedule");
  }

  const json = await res.json();
  return json.data || json;
}

// --- Render grid T2–T7 ---
function renderScheduleGrid(schedule) {
  const grid = document.getElementById("schedule-grid");
  if (!grid) return;

  const days = (schedule && schedule.days) || [];
  if (!days.length) {
    grid.innerHTML = `
      <div class="p-4 text-center text-gray-500 text-sm">
        No schedule found for this week.
      </div>
    `;
    return;
  }

  const maxRows = Math.max(
    ...days.map((d) =>
      Array.isArray(d.items) && d.items.length ? d.items.length : 0
    ),
    1
  );

  let html = "";

  // Header row: T2–T7
  days.forEach((day) => {
    const label = day.label || day.dayName || day.dayCode || "";
    html += `<div class="schedule-header">${label}</div>`;
  });

  // Body: mỗi row = 1 slot, mỗi col = 1 ngày
  for (let row = 0; row < maxRows; row++) {
    for (let col = 0; col < days.length; col++) {
      const day = days[col];
      const items = Array.isArray(day.items) ? day.items : [];
      const item = items[row];

      if (!item) {
        html += `<div class="schedule-cell p-2"></div>`;
      } else {
        const timeRange =
          item.startTime && item.endTime
            ? `${item.startTime}–${item.endTime}`
            : "";

        html += `
          <div class="schedule-cell p-2">
            <div class="text-xs text-gray-500">${timeRange}</div>
            <div class="text-sm font-semibold">
              ${item.courseName || ""}
            </div>
            <div class="text-xs text-gray-500 mt-1">
              Phòng: ${item.classRoom || "-"}${
          item.note ? " · " + item.note : ""
        }
            </div>
          </div>
        `;
      }
    }
  }

  grid.innerHTML = html;
}

// --- Entry point ---
async function initLecturerSchedule() {
  try {
    const schedule = await fetchLecturerSchedule();
    renderScheduleGrid(schedule);
  } catch (err) {
    console.error("Error while loading lecturer schedule:", err);
    const grid = document.getElementById("schedule-grid");
    if (grid) {
      grid.innerHTML = `
        <div class="p-4 text-center text-red-500 text-sm">
          Cannot load schedule. Please try again later.
        </div>
      `;
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initLecturerSchedule();
});
