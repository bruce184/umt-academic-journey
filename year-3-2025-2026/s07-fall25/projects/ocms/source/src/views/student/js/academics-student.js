// student/js/academics-student.js
// Phase 2: use real API + PostgreSQL backend (router + controller only)

import { initLayout } from "../../common/layout-common.js";

const STUDENT_API_BASE = "/students";

/**
 * Resolve current studentId from:
 * 1. sessionStorage (preferred)
 * 2. URL query (?studentId= / ?student_id=)
 * 3. localStorage (fallback for older flow)
 */
function resolveCurrentStudentId() {
  try {
    // 1) sessionStorage (e.g. set after login)
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

    // 3) localStorage (legacy)
    const fromStorage = window.localStorage.getItem("ocmsCurrentStudentId");
    if (fromStorage && !Number.isNaN(Number(fromStorage))) {
      return Number(fromStorage);
    }
  } catch (err) {
    console.warn("[Student Academics] Cannot resolve studentId.", err);
  }

  return null;
}

/**
 * Call backend API to get academic summary for a student.
 *
 * Expected backend route (router + controller):
 *   GET /students/:studentId/academics/summary
 *
 * Response shape accepted:
 *   A) { ok: true, data: { ...summary } }
 *   B) { ...summary }  // plain summary object
 */
async function fetchAcademicSummary(studentId) {
  const url = `${STUDENT_API_BASE}/${studentId}/academics/summary`;

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
      `[Student Academics] Cannot parse JSON payload: ${
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

  // Case B: plain summary object
  if (
    payload &&
    typeof payload === "object" &&
    (Object.prototype.hasOwnProperty.call(payload, "cumulativeGpa") ||
      Object.prototype.hasOwnProperty.call(payload, "currentTermGpa") ||
      Object.prototype.hasOwnProperty.call(payload, "totalCreditsPassed"))
  ) {
    return payload;
  }

  throw new Error(
    "[Student Academics] Unexpected API response shape for summary.",
  );
}

/**
 * Helper: set textContent or "—" if null/undefined/empty.
 */
function setTextOrDash(el, value, formatter) {
  if (!el) return;
  if (value === null || value === undefined || value === "") {
    el.textContent = "—";
    return;
  }
  el.textContent = formatter ? formatter(value) : String(value);
}

/**
 * Update KPI cards on the Academics page.
 *
 * Required DOM IDs in academics.html:
 *   - cumulativeGpaValue
 *   - termGpaValue
 *   - completedCreditsValue
 *   - studyStatusValue
 */
function updateSummaryCards(summary) {
  const cumulativeEl = document.getElementById("cumulativeGpaValue");
  const termGpaEl = document.getElementById("termGpaValue");
  const creditsEl = document.getElementById("completedCreditsValue");
  const statusEl = document.getElementById("studyStatusValue");

  setTextOrDash(summary ? cumulativeEl : cumulativeEl, summary?.cumulativeGpa, (v) =>
    Number(v).toFixed(2),
  );
  setTextOrDash(summary ? termGpaEl : termGpaEl, summary?.currentTermGpa, (v) =>
    Number(v).toFixed(2),
  );
  setTextOrDash(summary ? creditsEl : creditsEl, summary?.totalCreditsPassed);
  setTextOrDash(
    summary ? statusEl : statusEl,
    summary?.academicStatus || (summary ? null : null),
  );

  // Tooltip info (optional)
  if (cumulativeEl && summary?.programName) {
    cumulativeEl.title = summary.programName;
  }
  if (termGpaEl && summary?.currentTermLabel) {
    termGpaEl.title = `Current term: ${summary.currentTermLabel}`;
  }
}

/**
 * Optional error message banner on page (if element exists).
 * Add in academics.html if you want:
 *
 * <p id="academicsErrorMessage"
 *    class="text-sm text-red-500 mt-2 hidden">
 * </p>
 */
function showErrorMessage(message) {
  const el = document.getElementById("academicsErrorMessage");
  if (!el) return;
  el.textContent = message;
  el.classList.remove("hidden");
}

function hideErrorMessage() {
  const el = document.getElementById("academicsErrorMessage");
  if (!el) return;
  el.classList.add("hidden");
}

/**
 * Main load function.
 */
async function loadAcademics() {
  const studentId = resolveCurrentStudentId();

  if (!studentId) {
    console.warn("[Student Academics] Cannot resolve current studentId.");
    showErrorMessage("Cannot detect current student. Please log in again.");
    updateSummaryCards(null);
    return;
  }

  hideErrorMessage();

  try {
    const summary = await fetchAcademicSummary(studentId);

    if (!summary || typeof summary !== "object") {
      console.warn(
        "[Student Academics] Empty or invalid summary payload:",
        summary,
      );
      updateSummaryCards(null);
      return;
    }

    updateSummaryCards(summary);
  } catch (err) {
    console.error("[Student Academics] Failed to load summary:", err);
    showErrorMessage(
      "Failed to load academic summary. Please try again later.",
    );
    updateSummaryCards({
      cumulativeGpa: null,
      currentTermGpa: null,
      totalCreditsPassed: null,
      academicStatus: "Error loading data",
    });
  }
}

// Entry point
document.addEventListener("DOMContentLoaded", () => {
  // initLayout will handle sidebar/header for Student role.
  // Extra arg ("student-academics") is optional; layout-common.js can ignore it.
  try {
    initLayout("student-academics");
  } catch (err) {
    console.warn("[Student Academics] initLayout error:", err);
  }

  loadAcademics();
});
