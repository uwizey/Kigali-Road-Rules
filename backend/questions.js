import { PostData, FetchData, UpdateData, DeleteData } from "./API/crud.js";
// --- MOCK DATA & STATE ---
let currentImageFile;
let questions = [
  {
    id: 1,
    text: "What is the powerhouse of the cell?",
    topic: "Science: Biology",
    options: ["Nucleus", "Mitochondria", "Ribosome", "Cytoplasm"],
    correctIndex: 1,
    lastEdited: "2 hours ago",
    image: null,
  },
  {
    id: 2,
    text: "Which planet is known as the Red Planet?",
    topic: "Science: Astronomy",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctIndex: 1,
    lastEdited: "1 day ago",
    image: null,
  },
  {
    id: 3,
    text: "What is the value of Pi to two decimal places?",
    topic: "Math: Geometry",
    options: ["3.14", "3.15", "3.16", "3.12"],
    correctIndex: 0,
    lastEdited: "3 days ago",
    image: null,
  },
];

const categories = [
  {
    name: "Science",
    subtopics: ["Biology", "Physics", "Chemistry", "Astronomy"],
  },
  { name: "Math", subtopics: ["Algebra", "Geometry", "Calculus"] },
  { name: "History", subtopics: ["World War II", "Ancient Rome"] },
];

let editingId = null;
let currentImageData = null;

// --- DOM ELEMENTS ---
const tableBody = document.getElementById("questions-table-body");
const emptyMsg = document.getElementById("empty-msg");
const modal = document.getElementById("q-modal");
const modalTopicSelect = document.getElementById("modal-q-topic");
const filterTopicSelect = document.getElementById("filter-topic");
const toast = document.getElementById("toast");
const searchInput = document.getElementById("search-input");

const imgPreview = document.getElementById("img-preview");
const imgPlaceholder = document.getElementById("img-placeholder");
const btnRemoveImg = document.getElementById("btn-remove-img");
const imgInput = document.getElementById("q-image-input");
const imgUploadTrigger = document.getElementById("img-upload-trigger");

const btnAddNew = document.getElementById("btn-add-new");
const btnSave = document.getElementById("btn-modal-save");
const btnCloseTop = document.getElementById("btn-close-modal-top");
const btnCloseFooter = document.getElementById("btn-close-modal-footer");

// --- INITIALIZATION ---
function init() {
  populateTopicSelects();
  renderTable();
  setupEventListeners();
}

function setupEventListeners() {
  btnAddNew.addEventListener("click", openCreateModal);
  btnSave.addEventListener("click", saveQuestion);
  btnCloseTop.addEventListener("click", closeModal);
  btnCloseFooter.addEventListener("click", closeModal);

  searchInput.addEventListener("input", renderTable);
  filterTopicSelect.addEventListener("change", renderTable);

  imgUploadTrigger.addEventListener("click", () => imgInput.click());
  imgInput.addEventListener("change", handleImageUpload);
  btnRemoveImg.addEventListener("click", (e) => {
    e.stopPropagation();
    removeImage();
  });

  // Event delegation for table actions
  tableBody.addEventListener("click", (e) => {
    const editBtn = e.target.closest(".btn-edit");
    const deleteBtn = e.target.closest(".btn-delete");

    if (editBtn) {
      const id = parseInt(editBtn.dataset.id);
      openEditModal(id);
    }

    if (deleteBtn) {
      const id = parseInt(deleteBtn.dataset.id);
      deleteQuestion(id);
    }
  });
}

async function populateTopicSelects() {
  let optionsHtml = "";
  const response = await FetchData("/topic", true);
  console.log(response);
  const data = response.data.topics || [];

  data.forEach((cat) => {
    optionsHtml += `<optgroup label="${cat.name}">`;
    optionsHtml += `<option value="${cat.id}">${cat.name}</option>`;
    cat.subtopics.forEach((sub) => {
      optionsHtml += `<option value="${sub.id}">${sub.name}</option>`;
    });
    optionsHtml += `</optgroup>`;
  });

  modalTopicSelect.innerHTML =
    '<option value="">Uncategorized</option>' + optionsHtml;
  filterTopicSelect.innerHTML =
    '<option value="">All Topics</option>' + optionsHtml;
}
function createQuestionRow(q) {
  // Create row
  const tr = document.createElement("tr");

  // --- First cell (question text + optional image marker)
  const tdText = document.createElement("td");
  const divText = document.createElement("div");
  divText.style.fontWeight = "500";
  divText.style.color = "#0f172a";
  divText.style.display = "flex";
  divText.style.alignItems = "center";
  divText.style.gap = "8px";

  if (q.image) {
    const spanImg = document.createElement("span");
    spanImg.style.fontSize = "12px";
    spanImg.style.color = "#6366f1";
    divText.appendChild(spanImg);
  }

  const textContent =
    q.content.length > 60 ? q.content.substring(0, 60) + "..." : q.content;
  divText.appendChild(document.createTextNode(textContent));
  tdText.appendChild(divText);

  // --- Second cell (topic badge)
  const tdTopic = document.createElement("td");
  const spanTopic = document.createElement("span");
  spanTopic.className = "topic-badge";
  spanTopic.textContent = q.topic_id || "General";
  tdTopic.appendChild(spanTopic);

  // --- Third cell (action buttons)
  const tdActions = document.createElement("td");
  tdActions.style.textAlign = "right";

  const divActions = document.createElement("div");
  divActions.className = "action-btns";
  divActions.style.justifyContent = "flex-end";

  const btnEdit = document.createElement("button");
  btnEdit.className = "icon-btn btn-edit";
  btnEdit.dataset.id = q.question_id;
  btnEdit.title = "Edit";
  btnEdit.textContent = "✎";
  btnEdit.addEventListener("click", () => editQuestion(q.question_id));

  const btnDelete = document.createElement("button");
  btnDelete.className = "icon-btn btn-delete";
  btnDelete.dataset.id = q.question_id;
  btnDelete.title = "Delete";
  btnDelete.textContent = "🗑";
  btnDelete.addEventListener("click", () => deleteQuestion(q.question_id));

  divActions.appendChild(btnEdit);
  divActions.appendChild(btnDelete);
  tdActions.appendChild(divActions);

  // --- Assemble row
  tr.appendChild(tdText);
  tr.appendChild(tdTopic);
  tr.appendChild(tdActions);

  return tr;
}

async function renderTable() {
  const searchText = searchInput.value.toLowerCase();
  const filterTopic = filterTopicSelect.value;
  const response = await FetchData("/questions", true);
  if (response.data.questions.length > 0) {
    const tableBody = document.getElementById("questions-table-body");
    tableBody.innerHTML = "";
    response.data.questions.forEach((q) => {
      tableBody.appendChild(createQuestionRow(q));
    });
  }
  /* {
        const p = document.createElement("p")
        p.innerText = "No questions yet submitted"
        tableBody.append(p)
    } */
}
let editOptions = []
async function editQuestion(id) {
  document.getElementById("q-id-input").value = id;
  const data = await FetchData(`/question/${id}`, true);
  console.log(data.data.question);

  const q = data.data.question;
  editOptions = q.options;
  document.getElementById("modal-title").innerText = "Edit Question";
  document.getElementById("modal-q-text").value = q.content;
  modalTopicSelect.value = q.topic_id || "";

  currentImageData = `data:image/png;base64,${q.image}` || null;
  updateImagePreview();
  renderModalOptions(q.options, q.correct_answer_id);
  modal.classList.add("open");
}

async function openEditModal(id) {
  editingId = id;
  const q = questions.find((item) => item.id === id);

  document.getElementById("modal-title").innerText = "Edit Question";
  document.getElementById("modal-q-text").value = q.text;
  modalTopicSelect.value = q.topic || "";

  currentImageData = q.image || null;
  updateImagePreview();
  renderModalOptions(q.options, q.correctIndex);
  modal.classList.add("open");
}

function openCreateModal() {
  editingId = null;
  document.getElementById("modal-title").innerText = "Create New Question";
    document.getElementById("modal-q-text").value = "";
    document.getElementById("q-id-input").value = "";
  modalTopicSelect.value = "";

  currentImageData = null;
  updateImagePreview();
  const container = document.getElementById("modal-options-list");
  container.innerHTML = ["", "", "", ""]
    .map(
      (opt, i) => `
          <div class="option-row">
            <input type="radio" name="modal-correct" class="radio-custom" value="${i}" ${i === 0 ? "checked" : ""}>
            <input type="text" class="q-input modal-opt-input" style="margin-bottom:0;" value="${opt}" placeholder="Option ${i + 1}">
          </div>
        `,
    )
    .join("");
  modal.classList.add("open");
}

function closeModal() {
  modal.classList.remove("open");
}

function renderModalOptions(options, correctIdx) {
  const container = document.getElementById("modal-options-list");
  container.innerHTML = options
    .map(
      (opt, i) => `
          <div class="option-row">
            <input type="radio" name="modal-correct" class="radio-custom" value="${opt.answer_id}" ${opt.answer_id === correctIdx ? "checked" : ""}>
            <input type="text" class="q-input modal-opt-input" style="margin-bottom:0;" value="${opt.text}" placeholder="Option ${opt.text}">
          </div>
        `,
    )
    .join("");
}

function handleImageUpload(e) {
  const file = e.target.files[0];
  if (file) {
    currentImageFile = file; // Store raw file
    const reader = new FileReader();
    reader.onload = (ev) => {
      currentImageData = ev.target.result; // Store base64 for preview
      updateImagePreview();
    };
    reader.readAsDataURL(file);
  }
}

function removeImage() {
  currentImageData = null;
  imgInput.value = "";
  updateImagePreview();
}

function updateImagePreview() {
  if (currentImageData) {
    imgPreview.src = currentImageData;
    imgPreview.classList.add("show");
    imgPlaceholder.style.display = "none";
    btnRemoveImg.classList.add("show");
  } else {
    imgPreview.src = "";
    imgPreview.classList.remove("show");
    imgPlaceholder.style.display = "flex";
    btnRemoveImg.classList.remove("show");
  }
}

async function saveQuestion() {
  const text = document.getElementById("modal-q-text").value;
  const id = document.getElementById("q-id-input").value;
  alert(id);
  const topic = modalTopicSelect.value;
  const options = Array.from(document.querySelectorAll(".modal-opt-input")).map(
    (i) => i.value,
    );

  const correctIndex = parseInt(
    document.querySelector('input[name="modal-correct"]:checked')?.value || 0,
    );

  if (!correctIndex) {
    showToast("Please select a correct answer");
    return;
  }
  console.log(correctIndex);
  if (!text.trim()) {
    showToast("Please enter a question text");
    return;
  }

  // --- PREPARING FOR BACKEND ---
  // Using FormData to send raw file + JSON data
  const formData = new FormData();
  formData.append("content", text);
  formData.append("topic", topic);
  
  formData.append("correctIndex", correctIndex);

  if (currentImageFile) {
    formData.append("image", currentImageFile);
  } else if (currentImageData && !currentImageFile) {
    formData.append("image", currentImageData);
  }
  if (id) {
      
      const updatedOptions = editOptions.map((opt, index) => ({
        answer_id: opt.answer_id,
        is_correct: opt.is_correct,
        text: options[index] || opt.text, // fallback to original if input missing
      }));
      formData.append("options", JSON.stringify(updatedOptions));
      formData.append("id", id);

    const response = await UpdateData(`/question/${id}`, formData, true);
    if (response.success) {
      showToast("Question updated");
    } else {
      showToast("Failed to updated question");
    }
  } else {
      formData.append("options", JSON.stringify(options));
      const response = await PostData("/question", formData, true);

      if (response.success) {
        showToast("New question created");
      } else {
        showToast("Failed to create New question");
      }
  }

  

  closeModal();
  renderTable();
}

async function deleteQuestion(id) {
  if (confirm("Are you sure you want to delete this question?")) {   
      const res = await DeleteData(`/question/${id}`);
      if (res.success) {
        localQuestions.splice(currentQIndex, 1);
        currentQIndex = Math.max(0, currentQIndex - 1);
        renderTable();
        showToast("Question deleted");
      } else {
          renderTable();
      }
    }  
}

function showToast(message) {
  toast.innerText = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

init();
