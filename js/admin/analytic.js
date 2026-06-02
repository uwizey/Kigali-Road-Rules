import { FetchData } from "../api/crud.js";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getRetentionClass(value) {
  if (value >= 0.6) return "ret-high";
  if (value >= 0.3) return "ret-med";
  if (value > 0) return "ret-low";
  return "ret-zero";
}

function transformDeviceData(dist) {
  const findPct = (name) => {
    const item = dist.find((d) => d.device.toLowerCase() === name);
    return item ? item.percentage : 0;
  };
  return {
    desktop: findPct("desktop"),
    mobile: findPct("mobile"),
    tablet: findPct("tablet"),
    other: findPct("other") + findPct("unknown"),
  };
}

// ─── Heatmap ────────────────────────────────────────────────────────────────

async function renderHeatmap() {
  const tbody = document.querySelector("#retentionTable tbody");
  const response = await FetchData("/analytics/retention", true);
  if (!response?.status) {
    tbody.innerHTML = `<tr><td colspan="6">Error fetching data</td></tr>`;
    return;
  }
  const data = response.data;
  document.getElementById("startDate").textContent = data.period.start;
  document.getElementById("endDate").textContent = data.period.end;

  data.cohorts.forEach((cohort) => {
    const row = document.createElement("tr");
    const days = ["day_1", "day_7", "day_14", "day_30"];
    let cells = `
      <td class="cohort-label">${cohort.registration_date}</td>
      <td>${cohort.new_users}</td>
    `;
    days.forEach((day) => {
      const val = cohort.retention[day];
      const display = val === null ? "—" : (val * 100).toFixed(0) + "%";
      cells += `<td class="${getRetentionClass(val ?? 0)}">${display}</td>`;
    });
    row.innerHTML = cells;
    tbody.appendChild(row);
  });
}

// ─── Stepped / Cumulative Chart ──────────────────────────────────────────────

async function renderSteppedChart(response) {
  if (!response?.status || !response.data?.engagement?.length) return;

  const data = response.data.engagement;
  const pad = { top: 20, right: 20, bottom: 40, left: 50 };
  const W = 450,
    H = 220;
  const cW = W - pad.left - pad.right;
  const cH = H - pad.top - pad.bottom;

  let total = 0;
  const points = data.map((item) => {
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

  const axisG = document.getElementById("chartAxes");
  let axisHTML = "";

  for (let i = 0; i <= 4; i++) {
    const y = pad.top + cH - i * 0.25 * cH;
    const val = Math.round(i * 0.25 * (maxV / 1.1));
    axisHTML += `
      <line x1="${pad.left}" y1="${y}" x2="${W - pad.right}" y2="${y}" />
      <text x="${pad.left - 10}" y="${y + 4}" text-anchor="end">${val}</text>
    `;
  }

  let d = `M ${pad.left} ${pad.top + cH}`;
  points.forEach((p, i) => {
    const x = pad.left + ((p.time - minT) / (maxT - minT || 1)) * cW;
    const y = pad.top + cH - (p.val / maxV) * cH;
    if (i === 0) {
      d += ` L ${x} ${y}`;
    } else {
      d += ` H ${x} V ${y}`;
    }
    axisHTML += `<text x="${x}" y="${pad.top + cH + 15}" text-anchor="middle">${p.date}</text>`;
  });

  axisG.innerHTML = axisHTML;
  document.getElementById("stepLine").setAttribute("d", d);
  document
    .getElementById("stepArea")
    .setAttribute(
      "d",
      d + ` L ${pad.left + cW} ${pad.top + cH} L ${pad.left} ${pad.top + cH} Z`,
    );
}

// ─── DAU Bars ────────────────────────────────────────────────────────────────

async function renderDAUChart() {
  const response = await FetchData("/analytics/dau", true);
  if (!response?.status || !response.data?.dau) return;

  const data = response.data.dau;
  const barG = document.getElementById("dauBars");
  const labelG = document.getElementById("dauLabels");
  const gridG = document.getElementById("dauGrid");

  const pad = { top: 20, right: 20, bottom: 40, left: 40 };
  const W = 500,
    H = 250;
  const cW = W - pad.left - pad.right;
  const cH = H - pad.top - pad.bottom;

  const maxVal = Math.max(...data.map((d) => d.active_users)) * 1.2;
  const slotW = cW / data.length;
  const barWidth = slotW * 0.6;

  let barHTML = "";
  let labelHTML = "";
  let gridHTML = "";

  for (let i = 0; i <= 4; i++) {
    const y = pad.top + cH - i * 0.25 * cH;
    const val = Math.round(i * 0.25 * (maxVal / 1.2));
    gridHTML += `
      <line x1="${pad.left}" y1="${y}" x2="${W - pad.right}" y2="${y}" stroke="var(--border)" stroke-width="1" />
      <text x="${pad.left - 10}" y="${y + 4}" text-anchor="end" fill="var(--muted)" font-size="9">${val}</text>
    `;
  }

  data.forEach((d, i) => {
    const x = pad.left + i * slotW + (slotW - barWidth) / 2;
    const returning = d.active_users - d.new_users;
    const hReturning = (returning / maxVal) * cH;
    const hNew = (d.new_users / maxVal) * cH;
    const yReturning = pad.top + cH - hReturning;
    const yNew = yReturning - hNew;

    barHTML += `
      <rect x="${x}" y="${yReturning}" width="${barWidth}" height="${hReturning}" fill="var(--primary)" rx="3"/>
      <rect x="${x}" y="${yNew}"       width="${barWidth}" height="${hNew}"       fill="var(--primary-soft)" rx="3"/>
    `;

    const displayDate = d.date.split("-")[2];
    labelHTML += `
      <text x="${x + barWidth / 2}" y="${H - 15}" text-anchor="middle" fill="var(--muted)" font-size="10">Apr ${displayDate}</text>
    `;
  });

  gridG.innerHTML = gridHTML;
  barG.innerHTML = barHTML;
  labelG.innerHTML = labelHTML;
}

// ─── Platform Distribution ───────────────────────────────────────────────────

async function renderPlatformBreakdown() {
  const response = await FetchData("/analytics/device-distribution", true);
  if (!response?.status || !response.data?.distribution) return;

  const data = transformDeviceData(response.data.distribution);

  ["desktop", "mobile", "tablet", "other"].forEach((key) => {
    document.getElementById("bar-" + key).style.width = data[key] + "%";
    document.getElementById("val-" + key).innerText = data[key] + "%";
  });
}

// ─── Service Adoption Donut ──────────────────────────────────────────────────

async function renderServiceDonut() {
  const response = await FetchData("/analytics/service-usage", true);
  if (!response?.status || !response.data?.services) return;

  const services = response.data.services;
  const colors = ["#0097b2", "#4dd0e1", "#b2ebf2", "#e0f7fa"];
  const segmentG = document.getElementById("donutSegments");
  const legend = document.getElementById("donutLegend");
  const totalLabel = document.getElementById("totalHits");
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  let totalCount = 0;
  let currentOffset = 0;
  let segmentsHTML = "";
  let legendHTML = "";

  services.forEach((item, i) => {
    totalCount += item.count;
    const color = colors[i % colors.length];
    const dashValue = (item.percentage / 100) * circumference;
    const offset = (currentOffset / 100) * circumference;

    segmentsHTML += `
      <circle cx="50" cy="50" r="${radius}"
              fill="transparent"
              stroke="${color}"
              stroke-width="10"
              stroke-dasharray="${dashValue} ${circumference}"
              stroke-dashoffset="-${offset}"
              transform="rotate(-90 50 50)" />
    `;

    const displayName = item.service.replace(/_/g, " ");
    legendHTML += `
      <div class="legend-item">
        <span class="color-box" style="background:${color}"></span>
        ${displayName}<strong>${item.percentage}%</strong>
      </div>
    `;

    currentOffset += item.percentage;
  });

  segmentG.innerHTML = segmentsHTML;
  legend.innerHTML = legendHTML;
  totalLabel.innerText = totalCount;
}

// ─── Learning Funnel ─────────────────────────────────────────────────────────

async function renderLearningFunnel() {
  const response = await FetchData("/analytics/conversion-rate", true);
  if (!response?.status || !response.data?.conversion) return;

  const c = response.data.conversion;
  const servicePct = ((c.service_users / c.login_users) * 100).toFixed(0);
  const ratePct = c.conversion_rate.toFixed(0);

  document.getElementById("pct-login").innerText = "100%";
  document.getElementById("pct-service").innerText = servicePct + "%";
  document.getElementById("pct-rate").innerText = ratePct + "%";

  setTimeout(() => {
    document.getElementById("fill-login").style.width = "100%";
    document.getElementById("fill-service").style.width = servicePct + "%";
    document.getElementById("fill-rate").style.width = ratePct + "%";
  }, 100);
}

// ─── Engagement Radar ────────────────────────────────────────────────────────

async function renderEngagementRadar(response) {
  if (!response?.status || !response.data?.engagement?.length) return;

  const users = response.data.engagement;
  const shapeG = document.getElementById("radarShapes");
  const gridG = document.getElementById("radarGrid");
  const labelG = document.getElementById("radarLabels");
  const legend = document.getElementById("radarLegend");

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

  let gridHTML = "";
  let shapesHTML = "";
  let labelsHTML = "";
  let legendHTML = "";

  for (let i = 1; i <= 3; i++) {
    const r = (radius / 3) * i;
    const points = axes
      .map((_, j) => {
        const x = cx + r * Math.cos(j * angleStep - Math.PI / 2);
        const y = cy + r * Math.sin(j * angleStep - Math.PI / 2);
        return `${x},${y}`;
      })
      .join(" ");
    gridHTML += `<polygon points="${points}" class="radar-grid" stroke="var(--border)" />`;
  }

  axes.forEach((axis, j) => {
    const x = cx + (radius + 15) * Math.cos(j * angleStep - Math.PI / 2);
    const y = cy + (radius + 15) * Math.sin(j * angleStep - Math.PI / 2);
    labelsHTML += `<text x="${x}" y="${y}" class="radar-label" text-anchor="middle">${axis.name}</text>`;
  });

  users.forEach((user, i) => {
    const color = colors[i % colors.length];
    const points = axes
      .map((axis, j) => {
        const val = Math.min(user[axis.key] / axis.max, 1);
        const x = cx + radius * val * Math.cos(j * angleStep - Math.PI / 2);
        const y = cy + radius * val * Math.sin(j * angleStep - Math.PI / 2);
        return `${x},${y}`;
      })
      .join(" ");

    shapesHTML += `<polygon points="${points}" class="radar-shape" stroke="${color}" fill="${color}" />`;
    legendHTML += `<div class="legend-item"><span class="dot" style="background:${color}"></span> User ${user.user_id}</div>`;
  });

  gridG.innerHTML = gridHTML;
  shapeG.innerHTML = shapesHTML;
  labelG.innerHTML = labelsHTML;
  legend.innerHTML = legendHTML;
}

document.addEventListener("DOMContentLoaded", async () => {
  // Requests are awaited sequentially to avoid bursting the server's
  // rate limiter. Each render fetches its own endpoint and returns before
  // the next one starts — total wall-time cost is negligible on a local
  // server but eliminates all 429s.
  await renderHeatmap();
  const engagementResponse = await FetchData("/analytics/engagement", true);
  renderSteppedChart(engagementResponse);
  renderEngagementRadar(engagementResponse);
  await renderDAUChart();
  await renderPlatformBreakdown();
  await renderServiceDonut();
  await renderLearningFunnel();
});
