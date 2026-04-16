// ===== IMPORTS (COMMENTED OUT FOR SIMULATION) =====
// import { FetchData, PostData, DeleteData, UpdateData } from "../js/api/crud.js";

// =============================================================================
// ███████╗██╗███╗   ███╗██╗   ██╗██╗      █████╗ ████████╗███████╗██████╗
// ██╔════╝██║████╗ ████║██║   ██║██║     ██╔══██╗╚══██╔══╝██╔════╝██╔══██╗
// ███████╗██║██╔████╔██║██║   ██║██║     ███████║   ██║   █████╗  ██║  ██║
// ╚════██║██║██║╚██╔╝██║██║   ██║██║     ██╔══██║   ██║   ██╔══╝  ██║  ██║
// ███████║██║██║ ╚═╝ ██║╚██████╔╝███████╗██║  ██║   ██║   ███████╗██████╔╝
// ╚══════╝╚═╝╚═╝     ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═════╝
//
//  API SIMULATION LAYER
//  Replaces the real FetchData / PostData / DeleteData / UpdateData imports.
//  All mock data is defined here. Functions mimic the real API shape:
//    { success: true, status: 200, data: { ... } }
//
//  SECTION MAP
//  ─────────────────────────────────────────────────────────────────────────
//  [1] MOCK DATA STORE   – in-memory tables (users, topics, questions, quizzes)
//  [2] HELPERS           – id generator, delay, route matcher
//  [3] FetchData()       – GET simulation
//  [4] PostData()        – POST simulation
//  [5] UpdateData()      – PUT/PATCH simulation
//  [6] DeleteData()      – DELETE simulation
// =============================================================================


// ─────────────────────────────────────────────────────────────────────────────
// [1]  MOCK DATA STORE
//      Edit these arrays to change what shows up in the dashboard.
// ─────────────────────────────────────────────────────────────────────────────

let _mockTopics = [
  {
    id: 1,
    name: "Mathematics",
    description: "Core mathematical concepts and problem solving",
    subtopics: [
      { id: 101, name: "Algebra" },
      { id: 102, name: "Geometry" },
      { id: 103, name: "Calculus" },
    ],
  },
  {
    id: 2,
    name: "Science",
    description: "Natural sciences including physics, chemistry and biology",
    subtopics: [
      { id: 201, name: "Physics" },
      { id: 202, name: "Chemistry" },
      { id: 203, name: "Biology" },
    ],
  },
  {
    id: 3,
    name: "History",
    description: "World and regional history across different eras",
    subtopics: [
      { id: 301, name: "Ancient History" },
      { id: 302, name: "Modern History" },
    ],
  },
  {
    id: 4,
    name: "Technology",
    description: "Computer science and digital literacy",
    subtopics: [
      { id: 401, name: "Programming" },
      { id: 402, name: "Networking" },
      { id: 403, name: "Databases" },
    ],
  },
];

let _mockQuestions = [
  {
    question_id: 1,
    content: "What is the derivative of x²?",
    statement: "What is the derivative of x²?",
    topic_id: 103,
    topicId: 103,
    correctAnswer: "A",
    image: null,
    options: {
      A: { id: 11, text: "2x" },
      B: { id: 12, text: "x²" },
      C: { id: 13, text: "2" },
      D: { id: 14, text: "x" },
    },
  },
  {
    question_id: 2,
    content: "What is Newton's second law of motion?",
    statement: "What is Newton's second law of motion?",
    topic_id: 201,
    topicId: 201,
    correctAnswer: "B",
    image: null,
    options: {
      A: { id: 21, text: "Every action has an equal and opposite reaction" },
      B: { id: 22, text: "Force equals mass times acceleration (F = ma)" },
      C: { id: 23, text: "An object in motion stays in motion" },
      D: { id: 24, text: "Energy cannot be created or destroyed" },
    },
  },
  {
    question_id: 3,
    content: "What is the chemical symbol for water?",
    statement: "What is the chemical symbol for water?",
    topic_id: 202,
    topicId: 202,
    correctAnswer: "C",
    image: null,
    options: {
      A: { id: 31, text: "HO" },
      B: { id: 32, text: "H₃O" },
      C: { id: 33, text: "H₂O" },
      D: { id: 34, text: "OH₂" },
    },
  },
  {
    question_id: 4,
    content: "In which year did World War II end?",
    statement: "In which year did World War II end?",
    topic_id: 302,
    topicId: 302,
    correctAnswer: "D",
    image: null,
    options: {
      A: { id: 41, text: "1943" },
      B: { id: 42, text: "1944" },
      C: { id: 43, text: "1946" },
      D: { id: 44, text: "1945" },
    },
  },
  {
    question_id: 5,
    content: "What does SQL stand for?",
    statement: "What does SQL stand for?",
    topic_id: 403,
    topicId: 403,
    correctAnswer: "A",
    image: null,
    options: {
      A: { id: 51, text: "Structured Query Language" },
      B: { id: 52, text: "Simple Query Language" },
      C: { id: 53, text: "Sequential Query Logic" },
      D: { id: 54, text: "Standard Query Library" },
    },
  },
  {
    question_id: 6,
    content: "What is the Pythagorean theorem?",
    statement: "What is the Pythagorean theorem?",
    topic_id: 102,
    topicId: 102,
    correctAnswer: "B",
    image: null,
    options: {
      A: { id: 61, text: "a² + b² = c" },
      B: { id: 62, text: "a² + b² = c²" },
      C: { id: 63, text: "a + b = c²" },
      D: { id: 64, text: "a² - b² = c²" },
    },
  },
  {
    question_id: 7,
    content: "What is the powerhouse of the cell?",
    statement: "What is the powerhouse of the cell?",
    topic_id: 203,
    topicId: 203,
    correctAnswer: "C",
    image: null,
    options: {
      A: { id: 71, text: "Nucleus" },
      B: { id: 72, text: "Ribosome" },
      C: { id: 73, text: "Mitochondria" },
      D: { id: 74, text: "Golgi apparatus" },
    },
  },
];

let _mockUsers = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    role: "admin",
    is_active: true,
    deleted_at: null,
    joined: "2024-01-15",
    status: "active",
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob.smith@example.com",
    role: "user",
    is_active: true,
    deleted_at: null,
    joined: "2024-02-20",
    status: "active",
  },
  {
    id: 3,
    name: "Carol White",
    email: "carol.white@example.com",
    role: "user",
    is_active: true,
    deleted_at: null,
    joined: "2024-03-05",
    status: "active",
  },
  {
    id: 4,
    name: "David Brown",
    email: "david.brown@example.com",
    role: "user",
    is_active: false,
    deleted_at: "2024-09-01",
    joined: "2024-04-10",
    status: "inactive",
  },
  {
    id: 5,
    name: "Eva Martinez",
    email: "eva.martinez@example.com",
    role: "user",
    is_active: true,
    deleted_at: null,
    joined: "2024-05-18",
    status: "active",
  },
  {
    id: 6,
    name: "Frank Lee",
    email: "frank.lee@example.com",
    role: "admin",
    is_active: true,
    deleted_at: null,
    joined: "2024-06-22",
    status: "active",
  },
];

let _mockQuizzes = [
  {
    quiz_id: 1,
    title: "Mathematics Fundamentals",
    description: "A quiz covering algebra and geometry basics",
    question_count: 3,
    publish_date: "2024-11-01",
    questions: [1, 2, 6],
  },
  {
    quiz_id: 2,
    title: "Science Essentials",
    description: "Core physics, chemistry and biology questions",
    question_count: 3,
    publish_date: "2024-11-15",
    questions: [2, 3, 7],
  },
  {
    quiz_id: 3,
    title: "Technology Basics",
    description: "Introduction to programming and databases",
    question_count: 2,
    publish_date: "2024-12-01",
    questions: [5, 6],
  },
];

// Stats used by the charts endpoint
const _mockStats = {
  topics: {
    stats: [],
    labels: ["Mathematics", "Science", "History", "Technology"],
    data: [3, 3, 1, 2],
    colors: ["#0097b2", "#e74c3c", "#f39c12", "#27ae60"],
  },
};

// Auto-increment ID counters
let _nextTopicId      = 10;
let _nextSubtopicId   = 900;
let _nextQuestionId   = 20;
let _nextQuizId       = 10;
let _nextUserId       = 20;
let _nextOptionId     = 500;


// ─────────────────────────────────────────────────────────────────────────────
// [2]  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Simulates network latency (80–220 ms) */
function _delay(ms = 80 + Math.random() * 140) {
  return new Promise((res) => setTimeout(res, ms));
}

/** Standard success envelope */
function _ok(data) {
  return { success: true, status: 200, data };
}

/** Standard error envelope */
function _err(status, userMessage) {
  return { success: false, status, userMessage };
}


// ─────────────────────────────────────────────────────────────────────────────
// [3]  FetchData  (simulates GET requests)
//
//  Supported routes:
//    /topic              → list all topics
//    /topic/:id          → single topic or subtopic by id
//    /questions          → list all questions
//    /question/:id       → single question
//    /users              → list all users
//    /quizzes            → list all quizzes (summary)
//    /quiz-admin/:id     → single quiz with question id array
//    /stats/topics       → chart data
//    /logout             → clears fake token
// ─────────────────────────────────────────────────────────────────────────────

async function FetchData(route, _authRequired) {
  await _delay();
  console.log(`[MOCK FetchData] GET ${route}`);

  // --- /topic (all) ---
  if (route === "/topic") {
    return _ok({ topics: JSON.parse(JSON.stringify(_mockTopics)) });
  }

  // --- /topic/:id ---
  const topicMatch = route.match(/^\/topic\/(\d+)$/);
  if (topicMatch) {
    const id = parseInt(topicMatch[1]);
    // Try topics first
    let found = _mockTopics.find((t) => t.id === id);
    if (found) return _ok({ topic: JSON.parse(JSON.stringify(found)) });
    // Try subtopics
    for (const t of _mockTopics) {
      const sub = t.subtopics.find((s) => s.id === id);
      if (sub) return _ok({ topic: JSON.parse(JSON.stringify(sub)) });
    }
    return _err(404, "Topic not found.");
  }

  // --- /questions ---
  if (route === "/questions") {
    return _ok({ questions: JSON.parse(JSON.stringify(_mockQuestions)) });
  }

  // --- /question/:id ---
  const questionMatch = route.match(/^\/question\/(\d+)$/);
  if (questionMatch) {
    const id = parseInt(questionMatch[1]);
    const q = _mockQuestions.find((q) => q.question_id === id);
    if (!q) return _err(404, "Question not found.");
    return _ok({ question: JSON.parse(JSON.stringify(q)) });
  }

  // --- /users ---
  if (route === "/users") {
    return _ok({ users: JSON.parse(JSON.stringify(_mockUsers)) });
  }

  // --- /quizzes ---
  if (route === "/quizzes") {
    return _ok({ quizzes: JSON.parse(JSON.stringify(_mockQuizzes)) });
  }

  // --- /quiz-admin/:id ---
  const quizMatch = route.match(/^\/quiz-admin\/(\d+)$/);
  if (quizMatch) {
    const id = parseInt(quizMatch[1]);
    const quiz = _mockQuizzes.find((q) => q.quiz_id === id);
    if (!quiz) return _err(404, "Quiz not found.");
    return _ok(JSON.parse(JSON.stringify(quiz)));
  }

  // --- /stats/topics ---
  if (route === "/stats/topics") {
    return _ok(_mockStats.topics);
  }

  // --- /logout ---
  if (route === "/logout") {
    console.log("[MOCK] Logout called – clearing fake token.");
    return { success: true, status: 200 };
  }

  console.warn(`[MOCK FetchData] Unhandled route: ${route}`);
  return _err(404, `Route "${route}" not found in mock.`);
}


// ─────────────────────────────────────────────────────────────────────────────
// [4]  PostData  (simulates POST / create requests)
//
//  Supported routes:
//    /topic              → create new topic
//    /subtopic           → create new subtopic under a parent topic
//    /question           → create new question (FormData)
//    /quiz               → create new quiz
// ─────────────────────────────────────────────────────────────────────────────

async function PostData(route, payload, _authRequired) {
  await _delay();
  console.log(`[MOCK PostData] POST ${route}`, payload);

  // --- /topic ---
  if (route === "/topic") {
    const name = payload.topicName || "Unnamed Topic";
    const newTopic = {
      id: _nextTopicId++,
      name,
      description: payload.description || "",
      subtopics: [],
    };
    _mockTopics.push(newTopic);
    return _ok({ topic: newTopic, message: "Topic created successfully." });
  }

  // --- /subtopic ---
  if (route === "/subtopic") {
    const parent = _mockTopics.find((t) => t.id === parseInt(payload.parentId));
    if (!parent) return _err(404, "Parent topic not found.");
    const newSub = { id: _nextSubtopicId++, name: payload.subtopicName };
    parent.subtopics.push(newSub);
    return _ok({ subtopic: newSub, message: "Subtopic created successfully." });
  }

  // --- /question (FormData) ---
  if (route === "/question") {
    // FormData in the browser; in simulation we read it as FormData or plain obj
    const get = (key) =>
      payload instanceof FormData ? payload.get(key) : payload[key];

    const optionsRaw = get("options");
    const optionTexts =
      typeof optionsRaw === "string" ? JSON.parse(optionsRaw) : optionsRaw;

    const newQuestion = {
      question_id: _nextQuestionId++,
      content: get("statement"),
      statement: get("statement"),
      topic_id: parseInt(get("topicId")),
      topicId: parseInt(get("topicId")),
      correctAnswer: get("correctAnswer"),
      image: null,
      options: {
        A: { id: _nextOptionId++, text: optionTexts.A },
        B: { id: _nextOptionId++, text: optionTexts.B },
        C: { id: _nextOptionId++, text: optionTexts.C },
        D: { id: _nextOptionId++, text: optionTexts.D },
      },
    };
    _mockQuestions.push(newQuestion);
    return _ok({ question: newQuestion, message: "Question created." });
  }

  // --- /quiz ---
  if (route === "/quiz") {
    const newQuiz = {
      quiz_id: _nextQuizId++,
      title: payload.title,
      description: payload.description || "",
      question_count: payload.questions.length,
      publish_date: new Date().toISOString().split("T")[0],
      questions: payload.questions.slice(),
    };
    _mockQuizzes.push(newQuiz);
    return _ok({ quiz: newQuiz, message: "Quiz created successfully." });
  }

  console.warn(`[MOCK PostData] Unhandled route: ${route}`);
  return _err(404, `Route "${route}" not found in mock.`);
}


// ─────────────────────────────────────────────────────────────────────────────
// [5]  UpdateData  (simulates PUT/PATCH requests)
//
//  Supported routes:
//    /topic                      → update topic name/description
//    /question                   → update question (FormData)
//    /quiz                       → update quiz metadata and question list
//    /admin/reset-password       → change a user's password
//    /admin/deactivate-user/:id  → soft-delete a user
//    /admin/activate-user/:id    → reactivate a user
// ─────────────────────────────────────────────────────────────────────────────

async function UpdateData(route, payload, _authRequired) {
  await _delay();
  console.log(`[MOCK UpdateData] PATCH ${route}`, payload);

  // --- /topic (topic OR subtopic update – distinguished by topicName presence) ---
  if (route === "/topic") {
    const id = parseInt(payload.id);

    // Try updating a top-level topic
    const topic = _mockTopics.find((t) => t.id === id);
    if (topic) {
      if (payload.topicName) topic.name = payload.topicName;
      if (payload.description !== undefined) topic.description = payload.description;
      return _ok({ topic, message: "Topic updated." });
    }

    // Try updating a subtopic
    for (const t of _mockTopics) {
      const sub = t.subtopics.find((s) => s.id === id);
      if (sub) {
        if (payload.topicName) sub.name = payload.topicName;
        return _ok({ subtopic: sub, message: "Subtopic updated." });
      }
    }

    return _err(404, "Topic/subtopic not found for update.");
  }

  // --- /question (FormData) ---
  if (route === "/question") {
    const get = (key) =>
      payload instanceof FormData ? payload.get(key) : payload[key];

    const id = parseInt(get("id"));
    const q = _mockQuestions.find((q) => q.question_id === id);
    if (!q) return _err(404, "Question not found.");

    q.statement = get("statement") || q.statement;
    q.content   = q.statement;
    q.topicId   = parseInt(get("topicId")) || q.topicId;
    q.topic_id  = q.topicId;
    q.correctAnswer = get("correctAnswer") || q.correctAnswer;

    const optionsRaw = get("options");
    if (optionsRaw) {
      const opts = typeof optionsRaw === "string" ? JSON.parse(optionsRaw) : optionsRaw;
      ["A", "B", "C", "D"].forEach((letter) => {
        if (opts[letter]) {
          if (opts[letter].text) q.options[letter].text = opts[letter].text;
          if (opts[letter].id)   q.options[letter].id   = parseInt(opts[letter].id);
        }
      });
    }

    return _ok({ question: q, message: "Question updated." });
  }

  // --- /quiz ---
  if (route === "/quiz") {
    const id = parseInt(payload.quiz_id);
    const quiz = _mockQuizzes.find((q) => q.quiz_id === id);
    if (!quiz) return _err(404, "Quiz not found.");

    quiz.title        = payload.title        || quiz.title;
    quiz.description  = payload.description  ?? quiz.description;
    if (payload.questions) {
      quiz.questions      = payload.questions.slice();
      quiz.question_count = quiz.questions.length;
    }
    return _ok({ quiz, message: "Quiz updated." });
  }

  // --- /admin/reset-password ---
  if (route === "/admin/reset-password") {
    const user = _mockUsers.find((u) => u.id === parseInt(payload.id));
    if (!user) return _err(404, "User not found.");
    // In simulation we just acknowledge – never store plain passwords
    console.log(`[MOCK] Password reset for user ${user.email} (not actually stored).`);
    return _ok({ message: "Password reset successfully." });
  }

  // --- /admin/deactivate-user/:id ---
  const deactivateMatch = route.match(/^\/admin\/deactivate-user\/(\d+)$/);
  if (deactivateMatch) {
    const id   = parseInt(deactivateMatch[1]);
    const user = _mockUsers.find((u) => u.id === id);
    if (!user) return _err(404, "User not found.");
    user.is_active  = false;
    user.deleted_at = new Date().toISOString().split("T")[0];
    user.status     = "inactive";
    return _ok({ user, message: "User deactivated." });
  }

  // --- /admin/activate-user/:id ---
  const activateMatch = route.match(/^\/admin\/activate-user\/(\d+)$/);
  if (activateMatch) {
    const id   = parseInt(activateMatch[1]);
    const user = _mockUsers.find((u) => u.id === id);
    if (!user) return _err(404, "User not found.");
    user.is_active  = true;
    user.deleted_at = null;
    user.status     = "active";
    return _ok({ user, message: "User activated." });
  }

  console.warn(`[MOCK UpdateData] Unhandled route: ${route}`);
  return _err(404, `Route "${route}" not found in mock.`);
}


// ─────────────────────────────────────────────────────────────────────────────
// [6]  DeleteData  (simulates DELETE requests)
//
//  Supported routes:
//    /topic      → delete topic (and its subtopics) OR a subtopic by id
//    /question   → delete a question by id
//    /quiz       → delete a quiz by id
// ─────────────────────────────────────────────────────────────────────────────

async function DeleteData(route, payload, _authRequired) {
  await _delay();
  console.log(`[MOCK DeleteData] DELETE ${route}`, payload);

  // --- /topic (handles both topics and subtopics by id) ---
  if (route === "/topic") {
    const id = parseInt(payload.id);

    // Try top-level topic first
    const topicIdx = _mockTopics.findIndex((t) => t.id === id);
    if (topicIdx !== -1) {
      _mockTopics.splice(topicIdx, 1);
      return _ok({ message: "Topic and its subtopics deleted." });
    }

    // Try subtopic
    for (const t of _mockTopics) {
      const subIdx = t.subtopics.findIndex((s) => s.id === id);
      if (subIdx !== -1) {
        t.subtopics.splice(subIdx, 1);
        return _ok({ message: "Subtopic deleted." });
      }
    }

    return _err(404, "Topic/subtopic not found for deletion.");
  }

  // --- /question ---
  if (route === "/question") {
    const id  = parseInt(payload.id);
    const idx = _mockQuestions.findIndex((q) => q.question_id === id);
    if (idx === -1) return _err(404, "Question not found.");
    _mockQuestions.splice(idx, 1);
    return _ok({ message: "Question deleted." });
  }

  // --- /quiz ---
  if (route === "/quiz") {
    const id  = parseInt(payload.id);
    const idx = _mockQuizzes.findIndex((q) => q.quiz_id === id);
    if (idx === -1) return _err(404, "Quiz not found.");
    _mockQuizzes.splice(idx, 1);
    return _ok({ message: "Quiz deleted." });
  }

  console.warn(`[MOCK DeleteData] Unhandled route: ${route}`);
  return _err(404, `Route "${route}" not found in mock.`);
}

// =============================================================================
//  END OF SIMULATION LAYER
//  Everything below is your original application code, unchanged.
// =============================================================================


/**
 * The core engine for all modals and popups.
 * Handles DOM creation, styling, and event cleanup.
 */
function createBasePopup({
  title = "",
  message = "",
  icon = "fas fa-info-circle",
  iconColor = "#0097b2",
  confirmText = "Confirm",
  cancelText = "Close",
  showCancel = true,
  showConfirm = true,
  onConfirm = () => {},
  onCancel = () => {},
  confirmBtnStyle = "",
  cancelBtnStyle = ""
}) {
  const existingOverlay = document.getElementById("progressWarningOverlay");
  if (existingOverlay) existingOverlay.remove();

  const overlay = document.createElement("div");
  overlay.id = "progressWarningOverlay";

  overlay.innerHTML = `
    <div id="progressWarningBox">
      <div class="pw-icon" style="color: ${iconColor}">
        <i class="${icon}"></i>
      </div>
      <h3>${title}</h3>
      <div class="pw-message-content">${message}</div>
      <div class="pw-actions">
        ${showCancel ? `
          <button class="pw-btn pw-btn-cancel" style="${cancelBtnStyle}">
            ${cancelText}
          </button>` : ''
        }
        ${showConfirm ? `
          <button class="pw-btn pw-btn-confirm" style="${confirmBtnStyle}">
            ${confirmText}
          </button>` : ''
        }
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const closePopup = () => { overlay.remove(); };

  if (showCancel) {
    overlay.querySelector(".pw-btn-cancel").addEventListener("click", () => {
      closePopup();
      onCancel();
    });
  }

  if (showConfirm) {
    overlay.querySelector(".pw-btn-confirm").addEventListener("click", () => {
      closePopup();
      onConfirm();
    });
  }

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closePopup();
      onCancel();
    }
  });
}

/**
 * A standardized informational popup for the UI.
 */
function showInfoPopup(title, message, icon = "fas fa-info-circle", iconColor = "#0097b2") {
  createBasePopup({
    title,
    message,
    icon,
    iconColor,
    showConfirm: false,
    cancelText: "OK",
    showCancel: true,
    cancelBtnStyle: `background: ${iconColor}; color: #fff; border: none;`,
    onCancel: () => { console.log(`Popup "${title}" dismissed.`); }
  });
}

/**
 * Processes any API response and shows the appropriate popup for errors.
 */
function handleApiResponse(response) {
  console.log("API Response:", response);
  if (response?.success !== false && response?.status < 400) {
    return false;
  }

  let config = { title: "Error", icon: "fas fa-exclamation-circle", color: "#e74c3c" };

  if (response.status === 403) {
    config = { title: "Access Restricted", icon: "fas fa-lock", color: "#f39c12" };
  } else if (response.status === 401) {
    config = { title: "Session Expired", icon: "fas fa-user-shield", color: "#3498db" };
  } else if (response.status >= 500) {
    config = { title: "Server Error", icon: "fas fa-server", color: "#c0392b" };
  } else if (!response.status) {
    config = { title: "Network Issue", icon: "fas fa-wifi", color: "#95a5a6" };
  }

  showInfoPopup(
    config.title,
    response.userMessage || "An unexpected error occurred.",
    config.icon,
    config.color
  );
  return true;
}

// Runtime state
let users = [];
let questions = [];
let selectedQuestionIds = [];

// ===== NAVIGATION FUNCTIONS =====

function toggleMobileMenu() {
  var links = document.querySelector(".links");
  links.style.display = links.style.display === "flex" ? "none" : "flex";
  if (links.style.display === "flex") {
    links.style.position = "fixed";
    links.style.top = "86px";
    links.style.left = "0";
    links.style.right = "0";
    links.style.background = "var(--white)";
    links.style.flexDirection = "column";
    links.style.padding = "20px";
    links.style.boxShadow = "var(--shadow)";
    links.style.borderBottom = "1px solid var(--border)";
    links.style.zIndex = "1001";
  }
}

function toggleSidebar() {
  var sidebar = document.querySelector(".left-sidebar");
  var overlay = document.querySelector(".sidebar-overlay");
  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
}

function closeSidebar() {
  var sidebar = document.querySelector(".left-sidebar");
  var overlay = document.querySelector(".sidebar-overlay");
  sidebar.classList.remove("active");
  overlay.classList.remove("active");
}

function showSection(sectionId) {
  var sections = document.querySelectorAll(".admin-section");
  sections.forEach(function (section) { section.classList.remove("active"); });
  document.getElementById(sectionId).classList.add("active");
  var navItems = document.querySelectorAll(".nav-item");
  navItems.forEach(function (item) { item.classList.remove("active"); });
  var headerLinks = document.querySelectorAll(".links a");
  headerLinks.forEach(function (link) { link.style.background = ""; link.style.color = ""; });
  var links = document.querySelector(".links");
  if (window.innerWidth <= 768) { links.style.display = "none"; closeSidebar(); }
  console.log("Navigated to " + sectionId + " section");
}

// ===== CHARTS INITIALIZATION =====

async function initializeCharts() {
  var questionsCtx = document.getElementById("questionsChart").getContext("2d");
  const response = await FetchData("/stats/topics", true);
  const data = response.data.stats || [];
  console.log(response);
  new Chart(questionsCtx, {
    type: "doughnut",
    data: {
      labels: response.data.labels,
      datasets: [{ data: response.data.data, backgroundColor: response.data.colors, borderWidth: 0 }],
    },
    options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: "bottom" } } },
  });

  var usersCtx = document.getElementById("usersChart").getContext("2d");
  new Chart(usersCtx, {
    type: "line",
    data: {
      labels: [],
      datasets: [{ label: "New Users", data: [], borderColor: "#0097b2", backgroundColor: "rgba(0, 151, 178, 0.1)", tension: 0.4, fill: true }],
    },
    options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } },
  });

  var activityCtx = document.getElementById("activityChart").getContext("2d");
  new Chart(activityCtx, {
    type: "bar",
    data: {
      labels: [],
      datasets: [{ label: "Tests Taken", data: [], backgroundColor: "#0097b2", borderRadius: 5 }],
    },
    options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } },
  });

  var performanceCtx = document.getElementById("performanceChart").getContext("2d");
  new Chart(performanceCtx, {
    type: "radar",
    data: {
      labels: [],
      datasets: [{
        label: "Average Score",
        data: [],
        backgroundColor: "rgba(0, 151, 178, 0.2)",
        borderColor: "#0097b2",
        pointBackgroundColor: "#0097b2",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#0097b2",
      }],
    },
    options: { responsive: true, maintainAspectRatio: true, scales: { r: { beginAtZero: true, max: 100 } } },
  });
}

// ===== TOPICS MANAGEMENT =====

async function loadTopics() {
  var topicsList = document.getElementById("topicsList");
  topicsList.innerHTML = "";
  const response = await FetchData("/topic", true);
  if (handleApiResponse(response)) return;
  const data = response.data.topics || [];
  document.getElementById("totalTopics").textContent = data.length;
  data.forEach(function (topic) {
    var topicCard = document.createElement("div");
    topicCard.className = "topic-card";
    topicCard.innerHTML = `
      <div class="topic-header-section">
        <div class="topic-info">
          <h3>${topic.name}</h3>
          <p>${topic.description || "No description provided"}</p>
        </div>
        <div class="topic-actions">
          <button class="btn-edit" data-action="edit-topic" data-id="${topic.id}">Edit</button>
          <button class="btn-delete" data-action="delete-topic" data-id="${topic.id}">Delete</button>
        </div>
      </div>
      <div class="subtopics-container">
        <div class="subtopics-header">
          <h4>Subtopics (${topic.subtopics.length})</h4>
          <button class="btn-small" data-action="add-subtopic" data-topic-id="${topic.id}">+ Add Subtopic</button>
        </div>
        <div class="subtopics-grid">
          ${topic.subtopics.map(function (sub) {
            return `
              <div class="subtopic-item">
                <span>${sub.name}</span>
                <div class="subtopic-actions">
                  <button data-action="edit-subtopic" data-topic-id="${topic.id}" data-id="${sub.id}" title="Edit">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button data-action="delete-subtopic" data-topic-id="${topic.id}" data-id="${sub.id}" title="Delete">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
    topicsList.appendChild(topicCard);
  });
}

async function openTopicModal(topicId) {
  var modal = document.getElementById("topicModal");
  var form = document.getElementById("topicForm");
  var title = document.getElementById("topicModalTitle");
  var subtopicsSection = document.getElementById("subtopicsSection");

  form.reset();
  document.getElementById("topicId").value = "";
  subtopicsSection.style.display = "none";

  if (topicId) {
    const response = await FetchData(`/topic/${topicId}`, true);
    if (handleApiResponse(response)) return;
    const topic = response.data.topic;
    if (topic) {
      title.textContent = "Edit Topic";
      document.getElementById("topicId").value = topic.id;
      document.getElementById("topicName").value = topic.name;
      document.getElementById("topicDescription").value = topic.description || "";
      subtopicsSection.style.display = "block";
      loadSubtopicsForEdit(topic);
    }
  } else {
    title.textContent = "Add New Topic";
  }
  modal.classList.add("active");
}

function closeTopicModal() {
  document.getElementById("topicModal").classList.remove("active");
}

function loadSubtopicsForEdit(topic) {
  var subtopicsList = document.getElementById("subtopicsList");
  subtopicsList.innerHTML = "";
  topic.subtopics.forEach(function (sub) {
    var field = document.createElement("div");
    field.className = "subtopic-field";
    field.innerHTML = `
      <input type="text" value="${sub.name}" data-subtopic-id="${sub.id}">
      <button type="button" data-action="remove-subtopic-field" data-id="${sub.id}">Remove</button>
    `;
    subtopicsList.appendChild(field);
  });
}

function addSubtopicField() {
  var subtopicsList = document.getElementById("subtopicsList");
  var field = document.createElement("div");
  field.className = "subtopic-field";
  field.innerHTML = `
    <input type="text" placeholder="Enter subtopic name" data-subtopic-id="new">
    <button type="button" data-action="remove-subtopic-field">Remove</button>
  `;
  subtopicsList.appendChild(field);
}

function removeSubtopicField(button, subtopicId) {
  if (subtopicId) {
    if (confirm("Are you sure you want to delete this subtopic?")) {
      button.parentElement.remove();
      console.log("Subtopic " + subtopicId + " marked for deletion");
    }
  } else {
    button.parentElement.remove();
  }
}

async function handleTopicSubmit(event) {
  event.preventDefault();
  var topicId = document.getElementById("topicId").value;
  var name = document.getElementById("topicName").value;
  var description = document.getElementById("topicDescription").value;

  if (topicId) {
    const response = await UpdateData(`/topic`, { id: topicId, topicName: name });
    if (handleApiResponse(response)) return;
    alert("Topic updated!");
  } else {
    const payload = { topicName: name };
    const response = await PostData("/topic", payload, true);
    if (handleApiResponse(response)) return;
  }
  loadTopics();
  loadTopicOptions();
  closeTopicModal();
}

function editTopic(topicId) { openTopicModal(topicId); }

async function deleteTopic(topicId) {
  if (confirm("Are you sure you want to delete this topic? This will also delete all associated subtopics.")) {
    const response = await DeleteData(`/topic`, { id: topicId }, true);
    if (handleApiResponse(response)) return;
    loadTopics();
    loadTopicOptions();
  }
}

async function addSubtopic(topicId) { openSubtopicModal(topicId); }

function editSubtopic(topicId, subtopicId) { openSubtopicModal(topicId, subtopicId); }

async function openSubtopicModal(topicId, subtopicId) {
  alert(`topic ${topicId} subtopic ${subtopicId}`);
  var modal = document.getElementById("subtopicModal");
  var form = document.getElementById("subtopicForm");
  var title = document.getElementById("subtopicModalTitle");

  form.reset();
  document.getElementById("subtopicTopicId").value = topicId;

  if (subtopicId) {
    const response = await FetchData(`/topic/${subtopicId}`, true);
    if (handleApiResponse(response)) return;
    const subtopic = response.data.topic;
    if (subtopic) {
      title.textContent = "Edit Subtopic";
      document.getElementById("subtopicId").value = subtopic.id;
      document.getElementById("subtopicName").value = subtopic.name;
    }
  } else {
    title.textContent = "Add New Subtopic";
    document.getElementById("subtopicId").value = "";
  }
  modal.classList.add("active");
}

function closeSubtopicModal() {
  document.getElementById("subtopicModal").classList.remove("active");
}

async function handleSubtopicSubmit(event) {
  event.preventDefault();
  var topicId = parseInt(document.getElementById("subtopicTopicId").value);
  var subtopicId = document.getElementById("subtopicId").value;
  var name = document.getElementById("subtopicName").value.trim();

  if (subtopicId) {
    const payload = { id: subtopicId, topicName: name };
    const response = await UpdateData(`/topic`, payload, true);
    if (handleApiResponse(response)) return;
  } else {
    const payload = { subtopicName: name, parentId: topicId };
    const response = await PostData("/subtopic", payload, true);
    if (handleApiResponse(response)) return;
  }
  loadTopics();
  closeSubtopicModal();
}

async function deleteSubtopic(topicId, subtopicId) {
  if (confirm("Are you sure you want to delete this subtopic?")) {
    const response = await DeleteData(`/topic`, { id: subtopicId }, true);
    if (handleApiResponse(response)) return;
    loadTopics();
    loadTopicOptions();
  }
}

// ===== QUESTIONS MANAGEMENT =====

async function loadQuestions() {
  var tbody = document.getElementById("questionsTableBody");
  tbody.innerHTML = "";
  const response = await FetchData("/questions", true);
  if (handleApiResponse(response)) return;
  const questions = response.data.questions;
  document.getElementById("totalQuestions").textContent = questions.length;
  questions.forEach(function (question) {
    var row = document.createElement("tr");
    row.setAttribute("data-topic-id", `${question.topic_id}`);
    row.innerHTML = `
      <td>${question.question_id}</td>
      <td class="question-text" title="${question.content}">${question.content}</td>
      <td>
        <div class="table-actions">
          <button class="btn-edit" data-action="edit-question" data-id="${question.question_id}">Edit</button>
          <button class="btn-delete" data-action="delete-question" data-id="${question.question_id}">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

async function openQuestionModal(questionId) {
  var modal = document.getElementById("questionModal");
  var form = document.getElementById("questionForm");
  var title = document.getElementById("questionModalTitle");
  var imagePreview = document.getElementById("imagePreview");

  form.reset();
  imagePreview.innerHTML = "";
  imagePreview.classList.remove("show");
  document.getElementById("questionId").value = "";

  if (questionId) {
    const response = await FetchData(`/question/${questionId}`, true);
    if (handleApiResponse(response)) return;
    const question = response.data.question;
    if (question) {
      title.textContent = "Edit Question";
      document.getElementById("questionId").value = questionId;
      document.getElementById("questionStatement").value = question.statement;
      document.getElementById("questionTopic").value = question.topicId;
      document.getElementById("optionA").value = question.options.A.text;
      document.getElementById("optionA").setAttribute("option-id", question.options.A.id);
      document.getElementById("optionB").value = question.options.B.text;
      document.getElementById("optionB").setAttribute("option-id", question.options.B.id);
      document.getElementById("optionC").value = question.options.C.text;
      document.getElementById("optionC").setAttribute("option-id", question.options.C.id);
      document.getElementById("optionD").value = question.options.D.text;
      document.getElementById("optionD").setAttribute("option-id", question.options.D.id);
      document.querySelector('input[value="' + question.correctAnswer + '"]').checked = true;

      if (question.image) {
        var imgSrc = question.image;
        var removeImageContainer = document.getElementById("removeImageContainer");
        if (!imgSrc.startsWith("data:") && !imgSrc.startsWith("http")) {
          imgSrc = "data:image/png;base64," + imgSrc;
        }
        imagePreview.innerHTML = '<img src="' + imgSrc + '" alt="Question Image">';
        imagePreview.classList.add("show");
        removeImageContainer.style.display = "block";
      } else {
        imagePreview.innerHTML = "";
        imagePreview.classList.remove("show");
      }
    }
  } else {
    title.textContent = "Add New Question";
  }
  modal.classList.add("active");
}

function closeQuestionModal() {
  var removeImageContainer = document.getElementById("removeImageContainer");
  removeImageContainer.style.display = "none";
  document.getElementById("questionModal").classList.remove("active");
}

function previewImage(event) {
  var file = event.target.files[0];
  var preview = document.getElementById("imagePreview");
  if (file) {
    var reader = new FileReader();
    reader.onload = function (e) {
      preview.innerHTML = '<img src="' + e.target.result + '" alt="Preview">';
      preview.classList.add("show");
    };
    reader.readAsDataURL(file);
  } else {
    preview.innerHTML = "";
    preview.classList.remove("show");
  }
}

async function populateTopicSelects() {
  const modalTopicSelect = document.getElementById("questionTopic");
  const filterTopic = document.getElementById("filterTopic");
  let optionsHtml = "";
  const response = await FetchData("/topic", true);
  if (handleApiResponse(response)) return;
  const data = response.data.topics || [];
  data.forEach((cat) => {
    optionsHtml += `<optgroup label="${cat.name}">`;
    optionsHtml += `<option value="${cat.id}">${cat.name}</option>`;
    cat.subtopics.forEach((sub) => {
      optionsHtml += `<option value="${sub.id}">${sub.name}</option>`;
    });
    optionsHtml += `</optgroup>`;
  });
  filterTopic.innerHTML = '<option value="">All Topics</option>' + optionsHtml;
  modalTopicSelect.innerHTML = '<option value="">Select topic</option>' + optionsHtml;
}

async function populateTopicSelects_2(select) {
  let optionsHtml = "";
  const response = await FetchData("/topic", true);
  if (handleApiResponse(response)) return;
  const data = response.data.topics || [];
  data.forEach((cat) => {
    optionsHtml += `<optgroup label="${cat.name}">`;
    optionsHtml += `<option value="${cat.id}">${cat.name}</option>`;
    cat.subtopics.forEach((sub) => {
      optionsHtml += `<option value="${sub.id}">${sub.name}</option>`;
    });
    optionsHtml += `</optgroup>`;
  });
  select.innerHTML = '<option value="">Select topic</option>' + optionsHtml;
}

async function handleQuestionSubmit(event) {
  event.preventDefault();
  var questionId = document.getElementById("questionId").value;
  var statement = document.getElementById("questionStatement").value;
  var topicId = parseInt(document.getElementById("questionTopic").value);
  var correctAnswer = document.querySelector('input[name="correctAnswer"]:checked').value;

  var formData = new FormData();
  formData.append("statement", statement);
  formData.append("topicId", topicId);
  formData.append("correctAnswer", correctAnswer);

  var imageInput = document.getElementById("questionImage");
  var removeImageCheckbox = document.getElementById("removeImage");

  if (removeImageCheckbox && removeImageCheckbox.checked) {
    formData.append("removeImage", "true");
  } else if (imageInput && imageInput.files && imageInput.files[0]) {
    formData.append("image", imageInput.files[0]);
  }

  if (questionId) {
    formData.append("id", questionId);
    var options = {
      A: { id: document.getElementById("optionA").getAttribute("option-id"), text: document.getElementById("optionA").value },
      B: { id: document.getElementById("optionB").getAttribute("option-id"), text: document.getElementById("optionB").value },
      C: { id: document.getElementById("optionC").getAttribute("option-id"), text: document.getElementById("optionC").value },
      D: { id: document.getElementById("optionD").getAttribute("option-id"), text: document.getElementById("optionD").value },
    };
    formData.append("options", JSON.stringify(options));
    const response = await UpdateData("/question", formData, true);
    if (handleApiResponse(response)) return;
  } else {
    var options = {
      A: document.getElementById("optionA").value,
      B: document.getElementById("optionB").value,
      C: document.getElementById("optionC").value,
      D: document.getElementById("optionD").value,
    };
    formData.append("options", JSON.stringify(options));
    const response = await PostData("/question", formData, true);
    if (handleApiResponse(response)) return;
  }
  loadQuestions();
  closeQuestionModal();
}

function editQuestion(questionId) { openQuestionModal(questionId); }

async function deleteQuestion(questionId) {
  if (confirm("Are you sure you want to delete this question?")) {
    const response = await DeleteData(`/question`, { id: questionId }, true);
    if (handleApiResponse(response)) return;
    loadQuestions();
  }
}

function filterQuestions() {
  var filterTopic = document.getElementById("filterTopic").value;
  const rows = document.querySelectorAll("tr[data-topic-id]");
  rows.forEach((row) => {
    if (!filterTopic || row.getAttribute("data-topic-id") === filterTopic.toString()) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

function searchQuestions() { filterQuestions(); }

function loadTopicOptions() { populateTopicSelects(); }

// ===== USERS MANAGEMENT =====

async function loadUsers() {
  var tbody = document.getElementById("usersTableBody");
  tbody.innerHTML = "";
  const response = await FetchData("/users", true);
  if (handleApiResponse(response)) return;
  users = response.data.users;
  console.log("Response-user: ", users);
  document.getElementById("totalUsers").textContent = users.length;

  users.forEach(function (user) {
    const isDeactivated = !user.is_active || user.deleted_at !== null;
    var row = document.createElement("tr");
    row.innerHTML = `
      <td>${user.id}</td>
      <td>${user.email}</td>
      <td>${user.role.toUpperCase()}</td>
      <td>
        <span class="status-badge ${isDeactivated ? "status-inactive" : "status-active"}">
          ${isDeactivated ? "Inactive" : "Active"}
        </span>
      </td>
      <td>
        <div class="table-actions">
          ${isDeactivated
            ? `<button class="btn-activate" data-action="activate-user" data-id="${user.id}">Activate</button>`
            : `<button class="btn-edit" data-action="edit-user" data-id="${user.id}">Edit</button>
               <button class="btn-delete" data-action="delete-user" data-id="${user.id}">Delete</button>`
          }
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function openUserModal(userId) {
  var modal = document.getElementById("userModal");
  var form = document.getElementById("userForm");
  var title = document.getElementById("userModalTitle");
  var passwordHelp = document.getElementById("passwordHelp");
  var passwordInput = document.getElementById("userPassword");

  form.reset();
  document.getElementById("userId").value = "";

  if (userId) {
    var user = users.find(function (u) { return u.id === userId; });
    if (user) {
      title.textContent = "Edit User";
      document.getElementById("userId").value = user.id;
      passwordInput.required = false;
      passwordHelp.style.display = "block";
    }
  } else {
    title.textContent = "Add New User";
    passwordInput.required = true;
    passwordHelp.style.display = "none";
  }
  modal.classList.add("active");
}

function closeUserModal() {
  document.getElementById("userModal").classList.remove("active");
}

async function handleUserSubmit(event) {
  event.preventDefault();
  var userId = document.getElementById("userId").value;
  var password = document.getElementById("userPassword").value;

  if (userId) {
    const payload = { id: parseInt(userId), password: password };
    console.log(payload);
    const response = await UpdateData("/admin/reset-password", payload, true);
    if (handleApiResponse(response)) return;
  }
  loadUsers();
  closeUserModal();
}

function editUser(userId) { openUserModal(userId); }

async function deleteUser(userId) {
  alert(userId);
  if (confirm("Are you sure you want to delete this user?")) {
    const response = await UpdateData(`/admin/deactivate-user/${userId}`, { id: userId }, true);
    if (handleApiResponse(response)) return;
    loadUsers();
  }
}

async function activateUser(userId) {
  alert(userId);
  if (confirm("Are you sure you want to activate this user?")) {
    const response = await UpdateData(`/admin/activate-user/${userId}`, { id: userId }, true);
    if (handleApiResponse(response)) return;
    loadUsers();
  }
}

function filterUsers() {
  var filterRole = document.getElementById("filterUserRole").value;
  var searchTerm = document.getElementById("searchUser").value.toLowerCase();
  var filtered = users.filter(function (u) {
    var matchesRole = !filterRole || u.role === filterRole;
    var matchesSearch = !searchTerm || u.name.toLowerCase().includes(searchTerm) || u.email.toLowerCase().includes(searchTerm);
    return matchesRole && matchesSearch;
  });
  displayFilteredUsers(filtered);
}

function searchUsers() { filterUsers(); }

function displayFilteredUsers(filtered) {
  var tbody = document.getElementById("usersTableBody");
  tbody.innerHTML = "";
  filtered.forEach(function (user) {
    var row = document.createElement("tr");
    row.innerHTML = `
      <td>${user.id}</td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.role.toUpperCase()}</td>
      <td>${user.joined}</td>
      <td><span class="status-badge status-${user.status}">${user.status.toUpperCase()}</span></td>
      <td>
        <div class="table-actions">
          <button class="btn-edit" data-action="edit-user" data-id="${user.id}">Edit</button>
          <button class="btn-delete" data-action="delete-user" data-id="${user.id}">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// ===== EXAMS MANAGEMENT =====

async function loadExams() {
  var examsList = document.getElementById("examsList");
  examsList.innerHTML = "";
  const response = await FetchData("/quizzes", true);
  if (handleApiResponse(response)) return;
  const exams = response.data.quizzes;
  if (exams.length === 0) {
    examsList.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 40px;">No exams created yet. Click "Add New Exam" to get started.</p>';
    return;
  }
  exams.forEach(function (exam) {
    var examCard = document.createElement("div");
    examCard.className = "exam-card";
    examCard.innerHTML = `
      <div class="exam-card-header">
        <div>
          <h3>${exam.title}</h3>
          <p>${exam.description || "No description provided"}</p>
        </div>
        <div class="exam-actions">
          <button class="btn-edit" data-action="edit-exam" data-id="${exam.quiz_id}">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="btn-delete" data-action="delete-exam" data-id="${exam.quiz_id}">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      </div>
      <div class="exam-meta">
        <div class="exam-meta-item">
          <i class="fas fa-question-circle"></i>
          <span><strong>${exam.question_count}</strong> Questions</span>
        </div>
        <div class="exam-meta-item">
          <i class="fas fa-calendar"></i>
          <span>Created: ${exam.publish_date}</span>
        </div>
      </div>
    `;
    examsList.appendChild(examCard);
  });
}

async function openExamModal(examId) {
  var modal = document.getElementById("examModal");
  var form = document.getElementById("examForm");
  var title = document.getElementById("examModalTitle");

  form.reset();
  document.getElementById("examId").value = "";
  selectedQuestionIds = [];

  var topicFilter = document.getElementById("examQuestionTopicFilter");
  topicFilter.innerHTML = '<option value="">All Topics</option>';
  populateTopicSelects_2(topicFilter);

  if (examId) {
    const response = await FetchData(`/quiz-admin/${examId}`);
    if (handleApiResponse(response)) return;
    const exam = response.data;
    if (exam) {
      title.textContent = "Edit Exam";
      document.getElementById("examId").value = exam.quiz_id;
      document.getElementById("examName").value = exam.title;
      document.getElementById("examDescription").value = exam.description || "";
      selectedQuestionIds = exam.questions.slice();
    }
  } else {
    title.textContent = "Add New Exam";
  }
  loadAvailableQuestions();
  updateSelectedQuestionsDisplay();
  modal.classList.add("active");
}

function closeExamModal() {
  document.getElementById("examModal").classList.remove("active");
  selectedQuestionIds = [];
}

async function loadAvailableQuestions() {
  var container = document.getElementById("availableQuestions");
  var topicFilter = document.getElementById("examQuestionTopicFilter").value;
  var searchTerm = document.getElementById("examQuestionSearch").value.toLowerCase();
  const response = await FetchData("/questions", true);
  if (handleApiResponse(response)) return;
  questions = response.data.questions;

  container.innerHTML = "";
  questions.forEach(function (question) {
    console.log(question);
    var isSelected = selectedQuestionIds.indexOf(question.question_id) > -1;
    var item = document.createElement("div");
    item.className = "question-checkbox-item";
    item.innerHTML = `
      <input type="checkbox"
             id="q-${question.question_id}"
             ${isSelected ? "checked" : ""}
             data-question-id="${question.question_id}">
      <div class="question-checkbox-content">
        <strong>${question.content}</strong>
      </div>
    `;
    container.appendChild(item);
  });
}

function filterAvailableQuestions() { loadAvailableQuestions(); }

function toggleQuestionSelection(questionId) {
  var index = selectedQuestionIds.indexOf(questionId);
  if (index > -1) { selectedQuestionIds.splice(index, 1); }
  else { selectedQuestionIds.push(questionId); }
  updateSelectedQuestionsDisplay();
}

function updateSelectedQuestionsDisplay() {
  console.log(selectedQuestionIds);
  var container = document.getElementById("selectedQuestions");
  var countSpan = document.getElementById("selectedCount");
  countSpan.textContent = selectedQuestionIds.length;

  if (selectedQuestionIds.length === 0) {
    container.innerHTML = '<p class="no-selection">No questions selected yet</p>';
    return;
  }
  container.innerHTML = "";
  selectedQuestionIds.forEach(function (questionId) {
    var question = questions.find(function (q) { return q.question_id === questionId; });
    if (question) {
      var item = document.createElement("div");
      item.className = "selected-question-item";
      item.innerHTML = `
        <span>${question.content.substring(0, 60)}${question.content.length > 60 ? "..." : ""}</span>
        <button type="button" data-action="remove-selected-question" data-id="${questionId}">
          <i class="fas fa-times"></i>
        </button>
      `;
      container.appendChild(item);
    }
  });
}

function removeQuestionFromSelection(questionId) {
  var index = selectedQuestionIds.indexOf(questionId);
  if (index > -1) { selectedQuestionIds.splice(index, 1); }
  var checkbox = document.getElementById("q-" + questionId);
  if (checkbox) { checkbox.checked = false; }
  updateSelectedQuestionsDisplay();
}

async function handleExamSubmit(event) {
  event.preventDefault();
  if (selectedQuestionIds.length === 0) {
    alert("Please select at least one question for the exam.");
    return;
  }
  var examId = document.getElementById("examId").value;
  var name = document.getElementById("examName").value;
  var description = document.getElementById("examDescription").value;

  if (examId) {
    const payload = { quiz_id: examId, title: name, description, questions: selectedQuestionIds.slice() };
    const response = await UpdateData("/quiz", payload, true);
    if (handleApiResponse(response)) return;
  } else {
    var payload = { title: name, description, questions: selectedQuestionIds.slice() };
    const response = await PostData("/quiz", payload, true);
    if (handleApiResponse(response)) return;
  }
  loadExams();
  closeExamModal();
}

function editExam(examId) { openExamModal(examId); }

async function deleteExam(examId) {
  if (confirm("Are you sure you want to delete this exam?")) {
    const response = await DeleteData("/quiz", { id: examId }, true);
    if (handleApiResponse(response)) return;
    loadExams();
  }
}

// ===== EVENT LISTENERS =====

document.addEventListener("DOMContentLoaded", function () {
  console.log("Admin Dashboard loaded successfully");

  initializeCharts();
  loadTopics();
  loadQuestions();
  loadUsers();
  loadExams();
  loadTopicOptions();

  document.getElementById("btn-logout").addEventListener("click", async function () {
    var response = await FetchData("/logout", true);
    if (handleApiResponse(response)) return;
    if (response.success) {
      localStorage.removeItem("token");
      alert("Succeessfull Logout");
      window.location.href = "../auth/login.html";
    } else {
      alert("logout failed");
    }
  });

  var sidebarToggle = document.getElementById("sidebar-toggle");
  if (sidebarToggle) { sidebarToggle.addEventListener("click", toggleSidebar); }

  var mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  if (mobileMenuToggle) { mobileMenuToggle.addEventListener("click", toggleMobileMenu); }

  var sidebarOverlay = document.getElementById("sidebar-overlay");
  if (sidebarOverlay) { sidebarOverlay.addEventListener("click", closeSidebar); }

  var headerLinks = document.querySelectorAll(".links a[data-section]");
  headerLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      showSection(this.getAttribute("data-section"));
    });
  });

  var navItems = document.querySelectorAll(".nav-item[data-section]");
  navItems.forEach(function (item) {
    item.addEventListener("click", function () {
      showSection(this.getAttribute("data-section"));
    });
  });

  var btnAddTopic = document.getElementById("btn-add-topic");
  if (btnAddTopic) { btnAddTopic.addEventListener("click", function () { openTopicModal(null); }); }

  var btnAddQuestion = document.getElementById("btn-add-question");
  if (btnAddQuestion) { btnAddQuestion.addEventListener("click", function () { openQuestionModal(null); }); }

  var btnAddUser = document.getElementById("btn-add-user");
  if (btnAddUser) { btnAddUser.addEventListener("click", function () { openUserModal(null); }); }

  var btnAddExam = document.getElementById("btn-add-exam");
  if (btnAddExam) { btnAddExam.addEventListener("click", function () { openExamModal(null); }); }

  var btnAddSubtopicField = document.getElementById("btn-add-subtopic-field");
  if (btnAddSubtopicField) { btnAddSubtopicField.addEventListener("click", addSubtopicField); }

  var topicForm = document.getElementById("topicForm");
  if (topicForm) { topicForm.addEventListener("submit", handleTopicSubmit); }

  var questionForm = document.getElementById("questionForm");
  if (questionForm) { questionForm.addEventListener("submit", handleQuestionSubmit); }

  var userForm = document.getElementById("userForm");
  if (userForm) { userForm.addEventListener("submit", handleUserSubmit); }

  var subtopicForm = document.getElementById("subtopicForm");
  if (subtopicForm) { subtopicForm.addEventListener("submit", async (e) => { await handleSubtopicSubmit(e); }); }

  var examForm = document.getElementById("examForm");
  if (examForm) { examForm.addEventListener("submit", handleExamSubmit); }

  var filterTopic = document.getElementById("filterTopic");
  if (filterTopic) { filterTopic.addEventListener("change", filterQuestions); }

  var searchQuestion = document.getElementById("searchQuestion");
  if (searchQuestion) {
    document.getElementById("searchQuestion").addEventListener("input", function (e) {
      var searchText = e.target.value.toLowerCase().trim();
      var tableRows = document.querySelectorAll("#questionsTable tbody tr");
      tableRows.forEach(function (row) {
        var questionText = row.querySelector(".question-text");
        if (questionText) {
          var content = questionText.textContent.toLowerCase();
          row.style.display = content.includes(searchText) ? "" : "none";
        }
      });
    });
  }

  var filterUserRole = document.getElementById("filterUserRole");
  if (filterUserRole) { filterUserRole.addEventListener("change", filterUsers); }

  var searchUser = document.getElementById("searchUser");
  if (searchUser) { searchUser.addEventListener("keyup", searchUsers); }

  var examQuestionTopicFilter = document.getElementById("examQuestionTopicFilter");
  if (examQuestionTopicFilter) { examQuestionTopicFilter.addEventListener("change", filterAvailableQuestions); }

  var examQuestionSearch = document.getElementById("examQuestionSearch");
  if (examQuestionSearch) { examQuestionSearch.addEventListener("keyup", filterAvailableQuestions); }

  var questionImage = document.getElementById("questionImage");
  if (questionImage) { questionImage.addEventListener("change", previewImage); }

  var modalCloseButtons = document.querySelectorAll("[data-modal]");
  modalCloseButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var modal = document.getElementById(this.getAttribute("data-modal"));
      if (modal) { modal.classList.remove("active"); }
    });
  });

  var topicsList = document.getElementById("topicsList");
  if (topicsList) {
    topicsList.addEventListener("click", function (e) {
      var target = e.target.closest("[data-action]");
      if (!target) return;
      var action = target.getAttribute("data-action");
      var id = parseInt(target.getAttribute("data-id"));
      var topicId = parseInt(target.getAttribute("data-topic-id"));
      switch (action) {
        case "edit-topic":      editTopic(id);              break;
        case "delete-topic":   deleteTopic(id);            break;
        case "add-subtopic":   addSubtopic(topicId);       break;
        case "edit-subtopic":  editSubtopic(topicId, id);  break;
        case "delete-subtopic":deleteSubtopic(topicId, id);break;
      }
    });
  }

  var subtopicsList = document.getElementById("subtopicsList");
  if (subtopicsList) {
    subtopicsList.addEventListener("click", function (e) {
      var target = e.target.closest("[data-action]");
      if (!target) return;
      if (target.getAttribute("data-action") === "remove-subtopic-field") {
        var subtopicId = target.getAttribute("data-id") ? parseInt(target.getAttribute("data-id")) : null;
        removeSubtopicField(target, subtopicId);
      }
    });
  }

  var questionsTableBody = document.getElementById("questionsTableBody");
  if (questionsTableBody) {
    questionsTableBody.addEventListener("click", function (e) {
      var target = e.target.closest("[data-action]");
      if (!target) return;
      var action = target.getAttribute("data-action");
      var id = parseInt(target.getAttribute("data-id"));
      switch (action) {
        case "edit-question":   editQuestion(id);   break;
        case "delete-question": deleteQuestion(id); break;
      }
    });
  }

  var usersTableBody = document.getElementById("usersTableBody");
  if (usersTableBody) {
    usersTableBody.addEventListener("click", function (e) {
      var target = e.target.closest("[data-action]");
      if (!target) return;
      var action = target.getAttribute("data-action");
      var id = parseInt(target.getAttribute("data-id"));
      switch (action) {
        case "edit-user":     editUser(id);     break;
        case "delete-user":   deleteUser(id);   break;
        case "activate-user": activateUser(id); break;
      }
    });
  }

  var examsList = document.getElementById("examsList");
  if (examsList) {
    examsList.addEventListener("click", function (e) {
      var target = e.target.closest("[data-action]");
      if (!target) return;
      var action = target.getAttribute("data-action");
      var id = parseInt(target.getAttribute("data-id"));
      switch (action) {
        case "edit-exam":   editExam(id);   break;
        case "delete-exam": deleteExam(id); break;
      }
    });
  }

  var availableQuestions = document.getElementById("availableQuestions");
  if (availableQuestions) {
    availableQuestions.addEventListener("change", function (e) {
      if (e.target.type === "checkbox" && e.target.hasAttribute("data-question-id")) {
        toggleQuestionSelection(parseInt(e.target.getAttribute("data-question-id")));
      }
    });
  }

  var selectedQuestions = document.getElementById("selectedQuestions");
  if (selectedQuestions) {
    selectedQuestions.addEventListener("click", function (e) {
      var target = e.target.closest("[data-action]");
      if (!target) return;
      if (target.getAttribute("data-action") === "remove-selected-question") {
        removeQuestionFromSelection(parseInt(target.getAttribute("data-id")));
      }
    });
  }

  document.addEventListener("click", function (e) {
    var links = document.querySelector(".links");
    var toggle = document.querySelector(".mobile-menu-toggle");
    if (window.innerWidth <= 768 && links.style.display === "flex") {
      if (!links.contains(e.target) && !toggle.contains(e.target)) {
        links.style.display = "none";
      }
    }
  });

  var modals = document.querySelectorAll(".modal");
  modals.forEach(function (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) { modal.classList.remove("active"); }
    });
  });
});