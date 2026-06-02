/* top shade*/
box-shadow: 0 -2px 4px rgba(0,0,0,0.04), 0 -8px 32px rgba(0,0,0,0.10);


/*all sides shade */
box-shadow: 0 0 32px rgba(0,0,0,0.10);



/* hover effect */

.feature-item:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0, 151, 178, 0.15);
    border-color: var(--primary);
    background: rgba(255, 255, 255, 0.95);

}

 /* =============================================
   KIGALI ROADRULES — animations.css
   Paste into your main stylesheet or a
   separate animations.css file
   ============================================= */

/* ── Shared initial hidden state ── */
.fade-up,
.fade-in,
.fade-down,
.fade-left,
.slide-left,
.zoom-in,
.cardz {
  opacity: 0;
  transition:
    opacity  0.55s ease,
    transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}


/* =============================================
   KIGALI ROADRULES — animations.js
   Reusable scroll-reveal & UI interaction kit
   ============================================= */

(function () {
  'use strict';

  /* ──────────────────────────────────────────
     1. SCROLL REVEAL
     Add any of these classes to any element:
       .fade-up    → fades in rising from below
       .fade-in    → fades in (no movement)
       .fade-down  → fades in dropping from above
       .fade-left  → slides in from the right
       .slide-left → slides in from the left
       .zoom-in    → scales up from small
     Optional: data-delay="100" through "600"
  ────────────────────────────────────────── */
  const REVEAL_CLASSES = [
    '.fade-up',
    '.fade-in',
    '.fade-down',
    '.fade-left',
    '.slide-left',
    '.zoom-in',
    '.cardz',
  ];

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target); /* fire once only */
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  function initReveal() {
    document.querySelectorAll(REVEAL_CLASSES.join(', ')).forEach((el) => {
      revealObserver.observe(el);
    });
  }


  /* ──────────────────────────────────────────
     2. NAVBAR — hide on scroll down, show on
        scroll up, shadow when not at top
  ────────────────────────────────────────── */
  function initNavbar() {
    const header = document.querySelector('.header');
    if (!header) return;

    let lastScroll = 0;

    window.addEventListener(
      'scroll',
      () => {
        const current = window.scrollY;
        header.classList.toggle('hide',     current > lastScroll && current > 80);
        header.classList.toggle('scrolled', current > 10);
        lastScroll = current;
      },
      { passive: true }
    );
  }


  /* ──────────────────────────────────────────
     3. SPOTLIGHT HOVER — teal radial glow
        that follows the mouse across a grid.
     Usage: add id="spotlightGrid" (or any
     selector) to the card container, and the
     class .spotlight-card to each card.
     The card needs these CSS pseudo-elements:
       ::before  (inner highlight)
       ::after   (border glow)
     and CSS vars --mouse-x / --mouse-y.
  ────────────────────────────────────────── */
  function initSpotlight(containerSelector = '#serviceCards') {
    const grids = document.querySelectorAll(containerSelector);
    grids.forEach((grid) => {
      grid.addEventListener('mousemove', (e) => {
        const cards = grid.querySelectorAll('.service-card, .spotlight-card');
        cards.forEach((card) => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
          card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        });
      });
    });
  }


  /* ──────────────────────────────────────────
     4. STAGGER CHILDREN
     Automatically adds increasing transition-
     delay to direct children of any element
     with class .stagger-children.
     Each child gets +80ms more than the last.
  ────────────────────────────────────────── */
  function initStagger() {
    document.querySelectorAll('.stagger-children').forEach((parent) => {
      const step = Number(parent.dataset.staggerStep) || 80; /* ms per child */
      [...parent.children].forEach((child, i) => {
        child.style.transitionDelay = `${i * step}ms`;
      });
    });
  }


  /* ──────────────────────────────────────────
     5. COUNTER ANIMATION
     Add data-count="1234" to any element and
     it will count up from 0 when it enters
     the viewport.
  ────────────────────────────────────────── */
  function initCounters() {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el     = entry.target;
          const target = Number(el.dataset.count);
          const suffix = el.dataset.countSuffix || '';
          const duration = Number(el.dataset.countDuration) || 1500;
          const start  = performance.now();

          function step(now) {
            const elapsed  = now - start;
            const progress = Math.min(elapsed / duration, 1);
            /* ease-out cubic */
            const eased    = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target).toLocaleString() + suffix;
            if (progress < 1) requestAnimationFrame(step);
          }

          requestAnimationFrame(step);
          counterObserver.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );

    document.querySelectorAll('[data-count]').forEach((el) => {
      counterObserver.observe(el);
    });
  }


  /* ──────────────────────────────────────────
     6. PARALLAX — subtle vertical shift on
        elements with class .parallax.
        data-parallax-speed="0.15" controls
        how fast (default 0.1).
  ────────────────────────────────────────── */
  function initParallax() {
    const els = document.querySelectorAll('.parallax');
    if (!els.length) return;

    window.addEventListener(
      'scroll',
      () => {
        els.forEach((el) => {
          const speed  = Number(el.dataset.parallaxSpeed) || 0.1;
          const offset = window.scrollY * speed;
          el.style.transform = `translateY(${offset}px)`;
        });
      },
      { passive: true }
    );
  }


  /* ──────────────────────────────────────────
     BOOT — run everything once DOM is ready
  ────────────────────────────────────────── */
  function boot() {
    initReveal();
    initNavbar();
    initSpotlight('#serviceCards, .spotlight-grid');
    initStagger();
    initCounters();
    initParallax();
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', boot)
    : boot();

})();

/* ── Starting transforms ── */
.fade-up    { transform: translateY(32px);  }
.fade-down  { transform: translateY(-32px); }
.fade-left  { transform: translateX(32px);  }
.slide-left { transform: translateX(-28px); }
.zoom-in    { transform: scale(0.92);       }
.fade-in    { transform: none;              }
.cardz      { transform: translateY(20px);  }

/* ── Visible state (added by JS) ── */
.fade-up.visible,
.fade-in.visible,
.fade-down.visible,
.fade-left.visible,
.slide-left.visible,
.zoom-in.visible,
.cardz.visible {
  opacity: 1;
  transform: none;
}

/* ── Stagger delays via data-delay attribute ── */
[data-delay="100"] { transition-delay: 100ms; }
[data-delay="200"] { transition-delay: 200ms; }
[data-delay="300"] { transition-delay: 300ms; }
[data-delay="400"] { transition-delay: 400ms; }
[data-delay="500"] { transition-delay: 500ms; }
[data-delay="600"] { transition-delay: 600ms; }

/* ── Navbar transitions ── */
.header {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.header.hide     { transform: translateY(-100%); }
.header.scrolled { box-shadow: 0 4px 16px rgba(0,0,0,0.07); }