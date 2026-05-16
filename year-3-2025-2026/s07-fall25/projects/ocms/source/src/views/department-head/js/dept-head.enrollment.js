// dept-head.enrollment.js
// Department Head - Enrollment approval (Phase 2, real API)

const API_BASE = "/heads";
const DEFAULT_HEAD_ID = 1;

// ---- Helper: lấy headId hiện tại ----
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

// ---- API: GET /heads/:id/enrollment-requests ----
async function fetchEnrollmentRequests() {
  const headId = getCurrentHeadId();

  const res = await fetch(`${API_BASE}/${headId}/enrollment-requests`, {
    headers: {
      "Content-Type": "application/json",
      "X-Requested-By": "ocms-dept-head-enrollment",
    },
  });

  if (!res.ok) {
    console.error("Failed to fetch enrollment requests:", res.status);
    throw new Error("Failed to fetch enrollment requests");
  }

  const json = await res.json();
  return json.data || json;
}

// ---- API: POST review ----
async function sendEnrollmentReview(enrollmentId, action) {
  const headId = getCurrentHeadId();

  const res = await fetch(
    `${API_BASE}/${headId}/enrollment/${encodeURIComponent(enrollmentId)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-By": "ocms-dept-head-enrollment-review",
      },
      body: JSON.stringify({ action }),
    }
  );

  if (!res.ok) {
    console.error("Failed to review enrollment:", res.status);
    throw new Error("Failed to review enrollment");
  }

  const json = await res.json();
  return json.data || json;
}

// ---- Render bảng Enrollment ----
function renderEnrollmentTable(payload) {
  const container = document.getElementById(
    "head-enrollment-requests-container"
  );
  const pendingLabel = document.getElementById(
    "head-enrollment-pending-count"
  );

  if (!container) return;

  const summary = payload.summary || {};
  const list = Array.isArray(payload.requests) ? payload.requests : [];

  if (pendingLabel) {
    const pending = summary.pendingCount ?? list.filter((r) => r.status === "Pending").length;
    pendingLabel.textContent = `Pending: ${pending}`;
  }

  if (!list.length) {
    container.innerHTML =
      '<div class="text-sm text-gray-500">No enrollment requests for this term.</div>';
    return;
  }

  const rows = list
    .map((item, index) => {
      const status = item.status || "Pending";
      const isPending = status === "Pending";

      let statusColor = "bg-gray-100 text-gray-700";
      if (status === "Approved") statusColor = "bg-emerald-100 text-emerald-700";
      if (status === "Rejected") statusColor = "bg-red-100 text-red-700";

      return `
        <tr class="border-t hover:bg-gray-50">
          <td class="px-3 py-2 text-xs text-gray-500">${index + 1}</td>
          <td class="px-3 py-2 text-sm font-mono">${item.id ?? ""}</td>
          <td class="px-3 py-2 text-sm">
            <div class="font-medium">${item.studentName ?? ""}</div>
            <div class="text-xs text-gray-500">${item.studentId ?? ""}</div>
          </td>
          <td class="px-3 py-2 text-sm">
            <div class="font-medium">${item.courseId ?? ""}</div>
            <div class="text-xs text-gray-500">${item.courseName ?? ""}</div>
          </td>
          <td class="px-3 py-2 text-sm">
            <div>${item.requestedAt ?? ""}</div>
            ${
              item.note
                ? `<div class="text-xs text-gray-500 mt-0.5">${item.note}</div>`
                : ""
            }
          </td>
          <td class="px-3 py-2 text-sm text-center">
            <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}">
              ${status}
            </span>
          </td>
          <td class="px-3 py-2 text-sm text-right space-x-2">
            <button
              class="head-enroll-btn-approve px-2 py-1 text-xs rounded-md border border-emerald-500 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
              data-id="${item.id ?? ""}"
              ${isPending ? "" : "disabled"}
            >
              Approve
            </button>
            <button
              class="head-enroll-btn-reject px-2 py-1 text-xs rounded-md border border-red-500 text-red-700 hover:bg-red-50 disabled:opacity-50"
              data-id="${item.id ?? ""}"
              ${isPending ? "" : "disabled"}
            >
              Reject
            </button>
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
          <th class="px-3 py-2 text-xs font-medium">Request ID</th>
          <th class="px-3 py-2 text-xs font-medium">Student</th>
          <th class="px-3 py-2 text-xs font-medium">Course</th>
          <th class="px-3 py-2 text-xs font-medium">Requested at</th>
          <th class="px-3 py-2 text-xs font-medium text-center">Status</th>
          <th class="px-3 py-2 text-xs font-medium text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;

  wireRowButtons();
}

// ---- Gán sự kiện cho nút Approve/Reject ----
function wireRowButtons() {
  const approveButtons = document.querySelectorAll(
    "#head-enrollment-requests-container .head-enroll-btn-approve"
  );
  const rejectButtons = document.querySelectorAll(
    "#head-enrollment-requests-container .head-enroll-btn-reject"
  );

  approveButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      if (!id) return;

      btn.disabled = true;
      const row = btn.closest("tr");
      try {
        await sendEnrollmentReview(id, "Approved");
        updateRowStatus(row, "Approved");
      } catch (err) {
        console.error("Approve failed:", err);
        alert("Failed to approve this request. Please try again.");
        btn.disabled = false;
      }
    });
  });

  rejectButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      if (!id) return;

      btn.disabled = true;
      const row = btn.closest("tr");
      try {
        await sendEnrollmentReview(id, "Rejected");
        updateRowStatus(row, "Rejected");
      } catch (err) {
        console.error("Reject failed:", err);
        alert("Failed to reject this request. Please try again.");
        btn.disabled = false;
      }
    });
  });
}

// ---- Cập nhật trạng thái trên 1 row sau khi approve/reject ----
function updateRowStatus(row, newStatus) {
  if (!row) return;

  const statusCell = row.querySelector("td:nth-child(6) span");
  const approveBtn = row.querySelector(".head-enroll-btn-approve");
  const rejectBtn = row.querySelector(".head-enroll-btn-reject");

  if (statusCell) {
    let statusColor = "bg-gray-100 text-gray-700";
    if (newStatus === "Approved") {
      statusColor = "bg-emerald-100 text-emerald-700";
    } else if (newStatus === "Rejected") {
      statusColor = "bg-red-100 text-red-700";
    }
    statusCell.textContent = newStatus;
    statusCell.className =
      "inline-flex px-2 py-0.5 rounded-full text-xs font-medium " + statusColor;
  }

  if (approveBtn) approveBtn.disabled = true;
  if (rejectBtn) rejectBtn.disabled = true;

  // Giảm số Pending trên label
  const pendingLabel = document.getElementById(
    "head-enrollment-pending-count"
  );
  if (pendingLabel) {
    const currentText = pendingLabel.textContent || "";
    const match = currentText.match(/Pending:\s*(\d+)/i);
    if (match) {
      const current = Number(match[1]) || 0;
      const next = current > 0 ? current - 1 : 0;
      pendingLabel.textContent = `Pending: ${next}`;
    }
  }
}

// ---- Entry point ----
async function initDeptHeadEnrollment() {
  const container = document.getElementById(
    "head-enrollment-requests-container"
  );
  if (!container) return; // Không phải trang Dept-head Dashboard

  try {
    container.innerHTML =
      '<div class="text-sm text-gray-500">Loading enrollment requests...</div>';

    const payload = await fetchEnrollmentRequests();
    renderEnrollmentTable(payload);
  } catch (err) {
    console.error("Error loading enrollment requests:", err);
    container.innerHTML =
      '<div class="text-sm text-red-600">Cannot load enrollment requests right now.</div>';
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initDeptHeadEnrollment();
});
