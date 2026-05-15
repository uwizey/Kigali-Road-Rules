/* ============================================================
   DASHBOARD JS PATCHES
   
   HOW TO USE:
   Paste the contents of each section into your existing
   user-dashboard.js at the spots marked below, OR add a
   <script type="module"> tag after your current script that
   imports this file.
   
   Each patch is clearly labelled and self-contained.
   ============================================================ */

/* ----------------------------------------------------------
   PATCH A — Header / Topbar hide-on-scroll
   
   WHERE: add this after your existing initializeApp() call,
          or call initScrollBehaviour() from initializeApp().
   ---------------------------------------------------------- */

function initScrollBehaviour() {
  const header  = document.querySelector('.header');
  const topbar  = document.querySelector('.dash-topbar');
  const content = document.getElementById('mainContent'); // scrollable area

  if (!header || !topbar) return;

  // Keep track of actual CSS top so topbar sticks right below header
  function syncTopbarTop() {
    const h = header.getBoundingClientRect().height;
    topbar.style.top = h + 'px';
  }
  syncTopbarTop();
  window.addEventListener('resize', syncTopbarTop);

  let lastY = 0;
  let ticking = false;

  // We watch the window scroll (works when .dash-content scrolls the page)
  // If your inner scroll happens inside #mainContent instead, swap
  // window → mainContent below.
  window.addEventListener('scroll', onScroll, { passive: true });

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  function update() {
    const y = window.scrollY;
    const delta = y - lastY;

    if (delta > 6 && y > 60) {
      // Scrolling DOWN — hide header & topbar
      header.classList.add('header--hidden');
      topbar.classList.add('topbar--hidden');
    } else if (delta < -6) {
      // Scrolling UP — reveal
      header.classList.remove('header--hidden');
      topbar.classList.remove('topbar--hidden');
    }

    lastY = y;
    ticking = false;
  }
}

/* ----------------------------------------------------------
   PATCH B — Slide + fade transition for content prev/next
   
   WHERE: replace (or wrap) your existing _updateTopicNavFromAPI
          function, OR drop _animatedLoadContent in and call it
          from the prev/next button click handlers.
   ---------------------------------------------------------- */

/**
 * Direction: 'next' → slide left  (current exits left, new enters from right)
 *            'prev' → slide right (current exits right, new enters from left)
 */
function _animatedLoadContent(dataset, direction) {
  const container = document.getElementById('contentContainer');
  if (!container) {
    // No animation possible yet — just load normally
    loadContent({ target: { closest: () => null } }, dataset);
    return;
  }

  const exitClass   = direction === 'next' ? 'krr-exit-left'  : 'krr-exit-right';
  const enterClass  = direction === 'next' ? 'krr-enter-right' : 'krr-enter-left';
  const DURATION_MS = 230; // must be >= exit animation duration in CSS

  // 1. Play exit animation
  container.classList.add(exitClass);

  setTimeout(() => {
    // 2. Remove exit class, load new content (which re-renders #contentContainer)
    container.classList.remove(exitClass);

    // loadContent replaces innerHTML of #contentContainer internally
    loadContent({ target: { closest: () => null } }, dataset);

    // 3. After loadContent finishes rendering, play enter animation
    //    We use requestAnimationFrame to let the browser paint the new HTML first
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const freshContainer = document.getElementById('contentContainer');
        freshContainer.classList.add(enterClass);
        setTimeout(() => freshContainer.classList.remove(enterClass), 300);
      });
    });
  }, DURATION_MS);
}

/**
 * Drop-in replacement for _updateTopicNavFromAPI.
 * Call this instead of the original in loadContent().
 *
 * Replace the original function body with this one,
 * or rename and swap the call site.
 */
function _updateTopicNavFromAPI(subtopicId) {
  const idx = _allSubtopics.findIndex(
    (s) => String(s.subtopicId) === String(subtopicId)
  );

  const prevBtn = document.getElementById('prevTopicBtn');
  const nextBtn = document.getElementById('nextTopicBtn');

  // Replace nodes to nuke stale listeners
  const newPrev = prevBtn.cloneNode(true);
  const newNext = nextBtn.cloneNode(true);
  prevBtn.parentNode.replaceChild(newPrev, prevBtn);
  nextBtn.parentNode.replaceChild(newNext, nextBtn);

  if (idx > 0) {
    const prev = _allSubtopics[idx - 1];
    newPrev.style.display = 'flex';
    newPrev.addEventListener('click', () => _animatedLoadContent(prev, 'prev'));
  } else {
    newPrev.style.display = 'none';
  }

  if (idx !== -1 && idx < _allSubtopics.length - 1) {
    const next = _allSubtopics[idx + 1];
    newNext.style.display = 'flex';
    newNext.addEventListener('click', () => _animatedLoadContent(next, 'next'));
  } else {
    newNext.style.display = 'none';
  }
}

/* ----------------------------------------------------------
   PATCH C — Wire everything up
   
   If you are dropping this as a separate <script> tag
   (not merging into user-dashboard.js), the DOMContentLoaded
   event below bootstraps both patches automatically.
   
   If you ARE merging into user-dashboard.js, just call
   initScrollBehaviour() at the end of your initializeApp().
   ---------------------------------------------------------- */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollBehaviour);
} else {
  // DOMContentLoaded already fired
  initScrollBehaviour();
}

    let lastScrollY = window.scrollY;
    let ticking = false;

    const topbar = document.querySelector('.dash-topbar');

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          if (currentScrollY > lastScrollY) {
            // Scrolling down — hide (push up by its own height + its top offset)
            topbar.style.top = '-200px';
          } else {
            // Scrolling up — restore original position
            topbar.style.top = '70px';
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });

        ticking = true;
      }
    });