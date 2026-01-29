import { PostData, FetchData,UpdateData,DeleteData } from "./API/crud.js";



// --- State Management ---
// Using localCategories as the "db" source for the simulation
let localCategories = [
  { id: "1", name: "Science", subtopics: ["Biology", "Physics", "Chemistry"] },
  { id: "2", name: "Math", subtopics: ["Algebra", "Geometry"] },
];

let quiz = {
  title: "Science Quiz",
  questions: [
    {
      id: Date.now(),
      text: "What is H2O?",
      topic: "Science: Chemistry",
      imageData: null,
      options: ["Oxygen", "Hydrogen", "Water", "Nitrogen"],
      correctIndex: 2,
    },
    {
      id: Date.now(),
      text: "What is Tris Tech hub?",
      topic: "Science: Chemistry",
      imageData: null,
      options: ["Shop", "Company", "School", "Incorportation"],
      correctIndex: 2,
    },
  ],
};

let currentQIndex = 0;
let currentCatIndex = 0;

// --- UI Updates ---
async function updateTopicSelects() {
  const select = document.getElementById("q-topic-select");
  if (!select) return;

    let html = '<option value="">Uncategorized</option>';
     const response = await FetchData("/topic", true);
    const data = response.data.topics || [];
    localCategories =data

  localCategories.forEach((topic) => {
    // Add parent topic as selectable
    html += `<option value="${topic.id}">${topic.name}</option>`;

    // Add subtopics indented under parent
    (topic.subtopics || []).forEach((sub) => {
      html += `<option value="${sub.id}">— ${sub.name}</option>`;
    });
  });

  select.innerHTML = html;
}

window.editsubtopic = async (name,index) => {
    const popBox = document.getElementById("popup");
    const hiddenBox =document.getElementById("idEdit")
    const inputBox = document.getElementById("edit-sub-in");
    const editBtn = document.getElementById("btn-edit-sub");

    popBox.style.display = "flex";
    inputBox.value = name
    hiddenBox.value = index
    document.getElementById("closePop").addEventListener("click", () => {
      popBox.style = "none";
    });
    editBtn.addEventListener("click", async () => {
        const newName = inputBox.value;
        const payload = { id: index, topicName: newName }
        const response = await UpdateData(`/topic`, payload, true);

        if (response.success) {
          alert("Successfully to update sub topic");
          currentCat.name = newName;
          updateTopicSelects();
          showToast(`Updated to "${newName}"`);
        } else {
          alert("Failed to update  subtopic");
        }
        
    })

};



function renderQuestion() {
  if (quiz.questions.length === 0) {
    document.getElementById("q-card-body").innerHTML =
      '<p style="text-align:center; color:#94a3b8; padding:50px;">No questions. Click "Add Question" to start.</p>';
    document.getElementById("q-counter").innerText = "0 of 0";
    return;
  }

  const q = quiz.questions[currentQIndex];
  document.getElementById("q-counter").innerText =
    `Question ${currentQIndex + 1} of ${quiz.questions.length}`;
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

  const optionsList = document.getElementById("q-options-list");
  optionsList.innerHTML = q.options
    .map(
      (opt, i) => `
                <div class="option-row">
                    <input type="radio" name="correct" ${q.correctIndex === i ? "checked" : ""} onchange="updateCorrect(${i})">
                    <input type="text" class="option-input" value="${opt}" placeholder="Option ${i + 1}" oninput="updateOption(${i}, this.value)">
                </div>
            `,
    )
    .join("");

  document.getElementById("prev-q").disabled = currentQIndex === 0;
  document.getElementById("next-q").disabled =
    currentQIndex === quiz.questions.length - 1;
}

async function renderCategory() {
  const content = document.getElementById("cat-view-content");
  if (!content) return;

  // Fetching directly from backend logic
    const response = await FetchData("/topic", true);
    const data = response.data.topics || [];
    console.log(data)
  localCategories = data; // Sync local copy with retrieved data

  if (data.length === 0) {
    content.innerHTML =
      '<p style="color:#64748b; padding:40px;">No categories exist. Click "+ New Topic" to add one.</p>';
    const counter = document.getElementById("cat-counter");
    if (counter) counter.innerText = "0 of 0";
    return;
  }

  content.classList.remove("hidden");
  const cat = data[currentCatIndex];

  document.getElementById("cat-counter").innerText =
    `Topic ${currentCatIndex + 1} of ${data.length}`;
  document.getElementById("cat-display-name").value = cat.name;

  const list = document.getElementById("cat-subs-list");
  list.innerHTML = (cat.subtopics || [])
    .map(
      (s) => `
                <div class="sub-pill" >
                    ${s.name}
                     <span style="cursor:pointer; opacity:0.5; font-size:18px;color:limegreen;" onclick="editsubtopic('${s.name}','${s.id}')">Edit</span>
                    <span style="cursor:pointer; opacity:0.5; font-size:18px;color:red;" onclick="removeSub('${s.id}')">Delete</span>
                </div>
            `,
    )
    .join("");

  document.getElementById("prev-cat").disabled = currentCatIndex === 0;
  document.getElementById("next-cat").disabled =
    currentCatIndex === data.length - 1;
  updateTopicSelects();
}

function showToast(msg) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerText = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

// --- Category Handlers ---
document.getElementById("toggle-new-topic").addEventListener("click", () => {
  document.getElementById("new-topic-container").classList.toggle("hidden");
  document.getElementById("new-topic-name-in").focus();
});

document.getElementById("btn-cancel-topic").addEventListener("click", () => {
  document.getElementById("new-topic-container").classList.add("hidden");
  document.getElementById("new-topic-name-in").value = "";
});

document
  .getElementById("btn-create-topic")
  .addEventListener("click", async () => {
    const input = document.getElementById("new-topic-name-in");
    const name = input.value.trim();
    if (!name) return;

    const payload = { topicName: name };
    const response = await PostData("/topic", payload, true);

    if (response.success) {
      const newId = Date.now().toString();
      localCategories.push({ id: newId, name, subtopics: [] });
      currentCatIndex = localCategories.length - 1;
      input.value = "";
      document.getElementById("new-topic-container").classList.add("hidden");
      renderCategory();
      showToast(`Topic "${name}" created!`);
    } else {
      alert("Failed to add topic");
    }
  });

// Update Button Handler
document
  .getElementById("btn-update-cat")
  .addEventListener("click", async () => {
    const currentCat = localCategories[currentCatIndex];
    if (!currentCat) return;

    const newName = document.getElementById("cat-display-name").value.trim();
    const payload = { topicName: newName ,id : currentCat.id };

    // Using the retrieved ID to update
    const response = await UpdateData(`/topic`, payload, true);

      if (response.success) {
        alert("Successfully to update topic"); 
      currentCat.name = newName;
      updateTopicSelects();
      showToast(`Updated to "${newName}"`);
    } else {
      alert("Failed to update topic");
    }
  });

document.getElementById("btn-del-cat").addEventListener("click", async () => {
  if (localCategories.length > 0) {
      const catToDelete = localCategories[currentCatIndex];
      const payload ={id : catToDelete.id}
    // Using retrieved ID to delete
    const response = await DeleteData(`/topic`,payload, true);

    if (response.success) {
      const deletedName = catToDelete.name;
      localCategories.splice(currentCatIndex, 1);
      currentCatIndex = Math.max(0, currentCatIndex - 1);
        renderCategory();
        alert("success in  to delete topic");
      showToast(`Deleted "${deletedName}"`);
    } else {
      alert("Failed to delete topic");
    }
  }
});

document.getElementById("btn-add-sub").addEventListener("click", async () => {
  const input = document.getElementById("new-sub-in");
  const sub = input.value.trim();
    const currentCat = localCategories[currentCatIndex];
    console.log(currentCat.id);

  if (sub && currentCat) {
      const updatedSubs = [...(currentCat.subtopics || []), sub];
      const payload = { subtopicName: sub, parentId: currentCat.id };
     const response = await PostData("/subtopic",payload,true);

    if (response.success) {
      currentCat.subtopics = updatedSubs;
      input.value = "";
      renderCategory();
      showToast(`Subtopic "${sub}" added!`);
    }
  }
});

window.removeSub = async (sub) => {
  if (sub) {
    const response = await DeleteData(
      `/topic`,
      { id: sub },
      true,
    );

    if (response.success) {
      renderCategory();
    }
  }
};

// --- Question Handlers ---
window.updateOption = (i, val) =>
  (quiz.questions[currentQIndex].options[i] = val);
window.updateCorrect = (i) => (quiz.questions[currentQIndex].correctIndex = i);

document
  .getElementById("q-text")
  .addEventListener(
    "input",
    (e) => (quiz.questions[currentQIndex].text = e.target.value),
  );
document
  .getElementById("q-topic-select")
  .addEventListener(
    "change",
    (e) => (quiz.questions[currentQIndex].topic = e.target.value),
  );

document.getElementById("q-file").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      quiz.questions[currentQIndex].imageData = ev.target.result;
      renderQuestion();
    };
    reader.readAsDataURL(file);
  }
});

document.getElementById("btn-add-q").addEventListener("click", () => {
  quiz.questions.push({
    id: Date.now(),
    text: "",
    topic: "",
    imageData: null,
    options: ["", "", "", ""],
    correctIndex: 0,
  });
  currentQIndex = quiz.questions.length - 1;
  switchTab("editor");
  renderQuestion();
});

document.getElementById("btn-del-q").addEventListener("click", () => {
  if (quiz.questions.length > 0) {
    quiz.questions.splice(currentQIndex, 1);
    currentQIndex = Math.max(0, currentQIndex - 1);
    renderQuestion();
    showToast("Question removed");
  }
});

// --- Navigation ---
function switchTab(tab) {
  document.getElementById("view-editor").classList.add("hidden");
  document.getElementById("view-categories").classList.add("hidden");
  document.getElementById("view-preview").classList.add("hidden");
  document
    .querySelectorAll(".nav-btn")
    .forEach((b) => b.classList.remove("active"));

  if (tab === "editor") {
    document.getElementById("view-editor").classList.remove("hidden");
    document.getElementById("nav-editor").classList.add("active");
    renderQuestion();
  } else if (tab === "categories") {
    document.getElementById("view-categories").classList.remove("hidden");
    document.getElementById("nav-categories").classList.add("active");
    renderCategory();
  } else if (tab === "preview") {
    document.getElementById("view-preview").classList.remove("hidden");
    document.getElementById("nav-preview").classList.add("active");
    renderPreview();
  }
}

document
  .getElementById("nav-editor")
  .addEventListener("click", () => switchTab("editor"));
document
  .getElementById("nav-categories")
  .addEventListener("click", () => switchTab("categories"));
document
  .getElementById("nav-preview")
  .addEventListener("click", () => switchTab("preview"));

document.getElementById("prev-q").addEventListener("click", () => {
  if (currentQIndex > 0) {
    currentQIndex--;
    renderQuestion();
  }
});
document.getElementById("next-q").addEventListener("click", () => {
  if (currentQIndex < quiz.questions.length - 1) {
    currentQIndex++;
    renderQuestion();
  }
});
document.getElementById("prev-cat").addEventListener("click", () => {
  if (currentCatIndex > 0) {
    currentCatIndex--;
    renderCategory();
  }
});
document.getElementById("next-cat").addEventListener("click", () => {
  if (currentCatIndex < localCategories.length - 1) {
    currentCatIndex++;
    renderCategory();
  }
});

document.getElementById("btn-save").addEventListener("click", () => {
  showToast("All changes saved locally!");
});

function renderPreview() {
  const pv = document.getElementById("pv-content");
  pv.innerHTML =
    quiz.questions
      .map(
        (q, i) => `
                <div style="border-bottom:1px solid #eee; padding:20px 0; text-align:left;">
                    <small style="color:indigo; font-weight:bold;">${q.topic || "General"}</small>
                    <p><strong>${i + 1}. ${q.text || "Untitled Question"}</strong></p>
                </div>
            `,
      )
      .join("") || "<p>No questions to preview.</p>";
}

// Init
updateTopicSelects();
renderQuestion();
