// ── Data Store ────────────────────────────────

// import { FetchData, UpdateData, DeleteData, PostData } from "../js/api/crud.js";

let plans = [
  {
    plan_id: 1,
    name: "Basic",
    price: 3000,
    duration: 30,
    quizzes: 20,
    templates: 5,
    topic_quizzes: 10,
    description: "Starter plan for beginners",
  },
  {
    plan_id: 2,
    name: "Pro",
    price: 8000,
    duration: 30,
    quizzes: 80,
    templates: 20,
    topic_quizzes: 40,
    description: "Full access for serious learners",
  },
  {
    plan_id: 3,
    name: "Elite",
    price: 15000,
    duration: 90,
    quizzes: 300,
    templates: 60,
    topic_quizzes: 120,
    description: "Best value for power users",
  },
];
let requests = [
  {
    request_id: 1,
    user_id: 101,
    user_email: "alice@example.com",
    plan_id: 1,
    plan_name: "Basic",
    subscription_requested: true,
    request_date: "2025-03-01",
    status: "pending",
  },
  {
    request_id: 2,
    user_id: 102,
    user_email: "bob@example.com",
    plan_id: 2,
    plan_name: "Pro",
    subscription_requested: true,
    request_date: "2025-03-03",
    status: "pending",
  },
  {
    request_id: 3,
    user_id: 103,
    user_email: "carol@example.com",
    plan_id: 3,
    plan_name: "Elite",
    subscription_requested: true,
    request_date: "2025-03-05",
    status: "approved",
  },
];
let subscriptions = [
  {
    sub_id: 1,
    user_id: 103,
    user_email: "carol@example.com",
    plan_id: 3,
    plan_name: "Elite",
    start_date: "2025-03-06",
    expiry_date: "2025-06-06",
    active: true,
    remaining_quizzes: 280,
    remaining_template_exams: 58,
    remaining_topic_quizzes: 115,
  },
  {
    sub_id: 2,
    user_id: 104,
    user_email: "dan@example.com",
    plan_id: 1,
    plan_name: "Basic",
    start_date: "2025-02-01",
    expiry_date: "2025-03-01",
    active: false,
    remaining_quizzes: 0,
    remaining_template_exams: 0,
    remaining_topic_quizzes: 0,
  },
];
let users = [
  { user_id: 101, email: "alice@example.com" },
  { user_id: 102, email: "bob@example.com" },
  { user_id: 103, email: "carol@example.com" },
  { user_id: 104, email: "dan@example.com" },
];
let nextPlanId = 4,
  nextSubId = 3;

// ══════════════════════════════════════════════
// 🧪 MOCK API SIMULATION (REPLACES BACKEND)
// 📍 LOCATION: Defined right below data store
// ══════════════════════════════════════════════

// Simulate delay (like real API)
const delay = (ms = 300) => new Promise(res => setTimeout(res, ms));

// ── FETCH ─────────────────────────────────────
async function FetchData(endpoint, auth = false) {
  await delay();

  try {
    // PLANS
    if (endpoint === "/allplans") {
      return {
        success: true,
        data: {
          plans: plans.map(p => ({
            id: p.plan_id,
            plan_name: p.name,
            price: p.price,
            duration_days: p.duration,
            no_quizzes: p.quizzes,
            no_template_exams: p.templates,
            no_topic_quizzes: p.topic_quizzes,
            description: p.description,
          }))
        }
      };
    }

    if (endpoint.startsWith("/plans/")) {
      const id = parseInt(endpoint.split("/")[2]);
      const p = plans.find(p => p.plan_id === id);

      return p
        ? { success: true, data: { plans: {
            id: p.plan_id,
            plan_name: p.name,
            price: p.price,
            duration_days: p.duration,
            no_quizzes: p.quizzes,
            no_template_exams: p.templates,
            no_topic_quizzes: p.topic_quizzes,
            description: p.description,
          }}}
        : { success: false };
    }

    // REQUESTS
    if (endpoint === "/allrequests") {
      return {
        success: true,
        data: {
          requests: requests.map(r => ({
            id: r.request_id,
            email: r.user_email,
            plan_name: r.plan_name,
            request_date: r.request_date,
            status: r.status
          }))
        }
      };
    }

    // SUBSCRIPTIONS
    if (endpoint === "/all-subscriptions") {
      return {
        success: true,
        data: {
          subscriptions: subscriptions.map(s => ({
            id: s.sub_id,
            email: s.user_email,
            plan_name: s.plan_name,
            start_date: s.start_date,
            expiry_date: s.expiry_date,
            active: s.active,
            remaining_quizzes: s.remaining_quizzes,
            remaining_template_exams: s.remaining_template_exams,
            remaining_topic_quizzes: s.remaining_topic_quizzes
          }))
        }
      };
    }

    if (endpoint.startsWith("/subscription/")) {
      const id = parseInt(endpoint.split("/")[2]);
      const s = subscriptions.find(s => s.sub_id === id);

      return {
        success: true,
        data: { subscription: s }
      };
    }

    // USERS
    if (endpoint === "/users-subscriptions") {
      return {
        success: true,
        data: {
          users: users.map(u => {
            const sub = subscriptions.find(s => s.user_id === u.user_id && s.active);
            return {
              user_id: u.user_id,
              email: u.email,
              status: !!sub,
              active: !!sub
            };
          })
        }
      };
    }

    // USER HISTORY
    if (endpoint.includes("/history")) {
      const userId = parseInt(endpoint.split("/")[2]);

      return {
        success: true,
        data: {
          user_id: userId,
          subscription_count: subscriptions.filter(s => s.user_id === userId).length,
          request_count: requests.filter(r => r.user_id === userId).length,
          subscriptions: subscriptions.filter(s => s.user_id === userId),
          requests: requests.filter(r => r.user_id === userId),
        }
      };
    }

    return { success: false };

  } catch (error) {
    return { success: false, error };
  }
}

// ── POST ──────────────────────────────────────
async function PostData(endpoint, payload, auth = false) {
  await delay();

  if (endpoint === "/plans") {
    plans.push({
      plan_id: nextPlanId++,
      ...payload
    });

    return { data: { status: true } };
  }

  return { data: { status: false } };
}

// ── UPDATE ────────────────────────────────────
async function UpdateData(endpoint, payload = {}, auth = false) {
  await delay();

  // UPDATE PLAN
  if (endpoint.startsWith("/plans/")) {
    const id = parseInt(endpoint.split("/")[2]);
    const index = plans.findIndex(p => p.plan_id === id);

    if (index !== -1) {
      plans[index] = { ...plans[index], ...payload };
      return { data: { status: true } };
    }
  }

  // APPROVE REQUEST
  if (endpoint.includes("/approve")) {
    const id = parseInt(endpoint.split("/")[2]);
    const req = requests.find(r => r.request_id === id);

    if (req) {
      req.status = "approved";

      const plan = plans.find(p => p.plan_id === req.plan_id);

      subscriptions.push({
        sub_id: nextSubId++,
        user_id: req.user_id,
        user_email: req.user_email,
        plan_id: plan.plan_id,
        plan_name: plan.name,
        start_date: new Date().toISOString(),
        expiry_date: new Date(Date.now() + plan.duration * 86400000).toISOString(),
        active: true,
        remaining_quizzes: plan.quizzes,
        remaining_template_exams: plan.templates,
        remaining_topic_quizzes: plan.topic_quizzes
      });

      return { success: true };
    }
  }

  // REJECT REQUEST
  if (endpoint.includes("/reject")) {
    const id = parseInt(endpoint.split("/")[2]);
    const req = requests.find(r => r.request_id === id);

    if (req) {
      req.status = "rejected";
      return { success: true };
    }
  }

  // ACTIVATE / DEACTIVATE SUB
  if (endpoint.includes("/status")) {
    const id = parseInt(endpoint.split("/")[2]);
    const sub = subscriptions.find(s => s.sub_id === id);

    if (sub) {
      sub.active = payload.action === "activate";
      return { success: true };
    }
  }

  return { success: false };
}

// ── DELETE ────────────────────────────────────
async function DeleteData(endpoint, auth = false) {
  await delay();

  if (endpoint.startsWith("/plans/")) {
    const id = parseInt(endpoint.split("/")[2]);
    plans = plans.filter(p => p.plan_id !== id);

    return { success: true };
  }

  return { success: false };
}

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

// ── Render ────────────────────────────────────
function renderAll() {
  renderStats();
  renderPlans();
  renderRequests();
  renderSubs();
  renderUsers();
}

function renderStats() {
  $("stat-plans").textContent = plans.length;
  $("stat-requests").textContent = requests.filter(
    (r) => r.status === "pending",
  ).length;
  $("stat-active").textContent = subscriptions.filter((s) => s.active).length;
  $("stat-users").textContent = users.length;
}

async function renderPlans() {
  const tbody = $("plans-tbody");
  const response = await FetchData("/allplans", true);
  console.log(response);
  if (response.success == false) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty">${response.error.message}.</td></tr>`;
    return;
  }
  const plans = response.data.plans;
  if (!plans.length) {
    tbody.innerHTML =
      '<tr><td colspan="8" class="empty">No plans yet.</td></tr>';
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
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-secondary btn-sm btn-icon" data-action="edit-plan" data-id="${p.id}">✏️</button>
          <button class="btn btn-danger btn-sm btn-icon"    data-action="delete-plan" data-id="${p.id}">🗑</button>
        </div>
      </td>
    </tr>`,
    )
    .join("");
}
function timeFormat(isoString) {
  const date = new Date(isoString);

  // Example: "March 28, 2026, 9:27 AM"
  const normalFormat = date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  return normalFormat;
}
async function renderRequests() {
  const tbody = $("requests-tbody");
  const response = await FetchData("/allrequests", true);
  console.log(response);
  const requests = response.data.requests;
  if (!requests.length) {
    tbody.innerHTML =
      '<tr><td colspan="7" class="empty">No requests.</td></tr>';
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
      <td>
        <div style="display:flex;gap:6px">
          ${
            r.status === "pending"
              ? `<button class="btn btn-success btn-sm" data-action="approve-request" data-id="${r.id}">Approve</button>
               <button class="btn btn-danger  btn-sm" data-action="reject-request"  data-id="${r.id}">Reject</button>`
              : `<span style="font-size:0.75rem;color:var(--text-muted)">${r.status}</span>`
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
  const subscriptions = response.data.subscriptions;
  if (!subscriptions.length) {
    tbody.innerHTML =
      '<tr><td colspan="8" class="empty">No subscriptions.</td></tr>';
    return;
  }

  tbody.innerHTML = subscriptions
    .map(
      (s) => `
    <tr data-search="${s.email} ${s.plan_name}">
      <td class="mono">#${s.id}</td>
      <td>${s.email}</td>
      <td><span class="badge badge-active">${s.plan_name}</span></td>
      <td class="mono">${timeFormat(s.start_date)}</td>
      <td class="mono">${timeFormat(s.expiry_date)}</td>
      <td><span class="badge badge-${s.active ? "active" : "inactive"}">${s.active ? "Active" : "Expired"}</span></td>
      <td class="mono">${s.remaining_quizzes + s.remaining_template_exams + s.remaining_topic_quizzes}</td>
      <td><button class="btn btn-secondary btn-sm" data-action="view-sub" data-id="${s.id}">Details</button></td>
    </tr>`,
    )
    .join("");
}

async function renderUsers() {
  const tbody = $("users-tbody");
  const response = await FetchData("/users-subscriptions", true);

  const users = response.data.users;

  tbody.innerHTML = users
    .map((u) => {
      return `
      <tr data-search="${u.email}">
        <td class="mono">#${u.user_id}</td>
        <td>${u.email}</td>
        <td>${u.status ? `<span class="badge badge-active">hellospan>` : '<span class="badge badge-inactive">None</span>'}</td>
        <td><span class="badge badge-${u.active ? "active" : "inactive"}">${u.active ? "Active" : "No Sub"}</span></td>
        <td><button class="btn btn-secondary btn-sm" data-action="view-history" data-id="${u.user_id}">History</button></td>
      </tr>`;
    })
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
    alert("Plan not found");
    return;
  }
  const p = response.data.plans;
  console.log("the id:", "the=", p);
  if (!p) return;

  document.getElementById("plan-modal-title").textContent = "Edit Plan";
  document.getElementById("plan-id").value = p.id;
  document.getElementById("plan-name").value = p.plan_name;
  document.getElementById("plan-price").value = p.price;
  document.getElementById("plan-duration").value = p.duration_days;
  document.getElementById("plan-quizzes").value = p.no_quizzes;
  document.getElementById("plan-templates").value = p.no_template_exams;
  document.getElementById("plan-topic-quizzes").value = p.no_topic_quizzes;
  document.getElementById("plan-desc").value = p.description;

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

  if (id) {
    const idx = plans.findIndex((p) => p.plan_id === parseInt(id));
    plans[idx] = {
      plan_id: parseInt(id),
      name,
      price,
      duration,
      quizzes,
      templates,
      topic_quizzes,
      description,
    };
    const subscription = {
      plan_id: parseInt(id),
      name,
      price,
      duration,
      quizzes,
      templates,
      topic_quizzes,
      description,
    };

    const response = await UpdateData(`/plans/${id}`, subscription, true);

    if (response.data.status) {
      notify("Plan updated ✓");
    } else {
      notify("Plan update failed");
    }
  } else {
    const subscription = {
      name,
      price,
      duration,
      quizzes,
      templates,
      topic_quizzes,
      description,
    };
    const response = await PostData(`/plans`, subscription, true);

    if (response.data.status) {
      notify("Plan created ✓");
    } else {
      notify("Plan created failed");
    }
  }
  closeModal("modal-plan");
  renderAll();
}

function deletePlan(id) {
  if (!confirm("Delete this plan?")) return;
  plans = plans.filter((p) => p.plan_id !== id);
  renderAll();
  notify("Plan deleted");
}

// ── Requests ──────────────────────────────────
async function resolveRequest(id, action) {
  console.log("action", action);
  if (action === "approved") {
    const response = await UpdateData(`/request/${id}/approve`);
    console.log(response);
    if (response.success) {
      notify("Request approved — subscription created ✓");
    } else {
      notify("Request approval failed");
    }
  } else {
    const response = await UpdateData(`/request/${id}/reject`);
    if (response.success) {
      notify("Request rejection successfully");
    } else {
      notify("Request rejection failed");
    }
  }
  renderAll();
}

// ── Subscription Detail ───────────────────────
async function showSubDetail(id) {
  const response = await FetchData(`/subscription/${id}`);
  console.log(response);
  const s = response.data.subscription;
  console.log(s);

  $("sub-detail-content").innerHTML = `
    <div class="detail-grid">
      <div class="detail-item"><div class="detail-item-label">Sub ID</div><div class="detail-item-val">#${s.id}</div></div>
      <div class="detail-item"><div class="detail-item-label">User</div><div class="detail-item-val">${s.email}</div></div>
      <div class="detail-item"><div class="detail-item-label">Plan</div><div class="detail-item-val">${s.plan_name}</div></div>
      <div class="detail-item"><div class="detail-item-label">Status</div><div class="detail-item-val">${s.active ? "🟢 Active" : "🔴 Expired"}</div></div>
      <div class="detail-item"><div class="detail-item-label">Start Date</div><div class="detail-item-val">${timeFormat(s.start_date)}</div></div>
      <div class="detail-item"><div class="detail-item-label">Expiry Date</div><div class="detail-item-val">${timeFormat(s.expiry_date)}</div></div>
    </div>
    <div class="section-divider"></div>
    <div class="card-title">Remaining Quotas</div>
    <div class="detail-grid">
      <div class="detail-item"><div class="detail-item-label">Quizzes Left</div><div class="detail-item-val" style="color:var(--cyan-dark)">${s.remaining_quizzes} / ${s.plan_no_quizzes ?? "—"}</div></div>
      <div class="detail-item"><div class="detail-item-label">Template Exams</div><div class="detail-item-val" style="color:var(--cyan-dark)">${s.remaining_template_exams} / ${s.plan_no_template_exams ?? "—"}</div></div>
      <div class="detail-item"><div class="detail-item-label">Topic Quizzes</div><div class="detail-item-val" style="color:var(--cyan-dark)">${s.remaining_topic_quizzes} / ${s.plan_no_topic_quizzes ?? "—"}</div></div>
    </div>
    <div class="btn-row" style="margin-top:20px">
  <button 
    class="btn ${s.active ? "btn-danger" : "btn-success"} btn-sm" 
    data-action="${s.active ? "deactivate-sub" : "activate-sub"}" 
    data-id="${s.id}"
  >
    ${s.active ? "Deactivate" : "Activate"}
  </button>
</div>`;
  openModal("modal-sub-detail");
}

async function deactivateSub(id,action) {
  console.log(id);
  const response = await UpdateData(
    `/subscription/${id}/status`,
    { action: action },
    true,
  );
  if (response.success == false) {
    if (action == "deactivate") {
      notify("Subscription not  deactivated");
    }
    else {
      notify("Subscription not  activated");
    }
    closeModal("modal-sub-detail");
    return;
  }
  if (action == "activate") {
      notify("Subscription activated successfully");
  }
  else {
       notify("Subscription deactivated successfully");
  }
  closeModal("modal-sub-detail");
  renderAll();
  
}

// ── User History ──────────────────────────────
async function showUserHistory(userId) {
  const response = await FetchData(`/user/${userId}/history`, true);
  console.log("History Data: ", response);

  if (!response.success) {
    notify("Failed to load user history");
    return;
  }

  const data = response.data;
  const userSubs = data.subscriptions || [];
  const userReqs = data.requests || [];

  $("history-modal-title").textContent = `History — #${data.user_id}`;

  // 1. Render Subscriptions Section
  let html = `<div class="card-title">Subscriptions (${data.subscription_count})</div>`;

  if (userSubs.length > 0) {
    html += userSubs
      .map((s) => {
        // Determine status based on the 'active' boolean and expiry date
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

        return `
        <div class="history-item">
          <div class="history-dot" style="background: ${s.active && !isExpired ? "var(--success)" : "var(--text-muted)"}"></div>
          <div>
            <div class="history-label">
              ${s.plan_name} — 
              <span class="badge badge-${badgeClass}" style="font-size:0.65rem">${statusLabel}</span>
            </div>
            <div class="history-meta">
              ${timeFormat(s.start_date)} → ${timeFormat(s.expiry_date)}
            </div>
            <div class="history-meta" style="margin-top:4px; color: var(--cyan-dark)">
              Remaining: Q: ${s.remaining_quizzes} | E: ${s.remaining_template_exams} | T: ${s.remaining_topic_quizzes}
            </div>
            <div class="btn-row" style="margin-top:10px">
              <button 
                class="btn ${s.active ? "btn-danger" : "btn-success"} btn-xs" 
                data-action="${s.active ? "deactivate-sub" : "activate-sub"}" 
                data-id="${s.id}"
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

  // 2. Render Requests Section
  html += `<div class="section-divider"></div><div class="card-title">Requests (${data.request_count})</div>`;

  if (userReqs.length > 0) {
    html += userReqs
      .map((r) => {
        // Color coding for request dots
        let dotColor = "var(--warn)"; // pending/default
        if (r.status === "approved") dotColor = "var(--success)";
        if (r.status === "rejected" || r.status === "canceled")
          dotColor = "var(--danger)";

        return `
        <div class="history-item">
          <div class="history-dot" style="background:${dotColor}"></div>
          <div>
            <div class="history-label">
              ${r.plan_name} — 
              <span class="badge badge-${r.status}">${r.status}</span>
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

  // Attach listeners for the toggle buttons inside the history modal
  $("user-history-content")
    .querySelectorAll("button[data-action]")
    .forEach((btn) => {
      btn.onclick = () => {
        const action = btn.dataset.action;
        const subId = btn.dataset.id;
        // You would call your toggle function here, e.g.:
        // toggleSubscriptionStatus(subId, action);
        console.log(`${action} subscription ${subId}`);
      };
    });

  openModal("modal-user-history");
}

// ── Search & Filter ───────────────────────────
function filterTable(tbodyId, query) {
  const q = query.toLowerCase();
  document.querySelectorAll(`#${tbodyId} tr`).forEach((row) => {
    const text = (row.dataset.search || row.textContent).toLowerCase();
    row.style.display = text.includes(q) ? "" : "none";
  });
}

// ══════════════════════════════════════════════
//  EVENT LISTENERS
// ══════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
  // ── Sidebar navigation ──
  document.querySelectorAll(".nav-item[data-view]").forEach((item) => {
    item.addEventListener("click", () => {
      document
        .querySelectorAll(".view")
        .forEach((v) => v.classList.remove("active"));
      document
        .querySelectorAll(".nav-item")
        .forEach((n) => n.classList.remove("active"));
      document
        .getElementById("view-" + item.dataset.view)
        .classList.add("active");
      item.classList.add("active");
      renderAll();
    });
  });

  // ── Open new plan modal ──
  $("btn-new-plan").addEventListener("click", openNewPlanModal);

  // ── Save plan ──
  $("btn-save-plan").addEventListener("click", savePlan);

  // ── Close modals via data-close buttons ──
  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", () => closeModal(btn.dataset.close));
  });

  // ── Close modals by clicking overlay backdrop ──
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  // ── Delegated clicks for dynamically rendered table buttons ──
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
        deactivateSub(id, "deactivate");
        break;
      case "activate-sub":
        deactivateSub(id, "activate");
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

  // ── Status filter ──
  $("filter-status").addEventListener("change", (e) => {
    const status = e.target.value;
    document.querySelectorAll("#requests-tbody tr").forEach((row) => {
      if (!status) {
        row.style.display = "";
        return;
      }
      row.style.display = (row.dataset.search || "").includes(status)
        ? ""
        : "none";
    });
  });

  // ── Init ──
  renderAll();
});
