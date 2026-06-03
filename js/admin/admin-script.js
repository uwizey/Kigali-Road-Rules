import { FetchData, PostData, DeleteData, UpdateData } from "../api/crud.js";

// ─── Popup engine ─────────────────────────────────────────────────────────────

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
  });
}

function showSuccessPopup(message) {
  showInfoPopup("Success", message, "fas fa-check-circle", "#27ae60");
}

function showConfirmPopup(message, onConfirm) {
  createBasePopup({
    title: "Are you sure?",
    message,
    icon: "fas fa-exclamation-triangle",
    iconColor: "#e67e22",
    confirmText: "Confirm",
    cancelText: "Cancel",
    showCancel: true,
    showConfirm: true,
    confirmBtnStyle: "background: #e67e22; color: #fff; border: none;",
    onConfirm,
  });
}

// ─── API response handler ─────────────────────────────────────────────────────
// crud.js already classifies every error and prepares a safe userMessage.
// All we do here is pick an icon/color for the popup and display it.
// Returns true if an error was shown (caller should stop), false on success.

function handleApiResponse(response) {
  if (response?.success === true) return false;

  // Icon/color/title keyed by the type/action/status crud.js already resolved for us
  const ICON = {
    NETWORK_ERROR: {
      title: "No Connection",
      icon: "fas fa-wifi",
      color: "#95a5a6",
    },
    CORS_ERROR: {
      title: "Network Error",
      icon: "fas fa-wifi",
      color: "#95a5a6",
    },
    TIMEOUT_ERROR: {
      title: "Timed Out",
      icon: "fas fa-hourglass-end",
      color: "#95a5a6",
    },
    ABORTED: { title: "Cancelled", icon: "fas fa-ban", color: "#95a5a6" },
    RENEW_SUBSCRIPTION: {
      title: "Subscription Expired",
      icon: "fas fa-calendar-times",
      color: "#f39c12",
    },
    UPGRADE_PLAN: {
      title: "Upgrade Required",
      icon: "fas fa-arrow-circle-up",
      color: "#f39c12",
    },
    VERIFY_EMAIL: {
      title: "Verify Email",
      icon: "fas fa-envelope",
      color: "#3498db",
    },
    GENERIC_FORBIDDEN: {
      title: "Access Restricted",
      icon: "fas fa-lock",
      color: "#f39c12",
    },
    400: {
      title: "Invalid Request",
      icon: "fas fa-exclamation-circle",
      color: "#e67e22",
    },
    401: {
      title: "Session Expired",
      icon: "fas fa-user-shield",
      color: "#3498db",
    },
    403: { title: "Access Restricted", icon: "fas fa-lock", color: "#f39c12" },
    404: { title: "Not Found", icon: "fas fa-search", color: "#95a5a6" },
    408: { title: "Timed Out", icon: "fas fa-hourglass-end", color: "#95a5a6" },
    409: {
      title: "Conflict",
      icon: "fas fa-exclamation-triangle",
      color: "#e67e22",
    },
    413: { title: "Too Large", icon: "fas fa-file-upload", color: "#e67e22" },
    422: {
      title: "Invalid Input",
      icon: "fas fa-exclamation-circle",
      color: "#e67e22",
    },
    429: { title: "Too Many Requests", icon: "fas fa-clock", color: "#f39c12" },
    500: { title: "Server Error", icon: "fas fa-server", color: "#c0392b" },
    502: { title: "Server Error", icon: "fas fa-server", color: "#c0392b" },
    503: { title: "Unavailable", icon: "fas fa-server", color: "#c0392b" },
    504: { title: "Timeout", icon: "fas fa-hourglass-end", color: "#c0392b" },
  };

  const { title, icon, color } = ICON[response.type] ??
    ICON[response.action] ??
    ICON[response.status] ?? {
      title: "Error",
      icon: "fas fa-exclamation-circle",
      color: "#e74c3c",
    };

  showInfoPopup(title, response.userMessage, icon, color);
  return true;
}

// ─── Runtime state ────────────────────────────────────────────────────────────

let users = [];
let questions = [];
let selectedQuestionIds = [];

// ─── Navigation ───────────────────────────────────────────────────────────────

function toggleMobileMenu() {
  const links = document.querySelector(".links");
  links.style.display = links.style.display === "flex" ? "none" : "flex";
  if (links.style.display === "flex") {
    Object.assign(links.style, {
      position: "fixed",
      top: "86px",
      left: "0",
      right: "0",
      background: "var(--white)",
      flexDirection: "column",
      padding: "20px",
      boxShadow: "var(--shadow)",
      borderBottom: "1px solid var(--border)",
      zIndex: "1001",
    });
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
  if (window.innerWidth <= 768) {
    document.querySelector(".links").style.display = "none";
    closeSidebar();
  }
}

// ─── Charts ───────────────────────────────────────────────────────────────────

async function initializeCharts() {
  const response = await FetchData("/stats/topics", true);
  if (handleApiResponse(response)) return;

  new Chart(document.getElementById("questionsChart").getContext("2d"), {
    type: "doughnut",
    data: {
      labels: response.data.data.labels,
      datasets: [
        {
          data: response.data.data.data,
          backgroundColor: response.data.data.colors,
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

  new Chart(document.getElementById("usersChart").getContext("2d"), {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "New Users",
          data: [],
          borderColor: "#0097b2",
          backgroundColor: "rgba(0,151,178,0.1)",
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

  new Chart(document.getElementById("activityChart").getContext("2d"), {
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

  new Chart(document.getElementById("performanceChart").getContext("2d"), {
    type: "radar",
    data: {
      labels: [],
      datasets: [
        {
          label: "Average Score",
          data: [],
          backgroundColor: "rgba(0,151,178,0.2)",
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

// ─── Topics ───────────────────────────────────────────────────────────────────

async function loadTopics() {
  const topicsList = document.getElementById("topicsList");
  topicsList.innerHTML = "";
  const response = await FetchData("/topic", true);
  console.log("Topics API response:", response);  
  if (handleApiResponse(response)) return;

  const data = response.data.data || [];
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
  const subtopicsSection = document.getElementById("subtopicsSection");

  form.reset();
  document.getElementById("topicId").value = "";
  subtopicsSection.style.display = "none";

  if (topicId) {
    const response = await FetchData(`/topic/${topicId}`, true);
    if (handleApiResponse(response)) return;
    console.log("Single Topic API response:", response);
    const topic = response.data.data;
    if (topic) {
      document.getElementById("topicModalTitle").textContent = "Edit Topic";
      document.getElementById("topicId").value = topic.id;
      document.getElementById("topicName").value = topic.name;
      
      subtopicsSection.style.display = "block";
      loadSubtopicsForEdit(topic);
    }
  } else {
    document.getElementById("topicModalTitle").textContent = "Add New Topic";
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
    showConfirmPopup("Are you sure you want to delete this subtopic?", () =>
      button.parentElement.remove(),
    );
  } else {
    button.parentElement.remove();
  }
}

async function handleTopicSubmit(event) {
  event.preventDefault();
  const topicId = document.getElementById("topicId").value;
  const name = document.getElementById("topicName").value;

  if (topicId) {
    const response = await UpdateData(
      "/topic",
      { id: topicId, topicName: name },
      true,
    );
    if (handleApiResponse(response)) return;
    showSuccessPopup("Topic updated successfully.");
  } else {
    const response = await PostData("/topic", { topicName: name }, true);
    if (handleApiResponse(response)) return;
    showSuccessPopup("Topic created successfully.");
  }
  closeTopicModal();
  loadTopics();
  populateTopicSelects();
}

async function deleteTopic(topicId) {
  showConfirmPopup(
    "Are you sure you want to delete this topic? This will also delete all associated subtopics.",
    async () => {
      const response = await DeleteData("/topic", { id: topicId }, true);
      if (handleApiResponse(response)) return;
      loadTopics();
      populateTopicSelects();
    },
  );
}

async function openSubtopicModal(topicId, subtopicId) {
  const modal = document.getElementById("subtopicModal");
  const form = document.getElementById("subtopicForm");

  form.reset();
  document.getElementById("subtopicTopicId").value = topicId;

  if (subtopicId) {
    const response = await FetchData(`/topic/${subtopicId}`, true);
    if (handleApiResponse(response)) return;
    const subtopic = response.data.data;
    if (subtopic) {
      document.getElementById("subtopicModalTitle").textContent =
        "Edit Subtopic";
      document.getElementById("subtopicId").value = subtopic.id;
      document.getElementById("subtopicName").value = subtopic.name;
    }
  } else {
    document.getElementById("subtopicModalTitle").textContent =
      "Add New Subtopic";
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
    showSuccessPopup("Subtopic updated successfully.");
  } else {
    const response = await PostData(
      "/subtopic",
      { subtopicName: name, parentId: topicId },
      true,
    );
    if (handleApiResponse(response)) return;
    showSuccessPopup("Subtopic created successfully.");
  }
  closeSubtopicModal();
  loadTopics();
}

async function deleteSubtopic(subtopicId) {
  showConfirmPopup(
    "Are you sure you want to delete this subtopic?",
    async () => {
      const response = await DeleteData("/topic", { id: subtopicId }, true);
      if (handleApiResponse(response)) return;
      loadTopics();
      populateTopicSelects();
    },
  );
}

// ─── Questions ────────────────────────────────────────────────────────────────

async function loadQuestions() {
  const tbody = document.getElementById("questionsTableBody");
  tbody.innerHTML = "";
  const response = await FetchData("/questions", true);
  console.log("Questions API response:", response);
  if (handleApiResponse(response)) return;

  const qs = response.data.data;
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
  const imagePreview = document.getElementById("imagePreview");

  form.reset();
  imagePreview.innerHTML = "";
  imagePreview.classList.remove("show");
  document.getElementById("questionId").value = "";

  if (questionId) {
    const response = await FetchData(`/question/${questionId}`, true);
    console.log("Single Question API response:", response);
    if (handleApiResponse(response)) return;
    const question = response.data.data;
    if (question) {
      document.getElementById("questionModalTitle").textContent =
        "Edit Question";
      document.getElementById("questionId").value = questionId;
      document.getElementById("questionStatement").value = question.statement;
      document.getElementById("questionTopic").value = question.topicId;

      ["A", "B", "C", "D"].forEach((k) => {
        const input = document.getElementById(`option${k}`);
        input.value = question.options[k].text;
        input.setAttribute("option-id", question.options[k].id);
      });
      document.querySelector(
        `input[value="${question.correctAnswer}"]`,
      ).checked = true;

      if (question.image) {
        let imgSrc = question.image;
        if (!imgSrc.startsWith("data:") && !imgSrc.startsWith("http"))
          imgSrc = "data:image/png;base64," + imgSrc;
        imagePreview.innerHTML = `<img src="${imgSrc}" alt="Question Image">`;
        imagePreview.classList.add("show");
        document.getElementById("removeImageContainer").style.display = "block";
      }
    }
  } else {
    document.getElementById("questionModalTitle").textContent =
      "Add New Question";
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

function buildTopicOptionsHtml(topics) {
  return topics
    .map(
      (cat) => `
    <optgroup label="${cat.name}">
      <option value="${cat.id}">${cat.name}</option>
      ${cat.subtopics.map((sub) => `<option value="${sub.id}">${sub.name}</option>`).join("")}
    </optgroup>`,
    )
    .join("");
}

async function populateTopicSelects(...selects) {
  const response = await FetchData("/topic", true);
  if (handleApiResponse(response)) return;
  const optionsHtml = buildTopicOptionsHtml(response.data.data || []);

  // Default: populate the question modal select and question filter select
  if (!selects.length) {
    const filterTopic = document.getElementById("filterTopic");
    const modalTopicSelect = document.getElementById("questionTopic");
    if (filterTopic)
      filterTopic.innerHTML =
        '<option value="">All Topics</option>' + optionsHtml;
    if (modalTopicSelect)
      modalTopicSelect.innerHTML =
        '<option value="">Select topic</option>' + optionsHtml;
  }

  // Populate any explicitly passed <select> elements
  for (const select of selects) {
    if (select)
      select.innerHTML = '<option value="">Select topic</option>' + optionsHtml;
  }
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
    showSuccessPopup("Question updated successfully.");
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
    showSuccessPopup("Question created successfully.");
  }
  closeQuestionModal();
  loadQuestions();
}

async function deleteQuestion(questionId) {
  showConfirmPopup(
    "Are you sure you want to delete this question?",
    async () => {
      const response = await DeleteData("/question", { id: questionId }, true);
      if (handleApiResponse(response)) return;
      loadQuestions();
    },
  );
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

// ─── Users ────────────────────────────────────────────────────────────────────

async function loadUsers() {
  const tbody = document.getElementById("usersTableBody");
  tbody.innerHTML = "";
  const response = await FetchData("/users", true);
  console.log("Users API response:", response);
  if (handleApiResponse(response)) return;

  users = response.data.data;
  document.getElementById("totalUsers").textContent = users.length;

  renderUsersTable(users);
}

function renderUsersTable(data) {
  const tbody = document.getElementById("usersTableBody");
  tbody.innerHTML = "";
  data.forEach((user) => {
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
  const passwordHelp = document.getElementById("passwordHelp");
  const passwordInput = document.getElementById("userPassword");

  form.reset();
  document.getElementById("userId").value = "";

  if (userId) {
    const user = users.find((u) => u.id === userId);
    if (user) {
      document.getElementById("userModalTitle").textContent = "Edit User";
      document.getElementById("userId").value = user.id;
      passwordInput.required = false;
      passwordHelp.style.display = "block";
    }
  } else {
    document.getElementById("userModalTitle").textContent = "Add New User";
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
    showSuccessPopup("Password reset successfully.");
  }
  closeUserModal();
  loadUsers();
}

async function deleteUser(userId) {
  showConfirmPopup(
    "Are you sure you want to deactivate this user?",
    async () => {
      const response = await UpdateData(
        `/admin/deactivate-user/${userId}`,
        { id: userId },
        true,
      );
      if (handleApiResponse(response)) return;
      loadUsers();
    },
  );
}

async function activateUser(userId) {
  showConfirmPopup("Are you sure you want to activate this user?", async () => {
    const response = await UpdateData(
      `/admin/activate-user/${userId}`,
      { id: userId },
      true,
    );
    if (handleApiResponse(response)) return;
    loadUsers();
  });
}

function filterUsers() {
  const filterRole = document.getElementById("filterUserRole").value;
  const searchTerm = document.getElementById("searchUser").value.toLowerCase();
  const filtered = users.filter((u) => {
    const matchesRole = !filterRole || u.role === filterRole;
    const matchesSearch =
      !searchTerm ||
      u.name?.toLowerCase().includes(searchTerm) ||
      u.email.toLowerCase().includes(searchTerm);
    return matchesRole && matchesSearch;
  });
  renderUsersTable(filtered);
}

// ─── Exams ────────────────────────────────────────────────────────────────────

async function loadExams() {
  const examsList = document.getElementById("examsList");
  examsList.innerHTML = "";
  const response = await FetchData("/quizzes", true);
  console.log("Exams API response:", response); 
  if (handleApiResponse(response)) return;

  const exams = response.data.data;
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

  form.reset();
  document.getElementById("examId").value = "";
  selectedQuestionIds = [];

  const topicFilter = document.getElementById("examQuestionTopicFilter");
  topicFilter.innerHTML = '<option value="">All Topics</option>';
  await populateTopicSelects(topicFilter);

  if (examId) {
    const response = await FetchData(`/quiz-admin/${examId}`, true);
    if (handleApiResponse(response)) return;
    const exam = response.data.data;
    if (exam) {
      document.getElementById("examModalTitle").textContent = "Edit Exam";
      document.getElementById("examId").value = exam.quiz_id;
      document.getElementById("examName").value = exam.title;
      document.getElementById("examDescription").value = exam.description || "";
      selectedQuestionIds = exam.questions.slice();
    }
  } else {
    document.getElementById("examModalTitle").textContent = "Add New Exam";
  }
  await loadAvailableQuestions();
  updateSelectedQuestionsDisplay();
  modal.classList.add("active");
}

function closeExamModal() {
  document.getElementById("examModal").classList.remove("active");
  selectedQuestionIds = [];
}

async function loadAvailableQuestions() {
  const container = document.getElementById("availableQuestions");
  const topicFilter = document.getElementById("examQuestionTopicFilter").value;
  const searchTerm = document
    .getElementById("examQuestionSearch")
    .value.toLowerCase()
    .trim();

  const response = await FetchData("/questions", true);
  if (handleApiResponse(response)) return;

  questions = response.data.data;

  const filtered = questions.filter((q) => {
    const matchesTopic = !topicFilter || String(q.topic_id) === topicFilter;
    const matchesSearch =
      !searchTerm || q.content.toLowerCase().includes(searchTerm);
    return matchesTopic && matchesSearch;
  });

  container.innerHTML = "";
  filtered.forEach((question) => {
    const isSelected = selectedQuestionIds.indexOf(question.question_id) > -1;
    const item = document.createElement("div");
    item.className = "question-checkbox-item";
    item.innerHTML = `
      <input type="checkbox" id="q-${question.question_id}" ${isSelected ? "checked" : ""} data-question-id="${question.question_id}">
      <div class="question-checkbox-content"><strong>${question.content}</strong></div>`;
    container.appendChild(item);
  });
}

function toggleQuestionSelection(questionId) {
  const index = selectedQuestionIds.indexOf(questionId);
  if (index > -1) selectedQuestionIds.splice(index, 1);
  else selectedQuestionIds.push(questionId);
  updateSelectedQuestionsDisplay();
}

function updateSelectedQuestionsDisplay() {
  const container = document.getElementById("selectedQuestions");
  document.getElementById("selectedCount").textContent =
    selectedQuestionIds.length;

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
    showInfoPopup(
      "No Questions Selected",
      "Please select at least one question for the exam.",
      "fas fa-exclamation-circle",
      "#e67e22",
    );
    return;
  }
  const examId = document.getElementById("examId").value;
  const title = document.getElementById("examName").value;
  const description = document.getElementById("examDescription").value;

  if (examId) {
    const response = await UpdateData(
      "/quiz",
      {
        quiz_id: examId,
        title,
        description,
        questions: selectedQuestionIds.slice(),
      },
      true,
    );
    if (handleApiResponse(response)) return;
    showSuccessPopup("Exam updated successfully.");
  } else {
    const response = await PostData(
      "/quiz",
      { title, description, questions: selectedQuestionIds.slice() },
      true,
    );
    if (handleApiResponse(response)) return;
    showSuccessPopup("Exam created successfully.");
  }
  closeExamModal();
  loadExams();
}

async function deleteExam(examId) {
  showConfirmPopup("Are you sure you want to delete this exam?", async () => {
    const response = await DeleteData("/quiz", { id: examId }, true);
    if (handleApiResponse(response)) return;
    loadExams();
  });
}

// ─── Event listeners ──────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", function () {
  initializeCharts();
  loadTopics();
  loadQuestions();
  loadUsers();
  loadExams();
  populateTopicSelects();

  document.getElementById("btn-logout").addEventListener("click", async () => {
    const response = await FetchData("/logout", true);
    if (handleApiResponse(response)) return;
    localStorage.removeItem("authToken");
    window.location.href = "../auth/login.html";
  });

  document
    .getElementById("sidebar-toggle")
    ?.addEventListener("click", toggleSidebar);
  document
    .getElementById("mobile-menu-toggle")
    ?.addEventListener("click", toggleMobileMenu);
  document
    .getElementById("sidebar-overlay")
    ?.addEventListener("click", closeSidebar);

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

  document
    .getElementById("btn-add-topic")
    ?.addEventListener("click", () => openTopicModal(null));
  document
    .getElementById("btn-add-question")
    ?.addEventListener("click", () => openQuestionModal(null));
  document
    .getElementById("btn-add-user")
    ?.addEventListener("click", () => openUserModal(null));
  document
    .getElementById("btn-add-exam")
    ?.addEventListener("click", () => openExamModal(null));
  document
    .getElementById("btn-add-subtopic-field")
    ?.addEventListener("click", addSubtopicField);

  document
    .getElementById("topicForm")
    ?.addEventListener("submit", handleTopicSubmit);
  document
    .getElementById("questionForm")
    ?.addEventListener("submit", handleQuestionSubmit);
  document
    .getElementById("userForm")
    ?.addEventListener("submit", handleUserSubmit);
  document
    .getElementById("subtopicForm")
    ?.addEventListener("submit", handleSubtopicSubmit);
  document
    .getElementById("examForm")
    ?.addEventListener("submit", handleExamSubmit);

  document
    .getElementById("filterTopic")
    ?.addEventListener("change", filterQuestions);

  document.getElementById("searchQuestion")?.addEventListener("input", (e) => {
    const searchText = e.target.value.toLowerCase().trim();
    document.querySelectorAll("#questionsTable tbody tr").forEach((row) => {
      const qt = row.querySelector(".question-text");
      if (qt)
        row.style.display = qt.textContent.toLowerCase().includes(searchText)
          ? ""
          : "none";
    });
  });

  document
    .getElementById("filterUserRole")
    ?.addEventListener("change", filterUsers);
  document.getElementById("searchUser")?.addEventListener("input", filterUsers);

  document
    .getElementById("examQuestionTopicFilter")
    ?.addEventListener("change", loadAvailableQuestions);
  document
    .getElementById("examQuestionSearch")
    ?.addEventListener("input", loadAvailableQuestions);

  document
    .getElementById("questionImage")
    ?.addEventListener("change", previewImage);

  document.querySelectorAll("[data-modal]").forEach((button) => {
    button.addEventListener("click", () => {
      document
        .getElementById(button.getAttribute("data-modal"))
        ?.classList.remove("active");
    });
  });

  // ── Delegated listeners ──────────────────────────────────────────────────

  document.getElementById("topicsList")?.addEventListener("click", (e) => {
    const target = e.target.closest("[data-action]");
    if (!target) return;
    const action = target.getAttribute("data-action");
    const id = parseInt(target.getAttribute("data-id"));
    const topicId = parseInt(target.getAttribute("data-topic-id"));
    switch (action) {
      case "edit-topic":
        openTopicModal(id);
        break;
      case "delete-topic":
        deleteTopic(id);
        break;
      case "add-subtopic":
        openSubtopicModal(topicId);
        break;
      case "edit-subtopic":
        openSubtopicModal(topicId, id);
        break;
      case "delete-subtopic":
        deleteSubtopic(id);
        break;
    }
  });

  document.getElementById("subtopicsList")?.addEventListener("click", (e) => {
    const target = e.target.closest("[data-action]");
    if (
      !target ||
      target.getAttribute("data-action") !== "remove-subtopic-field"
    )
      return;
    const subtopicId = target.getAttribute("data-id")
      ? parseInt(target.getAttribute("data-id"))
      : null;
    removeSubtopicField(target, subtopicId);
  });

  document
    .getElementById("questionsTableBody")
    ?.addEventListener("click", (e) => {
      const target = e.target.closest("[data-action]");
      if (!target) return;
      const id = parseInt(target.getAttribute("data-id"));
      switch (target.getAttribute("data-action")) {
        case "edit-question":
          openQuestionModal(id);
          break;
        case "delete-question":
          deleteQuestion(id);
          break;
      }
    });

  document.getElementById("usersTableBody")?.addEventListener("click", (e) => {
    const target = e.target.closest("[data-action]");
    if (!target) return;
    const id = parseInt(target.getAttribute("data-id"));
    switch (target.getAttribute("data-action")) {
      case "edit-user":
        openUserModal(id);
        break;
      case "delete-user":
        deleteUser(id);
        break;
      case "activate-user":
        activateUser(id);
        break;
    }
  });

  document.getElementById("examsList")?.addEventListener("click", (e) => {
    const target = e.target.closest("[data-action]");
    if (!target) return;
    const id = parseInt(target.getAttribute("data-id"));
    switch (target.getAttribute("data-action")) {
      case "edit-exam":
        openExamModal(id);
        break;
      case "delete-exam":
        deleteExam(id);
        break;
    }
  });

  document
    .getElementById("availableQuestions")
    ?.addEventListener("change", (e) => {
      if (
        e.target.type === "checkbox" &&
        e.target.hasAttribute("data-question-id")
      ) {
        toggleQuestionSelection(
          parseInt(e.target.getAttribute("data-question-id")),
        );
      }
    });

  document
    .getElementById("selectedQuestions")
    ?.addEventListener("click", (e) => {
      const target = e.target.closest("[data-action]");
      if (
        !target ||
        target.getAttribute("data-action") !== "remove-selected-question"
      )
        return;
      removeQuestionFromSelection(parseInt(target.getAttribute("data-id")));
    });

  document.addEventListener("click", (e) => {
    const links = document.querySelector(".links");
    const toggle = document.querySelector(".mobile-menu-toggle");
    if (window.innerWidth <= 768 && links?.style.display === "flex") {
      if (!links.contains(e.target) && !toggle?.contains(e.target))
        links.style.display = "none";
    }
  });

  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("active");
    });
  });
});
