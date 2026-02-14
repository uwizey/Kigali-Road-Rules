// ===== SAMPLE DATA (Replace with backend API calls) =====

import { FetchData, PostData, DeleteData, UpdateData } from "../js/api/crud.js";

const sampleContent = {
  "overview-intro": {
    title: "Introduction to Road Safety",
    format: "text",
    content: `
            <div class="content-section">
                <h3>Welcome to Kigali Road Rules</h3>
                <p>Road safety is a crucial aspect of daily life in Kigali. Understanding and following traffic rules not only keeps you safe but also protects other road users.</p>
                <p>This comprehensive guide will help you understand:</p>
                <ul>
                    <li>Basic traffic rules and regulations</li>
                    <li>Traffic signs and their meanings</li>
                    <li>Right of way principles</li>
                    <li>Safe driving practices</li>
                </ul>
            </div>
        `,
  },
  "traffic-signs-warning": {
    title: "Warning Traffic Signs",
    format: "mixed",
    content: `
            <div class="explanation-card">
                <div class="explanation-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="explanation-text">
                    <h4>Important to Know</h4>
                    <p>Warning signs alert drivers to potential hazards ahead. They are typically diamond-shaped with yellow backgrounds and black symbols.</p>
                </div>
            </div>
            <div class="content-with-image">
                <div class="content-text">
                    <h3>Understanding Warning Signs</h3>
                    <p>Warning signs are designed to inform drivers of upcoming road conditions that may not be readily apparent. These signs give you time to slow down or make necessary adjustments to your driving.</p>
                    <p>Common warning signs include curves ahead, intersection warnings, pedestrian crossings, and school zones.</p>
                </div>
                <div class="content-image">
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect fill='%23fef3c7' width='300' height='200'/%3E%3Cpolygon points='150,40 260,160 40,160' fill='%23f59e0b' stroke='%23000' stroke-width='3'/%3E%3Ctext x='150' y='120' font-size='60' text-anchor='middle' fill='%23000'%3E!%3C/text%3E%3C/svg%3E" alt="Warning Sign">
                </div>
            </div>
        `,
  },
};

const sampleQuizzes = {
  overview: {
    name: "Overview Quiz",
    questions: [
      {
        id: 1,
        text: "What is the primary purpose of traffic rules?",
        topic: "Overview",
        image: null,
        options: {
          A: "To generate revenue for the government",
          B: "To ensure safety for all road users",
          C: "To slow down traffic",
          D: "To make driving difficult",
        },
        correctAnswer: "B",
      },
      {
        id: 2,
        text: "Who must follow traffic rules?",
        topic: "Overview",
        image: null,
        options: {
          A: "Only car drivers",
          B: "Only motorcycle riders",
          C: "All road users including pedestrians",
          D: "Only commercial vehicles",
        },
        correctAnswer: "C",
      },
      {
        id: 3,
        text: "What should you do when approaching a pedestrian crossing?",
        topic: "Overview",
        image: null,
        options: {
          A: "Speed up to pass quickly",
          B: "Honk loudly",
          C: "Slow down and be prepared to stop",
          D: "Ignore it if no one is crossing",
        },
        correctAnswer: "C",
      },
    ],
  },
  "traffic-signs": {
    name: "Traffic Signs Quiz",
    questions: [
      {
        id: 4,
        text: "What does a red octagonal sign indicate?",
        topic: "Traffic Signs",
        image: null,
        options: {
          A: "Stop completely",
          B: "Yield to traffic",
          C: "Speed limit",
          D: "No parking",
        },
        correctAnswer: "A",
      },
      {
        id: 5,
        text: "What color are warning signs typically?",
        topic: "Traffic Signs",
        image: null,
        options: {
          A: "Red and white",
          B: "Yellow and black",
          C: "Blue and white",
          D: "Green and white",
        },
        correctAnswer: "B",
      },
    ],
  },
  "road-rules": {
    name: "Road Rules Quiz",
    questions: [
      {
        id: 6,
        text: "What is the typical speed limit in residential areas in Kigali?",
        topic: "Road Rules",
        image: null,
        options: {
          A: "30 km/h",
          B: "40 km/h",
          C: "50 km/h",
          D: "60 km/h",
        },
        correctAnswer: "B",
      },
      {
        id: 7,
        text: "When can you park on the left side of the road?",
        topic: "Road Rules",
        image: null,
        options: {
          A: "Never",
          B: "Only on one-way streets",
          C: "Anytime if no parking restrictions",
          D: "Only at night",
        },
        correctAnswer: "B",
      },
    ],
  },
};

// ===== GLOBAL VARIABLES =====
let currentMode = "content";
let currentQuiz = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let quizStartTime = null;
let timerInterval = null;

// ===== MOBILE MENU TOGGLE =====
function toggleMobileMenu() {
  const links = document.querySelector(".links");
  links.classList.toggle("active");
}

// ===== SIDEBAR TOGGLE =====
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");

  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
}

function closeSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");

  sidebar.classList.remove("active");
  overlay.classList.remove("active");
}

// ===== MODE SWITCHING =====
function switchMode(mode) {
  console.log(`Switching to ${mode} mode`);

  currentMode = mode;

  // Update mode buttons
  document
    .getElementById("contentModeBtn")
    .classList.toggle("active", mode === "content");
  document
    .getElementById("qaModeBtn")
    .classList.toggle("active", mode === "qa");

  // Update dashboard title
  document.getElementById("dashTitle").textContent =
    `Dashboard - ${mode === "content" ? "Content" : "Q&A"} Mode`;

  // Toggle sidebar content
  document
    .getElementById("contentSidebar")
    .classList.toggle("active", mode === "content");
  document
    .getElementById("qaSidebar")
    .classList.toggle("active", mode === "qa");

  // Toggle main content views
  document
    .getElementById("contentModeView")
    .classList.toggle("active", mode === "content");
  document
    .getElementById("qaModeView")
    .classList.toggle("active", mode === "qa");

  // Reset views
  if (mode === "content") {
    backToWelcome();
  } else {
    backToQuizSelection();
  }

  // Close mobile sidebar
  if (window.innerWidth <= 768) {
    closeSidebar();
  }
}

// ===== CONTENT MODE FUNCTIONS =====
function toggleTopic(headerElement) {
  const subtopics = headerElement.nextElementSibling;
  const isActive = headerElement.classList.contains("active");

  // Close all topics
  document.querySelectorAll(".topic-header").forEach((header) => {
    header.classList.remove("active");
  });
  document.querySelectorAll(".subtopics").forEach((sub) => {
    sub.classList.remove("open");
  });

  // Open clicked topic if it wasn't active
  if (!isActive) {
    headerElement.classList.add("active");
    subtopics.classList.add("open");
  }
}

function loadContent(topic, subtopic) {
  console.log(`Loading content: ${topic} - ${subtopic}`);

  // Update active subtopic
  document.querySelectorAll(".subtopic-link").forEach((link) => {
    link.classList.remove("active");
  });
  event.target.classList.add("active");

  // Show content display area
  document.getElementById("welcomeScreen").style.display = "none";
  document.getElementById("contentDisplay").style.display = "block";

  // Get content from sample data (replace with backend API call)
  const contentKey = `${topic}-${subtopic}`;
  const content = sampleContent[contentKey];

  if (content) {
    document.getElementById("contentTitle").textContent = content.title;

    // Hide all formats
    document.querySelectorAll(".content-format").forEach((format) => {
      format.style.display = "none";
    });

    // Show appropriate format
    if (content.format === "text") {
      const textFormat = document.getElementById("textFormat");
      textFormat.style.display = "block";
      textFormat.querySelector(".text-content").innerHTML = content.content;
    } else if (content.format === "image") {
      const imageFormat = document.getElementById("imageFormat");
      imageFormat.style.display = "block";
      imageFormat.querySelector(".image-content").innerHTML = content.content;
    } else if (content.format === "mixed") {
      const mixedFormat = document.getElementById("mixedFormat");
      mixedFormat.style.display = "block";
      mixedFormat.querySelector(".mixed-content").innerHTML = content.content;
    }
  } else {
    // Show placeholder content
    document.getElementById("contentTitle").textContent =
      `${topic} - ${subtopic}`;
    const textFormat = document.getElementById("textFormat");
    textFormat.style.display = "block";
    textFormat.querySelector(".text-content").innerHTML = `
            <div class="content-section">
                <h3>${subtopic.replace("-", " ").toUpperCase()}</h3>
                <p>This content will be loaded from the backend.</p>
                <p>Content for: ${topic} > ${subtopic}</p>
            </div>
        `;
  }

  // Close sidebar on mobile
  if (window.innerWidth <= 768) {
    closeSidebar();
  }
}

function backToWelcome() {
  document.getElementById("welcomeScreen").style.display = "block";
  document.getElementById("contentDisplay").style.display = "none";

  // Clear active subtopic
  document.querySelectorAll(".subtopic-link").forEach((link) => {
    link.classList.remove("active");
  });
}

function bookmarkContent() {
  console.log("Bookmarking content...");
  alert("Content bookmarked! (Feature to be implemented)");
}

function printContent() {
  console.log("Printing content...");
  window.print();
}

// ===== Q&A MODE FUNCTIONS =====
function startQuiz(quizTopic) {
  console.log(`Starting quiz: ${quizTopic}`);

  // Get quiz data (replace with backend API call)
  currentQuiz = sampleQuizzes[quizTopic];

  if (!currentQuiz) {
    alert("Quiz not available yet!");
    return;
  }

  // Initialize quiz state
  currentQuestionIndex = 0;
  userAnswers = new Array(currentQuiz.questions.length).fill(null);
  quizStartTime = Date.now();

  // Show quiz interface
  document.getElementById("quizStartScreen").style.display = "none";
  document.getElementById("quizInterface").style.display = "block";
  document.getElementById("quizResults").style.display = "none";

  // Start timer
  startQuizTimer();

  // Load first question
  loadQuestion();

  // Close sidebar on mobile
  if (window.innerWidth <= 768) {
    closeSidebar();
  }
}

function startQuizTimer() {
  let seconds = 0;
  timerInterval = setInterval(() => {
    seconds++;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    document.getElementById("quizTimer").textContent =
      `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, 1000);
}

function stopQuizTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function loadQuestion() {
  const question = currentQuiz.questions[currentQuestionIndex];
  const totalQuestions = currentQuiz.questions.length;

  // Update progress
  document.getElementById("currentQuestion").textContent =
    currentQuestionIndex + 1;
  document.getElementById("totalQuestions").textContent = totalQuestions;
  const progressPercent = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  document.getElementById("progressFill").style.width = `${progressPercent}%`;

  // Update question content
  document.getElementById("questionTopic").textContent = question.topic;
  document.getElementById("questionText").textContent = question.text;

  // Handle question image
  const imageContainer = document.getElementById("questionImageContainer");
  if (question.image) {
    imageContainer.style.display = "block";
    document.getElementById("questionImage").src = question.image;
  } else {
    imageContainer.style.display = "none";
  }

  // Update options
  document.getElementById("optionAText").textContent = question.options.A;
  document.getElementById("optionBText").textContent = question.options.B;
  document.getElementById("optionCText").textContent = question.options.C;
  document.getElementById("optionDText").textContent = question.options.D;

  // Clear previous selection
  document.querySelectorAll('input[name="answer"]').forEach((input) => {
    input.checked = false;
  });

  // Restore previous answer if exists
  if (userAnswers[currentQuestionIndex]) {
    document.getElementById(
      `answer${userAnswers[currentQuestionIndex]}`,
    ).checked = true;
    updateNavigationButtons();
  } else {
    updateNavigationButtons();
  }

  // Update button visibility
  document.getElementById("prevBtn").disabled = currentQuestionIndex === 0;

  if (currentQuestionIndex === totalQuestions - 1) {
    document.getElementById("nextBtn").style.display = "none";
    document.getElementById("submitBtn").style.display = "inline-flex";
  } else {
    document.getElementById("nextBtn").style.display = "inline-flex";
    document.getElementById("submitBtn").style.display = "none";
  }
}

function selectAnswer(option) {
  userAnswers[currentQuestionIndex] = option;
  document.getElementById(`answer${option}`).checked = true;
  updateNavigationButtons();
}

function updateNavigationButtons() {
  const hasAnswer = userAnswers[currentQuestionIndex] !== null;
  const nextBtn = document.getElementById("nextBtn");
  const submitBtn = document.getElementById("submitBtn");

  nextBtn.disabled = !hasAnswer;
  submitBtn.disabled = !hasAnswer;
}

function previousQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    loadQuestion();
  }
}

function nextQuestion() {
  if (currentQuestionIndex < currentQuiz.questions.length - 1) {
    currentQuestionIndex++;
    loadQuestion();
  }
}

function submitQuiz() {
  // Check if all questions are answered
  const unanswered = userAnswers.filter((a) => a === null).length;
  if (unanswered > 0) {
    if (
      !confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)
    ) {
      return;
    }
  }

  console.log("Submitting quiz...");
  console.log("User answers:", userAnswers);

  // Stop timer
  stopQuizTimer();

  // Calculate score
  calculateAndShowResults();
}

function calculateAndShowResults() {
  let correctCount = 0;

  currentQuiz.questions.forEach((question, index) => {
    if (userAnswers[index] === question.correctAnswer) {
      correctCount++;
    }
  });

  const totalQuestions = currentQuiz.questions.length;
  const incorrectCount = totalQuestions - correctCount;
  const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

  // Calculate time taken
  const timeTaken = Math.floor((Date.now() - quizStartTime) / 1000);
  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;
  const timeString = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  // Update results display
  document.getElementById("scorePercentage").textContent =
    `${scorePercentage}%`;
  document.getElementById("scoreRatio").textContent =
    `${correctCount}/${totalQuestions}`;
  document.getElementById("correctCount").textContent = correctCount;
  document.getElementById("incorrectCount").textContent = incorrectCount;
  document.getElementById("totalTime").textContent = timeString;

  // Update score circle
  const circle = document.getElementById("scoreCircle");
  const circumference = 2 * Math.PI * 90;
  const offset = circumference - (scorePercentage / 100) * circumference;
  circle.style.strokeDashoffset = offset;

  // Update results icon and message based on score
  const resultsIcon = document.getElementById("resultsIcon");
  const resultsMessage = document.getElementById("resultsMessage");

  resultsIcon.className = "results-icon";

  if (scorePercentage >= 90) {
    resultsIcon.classList.add("excellent");
    resultsIcon.innerHTML = '<i class="fas fa-trophy"></i>';
    resultsMessage.textContent = "Excellent work! You've mastered this topic!";
  } else if (scorePercentage >= 70) {
    resultsIcon.classList.add("good");
    resultsIcon.innerHTML = '<i class="fas fa-thumbs-up"></i>';
    resultsMessage.textContent = "Good job! You have a solid understanding!";
  } else if (scorePercentage >= 50) {
    resultsIcon.classList.add("fair");
    resultsIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
    resultsMessage.textContent = "Fair performance. Keep practicing!";
  } else {
    resultsIcon.classList.add("poor");
    resultsIcon.innerHTML = '<i class="fas fa-redo"></i>';
    resultsMessage.textContent = "Keep studying and try again!";
  }

  // Show results screen
  document.getElementById("quizInterface").style.display = "none";
  document.getElementById("quizResults").style.display = "block";

  console.log(
    `Quiz completed: ${correctCount}/${totalQuestions} (${scorePercentage}%)`,
  );
}

function reviewAnswers() {
  console.log("Reviewing answers...");
  alert("Review functionality will be implemented with backend integration");
  // TODO: Implement answer review showing correct/incorrect answers
}

function retakeQuiz() {
  console.log("Retaking quiz...");
  currentQuestionIndex = 0;
  userAnswers = new Array(currentQuiz.questions.length).fill(null);
  quizStartTime = Date.now();

  document.getElementById("quizResults").style.display = "none";
  document.getElementById("quizInterface").style.display = "block";

  startQuizTimer();
  loadQuestion();
}

function backToQuizSelection() {
  stopQuizTimer();
  document.getElementById("quizStartScreen").style.display = "block";
  document.getElementById("quizInterface").style.display = "none";
  document.getElementById("quizResults").style.display = "none";
  currentQuiz = null;
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  // Logo click
  const logo = document.querySelector(".logo");
  if (logo) {
    logo.addEventListener("click", () => {
      const link = logo.getAttribute("data-link");
      if (link) window.location.href = link;
    });
  }

  // Mobile menu toggle
  const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", toggleMobileMenu);
  }

  // Menu button (sidebar toggle)
  const menuBtn = document.getElementById("menuBtn");
  if (menuBtn) {
    menuBtn.addEventListener("click", toggleSidebar);
  }

  // Overlay click (close sidebar)
  const overlay = document.getElementById("overlay");
  if (overlay) {
    overlay.addEventListener("click", closeSidebar);
  }

  // Mode selector buttons
  const contentModeBtn = document.getElementById("contentModeBtn");
  const qaModeBtn = document.getElementById("qaModeBtn");

  if (contentModeBtn) {
    contentModeBtn.addEventListener("click", () => {
      switchMode(contentModeBtn.getAttribute("data-mode"));
    });
  }

  if (qaModeBtn) {
    qaModeBtn.addEventListener("click", () => {
      switchMode(qaModeBtn.getAttribute("data-mode"));
    });
  }

  // Topic headers (content mode)
  const topicHeaders = document.querySelectorAll(".topic-header");
  topicHeaders.forEach((header) => {
    header.addEventListener("click", () => toggleTopic(header));
  });

  // Subtopic links (content mode)
  const subtopicLinks = document.querySelectorAll(".subtopic-link");
  subtopicLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const topic = link.getAttribute("data-topic");
      const subtopic = link.getAttribute("data-subtopic");
      loadContent(topic, subtopic);
    });
  });

  // Back button (content mode)
  const backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.addEventListener("click", backToWelcome);
  }

  // Bookmark button
  const bookmarkBtn = document.getElementById("bookmarkBtn");
  if (bookmarkBtn) {
    bookmarkBtn.addEventListener("click", bookmarkContent);
  }

  // Print button
  const printBtn = document.getElementById("printBtn");
  if (printBtn) {
    printBtn.addEventListener("click", printContent);
  }

  // Quiz topic items (Q&A mode)
  const quizTopicItems = document.querySelectorAll(".quiz-topic-item");
  quizTopicItems.forEach((item) => {
    item.addEventListener("click", () => {
      const quizTopic = item.getAttribute("data-quiz");
      startQuiz(quizTopic);
    });
  });

  // Answer options
  const answerOptions = document.querySelectorAll(".answer-option");
  answerOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const answer = option.getAttribute("data-answer");
      selectAnswer(answer);
    });
  });

  // Quiz navigation buttons
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const submitBtn = document.getElementById("submitBtn");

  if (prevBtn) {
    prevBtn.addEventListener("click", previousQuestion);
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", nextQuestion);
  }

  if (submitBtn) {
    submitBtn.addEventListener("click", submitQuiz);
  }

  // Quiz results buttons
  const reviewBtn = document.getElementById("reviewBtn");
  const retakeBtn = document.getElementById("retakeBtn");
  const backToTopicsBtn = document.getElementById("backToTopicsBtn");

  if (reviewBtn) {
    reviewBtn.addEventListener("click", reviewAnswers);
  }

  if (retakeBtn) {
    retakeBtn.addEventListener("click", retakeQuiz);
  }

  if (backToTopicsBtn) {
    backToTopicsBtn.addEventListener("click", backToQuizSelection);
  }

  // Close mobile menu when clicking outside
  document.addEventListener("click", (e) => {
    const links = document.querySelector(".links");
    const toggle = document.querySelector(".mobile-menu-toggle");

    if (links && links.classList.contains("active")) {
      if (!links.contains(e.target) && !toggle.contains(e.target)) {
        links.classList.remove("active");
      }
    }
  });

  // Handle window resize
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      closeSidebar();
      const links = document.querySelector(".links");
      if (links) {
        links.classList.remove("active");
      }
    }
  });
}

// ===== INITIALIZATION =====
document.addEventListener("DOMContentLoaded", async function () {
  console.log("User Dashboard initialized");

  // Load user email
  const useremail = document.getElementById("userEmail");
  if (useremail) {
    try {
      const response = await FetchData("/user/profile", true);
      console.log(response);
      if (response.success) {
        useremail.textContent = response.data.data.email;
      } else {
        useremail.textContent = "Unknown User";
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      useremail.textContent = "Unknown User";
    }
  }

  // Setup all event listeners
  setupEventListeners();

  // Set initial mode
  switchMode("content");

  console.log("Sample data loaded:", { sampleContent, sampleQuizzes });
});
