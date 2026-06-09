/**
 * app.js — Unified Admin Dashboard + Analytics
 *
 * All event handlers wired here. Zero inline onclick/style in HTML.
 * Uses .hidden CSS class instead of style="display:none".
 *
 * Sections:
 *   1.  Popup / modal utilities
 *   2.  Shared helpers
 *   3.  Runtime state
 *   4.  Navigation & UI controls
 *   5.  Overview charts (Chart.js)
 *   6.  Analytics renderers (SVG-based)
 *   7.  Analytics date filter
 *   8.  Topics management
 *   9.  Questions management
 *  10.  Content users management
 *  11.  Exams management
 *  12.  Subscription plans management
 *  13.  Subscription requests
 *  14.  Subscription details & history
 *  15.  Event listeners (DOMContentLoaded)
 */

import { FetchData, PostData, DeleteData, UpdateData } from "../api/crud.js";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. POPUP & MODAL UTILITIES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const useremail = document.getElementById("userEmail");
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
  document.getElementById("progressWarningOverlay")?.remove();

  const overlay = document.createElement("div");
  overlay.id = "progressWarningOverlay";

  const confirmBtn = showConfirm
    ? `<button class="pw-btn pw-btn-confirm">${confirmText}</button>`
    : "";
  const cancelBtn = showCancel
    ? `<button class="pw-btn pw-btn-cancel">${cancelText}</button>`
    : "";

  overlay.innerHTML = `
    <div id="progressWarningBox">
      <div class="pw-icon" style="color:${iconColor}"><i class="${icon}"></i></div>
      <h3>${title}</h3>
      <div class="pw-message-content">${message}</div>
      <div class="pw-actions">${cancelBtn}${confirmBtn}</div>
    </div>`;

  document.body.appendChild(overlay);

  const close = () => overlay.remove();

  // Apply button styles programmatically (these are dynamic per-call values, not page defaults)
  const confirmEl = overlay.querySelector(".pw-btn-confirm");
  const cancelEl = overlay.querySelector(".pw-btn-cancel");
  if (confirmEl && confirmBtnStyle) confirmEl.style.cssText = confirmBtnStyle;
  if (cancelEl && cancelBtnStyle) cancelEl.style.cssText = cancelBtnStyle;

  if (cancelEl)
    cancelEl.addEventListener("click", () => {
      close();
      onCancel();
    });
  if (confirmEl)
    confirmEl.addEventListener("click", () => {
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

function showSuccessPopup(message) {
  showInfoPopup("Success", message, "fas fa-check-circle", "#27ae60");
}

function showConfirmPopup(message, onConfirm) {
  createBasePopup({
    title: "Are you sure?",
    message,
    icon: "fas fa-exclamation-triangle",
    iconColor: "#e67e22",
    confirmText: "Confirm",
    cancelText: "Cancel",
    showCancel: true,
    showConfirm: true,
    confirmBtnStyle: "background:#e67e22;color:#fff;border:none;",
    onConfirm,
  });
}

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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. SHARED HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const $el = (id) => document.getElementById(id);

/** Open a .modal-overlay modal */
function openSubModal(id) {
  $el(id)?.classList.add("open");
}
/** Close a .modal-overlay modal */
function closeSubModal(id) {
  $el(id)?.classList.remove("open");
}

/** Open a .modal admin modal */
function openModal(id) {
  $el(id)?.classList.add("active");
}
/** Close a .modal admin modal */
function closeModal(id) {
  $el(id)?.classList.remove("active");
}

let _notifTimer;
function notify(msg) {
  const el = $el("notif");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(_notifTimer);
  _notifTimer = setTimeout(() => el.classList.remove("show"), 2800);
}

function timeFormat(iso) {
  return new Date(iso).toLocaleString("en-US", {
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

function getRetentionClass(value) {
  if (value >= 0.6) return "ret-high";
  if (value >= 0.3) return "ret-med";
  if (value > 0) return "ret-low";
  return "ret-zero";
}

function transformDeviceData(dist) {
  const pct = (name) => {
    const item = dist.find((d) => d.device.toLowerCase() === name);
    return item ? item.percentage : 0;
  };
  return {
    desktop: pct("desktop"),
    mobile: pct("mobile"),
    tablet: pct("tablet"),
    other: pct("other") + pct("unknown"),
  };
}

function buildDateQuery() {
  const from = $el("analytics-date-from")?.value;
  const to = $el("analytics-date-to")?.value;
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. RUNTIME STATE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let _users = [];
let _questions = [];
let _selectedQuestionIds = [];
let _analyticsLoaded = false;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. NAVIGATION & UI CONTROLS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.querySelector(".sidebar-overlay");
  sidebar?.classList.toggle("active");
  overlay?.classList.toggle("active");
}

function closeSidebar() {
  document.querySelector(".sidebar")?.classList.remove("active");
  document.querySelector(".sidebar-overlay")?.classList.remove("active");
}

function showSection(sectionId) {
  document
    .querySelectorAll(".admin-section")
    .forEach((s) => s.classList.remove("active"));
  document
    .querySelectorAll(".nav-item")
    .forEach((i) => i.classList.remove("active"));

  $el(sectionId)?.classList.add("active");

  document.querySelectorAll(".nav-item[data-section]").forEach((item) => {
    if (item.dataset.section === sectionId) item.classList.add("active");
  });

  if (sectionId === "analytics" && !_analyticsLoaded) {
    loadAnalytics();
    _analyticsLoaded = true;
  }

  // Close sidebar on mobile after navigation
  if (window.innerWidth <= 768) closeSidebar();
}

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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. OVERVIEW CHARTS (Chart.js)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function initializeCharts() {
  const response = await FetchData("/stats/topics", true);
  if (handleApiResponse(response)) return;

  new Chart($el("questionsChart").getContext("2d"), {
    type: "doughnut",
    data: {
      labels: response.data.data.labels,
      datasets: [
        {
          data: response.data.data.data,
          backgroundColor: response.data.data.colors,
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { position: "bottom" } },
    },
  });
  const response2 = await FetchData("/global-quiz-stats", true);
  if (handleApiResponse(response2)) return;

  console.log("Response ", response2);
  const stats = response2.data.data;
  console.log("Stats ", stats);

  $el('stat-tests').textContent = stats.total_tests_taken.toLocaleString();
  $el('stat-questions').textContent = stats.total_questions_answered.toLocaleString();
  $el('stat-speed').textContent = `${stats.avg_time_per_question.toFixed(1)}s`;

  const accuracyValue = stats.avg_accuracy * 100; // 73
  const remainingValue = 100 - accuracyValue; // 27
  console.log([accuracyValue, remainingValue]);

  $el("gauge-value").textContent = `${Math.round(accuracyValue)}%`;

  new Chart($el("AverageChart").getContext("2d"), {
    type: "doughnut",
    data: {
      labels: ["Accuracy", "Remaining"],
      datasets: [
        {
          data: [accuracyValue, remainingValue],
          backgroundColor: ["#FF8500", "#eaeded"],
          borderWidth: 0,
          hoverBackgroundColor: ["#FF8500", "#eaeded"],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      rotation: -90, // Rotate to start drawing from the left baseline side edge
      circumference: 180, // Cut execution parameters to create a clean semi-circle path
      cutout: "75%", // Thickness control setting configuration mapping your visual style
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      },
    },
  });

 
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 6. ANALYTICS RENDERERS (SVG-based, date-aware)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function renderHeatmap(qs = "") {
  const tbody = document.querySelector("#retentionTable tbody");
  tbody.innerHTML = "";

  const response = await FetchData(`/analytics/retention${qs}`, true);
  if (!response.success) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty">Error fetching retention data</td></tr>`;
    return;
  }

  const data = extractData(response);
  if (!data?.cohorts?.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty">No cohort data for this period</td></tr>`;
    return;
  }

  $el("startDate").textContent = data.period?.start || "—";
  $el("endDate").textContent = data.period?.end || "—";

  data.cohorts.forEach((cohort) => {
    const row = document.createElement("tr");
    const days = ["day_1", "day_7", "day_14", "day_30"];
    let cells = `<td class="cohort-label">${cohort.registration_date}</td><td>${cohort.new_users}</td>`;
    days.forEach((day) => {
      const val = cohort.retention[day];
      const display = val === null ? "—" : (val * 100).toFixed(0) + "%";
      cells += `<td class="${getRetentionClass(val ?? 0)}">${display}</td>`;
    });
    row.innerHTML = cells;
    tbody.appendChild(row);
  });
}

async function renderSteppedChart(engagementData, qs = "") {
  let data = engagementData;
  if (!data) {
    const response = await FetchData(`/analytics/engagement${qs}`, true);
    if (!response.success) return;
    data = extractData(response);
  }
  if (!data?.engagement?.length) return;

  const items = data.engagement;
  const pad = { top: 20, right: 20, bottom: 40, left: 50 };
  const W = 450,
    H = 220;
  const cW = W - pad.left - pad.right;
  const cH = H - pad.top - pad.bottom;

  let total = 0;
  const points = items.map((item) => {
    total += item.total_events;
    return {
      time: new Date(item.registration_date).getTime(),
      val: total,
      date: item.registration_date.split("-").slice(1).join("/"),
    };
  });

  const minT = points[0].time;
  const maxT = points[points.length - 1].time;
  const maxV = Math.max(...points.map((p) => p.val), 1) * 1.1;

  let axisHTML = "";
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + cH - i * 0.25 * cH;
    const val = Math.round(i * 0.25 * (maxV / 1.1));
    axisHTML += `<line x1="${pad.left}" y1="${y}" x2="${W - pad.right}" y2="${y}" /><text x="${pad.left - 10}" y="${y + 4}" text-anchor="end">${val}</text>`;
  }

  let d = `M ${pad.left} ${pad.top + cH}`;
  points.forEach((p, i) => {
    const x = pad.left + ((p.time - minT) / (maxT - minT || 1)) * cW;
    const y = pad.top + cH - (p.val / maxV) * cH;
    d += i === 0 ? ` L ${x} ${y}` : ` H ${x} V ${y}`;
    axisHTML += `<text x="${x}" y="${pad.top + cH + 15}" text-anchor="middle">${p.date}</text>`;
  });

  $el("chartAxes").innerHTML = axisHTML;
  $el("stepLine").setAttribute("d", d);
  $el("stepArea").setAttribute(
    "d",
    d + ` L ${pad.left + cW} ${pad.top + cH} L ${pad.left} ${pad.top + cH} Z`,
  );
}

async function renderDAUChart(qs = "") {
  const response = await FetchData(`/analytics/dau${qs}`, true);
  if (!response.success) return;
  const data = extractData(response);
  if (!data?.dau?.length) return;

  const dauData = data.dau;
  const pad = { top: 20, right: 20, bottom: 40, left: 40 };
  const W = 500,
    H = 250;
  const cW = W - pad.left - pad.right;
  const cH = H - pad.top - pad.bottom;
  const maxVal = Math.max(...dauData.map((d) => d.active_users)) * 1.2;
  const slotW = cW / dauData.length;
  const barWidth = slotW * 0.6;

  let barHTML = "",
    labelHTML = "",
    gridHTML = "";
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + cH - i * 0.25 * cH;
    const val = Math.round(i * 0.25 * (maxVal / 1.2));
    gridHTML += `<line x1="${pad.left}" y1="${y}" x2="${W - pad.right}" y2="${y}" stroke="var(--color-border)" stroke-width="1" /><text x="${pad.left - 10}" y="${y + 4}" text-anchor="end" fill="var(--color-text-faint)" font-size="9">${val}</text>`;
  }
  dauData.forEach((d, i) => {
    const x = pad.left + i * slotW + (slotW - barWidth) / 2;
    const returning = d.active_users - d.new_users;
    const hReturning = (returning / maxVal) * cH;
    const hNew = (d.new_users / maxVal) * cH;
    const yReturning = pad.top + cH - hReturning;
    const yNew = yReturning - hNew;
    barHTML += `<rect x="${x}" y="${yReturning}" width="${barWidth}" height="${hReturning}" fill="var(--color-primary)" rx="3"/>
                  <rect x="${x}" y="${yNew}"        width="${barWidth}" height="${hNew}"       fill="color-mix(in srgb, var(--color-primary) 40%, transparent)" rx="3"/>`;
    labelHTML += `<text x="${x + barWidth / 2}" y="${H - 15}" text-anchor="middle" fill="var(--color-text-faint)" font-size="10">${d.date?.split("-")[2] ?? ""}</text>`;
  });

  $el("dauGrid").innerHTML = gridHTML;
  $el("dauBars").innerHTML = barHTML;
  $el("dauLabels").innerHTML = labelHTML;
}

async function renderPlatformBreakdown(qs = "") {
  const response = await FetchData(`/analytics/device-distribution${qs}`, true);
  if (!response.success) return;
  const data = extractData(response);
  if (!data?.distribution?.length) return;

  const d = transformDeviceData(data.distribution);
  ["desktop", "mobile", "tablet", "other"].forEach((key) => {
    const bar = $el("bar-" + key);
    const val = $el("val-" + key);
    if (bar) {
      bar.style.width = "0%";
      requestAnimationFrame(() => {
        bar.style.width = d[key] + "%";
      });
    }
    if (val) val.textContent = d[key] + "%";
  });
}

async function renderServiceDonut(qs = "") {
  const response = await FetchData(`/analytics/service-usage${qs}`, true);
  if (!response.success) return;
  const data = extractData(response);
  if (!data?.services?.length) return;

  const services = data.services;
  const colors = ["#FF8500", "#fc9e3a", "#faba75", "#f8d2a9"];
  const radius = 40;
  const circ = 2 * Math.PI * radius;
  let total = 0,
    offset = 0,
    segHTML = "",
    legHTML = "";

  services.forEach((item, i) => {
    total += item.count;
    const color = colors[i % colors.length];
    const dash = (item.percentage / 100) * circ;
    const off = (offset / 100) * circ;
    segHTML += `<circle cx="50" cy="50" r="${radius}" fill="transparent" stroke="${color}" stroke-width="10" stroke-dasharray="${dash} ${circ}" stroke-dashoffset="-${off}" transform="rotate(-90 50 50)" />`;
    legHTML += `<div class="legend-item"><span class="color-box" style="background:${color}"></span>${item.service.replace(/_/g, " ")}<strong>${item.percentage}%</strong></div>`;
    offset += item.percentage;
  });

  $el("donutSegments").innerHTML = segHTML;
  $el("donutLegend").innerHTML = legHTML;
  $el("totalHits").textContent = total;
}

async function renderLearningFunnel(qs = "") {
  const response = await FetchData(`/analytics/conversion-rate${qs}`, true);
  if (!response.success) return;
  const data = extractData(response);
  if (!data?.conversion) return;

  const c = data.conversion;
  const servicePct = (
    (c.active_service_users / c.total_registered_users) *
    100
  ).toFixed(0);
  const ratePct = c.conversion_rate.toFixed(0);

  $el("pct-login").textContent = "100%";
  $el("pct-service").textContent = servicePct + "%";
  $el("pct-rate").textContent = ratePct + "%";

  ["fill-login", "fill-service", "fill-rate"].forEach((id) => {
    const el = $el(id);
    if (el) el.style.width = "0%";
  });
  setTimeout(() => {
    $el("fill-login").style.width = "100%";
    $el("fill-service").style.width = servicePct + "%";
    $el("fill-rate").style.width = ratePct + "%";
  }, 80);
}

async function renderEngagementRadar(engagementData, qs = "") {
  let data = engagementData;
  if (!data) {
    const response = await FetchData(`/analytics/engagement${qs}`, true);
    if (!response.success) return;
    data = extractData(response);
  }
  if (!data?.engagement?.length) return;

  const users = data.engagement;
  const cx = 100,
    cy = 100,
    radius = 80;
  const colors = ["#0097b2", "#ff4081", "#7c4dff"];
  const axes = [
    { name: "Events", key: "total_events", max: 15 },
    { name: "Depth", key: "depth_score", max: 1.0 },
    { name: "Variety", key: "distinct_event_types", max: 5 },
  ];
  const angleStep = (Math.PI * 2) / axes.length;

  let gridHTML = "",
    shapeHTML = "",
    labelHTML = "",
    legHTML = "";

  for (let i = 1; i <= 3; i++) {
    const r = (radius / 3) * i;
    const pts = axes
      .map((_, j) => {
        const x = cx + r * Math.cos(j * angleStep - Math.PI / 2);
        const y = cy + r * Math.sin(j * angleStep - Math.PI / 2);
        return `${x},${y}`;
      })
      .join(" ");
    gridHTML += `<polygon points="${pts}" class="radar-grid" />`;
  }

  axes.forEach((axis, j) => {
    const x = cx + (radius + 15) * Math.cos(j * angleStep - Math.PI / 2);
    const y = cy + (radius + 15) * Math.sin(j * angleStep - Math.PI / 2);
    labelHTML += `<text x="${x}" y="${y}" class="radar-label" text-anchor="middle">${axis.name}</text>`;
  });

  users.forEach((user, i) => {
    const color = colors[i % colors.length];
    const pts = axes
      .map((axis, j) => {
        const val = Math.min(user[axis.key] / axis.max, 1);
        const x = cx + radius * val * Math.cos(j * angleStep - Math.PI / 2);
        const y = cy + radius * val * Math.sin(j * angleStep - Math.PI / 2);
        return `${x},${y}`;
      })
      .join(" ");
    shapeHTML += `<polygon points="${pts}" class="radar-shape" stroke="${color}" fill="${color}" />`;
    legHTML += `<div class="legend-item"><span class="dot" style="background:${color};border-radius:50%"></span> User ${user.user_id}</div>`;
  });

  $el("radarGrid").innerHTML = gridHTML;
  $el("radarShapes").innerHTML = shapeHTML;
  $el("radarLabels").innerHTML = labelHTML;
  $el("radarLegend").innerHTML = legHTML;
}

async function loadAnalytics(qs = "") {
  await renderHeatmap(qs);

  const engResponse = await FetchData(`/analytics/engagement${qs}`, true);
  const engData = engResponse.success ? extractData(engResponse) : null;

  renderSteppedChart(engData, qs);
  renderEngagementRadar(engData, qs);

  await renderDAUChart(qs);
  await renderPlatformBreakdown(qs);
  await renderServiceDonut(qs);
  await renderLearningFunnel(qs);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 7. ANALYTICS DATE FILTER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function applyDateFilter() {
  const qs = buildDateQuery();
  document.querySelector("#retentionTable tbody").innerHTML = "";
  [
    "chartAxes",
    "stepLine",
    "stepArea",
    "dauGrid",
    "dauBars",
    "dauLabels",
    "donutSegments",
    "donutLegend",
    "radarGrid",
    "radarShapes",
    "radarLabels",
    "radarLegend",
  ].forEach((id) => {
    const el = $el(id);
    if (el) el.innerHTML = "";
  });
  loadAnalytics(qs);
}

function resetDateFilter() {
  const from = $el("analytics-date-from");
  const to = $el("analytics-date-to");
  if (from) from.value = "";
  if (to) to.value = "";
  applyDateFilter();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 8. SUBSCRIPTION RENDER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function renderSubStats() {
  const [plansRes, requestsRes, subsRes, usersRes] = await Promise.all([
    FetchData("/allplans", true),
    FetchData("/allrequests", true),
    FetchData("/all-subscriptions", true),
    FetchData("/users-subscriptions", true),
  ]);
  const plans = plansRes.success ? (extractData(plansRes) ?? []) : [];
  const requests = requestsRes.success ? (extractData(requestsRes) ?? []) : [];
  const subs = subsRes.success ? (extractData(subsRes) ?? []) : [];
  const userList = usersRes.success ? (extractData(usersRes) ?? []) : [];

  $el("stat-plans").textContent = plans.length;
  $el("stat-requests").textContent = requests.filter(
    (r) => r.status === "pending",
  ).length;
  $el("stat-active").textContent = subs.filter((s) => s.active).length;
  $el("stat-users").textContent = userList.length;

  const activeSubEl = $el("totalActiveSubs");
  if (activeSubEl)
    activeSubEl.textContent = subs.filter((s) => s.active).length;
}

async function renderPlans() {
  const tbody = $el("plans-tbody");
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
      <td class="col-actions">
        <div class="row-actions">
          <button class="btn btn-secondary btn-icon" title="Edit"   data-action="edit-plan"   data-id="${p.id}"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-danger    btn-icon" title="Delete" data-action="delete-plan" data-id="${p.id}"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>`,
    )
    .join("");
}

async function renderRequests() {
  const tbody = $el("requests-tbody");
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
      <td class="col-actions">
        <div class="row-actions">
          ${
            r.status === "pending"
              ? `<button class="btn btn-success btn-sm" data-action="approve-request" data-id="${r.id}"><i class="fa-solid fa-check"></i> Approve</button>
               <button class="btn btn-danger  btn-sm" data-action="reject-request"  data-id="${r.id}"><i class="fa-solid fa-xmark"></i> Reject</button>`
              : `<span class="badge badge-${r.status}">${r.status}</span>`
          }
        </div>
      </td>
    </tr>`,
    )
    .join("");
}

async function renderSubs() {
  const tbody = $el("subs-tbody");
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
      <td class="col-actions">
        <button class="btn btn-secondary btn-sm" data-action="view-sub" data-id="${s.id}"><i class="fa-solid fa-eye"></i> Details</button>
      </td>
    </tr>`,
    )
    .join("");
}

async function renderSubUsers() {
  const tbody = $el("sub-users-tbody");
  if (!tbody) return;
  const response = await FetchData("/users-subscriptions", true);
  if (!response.success) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty"><i class="fa-solid fa-users"></i>${response.userMessage}</div></td></tr>`;
    return;
  }
  const userList = extractData(response) ?? [];
  tbody.innerHTML = userList
    .map(
      (u) => `
    <tr data-search="${u.email}">
      <td class="mono">#${u.user_id}</td>
      <td>${u.email}</td>
      <td>${u.active ? `<span class="badge badge-active">${u.plan_name ?? "Active"}</span>` : '<span class="badge badge-inactive">None</span>'}</td>
      <td><span class="badge badge-${u.active ? "active" : "inactive"}">${u.active ? "Active" : "No Sub"}</span></td>
      <td class="col-actions">
        <button class="btn btn-secondary btn-sm" data-action="view-history" data-id="${u.user_id}"><i class="fa-solid fa-clock-rotate-left"></i> History</button>
      </td>
    </tr>`,
    )
    .join("");
}

async function renderAll() {
  await Promise.all([
    renderRequests(),
    renderSubs(),
    renderSubUsers(),
    renderPlans(),
    renderSubStats(),
  ]);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 9. TOPICS MANAGEMENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function loadTopics() {
  const topicsList = $el("topicsList");
  topicsList.innerHTML = "";
  const response = await FetchData("/topic", true);
  if (handleApiResponse(response)) return;

  const data = response.data.data || [];
  $el("totalTopics").textContent = data.length;

  data.forEach((topic) => {
    const card = document.createElement("div");
    card.className = "topic-card";
    card.innerHTML = `
      <div class="topic-header-section">
        <div class="topic-info">
          <h3>${topic.name}</h3>
          <p>${topic.description || "No description provided"}</p>
        </div>
        <div class="topic-actions">
          <button class="btn-edit"   data-action="edit-topic"   data-id="${topic.id}">Edit</button>
          <button class="btn-delete" data-action="delete-topic" data-id="${topic.id}">Delete</button>
        </div>
      </div>
      <div class="subtopics-container">
        <div class="subtopics-header">
          <h4>Subtopics (${topic.subtopics.length})</h4>
          <button class="btn-small" data-action="add-subtopic" data-topic-id="${topic.id}">
            <i class="fas fa-plus"></i> Add Subtopic
          </button>
        </div>
        <div class="subtopics-grid">
          ${topic.subtopics
            .map(
              (sub) => `
            <div class="subtopic-item">
              <span>${sub.name}</span>
              <div class="subtopic-actions">
                <button data-action="edit-subtopic"   data-topic-id="${topic.id}" data-id="${sub.id}" title="Edit"><i class="fas fa-edit"></i></button>
                <button data-action="delete-subtopic" data-topic-id="${topic.id}" data-id="${sub.id}" title="Delete"><i class="fas fa-trash"></i></button>
              </div>
            </div>`,
            )
            .join("")}
        </div>
      </div>`;
    topicsList.appendChild(card);
  });
}

async function openTopicModal(topicId) {
  const form = $el("topicForm");
  const subSec = $el("subtopicsSection");
  form.reset();
  $el("topicId").value = "";
  subSec.classList.add("hidden");

  if (topicId) {
    const response = await FetchData(`/topic/${topicId}`, true);
    if (handleApiResponse(response)) return;
    const topic = response.data.data;
    if (topic) {
      $el("topicModalTitle").textContent = "Edit Topic";
      $el("topicId").value = topic.id;
      $el("topicName").value = topic.name;
      subSec.classList.remove("hidden");
      loadSubtopicsForEdit(topic);
    }
  } else {
    $el("topicModalTitle").textContent = "Add New Topic";
  }
  openModal("topicModal");
}

function loadSubtopicsForEdit(topic) {
  const list = $el("subtopicsList");
  list.innerHTML = "";
  topic.subtopics.forEach((sub) => {
    const field = document.createElement("div");
    field.className = "subtopic-field";
    field.innerHTML = `
      <input type="text" value="${sub.name}" data-subtopic-id="${sub.id}">
      <button type="button" data-action="remove-subtopic-field" data-id="${sub.id}">Remove</button>`;
    list.appendChild(field);
  });
}

function addSubtopicField() {
  const field = document.createElement("div");
  field.className = "subtopic-field";
  field.innerHTML = `
    <input type="text" placeholder="Enter subtopic name" data-subtopic-id="new">
    <button type="button" data-action="remove-subtopic-field">Remove</button>`;
  $el("subtopicsList").appendChild(field);
}

function removeSubtopicField(button, subtopicId) {
  if (subtopicId) {
    showConfirmPopup("Are you sure you want to delete this subtopic?", () =>
      button.parentElement.remove(),
    );
  } else {
    button.parentElement.remove();
  }
}

async function handleTopicSubmit(event) {
  event.preventDefault();
  const topicId = $el("topicId").value;
  const name = $el("topicName").value;
  if (topicId) {
    const response = await UpdateData(
      "/topic",
      { id: topicId, topicName: name },
      true,
    );
    if (handleApiResponse(response)) return;
    showSuccessPopup("Topic updated successfully.");
  } else {
    const response = await PostData("/topic", { topicName: name }, true);
    if (handleApiResponse(response)) return;
    showSuccessPopup("Topic created successfully.");
  }
  closeModal("topicModal");
  loadTopics();
  populateTopicSelects();
}

async function deleteTopic(topicId) {
  showConfirmPopup(
    "Are you sure you want to delete this topic? All associated subtopics will also be removed.",
    async () => {
      const response = await DeleteData("/topic", { id: topicId }, true);
      if (handleApiResponse(response)) return;
      loadTopics();
      populateTopicSelects();
    },
  );
}

async function openSubtopicModal(topicId, subtopicId) {
  const form = $el("subtopicForm");
  form.reset();
  $el("subtopicTopicId").value = topicId;
  if (subtopicId) {
    const response = await FetchData(`/topic/${subtopicId}`, true);
    if (handleApiResponse(response)) return;
    const subtopic = response.data.data;
    if (subtopic) {
      $el("subtopicModalTitle").textContent = "Edit Subtopic";
      $el("subtopicId").value = subtopic.id;
      $el("subtopicName").value = subtopic.name;
    }
  } else {
    $el("subtopicModalTitle").textContent = "Add New Subtopic";
    $el("subtopicId").value = "";
  }
  openModal("subtopicModal");
}

async function handleSubtopicSubmit(event) {
  event.preventDefault();
  const topicId = parseInt($el("subtopicTopicId").value);
  const subtopicId = $el("subtopicId").value;
  const name = $el("subtopicName").value.trim();
  if (subtopicId) {
    const response = await UpdateData(
      "/topic",
      { id: subtopicId, topicName: name },
      true,
    );
    if (handleApiResponse(response)) return;
    showSuccessPopup("Subtopic updated successfully.");
  } else {
    const response = await PostData(
      "/subtopic",
      { subtopicName: name, parentId: topicId },
      true,
    );
    if (handleApiResponse(response)) return;
    showSuccessPopup("Subtopic created successfully.");
  }
  closeModal("subtopicModal");
  loadTopics();
}

async function deleteSubtopic(subtopicId) {
  showConfirmPopup(
    "Are you sure you want to delete this subtopic?",
    async () => {
      const response = await DeleteData("/topic", { id: subtopicId }, true);
      if (handleApiResponse(response)) return;
      loadTopics();
      populateTopicSelects();
    },
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 10. QUESTIONS MANAGEMENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function loadQuestions() {
  const tbody = $el("questionsTableBody");
  tbody.innerHTML = "";
  const response = await FetchData("/questions", true);
  if (handleApiResponse(response)) return;

  const qs = response.data.data;
  $el("totalQuestions").textContent = qs.length;

  qs.forEach((question) => {
    const row = document.createElement("tr");
    row.setAttribute("data-topic-id", `${question.topic_id}`);
    row.innerHTML = `
      <td>${question.question_id}</td>
      <td class="question-text" title="${question.content}">${question.content}</td>
      <td>
        <div class="table-actions">
          <button class="btn-edit"   data-action="edit-question"   data-id="${question.question_id}">Edit</button>
          <button class="btn-delete" data-action="delete-question" data-id="${question.question_id}">Delete</button>
        </div>
      </td>`;
    tbody.appendChild(row);
  });
}

async function openQuestionModal(questionId) {
  const form = $el("questionForm");
  const imagePreview = $el("imagePreview");

  form.reset();
  imagePreview.innerHTML = "";
  $el("questionId").value = "";
  $el("removeImageContainer").classList.add("hidden");

  if (questionId) {
    const response = await FetchData(`/question/${questionId}`, true);
    if (handleApiResponse(response)) return;
    const question = response.data.data;
    if (question) {
      $el("questionModalTitle").textContent = "Edit Question";
      $el("questionId").value = questionId;
      $el("questionStatement").value = question.statement;
      $el("questionTopic").value = question.topicId;
      ["A", "B", "C", "D"].forEach((k) => {
        const inp = $el(`option${k}`);
        inp.value = question.options[k].text;
        inp.setAttribute("option-id", question.options[k].id);
      });
      document.querySelector(
        `input[value="${question.correctAnswer}"]`,
      ).checked = true;
      if (question.image) {
        let src = question.image;
        if (!src.startsWith("data:") && !src.startsWith("http"))
          src = "data:image/png;base64," + src;
        imagePreview.innerHTML = `<img src="${src}" alt="Question Image">`;
        $el("removeImageContainer").classList.remove("hidden");
      }
    }
  } else {
    $el("questionModalTitle").textContent = "Add New Question";
  }
  openModal("questionModal");
}

function previewImage(event) {
  const file = event.target.files[0];
  const preview = $el("imagePreview");
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    };
    reader.readAsDataURL(file);
  } else {
    preview.innerHTML = "";
  }
}

function buildTopicOptionsHtml(topics) {
  return topics
    .map(
      (cat) => `
    <optgroup label="${cat.name}">
      <option value="${cat.id}">${cat.name}</option>
      ${cat.subtopics.map((sub) => `<option value="${sub.id}">${sub.name}</option>`).join("")}
    </optgroup>`,
    )
    .join("");
}

async function populateTopicSelects(...selects) {
  const response = await FetchData("/topic", true);
  if (handleApiResponse(response)) return;
  const optionsHtml = buildTopicOptionsHtml(response.data.data || []);

  if (!selects.length) {
    const filterTopic = $el("filterTopic");
    const modalSelect = $el("questionTopic");
    if (filterTopic)
      filterTopic.innerHTML =
        '<option value="">All Topics</option>' + optionsHtml;
    if (modalSelect)
      modalSelect.innerHTML =
        '<option value="">Select topic</option>' + optionsHtml;
  }
  for (const select of selects) {
    if (select)
      select.innerHTML = '<option value="">Select topic</option>' + optionsHtml;
  }
}

async function handleQuestionSubmit(event) {
  event.preventDefault();
  const questionId = $el("questionId").value;
  const statement = $el("questionStatement").value;
  const topicId = parseInt($el("questionTopic").value);
  const correctAnswer = document.querySelector(
    'input[name="correctAnswer"]:checked',
  ).value;

  const formData = new FormData();
  formData.append("statement", statement);
  formData.append("topicId", topicId);
  formData.append("correctAnswer", correctAnswer);

  const imageInput = $el("questionImage");
  const removeImageCheckbox = $el("removeImage");
  if (removeImageCheckbox?.checked) {
    formData.append("removeImage", "true");
  } else if (imageInput?.files?.[0]) {
    formData.append("image", imageInput.files[0]);
  }

  if (questionId) {
    formData.append("id", questionId);
    formData.append(
      "options",
      JSON.stringify({
        A: {
          id: $el("optionA").getAttribute("option-id"),
          text: $el("optionA").value,
        },
        B: {
          id: $el("optionB").getAttribute("option-id"),
          text: $el("optionB").value,
        },
        C: {
          id: $el("optionC").getAttribute("option-id"),
          text: $el("optionC").value,
        },
        D: {
          id: $el("optionD").getAttribute("option-id"),
          text: $el("optionD").value,
        },
      }),
    );
    const response = await UpdateData("/question", formData, true);
    if (handleApiResponse(response)) return;
    showSuccessPopup("Question updated successfully.");
  } else {
    formData.append(
      "options",
      JSON.stringify({
        A: $el("optionA").value,
        B: $el("optionB").value,
        C: $el("optionC").value,
        D: $el("optionD").value,
      }),
    );
    const response = await PostData("/question", formData, true);
    if (handleApiResponse(response)) return;
    showSuccessPopup("Question created successfully.");
  }
  closeModal("questionModal");
  loadQuestions();
}

async function deleteQuestion(questionId) {
  showConfirmPopup(
    "Are you sure you want to delete this question?",
    async () => {
      const response = await DeleteData("/question", { id: questionId }, true);
      if (handleApiResponse(response)) return;
      loadQuestions();
    },
  );
}

function filterQuestions() {
  const filterTopic = $el("filterTopic").value;
  document.querySelectorAll("tr[data-topic-id]").forEach((row) => {
    row.style.display =
      !filterTopic ||
      row.getAttribute("data-topic-id") === filterTopic.toString()
        ? ""
        : "none";
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 11. CONTENT USERS MANAGEMENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function loadUsers() {
  const tbody = $el("usersTableBody");
  tbody.innerHTML = "";
  const response = await FetchData("/users", true);
  if (handleApiResponse(response)) return;
  _users = response.data.data;
  $el("totalUsers").textContent = _users.length;
  renderUsersTable(_users);
}

function renderUsersTable(data) {
  const tbody = $el("usersTableBody");
  tbody.innerHTML = "";
  data.forEach((user) => {
    const isDeactivated = !user.is_active || user.deleted_at !== null;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${user.id}</td>
      <td>${user.email}</td>
      <td>${user.role.toUpperCase()}</td>
      <td><span class="status-badge ${isDeactivated ? "status-inactive" : "status-active"}">${isDeactivated ? "Inactive" : "Active"}</span></td>
      <td>
        <div class="table-actions">
          ${
            isDeactivated
              ? `<button class="btn-activate" data-action="activate-user" data-id="${user.id}">Activate</button>`
              : `<button class="btn-edit"   data-action="edit-user"   data-id="${user.id}">Edit</button>
               <button class="btn-delete" data-action="delete-user" data-id="${user.id}">Delete</button>`
          }
        </div>
      </td>`;
    tbody.appendChild(row);
  });
}

function openUserModal(userId) {
  const form = $el("userForm");
  const passwordHelp = $el("passwordHelp");
  const passwordInput = $el("userPassword");
  form.reset();
  $el("userId").value = "";

  if (userId) {
    const user = _users.find((u) => u.id === userId);
    if (user) {
      $el("userModalTitle").textContent = "Edit User";
      $el("userId").value = user.id;
      passwordInput.required = false;
      passwordHelp.classList.remove("hidden");
    }
  } else {
    $el("userModalTitle").textContent = "Add New User";
    passwordInput.required = true;
    passwordHelp.classList.add("hidden");
  }
  openModal("userModal");
}

async function handleUserSubmit(event) {
  event.preventDefault();
  const userId = $el("userId").value;
  const password = $el("userPassword").value;
  if (userId) {
    const response = await UpdateData(
      "/admin/reset-password",
      { id: parseInt(userId), password },
      true,
    );
    if (handleApiResponse(response)) return;
    showSuccessPopup("Password reset successfully.");
  }
  closeModal("userModal");
  loadUsers();
}

async function deleteUser(userId) {
  showConfirmPopup(
    "Are you sure you want to deactivate this user?",
    async () => {
      const response = await UpdateData(
        `/admin/deactivate-user/${userId}`,
        { id: userId },
        true,
      );
      if (handleApiResponse(response)) return;
      loadUsers();
    },
  );
}

async function activateUser(userId) {
  showConfirmPopup("Are you sure you want to activate this user?", async () => {
    const response = await UpdateData(
      `/admin/activate-user/${userId}`,
      { id: userId },
      true,
    );
    if (handleApiResponse(response)) return;
    loadUsers();
  });
}

function filterUsers() {
  const filterRole = $el("filterUserRole").value;
  const searchTerm = $el("searchUser").value.toLowerCase();
  const filtered = _users.filter((u) => {
    const matchesRole = !filterRole || u.role === filterRole;
    const matchesSearch =
      !searchTerm ||
      u.name?.toLowerCase().includes(searchTerm) ||
      u.email.toLowerCase().includes(searchTerm);
    return matchesRole && matchesSearch;
  });
  renderUsersTable(filtered);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 12. EXAMS MANAGEMENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function loadExams() {
  const examsList = $el("examsList");
  examsList.innerHTML = "";
  const response = await FetchData("/quizzes", true);
  if (handleApiResponse(response)) return;

  const exams = response.data.data;
  if (!exams.length) {
    examsList.innerHTML = `<div class="empty"><i class="fas fa-file-alt"></i>No exams created yet. Click "Add Exam" to get started.</div>`;
    return;
  }

  exams.forEach((exam) => {
    const card = document.createElement("div");
    card.className = "exam-card";
    card.innerHTML = `
      <div class="exam-card-header">
        <div>
          <h3>${exam.title}</h3>
          <p>${exam.description || "No description provided"}</p>
        </div>
        <div class="exam-actions">
          <button class="btn-edit"   data-action="edit-exam"   data-id="${exam.quiz_id}"><i class="fas fa-edit"></i> Edit</button>
          <button class="btn-delete" data-action="delete-exam" data-id="${exam.quiz_id}"><i class="fas fa-trash"></i> Delete</button>
        </div>
      </div>
      <div class="exam-meta">
        <div class="exam-meta-item"><i class="fas fa-question-circle"></i><span><strong>${exam.question_count}</strong> Questions</span></div>
        <div class="exam-meta-item"><i class="fas fa-calendar"></i><span>Created: ${exam.publish_date}</span></div>
      </div>`;
    examsList.appendChild(card);
  });
}

async function openExamModal(examId) {
  const form = $el("examForm");
  form.reset();
  $el("examId").value = "";
  _selectedQuestionIds = [];

  const topicFilter = $el("examQuestionTopicFilter");
  topicFilter.innerHTML = '<option value="">All Topics</option>';
  await populateTopicSelects(topicFilter);

  if (examId) {
    const response = await FetchData(`/quiz-admin/${examId}`, true);
    if (handleApiResponse(response)) return;
    const exam = response.data.data;
    if (exam) {
      $el("examModalTitle").textContent = "Edit Exam";
      $el("examId").value = exam.quiz_id;
      $el("examName").value = exam.title;
      $el("examDescription").value = exam.description || "";
      _selectedQuestionIds = exam.questions.slice();
    }
  } else {
    $el("examModalTitle").textContent = "Add New Exam";
  }
  await loadAvailableQuestions();
  updateSelectedQuestionsDisplay();
  openModal("examModal");
}

async function loadAvailableQuestions() {
  const container = $el("availableQuestions");
  const topicFilter = $el("examQuestionTopicFilter").value;
  const searchTerm = $el("examQuestionSearch").value.toLowerCase().trim();

  const response = await FetchData("/questions", true);
  if (handleApiResponse(response)) return;
  _questions = response.data.data;

  const filtered = _questions.filter((q) => {
    const matchesTopic = !topicFilter || String(q.topic_id) === topicFilter;
    const matchesSearch =
      !searchTerm || q.content.toLowerCase().includes(searchTerm);
    return matchesTopic && matchesSearch;
  });

  container.innerHTML = "";
  filtered.forEach((question) => {
    const isSelected = _selectedQuestionIds.indexOf(question.question_id) > -1;
    const item = document.createElement("div");
    item.className = "question-checkbox-item";
    item.innerHTML = `
      <input type="checkbox" id="q-${question.question_id}" ${isSelected ? "checked" : ""} data-question-id="${question.question_id}">
      <div class="question-checkbox-content"><strong>${question.content}</strong></div>`;
    container.appendChild(item);
  });
}

function toggleQuestionSelection(questionId) {
  const index = _selectedQuestionIds.indexOf(questionId);
  if (index > -1) _selectedQuestionIds.splice(index, 1);
  else _selectedQuestionIds.push(questionId);
  updateSelectedQuestionsDisplay();
}

function updateSelectedQuestionsDisplay() {
  const container = $el("selectedQuestions");
  $el("selectedCount").textContent = _selectedQuestionIds.length;
  if (!_selectedQuestionIds.length) {
    container.innerHTML =
      '<p class="no-selection">No questions selected yet</p>';
    return;
  }
  container.innerHTML = "";
  _selectedQuestionIds.forEach((qId) => {
    const question = _questions.find((q) => q.question_id === qId);
    if (question) {
      const item = document.createElement("div");
      item.className = "selected-question-item";
      item.innerHTML = `
        <span>${question.content.substring(0, 60)}${question.content.length > 60 ? "…" : ""}</span>
        <button type="button" data-action="remove-selected-question" data-id="${qId}"><i class="fas fa-times"></i></button>`;
      container.appendChild(item);
    }
  });
}

function removeQuestionFromSelection(questionId) {
  const index = _selectedQuestionIds.indexOf(questionId);
  if (index > -1) _selectedQuestionIds.splice(index, 1);
  const checkbox = $el("q-" + questionId);
  if (checkbox) checkbox.checked = false;
  updateSelectedQuestionsDisplay();
}

async function handleExamSubmit(event) {
  event.preventDefault();
  if (!_selectedQuestionIds.length) {
    showInfoPopup(
      "No Questions Selected",
      "Please select at least one question.",
      "fas fa-exclamation-circle",
      "#e67e22",
    );
    return;
  }
  const examId = $el("examId").value;
  const title = $el("examName").value;
  const description = $el("examDescription").value;

  if (examId) {
    const response = await UpdateData(
      "/quiz",
      {
        quiz_id: examId,
        title,
        description,
        questions: _selectedQuestionIds.slice(),
      },
      true,
    );
    if (handleApiResponse(response)) return;
    showSuccessPopup("Exam updated successfully.");
  } else {
    const response = await PostData(
      "/quiz",
      { title, description, questions: _selectedQuestionIds.slice() },
      true,
    );
    if (handleApiResponse(response)) return;
    showSuccessPopup("Exam created successfully.");
  }
  closeModal("examModal");
  _selectedQuestionIds = [];
  loadExams();
}

async function deleteExam(examId) {
  showConfirmPopup("Are you sure you want to delete this exam?", async () => {
    const response = await DeleteData("/quiz", { id: examId }, true);
    if (handleApiResponse(response)) return;
    loadExams();
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 13. SUBSCRIPTION PLANS MANAGEMENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function openNewPlanModal() {
  $el("plan-modal-title").textContent = "New Subscription Plan";
  $el("plan-id").value = "";
  [
    "plan-name",
    "plan-price",
    "plan-duration",
    "plan-quizzes",
    "plan-templates",
    "plan-topic-quizzes",
    "plan-desc",
  ].forEach((id) => ($el(id).value = ""));
  openSubModal("modal-plan");
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

  $el("plan-modal-title").textContent = "Edit Plan";
  $el("plan-id").value = p.id;
  $el("plan-name").value = p.plan_name;
  $el("plan-price").value = p.price;
  $el("plan-duration").value = p.duration_days;
  $el("plan-quizzes").value = p.no_quizzes;
  $el("plan-templates").value = p.no_template_exams;
  $el("plan-topic-quizzes").value = p.no_topic_quizzes;
  $el("plan-desc").value = p.description;
  openSubModal("modal-plan");
}

async function savePlan() {
  const id = $el("plan-id").value;
  const name = $el("plan-name").value.trim();
  const price = parseInt($el("plan-price").value);
  const duration = parseInt($el("plan-duration").value);
  const quizzes = parseInt($el("plan-quizzes").value);
  const templates = parseInt($el("plan-templates").value);
  const topicQuizzes = parseInt($el("plan-topic-quizzes").value);
  const description = $el("plan-desc").value.trim();

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
    topic_quizzes: topicQuizzes,
    description,
  };
  const response = id
    ? await UpdateData(`/plans/${id}`, payload, true)
    : await PostData("/plans", payload, true);
  notify(
    response.success
      ? id
        ? "Plan updated ✓"
        : "Plan created ✓"
      : response.userMessage,
  );
  closeSubModal("modal-plan");
  await renderAll();
}

async function deletePlan(id) {
  if (!confirm("Delete this plan?")) return;
  const response = await DeleteData(`/plans/${id}`, {}, true);
  notify(response.success ? "Plan deleted ✓" : response.userMessage);
  await renderAll();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 14. SUBSCRIPTION REQUESTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 15. SUBSCRIPTION DETAILS & HISTORY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

  $el("sub-detail-content").innerHTML = `
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
      <div class="detail-item"><p class="detail-item-label">Quizzes Left</p><p class="detail-item-val detail-quota">${s.remaining_quizzes}</p></div>
      <div class="detail-item"><p class="detail-item-label">Template Exams</p><p class="detail-item-val detail-quota">${s.remaining_template_exams}</p></div>
      <div class="detail-item"><p class="detail-item-label">Topic Quizzes</p><p class="detail-item-val detail-quota">${s.remaining_topic_quizzes}</p></div>
    </div>
    <div class="btn-row" style="margin-top:20px">
      <button class="btn ${s.active ? "btn-danger" : "btn-success"} btn-sm"
              data-action="${s.active ? "deactivate-sub" : "activate-sub"}"
              data-id="${s.sub_id ?? s.id}">
        ${s.active ? "Deactivate" : "Activate"}
      </button>
    </div>`;
  openSubModal("modal-sub-detail");
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
  closeSubModal("modal-sub-detail");
  await renderAll();
}

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

  $el("history-modal-title").textContent = `History — User #${data.user_id}`;

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
          s.active && !isExpired
            ? "var(--color-success)"
            : "var(--color-text-faint)";
        return `
        <div class="history-item">
          <div class="history-dot" style="background:${dotColor}"></div>
          <div>
            <div class="history-label">${s.plan_name} — <span class="badge badge-${badgeClass}">${statusLabel}</span></div>
            <div class="history-meta">${timeFormat(s.start_date)} → ${timeFormat(s.expiry_date)}</div>
            <div class="history-quota">Remaining: Q: ${s.remaining_quizzes} | E: ${s.remaining_template_exams} | T: ${s.remaining_topic_quizzes}</div>
            <div class="btn-row" style="margin-top:8px">
              <button class="btn ${s.active ? "btn-danger" : "btn-success"} btn-xs"
                      data-action="${s.active ? "deactivate-sub" : "activate-sub"}"
                      data-id="${s.sub_id ?? s.id}">
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
            ? "var(--color-success)"
            : r.status === "rejected" || r.status === "canceled"
              ? "var(--color-danger)"
              : "var(--color-warning)";
        return `
        <div class="history-item">
          <div class="history-dot" style="background:${dotColor}"></div>
          <div>
            <div class="history-label">${r.plan_name} — <span class="badge badge-${r.status}">${r.status}</span></div>
            <div class="history-meta">Requested: ${timeFormat(r.request_date)}</div>
          </div>
        </div>`;
      })
      .join("");
  } else {
    html += '<div class="empty">No requests</div>';
  }

  $el("user-history-content").innerHTML = html;
  openSubModal("modal-user-history");
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 16. BOOTSTRAP — DOMContentLoaded
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

document.addEventListener("DOMContentLoaded", async function () {
  // ── Initial data loads ──
  initializeCharts();
  loadTopics();
  loadQuestions();
  loadUsers();
  loadExams();
  populateTopicSelects();
  renderAll();
  setupAvatarDropdown();

  // ── Logout ──
  
  if (useremail) {
        const res = await FetchData("/user/profile", true);
        useremail.textContent = res.success
          ? (res.data?.data?.email ?? "Unknown User")
          : "Unknown User";
      }

  // ── Sidebar ──
  $el("menuBtn")?.addEventListener("click", toggleSidebar);
  $el("sidebar-overlay")?.addEventListener("click", closeSidebar);

  // ── Mode nav buttons ──
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

  // ── Sidebar nav items ──
  document.querySelectorAll(".nav-item[data-section]").forEach((item) => {
    item.addEventListener("click", () => showSection(item.dataset.section));
  });

  // ── Content add buttons ──
  $el("btn-add-topic")?.addEventListener("click", () => openTopicModal(null));
  $el("btn-add-question")?.addEventListener("click", () =>
    openQuestionModal(null),
  );
  $el("btn-add-user")?.addEventListener("click", () => openUserModal(null));
  $el("btn-add-exam")?.addEventListener("click", () => openExamModal(null));
  $el("btn-add-subtopic-field")?.addEventListener("click", addSubtopicField);

  // ── Form submissions ──
  $el("topicForm")?.addEventListener("submit", handleTopicSubmit);
  $el("questionForm")?.addEventListener("submit", handleQuestionSubmit);
  $el("userForm")?.addEventListener("submit", handleUserSubmit);
  $el("subtopicForm")?.addEventListener("submit", handleSubtopicSubmit);
  $el("examForm")?.addEventListener("submit", handleExamSubmit);

  // ── Filters & search ──
  $el("filterTopic")?.addEventListener("change", filterQuestions);
  $el("searchQuestion")?.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();
    document.querySelectorAll("#questionsTable tbody tr").forEach((row) => {
      const qt = row.querySelector(".question-text");
      if (qt)
        row.style.display = qt.textContent.toLowerCase().includes(q)
          ? ""
          : "none";
    });
  });
  $el("filterUserRole")?.addEventListener("change", filterUsers);
  $el("searchUser")?.addEventListener("input", filterUsers);
  $el("examQuestionTopicFilter")?.addEventListener(
    "change",
    loadAvailableQuestions,
  );
  $el("examQuestionSearch")?.addEventListener("input", loadAvailableQuestions);
  $el("questionImage")?.addEventListener("change", previewImage);

  // ── Analytics date filter ──
  $el("btn-apply-date-filter")?.addEventListener("click", applyDateFilter);
  $el("btn-reset-date-filter")?.addEventListener("click", resetDateFilter);

  // ── Admin modal closers (data-modal attribute) ──
  document.querySelectorAll("[data-modal]").forEach((button) => {
    button.addEventListener("click", () =>
      closeModal(button.getAttribute("data-modal")),
    );
  });

  // ── Close admin modals by clicking backdrop ──
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("active");
    });
  });

  // ── Subscription modal: New Plan button ──
  $el("btn-new-plan")?.addEventListener("click", openNewPlanModal);
  $el("btn-save-plan")?.addEventListener("click", savePlan);

  // ── Close subscription modals via data-close ──
  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", () => closeSubModal(btn.dataset.close));
  });

  // ── Close subscription modals by clicking overlay ──
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeSubModal(overlay.id);
    });
  });

  // ── Delegated: topics list ──
  $el("topicsList")?.addEventListener("click", (e) => {
    const target = e.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;
    const id = parseInt(target.dataset.id);
    const topicId = parseInt(target.dataset.topicId);
    switch (action) {
      case "edit-topic":
        openTopicModal(id);
        break;
      case "delete-topic":
        deleteTopic(id);
        break;
      case "add-subtopic":
        openSubtopicModal(topicId);
        break;
      case "edit-subtopic":
        openSubtopicModal(topicId, id);
        break;
      case "delete-subtopic":
        deleteSubtopic(id);
        break;
    }
  });

  // ── Delegated: subtopics list (inside topic modal) ──
  $el("subtopicsList")?.addEventListener("click", (e) => {
    const target = e.target.closest("[data-action]");
    if (!target || target.dataset.action !== "remove-subtopic-field") return;
    const subtopicId = target.dataset.id ? parseInt(target.dataset.id) : null;
    removeSubtopicField(target, subtopicId);
  });

  // ── Delegated: questions table ──
  $el("questionsTableBody")?.addEventListener("click", (e) => {
    const target = e.target.closest("[data-action]");
    if (!target) return;
    const id = parseInt(target.dataset.id);
    if (target.dataset.action === "edit-question") openQuestionModal(id);
    if (target.dataset.action === "delete-question") deleteQuestion(id);
  });

  // ── Delegated: users table ──
  $el("usersTableBody")?.addEventListener("click", (e) => {
    const target = e.target.closest("[data-action]");
    if (!target) return;
    const id = parseInt(target.dataset.id);
    if (target.dataset.action === "edit-user") openUserModal(id);
    if (target.dataset.action === "delete-user") deleteUser(id);
    if (target.dataset.action === "activate-user") activateUser(id);
  });

  // ── Delegated: exams list ──
  $el("examsList")?.addEventListener("click", (e) => {
    const target = e.target.closest("[data-action]");
    if (!target) return;
    const id = parseInt(target.dataset.id);
    if (target.dataset.action === "edit-exam") openExamModal(id);
    if (target.dataset.action === "delete-exam") deleteExam(id);
  });

  // ── Delegated: available questions checkboxes ──
  $el("availableQuestions")?.addEventListener("change", (e) => {
    if (
      e.target.type === "checkbox" &&
      e.target.hasAttribute("data-question-id")
    ) {
      toggleQuestionSelection(parseInt(e.target.dataset.questionId));
    }
  });

  // ── Delegated: selected questions remove ──
  $el("selectedQuestions")?.addEventListener("click", (e) => {
    const target = e.target.closest("[data-action]");
    if (!target || target.dataset.action !== "remove-selected-question") return;
    removeQuestionFromSelection(parseInt(target.dataset.id));
  });

  // ── Global delegated: subscription actions ──
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

  // ── Search inputs for subscription tables ──
  $el("search-requests")?.addEventListener("input", (e) =>
    filterTable("requests-tbody", e.target.value),
  );
  $el("search-subs")?.addEventListener("input", (e) =>
    filterTable("subs-tbody", e.target.value),
  );
  $el("search-sub-users")?.addEventListener("input", (e) =>
    filterTable("sub-users-tbody", e.target.value),
  );

  $el("btn-logout")?.addEventListener("click", async () => {
    const response = await FetchData("/logout", true);
    if (handleApiResponse(response)) return;
    localStorage.removeItem("authToken");
    window.location.href = "../auth/login.html";
  });

  // ── Status filter for requests ──
  $el("filter-status")?.addEventListener("change", (e) => {
    const status = e.target.value;
    document.querySelectorAll("#requests-tbody tr").forEach((row) => {
      row.style.display =
        !status || (row.dataset.search || "").includes(status) ? "" : "none";
    });
  });
});
