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
    { id: "plan_pro", plan_name: "Pro", price: 12000, no_quizzes: 30, no_template_exams: 8, duration_days: 60 },
    { id: "plan_elite", plan_name: "Elite", price: 25000, no_quizzes: 100, no_template_exams: 20, duration_days: 90 },
  ],
  requests: [
    { id: "req_001", plan_name: "Basic", plan_id: "plan_basic", status: "approved", request_date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString() },
    { id: "req_002", plan_name: "Pro", plan_id: "plan_pro", status: "rejected", request_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
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
    hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true,
  });
}

function showEmpty(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) el.innerHTML = `<div class="empty-notice">${message}</div>`;
}

// ── Safe data fetchers ────────────────────────────────────────────────────────

async function fetchSubscription() {
  try {
    const res = await FetchData("/my-subscription", true);
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
    const res = await FetchData("/allplans", true);
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
    const res = await FetchData("/myrequests", true);
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
  if (!subscription) {
    showEmpty("active-sub-container", "You don't have an active subscription.");
    return;
  }

  const isExpired = new Date(subscription.expiry_date) < new Date();
  const isActive = subscription.active;

  let label = "Active";
  let badgeClass = "badge-active";
  if (!isActive) { label = "Deactivated"; badgeClass = "badge-rejected"; }
  else if (isExpired) { label = "Expired"; badgeClass = "badge-expired"; }

  const el = document.getElementById("active-sub-container");
  if (!el) return;

  el.innerHTML = `
    <div class="status-card" style="${!isActive ? "opacity:0.7;border-style:dashed;" : ""}">
      <div class="status-header">
        <div>
          <div class="plan-name">${subscription.plan_name}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">
            Expires: ${timeFormat(subscription.expiry_date)}
          </div>
        </div>
        <span class="badge ${badgeClass}">${label}</span>
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
      ${!isActive ? `<div style="color:var(--danger);font-size:0.7rem;font-weight:700;margin-top:10px;text-transform:uppercase;">This subscription has been manually disabled</div>` : ""}
    </div>`;
}

function renderPendingAlert(pendingRequest) {
  const el = document.getElementById("pending-alert-box");
  if (!el) return;
  el.innerHTML = pendingRequest
    ? `<div class="alert-pending">
        <span>⏳</span>
        <div><strong>Request Pending:</strong> You've requested <b>${pendingRequest.plan_name}</b>. It will be reviewed shortly.</div>
       </div>`
    : "";
}

function renderPlans(plans, pendingRequest) {
  const el = document.getElementById("plans-container");
  if (!el) return;

  if (!plans.length) { showEmpty("plans-container", "No plans are available at the moment."); return; }

  const isLocked = pendingRequest !== null;

  el.innerHTML = plans.map((plan) => `
    <div class="plan-card">
      <div class="plan-name">${plan.plan_name}</div>
      <div class="plan-price">${Number(plan.price).toLocaleString()}<span> RWF</span></div>
      <ul class="plan-features">
        <li>${plan.no_quizzes} Quizzes</li>
        <li>${plan.no_template_exams} Exams</li>
        <li>${plan.duration_days} Days</li>
      </ul>
      <button
        class="btn ${isLocked ? "btn-disabled" : "btn-primary"}"
        ${isLocked ? "disabled" : ""}
        data-action="request-plan"
        data-id="${plan.id}"
        data-name="${plan.plan_name}">
        ${isLocked ? "Wait for Approval" : "Request Purchase"}
      </button>
    </div>`).join("");
}

function renderRequestHistory(requests) {
  const el = document.getElementById("history-list");
  if (!el) return;

  if (!requests.length) { showEmpty("history-list", "No subscription requests yet."); return; }

  el.innerHTML = "";

  requests.forEach((item) => {
    const historyItem = document.createElement("div");
    historyItem.className = "history-item";

    const dateDiv = document.createElement("div");
    dateDiv.className = "history-date";
    dateDiv.textContent = timeFormat(item.request_date);

    const infoDiv = document.createElement("div");
    infoDiv.className = "history-info";
    infoDiv.innerHTML = `${item.plan_name} Plan <span class="badge badge-${item.status}">${item.status}</span>`;

    historyItem.appendChild(dateDiv);
    historyItem.appendChild(infoDiv);

    if (item.status === "pending") {
      const cancelBtn = document.createElement("button");
      cancelBtn.className = "btn-cancel";
      cancelBtn.textContent = "Cancel Request";
      cancelBtn.dataset.action = "cancel-request";
      cancelBtn.dataset.id = item.id;
      historyItem.appendChild(cancelBtn);
    }

    el.appendChild(historyItem);
  });
}

// ── Actions ───────────────────────────────────────────────────────────────────

async function handlePurchaseRequest(planId, planName) {
  try {
    const response = await PostData("/request", { plan_id: planId }, true);
    if (response.success) {
      alert(`Your request for "${planName}" has been sent successfully.`);
    } else {
      alert(response.error?.message ?? "Failed to send request. Please try again.");
    }
  } catch (err) {
    console.error("handlePurchaseRequest error:", err);
    alert("Network error. Please check your connection and try again.");
  } finally {
    renderDashboard();
  }
}

async function cancelRequest(id) {
  try {
    const response = await UpdateData(`/request/${id}/cancel`, { id }, true);
    if (response.success) {
      alert("Request cancelled successfully.");
    } else {
      alert(response.error?.message ?? "Cancellation failed. Please try again.");
    }
  } catch (err) {
    console.error("cancelRequest error:", err);
    alert("Network error. Please check your connection and try again.");
  } finally {
    renderDashboard();
  }
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
    const id = btn.dataset.id;
    const name = btn.dataset.name;

    if (action === "request-plan") handlePurchaseRequest(id, name);
    if (action === "cancel-request") cancelRequest(id);
  });
});