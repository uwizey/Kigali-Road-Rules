// ============================================================================
// MOCK DATA - Simulating Backend API Responses
// ============================================================================
import {
  FetchData,
  PostData,
  DeleteData,
  UpdateData,
} from "../../js/api/crud.js";

const MOCK_QUESTIONS_DB = {
  1: {
    statement: "What is the capital of France?",
    topic: "Geography",
    topicId: 1,
    correctAnswer: "B",
    image: null,
    mimetype: null,
    options: {
      A: { id: 101, text: "London" },
      B: { id: 102, text: "Paris" },
      C: { id: 103, text: "Berlin" },
      D: { id: 104, text: "Madrid" },
    },
  },
  2: {
    statement: "Which planet is known as the Red Planet?",
    topic: "Astronomy",
    topicId: 2,
    correctAnswer: "C",
    image: null,
    mimetype: null,
    options: {
      A: { id: 201, text: "Venus" },
      B: { id: 202, text: "Jupiter" },
      C: { id: 203, text: "Mars" },
      D: { id: 204, text: "Saturn" },
    },
  },
  3: {
    statement: "What is the result of 15 + 27?",
    topic: "Mathematics",
    topicId: 3,
    correctAnswer: "A",
    image: null,
    mimetype: null,
    options: {
      A: { id: 301, text: "42" },
      B: { id: 302, text: "41" },
      C: { id: 303, text: "43" },
      D: { id: 304, text: "44" },
    },
  },
  4: {
    statement: "Who wrote 'Romeo and Juliet'?",
    topic: "Literature",
    topicId: 4,
    correctAnswer: "D",
    image: null,
    mimetype: null,
    options: {
      A: { id: 401, text: "Charles Dickens" },
      B: { id: 402, text: "Mark Twain" },
      C: { id: 403, text: "Jane Austen" },
      D: { id: 404, text: "William Shakespeare" },
    },
  },
  5: {
    statement: "What is the chemical symbol for gold?",
    topic: "Chemistry",
    topicId: 5,
    correctAnswer: "B",
    image: null,
    mimetype: null,
    options: {
      A: { id: 501, text: "Go" },
      B: { id: 502, text: "Au" },
      C: { id: 503, text: "Gd" },
      D: { id: 504, text: "Ag" },
    },
  },
  6: {
    statement: "In which year did World War II end?",
    topic: "History",
    topicId: 6,
    correctAnswer: "C",
    image: null,
    mimetype: null,
    options: {
      A: { id: 601, text: "1943" },
      B: { id: 602, text: "1944" },
      C: { id: 603, text: "1945" },
      D: { id: 604, text: "1946" },
    },
  },
  7: {
    statement: "What is the largest ocean on Earth?",
    topic: "Geography",
    topicId: 1,
    correctAnswer: "A",
    image: null,
    mimetype: null,
    options: {
      A: { id: 701, text: "Pacific Ocean" },
      B: { id: 702, text: "Atlantic Ocean" },
      C: { id: 703, text: "Indian Ocean" },
      D: { id: 704, text: "Arctic Ocean" },
    },
  },
  8: {
    statement: "How many continents are there on Earth?",
    topic: "Geography",
    topicId: 1,
    correctAnswer: "D",
    image: null,
    mimetype: null,
    options: {
      A: { id: 801, text: "5" },
      B: { id: 802, text: "6" },
      C: { id: 803, text: "8" },
      D: { id: 804, text: "7" },
    },
  },
  9: {
    statement: "What is the speed of light in vacuum (approximately)?",
    topic: "Physics",
    topicId: 7,
    correctAnswer: "B",
    image: null,
    mimetype: null,
    options: {
      A: { id: 901, text: "300,000 km/h" },
      B: { id: 902, text: "300,000 km/s" },
      C: { id: 903, text: "150,000 km/s" },
      D: { id: 904, text: "500,000 km/s" },
    },
  },
  10: {
    statement:
      "Which programming language is known for its use in web development?",
    topic: "Computer Science",
    topicId: 8,
    correctAnswer: "C",
    image: null,
    mimetype: null,
    options: {
      A: { id: 1001, text: "Python" },
      B: { id: 1002, text: "C++" },
      C: { id: 1003, text: "JavaScript" },
      D: { id: 1004, text: "Assembly" },
    },
  },
  11: {
    statement: "What is the powerhouse of the cell?",
    topic: "Biology",
    topicId: 9,
    correctAnswer: "A",
    image: null,
    mimetype: null,
    options: {
      A: { id: 1101, text: "Mitochondria" },
      B: { id: 1102, text: "Nucleus" },
      C: { id: 1103, text: "Ribosome" },
      D: { id: 1104, text: "Chloroplast" },
    },
  },
  12: {
    statement: "Who painted the Mona Lisa?",
    topic: "Art",
    topicId: 10,
    correctAnswer: "B",
    image: null,
    mimetype: null,
    options: {
      A: { id: 1201, text: "Vincent van Gogh" },
      B: { id: 1202, text: "Leonardo da Vinci" },
      C: { id: 1203, text: "Pablo Picasso" },
      D: { id: 1204, text: "Michelangelo" },
    },
  },
};

const MOCK_TEMPLATE_QUIZZES = [
  {
    quiz_id: 1,
    title: "Science Fundamentals",
    description:
      "Test your knowledge of basic science concepts across multiple disciplines",
    questions: [2, 5, 9, 11],
  },
  {
    quiz_id: 2,
    title: "World Geography",
    description: "Explore your understanding of world geography and locations",
    questions: [1, 7, 8],
  },
  {
    quiz_id: 3,
    title: "Arts & Literature",
    description: "Questions about famous works of art and literature",
    questions: [4, 12],
  },
  {
    quiz_id: 4,
    title: "History & Culture",
    description:
      "Journey through important historical events and cultural milestones",
    questions: [6, 4, 1],
  },
  {
    quiz_id: 5,
    title: "Technology & Innovation",
    description: "Test your tech knowledge from programming to physics",
    questions: [10, 9, 5],
  },
];

// API Simulation Class
class MockAPI {
  static async getRandomQuiz() {
    await this.delay(500);
    const questionCount = Math.floor(Math.random() * 4) + 5;
    const allQuestionIds = Object.keys(MOCK_QUESTIONS_DB).map(Number);
    const selectedIds = this.shuffleArray(allQuestionIds).slice(
      0,
      questionCount,
    );
    return { questions: selectedIds };
  }

  static async getRandomExercise() {
    await this.delay(500);
    const questionCount = Math.floor(Math.random() * 3) + 3;
    const allQuestionIds = Object.keys(MOCK_QUESTIONS_DB).map(Number);
    const selectedIds = this.shuffleArray(allQuestionIds).slice(
      0,
      questionCount,
    );
    return { questions: selectedIds };
  }

  static async getQuestion(questionId) {
    await this.delay(300);
    const question = MOCK_QUESTIONS_DB[questionId];
    if (!question) {
      throw new Error(`Question ${questionId} not found`);
    }
    return { question: { ...question } };
  }

  static async getTemplateQuizzes() {
    await this.delay(400);
    return MOCK_TEMPLATE_QUIZZES;
  }

  static async getTemplateQuiz(quizId) {
    await this.delay(400);
    const quiz = MOCK_TEMPLATE_QUIZZES.find((q) => q.quiz_id === quizId);
    if (!quiz) {
      throw new Error(`Template quiz ${quizId} not found`);
    }
    return quiz;
  }

  static delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
}

// ============================================================================
// APPLICATION LOGIC
// ============================================================================

// Application State
let currentMode = null; // 'exercise' or 'quiz'
let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let selectedAnswer = null;
let quizTimer = null;
let timeRemaining = 0;
let currentTemplateQuiz = null;

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  goHome();
  initEventListeners();
});

// Initialize all event listeners
function initEventListeners() {
  // Mode selection cards
  document.querySelectorAll(".mode-card").forEach((card) => {
    card.addEventListener("click", handleModeSelection);
  });

  // Back buttons
  document.getElementById("templateBackBtn")?.addEventListener("click", goHome);
  document
    .getElementById("exitQuizBtn")
    ?.addEventListener("click", confirmExit);
  document.getElementById("backHomeBtn")?.addEventListener("click", goHome);

  // Question buttons
  document.getElementById("submitBtn")?.addEventListener("click", submitAnswer);
  document.getElementById("nextBtn")?.addEventListener("click", nextQuestion);
  document.getElementById("retryBtn")?.addEventListener("click", retryQuiz);
}

// Handle mode card clicks
function handleModeSelection(event) {
  const mode = event.currentTarget.getAttribute("data-mode");
  switch (mode) {
    case "exercise":
      showExerciseStart();
      break;
    case "quiz":
      showQuizStart();
      break;
    case "template":
      showTemplateQuizzes();
      break;
  }
}

// Navigation Functions
function goHome() {
  showScreen("homeScreen");
  resetQuizState();
}

function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
  });
  document.getElementById(screenId).classList.add("active");
}

function resetQuizState() {
  currentMode = null;
  currentQuestions = [];
  currentQuestionIndex = 0;
  userAnswers = [];
  selectedAnswer = null;
  currentTemplateQuiz = null;
  if (quizTimer) {
    clearInterval(quizTimer);
    quizTimer = null;
  }
  timeRemaining = 0;
}

// Mode Selection
async function showExerciseStart() {
  currentMode = "exercise";
  const max_size = 12;
  try {
    const response = await FetchData(`/quiz/random`, true);
    console.log(response.data);
    await loadQuestions(response.data.questions);
    startQuiz();
  } catch (error) {
    alert("Error loading exercise: " + error.message);
  }
}

async function showQuizStart() {
  const max_size = 20;
  currentMode = "quiz";
  try {
    const response = await FetchData(`/quiz/random`, true);
    console.log(response.data);
    await loadQuestions(response.data.questions);
    startQuiz();
  } catch (error) {
    alert("Error loading quiz: " + error.message);
  }
}

async function showTemplateQuizzes() {
  showScreen("templateScreen");
  try {
    const templates = await FetchData("/quizzes", true);
    renderTemplateList(templates.data.quizzes);
  } catch (error) {
    alert("Error loading templates: " + error.message);
  }
}

function renderTemplateList(templates) {
  const container = document.getElementById("templateList");
  container.innerHTML = templates
    .map(
      (template) => `
        <div class="template-item" data-quiz-id="${template.quiz_id}">
            <h3>${template.title}</h3>
            <p>${template.description}</p>
            <div class="template-meta">
                <span>📝 ${template.questions.length} questions</span>
                <span>⏱️ 20 minutes</span>
            </div>
        </div>
    `,
    )
    .join("");

  // Add event listeners to template items
  container.querySelectorAll(".template-item").forEach((item) => {
    item.addEventListener("click", function () {
      const quizId = parseInt(this.getAttribute("data-quiz-id"));
      startTemplateQuiz(quizId);
    });
  });
}

async function startTemplateQuiz(quizId) {
  currentMode = "quiz";
  try {
    currentTemplateQuiz = await FetchData(`/quiz/${quizId}`, true);
    console.log(currentTemplateQuiz.data.questions);
    await loadQuestions(currentTemplateQuiz.data.questions);
    startQuiz();
  } catch (error) {
    alert("Error loading template quiz: " + error.message);
  }
}

// Load Questions
async function loadQuestions(questionIds) {
  console.log("Loading questions:", questionIds);
  currentQuestions = [];
  for (const id of questionIds) {
    try {
      const response = await FetchData(`/question/${id}`, true);
      console.log(response);
      currentQuestions.push({
        id: id,
        ...response.data.question,
      });
    } catch (error) {
      console.error(`Error loading question ${id}:`, error);
    }
  }
}

// Start Quiz
function startQuiz() {
  currentQuestionIndex = 0;
  userAnswers = [];
  showScreen("questionScreen");

  // Initialize timer for quiz mode
  if (currentMode === "quiz") {
    timeRemaining = 20 * 60; // 20 minutes in seconds
    startTimer();
  } else {
    document.getElementById("timerDisplay").style.display = "none";
  }

  displayQuestion();
}

// Timer Functions
function startTimer() {
  const timerDisplay = document.getElementById("timerDisplay");
  timerDisplay.style.display = "block";

  updateTimerDisplay();

  quizTimer = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();

    if (timeRemaining <= 0) {
      clearInterval(quizTimer);
      autoSubmitQuiz();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const timerDisplay = document.getElementById("timerDisplay");
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  // Change timer color based on time remaining
  timerDisplay.classList.remove("warning", "danger");
  if (timeRemaining <= 60) {
    timerDisplay.classList.add("danger");
  } else if (timeRemaining <= 300) {
    timerDisplay.classList.add("warning");
  }
}

function autoSubmitQuiz() {
  alert("Time is up! Your quiz will be submitted automatically.");
  showResults();
}

// Display Question
function displayQuestion() {
  const question = currentQuestions[currentQuestionIndex];
  selectedAnswer = null;

  // Update counter
  document.getElementById("questionCounter").textContent =
    `Question ${currentQuestionIndex + 1} of ${currentQuestions.length}`;

  // Update topic badge
  document.getElementById("topicBadge").textContent = question.topic;

  // Update question text
  document.getElementById("questionText").textContent = question.statement;

  // Handle image
  const imageContainer = document.getElementById("questionImage");
  if (question.image && question.mimetype) {
    imageContainer.innerHTML = `
            <img src="data:${question.mimetype};base64,${question.image}" alt="Question image">
        `;
  } else {
    imageContainer.innerHTML = "";
  }

  // Shuffle and display options
  displayOptions(question);

  // Update progress bar
  const progress = (currentQuestionIndex / currentQuestions.length) * 100;
  document.getElementById("progressFill").style.width = `${progress}%`;

  // Reset buttons and feedback
  document.getElementById("submitBtn").style.display = "inline-block";
  document.getElementById("nextBtn").style.display = "none";
  document.getElementById("feedbackContainer").classList.remove("show");
}

function displayOptions(question) {
  const container = document.getElementById("optionsContainer");

  // Shuffle options while keeping track of correct answer
  const optionKeys = Object.keys(question.options);
  const shuffledKeys = shuffleOptions(optionKeys);

  container.innerHTML = shuffledKeys
    .map(
      (key) => `
        <div class="option" data-answer="${key}">
            <span class="option-label">${key}</span>
            <span class="option-text">${question.options[key].text}</span>
        </div>
    `,
    )
    .join("");

  // Add event listeners to options
  container.querySelectorAll(".option").forEach((option) => {
    option.addEventListener("click", function () {
      const answer = this.getAttribute("data-answer");
      selectOption(answer);
    });
  });
}

function shuffleOptions(optionKeys) {
  const shuffled = [...optionKeys];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function selectOption(answer) {
  // Only allow selection if answer hasn't been submitted
  if (document.getElementById("submitBtn").style.display === "none") {
    return;
  }

  selectedAnswer = answer;

  // Update UI
  document.querySelectorAll(".option").forEach((option) => {
    option.classList.remove("selected");
  });
  document.querySelector(`[data-answer="${answer}"]`).classList.add("selected");
}

// Submit Answer
function submitAnswer() {
  if (!selectedAnswer) {
    alert("Please select an answer before submitting.");
    return;
  }

  const question = currentQuestions[currentQuestionIndex];
  const isCorrect = selectedAnswer === question.correctAnswer;

  // Store user answer
  userAnswers.push({
    questionIndex: currentQuestionIndex,
    question: question.statement,
    topic: question.topic,
    selectedAnswer: selectedAnswer,
    correctAnswer: question.correctAnswer,
    isCorrect: isCorrect,
  });

  // Disable options
  document.querySelectorAll(".option").forEach((option) => {
    option.classList.add("disabled");
    option.style.pointerEvents = "none";
  });

  // Show feedback for exercise mode
  if (currentMode === "exercise") {
    showFeedback(isCorrect, question);
    document.getElementById("submitBtn").style.display = "none";
    document.getElementById("nextBtn").style.display = "inline-block";
  } else {
    // For quiz mode, just move to next question
    setTimeout(() => {
      nextQuestion();
    }, 300);
  }
}

function showFeedback(isCorrect, question) {
  const feedbackContainer = document.getElementById("feedbackContainer");
  const correctOption = question.options[question.correctAnswer];

  // Highlight correct and incorrect answers
  document.querySelectorAll(".option").forEach((option) => {
    const optionAnswer = option.getAttribute("data-answer");
    if (optionAnswer === question.correctAnswer) {
      option.classList.add("correct");
    } else if (optionAnswer === selectedAnswer && !isCorrect) {
      option.classList.add("incorrect");
    }
  });

  // Show feedback message
  if (isCorrect) {
    feedbackContainer.className = "feedback-container correct show";
    feedbackContainer.innerHTML = `
            <div class="feedback-header">
                <span>✓</span> Correct!
            </div>
            <div class="feedback-text">
                Great job! You selected the right answer.
            </div>
        `;
  } else {
    feedbackContainer.className = "feedback-container incorrect show";
    feedbackContainer.innerHTML = `
            <div class="feedback-header">
                <span>✗</span> Incorrect
            </div>
            <div class="feedback-text">
                The correct answer is <strong>${question.correctAnswer}: ${correctOption.text}</strong>
            </div>
        `;
  }
}

// Next Question
function nextQuestion() {
  currentQuestionIndex++;

  if (currentQuestionIndex < currentQuestions.length) {
    displayQuestion();
  } else {
    showResults();
  }
}

// Show Results
function showResults() {
  if (quizTimer) {
    clearInterval(quizTimer);
  }

  showScreen("resultsScreen");

  const totalQuestions = currentQuestions.length;
  const correctAnswers = userAnswers.filter((a) => a.isCorrect).length;
  const incorrectAnswers = totalQuestions - correctAnswers;
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);

  // Update results icon and title based on performance
  const resultsIcon = document.getElementById("resultsIcon");
  const resultsTitle = document.getElementById("resultsTitle");

  if (percentage >= 80) {
    resultsIcon.textContent = "🎉";
    resultsTitle.textContent = "Excellent Work!";
  } else if (percentage >= 60) {
    resultsIcon.textContent = "👍";
    resultsTitle.textContent = "Good Job!";
  } else {
    resultsIcon.textContent = "📚";
    resultsTitle.textContent = "Keep Learning!";
  }

  // Update score display
  document.getElementById("scoreDisplay").textContent = `${percentage}%`;

  // Update summary
  const summaryContainer = document.getElementById("resultsSummary");
  summaryContainer.innerHTML = `
        <div class="result-stat">
            <div class="stat-value">${totalQuestions}</div>
            <div class="stat-label">Total Questions</div>
        </div>
        <div class="result-stat correct">
            <div class="stat-value">${correctAnswers}</div>
            <div class="stat-label">Correct</div>
        </div>
        <div class="result-stat incorrect">
            <div class="stat-value">${incorrectAnswers}</div>
            <div class="stat-label">Incorrect</div>
        </div>
    `;

  // Show detailed results
  const detailedContainer = document.getElementById("detailedResults");
  detailedContainer.innerHTML = `
        <h3>Question Review</h3>
        ${userAnswers
          .map((answer, index) => {
            const question = currentQuestions[answer.questionIndex];
            return `
                <div class="result-item ${answer.isCorrect ? "correct" : "incorrect"}">
                    <div class="result-question">
                        ${index + 1}. ${answer.question}
                    </div>
                    <div class="result-answer">
                        <strong>Your answer:</strong> ${answer.selectedAnswer} - ${question.options[answer.selectedAnswer].text}<br>
                        ${!answer.isCorrect ? `<strong>Correct answer:</strong> ${answer.correctAnswer} - ${question.options[answer.correctAnswer].text}` : ""}
                    </div>
                </div>
            `;
          })
          .join("")}
    `;

  // Show retry button for template quizzes
  const retryBtn = document.getElementById("retryBtn");
  if (currentTemplateQuiz) {
    retryBtn.style.display = "inline-block";
  } else {
    retryBtn.style.display = "none";
  }
}

function retryQuiz() {
  if (currentTemplateQuiz) {
    startTemplateQuiz(currentTemplateQuiz.data.quiz_id);
  }
}

// Confirm Exit
function confirmExit() {
  const confirmed = confirm(
    "Are you sure you want to exit? Your progress will be lost.",
  );
  if (confirmed) {
    goHome();
  }
}
