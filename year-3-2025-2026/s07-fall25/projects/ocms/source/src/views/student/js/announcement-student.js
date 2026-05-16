// student/js/announcement-student.js
// Phase 2: use real API for student announcements (PostgreSQL backend, router + controller)

import { initLayout } from "../../common/layout-common.js";

const STUDENT_API_BASE = "/students";
const DEFAULT_LIMIT = 5;

/**
 * Resolve current studentId:
 * 1. sessionStorage (preferred)
 * 2. URL query (?studentId= / ?student_id=)
 * 3. localStorage (legacy)
 */
function resolveCurrentStudentId() {
  try {
    // 1) sessionStorage (set after login)
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
    console.warn("[Student Announcement] Cannot resolve studentId.", err);
  }

  return null;
}

/**
 * Call backend API to get recent announcements for student.
 *
 * Suggested backend route:
 *   GET /students/:studentId/announcements/recent?limit=5
 *
 * Accepted responses:
 *   A) { ok: true, data: { items: [...] } }
 *   B) { items: [...] }
 *   C) [ ... ]  // plain array
 */
async function fetchRecentAnnouncements(studentId, limit = DEFAULT_LIMIT) {
  const params = new URLSearchParams();
  if (limit && Number(limit) > 0) {
    params.set("limit", String(limit));
  }

  const url = `${STUDENT_API_BASE}/${studentId}/announcements/recent?${params.toString()}`;

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
      `[Student Announcement] Cannot parse JSON payload: ${
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
    "[Student Announcement] Unexpected API response shape for announcements.",
  );
}

/**
 * Short helper to get element by id.
 */
function $(id) {
  return document.getElementById(id);
}

/**
 * Loading state helpers.
 *
 * Optional HTML:
 * <p id="announcementLoading"
 *    class="text-sm text-slate-500 mt-2 hidden">
 *   Loading announcements...
 * </p>
 */
function showLoading() {
  const el = $("announcementLoading");
  if (!el) return;
  el.classList.remove("hidden");
}

function hideLoading() {
  const el = $("announcementLoading");
  if (!el) return;
  el.classList.add("hidden");
}

/**
 * Error state helpers.
 *
 * Optional HTML:
 * <p id="announcementError"
 *    class="text-sm text-red-500 mt-2 hidden">
 * </p>
 */
function showError(message) {
  const el = $("announcementError");
  if (!el) return;
  el.textContent = message;
  el.classList.remove("hidden");
}

function hideError() {
  const el = $("announcementError");
  if (!el) return;
  el.classList.add("hidden");
}

/**
 * Empty state helpers.
 *
 * Optional HTML:
 * <p id="announcementEmpty"
 *    class="text-sm text-slate-500 mt-2 hidden">
 *   No announcements.
 * </p>
 */
function showEmpty() {
  const el = $("announcementEmpty");
  if (!el) return;
  el.classList.remove("hidden");
}

function hideEmpty() {
  const el = $("announcementEmpty");
  if (!el) return;
  el.classList.add("hidden");
}

/**
 * Format datetime string (created_at) into human readable.
 */
function formatDateTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Render announcements list.
 *
 * Expected HTML container:
 * <div id="announcementList" class="space-y-3"></div>
 */
function renderAnnouncements(items) {
  const container = $("announcementList");
  if (!container) return;

  container.innerHTML = "";

  if (!items || !items.length) {
    showEmpty();
    return;
  }

  hideEmpty();

  items.forEach((item) => {
    const wrapper = document.createElement("article");
    wrapper.className =
      "rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm";

    const header = document.createElement("div");
    header.className = "flex items-start justify-between";

    const title = document.createElement("h3");
    title.className = "font-semibold text-slate-900";
    title.textContent = item.title || "Announcement";

    const meta = document.createElement("div");
    meta.className = "ml-4 flex flex-col items-end text-[11px] text-slate-500";

    const date = document.createElement("span");
    date.textContent = formatDateTime(item.created_at || item.createdAt);

    const author = document.createElement("span");
    const authorName = item.author || item.created_by || "";
    const scope = item.scope || "";
    author.textContent = [authorName, scope].filter(Boolean).join(" · ");

    meta.appendChild(date);
    if (authorName || scope) {
      meta.appendChild(author);
    }

    header.appendChild(title);
    header.appendChild(meta);

    const body = document.createElement("p");
    body.className = "mt-2 text-slate-700 whitespace-pre-line";
    body.textContent = item.content || item.message || "";

    wrapper.appendChild(header);
    wrapper.appendChild(body);

    container.appendChild(wrapper);
  });
}

/**
 * Main loader.
 */
async function loadAnnouncements() {
  const studentId = resolveCurrentStudentId();

  if (!studentId) {
    console.warn("[Student Announcement] Cannot resolve current studentId.");
    showError("Cannot detect current student. Please log in again.");
    renderAnnouncements([]);
    return;
  }

  hideError();
  hideEmpty();
  showLoading();

  try {
    const items = await fetchRecentAnnouncements(studentId, DEFAULT_LIMIT);
    renderAnnouncements(items);
  } catch (err) {
    console.error("[Student Announcement] Failed to load announcements:", err);
    showError("Failed to load announcements. Please try again later.");
    renderAnnouncements([]);
  } finally {
    hideLoading();
  }
}

// Entry
document.addEventListener("DOMContentLoaded", () => {
  try {
    initLayout("student-announcement");
  } catch (err) {
    console.warn("[Student Announcement] initLayout error:", err);
  }

  loadAnnouncements();
});
