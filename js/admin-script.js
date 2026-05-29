import { FetchData, PostData, DeleteData, UpdateData } from "../js/api/crud.js";

/**
 * The core engine for all modals and popups.
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
  cancelBtnStyle = "",
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
        ${showCancel ? `<button class="pw-btn pw-btn-cancel" style="${cancelBtnStyle}">${cancelText}</button>` : ""}
        ${showConfirm ? `<button class="pw-btn pw-btn-confirm" style="${confirmBtnStyle}">${confirmText}</button>` : ""}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const closePopup = () => overlay.remove();

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
    showCancel: true,
    cancelBtnStyle: `background: ${iconColor}; color: #fff; border: none;`,
    onCancel: () => {
      console.log(`Popup "${title}" dismissed.`);
    },
  });
}

function handleApiResponse(response) {
  console.log("API Response:", response);
  if (response?.success !== false && response?.status < 400) return false;

  let config = {
    title: "Error",
    icon: "fas fa-exclamation-circle",
    color: "#e74c3c",
  };
  if (response.status === 403)
    config = {
      title: "Access Restricted",
      icon: "fas fa-lock",
      color: "#f39c12",
    };
  else if (response.status === 401)
    config = {
      title: "Session Expired",
      icon: "fas fa-user-shield",
      color: "#3498db",
    };
  else if (response.status >= 500)
    config = { title: "Server Error", icon: "fas fa-server", color: "#c0392b" };
  else if (!response.status)
    config = { title: "Network Issue", icon: "fas fa-wifi", color: "#95a5a6" };

  showInfoPopup(
    config.title,
    response.userMessage || "An unexpected error occurred.",
    config.icon,
    config.color,
  );
  return true;
}

// ── Runtime state ─────────────────────────────────────────────────────────────
let users = [];
let questions = [];
let selectedQuestionIds = [];

// ===== NAVIGATION =====

function toggleMobileMenu() {
  const links = document.querySelector(".links");
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
  document.querySelector(".left-sidebar").classList.toggle("active");
  document.querySelector(".sidebar-overlay").classList.toggle("active");
}

function closeSidebar() {
  document.querySelector(".left-sidebar").classList.remove("active");
  document.querySelector(".sidebar-overlay").classList.remove("active");
}

function showSection(sectionId) {
  document
    .querySelectorAll(".admin-section")
    .forEach((s) => s.classList.remove("active"));
  document.getElementById(sectionId).classList.add("active");
  document
    .querySelectorAll(".nav-item")
    .forEach((i) => i.classList.remove("active"));
  document.querySelectorAll(".links a").forEach((l) => {
    l.style.background = "";
    l.style.color = "";
  });
  const links = document.querySelector(".links");
  if (window.innerWidth <= 768) {
    links.style.display = "none";
    closeSidebar();
  }
}

// ===== CHARTS =====

async function initializeCharts() {
  const questionsCtx = document
    .getElementById("questionsChart")
    .getContext("2d");
  const response = await FetchData("/stats/topics", true);
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
      plugins: { legend: { position: "bottom" } },
    },
  });

  const usersCtx = document.getElementById("usersChart").getContext("2d");
  new Chart(usersCtx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "New Users",
          data: [],
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
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } },
    },
  });

  const activityCtx = document.getElementById("activityChart").getContext("2d");
  new Chart(activityCtx, {
    type: "bar",
    data: {
      labels: [],
      datasets: [
        {
          label: "Tests Taken",
          data: [],
          backgroundColor: "#0097b2",
          borderRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } },
    },
  });

  const performanceCtx = document
    .getElementById("performanceChart")
    .getContext("2d");
  new Chart(performanceCtx, {
    type: "radar",
    data: {
      labels: [],
      datasets: [
        {
          label: "Average Score",
          data: [],
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
      scales: { r: { beginAtZero: true, max: 100 } },
    },
  });
}

// ===== TOPICS =====

async function loadTopics() {
  const topicsList = document.getElementById("topicsList");
  topicsList.innerHTML = "";
  const response = await FetchData("/topic", true);
  if (handleApiResponse(response)) return;
  const data = response.data.topics || [];
  document.getElementById("totalTopics").textContent = data.length;

  data.forEach((topic) => {
    const topicCard = document.createElement("div");
    topicCard.className = "topic-card";
    topicCard.innerHTML = `
      <div class="topic-header-section">
        <div class="topic-info">
          <h3>${topic.name}</h3>
          <p>${topic.description || "No description provided"}</p>
        </div>
        <div class="topic-actions">
          <button class="btn-edit"   data-action="edit-topic"   data-id="${topic.id}">Edit</button>
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
            .map(
              (sub) => `
            <div class="subtopic-item">
              <span>${sub.name}</span>
              <div class="subtopic-actions">
                <button data-action="edit-subtopic"   data-topic-id="${topic.id}" data-id="${sub.id}" title="Edit"><i class="fas fa-edit"></i></button>
                <button data-action="delete-subtopic" data-topic-id="${topic.id}" data-id="${sub.id}" title="Delete"><i class="fas fa-trash"></i></button>
              </div>
            </div>`,
            )
            .join("")}
        </div>
      </div>`;
    topicsList.appendChild(topicCard);
  });
}

async function openTopicModal(topicId) {
  const modal = document.getElementById("topicModal");
  const form = document.getElementById("topicForm");
  const title = document.getElementById("topicModalTitle");
  const subtopicsSection = document.getElementById("subtopicsSection");

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
      document.getElementById("topicDescription").value =
        topic.description || "";
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
  const subtopicsList = document.getElementById("subtopicsList");
  subtopicsList.innerHTML = "";
  topic.subtopics.forEach((sub) => {
    const field = document.createElement("div");
    field.className = "subtopic-field";
    field.innerHTML = `
      <input type="text" value="${sub.name}" data-subtopic-id="${sub.id}">
      <button type="button" data-action="remove-subtopic-field" data-id="${sub.id}">Remove</button>`;
    subtopicsList.appendChild(field);
  });
}

function addSubtopicField() {
  const field = document.createElement("div");
  field.className = "subtopic-field";
  field.innerHTML = `
    <input type="text" placeholder="Enter subtopic name" data-subtopic-id="new">
    <button type="button" data-action="remove-subtopic-field">Remove</button>`;
  document.getElementById("subtopicsList").appendChild(field);
}

function removeSubtopicField(button, subtopicId) {
  if (subtopicId) {
    if (confirm("Are you sure you want to delete this subtopic?"))
      button.parentElement.remove();
  } else {
    button.parentElement.remove();
  }
}

async function handleTopicSubmit(event) {
  event.preventDefault();
  const topicId = document.getElementById("topicId").value;
  const name = document.getElementById("topicName").value;
  const description = document.getElementById("topicDescription").value;

  if (topicId) {
    const response = await UpdateData(
      "/topic",
      { id: topicId, topicName: name },
      true,
    );
    if (handleApiResponse(response)) return;
    alert("Topic updated!");
  } else {
    const response = await PostData("/topic", { topicName: name }, true);
    if (handleApiResponse(response)) return;
  }
  loadTopics();
  loadTopicOptions();
  closeTopicModal();
}

function editTopic(topicId) {
  openTopicModal(topicId);
}

async function deleteTopic(topicId) {
  if (
    confirm(
      "Are you sure you want to delete this topic? This will also delete all associated subtopics.",
    )
  ) {
    const response = await DeleteData("/topic", { id: topicId }, true);
    if (handleApiResponse(response)) return;
    loadTopics();
    loadTopicOptions();
  }
}

function addSubtopic(topicId) {
  openSubtopicModal(topicId);
}
function editSubtopic(topicId, subtopicId) {
  openSubtopicModal(topicId, subtopicId);
}

async function openSubtopicModal(topicId, subtopicId) {
  alert(`topic ${topicId} subtopic ${subtopicId}`);
  const modal = document.getElementById("subtopicModal");
  const form = document.getElementById("subtopicForm");
  const title = document.getElementById("subtopicModalTitle");

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
  const topicId = parseInt(document.getElementById("subtopicTopicId").value);
  const subtopicId = document.getElementById("subtopicId").value;
  const name = document.getElementById("subtopicName").value.trim();

  if (subtopicId) {
    const response = await UpdateData(
      "/topic",
      { id: subtopicId, topicName: name },
      true,
    );
    if (handleApiResponse(response)) return;
  } else {
    const response = await PostData(
      "/subtopic",
      { subtopicName: name, parentId: topicId },
      true,
    );
    if (handleApiResponse(response)) return;
  }
  loadTopics();
  closeSubtopicModal();
}

async function deleteSubtopic(topicId, subtopicId) {
  if (confirm("Are you sure you want to delete this subtopic?")) {
    const response = await DeleteData("/topic", { id: subtopicId }, true);
    if (handleApiResponse(response)) return;
    loadTopics();
    loadTopicOptions();
  }
}

// ===== QUESTIONS =====

async function loadQuestions() {
  const tbody = document.getElementById("questionsTableBody");
  tbody.innerHTML = "";
  const response = await FetchData("/questions", true);
  if (handleApiResponse(response)) return;
  const qs = response.data.questions;
  document.getElementById("totalQuestions").textContent = qs.length;

  qs.forEach((question) => {
    const row = document.createElement("tr");
    row.setAttribute("data-topic-id", `${question.topic_id}`);
    row.innerHTML = `
      <td>${question.question_id}</td>
      <td class="question-text" title="${question.content}">${question.content}</td>
      <td>
        <div class="table-actions">
          <button class="btn-edit"   data-action="edit-question"   data-id="${question.question_id}">Edit</button>
          <button class="btn-delete" data-action="delete-question" data-id="${question.question_id}">Delete</button>
        </div>
      </td>`;
    tbody.appendChild(row);
  });
}

async function openQuestionModal(questionId) {
  const modal = document.getElementById("questionModal");
  const form = document.getElementById("questionForm");
  const title = document.getElementById("questionModalTitle");
  const imagePreview = document.getElementById("imagePreview");

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
        `input[value="${question.correctAnswer}"]`,
      ).checked = true;

      if (question.image) {
        let imgSrc = question.image;
        if (!imgSrc.startsWith("data:") && !imgSrc.startsWith("http")) {
          imgSrc = "data:image/png;base64," + imgSrc;
        }
        imagePreview.innerHTML = `<img src="${imgSrc}" alt="Question Image">`;
        imagePreview.classList.add("show");
        document.getElementById("removeImageContainer").style.display = "block";
      }
    }
  } else {
    title.textContent = "Add New Question";
  }
  modal.classList.add("active");
}

function closeQuestionModal() {
  document.getElementById("removeImageContainer").style.display = "none";
  document.getElementById("questionModal").classList.remove("active");
}

function previewImage(event) {
  const file = event.target.files[0];
  const preview = document.getElementById("imagePreview");
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
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
  const response = await FetchData("/topic", true);
  if (handleApiResponse(response)) return;

  let optionsHtml = "";
  (response.data.topics || []).forEach((cat) => {
    optionsHtml += `<optgroup label="${cat.name}"><option value="${cat.id}">${cat.name}</option>`;
    cat.subtopics.forEach((sub) => {
      optionsHtml += `<option value="${sub.id}">${sub.name}</option>`;
    });
    optionsHtml += "</optgroup>";
  });
  filterTopic.innerHTML = '<option value="">All Topics</option>' + optionsHtml;
  modalTopicSelect.innerHTML =
    '<option value="">Select topic</option>' + optionsHtml;
}

async function populateTopicSelects_2(select) {
  const response = await FetchData("/topic", true);
  if (handleApiResponse(response)) return;

  let optionsHtml = "";
  (response.data.topics || []).forEach((cat) => {
    optionsHtml += `<optgroup label="${cat.name}"><option value="${cat.id}">${cat.name}</option>`;
    cat.subtopics.forEach((sub) => {
      optionsHtml += `<option value="${sub.id}">${sub.name}</option>`;
    });
    optionsHtml += "</optgroup>";
  });
  select.innerHTML = '<option value="">Select topic</option>' + optionsHtml;
}

async function handleQuestionSubmit(event) {
  event.preventDefault();
  const questionId = document.getElementById("questionId").value;
  const statement = document.getElementById("questionStatement").value;
  const topicId = parseInt(document.getElementById("questionTopic").value);
  const correctAnswer = document.querySelector(
    'input[name="correctAnswer"]:checked',
  ).value;

  const formData = new FormData();
  formData.append("statement", statement);
  formData.append("topicId", topicId);
  formData.append("correctAnswer", correctAnswer);

  const imageInput = document.getElementById("questionImage");
  const removeImageCheckbox = document.getElementById("removeImage");

  if (removeImageCheckbox?.checked) {
    formData.append("removeImage", "true");
  } else if (imageInput?.files?.[0]) {
    formData.append("image", imageInput.files[0]);
  }

  if (questionId) {
    formData.append("id", questionId);
    formData.append(
      "options",
      JSON.stringify({
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
      }),
    );
    const response = await UpdateData("/question", formData, true);
    if (handleApiResponse(response)) return;
  } else {
    formData.append(
      "options",
      JSON.stringify({
        A: document.getElementById("optionA").value,
        B: document.getElementById("optionB").value,
        C: document.getElementById("optionC").value,
        D: document.getElementById("optionD").value,
      }),
    );
    const response = await PostData("/question", formData, true);
    if (handleApiResponse(response)) return;
  }
  loadQuestions();
  closeQuestionModal();
}

function editQuestion(questionId) {
  openQuestionModal(questionId);
}

async function deleteQuestion(questionId) {
  if (confirm("Are you sure you want to delete this question?")) {
    const response = await DeleteData("/question", { id: questionId }, true);
    if (handleApiResponse(response)) return;
    loadQuestions();
  }
}

function filterQuestions() {
  const filterTopic = document.getElementById("filterTopic").value;
  document.querySelectorAll("tr[data-topic-id]").forEach((row) => {
    row.style.display =
      !filterTopic ||
      row.getAttribute("data-topic-id") === filterTopic.toString()
        ? ""
        : "none";
  });
}

function searchQuestions() {
  filterQuestions();
}
function loadTopicOptions() {
  populateTopicSelects();
}

// ===== USERS =====

async function loadUsers() {
  const tbody = document.getElementById("usersTableBody");
  tbody.innerHTML = "";
  const response = await FetchData("/users", true);
  if (handleApiResponse(response)) return;
  users = response.data.users;
  document.getElementById("totalUsers").textContent = users.length;

  users.forEach((user) => {
    const isDeactivated = !user.is_active || user.deleted_at !== null;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${user.id}</td>
      <td>${user.email}</td>
      <td>${user.role.toUpperCase()}</td>
      <td><span class="status-badge ${isDeactivated ? "status-inactive" : "status-active"}">${isDeactivated ? "Inactive" : "Active"}</span></td>
      <td>
        <div class="table-actions">
          ${
            isDeactivated
              ? `<button class="btn-activate" data-action="activate-user" data-id="${user.id}">Activate</button>`
              : `<button class="btn-edit"   data-action="edit-user"   data-id="${user.id}">Edit</button>
               <button class="btn-delete" data-action="delete-user" data-id="${user.id}">Delete</button>`
          }
        </div>
      </td>`;
    tbody.appendChild(row);
  });
}

function openUserModal(userId) {
  const modal = document.getElementById("userModal");
  const form = document.getElementById("userForm");
  const title = document.getElementById("userModalTitle");
  const passwordHelp = document.getElementById("passwordHelp");
  const passwordInput = document.getElementById("userPassword");

  form.reset();
  document.getElementById("userId").value = "";

  if (userId) {
    const user = users.find((u) => u.id === userId);
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
  const userId = document.getElementById("userId").value;
  const password = document.getElementById("userPassword").value;

  if (userId) {
    const response = await UpdateData(
      "/admin/reset-password",
      { id: parseInt(userId), password },
      true,
    );
    if (handleApiResponse(response)) return;
  }
  loadUsers();
  closeUserModal();
}

function editUser(userId) {
  openUserModal(userId);
}

async function deleteUser(userId) {
  alert(userId);
  if (confirm("Are you sure you want to delete this user?")) {
    const response = await UpdateData(
      `/admin/deactivate-user/${userId}`,
      { id: userId },
      true,
    );
    if (handleApiResponse(response)) return;
    loadUsers();
  }
}

async function activateUser(userId) {
  alert(userId);
  if (confirm("Are you sure you want to activate this user?")) {
    const response = await UpdateData(
      `/admin/activate-user/${userId}`,
      { id: userId },
      true,
    );
    if (handleApiResponse(response)) return;
    loadUsers();
  }
}

function filterUsers() {
  const filterRole = document.getElementById("filterUserRole").value;
  const searchTerm = document.getElementById("searchUser").value.toLowerCase();
  const filtered = users.filter((u) => {
    const matchesRole = !filterRole || u.role === filterRole;
    const matchesSearch =
      !searchTerm ||
      u.name.toLowerCase().includes(searchTerm) ||
      u.email.toLowerCase().includes(searchTerm);
    return matchesRole && matchesSearch;
  });
  displayFilteredUsers(filtered);
}

function searchUsers() {
  filterUsers();
}

function displayFilteredUsers(filtered) {
  const tbody = document.getElementById("usersTableBody");
  tbody.innerHTML = "";
  filtered.forEach((user) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${user.id}</td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.role.toUpperCase()}</td>
      <td>${user.joined}</td>
      <td><span class="status-badge status-${user.status}">${user.status.toUpperCase()}</span></td>
      <td>
        <div class="table-actions">
          <button class="btn-edit"   data-action="edit-user"   data-id="${user.id}">Edit</button>
          <button class="btn-delete" data-action="delete-user" data-id="${user.id}">Delete</button>
        </div>
      </td>`;
    tbody.appendChild(row);
  });
}

// ===== EXAMS =====

async function loadExams() {
  const examsList = document.getElementById("examsList");
  examsList.innerHTML = "";
  const response = await FetchData("/quizzes", true);
  if (handleApiResponse(response)) return;
  const exams = response.data.quizzes;

  if (!exams.length) {
    examsList.innerHTML =
      '<p style="text-align:center;color:var(--gray);padding:40px;">No exams created yet. Click "Add New Exam" to get started.</p>';
    return;
  }

  exams.forEach((exam) => {
    const examCard = document.createElement("div");
    examCard.className = "exam-card";
    examCard.innerHTML = `
      <div class="exam-card-header">
        <div>
          <h3>${exam.title}</h3>
          <p>${exam.description || "No description provided"}</p>
        </div>
        <div class="exam-actions">
          <button class="btn-edit"   data-action="edit-exam"   data-id="${exam.quiz_id}"><i class="fas fa-edit"></i> Edit</button>
          <button class="btn-delete" data-action="delete-exam" data-id="${exam.quiz_id}"><i class="fas fa-trash"></i> Delete</button>
        </div>
      </div>
      <div class="exam-meta">
        <div class="exam-meta-item"><i class="fas fa-question-circle"></i><span><strong>${exam.question_count}</strong> Questions</span></div>
        <div class="exam-meta-item"><i class="fas fa-calendar"></i><span>Created: ${exam.publish_date}</span></div>
      </div>`;
    examsList.appendChild(examCard);
  });
}

async function openExamModal(examId) {
  const modal = document.getElementById("examModal");
  const form = document.getElementById("examForm");
  const title = document.getElementById("examModalTitle");

  form.reset();
  document.getElementById("examId").value = "";
  selectedQuestionIds = [];

  const topicFilter = document.getElementById("examQuestionTopicFilter");
  topicFilter.innerHTML = '<option value="">All Topics</option>';
  populateTopicSelects_2(topicFilter);

  if (examId) {
    const response = await FetchData(`/quiz-admin/${examId}`, true);
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
  const container = document.getElementById("availableQuestions");
  const response = await FetchData("/questions", true);
  if (handleApiResponse(response)) return;
  questions = response.data.questions;

  container.innerHTML = "";
  questions.forEach((question) => {
    const isSelected = selectedQuestionIds.indexOf(question.question_id) > -1;
    const item = document.createElement("div");
    item.className = "question-checkbox-item";
    item.innerHTML = `
      <input type="checkbox" id="q-${question.question_id}" ${isSelected ? "checked" : ""} data-question-id="${question.question_id}">
      <div class="question-checkbox-content"><strong>${question.content}</strong></div>`;
    container.appendChild(item);
  });
}

function filterAvailableQuestions() {
  loadAvailableQuestions();
}

function toggleQuestionSelection(questionId) {
  const index = selectedQuestionIds.indexOf(questionId);
  if (index > -1) selectedQuestionIds.splice(index, 1);
  else selectedQuestionIds.push(questionId);
  updateSelectedQuestionsDisplay();
}

function updateSelectedQuestionsDisplay() {
  const container = document.getElementById("selectedQuestions");
  const countSpan = document.getElementById("selectedCount");
  countSpan.textContent = selectedQuestionIds.length;

  if (!selectedQuestionIds.length) {
    container.innerHTML =
      '<p class="no-selection">No questions selected yet</p>';
    return;
  }
  container.innerHTML = "";
  selectedQuestionIds.forEach((questionId) => {
    const question = questions.find((q) => q.question_id === questionId);
    if (question) {
      const item = document.createElement("div");
      item.className = "selected-question-item";
      item.innerHTML = `
        <span>${question.content.substring(0, 60)}${question.content.length > 60 ? "..." : ""}</span>
        <button type="button" data-action="remove-selected-question" data-id="${questionId}"><i class="fas fa-times"></i></button>`;
      container.appendChild(item);
    }
  });
}

function removeQuestionFromSelection(questionId) {
  const index = selectedQuestionIds.indexOf(questionId);
  if (index > -1) selectedQuestionIds.splice(index, 1);
  const checkbox = document.getElementById("q-" + questionId);
  if (checkbox) checkbox.checked = false;
  updateSelectedQuestionsDisplay();
}

async function handleExamSubmit(event) {
  event.preventDefault();
  if (!selectedQuestionIds.length) {
    alert("Please select at least one question for the exam.");
    return;
  }
  const examId = document.getElementById("examId").value;
  const name = document.getElementById("examName").value;
  const description = document.getElementById("examDescription").value;

  if (examId) {
    const response = await UpdateData(
      "/quiz",
      {
        quiz_id: examId,
        title: name,
        description,
        questions: selectedQuestionIds.slice(),
      },
      true,
    );
    if (handleApiResponse(response)) return;
  } else {
    const response = await PostData(
      "/quiz",
      { title: name, description, questions: selectedQuestionIds.slice() },
      true,
    );
    if (handleApiResponse(response)) return;
  }
  loadExams();
  closeExamModal();
}

function editExam(examId) {
  openExamModal(examId);
}

async function deleteExam(examId) {
  if (confirm("Are you sure you want to delete this exam?")) {
    const response = await DeleteData("/quiz", { id: examId }, true);
    if (handleApiResponse(response)) return;
    loadExams();
  }
}

// ===== EVENT LISTENERS =====

document.addEventListener("DOMContentLoaded", function () {
  initializeCharts();
  loadTopics();
  loadQuestions();
  loadUsers();
  loadExams();
  loadTopicOptions();

  document.getElementById("btn-logout").addEventListener("click", async () => {
    const response = await FetchData("/logout", true);
    if (handleApiResponse(response)) return;
    if (response.success) {
      localStorage.removeItem("token");
      alert("Successful Logout");
      window.location.href = "../auth/login.html";
    } else {
      alert("Logout failed");
    }
  });

  const sidebarToggle = document.getElementById("sidebar-toggle");
  if (sidebarToggle) sidebarToggle.addEventListener("click", toggleSidebar);

  const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  if (mobileMenuToggle)
    mobileMenuToggle.addEventListener("click", toggleMobileMenu);

  const sidebarOverlay = document.getElementById("sidebar-overlay");
  if (sidebarOverlay) sidebarOverlay.addEventListener("click", closeSidebar);

  document.querySelectorAll(".links a[data-section]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      showSection(link.getAttribute("data-section"));
    });
  });

  document.querySelectorAll(".nav-item[data-section]").forEach((item) => {
    item.addEventListener("click", () =>
      showSection(item.getAttribute("data-section")),
    );
  });

  const btnAddTopic = document.getElementById("btn-add-topic");
  if (btnAddTopic)
    btnAddTopic.addEventListener("click", () => openTopicModal(null));
  const btnAddQuestion = document.getElementById("btn-add-question");
  if (btnAddQuestion)
    btnAddQuestion.addEventListener("click", () => openQuestionModal(null));
  const btnAddUser = document.getElementById("btn-add-user");
  if (btnAddUser)
    btnAddUser.addEventListener("click", () => openUserModal(null));
  const btnAddExam = document.getElementById("btn-add-exam");
  if (btnAddExam)
    btnAddExam.addEventListener("click", () => openExamModal(null));

  const btnAddSubtopicField = document.getElementById("btn-add-subtopic-field");
  if (btnAddSubtopicField)
    btnAddSubtopicField.addEventListener("click", addSubtopicField);

  const topicForm = document.getElementById("topicForm");
  if (topicForm) topicForm.addEventListener("submit", handleTopicSubmit);
  const questionForm = document.getElementById("questionForm");
  if (questionForm)
    questionForm.addEventListener("submit", handleQuestionSubmit);
  const userForm = document.getElementById("userForm");
  if (userForm) userForm.addEventListener("submit", handleUserSubmit);
  const subtopicForm = document.getElementById("subtopicForm");
  if (subtopicForm)
    subtopicForm.addEventListener("submit", async (e) => {
      await handleSubtopicSubmit(e);
    });
  const examForm = document.getElementById("examForm");
  if (examForm) examForm.addEventListener("submit", handleExamSubmit);

  const filterTopic = document.getElementById("filterTopic");
  if (filterTopic) filterTopic.addEventListener("change", filterQuestions);

  const searchQuestion = document.getElementById("searchQuestion");
  if (searchQuestion) {
    searchQuestion.addEventListener("input", (e) => {
      const searchText = e.target.value.toLowerCase().trim();
      document.querySelectorAll("#questionsTable tbody tr").forEach((row) => {
        const qt = row.querySelector(".question-text");
        if (qt)
          row.style.display = qt.textContent.toLowerCase().includes(searchText)
            ? ""
            : "none";
      });
    });
  }

  const filterUserRole = document.getElementById("filterUserRole");
  if (filterUserRole) filterUserRole.addEventListener("change", filterUsers);
  const searchUser = document.getElementById("searchUser");
  if (searchUser) searchUser.addEventListener("keyup", searchUsers);

  const examQuestionTopicFilter = document.getElementById(
    "examQuestionTopicFilter",
  );
  if (examQuestionTopicFilter)
    examQuestionTopicFilter.addEventListener(
      "change",
      filterAvailableQuestions,
    );
  const examQuestionSearch = document.getElementById("examQuestionSearch");
  if (examQuestionSearch)
    examQuestionSearch.addEventListener("keyup", filterAvailableQuestions);

  const questionImage = document.getElementById("questionImage");
  if (questionImage) questionImage.addEventListener("change", previewImage);

  document.querySelectorAll("[data-modal]").forEach((button) => {
    button.addEventListener("click", () => {
      const modal = document.getElementById(button.getAttribute("data-modal"));
      if (modal) modal.classList.remove("active");
    });
  });

  // Delegated: Topics list
  const topicsList = document.getElementById("topicsList");
  if (topicsList) {
    topicsList.addEventListener("click", (e) => {
      const target = e.target.closest("[data-action]");
      if (!target) return;
      const action = target.getAttribute("data-action");
      const id = parseInt(target.getAttribute("data-id"));
      const topicId = parseInt(target.getAttribute("data-topic-id"));
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

  // Delegated: Subtopics list (inline remove)
  const subtopicsList = document.getElementById("subtopicsList");
  if (subtopicsList) {
    subtopicsList.addEventListener("click", (e) => {
      const target = e.target.closest("[data-action]");
      if (!target) return;
      if (target.getAttribute("data-action") === "remove-subtopic-field") {
        const subtopicId = target.getAttribute("data-id")
          ? parseInt(target.getAttribute("data-id"))
          : null;
        removeSubtopicField(target, subtopicId);
      }
    });
  }

  // Delegated: Questions table
  const questionsTableBody = document.getElementById("questionsTableBody");
  if (questionsTableBody) {
    questionsTableBody.addEventListener("click", (e) => {
      const target = e.target.closest("[data-action]");
      if (!target) return;
      const id = parseInt(target.getAttribute("data-id"));
      switch (target.getAttribute("data-action")) {
        case "edit-question":
          editQuestion(id);
          break;
        case "delete-question":
          deleteQuestion(id);
          break;
      }
    });
  }

  // Delegated: Users table
  const usersTableBody = document.getElementById("usersTableBody");
  if (usersTableBody) {
    usersTableBody.addEventListener("click", (e) => {
      const target = e.target.closest("[data-action]");
      if (!target) return;
      const id = parseInt(target.getAttribute("data-id"));
      switch (target.getAttribute("data-action")) {
        case "edit-user":
          editUser(id);
          break;
        case "delete-user":
          deleteUser(id);
          break;
        case "activate-user":
          activateUser(id);
          break;
      }
    });
  }

  // Delegated: Exams list
  const examsList = document.getElementById("examsList");
  if (examsList) {
    examsList.addEventListener("click", (e) => {
      const target = e.target.closest("[data-action]");
      if (!target) return;
      const id = parseInt(target.getAttribute("data-id"));
      switch (target.getAttribute("data-action")) {
        case "edit-exam":
          editExam(id);
          break;
        case "delete-exam":
          deleteExam(id);
          break;
      }
    });
  }

  // Delegated: Available questions (checkbox)
  const availableQuestions = document.getElementById("availableQuestions");
  if (availableQuestions) {
    availableQuestions.addEventListener("change", (e) => {
      if (
        e.target.type === "checkbox" &&
        e.target.hasAttribute("data-question-id")
      ) {
        toggleQuestionSelection(
          parseInt(e.target.getAttribute("data-question-id")),
        );
      }
    });
  }

  // Delegated: Selected questions (remove)
  const selectedQuestions = document.getElementById("selectedQuestions");
  if (selectedQuestions) {
    selectedQuestions.addEventListener("click", (e) => {
      const target = e.target.closest("[data-action]");
      if (!target) return;
      if (target.getAttribute("data-action") === "remove-selected-question") {
        removeQuestionFromSelection(parseInt(target.getAttribute("data-id")));
      }
    });
  }

  // Close mobile menu on outside click
  document.addEventListener("click", (e) => {
    const links = document.querySelector(".links");
    const toggle = document.querySelector(".mobile-menu-toggle");
    if (window.innerWidth <= 768 && links.style.display === "flex") {
      if (!links.contains(e.target) && !toggle.contains(e.target))
        links.style.display = "none";
    }
  });

  // Close modals on backdrop click
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("active");
    });
  });
});
