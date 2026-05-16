// src/views/lecturer/js/lecturer-announcement.js

const API_BASE = "/lecturers";
const DEFAULT_LECTURER_ID = 1;

// --- Helper: giống pattern analytics / schedule ---
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

// --- API: GET /lecturers/:id/announcements ---
async function fetchLecturerAnnouncements() {
  const lecturerId = getCurrentLecturerId();

  const res = await fetch(`${API_BASE}/${lecturerId}/announcements`, {
    headers: {
      "Content-Type": "application/json",
      "X-Requested-By": "ocms-lecturer-announcement",
    },
  });

  if (!res.ok) {
    console.error("Failed to fetch lecturer announcements:", res.status);
    throw new Error("Failed to fetch lecturer announcements");
  }

  const json = await res.json();
  return json.data || json;
}

// --- Render list ---
function renderAnnouncements(list) {
  const container = document.getElementById("lecturer-announcement-list");
  if (!container) return;

  if (!Array.isArray(list) || list.length === 0) {
    container.innerHTML = `
      <div class="p-4 bg-white shadow-md rounded-lg border border-gray-200 text-sm text-gray-500">
        No announcements yet. Use the <span class="font-semibold">New</span> button to create the first one.
      </div>
    `;
    return;
  }

  const html = list
    .map((item) => {
      const courseLabel = item.courseName || item.courseId || "";
      const timeLabel = item.timeLabel || "";
      const title = item.title || "";
      const content = item.content || "";

      return `
        <div class="p-4 bg-white shadow-md rounded-lg border border-gray-200 flex justify-between items-start">
          <div>
            <h4 class="font-semibold">${title}</h4>
            ${
              courseLabel
                ? `<p class="text-xs text-gray-500 mt-1">Course: ${courseLabel}</p>`
                : ""
            }
            <p class="text-sm text-gray-600 mt-1">
              ${content}
            </p>
          </div>
          ${
            timeLabel
              ? `<span class="text-xs text-gray-400 ml-4 whitespace-nowrap">${timeLabel}</span>`
              : ""
          }
        </div>
      `;
    })
    .join("");

  container.innerHTML = html;
}

// --- Events: search + New (stub) ---
function wireAnnouncementEvents() {
  const newBtn = document.getElementById("announcement-new-btn");
  if (newBtn) {
    newBtn.addEventListener("click", () => {
      alert(
        "Creating new announcements is not available in the UI yet.\nAnnouncements are stored in the database and will be editable from the admin UI in a later iteration."
      );
    });
  }

  const searchInput = document.getElementById("announcement-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const keyword = e.target.value.toLowerCase().trim();
      const cards = document.querySelectorAll(
        "#lecturer-announcement-list > div"
      );

      cards.forEach((card) => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(keyword) ? "" : "none";
      });
    });
  }
}

// --- Entry point ---
async function initLecturerAnnouncement() {
  try {
    const data = await fetchLecturerAnnouncements();
    renderAnnouncements(data);
    wireAnnouncementEvents();
  } catch (err) {
    console.error("Error while loading lecturer announcements:", err);
    const container = document.getElementById("lecturer-announcement-list");
    if (container) {
      container.innerHTML = `
        <div class="p-4 bg-white shadow-md rounded-lg border border-red-100 text-sm text-red-600">
          Cannot load announcements right now. Please try again later.
        </div>
      `;
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initLecturerAnnouncement();
});
