// dept-head.grades.js
// Department Head - Grades overview (Phase 2, real API)

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

// ---- API: GET /heads/:id/final-grades ----
async function fetchGradesOverview() {
  const headId = getCurrentHeadId();
  const term = getCurrentTerm();

  const params = new URLSearchParams({ term });

  const res = await fetch(
    `${API_BASE}/${headId}/final-grades?${params.toString()}`,
    {
      headers: {
        "Content-Type": "application/json",
        "X-Requested-By": "ocms-dept-head-grades",
      },
    }
  );

  if (!res.ok) {
    console.error("Failed to fetch grades overview:", res.status);
    throw new Error("Failed to fetch grades overview");
  }

  const json = await res.json();
  return json.data || json;
}

// ---- Render label + bảng ----
function renderGradesOverview(payload) {
  const labelEl = document.getElementById("head-grades-overview-label");
  const container = document.getElementById("head-grades-overview-container");
  if (!container) return;

  const term = payload.term || getCurrentTerm();
  const summary = payload.summary || {};
  const items = Array.isArray(payload.items) ? payload.items : [];

  const avgScore =
    typeof summary.avgScoreOverall === "number"
      ? summary.avgScoreOverall.toFixed(2)
      : "—";

  const passRatePercent =
    typeof summary.avgPassRateOverall === "number"
      ? Math.round(summary.avgPassRateOverall * 100) + "%"
      : "—";

  if (labelEl) {
    labelEl.textContent = `Term: ${term} • Avg score: ${avgScore} • Pass rate: ${passRatePercent}`;
  }

  if (!items.length) {
    container.innerHTML =
      '<div class="text-sm text-gray-500">No grades data for this term.</div>';
    return;
  }

  const rows = items
    .map((c, index) => {
      const dist = c.distribution || {};
      const totalStudents =
        (dist.A || 0) +
        (dist.B || 0) +
        (dist.C || 0) +
        (dist.D || 0) +
        (dist.F || 0);

      const passRate =
        typeof c.passRate === "number"
          ? Math.round(c.passRate * 100) + "%"
          : "—";

      const avg =
        typeof c.avgScore === "number" ? c.avgScore.toFixed(1) : "—";

      const distText = `A:${dist.A ?? 0} • B:${dist.B ?? 0} • C:${
        dist.C ?? 0
      } • D:${dist.D ?? 0} • F:${dist.F ?? 0}`;

      return `
        <tr class="border-t hover:bg-gray-50">
          <td class="px-3 py-2 text-xs text-gray-500">${index + 1}</td>
          <td class="px-3 py-2 text-sm font-mono">${c.courseId ?? ""}</td>
          <td class="px-3 py-2 text-sm">${c.courseName ?? ""}</td>
          <td class="px-3 py-2 text-sm">${c.lecturerName ?? ""}</td>
          <td class="px-3 py-2 text-sm text-right">${avg}</td>
          <td class="px-3 py-2 text-sm text-right">${passRate}</td>
          <td class="px-3 py-2 text-xs text-gray-600">
            <div class="flex flex-col gap-0.5">
              <div>${distText}</div>
              <div class="text-[10px] text-gray-400">
                Total students: ${totalStudents}
              </div>
            </div>
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
          <th class="px-3 py-2 text-xs font-medium text-right">Avg score</th>
          <th class="px-3 py-2 text-xs font-medium text-right">Pass rate</th>
          <th class="px-3 py-2 text-xs font-medium">Distribution</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

// ---- Entry + wiring ----
async function loadDeptHeadGradesOverview() {
  const container = document.getElementById("head-grades-overview-container");
  if (!container) return;

  try {
    container.innerHTML =
      '<div class="text-sm text-gray-500">Loading grades overview...</div>';
    const payload = await fetchGradesOverview();
    renderGradesOverview(payload);
  } catch (err) {
    console.error("Error loading grades overview:", err);
    container.innerHTML =
      '<div class="text-sm text-red-600">Cannot load grades overview right now.</div>';
  }
}

function wireGradesEvents() {
  const termSelect = document.getElementById("head-term-select");
  if (termSelect) {
    termSelect.addEventListener("change", () => {
      loadDeptHeadGradesOverview();
    });
  }

  const refreshBtn = document.getElementById("head-refresh-btn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      loadDeptHeadGradesOverview();
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadDeptHeadGradesOverview();
  wireGradesEvents();
});
