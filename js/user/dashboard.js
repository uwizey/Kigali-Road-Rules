import { FetchData, PostData, UpdateData } from "../api/crud.js";
const useremail = document.getElementById("userEmail");

// ── DOM helper ────────────────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);

// ══════════════════════════════════════════════════════════════════════════════
// TOAST
// ══════════════════════════════════════════════════════════════════════════════

function showToast(message, type = "success") {
  const el = $("toast-container");
  if (!el) return;
  el.textContent = message;
  el.className = `toast-container toast-${type} show`;
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove("show"), 3500);
}

// ══════════════════════════════════════════════════════════════════════════════
// NAVIGATION — PAGE SWITCHING
// ══════════════════════════════════════════════════════════════════════════════

function showPage(pageKey) {
  // Show/hide pages
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  $("page-" + pageKey)?.classList.add("active");

  // Highlight header mode buttons
  document
    .querySelectorAll(".mode-btn[id^='hlink']")
    .forEach((b) => b.classList.remove("active"));
  $("hlink-" + pageKey)?.classList.add("active");

  // Show matching sidebar panel
  document
    .querySelectorAll(".sidebar-panel")
    .forEach((p) => p.classList.remove("active"));
  $("sidebar-" + pageKey)?.classList.add("active");

  closeSidebar();
}

// ── Market tab switching ─────────────────────────────────────────────────────

function switchMarketTab(key) {
  // Content panels
  ["current", "upgrade"].forEach((k) => {
    const el = $("panel-" + k);
    if (el) el.hidden = k !== key;
  });

  // Top tab bar
  document
    .querySelectorAll(".tab[data-tab]")
    .forEach((t) => t.classList.toggle("active", t.dataset.tab === key));

  // Sidebar nav items within the market panel
  document
    .querySelectorAll("#sidebar-market .nav-item")
    .forEach((n) => n.classList.toggle("active", n.dataset.tab === key));
}

// ── Settings tab switching ───────────────────────────────────────────────────

function switchSettingsTab(key) {
  // Content panels
  document
    .querySelectorAll(".settings-panel")
    .forEach((p) => p.classList.remove("active"));
  $("spanel-" + key)?.classList.add("active");

  // Top tab bar
  document
    .querySelectorAll(".settings-tab")
    .forEach((t) => t.classList.toggle("active", t.dataset.stab === key));

  // Sidebar nav items within the settings panel
  document
    .querySelectorAll("#sidebar-settings .nav-item")
    .forEach((n) => n.classList.toggle("active", n.dataset.stab === key));
}

// ── Sidebar open/close ───────────────────────────────────────────────────────

function openSidebar() {
  $("sidebar")?.classList.add("open");
  $("sidebarOverlay")?.classList.add("show");
}

function closeSidebar() {
  $("sidebar")?.classList.remove("open");
  $("sidebarOverlay")?.classList.remove("show");
}

// ══════════════════════════════════════════════════════════════════════════════
// DATE HELPERS
// ══════════════════════════════════════════════════════════════════════════════

function timeFormat(isoString) {
  return new Date(isoString).toLocaleString("en-US", {
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

// ══════════════════════════════════════════════════════════════════════════════
// DATA FETCHERS
// ══════════════════════════════════════════════════════════════════════════════

async function fetchSubscription() {
  try {
    const res = await FetchData("/my-subscription", true);
    if (res.success) return res.data.data;
    if (res.status === 404) return null;
    return null;
  } catch {
    return null;
  }
}

async function fetchPlans() {
  try {
    const res = await FetchData("/allplans", true);
    return res.success ? (res.data.data ?? []) : [];
  } catch {
    return [];
  }
}

async function fetchRequestHistory() {
  try {
    const res = await FetchData("/myrequests", true);
    if (res.success) return res.data.data ?? [];
    if (res.status === 404) return [];
    return [];
  } catch {
    return [];
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION RENDERERS
// ══════════════════════════════════════════════════════════════════════════════

function renderCurrentSubscription(subscription) {
  const el = $("active-sub-container");
  const featCard = $("features-card");
  if (!el) return;

  if (!subscription) {
    el.innerHTML = `
      <div class="card">
        <div class="empty-notice">
          <i class="fa-regular fa-circle-xmark empty-icon"></i>
          You don't have an active subscription.
        </div>
      </div>`;
    if (featCard) featCard.hidden = true;
    return;
  }

  const isExpired = new Date(subscription.expiry_date) < new Date();
  const isActive = subscription.active;

  let label = "Active",
    badgeClass = "badge-active",
    subText = "Your subscription is active";
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
    <article class="card ${!isActive ? "card-inactive" : ""}">
      <div class="plan-header">
        <div class="plan-header-top">
          <div>
            <span class="plan-chip"><i class="fa-solid fa-crown"></i> ${subscription.plan_name}</span>
            <p class="plan-status-text">${subText}</p>
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
      ${!isActive ? `<div class="sub-disabled-notice">This subscription has been manually disabled</div>` : ""}
    </article>`;

  if (featCard) {
    featCard.hidden = false;
    const features = [
      `${subscription.remaining_quizzes} quizzes remaining`,
      `${subscription.remaining_template_exams} template exams remaining`,
      `${subscription.remaining_topic_quizzes} topic quizzes remaining`,
      "Access to all study materials",
      
    ];
    $("features-list").innerHTML = features
      .map(
        (f) =>
          `<li><span class="check"><i class="fa-solid fa-check"></i></span><span>${f}</span></li>`,
      )
      .join("");
  }
}

function renderPendingAlert(pendingRequest) {
  const el = $("pending-alert-box");
  if (!el) return;
  el.innerHTML = pendingRequest
    ? `<div class="alert-pending">
        <span>⏳</span>
        <div><strong>Request Pending:</strong> You've requested the <b>${pendingRequest.plan_name}</b> plan. It will be reviewed shortly.</div>
       </div>`
    : "";
}

function renderPlans(plans, pendingRequest) {
  const el = $("plans-container");
  if (!el) return;

  if (!plans.length) {
    el.innerHTML = `<div class="empty-notice span-full">No plans are available at the moment.</div>`;
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
  const el = $("history-list");
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

// ══════════════════════════════════════════════════════════════════════════════
// MARKET ACTIONS
// ══════════════════════════════════════════════════════════════════════════════

async function handlePurchaseRequest(planId, planName) {
  try {
    const res = await PostData("/request", { plan_id: planId }, true);
    if (res.success) {
      showToast(`Request for "${planName}" sent successfully.`);
    } else {
      showToast(
        res.error?.message ?? "Failed to send request. Please try again.",
        "error",
      );
    }
  } catch {
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
    const res = await UpdateData(`/request/${id}/cancel`, { id }, true);
    if (res.success) {
      showToast("Request cancelled successfully.");
    } else {
      showToast(
        res.error?.message ?? "Cancellation failed. Please try again.",
        "error",
      );
    }
  } catch {
    showToast(
      "Network error. Please check your connection and try again.",
      "error",
    );
  } finally {
    await renderDashboard();
  }
}

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

// ══════════════════════════════════════════════════════════════════════════════
// SETTINGS — FIELD HELPERS
// ══════════════════════════════════════════════════════════════════════════════

function msg(id, text, type = "") {
  const el = $(id);
  if (!el) return;
  el.textContent = text;
  el.className = `field-msg ${type}`;
}

function fieldState(id, s) {
  const el = $(id);
  if (!el) return;
  el.classList.remove("err", "ok");
  if (s) el.classList.add(s);
}

function clearForm(ids) {
  ids.forEach((id) => {
    const el = $(id);
    if (!el) return;
    el.value = "";
    fieldState(id, null);
  });
}

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function strength(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const level = Math.min(Math.max(s - 1, 0), 4);
  return {
    level,
    cls: ["", "weak", "fair", "good", "strong"][level],
    label: ["", "Weak", "Fair", "Good", "Strong"][level],
  };
}

function updateStrengthBar(pw) {
  const { level, cls } = pw ? strength(pw) : { level: 0, cls: "" };
  [1, 2, 3, 4].forEach((i) => {
    $(`s${i}`).className = "seg" + (pw && i <= level + 1 ? ` ${cls}` : "");
  });
}

function validateEmail() {
  const nv = $("new-email").value.trim();
  const cv = $("confirm-email").value.trim();
  const pw = $("email-password").value;

  if (nv && !isEmail(nv)) {
    msg("msg-new-email", "Invalid email format.", "err");
    fieldState("new-email", "err");
  } else {
    msg("msg-new-email", "");
    fieldState("new-email", nv && isEmail(nv) ? "ok" : null);
  }

  if (cv && cv !== nv) {
    msg("msg-confirm-email", "Emails don't match.", "err");
    fieldState("confirm-email", "err");
  } else {
    const match = cv && cv === nv;
    msg("msg-confirm-email", match ? "Emails match ✓" : "", match ? "ok" : "");
    fieldState("confirm-email", match ? "ok" : null);
  }

  $("btn-email").disabled = !(nv && cv && pw && isEmail(nv) && nv === cv);
}

function validatePassword() {
  const cp = $("current-pw").value;
  const np = $("new-pw").value;
  const cf = $("confirm-pw").value;

  updateStrengthBar(np);

  if (np && np.length < 8) {
    msg("msg-new-pw", "Minimum 8 characters.", "err");
    fieldState("new-pw", "err");
  } else if (np) {
    const { cls, label } = strength(np);
    msg(
      "msg-new-pw",
      `Strength: ${label}`,
      cls === "weak" ? "err" : cls === "fair" ? "" : "ok",
    );
    fieldState("new-pw", cls === "weak" ? "err" : "ok");
  } else {
    msg("msg-new-pw", "");
    fieldState("new-pw", null);
  }

  if (cf && cf !== np) {
    msg("msg-confirm-pw", "Passwords don't match.", "err");
    fieldState("confirm-pw", "err");
  } else {
    const match = cf && cf === np;
    msg("msg-confirm-pw", match ? "Passwords match ✓" : "", match ? "ok" : "");
    fieldState("confirm-pw", match ? "ok" : null);
  }

  const str = np ? strength(np).level : 0;
  $("btn-pw").disabled = !(
    cp &&
    np &&
    cf &&
    np.length >= 8 &&
    np === cf &&
    str > 0
  );
}

async function submitEmail() {
  const btn = $("btn-email");
  btn.classList.add("loading");
  btn.disabled = true;
  try {
    const res = await UpdateData(
      "/user/update-email",
      {
        new_email: $("new-email").value.trim(),
        current_password: $("email-password").value,
      },
      true,
    );
    if (res.success) {
      showToast("Email updated successfully.");
      clearForm(["new-email", "confirm-email", "email-password"]);
      ["msg-new-email", "msg-confirm-email", "msg-email-password"].forEach(
        (id) => msg(id, ""),
      );
    } else {
      showToast(res.error?.message ?? "Update failed.", "error");
      if (res.error?.message?.toLowerCase().includes("password")) {
        msg("msg-email-password", res.error.message, "err");
        fieldState("email-password", "err");
      }
    }
  } catch {
    showToast("Network error. Please try again.", "error");
  } finally {
    btn.classList.remove("loading");
    btn.disabled = false;
  }
}

async function submitPassword() {
  const btn = $("btn-pw");
  btn.classList.add("loading");
  btn.disabled = true;
  try {
    const res = await UpdateData(
      "/user/update-password",
      {
        current_password: $("current-pw").value,
        new_password: $("new-pw").value,
      },
      true,
    );
    if (res.success) {
      showToast("Password updated successfully.");
      clearForm(["current-pw", "new-pw", "confirm-pw"]);
      updateStrengthBar("");
      ["msg-current-pw", "msg-new-pw", "msg-confirm-pw"].forEach((id) =>
        msg(id, ""),
      );
    } else {
      showToast(res.error?.message ?? "Update failed.", "error");
      if (res.error?.message?.toLowerCase().includes("current")) {
        msg("msg-current-pw", res.error.message, "err");
        fieldState("current-pw", "err");
      }
    }
  } catch {
    showToast("Network error. Please try again.", "error");
  } finally {
    btn.classList.remove("loading");
    btn.disabled = false;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", async () => {

  // ── External page navigation ─────────────────────────────────────────────
  $("dropdown-control-btn")?.addEventListener("click", () => {
    window.location.href = "user-dashboard.html";
  });
  $("dropdown-academy-btn")?.addEventListener("click", () => {
    window.location.href = "user.html";
  });
  $("btn-logout")?.addEventListener("click", async () => {
    await FetchData("/logout", true);
    localStorage.removeItem("authToken");
    window.location.href = "../auth/login.html";
  });
   
  if (useremail) {
      const res = await FetchData("/user/profile", true);
      useremail.textContent = res.success
        ? (res.data?.data?.email ?? "Unknown User")
        : "Unknown User";
    }
  // ── Logo ─────────────────────────────────────────────────────────────────
  $("logo-link")?.addEventListener("click", (e) => {
    e.preventDefault();
    showPage("market");
  });
  $("logo-img")?.addEventListener("error", function () {
    this.style.display = "none";
  });

  // ── Header mode buttons (page switcher) ──────────────────────────────────
  $("hlink-market")?.addEventListener("click", () => showPage("market"));
  $("hlink-settings")?.addEventListener("click", () => showPage("settings"));

  // ── Avatar dropdown ──────────────────────────────────────────────────────
  const avatarBtn = $("avatarBtn");
  const avatarDropdown = $("avatarDropdown");

  avatarBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = avatarDropdown.classList.toggle("open");
    avatarBtn.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("click", () => {
    avatarDropdown?.classList.remove("open");
    avatarBtn?.setAttribute("aria-expanded", "false");
  });

  // ── Hamburger ────────────────────────────────────────────────────────────
  $("hamburgerBtn")?.addEventListener("click", () => {
    const isOpen = $("sidebar")?.classList.contains("open");
    if (isOpen) closeSidebar();
    else openSidebar();
  });
  $("sidebarOverlay")?.addEventListener("click", closeSidebar);

  // ── Delegated sidebar nav clicks ─────────────────────────────────────────
  $("sidebar")?.addEventListener("click", (e) => {
    const item = e.target.closest(".nav-item[data-action]");
    if (!item) return;

    const { action, tab, stab } = item.dataset;

    if (action === "switch-tab" && tab) {
      // Market sub-tab
      switchMarketTab(tab);
      closeSidebar();
    }

    if (action === "switch-stab" && stab) {
      // Settings sub-tab
      switchSettingsTab(stab);
      closeSidebar();
    }
  });

  // ── Market top tab bar ───────────────────────────────────────────────────
  document.querySelectorAll(".tab[data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => switchMarketTab(btn.dataset.tab));
  });

  // ── Settings top tab bar ─────────────────────────────────────────────────
  document.querySelectorAll(".settings-tab").forEach((tab) => {
    tab.addEventListener("click", () => switchSettingsTab(tab.dataset.stab));
  });

  // ── Plan card spotlight ──────────────────────────────────────────────────
  $("plans-container")?.addEventListener("mousemove", (e) => {
    const card = e.target.closest(".plan-card");
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  });

  // ── Delegated market actions ─────────────────────────────────────────────
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action='request-plan']");
    if (btn) {
      handlePurchaseRequest(btn.dataset.id, btn.dataset.name);
      return;
    }
    const cancel = e.target.closest("[data-action='cancel-request']");
    if (cancel) {
      cancelRequest(cancel.dataset.id);
      return;
    }
  });

  // ── Settings inputs ──────────────────────────────────────────────────────
  ["new-email", "confirm-email", "email-password"].forEach((id) =>
    $(id)?.addEventListener("input", validateEmail),
  );
  ["current-pw", "new-pw", "confirm-pw"].forEach((id) =>
    $(id)?.addEventListener("input", validatePassword),
  );
  $("btn-email")?.addEventListener("click", submitEmail);
  $("btn-pw")?.addEventListener("click", submitPassword);

  // ── Password show/hide ───────────────────────────────────────────────────
  const EYE_OPEN = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
  const EYE_SHUT = `<line x1="1" y1="1" x2="23" y2="23"/>
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>`;

  document.querySelectorAll(".toggle-pw").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = $(btn.dataset.target);
      if (!input) return;
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.querySelector("svg").innerHTML = show ? EYE_SHUT : EYE_OPEN;
    });
  });

  // JavaScript Function
function renderPerformanceStats(data) {
  const container = document.getElementById('performanceSection');
  if (!container) return;

  const totalQuestions = data.total_correct + data.total_wrong;
  const correctPercent = totalQuestions > 0 ? Math.round((data.total_correct / totalQuestions) * 100) : 0;
  const incorrectPercent = totalQuestions > 0 ? 100 - correctPercent : 0;

  const minutes = Math.floor(data.total_seconds_spent / 60);
  const seconds = data.total_seconds_spent % 60;
  const timeFormatted = `${minutes}m ${seconds}s`;

  container.innerHTML = `
    <div class="stats-overview-container">
      <h2 class="section-title">Performance Overview</h2>
      
      <div class="stats-layout">
        
        <div class="chart-wrapper">
          <div class="donut-chart" style="background: conic-gradient(var(--clr-dark) 0% ${correctPercent}%, var(--clr-primary) ${correctPercent}% 100%);">
            <div class="donut-center">
              <span class="donut-center-value">${correctPercent}%</span>
              <span class="donut-center-label">Accuracy</span>
            </div>
          </div>
        </div>

        <div class="stats-info">
          
          <div class="primary-metrics-row">
            <div class="metric-group">
              <p class="metric-label">Total Tests</p>
              <h3 class="metric-value">${data.total_tests}</h3>
            </div>
            <div class="metric-group">
              <p class="metric-label">Time Spent</p>
              <h3 class="metric-value">${timeFormatted}</h3>
            </div>
          </div>

          <div class="breakdown-legend">
            <div class="legend-item">
              <div class="legend-indicator-group">
                <div class="legend-indicator correct"></div>
                <span class="legend-label">Correct Answers</span>
              </div>
              <span class="legend-value">${data.total_correct} <span class="legend-percentage-correct">(${correctPercent}%)</span></span>
            </div>

            <div class="legend-item">
              <div class="legend-indicator-group">
                <div class="legend-indicator incorrect"></div>
                <span class="legend-label">Incorrect Answers</span>
              </div>
              <span class="legend-value">${data.total_wrong} <span class="legend-percentage-incorrect">(${incorrectPercent}%)</span></span>
            </div>
          </div>

        </div>
      </div>
    </div>
  `;
}

// Execution Call Example
const apiData = {
  "total_tests": 12,
  "total_correct": 87,
  "total_wrong": 13,
  "total_seconds_spent": 1540
};

renderPerformanceStats(apiData);
  // ── Bootstrap ────────────────────────────────────────────────────────────
  renderDashboard();
});
