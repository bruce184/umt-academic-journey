// dept-head.analytics.js
// Dashboard analytics cho Department Head (Phase 2 - real API)

const API_BASE = "/heads";
const DEFAULT_HEAD_ID = 1;

// ---- Helper: lấy headId từ URL / localStorage / default ----
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

// ---- API: GET /heads/:id/analytics ----
async function fetchHeadAnalytics() {
  const headId = getCurrentHeadId();

  const res = await fetch(`${API_BASE}/${headId}/analytics`, {
    headers: {
      "Content-Type": "application/json",
      "X-Requested-By": "ocms-dept-head-dashboard",
    },
  });

  if (!res.ok) {
    console.error("Failed to fetch head analytics:", res.status);
    throw new Error("Failed to fetch head analytics");
  }

  const json = await res.json();
  return json.data || json;
}

// ---- Render summary cards ----
function renderSummaryCards(data) {
  const cards = data.summaryCards || {};

  const elLecturers = document.getElementById("head-metric-lecturers");
  const elStudents = document.getElementById("head-metric-students");
  const elCourses = document.getElementById("head-metric-courses");
  const elPending = document.getElementById("head-metric-pending");

  if (elLecturers)
    elLecturers.textContent =
      cards.totalLecturers != null ? String(cards.totalLecturers) : "—";
  if (elStudents)
    elStudents.textContent =
      cards.totalStudents != null ? String(cards.totalStudents) : "—";
  if (elCourses)
    elCourses.textContent =
      cards.activeCourses != null ? String(cards.activeCourses) : "—";
  if (elPending)
    elPending.textContent =
      cards.pendingEnrollments != null ? String(cards.pendingEnrollments) : "—";
}

// ---- Render bảng Top courses by enrollment ----
function renderTopCoursesTable(data) {
  const container = document.getElementById("head-top-courses-container");
  if (!container) return;

  const list = Array.isArray(data.topCoursesByEnrollment)
    ? data.topCoursesByEnrollment
    : [];

  if (!list.length) {
    container.innerHTML =
      '<div class="text-gray-500 text-sm">No courses found.</div>';
    return;
  }

  const rows = list
    .map(
      (item, index) => `
      <tr class="border-t hover:bg-gray-50">
        <td class="px-3 py-2 text-xs text-gray-500">${index + 1}</td>
        <td class="px-3 py-2 text-sm font-mono">${item.courseId ?? ""}</td>
        <td class="px-3 py-2 text-sm">${item.courseName ?? ""}</td>
        <td class="px-3 py-2 text-sm text-right">
          ${item.enrollmentCount != null ? item.enrollmentCount : "—"}
        </td>
      </tr>
    `
    )
    .join("");

  container.innerHTML = `
    <table class="min-w-full text-left text-sm">
      <thead>
        <tr class="bg-gray-100 text-gray-700">
          <th class="px-3 py-2 text-xs font-medium">#</th>
          <th class="px-3 py-2 text-xs font-medium">Course ID</th>
          <th class="px-3 py-2 text-xs font-medium">Course name</th>
          <th class="px-3 py-2 text-xs font-medium text-right">Enrollments</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

// ---- Render bảng Courses with low attendance ----
function renderLowAttendanceTable(data) {
  const container = document.getElementById(
    "head-low-attendance-container"
  );
  if (!container) return;

  const list = Array.isArray(data.coursesWithLowAttendance)
    ? data.coursesWithLowAttendance
    : [];

  if (!list.length) {
    container.innerHTML =
      '<div class="text-gray-500 text-sm">No risk courses detected.</div>';
    return;
  }

  const badgeClass = (risk) => {
    const r = String(risk || "").toLowerCase();
    if (r === "high") {
      return "bg-red-100 text-red-700";
    }
    if (r === "medium") {
      return "bg-amber-100 text-amber-700";
    }
    return "bg-emerald-100 text-emerald-700";
  };

  const rows = list
    .map((item, index) => {
      const risk = item.riskLevel || "Low";
      return `
        <tr class="border-t hover:bg-gray-50">
          <td class="px-3 py-2 text-xs text-gray-500">${index + 1}</td>
          <td class="px-3 py-2 text-sm font-mono">${item.courseId ?? ""}</td>
          <td class="px-3 py-2 text-sm">${item.courseName ?? ""}</td>
          <td class="px-3 py-2 text-sm text-right">
            ${item.avgAttendance != null ? item.avgAttendance + "%" : "—"}
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
          <th class="px-3 py-2 text-xs font-medium text-right">Avg. attendance</th>
          <th class="px-3 py-2 text-xs font-medium text-right">Risk</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

// ---- Gán sự kiện Refresh ----
function wireDashboardEvents(loadFn) {
  const refreshBtn = document.getElementById("head-refresh-btn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      loadFn();
    });
  }
}

// ---- Entry point ----
async function loadDeptHeadDashboard() {
  try {
    const analytics = await fetchHeadAnalytics();
    renderSummaryCards(analytics);
    renderTopCoursesTable(analytics);
    renderLowAttendanceTable(analytics);
  } catch (err) {
    console.error("Error loading dept-head analytics:", err);

    const topContainer = document.getElementById("head-top-courses-container");
    if (topContainer) {
      topContainer.innerHTML =
        '<div class="text-sm text-red-600">Cannot load data right now.</div>';
    }
    const lowContainer = document.getElementById(
      "head-low-attendance-container"
    );
    if (lowContainer) {
      lowContainer.innerHTML =
        '<div class="text-sm text-red-600">Cannot load data right now.</div>';
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadDeptHeadDashboard();
  wireDashboardEvents(loadDeptHeadDashboard);
});
