// ===== IMPORTS =====
import { FetchData, PostData, DeleteData, UpdateData } from "../js/api/crud.js";

// ===== SAMPLE DATA =====
let topics = [
  {
    id: 1,
    name: "Mathematics",
    description: "Advanced mathematical concepts and problem solving",
    subtopics: [
      { id: 1, name: "Algebra", topicId: 1 },
      { id: 2, name: "Geometry", topicId: 1 },
      { id: 3, name: "Calculus", topicId: 1 },
    ],
  },
  {
    id: 2,
    name: "Physics",
    description: "Fundamental physics principles and applications",
    subtopics: [
      { id: 4, name: "Mechanics", topicId: 2 },
      { id: 5, name: "Thermodynamics", topicId: 2 },
    ],
  },
  {
    id: 3,
    name: "Chemistry",
    description: "Chemical reactions and molecular structures",
    subtopics: [
      { id: 6, name: "Organic Chemistry", topicId: 3 },
      { id: 7, name: "Inorganic Chemistry", topicId: 3 },
    ],
  },
];

let questions = [
  {
    id: 1,
    statement: "What is the derivative of x²?",
    topic: "Mathematics",
    topicId: 1,
    image: null,
    options: {
      A: "2x",
      B: "x",
      C: "x²",
      D: "2",
    },
    correctAnswer: "A",
    created: "2026-01-20",
  },
  {
    id: 2,
    statement: "What is Newton's first law of motion?",
    topic: "Physics",
    topicId: 2,
    image: null,
    options: {
      A: "F = ma",
      B: "An object in motion stays in motion",
      C: "Every action has an equal reaction",
      D: "Energy is conserved",
    },
    correctAnswer: "B",
    created: "2026-01-21",
  },
];

let users = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "admin",
    joined: "2025-12-15",
    status: "active",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "user",
    joined: "2026-01-05",
    status: "active",
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "user",
    joined: "2026-01-10",
    status: "inactive",
  },
];

let exams = [
  {
    id: 1,
    name: "Mid-Term Mathematics Exam",
    description: "Comprehensive test covering algebra and geometry",
    questions: [1, 2],
    created: "2026-01-15",
  },
  {
    id: 2,
    name: "Physics Final Exam",
    description:
      "Complete physics assessment including mechanics and thermodynamics",
    questions: [2],
    created: "2026-01-20",
  },
];

let nextTopicId = 4;
let nextSubtopicId = 8;
let nextQuestionId = 3;
let nextUserId = 4;
let nextExamId = 3;
let selectedQuestionIds = [];

// ===== NAVIGATION FUNCTIONS =====

/**
 * Toggle mobile menu visibility
 */
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

/**
 * Toggle sidebar visibility
 */
function toggleSidebar() {
  var sidebar = document.querySelector(".left-sidebar");
  var overlay = document.querySelector(".sidebar-overlay");

  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
}

/**
 * Close sidebar
 */
function closeSidebar() {
  var sidebar = document.querySelector(".left-sidebar");
  var overlay = document.querySelector(".sidebar-overlay");

  sidebar.classList.remove("active");
  overlay.classList.remove("active");
}

/**
 * Show specific section and update navigation
 * @param {string} sectionId - The ID of the section to show
 */
function showSection(sectionId) {
  // Hide all sections
  var sections = document.querySelectorAll(".admin-section");
  sections.forEach(function (section) {
    section.classList.remove("active");
  });

  // Show selected section
  document.getElementById(sectionId).classList.add("active");

  // Update sidebar nav
  var navItems = document.querySelectorAll(".nav-item");
  navItems.forEach(function (item) {
    item.classList.remove("active");
  });

  // Update header links
  var headerLinks = document.querySelectorAll(".links a");
  headerLinks.forEach(function (link) {
    link.style.background = "";
    link.style.color = "";
  });

  // Close mobile menu
  var links = document.querySelector(".links");
  if (window.innerWidth <= 768) {
    links.style.display = "none";
    closeSidebar();
  }

  console.log("Navigated to " + sectionId + " section");
}

// ===== CHARTS INITIALIZATION =====

/**
 * Initialize all dashboard charts
 */
async function initializeCharts() {
  // Questions by Topic Chart
  var questionsCtx = document.getElementById("questionsChart").getContext("2d");
  const response = await FetchData("/stats/topics", true);
  const data = response.data.stats || [];
  console.log(response);
  new Chart(questionsCtx, {
    type: "doughnut",
    data: {
      labels: response.data.labels,
      datasets: [
        {
          data: response.data.data,
          backgroundColor: response.data.colors,
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });

  // User Growth Chart
  var usersCtx = document.getElementById("usersChart").getContext("2d");
  new Chart(usersCtx, {
    type: "line",
    data: {
      labels: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
      datasets: [
        {
          label: "New Users",
          data: [450, 589, 720, 890, 1200, 1542],
          borderColor: "#0097b2",
          backgroundColor: "rgba(0, 151, 178, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  // Activity Chart
  var activityCtx = document.getElementById("activityChart").getContext("2d");
  new Chart(activityCtx, {
    type: "bar",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          label: "Tests Taken",
          data: [1200, 1500, 1300, 1700, 1400, 900, 800],
          backgroundColor: "#0097b2",
          borderRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  // Performance Chart
  var performanceCtx = document
    .getElementById("performanceChart")
    .getContext("2d");
  new Chart(performanceCtx, {
    type: "radar",
    data: {
      labels: ["Math", "Physics", "Chemistry", "Biology", "History"],
      datasets: [
        {
          label: "Average Score",
          data: [85, 78, 82, 75, 88],
          backgroundColor: "rgba(0, 151, 178, 0.2)",
          borderColor: "#0097b2",
          pointBackgroundColor: "#0097b2",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "#0097b2",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
        },
      },
    },
  });
}

// ===== TOPICS MANAGEMENT =====

/**
 * Load and display all topics
 */
async function loadTopics() {
  var topicsList = document.getElementById("topicsList");
  topicsList.innerHTML = "";
  const response = await FetchData("/topic", true);
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
                    ${topic.subtopics
                      .map(function (sub) {
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
                      })
                      .join("")}
                </div>
            </div>
        `;
    topicsList.appendChild(topicCard);
  });
}

/**
 * Open topic modal for add or edit
 * @param {number|null} topicId - ID of topic to edit, or null for new topic
 */
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
    const topic = response.data.topic;
    if (topic) {
      title.textContent = "Edit Topic";
      document.getElementById("topicId").value = topic.id;
      document.getElementById("topicName").value = topic.name;
      document.getElementById("topicDescription").value =
        topic.description || "";

      // Show subtopics for editing
      subtopicsSection.style.display = "block";
      loadSubtopicsForEdit(topic);
    }
  } else {
    title.textContent = "Add New Topic";
  }

  modal.classList.add("active");
}

/**
 * Close topic modal
 */
function closeTopicModal() {
  document.getElementById("topicModal").classList.remove("active");
}

/**
 * Load subtopics for editing
 * @param {Object} topic - Topic object containing subtopics
 */
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

/**
 * Add a new subtopic input field
 */
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

/**
 * Remove subtopic field
 * @param {HTMLElement} button - The remove button element
 * @param {number|null} subtopicId - ID of subtopic to remove
 */
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

/**
 * Handle topic form submission
 * @param {Event} event - Form submit event
 */
async function handleTopicSubmit(event) {
  event.preventDefault();

  var topicId = document.getElementById("topicId").value;
  var name = document.getElementById("topicName").value;
  var description = document.getElementById("topicDescription").value;

  if (topicId) {
    // Update existing topic
    const res = await UpdateData(`/topic`, { id: topicId, topicName: name });
    if (res.success) {
      alert("Topic updated!");
    } else {
      alert("Failed to update topic");
    }
  } else {
    // Create new topic
    const payload = { topicName: name };
    const res = await PostData("/topic", payload, true);
    if (res.success) {
      alert("Topic created!");
    } else {
      alert("Failed to add topic");
    }
  }

  loadTopics();
  loadTopicOptions();
  closeTopicModal();
}

/**
 * Edit a topic
 * @param {number} topicId - ID of topic to edit
 */
function editTopic(topicId) {
  openTopicModal(topicId);
}

/**
 * Delete a topic
 * @param {number} topicId - ID of topic to delete
 */
async function deleteTopic(topicId) {
  if (
    confirm(
      "Are you sure you want to delete this topic? This will also delete all associated subtopics.",
    )
  ) {
    const response = await DeleteData(`/topic`, { id: topicId }, true);

    if (response.success) {
      alert("Topic " + topicId + " deleted");
    } else {
      alert("Failed to delete Topic " + topicId);
    }
    loadTopics();
    loadTopicOptions();
  }
}

/**
 * Add a new subtopic
 * @param {number} topicId - ID of parent topic
 */
async function addSubtopic(topicId) {
  openSubtopicModal(topicId);
}

/**
 * Edit a subtopic
 * @param {number} topicId - ID of parent topic
 * @param {number} subtopicId - ID of subtopic to edit
 */
function editSubtopic(topicId, subtopicId) {
  openSubtopicModal(topicId, subtopicId);
}

/**
 * Open subtopic modal
 * @param {number} topicId - ID of parent topic
 * @param {number|null} subtopicId - ID of subtopic to edit, or null for new
 */
async function openSubtopicModal(topicId, subtopicId) {
  alert(`topic ${topicId} subtopic ${subtopicId}`);
  var modal = document.getElementById("subtopicModal");
  var form = document.getElementById("subtopicForm");
  var title = document.getElementById("subtopicModalTitle");

  form.reset();
  document.getElementById("subtopicTopicId").value = topicId;

  if (subtopicId) {
    const response = await FetchData(`/topic/${subtopicId}`, true);
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

/**
 * Close subtopic modal
 */
function closeSubtopicModal() {
  document.getElementById("subtopicModal").classList.remove("active");
}

/**
 * Handle subtopic form submission
 * @param {Event} event - Form submit event
 */
async function handleSubtopicSubmit(event) {
  event.preventDefault();

  var topicId = parseInt(document.getElementById("subtopicTopicId").value);
  var subtopicId = document.getElementById("subtopicId").value;
  var name = document.getElementById("subtopicName").value.trim();

  if (subtopicId) {
    // Update existing subtopic
    const payload = { id: subtopicId, topicName: name };
    const response = await UpdateData(`/topic`, payload, true);
    if (response.success) {
      alert("Subtopic " + subtopicId + ' updated to "' + name + '"');
    } else {
      alert(" Failed to update Subtopic");
    }
  } else {
    // Create new subtopic
    const payload = { subtopicName: name, parentId: topicId };
    const response = await PostData("/subtopic", payload, true);

    if (response.success) {
      alert('Subtopic "' + name + '" added to topic ' + topicId);
    } else {
      alert(" Failed to Add Subtopic");
    }
  }

  loadTopics();
  closeSubtopicModal();
}

/**
 * Delete a subtopic
 * @param {number} topicId - ID of parent topic
 * @param {number} subtopicId - ID of subtopic to delete
 */
async function deleteSubtopic(topicId, subtopicId) {
  if (confirm("Are you sure you want to delete this subtopic?")) {
    const response = await DeleteData(`/topic`, { id: subtopicId }, true);

    if (response.success) {
      alert("SubTopic " + subtopicId + " deleted");
    } else {
      alert("Failed to delete subTopic " + subtopicId);
    }
    loadTopics();
    loadTopicOptions();
  }
}

// ===== QUESTIONS MANAGEMENT =====

/**
 * Load and display all questions
 */
async function loadQuestions() {
  var tbody = document.getElementById("questionsTableBody");
  tbody.innerHTML = "";
  const response = await FetchData("/questions", true);
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

/**
 * Open question modal for add or edit
 * @param {number|null} questionId - ID of question to edit, or null for new
 */
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
    const question = response.data.question;

    if (question) {
      title.textContent = "Edit Question";
      document.getElementById("questionId").value = questionId;
      document.getElementById("questionStatement").value = question.statement;
      document.getElementById("questionTopic").value = question.topicId;
      console.log(question.options);
      document.getElementById("optionA").value = question.options.A.text;
      document
        .getElementById("optionA")
        .setAttribute("option-id", question.options.A.id);
      document.getElementById("optionB").value = question.options.B.text;
      document
        .getElementById("optionB")
        .setAttribute("option-id", question.options.B.id);
      document.getElementById("optionC").value = question.options.C.text;
      document
        .getElementById("optionC")
        .setAttribute("option-id", question.options.C.id);
      document.getElementById("optionD").value = question.options.D.text;
      document
        .getElementById("optionD")
        .setAttribute("option-id", question.options.D.id);
      document.querySelector(
        'input[value="' + question.correctAnswer + '"]',
      ).checked = true;

      if (question.image) {
        var imgSrc = question.image;
        var removeImageContainer = document.getElementById(
          "removeImageContainer",
        );

        // Check if it's already a data URI (base64)
        if (!imgSrc.startsWith("data:") && !imgSrc.startsWith("http")) {
          // If it's raw base64 without the data URI prefix, add it
          imgSrc = "data:image/png;base64," + imgSrc;
        }

        imagePreview.innerHTML =
          '<img src="' + imgSrc + '" alt="Question Image">';
        imagePreview.classList.add("show");
        removeImageContainer.style.display = "block";
      } else {
        // Clear preview if no image
        imagePreview.innerHTML = "";
        imagePreview.classList.remove("show");
      }
    }
  } else {
    title.textContent = "Add New Question";
  }

  modal.classList.add("active");
}

/**
 * Close question modal
 */
function closeQuestionModal() {
  var removeImageContainer = document.getElementById("removeImageContainer");
  removeImageContainer.style.display = "none";
  document.getElementById("questionModal").classList.remove("active");
}

/**
 * Preview uploaded image
 * @param {Event} event - File input change event
 */
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
  modalTopicSelect.innerHTML =
    '<option value="">Select topic</option>' + optionsHtml;
}
async function populateTopicSelects_2(select) {
  let optionsHtml = "";
  const response = await FetchData("/topic", true);

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
/**
 * Handle question form submission
 * @param {Event} event - Form submit event
 */
async function handleQuestionSubmit(event) {
  event.preventDefault();

  var questionId = document.getElementById("questionId").value;
  var statement = document.getElementById("questionStatement").value;
  var topicId = parseInt(document.getElementById("questionTopic").value);

  var correctAnswer = document.querySelector(
    'input[name="correctAnswer"]:checked',
  ).value;

  // Create FormData object
  var formData = new FormData();

  // Append all the fields
  formData.append("statement", statement);
  formData.append("topicId", topicId);
  formData.append("correctAnswer", correctAnswer);
  var imageInput = document.getElementById("questionImage");
  var removeImageCheckbox = document.getElementById("removeImage");
  // Handle image - send raw file if available
  if (removeImageCheckbox && removeImageCheckbox.checked) {
    // Scenario 3: User wants to REMOVE the image
    formData.append("removeImage", "true");
  } else if (imageInput && imageInput.files && imageInput.files[0]) {
    // Scenario 2: User uploaded a NEW image
    formData.append("image", imageInput.files[0]);
  }

  if (questionId) {
    // Update existing question
    formData.append("id", questionId);
    var options = {
      A: {
        id: document.getElementById("optionA").getAttribute("option-id"),
        text: document.getElementById("optionA").value,
      },
      B: {
        id: document.getElementById("optionB").getAttribute("option-id"),
        text: document.getElementById("optionB").value,
      },
      C: {
        id: document.getElementById("optionC").getAttribute("option-id"),
        text: document.getElementById("optionC").value,
      },
      D: {
        id: document.getElementById("optionD").getAttribute("option-id"),
        text: document.getElementById("optionD").value,
      },
    };
    formData.append("options", JSON.stringify(options));

    const response = await UpdateData("/question", formData, true);

    if (response.success) {
      alert("Question updated successfully");
    } else {
      alert("Failed to update question");
    }
  } else {
    // Append options as JSON string
    
    var options = {
      A: document.getElementById("optionA").value,
      B: document.getElementById("optionB").value,
      C: document.getElementById("optionC").value,
      D: document.getElementById("optionD").value,
    };

    formData.append("options", JSON.stringify(options));
    const response = await PostData("/question", formData, true);
    if (response.success) {
      alert("New question created");
    } else {
      alert("Failed to create new question");
    }
  }

  loadQuestions();
  closeQuestionModal();
}

/**
 * Edit a question
 * @param {number} questionId - ID of question to edit
 */
function editQuestion(questionId) {
  openQuestionModal(questionId);
}

/**
 * Delete a question
 * @param {number} questionId - ID of question to delete
 */
async function deleteQuestion(questionId) {
  if (confirm("Are you sure you want to delete this question?")) {
    const response = await DeleteData(`/question`, { id: questionId }, true);

    if (response.success) {
      alert("Question " + questionId + " deleted");;
    } else {
      alert("Failed to delete question " + questionId);
    }
    loadQuestions();
  }
}

/**
 * Filter questions based on topic and search term
 */
function filterQuestions() {
  var filterTopic = document.getElementById("filterTopic").value;
  const rows = document.querySelectorAll("tr[data-topic-id]");

  rows.forEach((row) => {
    // If id is falsy (nothing passed), show all. Otherwise, match the ID.
    if (
      !filterTopic ||
      row.getAttribute("data-topic-id") === filterTopic.toString()
    ) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });

  /*   // Usage:
  filterRows(); // Shows everything

  displayFilteredQuestions(filtered); */
}

/**
 * Search questions
 */
function searchQuestions() {
  filterQuestions();
}
// Add this event listener
document.getElementById("searchQuestion").addEventListener("input", function(e) {
  var searchText = e.target.value.toLowerCase().trim();
  var tableRows = document.querySelectorAll("#questionsTable tbody tr");
  
  tableRows.forEach(function(row) {
    var questionText = row.querySelector(".question-text");
    
    if (questionText) {
      var content = questionText.textContent.toLowerCase();
      
      if (content.includes(searchText)) {
        row.style.display = ""; // Show the row
      } else {
        row.style.display = "none"; // Hide the row
      }
    }
  });
});

/**
 * Display filtered questions
 * @param {Array} filtered - Array of filtered questions
 */
function displayFilteredQuestions(filtered) {
  var tbody = document.getElementById("questionsTableBody");
  tbody.innerHTML = "";

  filtered.forEach(function (question) {
    var row = document.createElement("tr");
    row.innerHTML = `
            <td>${question.id}</td>
            <td class="question-text" title="${question.statement}">${question.statement}</td>
            <td>${question.topic}</td>
            <td class="image-indicator">${question.image ? '<i class="fas fa-image" style="color: #0097b2;"></i>' : "-"}</td>
            <td>${question.created}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-edit" data-action="edit-question" data-id="${question.id}">Edit</button>
                    <button class="btn-delete" data-action="delete-question" data-id="${question.id}">Delete</button>
                </div>
            </td>
        `;
    tbody.appendChild(row);
  });
}

/**
 * Load topic options into select dropdowns
 */
function loadTopicOptions() {
  populateTopicSelects();
}

// ===== USERS MANAGEMENT =====

/**
 * Load and display all users
 */
async function loadUsers() {
  var tbody = document.getElementById("usersTableBody");
  tbody.innerHTML = "";
  const response = await FetchData("/users", true);
  users = response.data.users;
  document.getElementById("totalUsers").textContent = users.length;
  users.forEach(function (user) {
    var row = document.createElement("tr");
    row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.email}</td>
            <td>${user.role.toUpperCase()}</td>
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

/**
 * Open user modal for add or edit
 * @param {number|null} userId - ID of user to edit, or null for new
 */
function openUserModal(userId) {
  var modal = document.getElementById("userModal");
  var form = document.getElementById("userForm");
  var title = document.getElementById("userModalTitle");
  var passwordHelp = document.getElementById("passwordHelp");
  var passwordInput = document.getElementById("userPassword");

  form.reset();
  document.getElementById("userId").value = "";

  if (userId) {
    var user = users.find(function (u) {
      return u.id === userId;
    });
    if (user) {
      title.textContent = "Edit User";
      document.getElementById("userId").value = user.id;
      document.getElementById("userName").value = user.name;
      document.getElementById("userEmail").value = user.email;
      document.getElementById("userRole").value = user.role;
      document.getElementById("userStatus").value = user.status;
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

/**
 * Close user modal
 */
function closeUserModal() {
  document.getElementById("userModal").classList.remove("active");
}

/**
 * Handle user form submission
 * @param {Event} event - Form submit event
 */
function handleUserSubmit(event) {
  event.preventDefault();

  var userId = document.getElementById("userId").value;
  var name = document.getElementById("userName").value;
  var email = document.getElementById("userEmail").value;
  var role = document.getElementById("userRole").value;
  var password = document.getElementById("userPassword").value;
  var status = document.getElementById("userStatus").value;

  if (userId) {
    // Update existing user
    var user = users.find(function (u) {
      return u.id === parseInt(userId);
    });
    if (user) {
      user.name = name;
      user.email = email;
      user.role = role;
      user.status = status;
      if (password) {
        console.log("Password updated for user " + userId);
      }
      console.log("User updated:", user);
    }
  } else {
    // Create new user
    var newUser = {
      id: nextUserId++,
      name: name,
      email: email,
      role: role,
      status: status,
      joined: new Date().toISOString().split("T")[0],
    };
    users.push(newUser);
    console.log("User created:", newUser);
    console.log("Password set for new user");
  }

  loadUsers();
  closeUserModal();
}

/**
 * Edit a user
 * @param {number} userId - ID of user to edit
 */
function editUser(userId) {
  openUserModal(userId);
}

/**
 * Delete a user
 * @param {number} userId - ID of user to delete
 */
function deleteUser(userId) {
  if (confirm("Are you sure you want to delete this user?")) {
    users = users.filter(function (u) {
      return u.id !== userId;
    });
    loadUsers();
    console.log("User " + userId + " deleted");
  }
}

/**
 * Filter users based on role and search term
 */
function filterUsers() {
  var filterRole = document.getElementById("filterUserRole").value;
  var searchTerm = document.getElementById("searchUser").value.toLowerCase();

  var filtered = users.filter(function (u) {
    var matchesRole = !filterRole || u.role === filterRole;
    var matchesSearch =
      !searchTerm ||
      u.name.toLowerCase().includes(searchTerm) ||
      u.email.toLowerCase().includes(searchTerm);
    return matchesRole && matchesSearch;
  });

  displayFilteredUsers(filtered);
}

/**
 * Search users
 */
function searchUsers() {
  filterUsers();
}

/**
 * Display filtered users
 * @param {Array} filtered - Array of filtered users
 */
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

/**
 * Load and display all exams
 */
async function loadExams() {
  var examsList = document.getElementById("examsList");
  examsList.innerHTML = "";

 
  const response = await FetchData("/quizzes", true);
  const exams = response.data.quizzes
   if (exams.length === 0) {
     examsList.innerHTML =
       '<p style="text-align: center; color: var(--gray); padding: 40px;">No exams created yet. Click "Add New Exam" to get started.</p>';
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
                    <span><strong>${exam.questions.length}</strong> Questions</span>
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

/**
 * Open exam modal for add or edit
 * @param {number|null} examId - ID of exam to edit, or null for new
 */
async function openExamModal(examId) {
  var modal = document.getElementById("examModal");
  var form = document.getElementById("examForm");
  var title = document.getElementById("examModalTitle");

  form.reset();
  document.getElementById("examId").value = "";
  selectedQuestionIds = [];

  // Load topic filter options
  var topicFilter = document.getElementById("examQuestionTopicFilter");
  topicFilter.innerHTML = '<option value="">All Topics</option>';
  populateTopicSelects_2(topicFilter);

  if (examId) {
    const response= await FetchData(`/quiz/${examId}`);
    const exam = response.data
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

/**
 * Close exam modal
 */
function closeExamModal() {
  document.getElementById("examModal").classList.remove("active");
  selectedQuestionIds = [];
}

/**
 * Load available questions for exam selection
 */
async function loadAvailableQuestions() {
  var container = document.getElementById("availableQuestions");
  var topicFilter = document.getElementById("examQuestionTopicFilter").value;
  var searchTerm = document
    .getElementById("examQuestionSearch")
    .value.toLowerCase();
  const response = await FetchData("/questions", true);
  questions = response.data.questions;
  // var filtered = questions.filter(function (q) {
  //   var matchesTopic = !topicFilter || q.topic === topicFilter;
  //   var matchesSearch =
  //     !searchTerm || q.statement.toLowerCase().includes(searchTerm);
  //   return matchesTopic && matchesSearch;
  // });

  // if (filtered.length === 0) {
  //   container.innerHTML =
  //     '<p style="text-align: center; color: var(--gray); padding: 20px;">No questions found.</p>';
  //   return;
  // }

  container.innerHTML = "";
  questions.forEach(function (question) {
    console.log(question)
    var isSelected =
      selectedQuestionIds.indexOf(question.question_id) > -1;
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

/**
 * Filter available questions for exam
 */
function filterAvailableQuestions() {
  loadAvailableQuestions();
}

/**
 * Toggle question selection for exam
 * @param {number} questionId - ID of question to toggle
 */
function toggleQuestionSelection(questionId) {
  var index = selectedQuestionIds.indexOf(questionId);
  if (index > -1) {
    selectedQuestionIds.splice(index, 1);
  } else {
    selectedQuestionIds.push(questionId);
  }
  updateSelectedQuestionsDisplay();
}

/**
 * Update selected questions display
 */
function updateSelectedQuestionsDisplay() {
  console.log(selectedQuestionIds)
  var container = document.getElementById("selectedQuestions");
  var countSpan = document.getElementById("selectedCount");

  countSpan.textContent = selectedQuestionIds.length;

  if (selectedQuestionIds.length === 0) {
    container.innerHTML =
      '<p class="no-selection">No questions selected yet</p>';
    return;
  }

  container.innerHTML = "";
  selectedQuestionIds.forEach(function (questionId) {
    var question = questions.find(function (q) {
      return q.question_id === questionId;
    });
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

/**
 * Remove question from exam selection
 * @param {number} questionId - ID of question to remove
 */
function removeQuestionFromSelection(questionId) {
  var index = selectedQuestionIds.indexOf(questionId);
  if (index > -1) {
    selectedQuestionIds.splice(index, 1);
  }

  // Update checkbox
  var checkbox = document.getElementById("q-" + questionId);
  if (checkbox) {
    checkbox.checked = false;
  }

  updateSelectedQuestionsDisplay();
}

/**
 * Handle exam form submission
 * @param {Event} event - Form submit event
 */
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
    // Update existing exam
    const payload = {
      quiz_id: examId,
      title: name,
      description: description,
      questions: selectedQuestionIds.slice(),
    };
    const res = await UpdateData("/quiz", payload, true);
    if (res.success) {
      alert("Exam updated successfully");
    } else {
      alert("Failed to update Exam");
    }

  } else {
    // Create new exam
    var payload = {
      title: name,
      description: description,
      questions: selectedQuestionIds.slice(),
    };

    const res = await PostData("/quiz", payload, true);
    if (res.success) {
      alert("Exam created successfully");;
    } else {
      alert("Failed to add Exam");
    }
  }

  loadExams();
  closeExamModal();
}

/**
 * Edit an exam
 * @param {number} examId - ID of exam to edit
 */
function editExam(examId) {
  openExamModal(examId);
}

/**
 * Delete an exam
 * @param {number} examId - ID of exam to delete
 */
async function deleteExam(examId) {
  if (confirm("Are you sure you want to delete this exam?")) {
    const res = await DeleteData("/quiz", {id: examId}, true);
    if (res.success) {
      alert("Exam " + examId + " deleted");;
    } else {
      alert("Failed to delete Exam");
    }
    loadExams();
  }
}

// ===== EVENT LISTENERS =====

/**
 * Setup all event listeners when DOM is loaded
 */
document.addEventListener("DOMContentLoaded", function () {
  console.log("Admin Dashboard loaded successfully");

  // Initialize all sections
  initializeCharts();
  loadTopics();
  loadQuestions();
  loadUsers();
  loadExams();
  loadTopicOptions();


  // ===== Logout Event Listener =====
  document
    .getElementById("btn-logout")
    .addEventListener("click", async function () {
      var response = await FetchData("/logout", true);
      if (response.success) {
        localStorage.removeItem("token");
        alert("Succeessfull Logout");
        window.location.href = "../auth/login.html";
      } else {
        alert("logout failed");
      }
    });

  // ===== Navigation Event Listeners =====

  // Sidebar toggle button
  var sidebarToggle = document.getElementById("sidebar-toggle");
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", toggleSidebar);
  }

  // Mobile menu toggle button
  var mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", toggleMobileMenu);
  }

  // Sidebar overlay click
  var sidebarOverlay = document.getElementById("sidebar-overlay");
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", closeSidebar);
  }

  // Header navigation links
  var headerLinks = document.querySelectorAll(".links a[data-section]");
  headerLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var section = this.getAttribute("data-section");
      showSection(section);
    });
  });

  // Sidebar navigation buttons
  var navItems = document.querySelectorAll(".nav-item[data-section]");
  navItems.forEach(function (item) {
    item.addEventListener("click", function () {
      var section = this.getAttribute("data-section");
      showSection(section);
    });
  });

  // ===== Add New Item Button Event Listeners =====

  // Add Topic
  var btnAddTopic = document.getElementById("btn-add-topic");
  if (btnAddTopic) {
    btnAddTopic.addEventListener("click", function () {
      openTopicModal(null);
    });
  }

  // Add Question
  var btnAddQuestion = document.getElementById("btn-add-question");
  if (btnAddQuestion) {
    btnAddQuestion.addEventListener("click", function () {
      openQuestionModal(null);
    });
  }

  // Add User
  var btnAddUser = document.getElementById("btn-add-user");
  if (btnAddUser) {
    btnAddUser.addEventListener("click", function () {
      openUserModal(null);
    });
  }

  // Add Exam
  var btnAddExam = document.getElementById("btn-add-exam");
  if (btnAddExam) {
    btnAddExam.addEventListener("click", function () {
      openExamModal(null);
    });
  }

  // Add Subtopic Field
  var btnAddSubtopicField = document.getElementById("btn-add-subtopic-field");
  if (btnAddSubtopicField) {
    btnAddSubtopicField.addEventListener("click", addSubtopicField);
  }

  // ===== Form Submit Event Listeners =====

  // Topic Form
  var topicForm = document.getElementById("topicForm");
  if (topicForm) {
    topicForm.addEventListener("submit", handleTopicSubmit);
  }

  // Question Form
  var questionForm = document.getElementById("questionForm");
  if (questionForm) {
    questionForm.addEventListener("submit", handleQuestionSubmit);
  }

  // User Form
  var userForm = document.getElementById("userForm");
  if (userForm) {
    userForm.addEventListener("submit", handleUserSubmit);
  }

  // Subtopic Form
  var subtopicForm = document.getElementById("subtopicForm");
  if (subtopicForm) {
    subtopicForm.addEventListener("submit", async (e) => {
      await handleSubtopicSubmit(e);
    });
  }

  // Exam Form
  var examForm = document.getElementById("examForm");
  if (examForm) {
    examForm.addEventListener("submit", handleExamSubmit);
  }

  // ===== Filter and Search Event Listeners =====

  // Filter Questions by Topic
  var filterTopic = document.getElementById("filterTopic");
  if (filterTopic) {
    filterTopic.addEventListener("change", filterQuestions);
  }

  // Search Questions
  var searchQuestion = document.getElementById("searchQuestion");
  if (searchQuestion) {
    // searchQuestion.addEventListener("keyup", searchQuestions);
    // Add this event listener
    document
      .getElementById("searchQuestion")
      .addEventListener("input", function (e) {
        var searchText = e.target.value.toLowerCase().trim();
        var tableRows = document.querySelectorAll("#questionsTable tbody tr");

        tableRows.forEach(function (row) {
          var questionText = row.querySelector(".question-text");

          if (questionText) {
            var content = questionText.textContent.toLowerCase();

            if (content.includes(searchText)) {
              row.style.display = ""; // Show the row
            } else {
              row.style.display = "none"; // Hide the row
            }
          }
        });
      });
  }

  // Filter Users by Role
  var filterUserRole = document.getElementById("filterUserRole");
  if (filterUserRole) {
    filterUserRole.addEventListener("change", filterUsers);
  }

  // Search Users
  var searchUser = document.getElementById("searchUser");
  if (searchUser) {
    searchUser.addEventListener("keyup", searchUsers);
  }

  // Filter Exam Questions by Topic
  var examQuestionTopicFilter = document.getElementById(
    "examQuestionTopicFilter",
  );
  if (examQuestionTopicFilter) {
    examQuestionTopicFilter.addEventListener(
      "change",
      filterAvailableQuestions,
    );
  }

  // Search Exam Questions
  var examQuestionSearch = document.getElementById("examQuestionSearch");
  if (examQuestionSearch) {
    examQuestionSearch.addEventListener("keyup", filterAvailableQuestions);
  }

  // ===== File Input Event Listener =====

  // Question Image Preview
  var questionImage = document.getElementById("questionImage");
  if (questionImage) {
    questionImage.addEventListener("change", previewImage);
  }

  // ===== Modal Close Button Event Listeners =====

  // Close buttons with data-modal attribute
  var modalCloseButtons = document.querySelectorAll("[data-modal]");
  modalCloseButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var modalId = this.getAttribute("data-modal");
      var modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.remove("active");
      }
    });
  });

  // ===== Dynamic Action Button Event Listeners (Event Delegation) =====

  // Topics List Actions
  var topicsList = document.getElementById("topicsList");
  if (topicsList) {
    topicsList.addEventListener("click", function (e) {
      var target = e.target.closest("[data-action]");
      if (!target) return;

      var action = target.getAttribute("data-action");
      var id = parseInt(target.getAttribute("data-id"));
      var topicId = parseInt(target.getAttribute("data-topic-id"));

      switch (action) {
        case "edit-topic":
          editTopic(id);
          break;
        case "delete-topic":
          deleteTopic(id);
          break;
        case "add-subtopic":
          addSubtopic(topicId);
          break;
        case "edit-subtopic":
          editSubtopic(topicId, id);
          break;
        case "delete-subtopic":
          deleteSubtopic(topicId, id);
          break;
      }
    });
  }

  // Subtopics List Actions (inside modal)
  var subtopicsList = document.getElementById("subtopicsList");
  if (subtopicsList) {
    subtopicsList.addEventListener("click", function (e) {
      var target = e.target.closest("[data-action]");
      if (!target) return;

      var action = target.getAttribute("data-action");

      if (action === "remove-subtopic-field") {
        var subtopicId = target.getAttribute("data-id")
          ? parseInt(target.getAttribute("data-id"))
          : null;
        removeSubtopicField(target, subtopicId);
      }
    });
  }

  // Questions Table Actions
  var questionsTableBody = document.getElementById("questionsTableBody");
  if (questionsTableBody) {
    questionsTableBody.addEventListener("click", function (e) {
      var target = e.target.closest("[data-action]");
      if (!target) return;

      var action = target.getAttribute("data-action");
      var id = parseInt(target.getAttribute("data-id"));

      switch (action) {
        case "edit-question":
          editQuestion(id);
          break;
        case "delete-question":
          deleteQuestion(id);
          break;
      }
    });
  }

  // Users Table Actions
  var usersTableBody = document.getElementById("usersTableBody");
  if (usersTableBody) {
    usersTableBody.addEventListener("click", function (e) {
      var target = e.target.closest("[data-action]");
      if (!target) return;

      var action = target.getAttribute("data-action");
      var id = parseInt(target.getAttribute("data-id"));

      switch (action) {
        case "edit-user":
          editUser(id);
          break;
        case "delete-user":
          deleteUser(id);
          break;
      }
    });
  }

  // Exams List Actions
  var examsList = document.getElementById("examsList");
  if (examsList) {
    examsList.addEventListener("click", function (e) {
      var target = e.target.closest("[data-action]");
      if (!target) return;

      var action = target.getAttribute("data-action");
      var id = parseInt(target.getAttribute("data-id"));

      switch (action) {
        case "edit-exam":
          editExam(id);
          break;
        case "delete-exam":
          deleteExam(id);
          break;
      }
    });
  }

  // Available Questions Checkboxes
  var availableQuestions = document.getElementById("availableQuestions");
  if (availableQuestions) {
    availableQuestions.addEventListener("change", function (e) {
      if (
        e.target.type === "checkbox" &&
        e.target.hasAttribute("data-question-id")
      ) {
        var questionId = parseInt(e.target.getAttribute("data-question-id"));
        toggleQuestionSelection(questionId);
      }
    });
  }

  // Selected Questions Actions
  var selectedQuestions = document.getElementById("selectedQuestions");
  if (selectedQuestions) {
    selectedQuestions.addEventListener("click", function (e) {
      var target = e.target.closest("[data-action]");
      if (!target) return;

      var action = target.getAttribute("data-action");

      if (action === "remove-selected-question") {
        var id = parseInt(target.getAttribute("data-id"));
        removeQuestionFromSelection(id);
      }
    });
  }

  // ===== Close Mobile Menu on Outside Click =====
  document.addEventListener("click", function (e) {
    var links = document.querySelector(".links");
    var toggle = document.querySelector(".mobile-menu-toggle");

    if (window.innerWidth <= 768 && links.style.display === "flex") {
      if (!links.contains(e.target) && !toggle.contains(e.target)) {
        links.style.display = "none";
      }
    }
  });

  // ===== Close Modals on Outside Click =====
  var modals = document.querySelectorAll(".modal");
  modals.forEach(function (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        modal.classList.remove("active");
      }
    });
  });

  console.log("All data loaded:", {
    topics: topics,
    questions: questions,
    users: users,
    exams: exams,
  });
});
