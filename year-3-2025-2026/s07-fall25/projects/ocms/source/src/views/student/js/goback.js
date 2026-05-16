document.addEventListener("DOMContentLoaded", () => {
  const backBtn = document.querySelector(".back-arrow");
  if (!backBtn) return;

  backBtn.addEventListener("click", () => {
    window.history.back();
  });
});
