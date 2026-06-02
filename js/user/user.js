import { FetchData } from "../api/crud.js";

// ============================================
// STATE
// ============================================

let currentMode = "content";
let currentTopic = null;
let currentSubtopic = null;
let currentQuiz = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let quizStartTime = null;
let quizTimeLimitMs = 0;
let timerInterval = null;
let currentSessionMeta = null;

const useremail = document.getElementById("userEmail");

const _contentCache = { sections: {}, components: {} };
let _allSubtopics = [];
let _currentExercise = null;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});

async function initializeApp() {
  injectExamSelectionStyles();
  loadContentSidebar();
  loadQuizSidebar();
  setupEventListeners();
  setupAvatarDropdown();
  setupScrollBehaviour();

  if (useremail) {
    const res = await FetchData("/user/profile", true);
    useremail.textContent = res.success
      ? (res.data?.data?.email ?? "Unknown User")
      : "Unknown User";
  }
}

// ============================================
// INJECTED STYLES
// ============================================

function injectExamSelectionStyles() {
  const style = document.createElement("style");
  style.textContent = `
    #examSelectionScreen {
      padding: 24px;
      max-width: 960px;
      margin: 0 auto;
    }
    .exam-selection-header {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 32px;
    }
    .exam-selection-title {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .exam-selection-title i { font-size: 2.2rem; color: #0097b2; }
    .exam-selection-title h1 { font-size: 1.6rem; font-weight: 700; color: #111827; margin: 0 0 4px; }
    .exam-selection-title p { color: #6b7280; margin: 0; font-size: 0.9rem; }
    .exam-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 20px;
    }
    .exam-card {
      position: relative; background: #ffffff;
      border: 1.5px solid #e5e7eb; border-radius: 16px;
      padding: 24px 20px 20px; cursor: pointer;
      transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
      display: flex; flex-direction: column; gap: 10px;
    }
    .exam-card:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,151,178,0.15); border-color: #0097b2; }
    .exam-tag {
      position: absolute; top: 14px; right: 14px;
      background: #0097b2; color: #fff;
      font-size: 0.68rem; font-weight: 700;
      padding: 3px 9px; border-radius: 999px;
      text-transform: uppercase; letter-spacing: 0.04em;
    }
    .exam-card-icon {
      width: 48px; height: 48px; border-radius: 12px;
      background: #e0f7fa; display: flex; align-items: center;
      justify-content: center; color: #0097b2; font-size: 1.3rem; margin-bottom: 4px;
    }
    .exam-card-title { font-size: 1.1rem; font-weight: 700; color: #111827; margin: 0; }
    .exam-card-date { font-size: 0.82rem; color: #9ca3af; margin: 0; display: flex; align-items: center; gap: 6px; }
    .exam-card-meta { display: flex; align-items: center; justify-content: space-between; margin-top: 2px; }
    .exam-card-questions { font-size: 0.82rem; color: #6b7280; display: flex; align-items: center; gap: 5px; }
    .exam-card-difficulty { font-size: 0.75rem; font-weight: 600; padding: 3px 10px; border-radius: 999px; }
    .exam-start-btn {
      margin-top: 6px; width: 100%; padding: 10px;
      background: #0097b2; color: #fff; border: none; border-radius: 10px;
      font-size: 0.88rem; font-weight: 600; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: background 0.15s ease;
    }
    .exam-start-btn:hover { background: #007a91; }
    @media (max-width: 600px) {
      .exam-grid { grid-template-columns: 1fr; }
      #examSelectionScreen { padding: 16px; }
      .exam-selection-header { flex-direction: column; align-items: flex-start; }
    }
    .exam-loading {
      grid-column: 1 / -1; display: flex; flex-direction: column;
      align-items: center; gap: 12px; padding: 48px; color: #9ca3af; font-size: 1rem;
    }
    .exam-loading i { font-size: 2rem; color: #0097b2; }
    .exam-empty { grid-column: 1 / -1; text-align: center; padding: 48px; color: #9ca3af; }
    .exam-card.loading { pointer-events: none; opacity: 0.7; }
    .question-nav-divider {
      grid-column: 1 / -1; font-size: 0.68rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.06em;
      color: #0097b2; padding: 8px 2px 2px;
      border-top: 1px solid #e5e7eb;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .question-nav-divider:first-child { border-top: none; padding-top: 2px; }
    #questionSubtopicBadge {
      display: none; align-items: center; gap: 5px;
      font-size: 0.72rem; font-weight: 700; color: #0097b2;
      background: #e0f7fa; border-radius: 999px; padding: 3px 10px;
      margin-left: 8px; text-transform: uppercase; letter-spacing: 0.05em;
      vertical-align: middle;
    }
    #progressWarningOverlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.55);
      z-index: 9999; display: flex; align-items: center; justify-content: center;
      animation: fadeInOverlay 0.18s ease;
    }
    @keyframes fadeInOverlay { from { opacity: 0; } to { opacity: 1; } }
    #progressWarningBox {
      background: #fff; border-radius: 18px; padding: 36px 32px 28px;
      max-width: 420px; width: 90%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
      text-align: center; animation: slideUpBox 0.2s ease;
    }
    @keyframes slideUpBox { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    #progressWarningBox .pw-icon { font-size: 2.4rem; color: #f59e0b; margin-bottom: 12px; }
    #progressWarningBox h3 { font-size: 1.2rem; font-weight: 700; color: #111827; margin: 0 0 10px; }
    #progressWarningBox p { font-size: 0.9rem; color: #6b7280; margin: 0 0 24px; line-height: 1.55; }
    .pw-actions { display: flex; gap: 12px; justify-content: center; }
    .pw-btn { padding: 10px 24px; border: none; border-radius: 10px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
    .pw-btn:hover { opacity: 0.85; }
    .pw-btn-cancel  { background: #f3f4f6; color: #374151; }
    .pw-btn-confirm { background: #dc2626; color: #fff; }
    #quizCountdownWrap { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; font-weight: 600; }
    #quizCountdownWrap.warning { color: #dc2626; }
    #quizCountdownWrap.caution { color: #f59e0b; }
    .answer-option.review-mode { pointer-events: none; cursor: default; }
    .answer-option.review-correct { background: #dcfce7 !important; border-color: #16a34a !important; }
    .answer-option.review-correct .option-letter { background: #16a34a !important; color: #fff !important; }
    .answer-option.review-wrong { background: #fee2e2 !important; border-color: #dc2626 !important; }
    .answer-option.review-wrong .option-letter { background: #dc2626 !important; color: #fff !important; }
    #quizReportScreen { display: none; padding: 24px; max-width: 820px; margin: 0 auto; }
    .report-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }
    .report-header h2 { font-size: 1.4rem; font-weight: 700; color: #111827; margin: 0; }
    .report-summary { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; }
    .report-stat { flex: 1; min-width: 100px; background: #f9fafb; border-radius: 12px; padding: 14px 18px; text-align: center; border: 1.5px solid #e5e7eb; }
    .report-stat .rs-val { font-size: 1.5rem; font-weight: 700; color: #111827; }
    .report-stat .rs-lbl { font-size: 0.75rem; color: #9ca3af; margin-top: 2px; }
    .report-question-block { background: #fff; border: 1.5px solid #e5e7eb; border-radius: 14px; padding: 20px; margin-bottom: 16px; }
    .report-question-block.rq-correct { border-color: #86efac; background: #f0fdf4; }
    .report-question-block.rq-wrong   { border-color: #fca5a5; background: #fff5f5; }
    .rq-meta { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .rq-num { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.78rem; font-weight: 700; flex-shrink: 0; }
    .rq-correct .rq-num { background: #16a34a; color: #fff; }
    .rq-wrong   .rq-num { background: #dc2626; color: #fff; }
    .rq-status-icon { font-size: 1rem; }
    .rq-correct .rq-status-icon { color: #16a34a; }
    .rq-wrong   .rq-status-icon { color: #dc2626; }
    .rq-question-text { font-size: 0.92rem; font-weight: 600; color: #111827; margin-bottom: 10px; line-height: 1.5; }
    .rq-options { display: flex; flex-direction: column; gap: 6px; }
    .rq-option { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 8px; font-size: 0.85rem; border: 1.5px solid transparent; }
    .rq-option-letter { width: 24px; height: 24px; border-radius: 50%; background: #e5e7eb; color: #374151; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 700; flex-shrink: 0; }
    .rq-option.rq-opt-correct { background: #dcfce7; border-color: #86efac; }
    .rq-option.rq-opt-correct .rq-option-letter { background: #16a34a; color: #fff; }
    .rq-option.rq-opt-user-wrong { background: #fee2e2; border-color: #fca5a5; }
    .rq-option.rq-opt-user-wrong .rq-option-letter { background: #dc2626; color: #fff; }
    .rq-image { max-width: 100%; border-radius: 8px; margin-bottom: 10px; }
    .report-close-btn { display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: #0097b2; color: #fff; border: none; border-radius: 10px; font-size: 0.88rem; font-weight: 600; cursor: pointer; transition: background 0.15s; }
    .report-close-btn:hover { background: #007a91; }
    @media (max-width: 600px) { #quizReportScreen { padding: 12px; } .report-summary { gap: 10px; } }
  `;
  document.head.appendChild(style);
}

// ============================================
// ERROR HELPER
// ============================================

// Single place to turn a failed crud.js result into a user-facing popup.
// Pass is403:true to use the "Access Restricted" title/icon variant.
function _showApiError(res) {
  const is403 = res?.status === 403;
  showInfoPopup(
    is403 ? "Access Restricted" : "Oops!",
    res?.userMessage ?? "An unexpected error occurred. Please try again.",
    is403 ? "fas fa-lock" : "fas fa-exclamation-circle",
    is403 ? "#f39c12" : "#e74c3c",
  );
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
  ["btn-logout", "logoBtn"].forEach((id) => {
    document.getElementById(id)?.addEventListener("click", handleLogout);
  });

  document.getElementById("menuBtn").addEventListener("click", toggleSidebar);
  document.getElementById("overlay").addEventListener("click", closeSidebar);

  document
    .getElementById("contentModeBtn")
    ?.addEventListener("click", () => switchMode("content"));
  document
    .getElementById("qaModeBtn")
    ?.addEventListener("click", () => switchMode("qa"));

  document.getElementById("backBtn").addEventListener("click", backToWelcome);
  document
    .getElementById("bookmarkBtn")
    .addEventListener("click", bookmarkContent);
  document
    .getElementById("printBtn")
    .addEventListener("click", () => window.print());
  document
    .getElementById("submitExerciseBtn")
    .addEventListener("click", submitExercise);

  document
    .getElementById("prevBtn")
    .addEventListener("click", previousQuestion);
  document.getElementById("nextBtn").addEventListener("click", nextQuestion);
  document.getElementById("submitBtn").addEventListener("click", submitQuiz);

  document
    .getElementById("reviewAnswersBtn")
    .addEventListener("click", reviewAnswers);
  document
    .getElementById("retakeQuizBtn")
    .addEventListener("click", retakeQuiz);
  document
    .getElementById("backToTopicsBtn")
    .addEventListener("click", backToQuizSelection);
  document
    .getElementById("viewReportBtn")
    .addEventListener("click", showQuizReport);
}

async function handleLogout() {
  await FetchData("/logout", true);
  localStorage.removeItem("authToken");
  window.location.href = "../auth/login.html";
}

function setupAvatarDropdown() {
  const avatarBtn = document.getElementById("avatarBtn");
  const avatarDropdown = document.getElementById("avatarDropdown");
  if (!avatarBtn || !avatarDropdown) return;

  avatarBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = avatarDropdown.classList.toggle("open");
    avatarBtn.setAttribute("aria-expanded", isOpen);
  });

  document.addEventListener("click", () => {
    avatarDropdown.classList.remove("open");
    avatarBtn.setAttribute("aria-expanded", false);
  });

  avatarDropdown.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      avatarDropdown.classList.remove("open");
      avatarBtn.setAttribute("aria-expanded", false);
    });
  });
}

function setupScrollBehaviour() {
  const header = document.querySelector(".dash-topbar");
  if (!header) return;
  let lastScrollY = window.scrollY;
  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollY && currentScrollY > 80)
      header.classList.add("hide");
    else header.classList.remove("hide");
    header.classList.toggle("scrolled", currentScrollY > 20);
    lastScrollY = currentScrollY;
  });
}

// ============================================
// CONTENT MODE — SIDEBAR
// ============================================

async function loadContentSidebar() {
  const topicsNav = document.getElementById("topicsNav");
  topicsNav.innerHTML = `<div style="padding:20px;color:#9ca3af;font-size:13px;"><i class="fas fa-spinner fa-spin"></i> Loading topics...</div>`;

  const res = await FetchData("/topic", true);
  if (!res.success) {
    topicsNav.innerHTML = `<div style="padding:20px;color:#9ca3af;font-size:13px;">Failed to load topics.</div>`;
    _showApiError(res);
    return;
  }

  const topics = res.data?.data ?? [];
  if (!topics.length) {
    topicsNav.innerHTML = `<div style="padding:20px;color:#9ca3af;font-size:13px;">No topics available yet.</div>`;
    return;
  }

  _allSubtopics = topics.flatMap((t) =>
    (t.subtopics ?? []).map((s) => ({
      topicId: String(t.id),
      topicName: t.name,
      subtopicId: String(s.id),
      subtopicName: s.name,
    })),
  );

  topicsNav.innerHTML = "";
  topics.forEach((topic) => {
    const subtopics = topic.subtopics ?? [];
    const topicDiv = document.createElement("div");
    topicDiv.className = "topic";

    topicDiv.innerHTML = `
      <div class="topic-header">
        <span>${topic.name}</span>
        <span class="topic-icon"><i class="fas fa-chevron-right"></i></span>
      </div>
      <div class="subtopics">
        ${subtopics
          .map(
            (sub) => `
          <a href="#" class="subtopic-link"
             data-topic-id="${_escAttr(topic.id)}"
             data-topic-name="${_escAttr(topic.name)}"
             data-subtopic-id="${_escAttr(sub.id)}"
             data-subtopic-name="${_escAttr(sub.name)}">
            <i class="fas fa-file-alt"></i> ${sub.name}
          </a>`,
          )
          .join("")}
      </div>`;

    topicsNav.appendChild(topicDiv);
  });

  topicsNav.querySelectorAll(".topic-header").forEach((header) => {
    header.addEventListener("click", () => toggleTopic(header));
  });

  topicsNav.querySelectorAll(".subtopic-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      loadContent(e, {
        topicId: link.dataset.topicId,
        topicName: link.dataset.topicName,
        subtopicId: link.dataset.subtopicId,
        subtopicName: link.dataset.subtopicName,
      });
    });
  });
}

function _escAttr(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function toggleTopic(element) {
  const topic = element.parentElement;
  const subtopics = topic.querySelector(".subtopics");
  const isActive = element.classList.contains("active");
  document
    .querySelectorAll(".topic-header")
    .forEach((h) => h.classList.remove("active"));
  document
    .querySelectorAll(".subtopics")
    .forEach((s) => s.classList.remove("open"));
  if (!isActive) {
    element.classList.add("active");
    subtopics.classList.add("open");
  }
}

// ============================================
// CONTENT MODE — LOADING & RENDERING
// ============================================

async function loadContent(event, dataset) {
  const { topicId, topicName, subtopicId, subtopicName } = dataset;

  document
    .querySelectorAll(".subtopic-link")
    .forEach((l) => l.classList.remove("active"));
  event?.target?.closest?.(".subtopic-link")?.classList.add("active");

  document.getElementById("welcomeScreen").style.display = "none";
  document.getElementById("contentDisplay").style.display = "block";
  document.getElementById("contentTitle").textContent = subtopicName;

  const container = document.getElementById("contentContainer");
  container.innerHTML = `<div style="padding:40px;text-align:center;color:#9ca3af;">
    <i class="fas fa-spinner fa-spin" style="font-size:28px;"></i>
    <p style="margin-top:12px;">Loading content...</p></div>`;

  document.getElementById("exerciseSection").style.display = "none";
  _currentExercise = null;

  try {
    if (!_contentCache.sections[subtopicId]) {
      const res = await FetchData(`/sections/${subtopicId}`, true);
      if (!res.success) {
        _showApiError(res);
        return;
      }
      _contentCache.sections[subtopicId] = res.data?.data?.sections ?? [];
    }
    const sections = _contentCache.sections[subtopicId];

    await Promise.all(
      sections.map(async (sec) => {
        if (_contentCache.components[sec.section_id] !== undefined) return;
        const res = await FetchData(
          `/sections/${sec.section_id}/components`,
          true,
        );
        console.log(
          `[components] section ${sec.section_id}:`,
          JSON.stringify(res.data?.data),
        );
        _contentCache.components[sec.section_id] = res.success
          ? (res.data?.data ?? []).map(_normalizeComponent)
          : [];
      }),
    );

    const allComponents = sections
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
      .flatMap((sec) =>
        (_contentCache.components[sec.section_id] ?? []).sort(
          (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0),
        ),
      );

    _renderComponentContent(allComponents, container);
    await _loadExerciseForSubtopic(subtopicName);
    _updateTopicNavFromAPI(subtopicId);
  } catch {
    container.innerHTML = `<div style="padding:40px;text-align:center;color:#dc2626;">
      <i class="fas fa-exclamation-triangle"></i>
      <p style="margin-top:8px;">Failed to load content. Please try again.</p></div>`;
  }

  closeSidebar();
}

function _normalizeComponent(c) {
  const ft = c.format_type ?? c.component_type ?? c.type ?? "";
  const items = (c.items ?? [])
    .slice()
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map((it) => {
      if (it.image_data && it.mimetype) {
        it.image = `data:${it.mimetype};base64,${it.image_data}`;
        delete it.image_data;
        delete it.mimetype;
      }
      return it;
    });
  return { ...c, format_type: ft, items };
}

function _renderComponentContent(components, container) {
  const display = components.filter((c) => c.format_type !== "exercise");
  if (!display.length) {
    container.innerHTML = `<div style="padding:40px;text-align:center;color:#9ca3af;">No content has been added for this topic yet.</div>`;
    return;
  }
  container.innerHTML = display
    .map((comp) => {
      const titleHTML = comp.title
        ? `<h3 class="heading">${comp.component_id}. ${comp.title}</h3>`
        : "";
      return `<div class="component-block" style="margin-bottom:40px;">${titleHTML}${_renderOneComponent(comp)}</div>`;
    })
    .join("");
  initializeFormatInteractions();
}

function _renderOneComponent(comp) {
  const items = comp.items ?? [];
  const mapItems = (fn) => items.map(fn);

  switch (comp.format_type) {
    case "flipcards":
      return renderFlipCards(
        mapItems((it) => ({
          image: it.image ?? null,
          title: it.title ?? "",
          description: it.content ?? "",
        })),
      );
    case "accordion":
      return renderAccordion(
        mapItems((it) => ({
          title: it.title ?? "",
          text: it.content ?? "",
          image: it.image ?? null,
        })),
      );
    case "tabs":
      return renderTabs(
        mapItems((it) => ({
          title: it.title ?? "",
          content: it.content ?? "",
          image: it.image ?? null,
        })),
      );
    case "timeline":
      return renderTimeline(
        mapItems((it) => ({
          title: it.title ?? "",
          description: it.content ?? "",
          image: it.image ?? null,
        })),
      );
    case "image_right":
      return renderImageRight({
        title: items[0]?.title ?? comp.title ?? "",
        text: [items[0]?.content ?? ""],
        image: items[0]?.image ?? null,
      });
    case "image_left":
      return renderImageLeft({
        title: items[0]?.title ?? comp.title ?? "",
        text: [items[0]?.content ?? ""],
        image: items[0]?.image ?? null,
      });
    case "image_overlay":
      return renderImageOverlay({
        title: items[0]?.title ?? comp.title ?? "",
        description: items[0]?.content ?? "",
        image: items[0]?.image ?? null,
      });
    case "imageblock": {
      const img = items[0]?.image ?? null;
      const caption = items[0]?.caption ?? "";
      return `<div style="text-align:center;margin-bottom:30px;">
        ${img ? `<img src="${img}" alt="${_escAttr(caption)}" style="max-width:100%;border-radius:var(--radius);box-shadow:var(--shadow);">` : ""}
        ${caption ? `<p style="margin-top:8px;font-size:13px;color:#6b7280;font-style:italic;">${caption}</p>` : ""}
      </div>`;
    }
    default:
      return "";
  }
}

async function _loadExerciseForSubtopic(subtopicName) {
  const res = await FetchData(
    `/exercise?topic=${encodeURIComponent(subtopicName)}`,
    true,
  );
  console.log("[exercise]", JSON.stringify(res.data?.data));
  if (!res.success) return;

  const questionIds = res.data?.data?.questions ?? [];
  if (!questionIds.length) return;

  const results = await Promise.allSettled(
    questionIds.map((id) => FetchData(`/question/${id}`, true)),
  );
  console.log("[exercise questions]", JSON.stringify(results));
  const questions = results
    .filter((r) => r.status === "fulfilled" && r.value?.success === true)
    .map((r) => {
      console.log(
        "[question/:id] data.data:",
        JSON.stringify(r.value.data?.data),
      );
      const payload = r.value.data?.data;
      // Backend may return the question object directly, or wrapped as { question: {...} }
      return _normalizeQuestion(payload?.question ?? payload);
    });

  if (!questions.length) return;

  _currentExercise = { questions };
  renderExercise(_currentExercise);
}

function _updateTopicNavFromAPI(subtopicId) {
  const idx = _allSubtopics.findIndex(
    (s) => String(s.subtopicId) === String(subtopicId),
  );

  // Clone buttons to drop any stale listeners
  const prevBtn = document.getElementById("prevTopicBtn");
  const nextBtn = document.getElementById("nextTopicBtn");
  const newPrev = prevBtn.cloneNode(true);
  const newNext = nextBtn.cloneNode(true);
  prevBtn.parentNode.replaceChild(newPrev, prevBtn);
  nextBtn.parentNode.replaceChild(newNext, nextBtn);

  if (idx > 0) {
    const prev = _allSubtopics[idx - 1];
    newPrev.style.display = "flex";
    newPrev.addEventListener("click", () =>
      loadContent({ target: { closest: () => null } }, prev),
    );
  } else {
    newPrev.style.display = "none";
  }

  if (idx !== -1 && idx < _allSubtopics.length - 1) {
    const next = _allSubtopics[idx + 1];
    newNext.style.display = "flex";
    newNext.addEventListener("click", () =>
      loadContent({ target: { closest: () => null } }, next),
    );
  } else {
    newNext.style.display = "none";
  }
}

// ============================================
// FORMAT RENDERERS
// ============================================

function renderFlipCards(cards) {
  return `<div class="format-flip-cards">${cards
    .map(
      (card) => `
    <div class="flip-card">
      <div class="flip-card-inner">
        <div class="flip-card-front">
          <img src="${card.image}" alt="${card.title}"><h4>${card.title}</h4>
        </div>
        <div class="flip-card-back"><p>${card.description}</p></div>
      </div>
    </div>`,
    )
    .join("")}</div>`;
}

function renderImageRight(content) {
  return `<div class="format-image-right">
    <div class="text-content"><h3>${content.title}</h3>${content.text.map((p) => `<p>${p}</p>`).join("")}</div>
    <div class="image-content"><img src="${content.image}" alt="${content.title}"></div>
  </div>`;
}

function renderImageLeft(content) {
  return `<div class="format-image-left">
    <div class="image-content"><img src="${content.image}" alt="${content.title}"></div>
    <div class="text-content"><h3>${content.title}</h3>${content.text.map((p) => `<p>${p}</p>`).join("")}</div>
  </div>`;
}

function renderImageOverlay(content) {
  return `<div class="format-image-overlay">
    <img src="${content.image}" alt="${content.title}">
    <div class="overlay-content"><h3>${content.title}</h3><p>${content.description}</p></div>
  </div>`;
}

function renderAccordion(sections) {
  return `<div class="format-accordion">${sections
    .map(
      (section, index) => `
    <div class="accordion-item ${index === 0 ? "active" : ""}">
      <div class="accordion-header">
        <h4>${section.title}</h4>
        <i class="fas fa-chevron-down accordion-icon"></i>
      </div>
      <div class="accordion-content">
        <div class="accordion-body">
          <p>${section.text}</p>
          ${section.image ? `<img src="${section.image}" alt="${section.title}">` : ""}
        </div>
      </div>
    </div>`,
    )
    .join("")}</div>`;
}

function renderTabs(tabs) {
  return `<div class="format-tabs">
    <div class="tab-headers">${tabs.map((tab, i) => `<button class="tab-header ${i === 0 ? "active" : ""}" data-tab-index="${i}">${tab.title}</button>`).join("")}</div>
    ${tabs
      .map(
        (tab, i) => `
      <div class="tab-content ${i === 0 ? "active" : ""}" id="tab-${i}">
        <div class="tab-body">
          <h4>${tab.title}</h4><p>${tab.content}</p>
          ${tab.image ? `<img src="${tab.image}" alt="${tab.title}">` : ""}
        </div>
      </div>`,
      )
      .join("")}
  </div>`;
}

function renderTimeline(steps) {
  return `<div class="format-timeline">${steps
    .map(
      (step, i) => `
    <div class="timeline-item">
      <div class="timeline-number">${i + 1}</div>
      <div class="timeline-content">
        <h4>${step.title}</h4><p>${step.description}</p>
        ${step.image ? `<img src="${step.image}" alt="${step.title}">` : ""}
      </div>
    </div>`,
    )
    .join("")}</div>`;
}

// ============================================
// FORMAT INTERACTIONS
// ============================================

function initializeFormatInteractions() {
  document.querySelectorAll(".flip-card").forEach((card) => {
    card.addEventListener("click", () => card.classList.toggle("flipped"));
  });
  document.querySelectorAll(".accordion-header").forEach((header) => {
    header.addEventListener("click", () => {
      const item = header.parentElement;
      const wasActive = item.classList.contains("active");
      document
        .querySelectorAll(".accordion-item")
        .forEach((i) => i.classList.remove("active"));
      if (!wasActive) item.classList.add("active");
    });
  });
  document.querySelectorAll(".tab-header").forEach((button) => {
    button.addEventListener("click", () => {
      document
        .querySelectorAll(".tab-header")
        .forEach((h) => h.classList.remove("active"));
      document
        .querySelectorAll(".tab-content")
        .forEach((c) => c.classList.remove("active"));
      button.classList.add("active");
      document
        .getElementById(`tab-${button.dataset.tabIndex}`)
        .classList.add("active");
    });
  });
  document.querySelector(".accordion-item")?.classList.add("active");
}

// ============================================
// EXERCISE
// ============================================

function renderExercise(exercise) {
  const exerciseQuestions = document.getElementById("exerciseQuestions");
  exerciseQuestions.innerHTML = exercise.questions
    .map(
      (q, index) => `
    <div class="exercise-question">
      <div class="exercise-question-text">${index + 1}. ${q.question}</div>
      ${
        q.image
          ? `<div class="question-image-container" style="text-align:center;margin:10px 0;">
        <img src="${q.image}" alt="Question image" style="max-width:100%;max-height:260px;border-radius:var(--radius);box-shadow:var(--shadow);">
      </div>`
          : ""
      }
      <div class="exercise-options">${q.options
        .map(
          (option, optIndex) => `
        <div class="exercise-option">
          <input type="radio" name="exercise-${index}" id="exercise-${index}-${optIndex}" value="${optIndex}">
          <label for="exercise-${index}-${optIndex}">${option}</label>
        </div>`,
        )
        .join("")}
      </div>
    </div>`,
    )
    .join("");

  document.getElementById("exerciseSection").style.display = "block";
  document.getElementById("exerciseResults").style.display = "none";
}

function submitExercise() {
  const exercise = _currentExercise;
  if (!exercise) return;
  let correctCount = 0;

  exercise.questions.forEach((q, index) => {
    const selected = document.querySelector(
      `input[name="exercise-${index}"]:checked`,
    );
    const options = document.querySelectorAll(
      `input[name="exercise-${index}"]`,
    );
    const correctIdx = q.correctAnswer;

    options.forEach((opt, optIndex) => {
      const parent = opt.parentElement;
      parent.classList.remove("correct", "incorrect");
      if (optIndex === correctIdx) parent.classList.add("correct");
      if (
        selected &&
        parseInt(selected.value) === optIndex &&
        optIndex !== correctIdx
      )
        parent.classList.add("incorrect");
    });

    if (selected && parseInt(selected.value) === correctIdx) correctCount++;
  });

  const percentage = Math.round(
    (correctCount / exercise.questions.length) * 100,
  );
  const resultsDiv = document.getElementById("exerciseResults");
  resultsDiv.innerHTML = `
    <h4>Exercise Results</h4>
    <div class="exercise-score">${percentage}%</div>
    <p>You got ${correctCount} out of ${exercise.questions.length} questions correct!</p>
    ${
      percentage >= 80
        ? '<p style="color:var(--success);font-weight:600;">Great job! You\'ve mastered this topic.</p>'
        : '<p style="color:var(--warning);font-weight:600;">Keep practicing to improve your understanding.</p>'
    }`;
  resultsDiv.style.display = "block";
  resultsDiv.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// ============================================
// QUIZ MODE — SIDEBAR
// ============================================

const TOPIC_ICON_MAP = {
  default: "fas fa-book",
  overview: "fas fa-map",
  "traffic signs": "fas fa-traffic-light",
  "road rules": "fas fa-road",
  technology: "fas fa-microchip",
  physics: "fas fa-atom",
  mathematics: "fas fa-calculator",
  science: "fas fa-flask",
  history: "fas fa-landmark",
  geography: "fas fa-globe",
  biology: "fas fa-dna",
  chemistry: "fas fa-vial",
  english: "fas fa-book-open",
};

function getTopicIcon(topicName) {
  return (
    TOPIC_ICON_MAP[(topicName || "").toLowerCase()] || TOPIC_ICON_MAP.default
  );
}

async function loadQuizSidebar() {
  const quizNav = document.getElementById("quizTopicsNav");
  quizNav.innerHTML = "";

  _appendQuizNavItem(quizNav, {
    icon: "fas fa-map",
    title: "Overview",
    subLabel: "Mixed questions — all topics",
    onClick: () => confirmQuizNavigation(() => fetchAndStartOverviewQuiz()),
  });

  _appendQuizNavItem(quizNav, {
    icon: "fas fa-certificate",
    title: "Latest Police Exam",
    subLabel: "Official exam sessions",
    onClick: () => showExamSelectionScreen(),
  });

  const res = await FetchData("/topic", true);
  if (!res.success) {
    _showApiError(res);
    return;
  }

  (res.data?.data ?? []).forEach((topic) => {
    const topicName = topic.name ?? topic.title ?? "Topic";
    _appendQuizNavItem(quizNav, {
      icon: getTopicIcon(topicName),
      title: topicName,
      subLabel: "Quiz available",
      onClick: () =>
        confirmQuizNavigation(() => fetchAndStartTopicQuiz(topicName)),
    });
  });
}

function _appendQuizNavItem(container, { icon, title, subLabel, onClick }) {
  const div = document.createElement("div");
  div.className = "quiz-topic-item";
  div.innerHTML = `
    <div class="quiz-topic-icon"><i class="${icon}"></i></div>
    <div class="quiz-topic-info"><h4>${title}</h4><p>${subLabel}</p></div>
    <i class="fas fa-chevron-right"></i>`;
  div.addEventListener("click", onClick);
  container.appendChild(div);
}

// ============================================
// QUIZ FETCHERS
// ============================================

async function fetchAndStartOverviewQuiz() {
  const res = await FetchData("/quiz/random", true);
  console.log("[quiz/random overview] request made" ,res);
  console.log(
    "[quiz/random overview] data.data:",
    JSON.stringify(res.data?.data),
  );
  if (!res.success) {
    _showApiError(res);
    return;
  } 
  console.log("[overview quiz] question IDs:", res.data?.data?.questions ?? []);

  const questions = await _fetchQuestionsById(res.data?.data?.questions ?? []);
  console.log("[overview quiz] fetched questions:", questions);
  if (!questions.length) {
    showInfoPopup(
      "No questions available",
      "The overview quiz has no questions right now.",
      "fas fa-inbox",
      "#f59e0b",
    );
    return;
  }

  currentSessionMeta = {
    quiz_id: "overview",
    title: "Overview Quiz",
    topicName: null,
  };
  launchQuiz("overview", "Overview Quiz", questions);
}

async function fetchAndStartTopicQuiz(topicName) {
  const res = await FetchData(
    `/quiz/random?topic=${encodeURIComponent(topicName)}`,
    true,
  );
  if (!res.success) {
    _showApiError(res);
    return;
  }

  const questions = await _fetchQuestionsById(res.data?.data?.questions ?? []);
  if (!questions.length) {
    showInfoPopup(
      "No questions available",
      `There are no questions for <strong>${topicName}</strong> right now.`,
      "fas fa-inbox",
      "#f59e0b",
    );
    return;
  }

  currentSessionMeta = {
    quiz_id: `topic-${topicName}`,
    title: `${topicName} Quiz`,
    topicName,
  };
  launchQuiz(`topic-${topicName}`, `${topicName} Quiz`, questions);
}

async function _fetchQuestionsById(ids) {

  console.log(
    "[questions/batch] fetching questions for ids:",
    ids,"....",
    !ids?.length,
  );
  if (!ids?.length) return [];

  const res = await FetchData(`/questions/batch?ids=${ids.join(",")}`, true);
  console.log("[questions/batch] request ids:", ids);
  console.log("[questions/batch] data.data:", JSON.stringify(res.data?.data));
  if (!res.success) return [];

  const raw = res.data?.data;
  // Backend may return array directly, or wrapped as { questions: [...] }
  const questionsArray = Array.isArray(raw) ? raw : (raw?.questions ?? []);
  if (!questionsArray.length) return [];

  return questionsArray
    .map((q) => {
      try {
        return _normalizeQuestion(q);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

// ============================================
// QUESTION NORMALIZATION
// ============================================

// Single normalizer used by both quiz questions and exercise questions.
// Handles two option shapes:
//   Object shape: options: { A: { id, text }, B: ... }
//   String shape: options: { A: "text", B: "text" }
// and two correct-answer shapes:
//   correctAnswerId (matches an option's id)
//   correctAnswer   (letter "A"–"D" or numeric index)
function _normalizeQuestion(raw) {
  const optionKeys = ["A", "B", "C", "D"];
  const letterMap = { A: 0, B: 1, C: 2, D: 3 };
  const optionIds = [];

  const options = optionKeys.map((key) => {
    const opt = raw.options?.[key];
    if (opt && typeof opt === "object") {
      optionIds.push(opt.id);
      return opt.text ?? "";
    }
    optionIds.push(null);
    return opt ?? "";
  });

  let correctAnswer = 0;
  if (raw.correctAnswerId != null && optionIds.some((id) => id != null)) {
    const i = optionIds.indexOf(raw.correctAnswerId);
    if (i !== -1) correctAnswer = i;
  } else if (
    typeof raw.correctAnswer === "string" &&
    raw.correctAnswer.length === 1
  ) {
    correctAnswer = letterMap[raw.correctAnswer.toUpperCase()] ?? 0;
  } else if (typeof raw.correctAnswer === "number") {
    correctAnswer = raw.correctAnswer;
  }

  const image =
    raw.image && raw.mimetype
      ? `data:${raw.mimetype};base64,${raw.image}`
      : (raw.image ?? null);

  return {
    // quiz fields
    topic: raw.topic ?? raw.topicName ?? raw.topic_name ?? "Quiz",
    subtopic: raw.subtopic ?? raw.subtopicName ?? raw.subtopic_name ?? null,
    // shared fields
    question: raw.statement ?? raw.question ?? "",
    options,
    correctAnswer,
    image,
  };
}

// ============================================
// EXAM SELECTION SCREEN
// ============================================

async function showExamSelectionScreen() {
  document.getElementById("quizStartScreen").style.display = "none";
  document.getElementById("quizInterface").style.display = "none";
  document.getElementById("quizResults").style.display = "none";

  const screen = document.getElementById("examSelectionScreen");
  screen.style.display = "block";
  screen.innerHTML = `
    <div style="padding:24px;max-width:960px;margin:0 auto;">
      <div class="exam-selection-header">
        <button id="backToQuizTopicsBtn" class="exam-start-btn" style="width:auto;padding:8px 16px;">
          <i class="fas fa-arrow-left"></i> Back
        </button>
        <div class="exam-selection-title">
          <i class="fas fa-certificate"></i>
          <div><h1>Police Exams</h1><p>Select an exam session to begin</p></div>
        </div>
      </div>
      <div class="exam-grid" id="examGrid">
        <div class="exam-loading"><i class="fas fa-spinner fa-spin"></i><p>Loading exams...</p></div>
      </div>
    </div>`;

  screen
    .querySelector("#backToQuizTopicsBtn")
    .addEventListener("click", hideExamSelectionScreen);

  const grid = screen.querySelector("#examGrid");
  const res = await FetchData("/quizzes", true);
  console.log("[/quizzes] data.data:", JSON.stringify(res.data?.data));

  if (!res.success) {
    _showApiError(res);
    return;
  }

  const sessions = res.data?.data ?? [];
  if (!sessions.length) {
    grid.innerHTML = `<p class="exam-empty">No exams available yet. Check back later.</p>`;
    return;
  }

  grid.innerHTML = "";
  sessions.forEach((session) => {
    const card = document.createElement("div");
    card.className = "exam-card";
    card.innerHTML = `
      <div class="exam-card-icon"><i class="fas fa-file-alt"></i></div>
      <h3 class="exam-card-title">${session.title}</h3>
      <p class="exam-card-date"><i class="fas fa-calendar-alt"></i> ${formatUserDate(session.publish_date)}</p>
      <div class="exam-card-meta">
        <span class="exam-card-questions"><i class="fas fa-list-ol"></i> ${session.question_count} Questions</span>
      </div>
      <button class="exam-start-btn">Start Exam <i class="fas fa-arrow-right"></i></button>`;

    card.addEventListener("click", async () => {
      if (card.classList.contains("loading")) return;
      const btn = card.querySelector(".exam-start-btn");

      card.classList.add("loading");
      btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Loading...`;
      btn.disabled = true;

      const res = await FetchData(`/quiz/${session.quiz_id}`, true);
      console.log(
        `[/quiz/${session.quiz_id}] data.data:`,
        JSON.stringify(res.data?.data),
      );

      if (!res.success) {
        _showApiError(res);
        card.classList.remove("loading");
        btn.innerHTML = `Start Exam <i class="fas fa-arrow-right"></i>`;
        btn.disabled = false;
        return;
      }

      confirmQuizNavigation(async () => {
        await loadAndStartQuiz(
          session.quiz_id,
          session.title,
          res.data?.data ?? [],
        );
        // Re-enable button if loadAndStartQuiz bails early (no questions)
        card.classList.remove("loading");
        btn.innerHTML = `Start Exam <i class="fas fa-arrow-right"></i>`;
        btn.disabled = false;
      });
    });

    grid.appendChild(card);
  });

  closeSidebar();
}

function hideExamSelectionScreen() {
  document.getElementById("examSelectionScreen").style.display = "none";
  document.getElementById("quizStartScreen").style.display = "block";
}

function formatUserDate(isoString) {
  return new Date(isoString)
    .toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replace(" at", "");
}

async function loadAndStartQuiz(quizId, quizTitle, questionArray) {
  console.log(`[loadAndStartQuiz] Loading quiz "${quizTitle}" with question IDs:`, questionArray);
  const questions = await _fetchQuestionsById(questionArray.questions ?? []);
  console.log("[loadAndStartQuiz] loaded questions:", questions);
  if (!questions.length) {
    showInfoPopup(
      "No questions available",
      "This exam has no questions that could be loaded. Please try another session.",
      "fas fa-inbox",
      "#f59e0b",
    );
    return;
  }
  currentSessionMeta = { quiz_id: quizId, title: quizTitle };
  launchQuiz(quizId, quizTitle, questions);
}

// ============================================
// POPUP HELPERS
// ============================================

function createBasePopup({
  title = "",
  message = "",
  icon = "fas fa-info-circle",
  iconColor = "",
  confirmText = "Yes",
  cancelText = "No",
  showCancel = true,
  showConfirm = true,
  onConfirm = () => {},
  onCancel = () => {},
  confirmBtnStyle = "",
  cancelBtnStyle = "",
}) {
  document.getElementById("progressWarningOverlay")?.remove();
  const overlay = document.createElement("div");
  overlay.id = "progressWarningOverlay";
  const iconStyle = iconColor ? `style="color:${iconColor}"` : "";

  overlay.innerHTML = `
    <div id="progressWarningBox">
      <div class="pw-icon" ${iconStyle}><i class="${icon}"></i></div>
      <h3>${title}</h3>
      <p>${message}</p>
      <div class="pw-actions">
        ${showCancel ? `<button class="pw-btn pw-btn-cancel"  style="${cancelBtnStyle}">${cancelText}</button>` : ""}
        ${showConfirm ? `<button class="pw-btn pw-btn-confirm" style="${confirmBtnStyle}">${confirmText}</button>` : ""}
      </div>
    </div>`;

  document.body.appendChild(overlay);
  const close = () => overlay.remove();

  if (showCancel)
    overlay.querySelector(".pw-btn-cancel").addEventListener("click", () => {
      close();
      onCancel();
    });
  if (showConfirm)
    overlay.querySelector(".pw-btn-confirm").addEventListener("click", () => {
      close();
      onConfirm();
    });
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
}

function confirmQuizNavigation(onConfirm) {
  const quizInterfaceVisible =
    document.getElementById("quizInterface")?.style.display !== "none";
  const inProgress =
    currentQuiz && quizInterfaceVisible && currentQuiz.reviewMode !== true;

  if (!inProgress) {
    onConfirm();
    return;
  }

  const answered = userAnswers.filter((a) => a !== null).length;
  const total = currentQuiz.questions.length;

  createBasePopup({
    title: "Quiz in progress!",
    message: `You have answered <strong>${answered}</strong> of <strong>${total}</strong> questions.<br>Leaving now will lose all your progress.`,
    icon: "fas fa-exclamation-triangle",
    confirmText: "Yes, leave",
    cancelText: "Keep going",
    onConfirm: () => {
      clearInterval(timerInterval);
      onConfirm();
    },
  });
}

function showInfoPopup(
  title,
  message,
  icon = "fas fa-info-circle",
  iconColor = "#0097b2",
) {
  createBasePopup({
    title,
    message,
    icon,
    iconColor,
    showConfirm: false,
    cancelText: "OK",
    cancelBtnStyle: "background:#0097b2;color:#fff;",
  });
}

// ============================================
// QUIZ ENGINE
// ============================================

function launchQuiz(id, title, questions) {
  currentQuiz = { id, title, questions };
  currentQuestionIndex = 0;
  userAnswers = new Array(questions.length).fill(null);

  document.getElementById("examSelectionScreen").style.display = "none";
  document.getElementById("quizStartScreen").style.display = "none";
  document.getElementById("quizInterface").style.display = "block";
  document.getElementById("quizResults").style.display = "none";
  document.getElementById("quizReportScreen").style.display = "none";

  renderQuestionNavGrid();
  quizStartTime = Date.now();
  quizTimeLimitMs = Math.round(questions.length * 0.9 * 60 * 1000);
  startQuizTimer();
  loadQuestion(0);
  closeSidebar();
}

function renderQuestionNavGrid() {
  const grid = document.getElementById("questionNavGrid");
  grid.innerHTML = "";
  let lastSubtopic = null;

  for (let i = 0; i < currentQuiz.questions.length; i++) {
    const q = currentQuiz.questions[i];
    const subtopicLabel = q.subtopic ?? null;

    if (subtopicLabel && subtopicLabel !== lastSubtopic) {
      const divider = document.createElement("div");
      divider.className = "question-nav-divider";
      divider.textContent = subtopicLabel;
      divider.title = subtopicLabel;
      grid.appendChild(divider);
      lastSubtopic = subtopicLabel;
    }

    const btn = document.createElement("button");
    btn.className = "question-nav-btn";
    btn.textContent = i + 1;
    btn.title = subtopicLabel
      ? `${subtopicLabel} — Q${i + 1}`
      : `Question ${i + 1}`;
    if (i === 0) btn.classList.add("current");
    btn.addEventListener("click", () => loadQuestion(i));
    grid.appendChild(btn);
  }
}

function loadQuestion(index) {
  currentQuestionIndex = index;
  const question = currentQuiz.questions[index];

  document.getElementById("currentQuestion").textContent = index + 1;
  document.getElementById("totalQuestions").textContent =
    currentQuiz.questions.length;
  document.getElementById("progressFill").style.width =
    `${((index + 1) / currentQuiz.questions.length) * 100}%`;

  document.querySelectorAll(".question-nav-btn").forEach((btn, i) => {
    btn.classList.toggle("current", i === index);
  });

  document.getElementById("questionTopic").textContent = question.topic;

  const topicEl = document.getElementById("questionTopic");
  if (topicEl && !document.getElementById("questionSubtopicBadge")) {
    const badge = document.createElement("span");
    badge.id = "questionSubtopicBadge";
    topicEl.parentNode.insertBefore(badge, topicEl.nextSibling);
  }
  const subtopicBadgeEl = document.getElementById("questionSubtopicBadge");
  if (subtopicBadgeEl) {
    subtopicBadgeEl.textContent = question.subtopic ?? "";
    subtopicBadgeEl.style.display = question.subtopic ? "inline-flex" : "none";
  }

  document.getElementById("questionText").textContent = question.question;

  const imageContainer = document.getElementById("questionImageContainer");
  if (question.image) {
    document.getElementById("questionImage").src = question.image;
    imageContainer.style.display = "block";
  } else {
    imageContainer.style.display = "none";
  }

  const optionsContainer = document.getElementById("answerOptions");
  const letters = ["A", "B", "C", "D"];
  const isReview = currentQuiz.reviewMode === true;

  optionsContainer.innerHTML = question.options
    .map((option, i) => {
      const isCorrect = i === question.correctAnswer;
      const isUserAnswer = userAnswers[index] === i;
      let reviewClass = "";
      if (isReview) {
        if (isCorrect) reviewClass = " review-correct";
        else if (isUserAnswer && !isCorrect) reviewClass = " review-wrong";
      }
      return `
      <div class="answer-option${isReview ? " review-mode" : ""}${reviewClass}" data-option-index="${i}">
        <input type="radio" name="answer" id="answer${i}" value="${i}"
          ${isUserAnswer ? "checked" : ""} ${isReview ? "disabled" : ""}>
        <label for="answer${i}">
          <span class="option-letter">${letters[i]}</span>
          <span class="option-text">${option}</span>
        </label>
      </div>`;
    })
    .join("");

  if (!isReview) {
    optionsContainer.querySelectorAll(".answer-option").forEach((optionEl) => {
      optionEl.addEventListener("click", () =>
        selectAnswer(parseInt(optionEl.dataset.optionIndex)),
      );
    });
  }

  document.getElementById("prevBtn").disabled = index === 0;
  const isLast = index === currentQuiz.questions.length - 1;
  document.getElementById("nextBtn").style.display = isLast ? "none" : "flex";
  document.getElementById("submitBtn").style.display = isLast ? "flex" : "none";
  updateNavigationButtons();
}

function selectAnswer(optionIndex) {
  userAnswers[currentQuestionIndex] = optionIndex;
  document
    .querySelectorAll(".question-nav-btn")
    [currentQuestionIndex].classList.add("answered");
  updateNavigationButtons();
}

function updateNavigationButtons() {
  const hasAnswer = userAnswers[currentQuestionIndex] !== null;
  const isLast = currentQuestionIndex === currentQuiz.questions.length - 1;
  document.getElementById(isLast ? "submitBtn" : "nextBtn").disabled =
    !hasAnswer;
}

function previousQuestion() {
  if (currentQuestionIndex > 0) loadQuestion(currentQuestionIndex - 1);
}

function nextQuestion() {
  if (currentQuestionIndex < currentQuiz.questions.length - 1)
    loadQuestion(currentQuestionIndex + 1);
}

function startQuizTimer() {
  clearInterval(timerInterval);
  const timerEl = document.getElementById("quizTimer");

  timerInterval = setInterval(() => {
    const elapsed = Date.now() - quizStartTime;
    const remaining = Math.max(0, quizTimeLimitMs - elapsed);
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    timerEl.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    const wrap = timerEl.closest("#quizCountdownWrap") ?? timerEl;
    wrap.classList.toggle("warning", remaining <= 60000);
    wrap.classList.toggle("caution", remaining > 60000 && remaining <= 180000);

    if (remaining === 0) {
      clearInterval(timerInterval);
      submitQuiz();
    }
  }, 1000);
}

function submitQuiz() {
  clearInterval(timerInterval);
  const totalTime = Date.now() - quizStartTime;
  const minutes = Math.floor(totalTime / 60000);
  const seconds = Math.floor((totalTime % 60000) / 1000);

  let correctCount = 0;
  currentQuiz.questions.forEach((q, index) => {
    if (userAnswers[index] === q.correctAnswer) correctCount++;
  });

  const percentage = Math.round(
    (correctCount / currentQuiz.questions.length) * 100,
  );
  const incorrectCount = currentQuiz.questions.length - correctCount;

  document.querySelectorAll(".question-nav-btn").forEach((btn, i) => {
    btn.classList.remove("current", "answered");
    btn.classList.add(
      userAnswers[i] === currentQuiz.questions[i].correctAnswer
        ? "correct"
        : "incorrect",
    );
  });

  document.getElementById("quizInterface").style.display = "none";
  document.getElementById("quizResults").style.display = "block";

  document.getElementById("scorePercentage").textContent = percentage + "%";
  document.getElementById("scoreRatio").textContent =
    `${correctCount}/${currentQuiz.questions.length}`;
  document.getElementById("correctCount").textContent = correctCount;
  document.getElementById("incorrectCount").textContent = incorrectCount;
  document.getElementById("totalTime").textContent =
    `${minutes}:${String(seconds).padStart(2, "0")}`;

  const circumference = 2 * Math.PI * 90;
  document.getElementById("scoreCircle").style.strokeDashoffset =
    circumference - (percentage / 100) * circumference;

  const icon = document.getElementById("resultsIcon");
  const message = document.getElementById("resultsMessage");
  icon.classList.add("results-icon");

  const tiers = [
    {
      min: 90,
      cls: "excellent",
      html: '<i class="fas fa-trophy"></i>',
      msg: "Excellent! You're ready for the road!",
    },
    {
      min: 75,
      cls: "good",
      html: '<i class="fas fa-star"></i>',
      msg: "Good job! Keep practicing!",
    },
    {
      min: 60,
      cls: "fair",
      html: '<i class="fas fa-thumbs-up"></i>',
      msg: "Not bad! Review and try again.",
    },
    {
      min: 0,
      cls: "poor",
      html: '<i class="fas fa-book"></i>',
      msg: "Keep studying! You'll get there.",
    },
  ];
  const tier = tiers.find((t) => percentage >= t.min);
  icon.classList.add(tier.cls);
  icon.innerHTML = tier.html;
  message.textContent = tier.msg;

  buildQuizReport(correctCount, incorrectCount, percentage, minutes, seconds);
}

function reviewAnswers() {
  currentQuiz.reviewMode = true;
  document.getElementById("quizResults").style.display = "none";
  document.getElementById("quizInterface").style.display = "block";
  loadQuestion(0);
}

async function retakeQuiz() {
  if (currentSessionMeta?.topicName) {
    await fetchAndStartTopicQuiz(currentSessionMeta.topicName);
    return;
  }
  // Fallback: re-use the already-loaded question list
  launchQuiz(currentQuiz.id, currentQuiz.title, currentQuiz.questions);
}

function backToQuizSelection() {
  document.getElementById("quizResults").style.display = "none";
  if (!currentSessionMeta || currentSessionMeta.topicName) {
    document.getElementById("quizStartScreen").style.display = "block";
  } else {
    showExamSelectionScreen();
  }
}

// ============================================
// QUIZ REPORT
// ============================================

function buildQuizReport(
  correctCount,
  incorrectCount,
  percentage,
  minutes,
  seconds,
) {
  const reportScreen = document.getElementById("quizReportScreen");
  reportScreen.style.display = "none";
  const totalQ = currentQuiz.questions.length;
  const letters = ["A", "B", "C", "D"];

  const questionsHTML = currentQuiz.questions
    .map((q, idx) => {
      const userAnswer = userAnswers[idx];
      const isCorrect = userAnswer === q.correctAnswer;
      const blockClass = isCorrect ? "rq-correct" : "rq-wrong";
      const icon = isCorrect
        ? `<i class="fas fa-check-circle rq-status-icon"></i>`
        : `<i class="fas fa-times-circle rq-status-icon"></i>`;

      const optionsHTML = q.options
        .map((opt, oi) => {
          const isCorrectOpt = oi === q.correctAnswer;
          const isUserWrong = oi === userAnswer && !isCorrectOpt;
          let optClass = "";
          if (isCorrectOpt) optClass = " rq-opt-correct";
          else if (isUserWrong) optClass = " rq-opt-user-wrong";
          return `
        <div class="rq-option${optClass}">
          <span class="rq-option-letter">${letters[oi]}</span>
          <span>${opt}</span>
          ${isCorrectOpt ? '<span style="margin-left:auto;font-size:0.75rem;color:#16a34a;font-weight:700;">✓ Correct</span>' : ""}
          ${isUserWrong ? '<span style="margin-left:auto;font-size:0.75rem;color:#dc2626;font-weight:700;">✗ Your answer</span>' : ""}
        </div>`;
        })
        .join("");

      return `
      <div class="report-question-block ${blockClass}">
        <div class="rq-meta">
          <div class="rq-num">${idx + 1}</div>${icon}
          <span style="font-size:0.78rem;color:#6b7280;">${q.topic ?? ""}</span>
        </div>
        ${q.image ? `<img class="rq-image" src="${q.image}" alt="question image">` : ""}
        <div class="rq-question-text">${q.question}</div>
        <div class="rq-options">${optionsHTML}</div>
      </div>`;
    })
    .join("");

  reportScreen.innerHTML = `
    <div class="report-header">
      <h2><i class="fas fa-clipboard-list" style="color:#0097b2;margin-right:8px;"></i>Quiz Report — ${currentQuiz.title}</h2>
      <button class="report-close-btn" id="closeReportBtn"><i class="fas fa-arrow-left"></i> Back to Results</button>
    </div>
    <div class="report-summary">
      <div class="report-stat"><div class="rs-val" style="color:#0097b2;">${percentage}%</div><div class="rs-lbl">Score</div></div>
      <div class="report-stat"><div class="rs-val" style="color:#16a34a;">${correctCount}</div><div class="rs-lbl">Correct</div></div>
      <div class="report-stat"><div class="rs-val" style="color:#dc2626;">${incorrectCount}</div><div class="rs-lbl">Wrong</div></div>
      <div class="report-stat"><div class="rs-val">${totalQ}</div><div class="rs-lbl">Total</div></div>
      <div class="report-stat"><div class="rs-val">${minutes}:${String(seconds).padStart(2, "0")}</div><div class="rs-lbl">Time taken</div></div>
    </div>
    ${questionsHTML}
    <div style="text-align:center;margin-top:24px;">
      <button class="report-close-btn" id="closeReportBtn2"><i class="fas fa-arrow-left"></i> Back to Results</button>
    </div>`;

  const closeReport = () => {
    reportScreen.style.display = "none";
    document.getElementById("quizResults").style.display = "block";
  };
  reportScreen
    .querySelector("#closeReportBtn")
    .addEventListener("click", closeReport);
  reportScreen
    .querySelector("#closeReportBtn2")
    .addEventListener("click", closeReport);
}

function showQuizReport() {
  document.getElementById("quizResults").style.display = "none";
  document.getElementById("quizReportScreen").style.display = "block";
}

// ============================================
// MODE SWITCHING & UI HELPERS
// ============================================

function switchMode(mode) {
  currentMode = mode;
  document
    .querySelectorAll(".mode-btn")
    .forEach((btn) => btn.classList.remove("active"));

  const isContent = mode === "content";
  document
    .getElementById("contentModeBtn")
    .classList.toggle("active", isContent);
  document.getElementById("qaModeBtn").classList.toggle("active", !isContent);
  document.getElementById("dashTitle").textContent = isContent
    ? "Dashboard - Content Mode"
    : "Dashboard - Q&A Mode";
  document
    .getElementById("contentSidebar")
    .classList.toggle("active", isContent);
  document.getElementById("qaSidebar").classList.toggle("active", !isContent);
  document
    .getElementById("contentModeView")
    .classList.toggle("active", isContent);
  document.getElementById("qaModeView").classList.toggle("active", !isContent);
  closeSidebar();
}

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("active");
  document.getElementById("overlay").classList.toggle("active");
}

function closeSidebar() {
  document.getElementById("sidebar").classList.remove("active");
  document.getElementById("overlay").classList.remove("active");
}

function backToWelcome() {
  document.getElementById("contentDisplay").style.display = "none";
  document.getElementById("welcomeScreen").style.display = "block";
  document
    .querySelectorAll(".subtopic-link")
    .forEach((link) => link.classList.remove("active"));
}

function bookmarkContent() {
  showInfoPopup(
    "Coming Soon",
    "Bookmarks will be available in a future update.",
    "fas fa-bookmark",
    "#0097b2",
  );
}
