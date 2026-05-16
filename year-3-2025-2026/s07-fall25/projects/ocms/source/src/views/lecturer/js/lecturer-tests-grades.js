// src/views/lecturer/js/lecturer-tests-grades.js

const API_BASE = "/lecturers";
const DEFAULT_LECTURER_ID = 1;
const DEFAULT_COURSE_ID = "SE101";
const DEFAULT_COURSE_NAME = "Lập trình C++";

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

// --- API: GET tests / grades ---
async function fetchTestsForCourse(courseId = DEFAULT_COURSE_ID) {
  const lecturerId = getCurrentLecturerId();
  const params = new URLSearchParams({ courseId });

  const res = await fetch(`${API_BASE}/${lecturerId}/tests?${params}`, {
    headers: {
      "Content-Type": "application/json",
      "X-Requested-By": "ocms-lecturer-tests",
    },
  });

  if (!res.ok) {
    console.error("Failed to fetch tests:", res.status);
    throw new Error("Failed to fetch tests");
  }

  const json = await res.json();
  return json.data || json;
}

async function fetchGradesForCourse(courseId = DEFAULT_COURSE_ID) {
  const lecturerId = getCurrentLecturerId();
  const params = new URLSearchParams({ courseId });

  const res = await fetch(`${API_BASE}/${lecturerId}/grades?${params}`, {
    headers: {
      "Content-Type": "application/json",
      "X-Requested-By": "ocms-lecturer-grades",
    },
  });

  if (!res.ok) {
    console.error("Failed to fetch grades:", res.status);
    throw new Error("Failed to fetch grades");
  }

  const json = await res.json();
  return json.data || json;
}

// --- UI helpers: set course label ---
function setCourseLabelForTests(courseId, courseName) {
  const codeEl = document.getElementById("lecturer-tests-course-code");
  const nameEl = document.getElementById("lecturer-tests-course-name");

  if (codeEl) codeEl.textContent = courseId || DEFAULT_COURSE_ID;
  if (nameEl) {
    const name = courseName || DEFAULT_COURSE_NAME;
    nameEl.textContent = name ? `(${name})` : "";
  }
}

function setCourseLabelForGrades(courseId, courseName) {
  const codeEl = document.getElementById("lecturer-grades-course-code");
  const nameEl = document.getElementById("lecturer-grades-course-name");

  if (codeEl) codeEl.textContent = courseId || DEFAULT_COURSE_ID;
  if (nameEl) {
    const name = courseName || DEFAULT_COURSE_NAME;
    nameEl.textContent = name ? `(${name})` : "";
  }
}

// --- Render Tests ---
function renderTests(data) {
  const container = document.getElementById("lecturer-tests-list");
  if (!container) return;

  const tests = Array.isArray(data.tests) ? data.tests : [];

  setCourseLabelForTests(data.courseId, data.courseName);

  if (!tests.length) {
    container.innerHTML = `
      <div class="p-4 text-sm text-gray-500">
        No tests created for this course yet. Use the <span class="font-semibold">New Test</span> button to create one when the editor is available.
      </div>
    `;
    return;
  }

  let html = `
    <div class="grid grid-cols-12 p-3 font-bold text-gray-700 bg-gray-100">
      <div class="col-span-1">#</div>
      <div class="col-span-3">Title</div>
      <div class="col-span-2">Type</div>
      <div class="col-span-3">Due date</div>
      <div class="col-span-3 text-right">Max points</div>
    </div>
  `;

  html += tests
    .map((t, index) => {
      const idx = index + 1;
      const title = t.title || "";
      const type = t.type || "";
      const due = t.dueDate || "-";
      const max = t.totalPoints ?? "";

      return `
        <div class="grid grid-cols-12 p-3 border-t bg-white hover:bg-gray-50 transition duration-100">
          <div class="col-span-1">${idx}</div>
          <div class="col-span-3">${title}</div>
          <div class="col-span-2">${type}</div>
          <div class="col-span-3">${due}</div>
          <div class="col-span-3 text-right">${max}</div>
        </div>
      `;
    })
    .join("");

  container.innerHTML = html;
}

// --- Render Grades ---
function renderGrades(data) {
  const container = document.getElementById("lecturer-grades-list");
  if (!container) return;

  const students = Array.isArray(data.students) ? data.students : [];

  setCourseLabelForGrades(data.courseId, data.courseName);

  if (!students.length) {
    container.innerHTML = `
      <div class="p-4 text-sm text-gray-500">
        No grades data available for this course.
      </div>
    `;
    return;
  }

  let html = `
    <div class="grid grid-cols-12 p-3 font-bold text-gray-700 bg-gray-100">
      <div class="col-span-1">#</div>
      <div class="col-span-3">Student ID</div>
      <div class="col-span-8">Student Name &amp; Final grade</div>
    </div>
  `;

  html += students
    .map((s, index) => {
      const idx = index + 1;
      const sid = s.studentId || "";
      const name = s.fullName || "";
      const finalScore =
        typeof s.finalScore === "number" ? s.finalScore.toFixed(1) : "-";
      const letter = s.letter || "";

      return `
        <div class="grid grid-cols-12 p-3 border-t bg-white hover:bg-gray-50 transition duration-100">
          <div class="col-span-1">${idx}</div>
          <div class="col-span-3 font-mono">${sid}</div>
          <div class="col-span-8">
            <div class="font-medium">${name}</div>
            <div class="text-xs text-gray-500 mt-0.5">
              Final: ${finalScore} ${letter ? `(${letter})` : ""}
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  container.innerHTML = html;
}

// --- Wire events (New Test stub) ---
function wireTestsGradesEvents() {
  const newTestBtn = document.getElementById("lecturer-test-new-btn");
  if (newTestBtn) {
    newTestBtn.addEventListener("click", () => {
      alert(
        "Creating and editing tests is not available in the UI yet. Test definitions are stored in the database and will be manageable in a future release."
      );
    });
  }
}

// --- Entry point ---
async function initLecturerTestsGrades() {
  const testsTab = document.getElementById("class-sub-tests");
  const gradesTab = document.getElementById("class-sub-grades");
  if (!testsTab && !gradesTab) return; // Không phải dashboard này

  try {
    const [testsData, gradesData] = await Promise.all([
      fetchTestsForCourse(DEFAULT_COURSE_ID),
      fetchGradesForCourse(DEFAULT_COURSE_ID),
    ]);

    if (testsTab) renderTests(testsData);
    if (gradesTab) renderGrades(gradesData);
    wireTestsGradesEvents();
  } catch (err) {
    console.error("Error loading tests/grades:", err);

    const testsContainer = document.getElementById("lecturer-tests-list");
    if (testsContainer) {
      testsContainer.innerHTML = `
        <div class="p-4 text-sm text-red-600">
          Cannot load tests right now. Please try again later.
        </div>
      `;
    }

    const gradesContainer = document.getElementById("lecturer-grades-list");
    if (gradesContainer) {
      gradesContainer.innerHTML = `
        <div class="p-4 text-sm text-red-600">
          Cannot load grades right now. Please try again later.
        </div>
      `;
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initLecturerTestsGrades();
});
