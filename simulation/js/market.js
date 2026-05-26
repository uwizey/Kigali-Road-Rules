// // import { FetchData, PostData, UpdateData } from "./api/crud.js"; // ← uncomment when real API is ready

// // ── Simulated API (remove this block when real API is ready) ──────────────────

// const _state = {
//   subscription: {
//     plan_name: "Pro Plan",
//     expiry_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
//     active: true,
//     remaining_quizzes: 18,
//     remaining_template_exams: 5,
//     remaining_topic_quizzes: 12,
//   },
//   plans: [
//     { id: "plan_basic", plan_name: "Basic", price: 5000, no_quizzes: 10, no_template_exams: 2, duration_days: 30 },
//     { id: "plan_pro", plan_name: "Pro", price: 12000, no_quizzes: 30, no_template_exams: 8, duration_days: 60 },
//     { id: "plan_elite", plan_name: "Elite", price: 25000, no_quizzes: 100, no_template_exams: 20, duration_days: 90 },
//   ],
//   requests: [
//     { id: "req_001", plan_name: "Basic", plan_id: "plan_basic", status: "approved", request_date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString() },
//     { id: "req_002", plan_name: "Pro", plan_id: "plan_pro", status: "rejected", request_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
//   ],
//   nextRequestId: 3,
// };

// const _delay = (ms = 400) => new Promise((res) => setTimeout(res, ms));

// async function FetchData(endpoint) {
//   await _delay(350);
//   if (endpoint === "/my-subscription")
//     return _state.subscription
//       ? { success: true, data: { subscription: _state.subscription } }
//       : { success: false, status: 404, error: { message: "No subscription found" } };
//   if (endpoint === "/allplans")
//     return { success: true, data: { plans: _state.plans } };
//   if (endpoint === "/myrequests")
//     return { success: true, data: { requests: [..._state.requests].reverse() } };
//   return { success: false, status: 404, error: { message: `Unknown endpoint: ${endpoint}` } };
// }

// async function PostData(endpoint, body = {}) {
//   await _delay(500);
//   if (endpoint === "/request") {
//     if (_state.requests.some((r) => r.status === "pending"))
//       return { success: false, error: { message: "You already have a pending request." } };
//     const plan = _state.plans.find((p) => p.id === body.plan_id);
//     if (!plan) return { success: false, error: { message: "Plan not found." } };
//     const req = { id: `req_00${_state.nextRequestId++}`, plan_name: plan.plan_name, plan_id: plan.id, status: "pending", request_date: new Date().toISOString() };
//     _state.requests.push(req);
//     return { success: true, data: { request: req } };
//   }
//   return { success: false, status: 404, error: { message: `Unknown endpoint: ${endpoint}` } };
// }

// async function UpdateData(endpoint, body = {}) {
//   await _delay(500);
//   const match = endpoint.match(/^\/request\/(.+)\/cancel$/);
//   if (match) {
//     const req = _state.requests.find((r) => r.id === match[1]);
//     if (!req) return { success: false, error: { message: "Request not found." } };
//     if (req.status !== "pending") return { success: false, error: { message: "Only pending requests can be cancelled." } };
//     req.status = "cancelled";
//     return { success: true, data: { request: req } };
//   }
//   return { success: false, status: 404, error: { message: `Unknown endpoint: ${endpoint}` } };
// }

// // ── End of simulated API ──────────────────────────────────────────────────────

// // ── Helpers ───────────────────────────────────────────────────────────────────

// function timeFormat(isoString) {
//   const date = new Date(isoString);
//   return date.toLocaleString("en-US", {
//     year: "numeric", month: "long", day: "numeric",
//     hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true,
//   });
// }

// function showEmpty(elementId, message) {
//   const el = document.getElementById(elementId);
//   if (el) el.innerHTML = `<div class="empty-notice">${message}</div>`;
// }

// // ── Safe data fetchers ────────────────────────────────────────────────────────

// async function fetchSubscription() {
//   try {
//     const res = await FetchData("/my-subscription", true);
//     if (res.success) return res.data.subscription;
//     if (res.status === 404) return null;
//     console.warn("fetchSubscription:", res.error?.message);
//     return null;
//   } catch (err) {
//     console.error("fetchSubscription network error:", err);
//     return null;
//   }
// }

// async function fetchPlans() {
//   try {
//     const res = await FetchData("/allplans", true);
//     if (res.success) return res.data.plans ?? [];
//     console.warn("fetchPlans:", res.error?.message);
//     return [];
//   } catch (err) {
//     console.error("fetchPlans network error:", err);
//     return [];
//   }
// }

// async function fetchRequestHistory() {
//   try {
//     const res = await FetchData("/myrequests", true);
//     if (res.success) return res.data.requests ?? [];
//     if (res.status === 404) return [];
//     console.warn("fetchRequestHistory:", res.error?.message);
//     return [];
//   } catch (err) {
//     console.error("fetchRequestHistory network error:", err);
//     return [];
//   }
// }

// // ── Section renderers ─────────────────────────────────────────────────────────

// function renderCurrentSubscription(subscription) {
//   if (!subscription) {
//     showEmpty("active-sub-container", "You don't have an active subscription.");
//     return;
//   }

//   const isExpired = new Date(subscription.expiry_date) < new Date();
//   const isActive = subscription.active;

//   let label = "Active";
//   let badgeClass = "badge-active";
//   if (!isActive) { label = "Deactivated"; badgeClass = "badge-rejected"; }
//   else if (isExpired) { label = "Expired"; badgeClass = "badge-expired"; }

//   const el = document.getElementById("active-sub-container");
//   if (!el) return;

//   el.innerHTML = `
//     <div class="status-card" style="${!isActive ? "opacity:0.7;border-style:dashed;" : ""}">
//       <div class="status-header">
//         <div>
//           <div class="plan-name">${subscription.plan_name}</div>
//           <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">
//             Expires: ${timeFormat(subscription.expiry_date)}
//           </div>
//         </div>
//         <span class="badge ${badgeClass}">${label}</span>
//       </div>
//       <div class="quota-grid">
//         <div class="quota-item">
//           <div class="quota-val">${subscription.remaining_quizzes}</div>
//           <div class="quota-lab">Quizzes</div>
//         </div>
//         <div class="quota-item">
//           <div class="quota-val">${subscription.remaining_template_exams}</div>
//           <div class="quota-lab">Exams</div>
//         </div>
//         <div class="quota-item">
//           <div class="quota-val">${subscription.remaining_topic_quizzes}</div>
//           <div class="quota-lab">Topics</div>
//         </div>
//       </div>
//       ${!isActive ? `<div style="color:var(--danger);font-size:0.7rem;font-weight:700;margin-top:10px;text-transform:uppercase;">This subscription has been manually disabled</div>` : ""}
//     </div>`;
// }

// function renderPendingAlert(pendingRequest) {
//   const el = document.getElementById("pending-alert-box");
//   if (!el) return;
//   el.innerHTML = pendingRequest
//     ? `<div class="alert-pending">
//         <span>⏳</span>
//         <div><strong>Request Pending:</strong> You've requested <b>${pendingRequest.plan_name}</b>. It will be reviewed shortly.</div>
//        </div>`
//     : "";
// }

// function renderPlans(plans, pendingRequest) {
//   const el = document.getElementById("plans-container");
//   if (!el) return;

//   if (!plans.length) { showEmpty("plans-container", "No plans are available at the moment."); return; }

//   const isLocked = pendingRequest !== null;

//   el.innerHTML = plans.map((plan) => `
//     <div class="plan-card">
//       <div class="plan-name">${plan.plan_name}</div>
//       <div class="plan-price">${Number(plan.price).toLocaleString()}<span> RWF</span></div>
//       <ul class="plan-features">
//         <li>${plan.no_quizzes} Quizzes</li>
//         <li>${plan.no_template_exams} Exams</li>
//         <li>${plan.duration_days} Days</li>
//       </ul>
//       <button
//         class="btn ${isLocked ? "btn-disabled" : "btn-primary"}"
//         ${isLocked ? "disabled" : ""}
//         data-action="request-plan"
//         data-id="${plan.id}"
//         data-name="${plan.plan_name}">
//         ${isLocked ? "Wait for Approval" : "Request Purchase"}
//       </button>
//     </div>`).join("");
// }

// function renderRequestHistory(requests) {
//   const el = document.getElementById("history-list");
//   if (!el) return;

//   if (!requests.length) { showEmpty("history-list", "No subscription requests yet."); return; }

//   el.innerHTML = "";

//   requests.forEach((item) => {
//     const historyItem = document.createElement("div");
//     historyItem.className = "history-item";

//     const dateDiv = document.createElement("div");
//     dateDiv.className = "history-date";
//     dateDiv.textContent = timeFormat(item.request_date);

//     const infoDiv = document.createElement("div");
//     infoDiv.className = "history-info";
//     infoDiv.innerHTML = `${item.plan_name} Plan <span class="badge badge-${item.status}">${item.status}</span>`;

//     historyItem.appendChild(dateDiv);
//     historyItem.appendChild(infoDiv);

//     if (item.status === "pending") {
//       const cancelBtn = document.createElement("button");
//       cancelBtn.className = "btn-cancel";
//       cancelBtn.textContent = "Cancel Request";
//       cancelBtn.dataset.action = "cancel-request";
//       cancelBtn.dataset.id = item.id;
//       historyItem.appendChild(cancelBtn);
//     }

//     el.appendChild(historyItem);
//   });
// }

// // ── Actions ───────────────────────────────────────────────────────────────────

// async function handlePurchaseRequest(planId, planName) {
//   try {
//     const response = await PostData("/request", { plan_id: planId }, true);
//     if (response.success) {
//       alert(`Your request for "${planName}" has been sent successfully.`);
//     } else {
//       alert(response.error?.message ?? "Failed to send request. Please try again.");
//     }
//   } catch (err) {
//     console.error("handlePurchaseRequest error:", err);
//     alert("Network error. Please check your connection and try again.");
//   } finally {
//     renderDashboard();
//   }
// }

// async function cancelRequest(id) {
//   try {
//     const response = await UpdateData(`/request/${id}/cancel`, { id }, true);
//     if (response.success) {
//       alert("Request cancelled successfully.");
//     } else {
//       alert(response.error?.message ?? "Cancellation failed. Please try again.");
//     }
//   } catch (err) {
//     console.error("cancelRequest error:", err);
//     alert("Network error. Please check your connection and try again.");
//   } finally {
//     renderDashboard();
//   }
// }

// // ── Orchestrator ──────────────────────────────────────────────────────────────

// async function renderDashboard() {
//   const [subscription, plans, requestHistory] = await Promise.all([
//     fetchSubscription(),
//     fetchPlans(),
//     fetchRequestHistory(),
//   ]);

//   const pendingRequest = requestHistory.find((r) => r.status === "pending") ?? null;

//   renderCurrentSubscription(subscription);
//   renderPendingAlert(pendingRequest);
//   renderPlans(plans, pendingRequest);
//   renderRequestHistory(requestHistory);
// }

// // ── Event listeners ───────────────────────────────────────────────────────────

// document.addEventListener("DOMContentLoaded", () => {
//   renderDashboard();

//   document.addEventListener("click", (e) => {
//     const btn = e.target.closest("[data-action]");
//     if (!btn) return;

//     const action = btn.dataset.action;
//     const id = btn.dataset.id;
//     const name = btn.dataset.name;

//     if (action === "request-plan") handlePurchaseRequest(id, name);
//     if (action === "cancel-request") cancelRequest(id);
//   });
// });

// import { FetchData, PostData, UpdateData } from "./api/crud.js"; // ← uncomment when real API is ready

// ── Simulated API (remove this block when real API is ready) ──────────────────

const _state = {
  subscription: {
    plan_name: "Pro Plan",
    expiry_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    active: true,
    remaining_quizzes: 18,
    remaining_template_exams: 5,
    remaining_topic_quizzes: 12,
  },
  plans: [
    { id: "plan_basic", plan_name: "Basic", price: 5000, no_quizzes: 10, no_template_exams: 2, duration_days: 30 },
    { id: "plan_pro",   plan_name: "Pro",   price: 12000, no_quizzes: 30, no_template_exams: 8, duration_days: 60 },
    { id: "plan_elite", plan_name: "Elite", price: 25000, no_quizzes: 100, no_template_exams: 20, duration_days: 90 },
  ],
  requests: [
    { id: "req_001", plan_name: "Basic", plan_id: "plan_basic", status: "approved",  request_date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString() },
    { id: "req_002", plan_name: "Pro",   plan_id: "plan_pro",   status: "rejected", request_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
  ],
  nextRequestId: 3,
};

const _delay = (ms = 400) => new Promise((res) => setTimeout(res, ms));

async function FetchData(endpoint) {
  await _delay(350);
  if (endpoint === "/my-subscription")
    return _state.subscription
      ? { success: true, data: { subscription: _state.subscription } }
      : { success: false, status: 404, error: { message: "No subscription found" } };
  if (endpoint === "/allplans")
    return { success: true, data: { plans: _state.plans } };
  if (endpoint === "/myrequests")
    return { success: true, data: { requests: [..._state.requests].reverse() } };
  return { success: false, status: 404, error: { message: `Unknown endpoint: ${endpoint}` } };
}

async function PostData(endpoint, body = {}) {
  await _delay(500);
  if (endpoint === "/request") {
    if (_state.requests.some((r) => r.status === "pending"))
      return { success: false, error: { message: "You already have a pending request." } };
    const plan = _state.plans.find((p) => p.id === body.plan_id);
    if (!plan) return { success: false, error: { message: "Plan not found." } };
    const req = { id: `req_00${_state.nextRequestId++}`, plan_name: plan.plan_name, plan_id: plan.id, status: "pending", request_date: new Date().toISOString() };
    _state.requests.push(req);
    return { success: true, data: { request: req } };
  }
  return { success: false, status: 404, error: { message: `Unknown endpoint: ${endpoint}` } };
}

async function UpdateData(endpoint, body = {}) {
  await _delay(500);
  const match = endpoint.match(/^\/request\/(.+)\/cancel$/);
  if (match) {
    const req = _state.requests.find((r) => r.id === match[1]);
    if (!req) return { success: false, error: { message: "Request not found." } };
    if (req.status !== "pending") return { success: false, error: { message: "Only pending requests can be cancelled." } };
    req.status = "cancelled";
    return { success: true, data: { request: req } };
  }
  return { success: false, status: 404, error: { message: `Unknown endpoint: ${endpoint}` } };
}

// ── End of simulated API ──────────────────────────────────────────────────────

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeFormat(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString("en-US", {
    year: "numeric", month: "long", day: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

function shortDate(isoString) {
  return new Date(isoString).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

function spinner(msg = "Loading…") {
  return `<div class="spinner-wrap"><div class="spinner"></div> ${msg}</div>`;
}

function showEmpty(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) el.innerHTML = `<div class="empty-notice">${message}</div>`;
}

// ── Safe data fetchers ────────────────────────────────────────────────────────

async function fetchSubscription() {
  try {
    const res = await FetchData("/my-subscription");
    if (res.success) return res.data.subscription;
    if (res.status === 404) return null;
    console.warn("fetchSubscription:", res.error?.message);
    return null;
  } catch (err) {
    console.error("fetchSubscription network error:", err);
    return null;
  }
}

async function fetchPlans() {
  try {
    const res = await FetchData("/allplans");
    if (res.success) return res.data.plans ?? [];
    console.warn("fetchPlans:", res.error?.message);
    return [];
  } catch (err) {
    console.error("fetchPlans network error:", err);
    return [];
  }
}

async function fetchRequestHistory() {
  try {
    const res = await FetchData("/myrequests");
    if (res.success) return res.data.requests ?? [];
    if (res.status === 404) return [];
    console.warn("fetchRequestHistory:", res.error?.message);
    return [];
  } catch (err) {
    console.error("fetchRequestHistory network error:", err);
    return [];
  }
}

// ── Section renderers ─────────────────────────────────────────────────────────

function renderCurrentSubscription(subscription) {
  const el = document.getElementById("active-sub-container");
  const featCard = document.getElementById("features-card");
  if (!el) return;

  if (!subscription) {
    el.innerHTML = `
      <div class="card">
        <div class="empty-notice">
          <i class="fa-regular fa-circle-xmark" style="font-size:24px;color:var(--muted);display:block;margin-bottom:8px;"></i>
          You don't have an active subscription.
        </div>
      </div>`;
    if (featCard) featCard.hidden = true;
    return;
  }

  const isExpired = new Date(subscription.expiry_date) < new Date();
  const isActive  = subscription.active;

  let label      = "Active";
  let badgeClass = "badge-active";
  let subText    = "Your subscription is active";
  if (!isActive)      { label = "Deactivated"; badgeClass = "badge-rejected"; subText = "Manually disabled"; }
  else if (isExpired) { label = "Expired";     badgeClass = "badge-expired";  subText = "Subscription has expired"; }

  el.innerHTML = `
    <article class="card" style="${!isActive ? "opacity:0.8;" : ""}">
      <div class="plan-header">
        <div class="plan-header-top">
          <div>
            <span class="plan-chip"><i class="fa-solid fa-crown"></i> ${subscription.plan_name}</span>
            <p class="plan-price" style="font-size:18px;margin-top:6px;">${subText}</p>
            <p class="plan-sub">Expires: ${timeFormat(subscription.expiry_date)}</p>
          </div>
          <span class="badge ${badgeClass}">${label}</span>
        </div>
      </div>
      <div class="quota-grid">
        <div class="quota-item">
          <div class="quota-val">${subscription.remaining_quizzes}</div>
          <div class="quota-lab">Quizzes</div>
        </div>
        <div class="quota-item">
          <div class="quota-val">${subscription.remaining_template_exams}</div>
          <div class="quota-lab">Exams</div>
        </div>
        <div class="quota-item">
          <div class="quota-val">${subscription.remaining_topic_quizzes}</div>
          <div class="quota-lab">Topics</div>
        </div>
      </div>
      ${!isActive ? `<div style="padding:12px 20px;color:var(--danger);font-size:11px;font-weight:700;text-transform:uppercase;border-top:1px solid var(--border);">This subscription has been manually disabled</div>` : ""}
    </article>`;

  // Populate features sidebar
  if (featCard) {
    featCard.hidden = false;
    const features = [
      `${subscription.remaining_quizzes} quizzes remaining`,
      `${subscription.remaining_template_exams} template exams remaining`,
      `${subscription.remaining_topic_quizzes} topic quizzes remaining`,
      "Access to all study materials",
      "Performance analytics",
    ];
    document.getElementById("features-list").innerHTML = features
      .map(f => `<li><span class="check"><i class="fa-solid fa-check"></i></span><span>${f}</span></li>`)
      .join("");
  }
}

function renderPendingAlert(pendingRequest) {
  const el = document.getElementById("pending-alert-box");
  if (!el) return;
  el.innerHTML = pendingRequest
    ? `<div class="alert-pending">
        <span>⏳</span>
        <div><strong>Request Pending:</strong> You've requested the <b>${pendingRequest.plan_name}</b> plan. It will be reviewed shortly.</div>
       </div>`
    : "";
}

function renderPlans(plans, pendingRequest) {
  const el = document.getElementById("plans-container");
  if (!el) return;

  if (!plans.length) {
    el.innerHTML = `<div class="empty-notice" style="grid-column:1/-1">No plans are available at the moment.</div>`;
    return;
  }

  const isLocked = pendingRequest !== null;

  el.innerHTML = plans.map((plan) => `
    <div class="plan-card ${isLocked ? "locked" : ""}">
      <div class="plan-card-head">
        <div class="plan-name">${plan.plan_name}</div>
      </div>
      <p class="desc">${plan.duration_days}-day access plan</p>
      <p class="plan-price">${Number(plan.price).toLocaleString()} <span>RWF</span></p>
      <ul class="plan-features">
        <li>${plan.no_quizzes} Quizzes</li>
        <li>${plan.no_template_exams} Template Exams</li>
        <li>${plan.duration_days} Days duration</li>
      </ul>
      <button
        class="btn ${isLocked ? "btn-disabled" : "btn-primary"}"
        ${isLocked ? "disabled" : ""}
        data-action="request-plan"
        data-id="${plan.id}"
        data-name="${plan.plan_name}">
        ${isLocked
          ? `<i class="fa-solid fa-clock"></i> Awaiting Approval`
          : `<i class="fa-solid fa-paper-plane"></i> Request Purchase`}
      </button>
    </div>`).join("");
}

function renderRequestHistory(requests) {
  const el = document.getElementById("history-list");
  if (!el) return;

  if (!requests.length) {
    el.innerHTML = `<tr><td colspan="5"><div class="empty-notice">No subscription requests yet.</div></td></tr>`;
    return;
  }

  el.innerHTML = requests.map((item) => `
    <tr>
      <td class="ref">${item.id}</td>
      <td class="date">${shortDate(item.request_date)}</td>
      <td><strong>${item.plan_name}</strong> Plan</td>
      <td><span class="badge badge-${item.status}">${item.status}</span></td>
      <td class="actions-cell">
        ${item.status === "pending"
          ? `<button class="btn-cancel" data-action="cancel-request" data-id="${item.id}">
               <i class="fa-solid fa-xmark"></i> Cancel
             </button>`
          : ""}
      </td>
    </tr>`).join("");
}

// ── Actions ───────────────────────────────────────────────────────────────────

async function handlePurchaseRequest(planId, planName) {
  try {
    const response = await PostData("/request", { plan_id: planId });
    if (response.success) {
      showToast(`Request for "${planName}" sent successfully.`, "success");
    } else {
      showToast(response.error?.message ?? "Failed to send request. Please try again.", "error");
    }
  } catch (err) {
    console.error("handlePurchaseRequest error:", err);
    showToast("Network error. Please check your connection and try again.", "error");
  } finally {
    await renderDashboard();
  }
}

async function cancelRequest(id) {
  try {
    const response = await UpdateData(`/request/${id}/cancel`, { id });
    if (response.success) {
      showToast("Request cancelled successfully.", "success");
    } else {
      showToast(response.error?.message ?? "Cancellation failed. Please try again.", "error");
    }
  } catch (err) {
    console.error("cancelRequest error:", err);
    showToast("Network error. Please check your connection and try again.", "error");
  } finally {
    await renderDashboard();
  }
}

// ── Toast notifications (replaces alert()) ────────────────────────────────────

function showToast(message, type = "success") {
  const existing = document.getElementById("toast-container");
  if (existing) existing.remove();

  const colors = type === "success"
    ? "background:var(--success-bg);color:var(--success);border-color:#86efac;"
    : "background:var(--danger-bg);color:var(--danger);border-color:#fca5a5;";

  const icon = type === "success" ? "fa-circle-check" : "fa-circle-exclamation";

  const toast = document.createElement("div");
  toast.id = "toast-container";
  toast.style.cssText = `
    position:fixed;bottom:24px;right:24px;z-index:9999;
    display:flex;align-items:center;gap:10px;
    padding:12px 18px;border-radius:10px;border:1px solid;
    font-size:13px;font-weight:600;font-family:inherit;
    box-shadow:0 8px 24px rgba(0,0,0,.12);
    animation:slideUp .25s ease;
    ${colors}
  `;
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> ${message}`;

  const style = document.createElement("style");
  style.textContent = `@keyframes slideUp{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}`;
  document.head.appendChild(style);
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3500);
}

// ── Orchestrator ──────────────────────────────────────────────────────────────

async function renderDashboard() {
  const [subscription, plans, requestHistory] = await Promise.all([
    fetchSubscription(),
    fetchPlans(),
    fetchRequestHistory(),
  ]);

  const pendingRequest = requestHistory.find((r) => r.status === "pending") ?? null;

  renderCurrentSubscription(subscription);
  renderPendingAlert(pendingRequest);
  renderPlans(plans, pendingRequest);
  renderRequestHistory(requestHistory);
}

// ── Event listeners ───────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  renderDashboard();

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;
    const id     = btn.dataset.id;
    const name   = btn.dataset.name;

    if (action === "request-plan")   handlePurchaseRequest(id, name);
    if (action === "cancel-request") cancelRequest(id);
  });

  /* ===== Tab switching ===== */
  const tabs = document.querySelectorAll('.tab');
  const panels = {
    current: document.getElementById('panel-current'),
    upgrade: document.getElementById('panel-upgrade'),
    history: document.getElementById('panel-history'),
  };
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(b => b.classList.toggle('active', b === btn));
      const key = btn.dataset.tab;
      Object.entries(panels).forEach(([k, el]) => { el.hidden = k !== key; });
    });
  });

  /* ===== Spotlight mouse tracking on plan cards (delegated) ===== */
  document.getElementById('plans-container').addEventListener('mousemove', e => {
    const card = e.target.closest('.plan-card');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  });
});