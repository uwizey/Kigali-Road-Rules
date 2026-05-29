 // ================  auto hide and show the header
 
const header   = document.querySelector('.header');
let lastY      = window.scrollY;
let ticking    = false;

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const currentY = window.scrollY;
      const delta    = currentY - lastY;

      // Add shadow once past the very top
      header.classList.toggle('scrolled', currentY > 10);

      // Only react after scrolling 60px from top (don't hide on tiny nudge)
      if (currentY > 60) {
        if (delta > 4) {
          header.classList.add('hidden');      // scrolling down → hide
        } else if (delta < -4) {
          header.classList.remove('hidden');   // scrolling up → show
        }
      } else {
        header.classList.remove('hidden');     // always show near top
      }

      lastY   = currentY;
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

/* ── Scroll hint ── */
const hint = document.getElementById('hint');
const onScroll = () => {
  const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 80;
  hint.classList.toggle('hidden', nearBottom || window.scrollY > 300);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ── Scroll reveal via IntersectionObserver ── */
document.body.classList.add('js-ready');

const revealEls    = document.querySelectorAll('[data-reveal]');
const staggerEls   = document.querySelectorAll('[data-stagger]');
const allObserved  = [...revealEls, ...staggerEls];

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      observer.unobserve(entry.target); // fire once
    }
  });
}, {
  threshold: 0.12,   // trigger when 12% of element is visible
  rootMargin: '0px 0px -40px 0px'  // slight upward offset for natural feel
});

allObserved.forEach(el => observer.observe(el));