// dept-head.attendance.js
// Department Head - Attendance summary by course (Phase 2, real API)

const API_BASE = "/heads";
const DEFAULT_HEAD_ID = 1;

// ---- Helpers ----
function getCurrentHeadId() {
  try {
    const params = new URLSearchParams(window.location.search);
    const fromQuery =
      params.get("head_id") || params.get("headId") || params.get("id");

    if (fromQuery && !Number.isNaN(Number(fromQuery))) {
      return Number(fromQuery);
    }

    const fromStorage = window.localStorage.getItem("ocms.headId");
    if (fromStorage && !Number.isNaN(Number(fromStorage))) {
      return Number(fromStorage);
    }
  } catch {
    // ignore
  }

  return DEFAULT_HEAD_ID;
}

function getCurrentTerm() {
  const select = document.getElementById("head-term-select");
  if (select && select.value) return select.value;
  return "2025-S1";
}

// ---- API: GET /heads/:id/attendance-summary ----
async function fetchAttendanceSummary() {
  const headId = getCurrentHeadId();
  const term = getCurrentTerm();

  const params = new URLSearchParams({ term });

  const res = await fetch(
    `${API_BASE}/${headId}/attendance-summary?${params.toString()}`,
    {
      headers: {
        "Content-Type": "application/json",
        "X-Requested-By": "ocms-dept-head-attendance",
      },
    }
  );

  if (!res.ok) {
    console.error("Failed to fetch attendance summary:", res.status);
    throw new Error("Failed to fetch attendance summary");
  }

  const json = await res.json();
  return json.data || json;
}

// ---- Render label + bảng ----
function renderAttendanceSummary(payload) {
  const labelEl = document.getElementById("head-attendance-summary-label");
  const container = document.getElementById(
    "head-attendance-summary-container"
  );
  if (!container) return;

  const term = payload.term || getCurrentTerm();
  const summary = payload.summary || {};
  const items = Array.isArray(payload.items) ? payload.items : [];

  if (labelEl) {
    const avg =
      summary.avgAttendanceAll != null ? summary.avgAttendanceAll + "%" : "—";
    labelEl.textContent = `Term: ${term} • Avg: ${avg}`;
  }

  if (!items.length) {
    container.innerHTML =
      '<div class="text-sm text-gray-500">No attendance data for this term.</div>';
    return;
  }

  const badgeClass = (risk) => {
    const r = String(risk || "").toLowerCase();
    if (r === "high") return "bg-red-100 text-red-700";
    if (r === "medium") return "bg-amber-100 text-amber-700";
    return "bg-emerald-100 text-emerald-700";
  };

  const rows = items
    .map((c, index) => {
      const risk = c.riskLevel || "Low";
      return `
        <tr class="border-t hover:bg-gray-50">
          <td class="px-3 py-2 text-xs text-gray-500">${index + 1}</td>
          <td class="px-3 py-2 text-sm font-mono">${c.courseId ?? ""}</td>
          <td class="px-3 py-2 text-sm">${c.courseName ?? ""}</td>
          <td class="px-3 py-2 text-sm">${c.lecturerName ?? ""}</td>
          <td class="px-3 py-2 text-sm text-right">
            ${c.avgAttendance != null ? c.avgAttendance + "%" : "—"}
          </td>
          <td class="px-3 py-2 text-sm text-right">
            ${c.totalSessions != null ? c.totalSessions : "—"}
          </td>
          <td class="px-3 py-2 text-sm text-right">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badgeClass(
              risk
            )}">
              ${risk}
            </span>
          </td>
        </tr>
      `;
    })
    .join("");

  container.innerHTML = `
    <table class="min-w-full text-left text-sm">
      <thead>
        <tr class="bg-gray-100 text-gray-700">
          <th class="px-3 py-2 text-xs font-medium">#</th>
          <th class="px-3 py-2 text-xs font-medium">Course ID</th>
          <th class="px-3 py-2 text-xs font-medium">Course name</th>
          <th class="px-3 py-2 text-xs font-medium">Lecturer</th>
          <th class="px-3 py-2 text-xs font-medium text-right">
            Avg. attendance
          </th>
          <th class="px-3 py-2 text-xs font-medium text-right">
            Sessions
          </th>
          <th class="px-3 py-2 text-xs font-medium text-right">
            Risk
          </th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

// ---- Entry point + wiring ----
async function loadDeptHeadAttendanceSummary() {
  const container = document.getElementById(
    "head-attendance-summary-container"
  );
  if (!container) return;

  try {
    container.innerHTML =
      '<div class="text-sm text-gray-500">Loading attendance summary...</div>';
    const payload = await fetchAttendanceSummary();
    renderAttendanceSummary(payload);
  } catch (err) {
    console.error("Error loading attendance summary:", err);
    container.innerHTML =
      '<div class="text-sm text-red-600">Cannot load attendance summary right now.</div>';
  }
}

function wireAttendanceEvents() {
  const termSelect = document.getElementById("head-term-select");
  if (termSelect) {
    termSelect.addEventListener("change", () => {
      loadDeptHeadAttendanceSummary();
    });
  }

  const refreshBtn = document.getElementById("head-refresh-btn");
  if (refreshBtn) {
    // bổ sung luôn cho nút Refresh (dùng chung với analytics)
    refreshBtn.addEventListener("click", () => {
      loadDeptHeadAttendanceSummary();
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadDeptHeadAttendanceSummary();
  wireAttendanceEvents();
});
