document.addEventListener("DOMContentLoaded", () => {
  // Demo badge: this page currently uses simulated chart data.
  // Replace chart-generation with API-backed data for production.
  try {
    const demoBanner = document.createElement("div");
    demoBanner.style.cssText = "background:#fff3cd;border:1px solid #ffeeba;padding:8px;margin-bottom:8px;border-radius:4px;color:#856404;font-size:13px;";
    demoBanner.textContent = "DEMO DATA — Charts on this page are simulated. Integrate with server APIs to show real data.";
    const container = document.querySelector("main") || document.body;
    if (container && container.firstChild) container.insertBefore(demoBanner, container.firstChild);
  } catch (e) { void e; /* ignore UI banner errors */ }
  console.warn("admin-reports-academic: using simulated chart data (demo-only)");
  // --- LẤY CÁC ĐỐI TƯỢNG (ELEMENTS) ---
  // Sidebar & Avatar
  const sidebar = document.getElementById("sidebar");
  const toggleSidebar = document.getElementById("toggleSidebar");
  const sidebarTexts = document.querySelectorAll(".sidebar-text");
  const sidebarLogo = document.getElementById("sidebarLogo");
  const sidebarLogoSmall = document.getElementById("sidebarLogoSmall");
  const avatarButton = document.getElementById("avatarButton");
  const avatarDropdown = document.getElementById("avatarDropdown");

  // Charts
  const passFailCtx = document.getElementById("passFailChart");
  const gpaDistributionCtx = document.getElementById("gpaDistributionChart");

  // --- LOGIC SIDEBAR (Giống hệt Dashboard) ---
  if (toggleSidebar) {
    toggleSidebar.addEventListener("click", () => {
      if (sidebar.classList.contains("w-64")) {
        sidebar.classList.remove("w-64");
        sidebar.classList.add("w-20");
        sidebarTexts.forEach((text) => text.classList.add("hidden"));
        sidebarLogo.classList.add("hidden");
        sidebarLogoSmall.classList.remove("hidden");
      } else {
        sidebar.classList.remove("w-20");
        sidebar.classList.add("w-64");
        sidebarTexts.forEach((text) => text.classList.remove("hidden"));
        sidebarLogo.classList.remove("hidden");
        sidebarLogoSmall.classList.add("hidden");
      }
    });
  }

  // --- LOGIC AVATAR DROPDOWN (Giống hệt Dashboard) ---
  if (avatarButton) {
    avatarButton.addEventListener("click", (e) => {
      avatarDropdown.classList.toggle("hidden");
      e.stopPropagation();
    });
  }
  document.addEventListener("click", (e) => {
    if (
      avatarDropdown &&
      avatarButton &&
      !avatarButton.contains(e.target) &&
      !avatarButton.contains(e.target)
    ) {
      avatarDropdown.classList.add("hidden");
    }
  });

  // --- LOGIC VẼ BIỂU ĐỒ (API-first, falls back to demo) ---
  (async () => {
    // Default demo datasets
    let passFailData = [85, 15];
    let gpaData = [15, 45, 120, 80, 30];

    // Try to fetch academic stats from server (if available)
    try {
      const res = await fetch(`/admin/stats?section=academic`, { method: "GET", credentials: "include", headers: { Accept: "application/json" } });
      if (res.ok) {
        const payload = await res.json().catch(() => null);
        const d = payload && payload.data;
        if (d) {
          if (Array.isArray(d.passFail) && d.passFail.length === 2) passFailData = d.passFail;
          if (Array.isArray(d.gpaDistribution) && d.gpaDistribution.length === 5) gpaData = d.gpaDistribution;
        }
      }
    } catch (e) {
        void e;
        console.warn("admin-reports-academic: server academic stats not available, using demo datasets", e);
    }

    // 1. Pass/Fail doughnut
    if (passFailCtx && typeof Chart !== "undefined") {
      new Chart(passFailCtx, {
        type: "doughnut",
        data: {
          labels: ["Đậu", "Rớt"],
          datasets: [
            {
              label: "Tỷ lệ",
              data: passFailData,
              backgroundColor: ["rgba(54, 162, 235, 0.7)", "rgba(255, 99, 132, 0.7)"],
              borderColor: ["rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)"],
              borderWidth: 1,
            },
          ],
        },
        options: { responsive: true, plugins: { legend: { position: "top" } } },
      });
    }

    // 2. GPA distribution bar
    if (gpaDistributionCtx && typeof Chart !== "undefined") {
      new Chart(gpaDistributionCtx, {
        type: "bar",
        data: {
          labels: ["Yếu (<1.5)", "Trung bình (1.5-2.4)", "Khá (2.5-3.1)", "Giỏi (3.2-3.5)", "Xuất sắc (3.6+)"] ,
          datasets: [{ label: "Số lượng Sinh viên", data: gpaData, backgroundColor: ["rgba(255,99,132,0.7)","rgba(255,206,86,0.7)","rgba(54,162,235,0.7)","rgba(75,192,192,0.7)","rgba(153,102,255,0.7)"], borderColor: ["rgba(255,99,132,1)","rgba(255,206,86,1)","rgba(54,162,235,1)","rgba(75,192,192,1)","rgba(153,102,255,1)"], borderWidth: 1 }],
        },
        options: { scales: { y: { beginAtZero: true } }, responsive: true, plugins: { legend: { display: false } } },
      });
    }
  })();
});
