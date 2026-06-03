import { FetchData, UpdateData, DeleteData, PostData } from "../api/crud.js";

// ── Helpers ───────────────────────────────────

const $ = (id) => document.getElementById(id);

function openModal(id) {
  $(id).classList.add("open");
}

function closeModal(id) {
  $(id).classList.remove("open");
}

let notifTimer;
function notify(msg) {
  const el = $("notif");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(notifTimer);
  notifTimer = setTimeout(() => el.classList.remove("show"), 2800);
}

function timeFormat(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function filterTable(tbodyId, query) {
  const q = query.toLowerCase();
  document.querySelectorAll(`#${tbodyId} tr`).forEach((row) => {
    const text = (row.dataset.search || row.textContent).toLowerCase();
    row.style.display = text.includes(q) ? "" : "none";
  });
}

function extractData(response, key = null) {
  if (!response.data) return null;
  const raw = response.data.data ?? response.data;
  return key ? raw[key] : raw;
}

// ── Render ────────────────────────────────────

async function renderAll() {
  await Promise.all([
    renderRequests(),
    renderSubs(),
    renderUsers(),
    renderPlans(),
    renderStats(),
  ]);
}

async function renderStats() {
  const [plansRes, requestsRes, subsRes, usersRes] = await Promise.all([
    FetchData("/allplans", true),
    FetchData("/allrequests", true),
    FetchData("/all-subscriptions", true),
    FetchData("/users-subscriptions", true),
  ]);

  const plans = plansRes.success ? (extractData(plansRes) ?? []) : [];
  const requests = requestsRes.success ? (extractData(requestsRes) ?? []) : [];
  const subs = subsRes.success ? (extractData(subsRes) ?? []) : [];
  const users = usersRes.success ? (extractData(usersRes) ?? []) : [];

  $("stat-plans").textContent = plans.length;
  $("stat-requests").textContent = requests.filter((r) => r.status === "pending").length;
  $("stat-active").textContent = subs.filter((s) => s.active).length;
  $("stat-users").textContent = users.length;
}

async function renderPlans() {
  const tbody = $("plans-tbody");
  const response = await FetchData("/allplans", true);

  if (!response.success) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty"><i class="fa-solid fa-box-open"></i>${response.userMessage}</div></td></tr>`;
    return;
  }

  const plans = extractData(response) ?? [];

  if (!plans.length) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty"><i class="fa-solid fa-box-open"></i>No plans yet. Click "New Plan" to create one.</div></td></tr>`;
    return;
  }

  tbody.innerHTML = plans
    .map(
      (p) => `
      <tr>
        <td class="mono">#${p.id}</td>
        <td><strong>${p.plan_name}</strong></td>
        <td class="mono">${p.price.toLocaleString()} RWF</td>
        <td class="mono">${p.duration_days}d</td>
        <td class="mono">${p.no_quizzes}</td>
        <td class="mono">${p.no_template_exams}</td>
        <td class="mono">${p.no_topic_quizzes}</td>
        <td style="text-align:right">
          <div class="row-actions">
            <button class="btn btn-secondary btn-icon" title="Edit" data-action="edit-plan" data-id="${p.id}"><i class="fa-solid fa-pen"></i></button>
            <button class="btn btn-danger btn-icon" title="Delete" data-action="delete-plan" data-id="${p.id}"><i class="fa-solid fa-trash"></i></button>
          </div>
        </td>
      </tr>`,
    )
    .join("");
}

async function renderRequests() {
  const tbody = $("requests-tbody");
  const response = await FetchData("/allrequests", true);

  if (!response.success) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty"><i class="fa-solid fa-inbox"></i>${response.userMessage}</div></td></tr>`;
    return;
  }

  const requests = extractData(response) ?? [];

  if (!requests.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty"><i class="fa-solid fa-inbox"></i>No requests found.</div></td></tr>`;
    return;
  }

  tbody.innerHTML = requests
    .map(
      (r) => `
      <tr data-search="${r.email} ${r.plan_name} ${r.status}">
        <td class="mono">#${r.id}</td>
        <td>${r.email}</td>
        <td><span class="badge badge-active">${r.plan_name}</span></td>
        <td class="mono">${timeFormat(r.request_date)}</td>
        <td><span class="badge badge-${r.status}">${r.status}</span></td>
        <td style="text-align:right">
          <div class="row-actions">
            ${
              r.status === "pending"
                ? `<button class="btn btn-success btn-sm" data-action="approve-request" data-id="${r.id}"><i class="fa-solid fa-check"></i> Approve</button>
                   <button class="btn btn-danger btn-sm"  data-action="reject-request"  data-id="${r.id}"><i class="fa-solid fa-xmark"></i> Reject</button>`
                : `<span style="font-size:0.75rem;color:var(--muted)">${r.status}</span>`
            }
          </div>
        </td>
      </tr>`,
    )
    .join("");
}

async function renderSubs() {
  const tbody = $("subs-tbody");
  const response = await FetchData("/all-subscriptions", true);

  if (!response.success) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty"><i class="fa-solid fa-circle-check"></i>${response.userMessage}</div></td></tr>`;
    return;
  }

  const subscriptions = extractData(response) ?? [];

  if (!subscriptions.length) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty"><i class="fa-solid fa-circle-check"></i>No subscriptions found.</div></td></tr>`;
    return;
  }

  tbody.innerHTML = subscriptions
    .map(
      (s) => `
      <tr data-search="${s.email} ${s.plan_name}">
        <td class="mono">#${s.id}</td>
        <td>${s.email}</td>
        <td><strong>${s.plan_name}</strong></td>
        <td class="mono">${timeFormat(s.start_date)}</td>
        <td class="mono">${timeFormat(s.expiry_date)}</td>
        <td><span class="badge badge-${s.active ? "active" : "inactive"}">${s.active ? "Active" : "Expired"}</span></td>
        <td class="mono">${s.remaining_quizzes + s.remaining_template_exams + s.remaining_topic_quizzes}</td>
        <td style="text-align:right">
          <button class="btn btn-secondary btn-sm" data-action="view-sub" data-id="${s.id}"><i class="fa-solid fa-eye"></i> Details</button>
        </td>
      </tr>`,
    )
    .join("");
}

async function renderUsers() {
  const tbody = $("users-tbody");
  const response = await FetchData("/users-subscriptions", true);

  if (!response.success) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty"><i class="fa-solid fa-users"></i>${response.userMessage}</div></td></tr>`;
    return;
  }

  const users = extractData(response) ?? [];

  tbody.innerHTML = users
    .map(
      (u) => `
      <tr data-search="${u.email}">
        <td class="mono">#${u.user_id}</td>
        <td>${u.email}</td>
        <td>${u.active ? `<span class="badge badge-active">${u.plan_name ?? "Active"}</span>` : '<span class="badge badge-inactive">None</span>'}</td>
        <td><span class="badge badge-${u.active ? "active" : "inactive"}">${u.active ? "Active" : "No Sub"}</span></td>
        <td style="text-align:right">
          <button class="btn btn-secondary btn-sm" data-action="view-history" data-id="${u.user_id}"><i class="fa-solid fa-clock-rotate-left"></i> History</button>
        </td>
      </tr>`,
    )
    .join("");
}

// ── Plans CRUD ────────────────────────────────

function openNewPlanModal() {
  $("plan-modal-title").textContent = "New Subscription Plan";
  $("plan-id").value = "";
  [
    "plan-name",
    "plan-price",
    "plan-duration",
    "plan-quizzes",
    "plan-templates",
    "plan-topic-quizzes",
    "plan-desc",
  ].forEach((id) => ($(id).value = ""));
  openModal("modal-plan");
}

async function openEditPlanModal(id) {
  const response = await FetchData(`/plans/${id}`, true);

  if (!response.success) {
    notify("Plan not found");
    return;
  }

  const p = extractData(response);
  if (!p || typeof p !== "object") {
    notify("Invalid plan data");
    return;
  }

  $("plan-modal-title").textContent = "Edit Plan";
  $("plan-id").value = p.id;
  $("plan-name").value = p.plan_name;
  $("plan-price").value = p.price;
  $("plan-duration").value = p.duration_days;
  $("plan-quizzes").value = p.no_quizzes;
  $("plan-templates").value = p.no_template_exams;
  $("plan-topic-quizzes").value = p.no_topic_quizzes;
  $("plan-desc").value = p.description;

  openModal("modal-plan");
}

async function savePlan() {
  const id = $("plan-id").value;
  const name = $("plan-name").value.trim();
  const price = parseInt($("plan-price").value);
  const duration = parseInt($("plan-duration").value);
  const quizzes = parseInt($("plan-quizzes").value);
  const templates = parseInt($("plan-templates").value);
  const topic_quizzes = parseInt($("plan-topic-quizzes").value);
  const description = $("plan-desc").value.trim();

  if (!name || isNaN(price) || isNaN(duration)) {
    notify("Fill in all required fields");
    return;
  }

  const payload = {
    name,
    price,
    duration,
    quizzes,
    templates,
    topic_quizzes,
    description,
  };

  if (id) {
    const response = await UpdateData(`/plans/${id}`, payload, true);
    notify(response.success ? "Plan updated ✓" : response.userMessage);
  } else {
    const response = await PostData("/plans", payload, true);
    notify(response.success ? "Plan created ✓" : response.userMessage);
  }

  closeModal("modal-plan");
  await renderAll();
}

async function deletePlan(id) {
  if (!confirm("Delete this plan?")) return;
  const response = await DeleteData(`/plans/${id}`, {}, true);
  notify(response.success ? "Plan deleted ✓" : response.userMessage);
  await renderAll();
}

// ── Requests ──────────────────────────────────

async function resolveRequest(id, action) {
  const endpoint =
    action === "approved" ? `/request/${id}/approve` : `/request/${id}/reject`;

  const response = await UpdateData(endpoint, {}, true);

  notify(
    response.success
      ? action === "approved"
        ? "Request approved — subscription created ✓"
        : "Request rejected ✓"
      : response.userMessage,
  );

  await renderAll();
}

// ── Subscription Detail ───────────────────────

async function showSubDetail(id) {
  const response = await FetchData(`/subscription/${id}`, true);

  if (!response.success) {
    notify(response.userMessage);
    return;
  }

  const s = extractData(response);
  if (!s || typeof s !== "object") {
    notify("Invalid subscription data");
    return;
  }

  $("sub-detail-content").innerHTML = `
    <div class="detail-grid">
      <div class="detail-item"><p class="detail-item-label">Sub ID</p><p class="detail-item-val">#${s.sub_id ?? s.id}</p></div>
      <div class="detail-item"><p class="detail-item-label">User</p><p class="detail-item-val">${s.user_email ?? s.email}</p></div>
      <div class="detail-item"><p class="detail-item-label">Plan</p><p class="detail-item-val">${s.plan_name}</p></div>
      <div class="detail-item"><p class="detail-item-label">Status</p><p class="detail-item-val">${s.active ? "🟢 Active" : "🔴 Expired"}</p></div>
      <div class="detail-item"><p class="detail-item-label">Start Date</p><p class="detail-item-val">${timeFormat(s.start_date)}</p></div>
      <div class="detail-item"><p class="detail-item-label">Expiry Date</p><p class="detail-item-val">${timeFormat(s.expiry_date)}</p></div>
    </div>
    <hr class="section-divider" />
    <div class="card-title">Remaining Quotas</div>
    <div class="detail-grid">
      <div class="detail-item"><p class="detail-item-label">Quizzes Left</p><p class="detail-item-val" style="color:var(--primary)">${s.remaining_quizzes}</p></div>
      <div class="detail-item"><p class="detail-item-label">Template Exams</p><p class="detail-item-val" style="color:var(--primary)">${s.remaining_template_exams}</p></div>
      <div class="detail-item"><p class="detail-item-label">Topic Quizzes</p><p class="detail-item-val" style="color:var(--primary)">${s.remaining_topic_quizzes}</p></div>
    </div>
    <div class="btn-row" style="margin-top:20px">
      <button
        class="btn ${s.active ? "btn-danger" : "btn-success"} btn-sm"
        data-action="${s.active ? "deactivate-sub" : "activate-sub"}"
        data-id="${s.sub_id ?? s.id}"
      >
        ${s.active ? "Deactivate" : "Activate"}
      </button>
    </div>`;

  openModal("modal-sub-detail");
}

async function toggleSubStatus(id, action) {
  const response = await UpdateData(
    `/subscription/${id}/status`,
    { action },
    true,
  );

  notify(
    response.success
      ? `Subscription ${action === "activate" ? "activated" : "deactivated"} ✓`
      : response.userMessage,
  );

  closeModal("modal-sub-detail");
  await renderAll();
}

// ── User History ──────────────────────────────

async function showUserHistory(userId) {
  const response = await FetchData(`/user/${userId}/history`, true);

  if (!response.success) {
    notify(response.userMessage);
    return;
  }

  const data = extractData(response);
  if (!data || typeof data !== "object") {
    notify("Invalid history data");
    return;
  }

  const userSubs = data.subscriptions ?? [];
  const userReqs = data.requests ?? [];

  $("history-modal-title").textContent = `History — User #${data.user_id}`;

  let html = `<div class="card-title">Subscriptions (${data.subscription_count ?? userSubs.length})</div>`;

  if (userSubs.length) {
    html += userSubs
      .map((s) => {
        const isExpired = new Date(s.expiry_date) < new Date();
        const statusLabel = s.active
          ? isExpired
            ? "Expired"
            : "Active"
          : "Deactivated";
        const badgeClass = s.active
          ? isExpired
            ? "expired"
            : "active"
          : "inactive";
        const dotColor =
          s.active && !isExpired ? "var(--success)" : "var(--muted)";

        return `
          <div class="history-item">
            <div class="history-dot" style="background:${dotColor}"></div>
            <div>
              <div class="history-label">
                ${s.plan_name} — <span class="badge badge-${badgeClass}" style="font-size:0.65rem">${statusLabel}</span>
              </div>
              <div class="history-meta">${timeFormat(s.start_date)} → ${timeFormat(s.expiry_date)}</div>
              <div class="history-meta" style="margin-top:4px;color:var(--primary)">
                Remaining: Q: ${s.remaining_quizzes} | E: ${s.remaining_template_exams} | T: ${s.remaining_topic_quizzes}
              </div>
              <div class="btn-row" style="margin-top:10px">
                <button
                  class="btn ${s.active ? "btn-danger" : "btn-success"} btn-xs"
                  data-action="${s.active ? "deactivate-sub" : "activate-sub"}"
                  data-id="${s.sub_id ?? s.id}"
                >
                  ${s.active ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          </div>`;
      })
      .join("");
  } else {
    html += '<div class="empty">No subscriptions</div>';
  }

  html += `<hr class="section-divider" /><div class="card-title">Requests (${data.request_count ?? userReqs.length})</div>`;

  if (userReqs.length) {
    html += userReqs
      .map((r) => {
        const dotColor =
          r.status === "approved"
            ? "var(--success)"
            : r.status === "rejected" || r.status === "canceled"
              ? "var(--danger)"
              : "var(--warning)";

        return `
          <div class="history-item">
            <div class="history-dot" style="background:${dotColor}"></div>
            <div>
              <div class="history-label">
                ${r.plan_name} — <span class="badge badge-${r.status}">${r.status}</span>
              </div>
              <div class="history-meta">Requested: ${timeFormat(r.request_date)}</div>
            </div>
          </div>`;
      })
      .join("");
  } else {
    html += '<div class="empty">No requests</div>';
  }

  $("user-history-content").innerHTML = html;
  openModal("modal-user-history");
}

// ══════════════════════════════════════════════
//  EVENT LISTENERS
// ══════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", () => {
  // ── Tab navigation ──
  document.querySelectorAll(".tab[data-tab]").forEach((tab) => {
    tab.addEventListener("click", () => {
      document
        .querySelectorAll(".tab")
        .forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".panel").forEach((p) => (p.hidden = true));
      tab.classList.add("active");
      document.getElementById("panel-" + tab.dataset.tab).hidden = false;
    });
  });

  // ── Plan modal open ──
  $("btn-new-plan").addEventListener("click", openNewPlanModal);

  // ── Plan save ──
  $("btn-save-plan").addEventListener("click", savePlan);

  // ── Close modals via data-close attribute ──
  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", () => closeModal(btn.dataset.close));
  });

  // ── Close modal by clicking overlay backdrop ──
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  // ── Delegated clicks for dynamic table buttons ──
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;
    const id = parseInt(btn.dataset.id);

    switch (action) {
      case "edit-plan":
        openEditPlanModal(id);
        break;
      case "delete-plan":
        deletePlan(id);
        break;
      case "approve-request":
        resolveRequest(id, "approved");
        break;
      case "reject-request":
        resolveRequest(id, "rejected");
        break;
      case "view-sub":
        showSubDetail(id);
        break;
      case "deactivate-sub":
        toggleSubStatus(id, "deactivate");
        break;
      case "activate-sub":
        toggleSubStatus(id, "activate");
        break;
      case "view-history":
        showUserHistory(id);
        break;
    }
  });

  // ── Search inputs ──
  $("search-requests").addEventListener("input", (e) =>
    filterTable("requests-tbody", e.target.value),
  );
  $("search-subs").addEventListener("input", (e) =>
    filterTable("subs-tbody", e.target.value),
  );
  $("search-users").addEventListener("input", (e) =>
    filterTable("users-tbody", e.target.value),
  );

  // ── Status filter for requests ──
  $("filter-status").addEventListener("change", (e) => {
    const status = e.target.value;
    document.querySelectorAll("#requests-tbody tr").forEach((row) => {
      row.style.display =
        !status || (row.dataset.search || "").includes(status) ? "" : "none";
    });
  });

  // ── Initial render ──
  renderAll();
});
