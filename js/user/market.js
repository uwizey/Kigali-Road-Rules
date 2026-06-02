import { FetchData, PostData, UpdateData } from "../api/crud.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeFormat(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function shortDate(isoString) {
  return new Date(isoString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
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
  const isActive = subscription.active;

  let label = "Active";
  let badgeClass = "badge-active";
  let subText = "Your subscription is active";
  if (!isActive) {
    label = "Deactivated";
    badgeClass = "badge-rejected";
    subText = "Manually disabled";
  } else if (isExpired) {
    label = "Expired";
    badgeClass = "badge-expired";
    subText = "Subscription has expired";
  }

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
      .map(
        (f) =>
          `<li><span class="check"><i class="fa-solid fa-check"></i></span><span>${f}</span></li>`,
      )
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

  el.innerHTML = plans
    .map(
      (plan) => `
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
        ${
          isLocked
            ? `<i class="fa-solid fa-clock"></i> Awaiting Approval`
            : `<i class="fa-solid fa-paper-plane"></i> Request Purchase`
        }
      </button>
    </div>`,
    )
    .join("");
}

function renderRequestHistory(requests) {
  const el = document.getElementById("history-list");
  if (!el) return;

  if (!requests.length) {
    el.innerHTML = `<tr><td colspan="5"><div class="empty-notice">No subscription requests yet.</div></td></tr>`;
    return;
  }

  el.innerHTML = requests
    .map(
      (item) => `
    <tr>
      <td class="ref">${item.id}</td>
      <td class="date">${shortDate(item.request_date)}</td>
      <td><strong>${item.plan_name}</strong> Plan</td>
      <td><span class="badge badge-${item.status}">${item.status}</span></td>
      <td class="actions-cell">
        ${
          item.status === "pending"
            ? `<button class="btn-cancel" data-action="cancel-request" data-id="${item.id}">
               <i class="fa-solid fa-xmark"></i> Cancel
             </button>`
            : ""
        }
      </td>
    </tr>`,
    )
    .join("");
}

// ── Actions ───────────────────────────────────────────────────────────────────

async function handlePurchaseRequest(planId, planName) {
  try {
    const response = await PostData("/request", { plan_id: planId }, true);
    if (response.success) {
      showToast(`Request for "${planName}" sent successfully.`, "success");
    } else {
      showToast(
        response.error?.message ?? "Failed to send request. Please try again.",
        "error",
      );
    }
  } catch (err) {
    console.error("handlePurchaseRequest error:", err);
    showToast(
      "Network error. Please check your connection and try again.",
      "error",
    );
  } finally {
    await renderDashboard();
  }
}

async function cancelRequest(id) {
  try {
    const response = await UpdateData(`/request/${id}/cancel`, { id }, true);
    if (response.success) {
      showToast("Request cancelled successfully.", "success");
    } else {
      showToast(
        response.error?.message ?? "Cancellation failed. Please try again.",
        "error",
      );
    }
  } catch (err) {
    console.error("cancelRequest error:", err);
    showToast(
      "Network error. Please check your connection and try again.",
      "error",
    );
  } finally {
    await renderDashboard();
  }
}

// ── Toast notifications ───────────────────────────────────────────────────────

function showToast(message, type = "success") {
  document.getElementById("toast-container")?.remove();

  const colors =
    type === "success"
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
    ${colors}`;
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

  const pendingRequest =
    requestHistory.find((r) => r.status === "pending") ?? null;

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
    const { action, id, name } = btn.dataset;
    if (action === "request-plan") handlePurchaseRequest(id, name);
    if (action === "cancel-request") cancelRequest(id);
  });

  // Tab switching
  const tabs = document.querySelectorAll(".tab");
  const panels = {
    current: document.getElementById("panel-current"),
    upgrade: document.getElementById("panel-upgrade"),
    history: document.getElementById("panel-history"),
  };
  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabs.forEach((b) => b.classList.toggle("active", b === btn));
      const key = btn.dataset.tab;
      Object.entries(panels).forEach(([k, el]) => {
        el.hidden = k !== key;
      });
    });
  });

  // Spotlight mouse tracking on plan cards
  document
    .getElementById("plans-container")
    ?.addEventListener("mousemove", (e) => {
      const card = e.target.closest(".plan-card");
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
      card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    });
});
