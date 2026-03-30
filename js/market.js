import { FetchData, PostData, UpdateData } from "./api/crud.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function showError(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) el.innerHTML = `<div class="error-notice">${message}</div>`;
}

function showEmpty(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) el.innerHTML = `<div class="empty-notice">${message}</div>`;
}

// ── Safe data fetchers (never throw, always return null / []) ─────────────────

async function fetchSubscription() {
  try {
    const res = await FetchData("/my-subscription", true);
    if (res.success) return res.data.subscription;
    if (res.status === 404) return null; // no subscription yet — that's fine
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
    if (res.status === 404) return []; // no history yet — that's fine
    console.warn("fetchRequestHistory:", res.error?.message);
    return [];
  } catch (err) {
    console.error("fetchRequestHistory network error:", err);
    return [];
  }
}

// ── Section renderers (each is independent — one failure won't block others) ──

function renderCurrentSubscription(subscription) {
  if (!subscription) {
    showEmpty("active-sub-container", "You don't have an active subscription.");
    return;
  }

  const isExpired = new Date(subscription.expiry_date) < new Date();
  const isActive = subscription.active;

  let label = "Active";
  let badgeClass = "badge-active";
  if (!isActive) {
    label = "Deactivated";
    badgeClass = "badge-rejected";
  } else if (isExpired) {
    label = "Expired";
    badgeClass = "badge-expired";
  }

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
      ${
        !isActive
          ? `
        <div style="color:var(--danger);font-size:0.7rem;font-weight:700;margin-top:10px;text-transform:uppercase;">
          This subscription has been manually disabled
        </div>`
          : ""
      }
    </div>`;
}

function renderPendingAlert(pendingRequest) {
  const el = document.getElementById("pending-alert-box");
  if (!el) return;

  el.innerHTML = pendingRequest
    ? `
    <div class="alert-pending">
      <span>⏳</span>
      <div>
        <strong>Request Pending:</strong> You've requested <b>${pendingRequest.plan_name}</b>.
        It will be reviewed shortly.
      </div>
    </div>`
    : "";
}

function renderPlans(plans, pendingRequest) {
  const el = document.getElementById("plans-container");
  if (!el) return;

  if (!plans.length) {
    showEmpty("plans-container", "No plans are available at the moment.");
    return;
  }

  const isLocked = pendingRequest !== null;

  el.innerHTML = plans
    .map(
      (plan) => `
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
    </div>`,
    )
    .join("");
}

function renderRequestHistory(requests) {
  const el = document.getElementById("history-list");
  if (!el) return;

  if (!requests.length) {
    showEmpty("history-list", "No subscription requests yet.");
    return;
  }

  el.innerHTML = "";

  requests.forEach((item) => {
    const historyItem = document.createElement("div");
    historyItem.className = "history-item";

    const dateDiv = document.createElement("div");
    dateDiv.className = "history-date";
    dateDiv.textContent = timeFormat(item.request_date);

    const infoDiv = document.createElement("div");
    infoDiv.className = "history-info";
    infoDiv.innerHTML = `
      ${item.plan_name} Plan
      <span class="badge badge-${item.status}">${item.status}</span>`;

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
      alert(
        response.error?.message ?? "Failed to send request. Please try again.",
      );
    }
  } catch (err) {
    console.error("handlePurchaseRequest error:", err);
    alert("Network error. Please check your connection and try again.");
  } finally {
    renderDashboard(); // always refresh regardless of outcome
  }
}

async function cancelRequest(id) {
  try {
    const response = await UpdateData(`/request/${id}/cancel`, { id }, true);
    if (response.success) {
      alert("Request cancelled successfully.");
    } else {
      alert(
        response.error?.message ?? "Cancellation failed. Please try again.",
      );
    }
  } catch (err) {
    console.error("cancelRequest error:", err);
    alert("Network error. Please check your connection and try again.");
  } finally {
    renderDashboard(); // always refresh regardless of outcome
  }
}

// ── Orchestrator ──────────────────────────────────────────────────────────────

async function renderDashboard() {
  // Fetch all data in parallel — a 404 on one won't block the others
  const [subscription, plans, requestHistory] = await Promise.all([
    fetchSubscription(),
    fetchPlans(),
    fetchRequestHistory(),
  ]);

  const pendingRequest =
    requestHistory.find((r) => r.status === "pending") ?? null;

  // Each renderer is isolated — one broken section won't crash the rest
  renderCurrentSubscription(subscription);
  renderPendingAlert(pendingRequest);
  renderPlans(plans, pendingRequest);
  renderRequestHistory(requestHistory);
}

// ── Event listeners ───────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  renderDashboard();

  // Delegated listener — handles plan request buttons and cancel buttons
  // even after the DOM is re-rendered by renderDashboard()
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
