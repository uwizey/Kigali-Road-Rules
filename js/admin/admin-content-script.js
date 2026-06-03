// ════════════════════════════════════════════════════════════════════════════
// IMPORTS
// ════════════════════════════════════════════════════════════════════════════
import { FetchData, PostData, DeleteData, UpdateData } from "../api/crud.js";

// ════════════════════════════════════════════════════════════════════════════
// POPUP / MODAL ENGINE
// ════════════════════════════════════════════════════════════════════════════

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
  const existing = document.getElementById("progressWarningOverlay");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "progressWarningOverlay";
  overlay.innerHTML = `
    <div id="progressWarningBox">
      <div class="pw-icon" style="color:${iconColor}">
        <i class="${icon}"></i>
      </div>
      <h3>${title}</h3>
      <div class="pw-message-content">${message}</div>
      <div class="pw-actions">
        ${showCancel ? `<button class="pw-btn pw-btn-cancel" style="${cancelBtnStyle}">${cancelText}</button>` : ""}
        ${showConfirm ? `<button class="pw-btn pw-btn-confirm" style="${confirmBtnStyle}">${confirmText}</button>` : ""}
      </div>
    </div>`;
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
    cancelBtnStyle: `background:${iconColor};color:#fff;border:none;`,
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
  let color = "#e74c3c";

  if (!res.status) {
    title = "Network Issue";
    icon = "fas fa-wifi";
    color = "#95a5a6";
  } else if (res.status === 401) {
    return true;
  } else if (res.status === 403) {
    title = "Access Restricted";
    icon = "fas fa-lock";
    color = "#f39c12";
  } else if (res.status >= 500) {
    title = "Server Error";
    icon = "fas fa-server";
    color = "#c0392b";
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
  topics: [], // Topic[]
  sections: {}, // { [subtopicId]: Section[] }
  components: {}, // { [sectionId]: Component[] }
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

document.addEventListener("DOMContentLoaded", () => {
  fetchTopics();
  bindEvents();
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
    item.style.opacity = "0.4";
  });
  sectionsList.addEventListener("dragover", (e) => e.preventDefault());
  sectionsList.addEventListener("drop", onSectionDrop);
  sectionsList.addEventListener("dragend", (e) => {
    const item = e.target.closest(".section-item");
    if (item) item.style.opacity = "1";
  });
  btnAddSection.addEventListener("click", createSection);

  // Right panel — builder
  builderBody.addEventListener("click", handleBuilderClick);
  builderBody.addEventListener("input", handleBuilderInput);
  builderBody.addEventListener("change", handleBuilderChange);

  // Component card drag-drop — only start when handle is held
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

  // Component drag-drop listeners
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
// Centralised so every revocation path goes through one function.
// ════════════════════════════════════════════════════════════════════════════

/**
 * Revoke all blob URLs stored on a single item object.
 */
function revokeItemObjectUrls(item) {
  if (!item) return;
  Object.keys(item).forEach((k) => {
    if (k.startsWith("_objectUrl_") && item[k]) {
      URL.revokeObjectURL(item[k]);
      item[k] = null;
    }
  });
}

/**
 * Revoke all blob URLs for every item in a component.
 */
function revokeCompObjectUrls(comp) {
  if (!comp || !Array.isArray(comp.items)) return;
  comp.items.forEach(revokeItemObjectUrls);
}

/**
 * Revoke all blob URLs for every component in a section.
 */
function revokeSectionObjectUrls(sectionId) {
  (DB.components[sectionId] || []).forEach(revokeCompObjectUrls);
}

// ════════════════════════════════════════════════════════════════════════════
// API — TOPICS  GET /topic
// ════════════════════════════════════════════════════════════════════════════

async function fetchTopics() {
  const res = await FetchData("/topic", true);
  if (handleApiError(res)) {
    // FIX #9: Render empty state so the panel isn't left blank with no feedback.
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

// GET /sections/:subtopicId  — cached after first successful load
async function fetchSections(subtopicId) {
  // FIX #4: Only skip the fetch if the cache key holds a real array that came
  // from a *successful* response.  We no longer populate the cache on error,
  // so a failed request leaves the key undefined and the next call retries.
  if (Array.isArray(DB.sections[subtopicId])) return;

  const res = await FetchData(`/sections/${subtopicId}`, true);
  if (handleApiError(res)) {
    // Do NOT set DB.sections[subtopicId] — leave it undefined so the user
    // can retry by clicking the subtopic again.
    return;
  }
  DB.sections[subtopicId] = toArray(res.data?.data);
}

// POST /section
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

  // FIX #1: Guard against a missing / malformed response body before touching
  // DB or DOM.  Also use optional-chaining throughout to avoid TypeErrors if
  // the shape is unexpected.
  const newSec = res.data?.data;
  if (!newSec || typeof newSec.section_id === "undefined") {
    showInfoPopup(
      "Unexpected Response",
      "The section was created but the server returned an unexpected format. Please refresh.",
      "fas fa-exclamation-triangle",
      "#f39c12",
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

// PUT /sections/:sectionId — optimistic rename
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
    // Roll back the optimistic title change.
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

// PUT /sections/:sectionId — re-sync order after drag-drop
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

// DELETE /sections/:sectionId
async function deleteSection(id) {
  showConfirmModal(
    "Delete this section?",
    "All its components will be lost.",
    async () => {
      const res = await DeleteData(`/sections/${id}`, {}, true);
      if (handleApiError(res)) return;

      const tid = state.activeTopic.id;
      // Revoke any blob URLs before wiping the component cache.
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

// GET /sections/:sectionId/components — cached after first successful load
async function fetchComponents(sectionId) {
  // FIX #4: Same as fetchSections — only skip if we have a real successful
  // result; a previous error leaves the key undefined so the user can retry.
  if (Array.isArray(DB.components[sectionId])) return;

  const res = await FetchData(`/sections/${sectionId}/components`, true);
  console.log(`Components API response for section ${sectionId}:`, res);
  if (handleApiError(res)) {
    // Do NOT cache an empty array here — leave undefined so retries work.
    return;
  }
  DB.components[sectionId] = toArray(res.data?.data).map(normalizeComp);
}

// POST /component
async function createComponent() {
  if (!state.activeSection) return;
  const sid = state.activeSection.section_id;
  if (!DB.components[sid]) DB.components[sid] = [];

  // Collapse all existing cards so the new one has focus.
  DB.components[sid].forEach((c) => (c._expanded = false));

  const tempId = Date.now();
  const order = DB.components[sid].length;

  // Optimistic local insert — card appears instantly.
  const newComp = normalizeComp({
    id: tempId,
    // FIX #8: Store section_id on the optimistic object so it is available
    // when saveOneComponent is called later (e.g. from onCompDrop).
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

  // Background POST — swap temp id for the real server id.
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
  console.log("Create Component API response:", res); 
  // FIX #2: Roll back the optimistic insert on failure.
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

// PUT /component/:componentId
//
// FormData structure:
//   title, format_type, order_index, section_id  — strings
//   items       — JSON string; image fields set to "image_N" key or null/"__keep__"
//   image_N     — raw File binary for items[N]
//   deleted_item_ids — JSON string of item IDs to delete (optional)

const IMAGE_FIELDS = ["image", "url"];

async function saveOneComponent(comp) {
  const form = new FormData();
  form.append("title", comp.title || "");
  form.append("format_type", comp.format_type || "");
  form.append("order_index", String(comp.order_index ?? 0));

  // FIX #8: Resolve section_id reliably.  The server shape from createComponent
  // may not include it, so we fall back to state.activeSection.
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
    // Strip internal-only keys and keep all field values
    const { _localId, _dragOver, _objectUrl_image, _objectUrl_url, _clearImage_image, _clearImage_url, _hasImage_image, _hasImage_url, ...rest } = item;

    // Create jsonItem with all remaining field values
    const jsonItem = { ...rest };

    jsonItem.order_index = idx;

    // Remove image fields that don't belong to this format type.
    IMAGE_FIELDS.forEach((f) => {
      if (!activeImageFields.includes(f)) delete jsonItem[f];
    });
    delete jsonItem.url; // backend always uses "image" key

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
  console.log("Saving component with items:", itemsForJson);

  const res = await UpdateData(`/component/${comp.id}`, form, true);
  handleApiError(res);
  return res;
}

// DELETE /component/:componentId
async function deleteComponent(compId) {
  const sid = state.activeSection?.section_id;
  if (!sid) return;

  showConfirmModal(
    "Delete this component?",
    "This cannot be undone.",
    async () => {
      // FIX #3: Do NOT remove from DB optimistically.  Only update the cache
      // after the server confirms deletion.
      const res = await DeleteData(`/component/${compId}`, {}, true);
      if (handleApiError(res)) return;

      // Revoke blob URLs before dropping the component from the cache.
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

  // FIX #1 (console TypeError): DB.sections[tid] may not exist yet if the
  // fetch hasn't completed or failed.  Guard with a fallback array so .slice()
  // never throws.
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
        <div class="icon">&#127959;&#65039;</div>
        <h3>Section Builder</h3>
        <p>Select a section from the middle panel<br>to start building its content.</p>
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
      <div class="empty-state" style="padding:40px 0">
        <p style="opacity:.5;font-size:13px">No components yet.<br>
          Click <strong>&#65291; Add Component</strong> below.</p>
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

  // FIX #6: Track whether the commit was triggered intentionally (Enter key
  // or an explicit click elsewhere in the document) vs. an unintentional
  // focus loss (switching tabs, browser notification, window blur).
  // We listen on the document's visibilitychange and window blur events;
  // if either fires while the input is active we cancel instead of saving.
  let committed = false;

  const cancel = () => {
    if (committed) return;
    committed = true;
    // Restore original title without saving.
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
    // Remove the safety listeners since focus is gone.
    document.removeEventListener("visibilitychange", onVisibilityChange);
    window.removeEventListener("blur", onWindowBlur);
    // Only commit on a genuine blur (i.e. not already cancelled by window/tab switch).
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
    // Revoke blob URL if one exists for this field.
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

    // FIX #11: Strip all internal UI flags (_expanded, _activeItem, _dirty)
    // so they never reach saveOneComponent or leak into FormData.
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
      // FIX #10: Revoke any blob URL held by the tab being removed.
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

    // FIX #7: Only wipe items if there is no meaningful content to lose, or
    // the user explicitly confirms.  "Meaningful" = at least one item has a
    // non-empty title, content, or image field.
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
      // FIX #10: Revoke all blob URLs before replacing items.
      revokeCompObjectUrls(comp);

      comp.format_type = e.target.value;
      comp.type = e.target.value;
      comp.items = [{ _localId: Date.now() }];
      comp._activeItem = 0;
      comp._dirty = false;
      comp._expanded = true;
      renderBuilder();

      // FIX #11: Strip all UI flags before sending to server.
      const { _expanded, _activeItem, _dirty, ...compToSave } = comp;
      saveOneComponent(compToSave)
        .then((res) => {
          if (res?.success) triggerSave();
        })
        .catch((err) => console.error("[format_type save]", err));
    };

    if (hasContent) {
      // Capture the newly chosen value BEFORE resetting the select visually.
      const intendedType = e.target.value;
      // Reset the select back to the old value so nothing changes until confirmed.
      e.target.value = comp.format_type;

      showConfirmModal(
        "Change Format Type?",
        "Changing the format type will erase all existing content in this component. This cannot be undone.",
        () => {
          // Confirmed — apply the intended type.
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

    // FIX #10: Revoke previous blob URL for this specific field slot.
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
// UNIFIED DRAG & DROP DISPATCHER
// FIX #12: Previously both component-card drag-drop and item-tab drag-drop
// shared the same builderBody listeners, causing onTabDragEnd to run on every
// component drag (and vice-versa).  We now route via a single set of
// listeners that check which drag type is active.
// ════════════════════════════════════════════════════════════════════════════

let _dragTabCompId = null;
let _dragTabFromIdx = null;

function onDragStart(e) {
  const tab = e.target.closest(".item-tab-btn");
  if (tab) {
    // Item-tab drag
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
    // Component card drag
    dragCompId = parseInt(card.dataset.id);
    card.style.opacity = "0.4";
    e.dataTransfer.effectAllowed = "move";
  }
}

function onDragEnd(e) {
  // Item-tab cleanup
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
    return; // Do not run component card cleanup for a tab drag.
  }

  // Component card cleanup
  const card = e.target.closest(".component-card");
  if (card) card.style.opacity = "1";
  builderBody
    .querySelectorAll(".component-card.drag-over")
    .forEach((el) => el.classList.remove("drag-over"));
  dragCompId = null;
}

function onDragOver(e) {
  if (_dragTabCompId !== null) {
    // Item-tab drag-over
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

  // Component card drag-over
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
    // Item-tab drop
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

  // Component card drop
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

  // FIX #5: Persist new order sequentially (one at a time) to avoid flooding
  // the server with N simultaneous PUT requests on every reorder.
  // Only send the components that have a format_type (server only persists
  // typed components), and only send the fields the server needs for ordering
  // (title, format_type, order_index, section_id) — not the full FormData.
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
        if (handleApiError(res)) break; // Stop on first error, show the popup once.
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
    modal.innerHTML = `
      <div class="modal-box" style="max-width:760px;width:95vw;">
        <div class="modal-head">
          <h3>Preview</h3>
          <button class="modal-close" onclick="document.getElementById('compPreviewModal').classList.remove('active')">&#215;</button>
        </div>
        <div class="modal-body" id="compPreviewBody" style="overflow-y:auto;max-height:70vh;padding:20px;"></div>
      </div>`;
    document.body.appendChild(modal);
  }

  const body = document.getElementById("compPreviewBody");
  body.innerHTML = `<p style="text-align:center;color:#9ca3af;padding:40px">&#128247; Loading preview...</p>`;
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
    body.innerHTML = `<p style="text-align:center;color:#9ca3af;padding:40px">No content to preview yet — save your changes first.</p>`;
    return;
  }

  body.innerHTML = buildPreviewHtml(freshComp.format_type, items);
}

function buildPreviewHtml(type, items) {
  const esc = (s) =>
    String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  const imgOrPh = (src) =>
    src
      ? `<img src="${src}" style="width:100%;border-radius:8px;">`
      : `<div style="min-height:160px;background:#e5e7eb;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#9ca3af;">No Image</div>`;

  switch (type) {
    case "flipcards":
      return `
        <style>
          .fp{width:200px;height:280px;perspective:1000px;cursor:pointer;display:inline-block}
          .fpi{position:relative;width:100%;height:100%;transition:.6s;transform-style:preserve-3d}
          .fp.f .fpi{transform:rotateY(180deg)}
          .fpf,.fpb{position:absolute;inset:0;backface-visibility:hidden;border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;text-align:center}
          .fpf{background:#f3f4f6}
          .fpb{background:linear-gradient(135deg,#0097b2,#1e40af);color:#fff;transform:rotateY(180deg)}
        </style>
        <div style="display:flex;flex-wrap:wrap;gap:12px">
          ${items
            .map(
              (it) => `
            <div class="fp" onclick="this.classList.toggle('f')"><div class="fpi">
              <div class="fpf">
                ${
                  it.image
                    ? `<img src="${it.image}" style="width:100%;height:120px;object-fit:cover;border-radius:6px;margin-bottom:8px">`
                    : `<div style="font-size:36px;opacity:.3;margin-bottom:8px">&#127183;</div>`
                }
                <strong>${esc(it.title)}</strong>
                <small style="opacity:.5;margin-top:4px">Click to flip</small>
              </div>
              <div class="fpb">
                <strong style="margin-bottom:8px">${esc(it.title)}</strong>
                <p style="font-size:13px;line-height:1.5">${esc(it.content)}</p>
              </div>
            </div></div>`,
            )
            .join("")}
        </div>`;

    case "accordion":
      return `
        <div style="display:flex;flex-direction:column;gap:8px">
          ${items
            .map(
              (it, i) => `
            <div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
              <div style="padding:12px 16px;background:#f9fafb;font-weight:600;color:#0097b2;cursor:pointer"
                onclick="const b=this.nextElementSibling;b.style.display=b.style.display==='none'?'block':'none'">
                ${i + 1}. ${esc(it.title)} &#9660;
              </div>
              <div style="padding:12px 16px;display:${i === 0 ? "block" : "none"}">
                <p style="color:#4b5563;line-height:1.6">${esc(it.content)}</p>
                ${it.image ? `<img src="${it.image}" style="max-width:100%;border-radius:6px;margin-top:8px">` : ""}
              </div>
            </div>`,
            )
            .join("")}
        </div>`;

    case "tabs":
      return `
        <div>
          <div style="display:flex;gap:4px;border-bottom:2px solid #e5e7eb;margin-bottom:12px" id="ptabs">
            ${items
              .map(
                (it, i) => `
              <button style="padding:8px 16px;border:none;background:${i === 0 ? "#0097b2" : "#f3f4f6"};color:${i === 0 ? "#fff" : "#4b5563"};cursor:pointer;border-radius:6px 6px 0 0;font-weight:600"
                onclick="document.querySelectorAll('.ptb').forEach(t=>t.style.display='none');document.getElementById('pt${i}').style.display='block';document.querySelectorAll('#ptabs button').forEach(b=>{b.style.background='#f3f4f6';b.style.color='#4b5563'});this.style.background='#0097b2';this.style.color='#fff'">
                ${esc(it.title)}
              </button>`,
              )
              .join("")}
          </div>
          ${items
            .map(
              (it, i) => `
            <div id="pt${i}" class="ptb" style="display:${i === 0 ? "block" : "none"}">
              <h3 style="color:#0097b2;margin-bottom:8px">${esc(it.title)}</h3>
              <p style="color:#4b5563;line-height:1.6">${esc(it.content)}</p>
              ${it.image ? `<img src="${it.image}" style="max-width:100%;border-radius:6px;margin-top:10px">` : ""}
            </div>`,
            )
            .join("")}
        </div>`;

    case "timeline":
      return `
        <div style="display:flex;flex-direction:column;gap:20px">
          ${items
            .map(
              (it, i) => `
            <div style="display:grid;grid-template-columns:52px 1fr;gap:14px;align-items:start">
              <div style="width:52px;height:52px;background:linear-gradient(135deg,#0097b2,#1e40af);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700">${i + 1}</div>
              <div style="background:#fff;padding:14px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.07)">
                <h4 style="color:#0097b2;margin-bottom:6px">${esc(it.title)}</h4>
                <p style="color:#4b5563;font-size:13px;line-height:1.5">${esc(it.content)}</p>
                ${it.image ? `<img src="${it.image}" style="max-width:100%;border-radius:6px;margin-top:8px">` : ""}
              </div>
            </div>`,
            )
            .join("")}
        </div>`;

    case "image_right":
    case "image_left": {
      const it = items[0];
      const txt = `<div><h2 style="color:#0097b2;margin-bottom:10px">${esc(it.title)}</h2><p style="color:#4b5563;line-height:1.7">${esc(it.content)}</p></div>`;
      const img = imgOrPh(it.image);
      return `<div style="display:grid;grid-template-columns:${type === "image_right" ? "1.5fr 1fr" : "1fr 1.5fr"};gap:20px;align-items:start">${type === "image_right" ? txt + img : img + txt}</div>`;
    }

    case "image_overlay": {
      const it = items[0];
      return `
        <div style="position:relative;border-radius:10px;overflow:hidden">
          ${
            it.image
              ? `<img src="${it.image}" style="width:100%;height:280px;object-fit:cover">`
              : `<div style="height:280px;background:linear-gradient(135deg,#0097b2,#1e40af)"></div>`
          }
          <div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(to top,rgba(0,0,0,.8),transparent);padding:28px;color:#fff">
            <h2 style="margin-bottom:8px">${esc(it.title)}</h2>
            <p style="font-size:14px;opacity:.9">${esc(it.content)}</p>
          </div>
        </div>`;
    }

    case "imageblock": {
      const it = items[0];
      return `
        <div style="text-align:center">
          ${
            it.url
              ? `<img src="${it.url}" style="max-width:100%;border-radius:8px">`
              : `<div style="height:160px;background:#e5e7eb;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#9ca3af">No image</div>`
          }
          ${it.caption ? `<p style="margin-top:8px;font-size:13px;color:#6b7280;font-style:italic">${esc(it.caption)}</p>` : ""}
        </div>`;
    }

    case "exercise":
      return `
        <div style="display:flex;align-items:center;justify-content:center;min-height:100px;background:#f9fafb;border-radius:8px;border:2px dashed #e5e7eb">
          <p style="color:#9ca3af;font-weight:600">&#9999;&#65039; Exercise Component</p>
        </div>`;

    default:
      return `<p style="color:#9ca3af;text-align:center;padding:32px">No preview available.</p>`;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// CONFIRM MODAL
// FIX #15: Guard against concurrent showConfirmModal calls by closing any
// existing open modal before creating a new one.
// ════════════════════════════════════════════════════════════════════════════

function showConfirmModal(title, message, onConfirm) {
  // Close any currently open confirm modal to avoid orphaned callbacks.
  const existing = document.getElementById("modalConfirm");
  if (existing?.classList.contains("active")) {
    existing.classList.remove("active");
  }

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

/**
 * Normalises any server or local component shape into the consistent internal
 * shape used throughout this file.
 */
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
    // FIX #8: Preserve section_id through normalisation so saveOneComponent
    // can always find it, even for components created optimistically.
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

/**
 * Safely coerce any server response value into a plain array.
 *
 * Handles the shapes this backend actually returns:
 *   1. Bare array                    -> [ {...}, ... ]
 *   2. Envelope object with known key -> { sections: [...], topic_id: 31 }
 *                                        { components: [...] }
 *                                        { data: [...] } etc.
 *   3. null / undefined              -> []
 *   4. Anything else                 -> [] + console.warn (visible in DevTools)
 *
 * Add keys to ENVELOPE_KEYS if the backend introduces new wrapper shapes.
 */
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
/** Escape a string for safe HTML insertion. */
function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Flash the global "Saved" indicator for 2 seconds. */
function triggerSave() {
  const el = document.getElementById("saveIndicator");
  if (!el) return;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2000);
}

/** Update the header breadcrumb. Pass null to leave a segment unchanged. */
function updateBreadcrumb(sub, sec) {
  const bc = document.getElementById("headerBreadcrumb");
  if (!bc) return;
  if (sub !== null) bc.dataset.sub = sub;
  const s = bc.dataset.sub || "";
  bc.innerHTML = `<span>${s}</span>${sec ? `<span class="sep">&#8250;</span><span>${sec}</span>` : ""}`;
}
