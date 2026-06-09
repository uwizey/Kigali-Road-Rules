// ════════════════════════════════════════════════════════════════════════════
// IMPORTS
// ════════════════════════════════════════════════════════════════════════════
import { FetchData, PostData, DeleteData, UpdateData } from "../api/crud.js";

// ════════════════════════════════════════════════════════════════════════════
// POPUP / MODAL ENGINE
// ════════════════════════════════════════════════════════════════════════════

function handleApiResponse(response) {
  if (response?.success === true) return false;

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
    409: {
      title: "Conflict",
      icon: "fas fa-exclamation-triangle",
      color: "#e67e22",
    },
    500: { title: "Server Error", icon: "fas fa-server", color: "#c0392b" },
    502: { title: "Server Error", icon: "fas fa-server", color: "#c0392b" },
    503: { title: "Unavailable", icon: "fas fa-server", color: "#c0392b" },
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



function createBasePopup({
  title = "",
  message = "",
  icon = "fas fa-info-circle",
  iconColor = "",
  confirmText = "Confirm",
  cancelText = "Close",
  showCancel = true,
  showConfirm = true,
  onConfirm = () => {},
  onCancel = () => {},
}) {
  document.getElementById("progressWarningOverlay")?.remove();

  const overlay = document.createElement("div");
  overlay.id = "progressWarningOverlay";
  overlay.innerHTML = `
    <div id="progressWarningBox">
      <div class="pw-icon${iconColor ? ` pw-icon--custom" style="color:${iconColor}` : ""}">
        <i class="${icon}"></i>
      </div>
      <h3>${title}</h3>
      <div class="pw-message-content">${message}</div>
      <div class="pw-actions">
        ${showCancel ? `<button class="pw-btn pw-btn-cancel">${cancelText}</button>` : ""}
        ${showConfirm ? `<button class="pw-btn pw-btn-confirm">${confirmText}</button>` : ""}
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const close = () => overlay.remove();

  overlay.querySelector(".pw-btn-cancel")?.addEventListener("click", () => {
    close();
    onCancel();
  });
  overlay.querySelector(".pw-btn-confirm")?.addEventListener("click", () => {
    close();
    onConfirm();
  });
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      close();
      onCancel();
    }
  });
}

function showInfoPopup(
  title,
  message,
  icon = "fas fa-info-circle",
  iconColor = "",
) {
  createBasePopup({
    title,
    message,
    icon,
    iconColor,
    showConfirm: false,
    cancelText: "OK",
  });
}

/**
 * Inspects an API result object and shows an error popup when the call failed.
 * Returns true if an error was shown (caller should abort), false if all is well.
 */
function handleApiError(res) {
  if (res.success) return false;

  let title = "Error";
  let icon = "fas fa-exclamation-circle";
  let color = "";

  if (!res.status) {
    title = "Network Issue";
    icon = "fas fa-wifi";
  } else if (res.status === 401) {
    return true;
  } else if (res.status === 403) {
    title = "Access Restricted";
    icon = "fas fa-lock";
  } else if (res.status >= 500) {
    title = "Server Error";
    icon = "fas fa-server";
  }

  showInfoPopup(title, res.userMessage, icon, color);
  return true;
}

// ════════════════════════════════════════════════════════════════════════════
// FORMAT TYPES
// ════════════════════════════════════════════════════════════════════════════

const FORMAT_TYPES = {
  flipcards: { icon: "🃏", label: "Flip Cards" },
  timeline: { icon: "📅", label: "Timeline" },
  accordion: { icon: "🪗", label: "Accordion" },
  tabs: { icon: "📑", label: "Tabs" },
  imageblock: { icon: "🖼️", label: "Image Block" },
  image_right: { icon: "▶🖼", label: "Image Right" },
  image_left: { icon: "🖼◀", label: "Image Left" },
  image_overlay: { icon: "🌅", label: "Image Overlay" },
  exercise: { icon: "✏️", label: "Exercise" },
};

const FORMAT_GROUPS = [
  {
    label: "Content Formats",
    types: ["flipcards", "accordion", "tabs", "timeline"],
  },
  {
    label: "Image Layouts",
    types: ["imageblock", "image_right", "image_left", "image_overlay"],
  },
  { label: "Other", types: ["exercise"] },
];

const FORMAT_ITEM_FIELDS = {
  flipcards: [
    {
      key: "title",
      label: "Front Title",
      tag: "input",
      placeholder: "Card title...",
    },
    {
      key: "content",
      label: "Back Content",
      tag: "textarea",
      placeholder: "Content shown on flip...",
    },
    { key: "image", label: "Image (opt.)", tag: "file" },
  ],
  accordion: [
    {
      key: "title",
      label: "Question / Heading",
      tag: "input",
      placeholder: "Section heading...",
    },
    {
      key: "content",
      label: "Answer / Body",
      tag: "textarea",
      placeholder: "Body text...",
    },
    { key: "image", label: "Image (opt.)", tag: "file" },
  ],
  tabs: [
    {
      key: "title",
      label: "Tab Name",
      tag: "input",
      placeholder: "Tab label...",
    },
    {
      key: "content",
      label: "Tab Content",
      tag: "textarea",
      placeholder: "Body text...",
    },
    { key: "image", label: "Image (opt.)", tag: "file" },
  ],
  timeline: [
    {
      key: "title",
      label: "Step / Label",
      tag: "input",
      placeholder: "Step title...",
    },
    {
      key: "content",
      label: "Description",
      tag: "textarea",
      placeholder: "Step details...",
    },
    { key: "image", label: "Image (opt.)", tag: "file" },
  ],
  image_right: [
    {
      key: "title",
      label: "Heading",
      tag: "input",
      placeholder: "Content heading...",
    },
    {
      key: "content",
      label: "Body",
      tag: "textarea",
      placeholder: "Body text...",
    },
    { key: "image", label: "Image", tag: "file" },
  ],
  image_left: [
    {
      key: "title",
      label: "Heading",
      tag: "input",
      placeholder: "Content heading...",
    },
    {
      key: "content",
      label: "Body",
      tag: "textarea",
      placeholder: "Body text...",
    },
    { key: "image", label: "Image", tag: "file" },
  ],
  image_overlay: [
    {
      key: "title",
      label: "Heading",
      tag: "input",
      placeholder: "Overlay heading...",
    },
    {
      key: "content",
      label: "Body",
      tag: "textarea",
      placeholder: "Overlay text...",
    },
    { key: "image", label: "Image", tag: "file" },
  ],
  imageblock: [
    { key: "url", label: "Image", tag: "file" },
    {
      key: "caption",
      label: "Caption",
      tag: "input",
      placeholder: "Caption...",
    },
  ],
  exercise: [],
};

const SINGLE_ITEM_FORMATS = new Set([
  "image_right",
  "image_left",
  "image_overlay",
  "imageblock",
  "exercise",
]);

// ════════════════════════════════════════════════════════════════════════════
// IN-MEMORY CACHE
// ════════════════════════════════════════════════════════════════════════════

const DB = {
  topics: [],
  sections: {},
  components: {},
};

// ════════════════════════════════════════════════════════════════════════════
// UI STATE
// ════════════════════════════════════════════════════════════════════════════

let state = {
  activeTopic: null,
  activeSection: null,
  expandedTopics: new Set(),
};

let dragSecId = null;
let dragCompId = null;

// ════════════════════════════════════════════════════════════════════════════
// DOM REFS
// ════════════════════════════════════════════════════════════════════════════

const topicsTree = document.getElementById("topicsTree");
const sectionsList = document.getElementById("sectionsList");
const builderBody = document.getElementById("builderBody");
const btnAddSection = document.getElementById("btnAddSection");

// ════════════════════════════════════════════════════════════════════════════
// BOOT
// ════════════════════════════════════════════════════════════════════════════
const $el = (id) => document.getElementById(id);
document.addEventListener("DOMContentLoaded", async () => {
  fetchTopics();
  bindEvents();
  setupAvatarDropdown();
  function setupAvatarDropdown() {
    const avatarBtn = $el("avatarBtn");
    const avatarDropdown = $el("avatarDropdown");
    if (!avatarBtn || !avatarDropdown) return;

    avatarBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = avatarDropdown.classList.toggle("open");
      avatarBtn.setAttribute("aria-expanded", String(isOpen));
      avatarBtn.classList.toggle("active", isOpen);
    });

    document.addEventListener("click", () => {
      avatarDropdown.classList.remove("open");
      avatarBtn.setAttribute("aria-expanded", "false");
      avatarBtn.classList.remove("active");
    });
  }

  const useremail = document.getElementById("userEmail");
  if (useremail) {
    const res = await FetchData("/user/profile", true);
    useremail.textContent = res.success
      ? (res.data?.data?.email ?? "Unknown User")
      : "Unknown User";
  }

  $el("btn-logout")?.addEventListener("click", async () => {
      const response = await FetchData("/logout", true);
      if (handleApiResponse(response)) return;
      localStorage.removeItem("authToken");
      window.location.href = "../auth/login.html";
    });
    if (useremail) {
          const res = await FetchData("/user/profile", true);
          useremail.textContent = res.success
            ? (res.data?.data?.email ?? "Unknown User")
            : "Unknown User";
        }
  $el("dashboardNavBtn")?.addEventListener(
    "click",
    () => (window.location.href = "dashboard.html"),
  );
  $el("contentNavBtn")?.addEventListener(
    "click",
    () => (window.location.href = "content.html"),
  );
  $el("dropdown-academy-btn")?.addEventListener("click", () => {
    window.location.href = "dashboard.html";
  });

  $el("dropdown-control-btn")?.addEventListener("click", () => {
    window.location.href = "content.html";
  });
});

// ════════════════════════════════════════════════════════════════════════════
// EVENT BINDING
// ════════════════════════════════════════════════════════════════════════════

function bindEvents() {
  // Left panel — topic tree
  topicsTree.addEventListener("click", handleTopicClick);

  // Middle panel — sections
  sectionsList.addEventListener("click", handleSectionClick);
  sectionsList.addEventListener("dblclick", handleSectionDblClick);
  sectionsList.addEventListener("dragstart", (e) => {
    const item = e.target.closest(".section-item");
    if (!item) return;
    dragSecId = parseInt(item.dataset.id);
    item.classList.add("dragging");
  });
  sectionsList.addEventListener("dragover", (e) => e.preventDefault());
  sectionsList.addEventListener("drop", onSectionDrop);
  sectionsList.addEventListener("dragend", (e) => {
    const item = e.target.closest(".section-item");
    if (item) item.classList.remove("dragging");
  });
  btnAddSection.addEventListener("click", createSection);

  // Right panel — builder
  builderBody.addEventListener("click", handleBuilderClick);
  builderBody.addEventListener("input", handleBuilderInput);
  builderBody.addEventListener("change", handleBuilderChange);

  builderBody.addEventListener("mousedown", (e) => {
    if (e.target.closest(".comp-drag")) {
      const card = e.target.closest(".component-card");
      if (card) card.setAttribute("draggable", "true");
    }
  });
  builderBody.addEventListener("mouseup", () => {
    builderBody
      .querySelectorAll(".component-card[draggable]")
      .forEach((c) => c.removeAttribute("draggable"));
  });

  builderBody.addEventListener("dragstart", onDragStart);
  builderBody.addEventListener("dragend", onDragEnd);
  builderBody.addEventListener("dragover", onDragOver);
  builderBody.addEventListener("dragleave", onDragLeave);
  builderBody.addEventListener("drop", onDrop);

  document
    .getElementById("btnOpenCompModal")
    .addEventListener("click", createComponent);

  document.getElementById("btnCollapseAll").addEventListener("click", () => {
    const sid = state.activeSection?.section_id;
    if (!sid) return;
    (DB.components[sid] || []).forEach((c) => (c._expanded = false));
    renderBuilder();
  });

  // Global modal close via [data-close]
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-close]");
    if (btn) closeModal(btn.dataset.close);
  });
}

// ════════════════════════════════════════════════════════════════════════════
// OBJECT URL MANAGEMENT
// ════════════════════════════════════════════════════════════════════════════

function revokeItemObjectUrls(item) {
  if (!item) return;
  Object.keys(item).forEach((k) => {
    if (k.startsWith("_objectUrl_") && item[k]) {
      URL.revokeObjectURL(item[k]);
      item[k] = null;
    }
  });
}

function revokeCompObjectUrls(comp) {
  if (!comp || !Array.isArray(comp.items)) return;
  comp.items.forEach(revokeItemObjectUrls);
}

function revokeSectionObjectUrls(sectionId) {
  (DB.components[sectionId] || []).forEach(revokeCompObjectUrls);
}

// ════════════════════════════════════════════════════════════════════════════
// API — TOPICS
// ════════════════════════════════════════════════════════════════════════════

async function fetchTopics() {
  const res = await FetchData("/topic", true);
  if (handleApiError(res)) {
    DB.topics = [];
    renderTopics();
    return;
  }
  DB.topics = toArray(res.data?.data);
  renderTopics();
}

// ════════════════════════════════════════════════════════════════════════════
// API — SECTIONS
// ════════════════════════════════════════════════════════════════════════════

async function fetchSections(subtopicId) {
  if (Array.isArray(DB.sections[subtopicId])) return;
  const res = await FetchData(`/sections/${subtopicId}`, true);
  if (handleApiError(res)) return;
  DB.sections[subtopicId] = toArray(res.data?.data);
}

async function createSection() {
  if (!state.activeTopic) return;
  const tid = state.activeTopic.id;

  const res = await PostData(
    "/section",
    {
      topic_id: tid,
      title: "New Section",
      order_index: (DB.sections[tid] || []).length,
    },
    true,
  );

  if (handleApiError(res)) return;

  const newSec = res.data?.data;
  if (!newSec || typeof newSec.section_id === "undefined") {
    showInfoPopup(
      "Unexpected Response",
      "The section was created but the server returned an unexpected format. Please refresh.",
      "fas fa-exclamation-triangle",
    );
    return;
  }

  if (!DB.sections[tid]) DB.sections[tid] = [];
  DB.sections[tid].push(newSec);
  DB.components[newSec.section_id] = [];
  renderSections();
  triggerSave();
  setTimeout(() => {
    selectSection(newSec.section_id);
    startRename(newSec.section_id);
  }, 80);
}

async function saveRenameSection(sectionId, newTitle) {
  const tid = state.activeTopic?.id;
  if (!tid) return;
  const sec = (DB.sections[tid] || []).find((s) => s.section_id === sectionId);
  if (!sec) return;

  const previousTitle = sec.title;
  sec.title = newTitle;
  if (state.activeSection?.section_id === sectionId) {
    state.activeSection.title = newTitle;
    const el = document.getElementById("builderSectionName");
    if (el) el.textContent = newTitle;
  }

  const res = await UpdateData(
    `/sections/${sectionId}`,
    {
      title: newTitle,
      order_index: sec.order_index,
      is_locked: sec.is_locked || false,
    },
    true,
  );
  if (handleApiError(res)) {
    sec.title = previousTitle;
    if (state.activeSection?.section_id === sectionId) {
      state.activeSection.title = previousTitle;
      const el = document.getElementById("builderSectionName");
      if (el) el.textContent = previousTitle;
    }
    renderSections();
    return;
  }
  triggerSave();
}

async function saveSectionOrder(secs) {
  const results = await Promise.all(
    secs.map((s) =>
      UpdateData(
        `/sections/${s.section_id}`,
        {
          title: s.title,
          order_index: s.order_index,
          is_locked: s.is_locked || false,
        },
        true,
      ),
    ),
  );
  const failed = results.find((r) => !r.success);
  if (failed) {
    handleApiError(failed);
    return;
  }
  triggerSave();
}

async function deleteSection(id) {
  showConfirmModal(
    "Delete this section?",
    "All its components will be lost.",
    async () => {
      const res = await DeleteData(`/sections/${id}`, {}, true);
      if (handleApiError(res)) return;

      const tid = state.activeTopic.id;
      revokeSectionObjectUrls(id);
      DB.sections[tid] = (DB.sections[tid] || []).filter(
        (s) => s.section_id !== id,
      );
      delete DB.components[id];
      if (state.activeSection?.section_id === id) state.activeSection = null;
      renderSections();
      renderBuilder();
      triggerSave();
    },
  );
}

// ════════════════════════════════════════════════════════════════════════════
// API — COMPONENTS
// ════════════════════════════════════════════════════════════════════════════

async function fetchComponents(sectionId) {
  if (Array.isArray(DB.components[sectionId])) return;
  const res = await FetchData(`/sections/${sectionId}/components`, true);
  if (handleApiError(res)) return;
  DB.components[sectionId] = toArray(res.data?.data).map(normalizeComp);
}

async function createComponent() {
  if (!state.activeSection) return;
  const sid = state.activeSection.section_id;
  if (!DB.components[sid]) DB.components[sid] = [];

  DB.components[sid].forEach((c) => (c._expanded = false));

  const tempId = Date.now();
  const order = DB.components[sid].length;

  const newComp = normalizeComp({
    id: tempId,
    section_id: sid,
    format_type: "",
    title: "New Component",
    order_index: order,
    items: [{}],
    _expanded: true,
  });
  DB.components[sid].push(newComp);
  renderBuilder();
  setTimeout(() => {
    builderBody.scrollTop = builderBody.scrollHeight;
  }, 80);

  const res = await PostData(
    "/component",
    {
      section_id: sid,
      format_type: "",
      title: "New Component",
      order_index: order,
      items: [],
    },
    true,
  );
  if (handleApiError(res)) {
    DB.components[sid] = DB.components[sid].filter((c) => c.id !== tempId);
    renderBuilder();
    return;
  }

  const serverComp = res.data?.data;
  const realId = serverComp?.component_id ?? serverComp?.id;
  if (realId) {
    newComp.id = newComp.component_id = realId;
    const card = builderBody.querySelector(
      `.component-card[data-id="${tempId}"]`,
    );
    if (card) card.dataset.id = String(realId);
  }
  triggerSave();
}

const IMAGE_FIELDS = ["image", "url"];

async function saveOneComponent(comp) {
  const form = new FormData();
  form.append("title", comp.title || "");
  form.append("format_type", comp.format_type || "");
  form.append("order_index", String(comp.order_index ?? 0));

  const resolvedSectionId =
    comp.section_id ||
    comp._section_id ||
    state.activeSection?.section_id ||
    "";
  form.append("section_id", String(resolvedSectionId));

  if (comp._deletedItemIds?.length) {
    form.append("deleted_item_ids", JSON.stringify(comp._deletedItemIds));
    comp._deletedItemIds = [];
  }

  const formatFields = FORMAT_ITEM_FIELDS[comp.format_type] || [];
  const activeImageFields = IMAGE_FIELDS.filter((f) =>
    formatFields.some((fd) => fd.key === f),
  );

  const itemsForJson = (comp.items || []).map((item, idx) => {
    const {
      _localId,
      _dragOver,
      _objectUrl_image,
      _objectUrl_url,
      _clearImage_image,
      _clearImage_url,
      _hasImage_image,
      _hasImage_url,
      ...rest
    } = item;

    const jsonItem = { ...rest };
    jsonItem.order_index = idx;

    IMAGE_FIELDS.forEach((f) => {
      if (!activeImageFields.includes(f)) delete jsonItem[f];
    });
    delete jsonItem.url;

    const imageValue = activeImageFields.reduce(
      (v, f) => v ?? item[f] ?? null,
      null,
    );
    const clearFlag = activeImageFields.some((f) => item[`_clearImage_${f}`]);
    const keepFlag = activeImageFields.some((f) => item[`_hasImage_${f}`]);

    if (imageValue instanceof File) {
      const fileKey = `image_${idx}`;
      form.append(fileKey, imageValue);
      jsonItem.image = fileKey;
    } else if (clearFlag) {
      jsonItem.image = null;
    } else if (keepFlag) {
      jsonItem.image = "__keep__";
    } else if (
      typeof imageValue === "string" &&
      imageValue &&
      !imageValue.startsWith("data:")
    ) {
      jsonItem.image = imageValue;
    } else {
      jsonItem.image = null;
    }

    activeImageFields.forEach((f) => {
      delete jsonItem[`_hasImage_${f}`];
      delete jsonItem[`_clearImage_${f}`];
    });

    return jsonItem;
  });

  form.append("items", JSON.stringify(itemsForJson));

  const res = await UpdateData(`/component/${comp.id}`, form, true);
  handleApiError(res);
  return res;
}

async function deleteComponent(compId) {
  const sid = state.activeSection?.section_id;
  if (!sid) return;

  showConfirmModal(
    "Delete this component?",
    "This cannot be undone.",
    async () => {
      const res = await DeleteData(`/component/${compId}`, {}, true);
      if (handleApiError(res)) return;

      const deleted = (DB.components[sid] || []).find((c) => c.id === compId);
      if (deleted) revokeCompObjectUrls(deleted);

      DB.components[sid] = (DB.components[sid] || []).filter(
        (c) => c.id !== compId,
      );
      renderBuilder();
      triggerSave();
    },
  );
}

// ════════════════════════════════════════════════════════════════════════════
// RENDER — TOPICS TREE
// ════════════════════════════════════════════════════════════════════════════

function renderTopics() {
  topicsTree.innerHTML = DB.topics
    .map(
      (t) => `
      <div class="topic-group ${state.expandedTopics.has(t.id) ? "open" : ""}" data-id="${t.id}">
        <div class="topic-row ${state.expandedTopics.has(t.id) ? "expanded" : ""}">
          <span class="topic-chevron">&#9658;</span>
          <span class="topic-name">${t.name}</span>
        </div>
        <div class="subtopics">
          ${(t.subtopics || [])
            .map(
              (s) => `
              <div class="subtopic-row ${state.activeTopic?.id === s.id ? "active" : ""}" data-id="${s.id}">
                <span class="subtopic-dot"></span>${s.name}
              </div>`,
            )
            .join("")}
        </div>
      </div>`,
    )
    .join("");
}

// ════════════════════════════════════════════════════════════════════════════
// RENDER — SECTIONS LIST
// ════════════════════════════════════════════════════════════════════════════

function renderSections() {
  if (!state.activeTopic) return;
  const tid = state.activeTopic.id;

  const secs = (DB.sections[tid] || [])
    .slice()
    .sort((a, b) => a.order_index - b.order_index);

  document.getElementById("sectionsTopic").innerHTML =
    `<span>${state.activeTopic.name}</span>`;
  btnAddSection.style.display = "flex";

  sectionsList.innerHTML = secs
    .map(
      (sec, i) => `
      <div class="section-item ${state.activeSection?.section_id === sec.section_id ? "active" : ""}"
           data-id="${sec.section_id}" draggable="true">
        <span class="drag-handle">&#10775;</span>
        <span class="section-order-badge">${i + 1}</span>
        <span class="section-title" id="stitle-${sec.section_id}">${sec.title}</span>
        <div class="section-actions">
          <button class="section-btn btn-rename" title="Rename">&#9999;&#65039;</button>
          <button class="section-btn btn-delete" title="Delete">&#128465;&#65039;</button>
        </div>
      </div>`,
    )
    .join("");
}

// ════════════════════════════════════════════════════════════════════════════
// RENDER — BUILDER
// ════════════════════════════════════════════════════════════════════════════

function renderBuilder() {
  const header = document.getElementById("builderHeader");
  const footer = document.getElementById("builderFooter");

  if (!state.activeSection) {
    header.style.display = "none";
    footer.style.display = "none";
    builderBody.innerHTML = `
      <div class="empty-state">
        <div class="es-icon">🏗️</div>
        <h3>Section Builder</h3>
        <p>Select a section from the middle panel to start building its content.</p>
      </div>`;
    return;
  }

  header.style.display = "flex";
  footer.style.display = "block";
  document.getElementById("builderSectionName").textContent =
    state.activeSection.title;

  const sid = state.activeSection.section_id;
  const comps = (DB.components[sid] || [])
    .slice()
    .sort((a, b) => a.order_index - b.order_index);

  if (comps.length === 0) {
    builderBody.innerHTML = `
      <div class="empty-state">
        <div class="es-icon">✨</div>
        <p>No components yet.<br>Click <strong>+ Add Component</strong> below.</p>
      </div>`;
    return;
  }

  builderBody.innerHTML = `
    <div class="components-list">
      ${comps.map((c) => renderComponentCard(c)).join("")}
    </div>`;
}

// ── Component card ─────────────────────────────────────────────────────────

function renderComponentCard(comp) {
  const fmt = FORMAT_TYPES[comp.format_type] || null;

  const typeOptions = [
    `<option value="" ${!comp.format_type ? "selected" : ""} disabled>— Choose a format type —</option>`,
    ...FORMAT_GROUPS.map((g) => {
      const opts = g.types
        .map((key) => {
          const t = FORMAT_TYPES[key];
          return `<option value="${key}" ${comp.format_type === key ? "selected" : ""}>${t.icon} ${t.label}</option>`;
        })
        .join("");
      return `<optgroup label="${g.label}">${opts}</optgroup>`;
    }),
  ].join("");

  const hasType = !!comp.format_type;
  const isSingle = SINGLE_ITEM_FORMATS.has(comp.format_type);
  const fields = FORMAT_ITEM_FIELDS[comp.format_type] || [];
  if (!comp.items || !comp.items.length) comp.items = [{}];

  if (comp._activeItem === undefined || comp._activeItem >= comp.items.length) {
    comp._activeItem = 0;
  }

  let itemsSection = "";
  if (hasType) {
    if (comp.format_type === "exercise") {
      itemsSection = `
        <div class="items-section">
          <div class="exercise-block">&#9999;&#65039; Exercise — content managed externally</div>
        </div>`;
    } else if (isSingle) {
      itemsSection = `
        <div class="items-section">
          <div class="items-section-header"><span>Content</span></div>
          <div class="items-list" data-comp-id="${comp.id}">
            ${renderItemFields(comp, comp.items[0], 0, fields)}
          </div>
        </div>`;
    } else {
      const tabBar = comp.items
        .map((item, idx) => {
          const label = item.title ? escHtml(item.title) : `Item ${idx + 1}`;
          const isActive = idx === comp._activeItem;
          const removeBtn =
            isActive && comp.items.length > 1
              ? `<span class="item-tab-remove btn-remove-item"
                 data-comp-id="${comp.id}" data-item-idx="${idx}"
                 title="Remove this item">&#10005;</span>`
              : "";
          return `<button class="item-tab-btn ${isActive ? "active" : ""}"
            draggable="true"
            data-comp-id="${comp.id}"
            data-item-idx="${idx}"
            title="Drag to reorder">${label}${removeBtn}</button>`;
        })
        .join("");

      itemsSection = `
        <div class="items-section">
          <div class="item-tabs-bar">
            ${tabBar}
            <button class="btn-add-item btn-add-comp-item item-tab-add"
              data-comp-id="${comp.id}" title="Add item">&#65291;</button>
          </div>
          <div class="items-list" data-comp-id="${comp.id}">
            ${renderItemFields(comp, comp.items[comp._activeItem], comp._activeItem, fields)}
          </div>
        </div>`;
    }
  } else {
    itemsSection = `<p class="comp-hint">Choose a format type above to start adding content.</p>`;
  }

  return `
    <div class="component-card ${comp._expanded ? "expanded" : ""}" data-id="${comp.id}">
      <div class="component-header">
        <span class="comp-drag" title="Drag to reorder">&#10775;</span>
        <span class="comp-type-badge">
          ${fmt ? `${fmt.icon} ${fmt.label}` : "&#128279; New"}
        </span>
        <span class="comp-title">${escHtml(comp.title || "Untitled")}</span>
        <div class="comp-actions">
          ${hasType ? `<button class="comp-btn btn-comp-preview" data-id="${comp.id}" title="Preview">&#128065;</button>` : ""}
          <button class="comp-btn comp-btn-delete" data-id="${comp.id}" title="Delete">&#128465;</button>
        </div>
        <span class="comp-chevron">&#9662;</span>
      </div>

      <div class="component-body">
        <div class="comp-form-group">
          <label>Component Title</label>
          <input class="comp-input" data-field="title"
            value="${escHtml(comp.title || "")}" placeholder="Component title...">
        </div>

        <div class="comp-form-group">
          <label>Format Type</label>
          <select class="comp-select comp-type-select" data-comp-id="${comp.id}">
            ${typeOptions}
          </select>
        </div>

        ${itemsSection}

        ${
          hasType && comp.format_type !== "exercise"
            ? `
        <div class="comp-save-row">
          <button class="btn-save-comp ${comp._dirty ? "dirty" : ""}" data-id="${comp.id}">
            ${comp._dirty ? "&#128190; Save Changes" : "&#10003; Saved"}
          </button>
        </div>`
            : ""
        }
      </div>
    </div>`;
}

// ── Item fields ────────────────────────────────────────────────────────────

function renderItemFields(comp, item, idx, fields) {
  if (!item) return "";
  return fields
    .map((f) => {
      if (f.tag === "file") {
        const rawVal = item[f.key];
        const hasExisting = item[`_hasImage_${f.key}`];
        const isCleared = item[`_clearImage_${f.key}`];

        let previewSrc = "";
        if (rawVal instanceof File) {
          previewSrc = item[`_objectUrl_${f.key}`] || "";
        } else if (typeof rawVal === "string" && rawVal) {
          previewSrc = rawVal;
        }

        const showThumb = (previewSrc || hasExisting) && !isCleared;
        const thumbContent = showThumb
          ? previewSrc
            ? `<img src="${escHtml(previewSrc)}" alt="preview">`
            : `<div class="image-stored-indicator">&#128247; Image stored on server</div>`
          : "";
        const removeImageBtn = showThumb
          ? `<button class="btn-remove-image" type="button"
               data-comp-id="${comp.id}" data-item-idx="${idx}" data-field="${f.key}"
               title="Remove image">&#10005; Remove image</button>`
          : "";

        return `
          <div class="item-field-group">
            <label class="item-field-label">${f.label}</label>
            <input type="file" class="item-file-input" accept="image/*"
              data-comp-id="${comp.id}" data-item-idx="${idx}" data-field="${f.key}">
            <div class="image-preview-thumb ${showThumb ? "show" : ""}">
              ${thumbContent}
            </div>
            ${removeImageBtn}
          </div>`;
      }

      const val = escHtml(item[f.key] || "");
      if (f.tag === "textarea") {
        return `
          <div class="item-field-group">
            <label class="item-field-label">${f.label}</label>
            <textarea class="item-textarea item-input" rows="3"
              data-comp-id="${comp.id}" data-item-idx="${idx}" data-field="${f.key}"
              placeholder="${f.placeholder || ""}">${val}</textarea>
          </div>`;
      }
      return `
        <div class="item-field-group">
          <label class="item-field-label">${f.label}</label>
          <input type="text" class="item-input" value="${val}"
            data-comp-id="${comp.id}" data-item-idx="${idx}" data-field="${f.key}"
            placeholder="${f.placeholder || ""}">
        </div>`;
    })
    .join("");
}

// ════════════════════════════════════════════════════════════════════════════
// CLICK HANDLERS
// ════════════════════════════════════════════════════════════════════════════

async function handleTopicClick(e) {
  const topicRow = e.target.closest(".topic-row");
  const subtopicRow = e.target.closest(".subtopic-row");

  if (topicRow) {
    const id = parseInt(topicRow.closest(".topic-group").dataset.id);
    state.expandedTopics.has(id)
      ? state.expandedTopics.delete(id)
      : state.expandedTopics.add(id);
    renderTopics();
  } else if (subtopicRow) {
    const id = parseInt(subtopicRow.dataset.id);
    state.activeTopic = DB.topics
      .flatMap((t) => t.subtopics || [])
      .find((s) => s.id === id);
    state.activeSection = null;
    renderTopics();
    await fetchSections(id);
    renderSections();
    renderBuilder();
    updateBreadcrumb(subtopicRow.textContent.trim(), null);
  }
}

function handleSectionClick(e) {
  const item = e.target.closest(".section-item");
  if (!item) return;
  const id = parseInt(item.dataset.id);
  if (e.target.closest(".btn-rename")) startRename(id);
  else if (e.target.closest(".btn-delete")) deleteSection(id);
  else selectSection(id);
}

function handleSectionDblClick(e) {
  const el = e.target.closest(".section-title");
  if (el) startRename(parseInt(el.closest(".section-item").dataset.id));
}

async function selectSection(id) {
  const tid = state.activeTopic?.id;
  if (!tid) return;
  state.activeSection = (DB.sections[tid] || []).find(
    (s) => s.section_id === id,
  );
  if (!state.activeSection) return;
  await fetchComponents(id);
  renderSections();
  renderBuilder();
  updateBreadcrumb(null, state.activeSection.title);
}

function startRename(id) {
  const span = document.getElementById(`stitle-${id}`);
  if (!span) return;

  const originalTitle = span.textContent;
  const input = document.createElement("input");
  input.className = "section-title-input";
  input.value = originalTitle;
  span.replaceWith(input);
  input.focus();
  input.select();

  let committed = false;

  const cancel = () => {
    if (committed) return;
    committed = true;
    const titleSpan = document.createElement("span");
    titleSpan.className = "section-title";
    titleSpan.id = `stitle-${id}`;
    titleSpan.textContent = originalTitle;
    input.replaceWith(titleSpan);
  };

  const commit = () => {
    if (committed) return;
    committed = true;
    const val = input.value.trim() || "Untitled Section";
    saveRenameSection(id, val);
    renderSections();
  };

  const onVisibilityChange = () => {
    if (document.hidden) cancel();
  };
  const onWindowBlur = () => cancel();

  document.addEventListener("visibilitychange", onVisibilityChange, {
    once: true,
  });
  window.addEventListener("blur", onWindowBlur, { once: true });

  input.addEventListener("blur", () => {
    document.removeEventListener("visibilitychange", onVisibilityChange);
    window.removeEventListener("blur", onWindowBlur);
    if (!committed) commit();
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onWindowBlur);
      commit();
      input.blur();
    }
    if (e.key === "Escape") {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onWindowBlur);
      cancel();
      input.blur();
    }
  });
}

function markDirty(comp, card) {
  comp._dirty = true;
  const btn = card?.querySelector(".btn-save-comp");
  if (btn) {
    btn.classList.add("dirty");
    btn.innerHTML = "&#128190; Save Changes";
  }
}

function markClean(comp, card) {
  comp._dirty = false;
  const btn = card?.querySelector(".btn-save-comp");
  if (btn) {
    btn.classList.remove("dirty");
    btn.innerHTML = "&#10003; Saved";
  }
}

function handleBuilderClick(e) {
  const sid = state.activeSection?.section_id;
  if (!sid) return;
  const comps = DB.components[sid] || [];

  // Remove image
  const removeImageBtn = e.target.closest(".btn-remove-image");
  if (removeImageBtn) {
    e.stopPropagation();
    const { compId, itemIdx, field } = removeImageBtn.dataset;
    const comp = comps.find((c) => c.id === parseInt(compId));
    if (!comp) return;
    const idx = parseInt(itemIdx);
    if (!comp.items[idx]) return;
    revokeItemObjectUrls(comp.items[idx]);
    comp.items[idx][field] = null;
    comp.items[idx][`_hasImage_${field}`] = false;
    comp.items[idx][`_clearImage_${field}`] = true;
    markDirty(comp, e.target.closest(".component-card"));
    renderBuilder();
    return;
  }

  // Save Changes
  const saveBtn = e.target.closest(".btn-save-comp");
  if (saveBtn) {
    e.stopPropagation();
    const comp = comps.find((c) => c.id === parseInt(saveBtn.dataset.id));
    if (!comp) return;
    const card = saveBtn.closest(".component-card");
    saveBtn.disabled = true;
    saveBtn.innerHTML = "&#8987; Saving...";

    const { _expanded, _activeItem, _dirty, ...compToSave } = comp;
    saveOneComponent(compToSave)
      .then((res) => {
        if (res?.success) markClean(comp, card);
        triggerSave();
      })
      .catch((err) => {
        console.error("[Save Changes]", err);
        saveBtn.innerHTML = "&#9888; Retry Save";
        saveBtn.classList.add("dirty");
      })
      .finally(() => {
        saveBtn.disabled = false;
      });
    return;
  }

  // Remove item tab
  const removeItemBtn = e.target.closest(".btn-remove-item");
  if (removeItemBtn) {
    e.stopPropagation();
    const comp = comps.find(
      (c) => c.id === parseInt(removeItemBtn.dataset.compId),
    );
    if (comp && comp.items.length > 1) {
      const idx = parseInt(removeItemBtn.dataset.itemIdx);
      const removedItem = comp.items[idx];
      revokeItemObjectUrls(removedItem);
      if (removedItem?.item_id) {
        if (!comp._deletedItemIds) comp._deletedItemIds = [];
        comp._deletedItemIds.push(removedItem.item_id);
      }
      comp.items.splice(idx, 1);
      if (comp._activeItem >= comp.items.length)
        comp._activeItem = comp.items.length - 1;
      comp._dirty = true;
      renderBuilder();
    }
    return;
  }

  // Select item tab
  const tabBtn = e.target.closest(".item-tab-btn");
  if (tabBtn && !e.target.closest(".btn-remove-item")) {
    e.stopPropagation();
    const comp = comps.find((c) => c.id === parseInt(tabBtn.dataset.compId));
    if (comp) {
      comp._activeItem = parseInt(tabBtn.dataset.itemIdx);
      renderBuilder();
    }
    return;
  }

  // Add new item
  const addItemBtn = e.target.closest(".btn-add-comp-item");
  if (addItemBtn) {
    e.stopPropagation();
    const comp = comps.find(
      (c) => c.id === parseInt(addItemBtn.dataset.compId),
    );
    if (comp) {
      comp.items.push({ _localId: Date.now() });
      comp._activeItem = comp.items.length - 1;
      renderBuilder();
    }
    return;
  }

  // Delete component
  const delBtn = e.target.closest(".comp-btn-delete");
  if (delBtn) {
    e.stopPropagation();
    deleteComponent(parseInt(delBtn.dataset.id));
    return;
  }

  // Preview component
  const previewBtn = e.target.closest(".btn-comp-preview");
  if (previewBtn) {
    e.stopPropagation();
    const comp = comps.find((c) => c.id === parseInt(previewBtn.dataset.id));
    if (comp) openPreviewModal(comp);
    return;
  }

  // Toggle expand/collapse
  const header = e.target.closest(".component-header");
  if (header && !e.target.closest(".comp-btn")) {
    const comp = comps.find(
      (c) => c.id === parseInt(header.closest(".component-card").dataset.id),
    );
    if (comp) {
      comp._expanded = !comp._expanded;
      renderBuilder();
    }
  }
}

function handleBuilderInput(e) {
  const card = e.target.closest(".component-card");
  if (!card) return;
  const sid = state.activeSection?.section_id;
  const comp = (DB.components[sid] || []).find(
    (c) => c.id === parseInt(card.dataset.id),
  );
  if (!comp) return;

  if (
    e.target.classList.contains("comp-input") &&
    e.target.dataset.field === "title"
  ) {
    comp.title = e.target.value;
    const el = card.querySelector(".comp-title");
    if (el) el.textContent = comp.title || "Untitled";
    markDirty(comp, card);
    return;
  }

  const { itemIdx, field } = e.target.dataset;
  if (itemIdx !== undefined && field) {
    const idx = parseInt(itemIdx);
    if (!comp.items[idx]) comp.items[idx] = { _localId: Date.now() };
    comp.items[idx][field] = e.target.value;
    if (field === "title") {
      const tabBtn = card.querySelector(
        `.item-tab-btn[data-item-idx="${idx}"]`,
      );
      if (tabBtn)
        tabBtn.childNodes[0].textContent = e.target.value || `Item ${idx + 1}`;
    }
    markDirty(comp, card);
  }
}

function handleBuilderChange(e) {
  const sid = state.activeSection?.section_id;
  if (!sid) return;

  // Format type selector
  if (e.target.classList.contains("comp-type-select")) {
    const card = e.target.closest(".component-card");
    const cardId = card
      ? parseInt(card.dataset.id)
      : parseInt(e.target.dataset.compId);
    const comp = (DB.components[sid] || []).find((c) => c.id === cardId);
    if (!comp) return;

    const hasContent = (comp.items || []).some(
      (item) =>
        (item.title && item.title.trim()) ||
        (item.content && item.content.trim()) ||
        item.image instanceof File ||
        item.url instanceof File ||
        item._hasImage_image ||
        item._hasImage_url,
    );

    const applyFormatChange = () => {
      revokeCompObjectUrls(comp);
      comp.format_type = e.target.value;
      comp.type = e.target.value;
      comp.items = [{ _localId: Date.now() }];
      comp._activeItem = 0;
      comp._dirty = false;
      comp._expanded = true;
      renderBuilder();

      const { _expanded, _activeItem, _dirty, ...compToSave } = comp;
      saveOneComponent(compToSave)
        .then((res) => {
          if (res?.success) triggerSave();
        })
        .catch((err) => console.error("[format_type save]", err));
    };

    if (hasContent) {
      const intendedType = e.target.value;
      e.target.value = comp.format_type;

      showConfirmModal(
        "Change Format Type?",
        "Changing the format type will erase all existing content in this component. This cannot be undone.",
        () => {
          comp.format_type = intendedType;
          e.target.value = intendedType;
          applyFormatChange();
        },
      );
    } else {
      applyFormatChange();
    }
    return;
  }

  // File input
  if (e.target.classList.contains("item-file-input")) {
    const { compId, itemIdx, field } = e.target.dataset;
    const comp = (DB.components[sid] || []).find(
      (c) => c.id === parseInt(compId),
    );
    if (!comp || !e.target.files[0]) return;

    const file = e.target.files[0];
    const idx = parseInt(itemIdx);
    if (!comp.items[idx]) comp.items[idx] = { _localId: Date.now() };

    if (comp.items[idx][`_objectUrl_${field}`]) {
      URL.revokeObjectURL(comp.items[idx][`_objectUrl_${field}`]);
    }

    comp.items[idx][field] = file;
    comp.items[idx][`_hasImage_${field}`] = false;
    comp.items[idx][`_clearImage_${field}`] = false;
    comp.items[idx][`_objectUrl_${field}`] = URL.createObjectURL(file);

    const thumb = e.target
      .closest(".item-field-group")
      ?.querySelector(".image-preview-thumb");
    if (thumb) {
      thumb.innerHTML = `<img src="${comp.items[idx][`_objectUrl_${field}`]}" alt="preview">`;
      thumb.classList.add("show");
    }

    markDirty(comp, e.target.closest(".component-card"));
  }
}

// ════════════════════════════════════════════════════════════════════════════
// DRAG & DROP — COMPONENTS
// ════════════════════════════════════════════════════════════════════════════

let _dragTabCompId = null;
let _dragTabFromIdx = null;

function onDragStart(e) {
  const tab = e.target.closest(".item-tab-btn");
  if (tab) {
    e.stopPropagation();
    _dragTabCompId = parseInt(tab.dataset.compId);
    _dragTabFromIdx = parseInt(tab.dataset.itemIdx);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "tab");
    tab.classList.add("tab-dragging");
    return;
  }

  const card = e.target.closest(".component-card");
  if (card) {
    dragCompId = parseInt(card.dataset.id);
    card.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
  }
}

function onDragEnd(e) {
  if (_dragTabCompId !== null) {
    builderBody
      .querySelectorAll(
        ".item-tab-btn.tab-dragging, .item-tab-btn.tab-drop-target",
      )
      .forEach((t) => {
        t.classList.remove("tab-dragging", "tab-drop-target");
      });
    _dragTabCompId = null;
    _dragTabFromIdx = null;
    return;
  }

  const card = e.target.closest(".component-card");
  if (card) card.classList.remove("dragging");
  builderBody
    .querySelectorAll(".component-card.drag-over")
    .forEach((el) => el.classList.remove("drag-over"));
  dragCompId = null;
}

function onDragOver(e) {
  if (_dragTabCompId !== null) {
    const tab = e.target.closest(".item-tab-btn");
    if (!tab) return;
    if (parseInt(tab.dataset.compId) !== _dragTabCompId) return;
    if (parseInt(tab.dataset.itemIdx) === _dragTabFromIdx) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    builderBody
      .querySelectorAll(".item-tab-btn.tab-drop-target")
      .forEach((t) => t.classList.remove("tab-drop-target"));
    tab.classList.add("tab-drop-target");
    return;
  }

  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  const card = e.target.closest(".component-card");
  if (card && parseInt(card.dataset.id) !== dragCompId) {
    builderBody
      .querySelectorAll(".component-card.drag-over")
      .forEach((el) => el.classList.remove("drag-over"));
    card.classList.add("drag-over");
  }
}

function onDragLeave(e) {
  if (_dragTabCompId !== null) {
    const tab = e.target.closest(".item-tab-btn");
    if (tab) tab.classList.remove("tab-drop-target");
  }
}

function onDrop(e) {
  if (_dragTabCompId !== null) {
    const tab = e.target.closest(".item-tab-btn");
    if (!tab) return;
    const toIdx = parseInt(tab.dataset.itemIdx);
    const compId = parseInt(tab.dataset.compId);
    if (compId !== _dragTabCompId) return;
    if (toIdx === _dragTabFromIdx) return;
    e.preventDefault();
    e.stopPropagation();

    const sid = state.activeSection?.section_id;
    const comp = (DB.components[sid] || []).find((c) => c.id === compId);
    if (!comp) return;

    const [moved] = comp.items.splice(_dragTabFromIdx, 1);
    comp.items.splice(toIdx, 0, moved);
    comp.items.forEach((item, i) => {
      item.order_index = i;
    });
    comp._activeItem = toIdx;

    markDirty(
      comp,
      builderBody.querySelector(`.component-card[data-id="${compId}"]`),
    );
    renderBuilder();
    return;
  }

  e.preventDefault();
  const target = e.target.closest(".component-card");
  if (!target || !dragCompId) return;
  const targetId = parseInt(target.dataset.id);
  if (targetId === dragCompId) return;

  const sid = state.activeSection?.section_id;
  if (!sid) return;
  const comps = DB.components[sid] || [];
  const from = comps.findIndex((c) => c.id === dragCompId);
  const to = comps.findIndex((c) => c.id === targetId);
  if (from === -1 || to === -1) return;

  comps.splice(to, 0, comps.splice(from, 1)[0]);
  comps.forEach((c, i) => (c.order_index = i));
  dragCompId = null;
  renderBuilder();

  (async () => {
    for (const c of comps.filter((c) => c.format_type)) {
      const orderPayload = {
        title: c.title || "",
        format_type: c.format_type || "",
        order_index: c.order_index,
        section_id: String(
          c.section_id ||
            c._section_id ||
            state.activeSection?.section_id ||
            "",
        ),
        items: JSON.stringify([]),
      };
      try {
        const res = await UpdateData(`/component/${c.id}`, orderPayload, true);
        if (handleApiError(res)) break;
      } catch (err) {
        console.error("[reorder save]", err);
        break;
      }
    }
  })();
}

// ════════════════════════════════════════════════════════════════════════════
// DRAG & DROP — SECTIONS
// ════════════════════════════════════════════════════════════════════════════

async function onSectionDrop(e) {
  e.preventDefault();
  const target = e.target.closest(".section-item");
  if (!target || !dragSecId) return;
  const targetId = parseInt(target.dataset.id);
  if (targetId === dragSecId) return;

  const tid = state.activeTopic.id;
  const secs = DB.sections[tid] || [];
  const from = secs.findIndex((s) => s.section_id === dragSecId);
  const to = secs.findIndex((s) => s.section_id === targetId);
  if (from === -1 || to === -1) return;

  secs.splice(to, 0, secs.splice(from, 1)[0]);
  secs.forEach((s, i) => (s.order_index = i));
  renderSections();
  await saveSectionOrder(secs);
}

// ════════════════════════════════════════════════════════════════════════════
// PREVIEW MODAL
// ════════════════════════════════════════════════════════════════════════════

async function openPreviewModal(comp) {
  let modal = document.getElementById("compPreviewModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "compPreviewModal";
    modal.className = "modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `
      <div class="modal-box" id="compPreviewBox">
        <div class="modal-head">
          <h3>Preview</h3>
          <button class="modal-close" id="compPreviewClose" aria-label="Close">&#215;</button>
        </div>
        <div class="modal-body" id="compPreviewBody"></div>
      </div>`;
    document.body.appendChild(modal);

    document
      .getElementById("compPreviewClose")
      .addEventListener("click", () => modal.classList.remove("active"));
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("active");
    });
  }

  const body = document.getElementById("compPreviewBody");
  body.innerHTML = `<p class="preview-loading">&#128247; Loading preview...</p>`;
  modal.classList.add("active");

  const res = await FetchData(`/component/${comp.id}`, true);
  if (handleApiError(res)) {
    modal.classList.remove("active");
    return;
  }

  const freshComp = normalizeComp(res.data.data);
  const items = (freshComp.items || []).filter(
    (i) => i.title || i.content || i.url || i.image,
  );

  if (!items.length) {
    body.innerHTML = `<p class="preview-empty">No content to preview yet — save your changes first.</p>`;
    return;
  }

  body.innerHTML = buildPreviewHtml(freshComp.format_type, items);

  // Wire up interactive previews
  body.querySelectorAll(".preview-fp").forEach((card) => {
    card.addEventListener("click", () => card.classList.toggle("flipped"));
  });
  body.querySelectorAll("[data-acc-header]").forEach((h) => {
    h.addEventListener("click", () => {
      const bodyEl = body.querySelector(
        `[data-acc-body="${h.dataset.accHeader}"]`,
      );
      if (bodyEl) bodyEl.classList.toggle("open");
    });
  });
  body.querySelectorAll("[data-tab-btn]").forEach((btn) => {
    btn.addEventListener("click", () => {
      body
        .querySelectorAll("[data-tab-body]")
        .forEach((b) => b.classList.remove("active"));
      body
        .querySelectorAll("[data-tab-btn]")
        .forEach((b) => b.classList.remove("active"));
      body
        .querySelector(`[data-tab-body="${btn.dataset.tabBtn}"]`)
        ?.classList.add("active");
      btn.classList.add("active");
    });
  });
}

// buildPreviewHtml — uses CSS classes only, no inline styles
function buildPreviewHtml(type, items) {
  const esc = (s) =>
    String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  switch (type) {
    case "flipcards":
      return `<div class="preview-flipcards-grid">${items
        .map(
          (it) => `
        <div class="preview-fp">
          <div class="preview-fpi">
            <div class="preview-fpf">
              ${it.image ? `<img src="${esc(it.image)}" alt="${esc(it.title)}">` : `<span class="preview-fp-placeholder">🃏</span>`}
              <strong>${esc(it.title)}</strong>
              <small class="preview-fp-hint">Click to flip</small>
            </div>
            <div class="preview-fpb">
              <strong>${esc(it.title)}</strong>
              <p>${esc(it.content)}</p>
            </div>
          </div>
        </div>`,
        )
        .join("")}</div>`;

    case "accordion":
      return `<div class="preview-accordion">${items
        .map(
          (it, i) => `
        <div class="preview-acc-item">
          <div class="preview-acc-header" data-acc-header="${i}">${i + 1}. ${esc(it.title)}</div>
          <div class="preview-acc-body ${i === 0 ? "open" : ""}" data-acc-body="${i}">
            <p>${esc(it.content)}</p>
            ${it.image ? `<img src="${esc(it.image)}" alt="${esc(it.title)}">` : ""}
          </div>
        </div>`,
        )
        .join("")}</div>`;

    case "tabs":
      return `<div class="preview-tabs">
        <div class="preview-tab-bar">${items
          .map(
            (it, i) => `
          <button class="preview-tab-btn ${i === 0 ? "active" : ""}" data-tab-btn="${i}">${esc(it.title)}</button>`,
          )
          .join("")}
        </div>
        ${items
          .map(
            (it, i) => `
          <div class="preview-tab-body ${i === 0 ? "active" : ""}" data-tab-body="${i}">
            <h3>${esc(it.title)}</h3>
            <p>${esc(it.content)}</p>
            ${it.image ? `<img src="${esc(it.image)}" alt="${esc(it.title)}">` : ""}
          </div>`,
          )
          .join("")}
        </div>`;

    case "timeline":
      return `<div class="preview-timeline">${items
        .map(
          (it, i) => `
        <div class="preview-timeline-item">
          <div class="preview-timeline-num">${i + 1}</div>
          <div class="preview-timeline-content">
            <h4>${esc(it.title)}</h4>
            <p>${esc(it.content)}</p>
            ${it.image ? `<img src="${esc(it.image)}" alt="${esc(it.title)}">` : ""}
          </div>
        </div>`,
        )
        .join("")}</div>`;

    case "image_right":
    case "image_left": {
      const it = items[0];
      const txt = `<div class="preview-img-text"><h2>${esc(it.title)}</h2><p>${esc(it.content)}</p></div>`;
      const img = it.image
        ? `<img src="${esc(it.image)}" class="preview-img-photo" alt="${esc(it.title)}">`
        : `<div class="preview-img-placeholder"></div>`;
      return `<div class="preview-img-layout ${type === "image_right" ? "preview-img-right" : "preview-img-left"}">${type === "image_right" ? txt + img : img + txt}</div>`;
    }

    case "image_overlay": {
      const it = items[0];
      return `<div class="preview-overlay">
        ${it.image ? `<img src="${esc(it.image)}" alt="${esc(it.title)}" class="preview-overlay-img">` : `<div class="preview-overlay-bg"></div>`}
        <div class="preview-overlay-content">
          <h2>${esc(it.title)}</h2>
          <p>${esc(it.content)}</p>
        </div>
      </div>`;
    }

    case "imageblock": {
      const it = items[0];
      return `<div class="preview-imageblock">
        ${it.url ? `<img src="${esc(it.url)}" alt="${esc(it.caption || "")}">` : `<div class="preview-imageblock-ph">No image</div>`}
        ${it.caption ? `<p class="preview-imageblock-caption">${esc(it.caption)}</p>` : ""}
      </div>`;
    }

    case "exercise":
      return `<div class="preview-exercise"><p>&#9999;&#65039; Exercise Component</p></div>`;

    default:
      return `<p class="preview-empty">No preview available.</p>`;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// CONFIRM MODAL
// ════════════════════════════════════════════════════════════════════════════

function showConfirmModal(title, message, onConfirm) {
  document.getElementById("modalConfirm")?.classList.remove("active");

  document.getElementById("confirmTitle").textContent = title;
  document.getElementById("confirmMsg").textContent = message;
  document.getElementById("modalConfirm").classList.add("active");

  const old = document.getElementById("confirmBtn");
  const btn = old.cloneNode(true);
  old.parentNode.replaceChild(btn, old);
  btn.addEventListener("click", () => {
    closeModal("modalConfirm");
    onConfirm();
  });
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("active");
}

// ════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ════════════════════════════════════════════════════════════════════════════

function normalizeComp(c) {
  const id =
    c.component_id != null ? c.component_id : c.id != null ? c.id : Date.now();
  const ft =
    c.format_type != null
      ? c.format_type
      : c.component_type != null
        ? c.component_type
        : c.type != null
          ? c.type
          : "";

  return Object.assign({}, c, {
    id,
    component_id: id,
    section_id: c.section_id ?? c._section_id ?? null,
    format_type: ft,
    type: ft,
    title: c.title || "",
    order_index: c.order_index != null ? c.order_index : 0,
    items:
      Array.isArray(c.items) && c.items.length
        ? c.items
            .slice()
            .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
            .map((it, i) => {
              const item = {
                _localId:
                  it._localId || it.item_id || Date.now() + Math.random(),
                order_index: it.order_index ?? i,
                ...it,
              };
              IMAGE_FIELDS.forEach((field) => {
                if (it.image_data && it.mimetype) {
                  item[field] = `data:${it.mimetype};base64,${it.image_data}`;
                  item[`_hasImage_${field}`] = true;
                } else if (
                  it[`has_${field}`] ||
                  (typeof it[field] === "string" && it[field])
                ) {
                  item[`_hasImage_${field}`] = true;
                }
              });
              delete item.image_data;
              delete item.mimetype;
              return item;
            })
        : [{ _localId: Date.now(), order_index: 0 }],
    _expanded: c._expanded != null ? c._expanded : false,
  });
}

const ENVELOPE_KEYS = [
  "sections",
  "components",
  "topics",
  "data",
  "items",
  "results",
];

function toArray(value) {
  if (Array.isArray(value)) return value.slice();
  if (value == null) return [];

  if (typeof value === "object") {
    for (const key of ENVELOPE_KEYS) {
      if (Array.isArray(value[key])) return value[key].slice();
    }
  }

  console.warn("[toArray] Could not extract array from response:", value);
  return [];
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function triggerSave() {
  const el = document.getElementById("saveIndicator");
  if (!el) return;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2000);
}

function updateBreadcrumb(sub, sec) {
  const bc = document.getElementById("headerBreadcrumb");
  if (!bc) return;
  if (sub !== null) bc.dataset.sub = sub;
  const s = bc.dataset.sub || "";
  bc.innerHTML = `<span>${s}</span>${sec ? `<span class="sep">&#8250;</span><span>${sec}</span>` : ""}`;
}