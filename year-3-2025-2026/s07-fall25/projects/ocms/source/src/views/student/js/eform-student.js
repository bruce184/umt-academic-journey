/* eslint-disable no-unused-vars */
// student/js/eform-student.js
// Phase 2: Student eForms - dùng API thật + HTML hiện tại

import { initLayout } from "../../common/layout-common.js";

const STUDENT_API_BASE = "/students";

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
    console.warn("[Student E-Form] Cannot resolve studentId.", err);
  }

  return null;
}

/**
 * GET /students/:studentId/eforms
 *
 * Accepted responses:
 *  A) { ok: true, data: { items: [...] } }
 *  B) { items: [...] }
 *  C) [ ... ]  // plain array
 */
async function fetchEForms(studentId) {
  const url = `${STUDENT_API_BASE}/${studentId}/eforms`;

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
      `[Student E-Form] Cannot parse JSON payload: ${
        err && err.message ? err.message : String(err)
      }`,
    );
  }

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

  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray(payload.items)
  ) {
    return payload.items;
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  throw new Error(
    "[Student E-Form] Unexpected API response shape for eforms list.",
  );
}

/**
 * POST /students/:studentId/eforms
 *
 * Body example:
 * {
 *   "form_type": "ABSENCE",
 *   "title": "Request ...",
 *   "content": "I will be absent ...",
 *   "attachment_url": null
 * }
 */
async function createEForm(studentId, payload) {
  const url = `${STUDENT_API_BASE}/${studentId}/eforms`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} when calling ${url}`);
  }

  let body;
  try {
    body = await res.json();
  } catch (err) {
    // 204 No Content chẳng hạn
    return null;
  }

  if (
    body &&
    typeof body === "object" &&
    Object.prototype.hasOwnProperty.call(body, "data")
  ) {
    return body.data;
  }

  if (body && typeof body === "object") {
    return body;
  }

  return null;
}

/* --------- DOM helpers --------- */

function $(id) {
  return document.getElementById(id);
}

function showFormMessage(text, type = "info") {
  const el = $("eformMessage");
  if (!el) return;
  el.textContent = text;
  el.classList.remove("hidden", "text-red-600", "text-green-600");
  if (type === "error") {
    el.classList.add("text-red-600");
  } else if (type === "success") {
    el.classList.add("text-green-600");
  }
}

function hideFormMessage() {
  const el = $("eformMessage");
  if (!el) return;
  el.classList.add("hidden");
}

/**
 * History container:
 * <div id="eformHistoryContainer" class="divide-y divide-gray-100">
 *   <div class="px-6 py-4 text-sm text-gray-500 italic">
 *     Đang tải lịch sử eForm...
 *   </div>
 * </div>
 */
function showHistoryLoading() {
  const container = $("eformHistoryContainer");
  if (!container) return;
  container.innerHTML = `
    <div class="px-6 py-4 text-sm text-gray-500 italic">
      Đang tải lịch sử eForm...
    </div>
  `;
}

function showHistoryEmpty() {
  const container = $("eformHistoryContainer");
  if (!container) return;
  container.innerHTML = `
    <div class="px-6 py-4 text-sm text-gray-500 italic">
      Hiện chưa có eForm nào.
    </div>
  `;
}

/**
 * Format datetime string.
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
 * Render eForm history list vào #eformHistoryContainer
 */
function renderEFormList(items) {
  const container = $("eformHistoryContainer");
  if (!container) return;

  if (!items || !items.length) {
    showHistoryEmpty();
    return;
  }

  container.innerHTML = "";

  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "px-6 py-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2";

    const left = document.createElement("div");
    left.className = "flex-1";

    const title = document.createElement("h3");
    title.className = "font-semibold text-gray-800 text-sm";
    title.textContent = item.title || "eForm";

    const metaTop = document.createElement("p");
    metaTop.className = "text-xs text-gray-500 mt-0.5";
    const formType = item.form_type || item.type || "N/A";
    const createdAt = formatDateTime(
      item.created_at || item.createdAt || item.submitted_at,
    );
    metaTop.textContent = `Loại: ${formType} · Gửi lúc: ${createdAt}`;

    const content = document.createElement("p");
    content.className = "mt-1 text-sm text-gray-700 whitespace-pre-line";
    content.textContent = item.content || item.body || "";

    left.appendChild(title);
    left.appendChild(metaTop);
    left.appendChild(content);

    const right = document.createElement("div");
    right.className =
      "flex flex-col items-start sm:items-end text-xs text-gray-500 mt-2 sm:mt-0";

    const status = document.createElement("span");
    const statusText = item.status || item.form_status || "PENDING";
    status.className =
      "inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-700 mb-1";
    status.textContent = statusText;

    const updatedRaw = item.last_updated_at || item.updated_at;
    if (updatedRaw) {
      const updated = document.createElement("span");
      updated.textContent = "Cập nhật: " + formatDateTime(updatedRaw);
      right.appendChild(updated);
    }

    right.insertBefore(status, right.firstChild);

    row.appendChild(left);
    row.appendChild(right);

    container.appendChild(row);
  });
}

/**
 * Đọc dữ liệu form
 */
function readFormPayload() {
  const typeEl = $("eformType");
  const titleEl = $("eformTitle");
  const contentEl = $("eformContent");

  const form_type = typeEl ? typeEl.value.trim() : "";
  const title = titleEl ? titleEl.value.trim() : "";
  const content = contentEl ? contentEl.value.trim() : "";

  const errors = [];
  if (!form_type) errors.push("Vui lòng chọn loại eForm.");
  if (!title) errors.push("Vui lòng nhập tiêu đề.");
  if (!content) errors.push("Vui lòng nhập nội dung chi tiết.");

  return {
    payload: {
      form_type,
      title,
      content,
      attachment_url: null, // hiện tại HTML chưa có field đính kèm
    },
    errors,
  };
}

function clearForm() {
  const form = $("eformCreateForm");
  if (form) form.reset();
}

/**
 * Khởi tạo trang eForm: load history + bind submit
 */
async function initEFormPage() {
  const studentId = resolveCurrentStudentId();

  if (!studentId) {
    console.warn("[Student E-Form] Cannot resolve current studentId.");
    showFormMessage(
      "Không xác định được sinh viên hiện tại. Vui lòng đăng nhập lại.",
      "error",
    );
    showHistoryEmpty();
    return;
  }

  hideFormMessage();
  showHistoryLoading();

  // 1) Load history
  try {
    const items = await fetchEForms(studentId);
    renderEFormList(items);
  } catch (err) {
    console.error("[Student E-Form] Failed to load eforms:", err);
    showFormMessage("Không tải được lịch sử eForm. Vui lòng thử lại sau.", "error");
    showHistoryEmpty();
  }

  // 2) Bind submit
  const form = $("eformCreateForm");
  if (!form) return;

  const submitBtn = $("eformSubmitButton");

  form.addEventListener("submit", async (evt) => {
    evt.preventDefault();
    hideFormMessage();

    const { payload, errors } = readFormPayload();
    if (errors.length > 0) {
      showFormMessage(errors.join(" "), "error");
      return;
    }

    if (submitBtn) submitBtn.disabled = true;

    try {
      await createEForm(studentId, payload);
      clearForm();
      showFormMessage("Gửi eForm thành công.", "success");

      // Reload history
      showHistoryLoading();
      const items = await fetchEForms(studentId);
      renderEFormList(items);
    } catch (err) {
      console.error("[Student E-Form] Failed to submit eform:", err);
      showFormMessage("Gửi eForm thất bại. Vui lòng thử lại sau.", "error");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

/* ---------- Entry ---------- */

document.addEventListener("DOMContentLoaded", () => {
  try {
    initLayout("student-eform");
  } catch (err) {
    console.warn("[Student E-Form] initLayout error:", err);
  }

  initEFormPage();
});
