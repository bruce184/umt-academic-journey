// src/views/student/js/myprofile.js
// Handle toggle menu My Profile (avatar dropdown)

/* 
 * Ý tưởng:
 * - HTML đang dùng inline: onclick="dropmenu(event)" trên .profile-bubble
 * - Ở đây mình chỉ expose đúng 1 hàm global: window.dropmenu
 * - Listener đóng menu dùng document.addEventListener("click"), 
 *   tránh ghi đè window.onclick (đỡ đụng code khác).
 */

(function () {
  function handleProfileBubbleClick(event) {
    event.stopPropagation();

    const menu = document.querySelector(".profile-box");
    if (!menu) return;

    menu.classList.toggle("show");
  }

  function handleDocumentClick(event) {
    // Nếu click trong vùng .profile-bubble thì để inline handler xử lý
    if (event.target.closest(".profile-bubble")) {
      return;
    }

    // Click ra ngoài -> đóng menu nếu đang mở
    const openMenu = document.querySelector(".profile-box.show");
    if (openMenu) {
      openMenu.classList.remove("show");
    }
  }

  // Expose cho HTML: onclick="dropmenu(event)"
  window.dropmenu = handleProfileBubbleClick;

  // Lắng nghe click toàn trang để đóng menu khi click ra ngoài
  document.addEventListener("click", handleDocumentClick);
})();
