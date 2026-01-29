import { PostData, FetchData, UpdateData, DeleteData } from "./API/crud.js";

// --- State ---
let localCategories = [
  {
    id: "1",
    name: "Science",
    subtopics: [
      { id: "s1", name: "Biology" },
      { id: "s2", name: "Physics" },
    ],
  },
];
let localQuestions = [
  {
    id: 1,
    text: "What is H2O?",
    topic: "Science: Biology",
    options: ["Oxygen", "Hydrogen", "Water", "Nitrogen"],
    correctIndex: 2,
    imageData: null,
  },
];

let currentQIndex = 0;
let currentCatIndex = 0;

// --- UI Utils ---
function showToast(msg) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerText = msg;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

async function updateTopicSelects() {
  const select = document.getElementById("q-topic-select");
  let html = '<option value="">Uncategorized</option>';
  const response = await FetchData("/topic", true);
  console.log(response);
  const data = response.data.topics || [];
  localCategories = data;

  localCategories.forEach((topic) => {
    html += `<option value="${topic.id}">${topic.name}</option>`;
    html += `<optgroup label="${topic.name}">`;
    (topic.subtopics || []).forEach((sub) => {
      const val = `${topic.name}: ${sub.name}`;
      html += `<option value="${val}">${sub.name}</option>`;
    });
    html += `</optgroup>`;
  });
  select.innerHTML = html;
  if (localQuestions[currentQIndex]) {
    select.value = localQuestions[currentQIndex].topic;
  }
}

// --- Question Editor ---
function renderQuestion() {
  const cardBody = document.getElementById("q-card-body");
  const counter = document.getElementById("q-counter");

  if (localQuestions.length === 0) {
    cardBody.innerHTML =
      '<p style="text-align:center; color:#94a3b8; padding:50px;">No questions found. Click "+ New Question".</p>';
    counter.innerText = "0 of 0";
    return;
  }

  const q = localQuestions[currentQIndex];
  counter.innerText = `Question ${currentQIndex + 1} of ${localQuestions.length}`;
  document.getElementById("q-text").value = q.text;
  document.getElementById("q-topic-select").value = q.topic;

  const img = document.getElementById("q-img-preview");
  const placeholder = document.getElementById("img-placeholder");
  if (q.imageData) {
    img.src = q.imageData;
    img.classList.remove("hidden");
    placeholder.classList.add("hidden");
  } else {
    img.classList.add("hidden");
    placeholder.classList.remove("hidden");
  }

  document.getElementById("q-options-list").innerHTML = q.options
    .map(
      (opt, i) => `
          <div class="option-row">
            <input type="radio" name="correct" ${q.correctIndex === i ? "checked" : ""} onchange="localQuestions[${currentQIndex}].correctIndex = ${i}">
            <input type="text" class="option-input" value="${opt}" placeholder="Option ${i + 1}" oninput="localQuestions[${currentQIndex}].options[${i}] = this.value">
          </div>
        `,
    )
    .join("");

  document.getElementById("prev-q").disabled = currentQIndex === 0;
  document.getElementById("next-q").disabled =
    currentQIndex === localQuestions.length - 1;
}

document.getElementById("btn-add-q-side").addEventListener("click", (event) => {
  // Accessing the container slide via the button's closest parent or direct query to target fields
  const slide = document.querySelector(".page-card");

  // Clear the main question text
  const qTextElement = slide.querySelector("#q-text");
  if (qTextElement) qTextElement.value = "";

  // Reset the topic select to the first/default option
  const qTopicElement = slide.querySelector("#q-topic-select");
  if (qTopicElement) qTopicElement.selectedIndex = 0;

  // Clear the file input and reset image previews
  const fileInput = slide.querySelector("#q-file");
  if (fileInput) fileInput.value = "";

  const imgPreview = slide.querySelector("#q-img-preview");
  const imgPlaceholder = slide.querySelector("#img-placeholder");
  const removeImgBtn = slide.querySelector("#btn-remove-img");

  if (imgPreview) imgPreview.classList.add("hidden");
  if (imgPlaceholder) imgPlaceholder.classList.remove("hidden");
  if (removeImgBtn) removeImgBtn.classList.add("hidden");

  // Clear all option text inputs
  const optionInputs = slide.querySelectorAll(".option-input");
  optionInputs.forEach((input) => {
    input.value = "";
  });

  // Reset radio buttons (uncheck all)
  const radioButtons = slide.querySelectorAll("input[name='correct']");
  radioButtons.forEach((radio) => {
    radio.checked = false;
  });

  // Locally create a new empty question object in the array
  const newEmptyQ = {
    id: Date.now().toString(),
    text: "",
    topic: "",
    options: ["", "", "", ""],
    correctIndex: -1,
    imageData: null,
  };

  localQuestions.push(newEmptyQ);
  currentQIndex = localQuestions.length - 1;

  // Update UI counters if they exist
  const counter = document.getElementById("q-counter");
  if (counter) {
    counter.innerText = `Question ${localQuestions.length} of ${localQuestions.length}`;
  }

  showToast("New empty slide created!");
});

document
  .getElementById("btn-save-q")
  .addEventListener("click", async (event) => {
    if (localQuestions.length === 0) return;

    // Accessing the container slide via the button's closest parent to target fields
    const slide = event.target.closest(".page-card");
    const qText = slide.querySelector("#q-text").value.trim();
    const qTopic = slide.querySelector("#q-topic-select").value;
    const fileInput = slide.querySelector("#q-file");

    // Extracting options directly from the DOM inputs
    const optionInputs = slide.querySelectorAll(".option-input");
    const options = Array.from(optionInputs).map((input) => input.value);

    // Finding the selected radio button for correct index
    const radioButtons = slide.querySelectorAll("input[name='correct']");
    const correctIndex = Array.from(radioButtons).findIndex(
      (radio) => radio.checked,
    );

    // Validation: Don't send empty content to the database
    if (!qText) {
      showToast("Question text cannot be empty!");
      return;
    }

    const formData = new FormData();

    // Constructing payload entirely from DOM values
    const questionPayload = {
      id: localQuestions[currentQIndex].id, // Still using ID for the URL path
      text: qText,
      topic: qTopic,
      options: options,
      correctIndex: correctIndex,
    };

    formData.append("questionData", JSON.stringify(questionPayload));

    // Append the raw file from the input if it exists
    if (fileInput.files[0]) {
      formData.append("image", fileInput.files[0]);
    }

    try {
      const response = await fetch(`/questions/${questionPayload.id}`, {
        method: "PUT",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        // Update local state to match the saved database content
        const q = localQuestions[currentQIndex];
        q.text = qText;
        q.topic = qTopic;
        q.options = options;
        q.correctIndex = correctIndex;
        showToast("Question and image saved!");
      }
    } catch (error) {
      console.error("Submission failed", error);
      showToast("Error saving to database");
    }
  });

document.getElementById("btn-del-q").addEventListener("click", async () => {
  if (localQuestions.length === 0) return;
  const q = localQuestions[currentQIndex];
  const res = await DeleteData(`/questions/${q.id}`);
  if (res.success) {
    localQuestions.splice(currentQIndex, 1);
    currentQIndex = Math.max(0, currentQIndex - 1);
    renderQuestion();
    showToast("Question deleted");
  }
});

// --- Categories ---
function renderCategory() {
  if (localCategories.length === 0) {
    document.getElementById("cat-view-content").innerHTML =
      '<p style="text-align:center; color:#94a3b8; padding:50px;">No topics found. Click "+ New Topic".</p>';
    document.getElementById("cat-counter").innerText = "0 of 0";
    document.getElementById("btn-del-cat").classList.add("hidden");
    return;
  } else {
    document.getElementById("btn-del-cat").classList.remove("hidden");
  }

  const cat = localCategories[currentCatIndex];
  document.getElementById("cat-counter").innerText =
    `Topic ${currentCatIndex + 1} of ${localCategories.length}`;
  document.getElementById("cat-display-name").value = cat.name;

  document.getElementById("cat-subs-list").innerHTML = (cat.subtopics || [])
    .map(
      (s) => `
          <div class="sub-pill">
            ${s.name}
            <span class="sub-action" style="color:#6366f1;" onclick="openEditSub('${s.id}', '${s.name}')">✎</span>
            <span class="sub-action" style="color:#ef4444;" onclick="deleteSub('${s.id}')">✕</span>
          </div>
        `,
    )
    .join("");

  document.getElementById("prev-cat").disabled = currentCatIndex === 0;
  document.getElementById("next-cat").disabled =
    currentCatIndex === localCategories.length - 1;
}

// Add New Topic
document.getElementById("toggle-new-topic").onclick = () => {
  const container = document.getElementById("new-topic-container");
  container.classList.toggle("hidden");
  document.getElementById("new-topic-name-in").focus();
};

document.getElementById("btn-create-topic").onclick = async () => {
  const nameInput = document.getElementById("new-topic-name-in");
  const name = nameInput.value.trim();
  if (!name) return;

  const payload = { topicName: name };
  const res = await PostData("/topic", payload, true);

  if (res.success) {
    localCategories.push(newTopic);
    currentCatIndex = localCategories.length - 1;
    nameInput.value = "";
    document.getElementById("new-topic-container").classList.add("hidden");
    renderCategory();
    updateTopicSelects();
    showToast("Topic created!");
  } else {
    showToast("Failed to add topic");
  }
};

// Delete Topic
document.getElementById("btn-del-cat").onclick = async () => {
  if (localCategories.length === 0) return;
  const cat = localCategories[currentCatIndex];
  const payload = { id: cat.id };
  // Using retrieved ID to delete
  const res = await DeleteData(`/topic`, payload, true);
  if (res.success) {
    localCategories.splice(currentCatIndex, 1);
    currentCatIndex = Math.max(0, currentCatIndex - 1);
    renderCategory();
    updateTopicSelects();
    showToast("Topic removed");
  }
};

// Update Topic Name
document.getElementById("btn-update-cat").onclick = async () => {
  const cat = localCategories[currentCatIndex];
  const newName = document.getElementById("cat-display-name").value.trim();
  if (!newName) return;

  await UpdateData(`/topics/${cat.id}`, { name: newName });
  const payload = { topicName: newName, id: cat.id };
  // Using the retrieved ID to update
  const response = await UpdateData(`/topic`, payload, true);
  if (response.success) {
    alert("Successfully to update topic");
    cat.name = newName;
    updateTopicSelects();
    showToast(`Updated to "${newName}"`);
  } else {
    alert("Failed to update topic");
  }
};

// Add Subtopic
document.getElementById("btn-add-sub").onclick = async () => {
  const cat = localCategories[currentCatIndex];
  const input = document.getElementById("new-sub-in");
  const subName = input.value.trim();
  if (!subName) return;

  if (subName && cat) {
    const payload = { subtopicName: subName, parentId: cat.id };
    const response = await PostData("/subtopic", payload, true);

    if (response.success) {
      input.value = "";
      renderCategory();
      updateTopicSelects();
      showToast("Subtopic added");
    } else {
        showToast(" Failed to Add Subtopic");
    }
  }
};

window.deleteSub = async (id) => {
  if (id) {
    const response = await DeleteData(`/topic`, { id: id }, true);

    if (response.success) {
      renderCategory();
      updateTopicSelects();
      showToast("Subtopic removed");
    }
  }
};

window.openEditSub = (id, name) => {
  const pop = document.getElementById("popup");
  pop.style.display = "flex";
  document.getElementById("edit-sub-in").value = name;
  document.getElementById("btn-confirm-edit").onclick = async () => {
    const newName = document.getElementById("edit-sub-in").value.trim();
    if (!newName) return;

    await UpdateData(`/subtopics/${id}`, { name: newName });

    const payload = { id: id, topicName: newName };
    const response = await UpdateData(`/topic`, payload, true);

    if (response.success) {
      alert("Successfully to update sub topic");
      renderCategory();
      updateTopicSelects();
      pop.style.display = "none";
      showToast("Subtopic updated");
    } else {
      alert("Failed to update  subtopic");
      showToast("Failed to update  subtopic");
    }
  };
};

document.getElementById("closePop").onclick = () =>
  (document.getElementById("popup").style.display = "none");

// --- Navigation & Global ---
function switchTab(tab) {
  document.getElementById("view-editor").classList.add("hidden");
  document.getElementById("view-categories").classList.add("hidden");
  document
    .querySelectorAll(".nav-btn")
    .forEach((b) => b.classList.remove("active"));

  const titleEl = document.getElementById("view-title");

  if (tab === "editor") {
    document.getElementById("view-editor").classList.remove("hidden");
    document.getElementById("nav-editor").classList.add("active");
    titleEl.innerText = "Question Editor";
    renderQuestion();
  } else {
    document.getElementById("view-categories").classList.remove("hidden");
    document.getElementById("nav-categories").classList.add("active");
    titleEl.innerText = "Category Manager";
    renderCategory();
  }
}

document.getElementById("nav-editor").onclick = () => switchTab("editor");
document.getElementById("nav-categories").onclick = () =>
  switchTab("categories");

document.getElementById("prev-q").onclick = () => {
  if (currentQIndex > 0) {
    currentQIndex--;
    renderQuestion();
  }
};
document.getElementById("next-q").onclick = () => {
  if (currentQIndex < localQuestions.length - 1) {
    currentQIndex++;
    renderQuestion();
  }
};

document.getElementById("prev-cat").onclick = () => {
  if (currentCatIndex > 0) {
    currentCatIndex--;
    renderCategory();
  }
};
document.getElementById("next-cat").onclick = () => {
  if (currentCatIndex < localCategories.length - 1) {
    currentCatIndex++;
    renderCategory();
  }
};

// File handling
document.getElementById("q-file").onchange = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      localQuestions[currentQIndex].imageData = ev.target.result;
      renderQuestion();
    };
    reader.readAsDataURL(file);
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  await updateTopicSelects();
  renderQuestion();
});
// Init
