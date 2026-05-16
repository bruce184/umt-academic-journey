document.addEventListener('DOMContentLoaded', () => {
  const links  = Array.from(document.querySelectorAll('.sidebar__list a'));
  const slides = document.querySelector('.slides');

  links.forEach((link, idx) => {
    link.addEventListener('click', e => {
      e.preventDefault();

      // vertical slide instead of horizontal
      slides.style.transform = `translateY(-${idx * 100}vh)`;

      // highlight active link
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
});
