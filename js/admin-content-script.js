// ════════════════════════════════════════════════════════════════════════════
// IMPORTS
// ════════════════════════════════════════════════════════════════════════════
import { FetchData, PostData, DeleteData, UpdateData } from "../js/api/crud.js";

// ════════════════════════════════════════════════════════════════════════════
// FORMAT TYPES — all supported component format types.
// Key = format_type value stored on the server.
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

// Groups for the <select> optgroups — keeps related formats together visually
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

// Fields inside each item row, keyed by format_type.
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
  exercise: [], // No fields — exercise is a placeholder component
};

// Format types that only have ONE item row (no "Add Item" button)
const SINGLE_ITEM_FORMATS = new Set([
  "image_right",
  "image_left",
  "image_overlay",
  "imageblock",
  "exercise",
]);

// ════════════════════════════════════════════════════════════════════════════
// IN-MEMORY DATA STORE
// All data is fetched from the API on demand and cached here.
// ════════════════════════════════════════════════════════════════════════════
const DB = {
  topics: [], // Array<Topic>  — loaded once on page load
  sections: {}, // { [subtopicId]: Section[] }
  components: {}, // { [section_id]: Component[] }
};

// ════════════════════════════════════════════════════════════════════════════
// UI STATE
// ════════════════════════════════════════════════════════════════════════════
let state = {
  activeTopic: null,
  activeSection: null,
  expandedTopics: new Set(),
};

let dragSecId = null; // section being dragged
let dragCompId = null; // component being dragged

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
// EVENTS — all delegated to stable parent nodes
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
  builderBody.addEventListener("dragstart", onCompDragStart);
  builderBody.addEventListener("dragend", onCompDragEnd);
  builderBody.addEventListener("dragover", onCompDragOver);
  builderBody.addEventListener("drop", onCompDrop);
  // Tab drag-drop — item reordering within a component
  builderBody.addEventListener("dragstart", onTabDragStart);
  builderBody.addEventListener("dragover", onTabDragOver);
  builderBody.addEventListener("dragleave", onTabDragLeave);
  builderBody.addEventListener("drop", onTabDrop);
  builderBody.addEventListener("dragend", onTabDragEnd);

  // The drag handle makes the card draggable on mousedown
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

  // "Add Component" — creates a blank card immediately, no modal
  document
    .getElementById("btnOpenCompModal")
    .addEventListener("click", createComponent);

  // Collapse all
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
// API — TOPICS
// GET /topic
// ════════════════════════════════════════════════════════════════════════════
async function fetchTopics() {
  try {
    const res = await FetchData("/topic", true);
    DB.topics = res.success ? res.data.topics || [] : [];
  } catch (err) {
    console.error("[fetchTopics]", err);
    DB.topics = [];
  }
  renderTopics();
}

// ════════════════════════════════════════════════════════════════════════════
// API — SECTIONS
// ════════════════════════════════════════════════════════════════════════════

// GET /sections/:subtopicId
// Cached after first load — won't re-fetch on repeated section clicks.
async function fetchSections(subtopicId) {
  if (DB.sections[subtopicId] !== undefined) return;
  try {
    const res = await FetchData(`/sections/${subtopicId}`, true);
    DB.sections[subtopicId] = res.success ? res.data.sections || [] : [];
  } catch (err) {
    console.error("[fetchSections]", err);
    DB.sections[subtopicId] = [];
  }
}

// POST /section
// Creates a new section on the server. On success, adds it to the cache
// and immediately opens it in rename mode (same UX as "Add Section").
async function createSection() {
  if (!state.activeTopic) return;
  const tid = state.activeTopic.id;

  try {
    const res = await PostData(
      "/section",
      {
        topic_id: tid,
        title: "New Section",
        order_index: (DB.sections[tid] || []).length,
      },
      true,
    );

    if (res.success) {
      console.log("Section created on server:", res.data);
      const newSec = res.data.section;
      if (!DB.sections[tid]) DB.sections[tid] = [];
      DB.sections[tid].push(newSec);
      console.log("Section created:", newSec);
      DB.components[newSec.section_id] = [];
      renderSections();
      triggerSave();
      setTimeout(() => {
        selectSection(newSec.section_id);
        startRename(newSec.section_id);
      }, 80);
    }
  } catch (err) {
    console.error("[createSection]", err);
  }
}

// PUT /sections/:sectionId
// Saves a renamed section title to the server.
// Optimistically updates local state before the response arrives.
async function saveRenameSection(sectionId, newTitle) {
  const tid = state.activeTopic?.id;
  if (!tid) return;
  const sec = (DB.sections[tid] || []).find((s) => s.section_id === sectionId);
  if (!sec) return;

  sec.title = newTitle;
  if (state.activeSection?.section_id === sectionId) {
    state.activeSection.title = newTitle;
    const el = document.getElementById("builderSectionName");
    if (el) el.textContent = newTitle;
  }

  try {
    await UpdateData(
      `/sections/${sectionId}`,
      {
        title: newTitle,
        order_index: sec.order_index,
        is_locked: sec.is_locked || false,
      },
      true,
    );
    triggerSave();
  } catch (err) {
    console.error("[saveRenameSection]", err);
  }
}

// PUT /sections/:sectionId (order_index)
// Syncs the new order_index for every section after a drag-drop reorder.
async function saveSectionOrder(secs) {
  try {
    await Promise.all(
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
    triggerSave();
  } catch (err) {
    console.error("[saveSectionOrder]", err);
  }
}

// DELETE /sections/:sectionId
// Shows a confirmation modal before deleting.
async function deleteSection(id) {
  showConfirmModal(
    "Delete this section?",
    "All its components will be lost.",
    async () => {
      try {
        const res = await DeleteData(`/sections/${id}`, true);
        if (res.data?.status) {
          const tid = state.activeTopic.id;
          DB.sections[tid] = (DB.sections[tid] || []).filter(
            (s) => s.section_id !== id,
          );
          delete DB.components[id];
          if (state.activeSection?.section_id === id)
            state.activeSection = null;
          renderSections();
          renderBuilder();
          triggerSave();
        } else {
          alert("Delete failed: " + (res.data?.message || "Unknown error"));
        }
      } catch (err) {
        console.error("[deleteSection]", err);
      }
    },
  );
}

// ════════════════════════════════════════════════════════════════════════════
// API — COMPONENTS
// ════════════════════════════════════════════════════════════════════════════

// GET /components/:sectionId
// Normalized on arrival so id / format_type always exist regardless of server shape.
async function fetchComponents(sectionId) {
  if (DB.components[sectionId] !== undefined) return;
  try {
    const res = await FetchData(`/sections/${sectionId}/components`, true);
    DB.components[sectionId] = (
      res.success ? res.data.components || [] : []
    ).map(normalizeComp);
  } catch (err) {
    console.error("[fetchComponents]", err);
    DB.components[sectionId] = [];
  }
}

// POST /component
// Creates a blank component immediately (no modal — same UX as Add Section).
// The format_type selector lives inside the card — user picks it there.
async function createComponent() {
  if (!state.activeSection) return;
  const sid = state.activeSection.section_id;
  if (!DB.components[sid]) DB.components[sid] = [];

  // Collapse existing cards so the new one is in focus
  DB.components[sid].forEach((c) => (c._expanded = false));

  const tempId = Date.now();
  const order = DB.components[sid].length;

  // Build locally first — card renders instantly without waiting for the server
  const newComp = normalizeComp({
    id: tempId,
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

  // POST in the background; swap temp id for the real server-assigned id
  try {
    const res = await PostData(
      "/component",
      {
        section_id: sid,
        format_type: "",
        title: "New Component",
        order_index: order,
        items: [{}],
      },
      true,
    );
    const serverData = res?.data?.component || res?.data || {};
    const realId = serverData.component_id ?? serverData.id;
    if (realId) {
      newComp.id = newComp.component_id = realId;
      const card = builderBody.querySelector(
        `.component-card[data-id="${tempId}"]`,
      );
      if (card) card.dataset.id = String(realId);
    }
    triggerSave();
  } catch (err) {
    console.warn("[createComponent] POST failed — using local temp id:", err);
  }
}

// PUT /component/:componentId  (one request per component)
//
// Each component is saved individually so the backend only ever handles
// one component + its items in a single request — no section-wide payload.
//
// FormData structure per component:
//   title        → string
//   format_type  → string
//   order_index  → string (FormData values are always strings)
//   section_id   → string
//   items        → JSON string of the items array, with each image field set to
//                  the file key it corresponds to e.g. "image_0", "image_1"
//                  so the backend knows exactly which file belongs to which item
//   image_0      → raw File binary for items[0] image  (any format — always image_N)
//   image_1      → raw File binary for items[1] image
//
// ALL image files use the key image_N regardless of whether the item field is
// named "image" (flipcards, timeline etc.) or "url" (imageblock).
// The backend always looks for image_0, image_1 etc. — never url_0.
//
// If an item has no image, its image field in the JSON is simply null — no file appended.
// The backend reads the items JSON, and for each item checks:
//   if item.image === "image_0"  →  look in request.files["image_0"] for the binary
//   if item.image === null       →  no image for this item

const IMAGE_FIELDS = ["image", "url"]; // field names that carry image data

// Builds and sends a FormData for a single component.
// Called by saveComponents() for each dirty component.
async function saveOneComponent(comp) {
  const form = new FormData();

  // ── Top-level component fields ────────────────────────────────────────────
  form.append("title", comp.title || "");
  form.append("format_type", comp.format_type || "");
  form.append("order_index", String(comp.order_index ?? 0));
  form.append("section_id", String(comp.section_id || ""));

  // ── Deleted item IDs — backend must DELETE these rows ─────────────────────
  // When a user removes an item tab, its server item_id is recorded on
  // comp._deletedItemIds. We send them here so the backend deletes them
  // explicitly rather than inferring by comparison.
  if (comp._deletedItemIds?.length) {
    form.append("deleted_item_ids", JSON.stringify(comp._deletedItemIds));
    comp._deletedItemIds = []; // clear after sending — don't re-send on next save
  }

  // ── Items — each item carries its own image directly ──────────────────────
  // For each item:
  //   • Strip _localId (UI-only tracking, backend doesn't need it)
  //   • If it has a raw File on an image field:
  //       - append the file to FormData as  image_{itemIdx}  (e.g. image_0, image_1)
  //       - set that JSON field to the same key so backend knows where to find it
  //   • If it already has a string (URL returned by server on load) — leave untouched
  //   • If it has nothing — send null
  //
  // Example for a 3-item timeline where items 0 and 2 have new images:
  //   items     → '[{"title":"A","image":"image_0"},{"title":"B","image":null},{"title":"C","image":"image_2"}]'
  //   image_0   → [binary of file A]
  //   image_2   → [binary of file C]
  //   (no image_1 appended — item B has no image)
  const itemsForJson = (comp.items || []).map((item, idx) => {
    // Strip UI-only flags — backend never needs them
    // Strip all UI-only fields — backend never needs them
    const { _localId, _dragOver, ...rest } = item;
    // Strip all _objectUrl_ and _clearImage_ keys (UI state only)
    const jsonItem = Object.fromEntries(
      Object.entries(rest).filter(
        ([k]) =>
          !k.startsWith("_objectUrl_") &&
          !k.startsWith("_clearImage_") &&
          !k.startsWith("_hasImage_"),
      ),
    );

    // Always send the current array position as order_index
    // so the backend can persist the exact order the user arranged
    jsonItem.order_index = idx;

    // Only process image fields that this format type actually uses.
    // e.g. imageblock uses "url", all others use "image".
    const formatFields = FORMAT_ITEM_FIELDS[comp.format_type] || [];
    const activeImageFields = IMAGE_FIELDS.filter((field) =>
      formatFields.some((f) => f.key === field),
    );

    // Remove any irrelevant image fields from the payload entirely
    IMAGE_FIELDS.forEach((field) => {
      if (!activeImageFields.includes(field)) delete jsonItem[field];
    });

    // All image data is normalized to the "image" key in the JSON payload
    // regardless of the internal field name (image or url).
    // The backend always reads item.image — never item.url.
    //
    // Example — imageblock item 0 with a new file:
    //   FormData:  image_0 → [binary]
    //   items JSON: { "image": "image_0", "caption": "..." }
    //
    // Example — timeline item 1 with a new file:
    //   FormData:  image_1 → [binary]
    //   items JSON: { "title": "Step 2", "image": "image_1" }

    // Remove url from payload — backend never needs it, image is the canonical field
    delete jsonItem.url;

    // Resolve the value from whichever field actually holds the image data
    const imageValue = activeImageFields.reduce(
      (val, field) => val ?? item[field] ?? null,
      null,
    );
    const clearFlag = activeImageFields.some(
      (field) => item[`_clearImage_${field}`],
    );
    const keepFlag = activeImageFields.some(
      (field) => item[`_hasImage_${field}`],
    );

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

    // Strip UI-only flags before sending
    activeImageFields.forEach((field) => {
      delete jsonItem[`_hasImage_${field}`];
      delete jsonItem[`_clearImage_${field}`];
    });

    return jsonItem;
  });

  form.append("items", JSON.stringify(itemsForJson));

  // UpdateData: detects FormData → does NOT JSON.stringify, does NOT set Content-Type
  // Browser sets: Content-Type: multipart/form-data; boundary=...  automatically
  await UpdateData(`/component/${comp.id}`, form, true);
}

// Auto-save removed — components are saved explicitly via the "Save Changes" button.

// DELETE /component/:componentId
// Shows a confirmation modal before deleting. Removes optimistically.
async function deleteComponent(compId) {
  const sid = state.activeSection?.section_id;
  if (!sid) return;
  showConfirmModal(
    "Delete this component?",
    "This cannot be undone.",
    async () => {
      DB.components[sid] = (DB.components[sid] || []).filter(
        (c) => c.id !== compId,
      );
      renderBuilder();
      triggerSave();
      try {
        await DeleteData(`/component/${compId}`, true);
      } catch (err) {
        console.error("[deleteComponent]", err);
      }
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

// ── Component card ────────────────────────────────────────────────────────────
// Structure:
//   Header — drag handle · format badge · title · actions · chevron
//   Body   — [1] component title input
//             [2] FORMAT TYPE selector (grouped optgroups)
//             [3] item TABS — one tab per item, click to select
//             [4] selected item's fields shown below the tabs
//
// comp._activeItem  tracks which item index is currently selected (default 0).
// Single-item formats skip the tab bar and just show the fields directly.
function renderComponentCard(comp) {
  const fmt = FORMAT_TYPES[comp.format_type] || null;

  // Build grouped <optgroup> options
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

  // Track which item is active — default to 0
  if (comp._activeItem === undefined || comp._activeItem >= comp.items.length) {
    comp._activeItem = 0;
  }

  // Build items content
  let itemsSection = "";
  if (hasType) {
    if (isSingle) {
      // Single-item: no tab bar, just render the fields directly
      itemsSection = `
        <div class="items-section">
          <div class="items-section-header"><span>Content</span></div>
          <div class="items-list" data-comp-id="${comp.id}">
            ${renderItemFields(comp, comp.items[0], 0, fields)}
          </div>
        </div>`;
    } else if (comp.format_type === "exercise") {
      itemsSection = `
        <div class="items-section">
          <div class="exercise-block">&#9999;&#65039; Exercise — content managed externally</div>
        </div>`;
    } else {
      // Multi-item: render tab bar + selected item's fields.
      // Each tab is draggable so the user can reorder items by dragging tabs.
      // Drag state is tracked on comp._dragItemIdx (the tab being dragged).
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

      const activeFields = renderItemFields(
        comp,
        comp.items[comp._activeItem],
        comp._activeItem,
        fields,
      );

      itemsSection = `
        <div class="items-section">
          <div class="item-tabs-bar">
            ${tabBar}
            <button class="btn-add-item btn-add-comp-item item-tab-add"
              data-comp-id="${comp.id}" title="Add item">&#65291;</button>
          </div>
          <div class="items-list" data-comp-id="${comp.id}">
            ${activeFields}
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

// ── Item fields ───────────────────────────────────────────────────────────────
// Renders the editable fields for ONE item (no wrapper row, no drag handle).
// Used for both single-item formats and the selected tab in multi-item formats.
function renderItemFields(comp, item, idx, fields) {
  if (!item) return "";
  return fields
    .map((f) => {
      if (f.tag === "file") {
        const rawVal = item[f.key];
        const hasExisting = item[`_hasImage_${f.key}`];
        const isCleared = item[`_clearImage_${f.key}`];

        // Resolve what to show in the thumbnail:
        //   File object  → user picked a new file; use the cached objectUrl stored on item
        //   string       → data: URL (from server base64) or regular URL
        //   _hasImage    → server has binary but no URL returned (shouldn't happen now but safe fallback)
        let previewSrc = "";
        if (rawVal instanceof File) {
          // Use cached object URL stored when user picked the file
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
  const input = document.createElement("input");
  input.className = "section-title-input";
  input.value = span.textContent;
  span.replaceWith(input);
  input.focus();
  input.select();
  const commit = () => {
    const val = input.value.trim() || "Untitled Section";
    saveRenameSection(id, val);
    renderSections();
  };
  input.addEventListener("blur", commit);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      input.blur();
    }
    if (e.key === "Escape") {
      input.value = span.textContent;
      input.blur();
    }
  });
}

// Mark a component as having unsaved changes.
// Updates the Save Changes button text/style without re-rendering the whole card.
function markDirty(comp, card) {
  comp._dirty = true;
  const btn = card?.querySelector(".btn-save-comp");
  if (btn) {
    btn.classList.add("dirty");
    btn.innerHTML = "&#128190; Save Changes";
  }
}

// Mark a component as clean after a successful save.
function markClean(comp, card) {
  comp._dirty = false;
  const btn = card?.querySelector(".btn-save-comp");
  if (btn) {
    btn.classList.remove("dirty");
    btn.innerHTML = "&#10003; Saved";
  }
}

// Builder: clicks — action buttons handled first with stopPropagation
// so the header expand-toggle at the bottom does not also fire.
function handleBuilderClick(e) {
  const sid = state.activeSection?.section_id;
  if (!sid) return;
  const comps = DB.components[sid] || [];

  // ── Remove image button ──────────────────────────────────────────────────
  const removeImageBtn = e.target.closest(".btn-remove-image");
  if (removeImageBtn) {
    e.stopPropagation();
    const { compId, itemIdx, field } = removeImageBtn.dataset;
    const comp = comps.find((c) => c.id === parseInt(compId));
    if (!comp) return;
    const idx = parseInt(itemIdx);
    if (!comp.items[idx]) return;

    // Mark this image field as explicitly cleared by the user.
    // saveOneComponent will send null for this field → backend clears image_data.
    comp.items[idx][field] = null;
    comp.items[idx][`_hasImage_${field}`] = false;
    comp.items[idx][`_clearImage_${field}`] = true;

    markDirty(comp, e.target.closest(".component-card"));
    renderBuilder(); // re-render to remove the thumbnail and button
    return;
  }

  // ── Save Changes button — saves only this one component ──────────────────
  const saveBtn = e.target.closest(".btn-save-comp");
  if (saveBtn) {
    e.stopPropagation();
    const comp = comps.find((c) => c.id === parseInt(saveBtn.dataset.id));
    if (!comp) return;
    const card = saveBtn.closest(".component-card");
    saveBtn.disabled = true;
    saveBtn.innerHTML = "&#8987; Saving...";
    const { _expanded, _activeItem, ...compToSave } = comp;
    saveOneComponent(compToSave)
      .then(() => {
        markClean(comp, card);
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

  // ── Remove item tab (✕ on active tab) — must come BEFORE tab-select
  // so the click doesn't bubble into the tab select handler first
  const removeItemBtn = e.target.closest(".btn-remove-item");
  if (removeItemBtn) {
    e.stopPropagation();
    const comp = comps.find(
      (c) => c.id === parseInt(removeItemBtn.dataset.compId),
    );
    if (comp && comp.items.length > 1) {
      const idx = parseInt(removeItemBtn.dataset.itemIdx);
      const removedItem = comp.items[idx];

      // If the item has a server-assigned item_id, record it so the backend
      // knows to DELETE that row — not just ignore it.
      if (removedItem?.item_id) {
        if (!comp._deletedItemIds) comp._deletedItemIds = [];
        comp._deletedItemIds.push(removedItem.item_id);
      }

      comp.items.splice(idx, 1);
      if (comp._activeItem >= comp.items.length)
        comp._activeItem = comp.items.length - 1;
      comp._dirty = true;
      renderBuilder();
      // Deletion is persisted when user clicks Save Changes
    }
    return;
  }

  // ── Select an item tab (clicking the tab label, not the ✕)
  const tabBtn = e.target.closest(".item-tab-btn");
  if (tabBtn) {
    e.stopPropagation();
    const comp = comps.find((c) => c.id === parseInt(tabBtn.dataset.compId));
    if (comp) {
      comp._activeItem = parseInt(tabBtn.dataset.itemIdx);
      renderBuilder();
    }
    return;
  }

  // ── Add new item (the ＋ button at the end of the tab bar)
  const addItemBtn = e.target.closest(".btn-add-comp-item");
  if (addItemBtn) {
    e.stopPropagation();
    const comp = comps.find(
      (c) => c.id === parseInt(addItemBtn.dataset.compId),
    );
    if (comp) {
      comp.items.push({ _localId: Date.now() }); // new item — persisted on Save Changes
      comp._activeItem = comp.items.length - 1; // auto-select the new item
      renderBuilder();
      // No auto-save — user clicks Save Changes to persist
    }
    return;
  }

  const delBtn = e.target.closest(".comp-btn-delete");
  if (delBtn) {
    e.stopPropagation();
    deleteComponent(parseInt(delBtn.dataset.id));
    return;
  }

  const previewBtn = e.target.closest(".btn-comp-preview");
  if (previewBtn) {
    e.stopPropagation();
    const comp = comps.find((c) => c.id === parseInt(previewBtn.dataset.id));
    if (comp) openPreviewModal(comp);
    return;
  }

  // Toggle expand/collapse — only if no action button was clicked
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

// Builder: text input changes
function handleBuilderInput(e) {
  const card = e.target.closest(".component-card");
  if (!card) return;
  const sid = state.activeSection?.section_id;
  const comp = (DB.components[sid] || []).find(
    (c) => c.id === parseInt(card.dataset.id),
  );
  if (!comp) return;

  // Component title — update header label live, mark dirty
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

  // Item fields — update local state only, mark dirty
  const { itemIdx, field } = e.target.dataset;
  if (itemIdx !== undefined && field) {
    const idx = parseInt(itemIdx);
    if (!comp.items[idx]) comp.items[idx] = { _localId: Date.now() };
    comp.items[idx][field] = e.target.value;

    // Live-update the tab label when item title changes
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

// Builder: <select> and file input changes
function handleBuilderChange(e) {
  const sid = state.activeSection?.section_id;
  if (!sid) return;

  // Format type — structural change, auto-save immediately so the backend
  // knows the format before any items are added.
  if (e.target.classList.contains("comp-type-select")) {
    const comp = (DB.components[sid] || []).find(
      (c) => c.id === parseInt(e.target.dataset.compId),
    );
    if (!comp) return;
    comp.format_type = e.target.value;
    comp.type = e.target.value;
    comp.items = [{ _localId: Date.now() }];
    comp._dirty = false;
    comp._expanded = true;
    renderBuilder();
    const { _expanded, _activeItem, _dirty, ...compToSave } = comp;
    saveOneComponent(compToSave)
      .then(() => triggerSave())
      .catch((err) => console.error("[format_type save]", err));
    return;
  }

  // Image file input — store raw File on item, show instant preview, mark dirty.
  // The binary is sent only when the user clicks "Save Changes".
  if (e.target.classList.contains("item-file-input")) {
    const { compId, itemIdx, field } = e.target.dataset;
    const comp = (DB.components[sid] || []).find(
      (c) => c.id === parseInt(compId),
    );
    if (!comp || !e.target.files[0]) return;

    const file = e.target.files[0];
    const idx = parseInt(itemIdx);
    if (!comp.items[idx]) comp.items[idx] = { _localId: Date.now() };

    // Revoke any previous object URL to avoid memory leaks
    if (comp.items[idx][`_objectUrl_${field}`]) {
      URL.revokeObjectURL(comp.items[idx][`_objectUrl_${field}`]);
    }

    comp.items[idx][field] = file; // raw File — sent as binary on Save Changes
    comp.items[idx][`_hasImage_${field}`] = false; // new file replaces old — no longer "__keep__"
    comp.items[idx][`_clearImage_${field}`] = false; // not cleared, actively replacing
    // Cache the object URL on the item so re-renders (tab switch, dirty update etc.)
    // can show the preview without hitting [object File] as an img src
    comp.items[idx][`_objectUrl_${field}`] = URL.createObjectURL(file);

    const thumb = e.target
      .closest(".item-field-group")
      ?.querySelector(".image-preview-thumb");
    if (thumb) {
      thumb.innerHTML = `<img src="${comp.items[idx][`_objectUrl_${field}`]}" alt="preview">`;
      thumb.classList.add("show");
    }

    const card = e.target.closest(".component-card");
    markDirty(comp, card);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// DRAG & DROP — ITEM TABS  (reordering items within a component)
// ════════════════════════════════════════════════════════════════════════════
// Each tab button is draggable. Dragging a tab over another tab shows a
// visual "drop here" indicator. On drop, the items array is spliced into
// the new order, order_index values are updated, and the component is
// marked dirty (user still has to click Save Changes to persist).

let _dragTabCompId = null; // comp.id whose tab is being dragged
let _dragTabFromIdx = null; // original index of the tab being dragged

function onTabDragStart(e) {
  const tab = e.target.closest(".item-tab-btn");
  if (!tab) return;
  e.stopPropagation(); // prevent comp-level dragstart from also firing
  _dragTabCompId = parseInt(tab.dataset.compId);
  _dragTabFromIdx = parseInt(tab.dataset.itemIdx);
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", "tab"); // required for Firefox
  tab.classList.add("tab-dragging");
}

function onTabDragOver(e) {
  const tab = e.target.closest(".item-tab-btn");
  if (!tab || _dragTabCompId === null) return;
  if (parseInt(tab.dataset.compId) !== _dragTabCompId) return;
  if (parseInt(tab.dataset.itemIdx) === _dragTabFromIdx) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  // Highlight the potential drop target
  builderBody
    .querySelectorAll(".item-tab-btn.tab-drop-target")
    .forEach((t) => t.classList.remove("tab-drop-target"));
  tab.classList.add("tab-drop-target");
}

function onTabDragLeave(e) {
  const tab = e.target.closest(".item-tab-btn");
  if (tab) tab.classList.remove("tab-drop-target");
}

function onTabDrop(e) {
  const tab = e.target.closest(".item-tab-btn");
  if (!tab || _dragTabCompId === null) return;
  const toIdx = parseInt(tab.dataset.itemIdx);
  const compId = parseInt(tab.dataset.compId);
  if (compId !== _dragTabCompId) return;
  if (toIdx === _dragTabFromIdx) return;
  e.preventDefault();
  e.stopPropagation(); // don't let onCompDrop also fire

  const sid = state.activeSection?.section_id;
  const comp = (DB.components[sid] || []).find((c) => c.id === compId);
  if (!comp) return;

  // Reorder: remove from source, insert at destination
  const [moved] = comp.items.splice(_dragTabFromIdx, 1);
  comp.items.splice(toIdx, 0, moved);

  // Stamp order_index on every item to match new positions
  comp.items.forEach((item, i) => {
    item.order_index = i;
  });

  // Keep the active tab following the moved item
  comp._activeItem = toIdx;

  markDirty(
    comp,
    builderBody.querySelector(`.component-card[data-id="${compId}"]`),
  );
  renderBuilder();
}

function onTabDragEnd(e) {
  // Clean up drag styles regardless of whether drop succeeded
  builderBody
    .querySelectorAll(
      ".item-tab-btn.tab-dragging, .item-tab-btn.tab-drop-target",
    )
    .forEach((t) => {
      t.classList.remove("tab-dragging");
      t.classList.remove("tab-drop-target");
    });
  _dragTabCompId = null;
  _dragTabFromIdx = null;
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
// DRAG & DROP — COMPONENTS
// ════════════════════════════════════════════════════════════════════════════
function onCompDragStart(e) {
  const card = e.target.closest(".component-card");
  if (!card) return;
  dragCompId = parseInt(card.dataset.id);
  card.style.opacity = "0.4";
  e.dataTransfer.effectAllowed = "move";
}
function onCompDragEnd(e) {
  const card = e.target.closest(".component-card");
  if (card) card.style.opacity = "1";
  builderBody
    .querySelectorAll(".component-card.drag-over")
    .forEach((el) => el.classList.remove("drag-over"));
}
function onCompDragOver(e) {
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
function onCompDrop(e) {
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
  // Save only order_index for each component — not their items
  comps
    .filter((c) => c.format_type)
    .forEach((c) => {
      const { _expanded, _activeItem, _dirty, ...compToSave } = c;
      saveOneComponent(compToSave).catch((err) =>
        console.error("[reorder save]", err),
      );
    });
}

// ════════════════════════════════════════════════════════════════════════════
// PREVIEW MODAL
// ════════════════════════════════════════════════════════════════════════════
function openPreviewModal(comp) {
  const items = (comp.items || []).filter((i) => i.title || i.content || i.url);
  if (!items.length) {
    alert("Add some content first.");
    return;
  }
  const html = buildPreviewHtml(comp.format_type, items);
  let modal = document.getElementById("compPreviewModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "compPreviewModal";
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-box" style="max-width:760px;width:95vw;">
        <div class="modal-head"><h3>Preview</h3>
          <button class="modal-close" onclick="document.getElementById('compPreviewModal').classList.remove('active')">&#215;</button>
        </div>
        <div class="modal-body" id="compPreviewBody" style="overflow-y:auto;max-height:70vh;padding:20px;"></div>
      </div>`;
    document.body.appendChild(modal);
  }
  document.getElementById("compPreviewBody").innerHTML = html;
  modal.classList.add("active");
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
      <style>.fp{width:200px;height:280px;perspective:1000px;cursor:pointer;display:inline-block}
        .fpi{position:relative;width:100%;height:100%;transition:.6s;transform-style:preserve-3d}
        .fp.f .fpi{transform:rotateY(180deg)}
        .fpf,.fpb{position:absolute;inset:0;backface-visibility:hidden;border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;text-align:center}
        .fpf{background:#f3f4f6} .fpb{background:linear-gradient(135deg,#0097b2,#1e40af);color:#fff;transform:rotateY(180deg)}</style>
      <div style="display:flex;flex-wrap:wrap;gap:12px">
        ${items
          .map(
            (
              it,
            ) => `<div class="fp" onclick="this.classList.toggle('f')"><div class="fpi">
          <div class="fpf">${it.image ? `<img src="${it.image}" style="width:100%;height:120px;object-fit:cover;border-radius:6px;margin-bottom:8px">` : `<div style="font-size:36px;opacity:.3;margin-bottom:8px">&#127183;</div>`}
            <strong>${esc(it.title)}</strong><small style="opacity:.5;margin-top:4px">Click to flip</small></div>
          <div class="fpb"><strong style="margin-bottom:8px">${esc(it.title)}</strong><p style="font-size:13px;line-height:1.5">${esc(it.content)}</p></div>
        </div></div>`,
          )
          .join("")}</div>`;

    case "accordion":
      return `
      <div style="display:flex;flex-direction:column;gap:8px">
        ${items
          .map(
            (
              it,
              i,
            ) => `<div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
          <div style="padding:12px 16px;background:#f9fafb;font-weight:600;color:#0097b2;cursor:pointer"
            onclick="const b=this.nextElementSibling;b.style.display=b.style.display==='none'?'block':'none'">
            ${i + 1}. ${esc(it.title)} &#9660;</div>
          <div style="padding:12px 16px;display:${i === 0 ? "block" : "none"}">
            <p style="color:#4b5563;line-height:1.6">${esc(it.content)}</p>
            ${it.image ? `<img src="${it.image}" style="max-width:100%;border-radius:6px;margin-top:8px">` : ""}
          </div></div>`,
          )
          .join("")}</div>`;

    case "tabs":
      return `
      <div><div style="display:flex;gap:4px;border-bottom:2px solid #e5e7eb;margin-bottom:12px" id="ptabs">
        ${items
          .map(
            (
              it,
              i,
            ) => `<button style="padding:8px 16px;border:none;background:${i === 0 ? "#0097b2" : "#f3f4f6"};color:${i === 0 ? "#fff" : "#4b5563"};cursor:pointer;border-radius:6px 6px 0 0;font-weight:600"
          onclick="document.querySelectorAll('.ptb').forEach(t=>t.style.display='none');document.getElementById('pt${i}').style.display='block';document.querySelectorAll('#ptabs button').forEach(b=>{b.style.background='#f3f4f6';b.style.color='#4b5563'});this.style.background='#0097b2';this.style.color='#fff'">${esc(it.title)}</button>`,
          )
          .join("")}
      </div>
      ${items
        .map(
          (
            it,
            i,
          ) => `<div id="pt${i}" class="ptb" style="display:${i === 0 ? "block" : "none"}">
        <h3 style="color:#0097b2;margin-bottom:8px">${esc(it.title)}</h3>
        <p style="color:#4b5563;line-height:1.6">${esc(it.content)}</p>
        ${it.image ? `<img src="${it.image}" style="max-width:100%;border-radius:6px;margin-top:10px">` : ""}
      </div>`,
        )
        .join("")}</div>`;

    case "timeline":
      return `
      <div style="display:flex;flex-direction:column;gap:20px">
        ${items
          .map(
            (
              it,
              i,
            ) => `<div style="display:grid;grid-template-columns:52px 1fr;gap:14px;align-items:start">
          <div style="width:52px;height:52px;background:linear-gradient(135deg,#0097b2,#1e40af);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700">${i + 1}</div>
          <div style="background:#fff;padding:14px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.07)">
            <h4 style="color:#0097b2;margin-bottom:6px">${esc(it.title)}</h4>
            <p style="color:#4b5563;font-size:13px;line-height:1.5">${esc(it.content)}</p>
            ${it.image ? `<img src="${it.image}" style="max-width:100%;border-radius:6px;margin-top:8px">` : ""}
          </div></div>`,
          )
          .join("")}</div>`;

    case "image_right":
    case "image_left": {
      const it = items[0];
      const txt = `<div><h2 style="color:#0097b2;margin-bottom:10px">${esc(it.title)}</h2><p style="color:#4b5563;line-height:1.7">${esc(it.content)}</p></div>`;
      const img = imgOrPh(it.image);
      return `<div style="display:grid;grid-template-columns:${type === "image_right" ? "1.5fr 1fr" : "1fr 1.5fr"};gap:20px;align-items:start">${type === "image_right" ? txt + img : img + txt}</div>`;
    }

    case "image_overlay": {
      const it = items[0];
      return `<div style="position:relative;border-radius:10px;overflow:hidden">
        ${it.image ? `<img src="${it.image}" style="width:100%;height:280px;object-fit:cover">` : `<div style="height:280px;background:linear-gradient(135deg,#0097b2,#1e40af)"></div>`}
        <div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(to top,rgba(0,0,0,.8),transparent);padding:28px;color:#fff">
          <h2 style="margin-bottom:8px">${esc(it.title)}</h2><p style="font-size:14px;opacity:.9">${esc(it.content)}</p>
        </div></div>`;
    }

    case "imageblock": {
      const it = items[0];
      return `<div style="text-align:center">
        ${it.url ? `<img src="${it.url}" style="max-width:100%;border-radius:8px">` : `<div style="height:160px;background:#e5e7eb;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#9ca3af">No image</div>`}
        ${it.caption ? `<p style="margin-top:8px;font-size:13px;color:#6b7280;font-style:italic">${esc(it.caption)}</p>` : ""}</div>`;
    }

    case "exercise":
      return `<div style="display:flex;align-items:center;justify-content:center;min-height:100px;background:#f9fafb;border-radius:8px;border:2px dashed #e5e7eb">
        <p style="color:#9ca3af;font-weight:600">&#9999;&#65039; Exercise Component</p></div>`;

    default:
      return `<p style="color:#9ca3af;text-align:center;padding:32px">No preview available.</p>`;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// CONFIRM MODAL
// ════════════════════════════════════════════════════════════════════════════
function showConfirmModal(title, message, onConfirm) {
  document.getElementById("confirmTitle").textContent = title;
  document.getElementById("confirmMsg").textContent = message;
  document.getElementById("modalConfirm").classList.add("active");
  const old = document.getElementById("confirmBtn");
  const btn = old.cloneNode(true); // clone to remove previous handler
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
 * normalizeComp — converts any server or local component shape into the
 * consistent internal shape used throughout this file.
 *
 * Server may return:  component_id, format_type OR component_type OR type
 * Internal always:    id + component_id,  format_type + type
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
              // Convert image_data (base64) + mimetype → data: URL so the
              // preview <img> renders immediately without any extra work.
              // image_data is the raw base64 string the server returns.
              // After conversion we delete image_data/mimetype — we only
              // keep the data URL on the canonical image field (image / url).
              IMAGE_FIELDS.forEach((field) => {
                if (it.image_data && it.mimetype) {
                  // Build the data URL and store it on the correct field
                  item[field] = `data:${it.mimetype};base64,${it.image_data}`;
                  item[`_hasImage_${field}`] = true;
                } else if (
                  it[`has_${field}`] ||
                  (typeof it[field] === "string" && it[field])
                ) {
                  item[`_hasImage_${field}`] = true;
                }
              });
              // Clean up raw server fields — not needed in UI state
              delete item.image_data;
              delete item.mimetype;
              return item;
            })
        : [{ _localId: Date.now(), order_index: 0 }],
    _expanded: c._expanded != null ? c._expanded : false,
  });
}

/** Escape a string for safe HTML insertion. */
function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Flash the "Saved" indicator for 2 seconds. */
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
