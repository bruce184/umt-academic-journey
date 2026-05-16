// src/views/lecturer/js/lecturer-analytics.js

const API_BASE = "/lecturers";
const DEFAULT_LECTURER_ID = 1;

// --- Helper: lấy lecturerId từ URL / localStorage / default ---
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

// --- Fetch analytics từ backend ---
async function fetchLecturerAnalytics() {
  const lecturerId = getCurrentLecturerId();

  const res = await fetch(`${API_BASE}/${lecturerId}/analytics`, {
    headers: {
      "Content-Type": "application/json",
      "X-Requested-By": "ocms-lecturer-dashboard",
    },
  });

  if (!res.ok) {
    console.error("Failed to fetch lecturer analytics:", res.status);
    throw new Error("Failed to fetch lecturer analytics");
  }

  const json = await res.json();
  return json.data || json; // theo style student: { data: analytics }
}

// --- Tạo section card trên Dashboard nếu chưa có ---
function ensureDashboardCards() {
  const dashboardTab = document.getElementById("content-dashboard");
  if (!dashboardTab) return null;

  let wrapper = document.getElementById("lecturer-dashboard-cards");
  if (wrapper) return wrapper;

  wrapper = document.createElement("div");
  wrapper.id = "lecturer-dashboard-cards";
  wrapper.className =
    "mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4";

  wrapper.innerHTML = `
    <!-- Total Classes -->
    <div class="bg-white rounded-xl shadow-md border border-gray-100 p-4 flex flex-col justify-between">
      <div class="text-sm text-gray-500">Total classes this term</div>
      <div id="metrics-total-classes" class="mt-2 text-2xl font-bold text-gray-900">—</div>
    </div>

    <!-- Total Students -->
    <div class="bg-white rounded-xl shadow-md border border-gray-100 p-4 flex flex-col justify-between">
      <div class="text-sm text-gray-500">Total students</div>
      <div id="metrics-total-students" class="mt-2 text-2xl font-bold text-gray-900">—</div>
    </div>

    <!-- Assignments to Grade -->
    <div class="bg-white rounded-xl shadow-md border border-gray-100 p-4 flex flex-col justify-between">
      <div class="text-sm text-gray-500">Assignments to grade</div>
      <div id="metrics-assignments" class="mt-2 text-2xl font-bold text-gray-900">—</div>
    </div>

    <!-- Active Courses -->
    <div class="bg-white rounded-xl shadow-md border border-gray-100 p-4 flex flex-col justify-between">
      <div class="text-sm text-gray-500">Active courses</div>
      <div id="metrics-active-courses" class="mt-2 text-2xl font-bold text-gray-900">—</div>
    </div>
  `;

  dashboardTab.appendChild(wrapper);
  return wrapper;
}

// --- Render summary cards ---
function renderSummaryCards(analytics) {
  ensureDashboardCards();

  const summary = analytics.summaryCards || {};
  const classes = Array.isArray(analytics.classes) ? analytics.classes : [];

  const totalClasses =
    summary.totalClasses != null ? summary.totalClasses : classes.length;

  const elTotalClasses = document.getElementById("metrics-total-classes");
  const elTotalStudents = document.getElementById("metrics-total-students");
  const elAssignments = document.getElementById("metrics-assignments");
  const elActiveCourses = document.getElementById("metrics-active-courses");

  if (elTotalClasses) elTotalClasses.textContent = String(totalClasses);
  if (elTotalStudents)
    elTotalStudents.textContent =
      summary.totalStudents != null ? String(summary.totalStudents) : "0";
  if (elAssignments)
    elAssignments.textContent =
      summary.assignmentsToGrade != null
        ? String(summary.assignmentsToGrade)
        : "0";
  if (elActiveCourses)
    elActiveCourses.textContent =
      summary.activeCourses != null ? String(summary.activeCourses) : "0";
}

// --- Render Class Management list ---
function renderClassList(analytics) {
  const container = document.getElementById("class-list-view");
  if (!container) return;

  const classes = Array.isArray(analytics.classes) ? analytics.classes : [];

  if (!classes.length) {
    container.innerHTML = `
      <div class="flex items-center p-3 font-bold text-gray-700 bg-gray-200">
        <div class="w-10">#</div>
        <div class="w-24">Class ID</div>
        <div class="flex-grow">Course Name</div>
        <div class="w-32 text-center">Add tests</div>
      </div>
      <div class="p-4 text-gray-500 italic">
        No classes found for this lecturer.
      </div>
    `;
    return;
  }

  const headerHtml = `
    <div class="flex items-center p-3 font-bold text-gray-700 bg-gray-200">
      <div class="w-10">#</div>
      <div class="w-24">Class ID</div>
      <div class="flex-grow">Course Name</div>
      <div class="w-32 text-center">Add tests</div>
    </div>
  `;

  const rowsHtml = classes
    .map((course, index) => {
      const courseId = course.courseId ?? course.id ?? `C${index + 1}`;
      const courseName = course.courseName ?? "Unnamed course";

      return `
        <div
          class="flex items-center p-3 border rounded-lg bg-white shadow-sm hover:bg-gray-50 cursor-pointer class-item"
          data-course-id="${courseId}"
        >
          <div class="w-10">${index + 1}</div>
          <div class="w-24 font-medium">${courseId}</div>
          <div class="flex-grow">
            ${courseName}
          </div>
          <button
            class="add-tests-btn text-cyan-500 text-2xl hover:text-cyan-600 transition duration-150 w-32 flex justify-center"
            data-bs-toggle="modal"
            data-bs-target="#newTestsModal"
          >
            <i class="bi bi-plus-circle"></i>
          </button>
        </div>
      `;
    })
    .join("");

  container.innerHTML = headerHtml + rowsHtml;
}

// --- Entry point ---
async function initLecturerAnalytics() {
  try {
    const analytics = await fetchLecturerAnalytics();
    renderSummaryCards(analytics);
    renderClassList(analytics);
  } catch (err) {
    console.error("Error while initializing lecturer analytics:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initLecturerAnalytics();
});
