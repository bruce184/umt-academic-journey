/* eslint-disable no-unused-vars */
// student/js/student-overview.js
// Student Overview – Phase 2: kết nối API thật cho Academics summary

import { initLayout } from "../../common/layout-common.js";

const STUDENT_API_BASE = "/students";

/* ======================================
 * Helpers chung
 * ====================================== */

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
    console.warn("[Student Overview] Cannot resolve studentId.", err);
  }

  return null;
}

/**
 * Helper: get element by selector
 */
function $(selector) {
  return document.querySelector(selector);
}

/**
 * Helper: set textContent hoặc "—" nếu null/undefined/empty
 */
function setTextOrDash(el, value, formatter) {
  if (!el) return;
  if (value === null || value === undefined || value === "") {
    el.textContent = "—";
    return;
  }
  el.textContent = formatter ? formatter(value) : String(value);
}

/* ======================================
 * Tabs (General / Academics)
 * ====================================== */

function setupTabs() {
  const tabButtons = document.querySelectorAll(".overview-tab-btn");
  const generalTab = $("#overviewTabGeneral");
  const academicsTab = $("#overviewTabAcademics");

  if (!tabButtons.length || !generalTab || !academicsTab) return;

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-tab");

      // update button styles
      tabButtons.forEach((b) => {
        b.classList.remove(
          "border-slate-900",
          "text-slate-900",
          "font-medium",
        );
        b.classList.add("border-transparent", "text-slate-500");
      });
      btn.classList.remove("border-transparent", "text-slate-500");
      btn.classList.add("border-slate-900", "text-slate-900", "font-medium");

      // toggle content
      if (target === "general") {
        generalTab.classList.remove("hidden");
        academicsTab.classList.add("hidden");
      } else {
        generalTab.classList.add("hidden");
        academicsTab.classList.remove("hidden");
      }
    });
  });
}

/* ======================================
 * Profile: lấy từ sessionStorage (login set)
 * ====================================== */

function fillProfileFromSession() {
  const name =
    window.sessionStorage.getItem("student_name") ||
    window.sessionStorage.getItem("user_name");
  const id =
    window.sessionStorage.getItem("student_id") ||
    window.sessionStorage.getItem("user_id");
  const email = window.sessionStorage.getItem("student_email");

  const overviewNameEl = $("#overviewStudentName");
  const overviewIdEl = $("#overviewStudentId");
  const profileNameEl = $("#profileFullName");
  const profileIdEl = $("#profileStudentId");
  const profileEmailEl = $("#profileEmail");

  if (name) {
    if (overviewNameEl) overviewNameEl.textContent = name;
    if (profileNameEl) profileNameEl.textContent = name;
  }
  if (id) {
    if (overviewIdEl) overviewIdEl.textContent = id;
    if (profileIdEl) profileIdEl.textContent = id;
  }
  if (email && profileEmailEl) {
    profileEmailEl.textContent = email;
    profileEmailEl.title = email;
  }
}

/* ======================================
 * Registered courses – local summary
 * ====================================== */

/**
 * Fetch registered course IDs from backend for overview.
 */
async function fetchCurrentRegistrationIdsForOverview(studentId) {
  const url = `${STUDENT_API_BASE}/${studentId}/registration`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} when calling ${url}`);
  }

  let payload = null;
  try {
    payload = await res.json();
  } catch (err) {
    // No JSON -> treat as empty
    return [];
  }

  const toArray = (arr) =>
    arr
      .map((x) => (typeof x === "object" && x !== null ? x.course_id ?? x.courseId ?? x.id ?? x : x))
      .map((n) => Number(n))
      .filter((n) => !Number.isNaN(n) && n > 0);

  if (payload && typeof payload === "object" && Object.prototype.hasOwnProperty.call(payload, "data")) {
    const data = payload.data || {};
    if (Array.isArray(data.items)) return toArray(data.items);
    if (Array.isArray(data.course_ids)) return toArray(data.course_ids);
  }

  if (payload && typeof payload === "object" && Array.isArray(payload.items)) return toArray(payload.items);
  if (payload && typeof payload === "object" && Array.isArray(payload.course_ids)) return toArray(payload.course_ids);
  if (Array.isArray(payload)) return toArray(payload);

  return [];
}

async function loadRegisteredCoursesCount() {
  const countEl = $("#overviewRegisteredCoursesCount");
  if (!countEl) return;

  const studentId = resolveCurrentStudentId();
  if (!studentId) {
    countEl.textContent = "0";
    return;
  }

  try {
    const ids = await fetchCurrentRegistrationIdsForOverview(studentId);
    countEl.textContent = String(Array.isArray(ids) ? ids.length : 0);
  } catch (err) {
    console.warn("[Student Overview] Cannot fetch registered courses:", err);
    countEl.textContent = "0";
  }
}

/* ======================================
 * Academics summary – gọi API thật
 * ====================================== */

/**
 * Gọi API summary.
 *
 * Backend route gợi ý:
 *   GET /students/:studentId/academics/summary
 *
 * Chấp nhận:
 *   A) { ok: true, data: { ...summary } }
 *   B) { ...summary }  // trả thẳng object
 */
async function fetchAcademicSummaryForOverview(studentId) {
  const url = `${STUDENT_API_BASE}/${studentId}/academics/summary`;

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
      `[Student Overview] Cannot parse JSON payload: ${
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
  if (payload && typeof payload === "object") {
    return payload;
  }

  throw new Error(
    "[Student Overview] Unexpected API response shape for academic summary.",
  );
}

/**
 * Map summary -> các card Overview.
 *
 * Ưu tiên field:
 *  - GPA: cumulativeGpa | overallGpa | gpa | overall_gpa
 *  - Credits completed: totalCreditsPassed | totalCredits | completedCredits | total_credits
 *  - Current credits (term): currentTermCredits | current_credits | termCredits
 *  - Status: academicStatus | status
 */
function applyAcademicSummaryToOverview(summary) {
  const gpaEl = $("#overviewGpa");
  const completedEl = $("#overviewCreditsCompleted");
  const currentEl = $("#overviewCreditsCurrent");
  const statusChip = $("#overviewStatusChip");

  if (!summary || typeof summary !== "object") {
    setTextOrDash(gpaEl, null);
    setTextOrDash(completedEl, null);
    setTextOrDash(currentEl, null);
    if (statusChip) statusChip.textContent = "N/A";
    return;
  }

  // GPA
  const rawGpa =
    summary.cumulativeGpa ??
    summary.overallGpa ??
    summary.gpa ??
    summary.overall_gpa ??
    null;

  setTextOrDash(gpaEl, rawGpa, (v) => Number(v).toFixed(2));

  // Credits completed
  const rawCompleted =
    summary.totalCreditsPassed ??
    summary.totalCredits ??
    summary.completedCredits ??
    summary.total_credits ??
    null;

  setTextOrDash(completedEl, rawCompleted);

  // Current term credits (nếu có, nếu không fallback = completed)
  const rawCurrent =
    summary.currentTermCredits ??
    summary.current_credits ??
    summary.termCredits ??
    rawCompleted;

  setTextOrDash(currentEl, rawCurrent);

  // Status
  const rawStatus = summary.academicStatus ?? summary.status ?? "Active";
  if (statusChip) {
    statusChip.textContent = rawStatus;

    // Optional: đổi màu nhẹ theo status
    statusChip.classList.remove(
      "bg-emerald-50",
      "text-emerald-700",
      "bg-amber-50",
      "text-amber-700",
      "bg-rose-50",
      "text-rose-700",
    );

    const s = String(rawStatus).toLowerCase();
    if (s.includes("probation") || s.includes("warning")) {
      statusChip.classList.add("bg-rose-50", "text-rose-700");
    } else if (s.includes("watch")) {
      statusChip.classList.add("bg-amber-50", "text-amber-700");
    } else {
      statusChip.classList.add("bg-emerald-50", "text-emerald-700");
    }
  }
}

/**
 * Load summary từ API và gán vào Overview.
 */
async function loadAcademicSummaryIntoOverview() {
  const studentId = resolveCurrentStudentId();
  if (!studentId) {
    console.warn("[Student Overview] Cannot resolve current studentId.");
    // Không có chỗ hiển thị lỗi riêng -> chỉ log, card giữ mặc định.
    return;
  }

  try {
    const summary = await fetchAcademicSummaryForOverview(studentId);
    applyAcademicSummaryToOverview(summary);
  } catch (err) {
    console.error(
      "[Student Overview] Failed to load academic summary:",
      err,
    );
    // Nếu lỗi: giữ card như cũ, không ném exception ra ngoài.
  }
}

/* ======================================
 * Entry
 * ====================================== */

document.addEventListener("DOMContentLoaded", () => {
  try {
    initLayout("student-overview");
  } catch (err) {
    console.warn("[Student Overview] initLayout error:", err);
  }

  setupTabs();
  fillProfileFromSession();
  loadRegisteredCoursesCount();
  loadAcademicSummaryIntoOverview();
});
