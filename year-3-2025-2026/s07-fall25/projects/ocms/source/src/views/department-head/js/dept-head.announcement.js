/* eslint-disable no-unused-vars */
// dept-head.announcement.js
// Department Head - Department announcements (Phase 2, real API)

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

// ---- API calls ----
async function fetchDepartmentAnnouncements() {
  const headId = getCurrentHeadId();
  const term = getCurrentTerm();

  const params = new URLSearchParams({ term });

  const res = await fetch(
    `${API_BASE}/${headId}/announcements?${params.toString()}`,
    {
      headers: {
        "Content-Type": "application/json",
        "X-Requested-By": "ocms-dept-head-announcements",
      },
    }
  );

  if (!res.ok) {
    console.error("Failed to fetch department announcements:", res.status);
    throw new Error("Failed to fetch department announcements");
  }

  const json = await res.json();
  return json.data || json;
}

async function postDepartmentAnnouncement(payload) {
  const headId = getCurrentHeadId();

  const res = await fetch(`${API_BASE}/${headId}/announcements`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-By": "ocms-dept-head-announcement-create",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    console.error("Failed to create department announcement:", res.status);
    throw new Error("Failed to create department announcement");
  }

  const json = await res.json();
  return json.data || json;
}

// ---- Render ----
function renderAnnouncements(payload) {
  const listEl = document.getElementById("head-announcement-list");
  const summaryEl = document.getElementById("head-announcements-summary");
  if (!listEl) return;

  const items = Array.isArray(payload.items) ? payload.items : [];
  const summary = payload.summary || {};

  if (summaryEl) {
    const total = summary.total ?? items.length;
    const pinned = summary.pinnedCount ?? items.filter((a) => a.pinned).length;
    summaryEl.textContent = `Total: ${total} • Pinned: ${pinned}`;
  }

  if (!items.length) {
    listEl.innerHTML =
      '<div class="text-sm text-gray-500">No department announcements yet.</div>';
    return;
  }

  const badgeForAudience = (audience) => {
    const a = (audience || "all").toLowerCase();
    if (a === "students") return "bg-blue-100 text-blue-700";
    if (a === "lecturers") return "bg-amber-100 text-amber-700";
    return "bg-purple-100 text-purple-700";
  };

  const badgeLabelForAudience = (audience) => {
    const a = (audience || "all").toLowerCase();
    if (a === "students") return "Students";
    if (a === "lecturers") return "Lecturers";
    return "All";
  };

  const cards = items
    .sort((a, b) => {
      // Pinned lên trước, sau đó theo createdAt desc
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .map((ann) => {
      const audienceClass = badgeForAudience(ann.audience);
      const audienceLabel = badgeLabelForAudience(ann.audience);
      const created =
        ann.createdAt != null
          ? new Date(ann.createdAt).toLocaleString()
          : "";

      return `
        <article class="border border-gray-200 rounded-lg p-3 bg-white shadow-sm">
          <div class="flex items-start justify-between gap-2">
            <div>
              <h3 class="text-sm font-semibold text-gray-900">
                ${ann.title ?? ""}
              </h3>
              <p class="mt-1 text-sm text-gray-700 whitespace-pre-line">
                ${ann.message ?? ""}
              </p>
            </div>
            <div class="flex flex-col items-end gap-1">
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${audienceClass}">
                ${audienceLabel}
              </span>
              ${
                ann.pinned
                  ? '<span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-100 text-yellow-700 mt-1">Pinned</span>'
                  : ""
              }
            </div>
          </div>
          <div class="mt-2 text-[11px] text-gray-400 flex justify-between">
            <span>${created}</span>
            <span>ID: ${ann.id ?? ""}</span>
          </div>
        </article>
      `;
    })
    .join("");

  listEl.innerHTML = cards;
}

// ---- Form wiring ----
function wireAnnouncementForm() {
  const titleInput = document.getElementById("head-ann-title-input");
  const messageInput = document.getElementById("head-ann-message-input");
  const audienceSelect = document.getElementById("head-ann-audience-select");
  const pinnedCheckbox = document.getElementById("head-ann-pinned-checkbox");
  const submitBtn = document.getElementById("head-ann-submit-btn");

  if (!submitBtn || !titleInput || !messageInput || !audienceSelect) {
    return;
  }

  submitBtn.addEventListener("click", async () => {
    const title = titleInput.value.trim();
    const message = messageInput.value.trim();
    const audience = audienceSelect.value;
    const pinned = pinnedCheckbox?.checked ?? false;

    if (!title || !message) {
      alert("Please provide both title and message.");
      return;
    }

    submitBtn.disabled = true;

    try {
      const created = await postDepartmentAnnouncement({
        title,
        message,
        audience,
        pinned,
      });

      // Prepend thông báo mới vào list hiện tại (không wait refetch)
      const currentData = {
        items: [],
        summary: {},
      };
      const listEl = document.getElementById("head-announcement-list");
      if (listEl && listEl.children.length) {
        // Không parse DOM; đơn giản là refetch để luôn đúng (dù là mock)
        await loadDeptHeadAnnouncements();
      } else {
        // Nếu chưa có gì, refetch luôn
        await loadDeptHeadAnnouncements();
      }

      // Reset form
      titleInput.value = "";
      messageInput.value = "";
      pinnedCheckbox.checked = false;
      audienceSelect.value = "all";
    } catch (err) {
      console.error("Error creating announcement:", err);
      alert("Failed to publish announcement. Please try again.");
    } finally {
      submitBtn.disabled = false;
    }
  });
}

// ---- Term / Refresh wiring ----
function wireAnnouncementFilters() {
  const termSelect = document.getElementById("head-term-select");
  if (termSelect) {
    termSelect.addEventListener("change", () => {
      loadDeptHeadAnnouncements();
    });
  }

  const refreshBtn = document.getElementById("head-refresh-btn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      loadDeptHeadAnnouncements();
    });
  }
}

// ---- Entry point ----
async function loadDeptHeadAnnouncements() {
  const listEl = document.getElementById("head-announcement-list");
  if (!listEl) return;

  try {
    listEl.innerHTML =
      '<div class="text-sm text-gray-500">Loading department announcements...</div>';
    const payload = await fetchDepartmentAnnouncements();
    renderAnnouncements(payload);
  } catch (err) {
    console.error("Error loading department announcements:", err);
    listEl.innerHTML =
      '<div class="text-sm text-red-600">Cannot load department announcements right now.</div>';
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Chỉ chạy nếu section tồn tại
  if (document.getElementById("head-announcements")) {
    loadDeptHeadAnnouncements();
    wireAnnouncementForm();
    wireAnnouncementFilters();
  }
});
