// Login page script: Trợ lý Xác thực + đổi màu UI + ĐĂNG NHẬP BẰNG API THẬT

// Khởi tạo các biến toàn cục cho Trợ lý Xác thực
const API_KEY = "";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`;

// Hàm hiển thị tin nhắn trong cửa sổ chat
function displayMessage(sender, text, isAIGrounded = false) {
  const chatWindow = document.getElementById("chatWindow");
  const messageDiv = document.createElement("div");

  if (sender === "user") {
    messageDiv.className = "flex justify-end";
    messageDiv.innerHTML = `<div class="bg-blue-100 text-blue-800 p-3 rounded-lg max-w-xs md:max-w-md shadow-sm">${text}</div>`;
  } else {
    messageDiv.className = "flex justify-start";
    let content = `<div class="bg-gray-200 text-gray-800 p-3 rounded-lg max-w-xs md:max-w-md shadow-sm">
            <strong class="text-primary">Trợ lý:</strong> ${text}`;

    if (isAIGrounded) {
      content += `<p class="mt-2 text-xs text-gray-600 italic">(Thông tin được dựa trên quy trình của hệ thống)</p>`;
    }

    content += "</div>";
    messageDiv.innerHTML = content;
  }

  chatWindow.appendChild(messageDiv);
  // Cuộn xuống tin nhắn mới nhất
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Hàm gọi Gemini API (Có Exponential Backoff)
async function fetchWithBackoff(url, options, maxRetries = 5) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.status !== 429) {
        // Nếu không phải lỗi Rate Limit, xử lý bình thường
        return response;
      }
      // Nếu là lỗi 429 (Rate Limit), chờ và thử lại
      const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    } catch (error) {
      const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
      console.log(error);
    }
  }
  throw new Error("API request failed after maximum retries.");
}

// Hàm xử lý gửi tin nhắn và gọi LLM
async function sendChat(event) {
  event.preventDefault();
  const input = document.getElementById("chatInput");
  const query = input.value.trim();

  if (!query) return;

  displayMessage("user", query);
  input.value = "";

  const sendBtn = document.getElementById("sendBtn");
  const originalBtnText = sendBtn.textContent;

  // Hiển thị loading
  sendBtn.disabled = true;
  sendBtn.innerHTML = `<svg class="animate-spin h-5 w-5 mr-1" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Đang trả lời...`;

  const systemInstruction =
    "Bạn là Trợ lý Xác thực của Hệ thống Quản lý Khóa học UMT. Nhiệm vụ của bạn là cung cấp hướng dẫn rõ ràng và ngắn gọn bằng tiếng Việt về quy trình đăng nhập, khôi phục mật khẩu, và thiết lập xác thực 2 yếu tố (2FA). KHÔNG trả lời các câu hỏi ngoài chủ đề xác thực.";

  const payload = {
    contents: [{ parts: [{ text: query }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
    // Sử dụng Google Search grounding để mô phỏng việc dựa trên các quy trình chính sách
    tools: [{ google_search: {} }],
  };

  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  };

  try {
    const response = await fetchWithBackoff(API_URL, options);
    const result = await response.json();

    const candidate = result.candidates?.[0];

    if (candidate && candidate.content?.parts?.[0]?.text) {
      const text = candidate.content.parts[0].text;
      displayMessage("assistant", text, true);
    } else {
      displayMessage(
        "assistant",
        "Xin lỗi, tôi không thể tìm thấy thông tin hoặc câu hỏi của bạn ngoài phạm vi hỗ trợ xác thực.",
        false,
      );
    }
  } catch (error) {
    console.error("Lỗi gọi API:", error);
    displayMessage(
      "assistant",
      "Xin lỗi, đã xảy ra lỗi trong quá trình xử lý. Vui lòng thử lại sau.",
      false,
    );
  } finally {
    // Tắt loading
    sendBtn.textContent = originalBtnText;
    sendBtn.disabled = false;
  }
}

/**
 * HANDLE ĐĂNG NHẬP THẬT: Gửi email/username + password lên /api/login
 */
async function handleLoginSubmit(e) {
  e.preventDefault();

  const loginForm = e.currentTarget;
  const messageDiv = document.getElementById("loginMessage");

  // Tìm input username/email & password theo nhiều ID khả dĩ
  const identifierInput =
    document.getElementById("identifier") ||
    document.getElementById("email") ||
    document.getElementById("username");
  const passwordInput = document.getElementById("password");

  const identifier = identifierInput?.value.trim();
  const password = passwordInput?.value ?? "";

  // Reset message
  if (messageDiv) {
    messageDiv.classList.add("hidden");
    messageDiv.textContent = "";
    messageDiv.classList.remove(
      "bg-green-100",
      "text-green-800",
      "bg-red-100",
      "text-red-800",
      "font-medium",
    );
  }

  if (!identifier || !password) {
    if (messageDiv) {
      messageDiv.textContent = "Vui lòng nhập đầy đủ Tài khoản và Mật khẩu.";
      messageDiv.classList.remove("hidden");
      messageDiv.classList.add("bg-red-100", "text-red-800", "font-medium");
    }
    return;
  }

  // Disable nút submit trong lúc gọi API
  const submitBtn = loginForm.querySelector("button[type='submit']");
  const originalBtnHtml = submitBtn ? submitBtn.innerHTML : null;
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = "Đang đăng nhập...";
  }

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Backend đang dùng field "email" như một identifier (email/username)
        email: identifier,
        password,
      }),
    });

    const payload = await response.json().catch(() => null);

    // Xử lý lỗi HTTP hoặc payload lỗi (sendError)
    if (!response.ok || !payload || payload.ok === false) {
      const errorMsg =
        payload?.error?.message ||
        payload?.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";

      if (messageDiv) {
        messageDiv.textContent = errorMsg;
        messageDiv.classList.remove("hidden");
        messageDiv.classList.add(
          "bg-red-100",
          "text-red-800",
          "font-medium",
        );
      }
      return;
    }

    // Trường hợp sendOk: { ok: true, data: { message, redirectUrl, user } }
    const result = payload.data || payload;
    const redirectUrl =
      result.redirectUrl || "/student/html/dashboard-student.html";
    const successMsg =
      result.message ||
      "Đăng nhập thành công! Đang chuyển hướng đến giao diện phù hợp...";

    if (messageDiv) {
      messageDiv.textContent = successMsg;
      messageDiv.classList.remove("hidden");
      messageDiv.classList.add(
        "bg-green-100",
        "text-green-800",
        "font-medium",
      );
    }

    // Lưu thông tin user vào sessionStorage để các trang FE (student dashboard, ...) có thể lấy user_id/student_id
    try {
      const user = result.user || result;
      if (user && typeof window !== "undefined" && window.sessionStorage) {
        // Lưu các key phổ biến: student_id/user_id, student_name/user_name, student_email/user_email, user_role
        if (user.id) {
          window.sessionStorage.setItem("student_id", String(user.id));
          window.sessionStorage.setItem("user_id", String(user.id));
        }
        if (user.name) {
          window.sessionStorage.setItem("student_name", String(user.name));
          window.sessionStorage.setItem("user_name", String(user.name));
        }
        if (user.email) {
          window.sessionStorage.setItem("student_email", String(user.email));
          window.sessionStorage.setItem("user_email", String(user.email));
        }
        if (user.role) {
          window.sessionStorage.setItem("user_role", String(user.role));
        }
      }
    } catch (err) {
      // Non-fatal: if sessionStorage unavailable, continue with redirect
      console.warn("Could not persist user info to sessionStorage:", err);
    }

    // Chuyển hướng sau 1.0 giây
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 1000);
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    if (messageDiv) {
      messageDiv.textContent =
        "Không kết nối được tới máy chủ. Vui lòng thử lại sau.";
      messageDiv.classList.remove("hidden");
      messageDiv.classList.add(
        "bg-red-100",
        "text-red-800",
        "font-medium",
      );
    }
  } finally {
    if (submitBtn && originalBtnHtml !== null) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;
    }
  }
}

// Đợi DOM tải xong mới gán sự kiện
document.addEventListener("DOMContentLoaded", () => {
  // Setup Modal Events cho Trợ lý Xác thực
  const modal = document.getElementById("assistantModal");
  const openBtn = document.getElementById("openAssistantBtn");
  const closeBtn = document.getElementById("closeAssistantBtn");
  const chatForm = document.getElementById("chatForm");

  if (openBtn && modal) {
    openBtn.addEventListener("click", () => {
      modal.classList.remove("invisible", "opacity-0");
      modal.classList.add("visible", "opacity-100");
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener("click", () => {
      modal.classList.remove("visible", "opacity-100");
      modal.classList.add("invisible", "opacity-0");
    });
  }

  if (chatForm) {
    chatForm.addEventListener("submit", sendChat);
  }

  /* TÍNH NĂNG: Đổi màu chủ đạo khi chọn Role (chỉ ảnh hưởng UI, không ảnh hưởng phân quyền) */
  const roleSelect = document.getElementById("role");
  if (roleSelect) {
    roleSelect.addEventListener("change", function (e) {
      const role = e.target.value;
      let newColor = "#007ACC"; // Default (Student)

      switch (role) {
        case "student":
          newColor = "#007ACC"; // VSC Blue
          break;
        case "lecturer":
          newColor = "#D13438"; // VSC Red
          break;
        case "depthead":
          newColor = "#1E7E34"; // VSC Green
          break;
        case "registrar":
          newColor = "#6A3797"; // VSC Purple
          break;
        case "finance":
          newColor = "#B58500"; // VSC Yellow
          break;
        case "admin":
          newColor = "#333333"; // Dark Grey
          break;
        default:
          newColor = "#007ACC";
          break;
      }

      // Cập nhật biến CSS --color-primary
      document.documentElement.style.setProperty("--color-primary", newColor);
    });
  }

  // Gán submit handler mới cho form đăng nhập – dùng API thật, không redirect giả lập
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLoginSubmit);
  }
}); // Đóng thẻ DOMContentLoaded
