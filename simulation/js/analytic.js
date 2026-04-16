// ════════════════════════════════════════════════════════════════════════════
import { FetchData } from "../js/api/crud.js";



function getRetentionClass(value) {
  if (value >= 0.6) return "ret-high";
  if (value >= 0.3) return "ret-med";
  if (value > 0) return "ret-low";
  return "ret-zero";
}

async function renderHeatmap() {
  const tbody = document.querySelector("#retentionTable tbody");
  const response = await FetchData("/analytics/retention", true);
  console.log("API Response:", response);
  if (!response.status) {
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
      const percentage = (val * 100).toFixed(0) + "%";
      cells += `<td class="${getRetentionClass(val)}">${percentage}</td>`;
    });

    row.innerHTML = cells;
    tbody.appendChild(row);
  });
}

const engagementData = {
  status: true,
  period: { start: "2026-03-14", end: "2026-04-13" },
  engagement: [
    { user_id: 27, total_events: 10, depth_score: 0.4 },
    { user_id: 31, total_events: 3, depth_score: 0.67 },
  ],
};

async function renderSteppedChart() {
  const response = await FetchData("/analytics/engagement", true);
  if (!response.success || !response.data?.engagement) return;

  const data = response.data.engagement;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const w = 450;
  const h = 220;
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;

  // 1. Process Totals
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
  const maxV = Math.max(...points.map((p) => p.val), 1) * 1.1; // 10% headroom

  // 2. Render Axis Lines & Labels
  const axisG = document.getElementById("chartAxes");
  let axisHTML = "";

  // Y-Axis Labels (Events)
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + chartH - i * 0.25 * chartH;
    const val = Math.round(i * 0.25 * (maxV / 1.1));
    axisHTML += `
            <line x1="${padding.left}" y1="${y}" x2="${w - padding.right}" y2="${y}" />
            <text x="${padding.left - 10}" y="${y + 4}" text-anchor="end">${val}</text>
        `;
  }

  // 3. Generate Stepped Path
  let d = `M ${padding.left} ${padding.top + chartH}`;

  points.forEach((p, i) => {
    const x = padding.left + ((p.time - minT) / (maxT - minT || 1)) * chartW;
    const y = padding.top + chartH - (p.val / maxV) * chartH;

    if (i === 0) {
      d += ` L ${x} ${y}`;
    } else {
      d += ` H ${x} V ${y}`;
    }

    // X-Axis Date Labels
    axisHTML += `<text x="${x}" y="${padding.top + chartH + 15}" text-anchor="middle">${p.date}</text>`;
  });

  // 4. Update SVG
  axisG.innerHTML = axisHTML;
  const line = document.getElementById("stepLine");
  const area = document.getElementById("stepArea");

  line.setAttribute("d", d);
  area.setAttribute(
    "d",
    d +
      ` L ${padding.left + chartW} ${padding.top + chartH} L ${padding.left} ${padding.top + chartH} Z`,
  );
}
async function renderDAUChart() {
  const response = await FetchData("/analytics/dau", true);
  console.log("DAU API Response:", response);
  if (!response.status || !response.data.dau) return;

  const data = response.data.dau;
  const svg = document.getElementById("dauChart");
  const barG = document.getElementById("dauBars");
  const labelG = document.getElementById("dauLabels");
  const gridG = document.getElementById("dauGrid");

  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const w = 500 - padding.left - padding.right;
  const h = 250 - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map((d) => d.active_users)) * 1.2;
  const barWidth = (w / data.length) * 0.6; // 60% of available slot width

  let barHTML = "";
  let labelHTML = "";
  let gridHTML = "";

  // 1. Draw Horizontal Grid Lines
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + h - i * 0.25 * h;
    const val = Math.round(i * 0.25 * (maxVal / 1.2));
    gridHTML += `
            <line x1="${padding.left}" y1="${y}" x2="${500 - padding.right}" y2="${y}" stroke="#f0fafa" stroke-width="1" />
            <text x="${padding.left - 10}" y="${y + 4}" class="axis-text" text-anchor="end">${val}</text>
        `;
  }

  // 2. Map Data to Stacked Bars
  data.forEach((d, i) => {
    const x =
      padding.left + i * (w / data.length) + (w / data.length - barWidth) / 2;

    const returningCount = d.active_users - d.new_users;

    const hTotal = (d.active_users / maxVal) * h;
    const hReturning = (returningCount / maxVal) * h;
    const hNew = (d.new_users / maxVal) * h;

    const yReturning = padding.top + h - hReturning;
    const yNew = yReturning - hNew;

    // Returning Users (Dark Cyan)
    barHTML += `
            <rect x="${x}" y="${yReturning}" width="${barWidth}" height="${hReturning}" 
                  fill="#00bcd4" rx="6" />
        `;

    // New Users (Light Cyan)
    // Note: we place it on top. To keep the "soft" top, only the New bar gets rx
    barHTML += `
            <rect x="${x}" y="${yNew}" width="${barWidth}" height="${hNew}" 
                  fill="#b2ebf2" rx="6" />
        `;

    // Date Labels
    const displayDate = d.date.split("-")[2]; // Just the day
    labelHTML += `
            <text x="${x + barWidth / 2}" y="${250 - 15}" class="axis-text" text-anchor="middle">Apr ${displayDate}</text>
        `;
  });

  gridG.innerHTML = gridHTML;
  barG.innerHTML = barHTML;
  labelG.innerHTML = labelHTML;
}
function transformDeviceData(dist) {
  const findPct = (name) => {
    const item = dist.find((d) => d.device.toLowerCase() === name);
    return item ? item.percentage : 0;
  };

  // Note: If 'tablet' isn't in your array, it defaults to 0
  return {
    desktop: findPct("desktop"),
    mobile: findPct("mobile"),
    tablet: findPct("tablet"),
    other: findPct("other") + findPct("unknown"), // Combining outliers
  };
}
async function renderPlatformBreakdown() {
  // Sample Backend Response
  const response = await FetchData("/analytics/device-distribution", true);
  console.log("Device Distribution API Response:", response);
  if (!response.status || !response.data.distribution) return;

  const data = transformDeviceData(response.data.distribution);

  // Update Bar Widths
  document.getElementById("bar-desktop").style.width = data.desktop + "%";
  document.getElementById("bar-mobile").style.width = data.mobile + "%";
  document.getElementById("bar-tablet").style.width = data.tablet + "%";
  document.getElementById("bar-other").style.width = data.other + "%";

  // Update Text Labels
  document.getElementById("val-desktop").innerText = data.desktop + "%";
  document.getElementById("val-mobile").innerText = data.mobile + "%";
  document.getElementById("val-tablet").innerText = data.tablet + "%";
  document.getElementById("val-other").innerText = data.other + "%";
}
async function renderServiceDonut() {
  const response = await FetchData("/analytics/service-usage", true);
  console.log("Service Usage API Response:", response);
  if (!response.status || !response.data.services) return;
  const services = response.data.services;

  const colors = ["#00bcd4", "#4dd0e1", "#80deea", "#b2ebf2"];
  const segmentG = document.getElementById("donutSegments");
  const legend = document.getElementById("donutLegend");
  const totalLabel = document.getElementById("totalHits");

  let totalCount = 0;
  let currentOffset = 0;
  let segmentsHTML = "";
  let legendHTML = "";

  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  services.forEach((item, i) => {
    totalCount += item.count;
    const color = colors[i % colors.length];
    const dashValue = (item.percentage / 100) * circumference;
    const offset = (currentOffset / 100) * circumference;

    // Create SVG Dash Circle
    segmentsHTML += `
            <circle cx="50" cy="50" r="${radius}" 
                    fill="transparent" 
                    stroke="${color}" 
                    stroke-width="10" 
                    stroke-dasharray="${dashValue} ${circumference}" 
                    stroke-dashoffset="-${offset}"
                    transform="rotate(-90 50 50)" />
        `;

    // Create Legend
    const displayName = item.service.replace(/_/g, " ");
    legendHTML += `
            <div class="legend-row">
                <span class="color-box" style="background: ${color}"></span>
                <span><strong>${item.percentage}%</strong> ${displayName}</span>
            </div>
        `;

    currentOffset += item.percentage;
  });

  segmentG.innerHTML = segmentsHTML;
  legend.innerHTML = legendHTML;
  totalLabel.innerText = totalCount;
}

async function renderLearningFunnel() {
  // Your specific backend data structure
 const response = await FetchData("/analytics/conversion-rate", true);
  console.log("Conversion Rate API Response:", response);
  if (!response.status || !response.data.conversion) return;

  const data = {
    status: true,
    conversion: {
      login_users: 50,
      service_users: 30,
      conversion_rate: 60.0,
    },
  };

  const c = response.data.conversion;
  console.log("Conversion Data:", c);
  // 1. Update Percentages Text
  // Step 1 is always baseline (100% of logins)
  document.getElementById("pct-login").innerText = "100%";

  // Step 2: Percentage of logins that used a service
  const servicePct = ((c.service_users / c.login_users) * 100).toFixed(0);
  document.getElementById("pct-service").innerText = servicePct + "%";

  // Step 3: Overall conversion rate from your backend
  document.getElementById("pct-rate").innerText =
    c.conversion_rate.toFixed(0) + "%";

  // 2. Animate the Bars
  setTimeout(() => {
    document.getElementById("fill-login").style.width = "100%";
    document.getElementById("fill-service").style.width = servicePct + "%";
    document.getElementById("fill-rate").style.width = c.conversion_rate + "%";
  }, 100);
}
async function renderEngagementRadar() {
  const response = await FetchData("/analytics/engagement", true);
  if (!response.status || !response.data.engagement) return;

  const users = response.data.engagement;
  const shapeG = document.getElementById("radarShapes");
  const gridG = document.getElementById("radarGrid");
  const labelG = document.getElementById("radarLabels");
  const legend = document.getElementById("radarLegend");

  const centerX = 100;
  const centerY = 100;
  const radius = 80;
  const colors = ["#00bcd4", "#ff4081", "#7c4dff"];

  // Define Axes
  const axes = [
    { name: "Events", key: "total_events", max: 15 },
    { name: "Depth", key: "depth_score", max: 1.0 },
    { name: "Variety", key: "distinct_event_types", max: 5 },
  ];

  const angleStep = (Math.PI * 2) / axes.length;

  // 1. Draw Radar Grid (3 Concentric Triangles)
  let gridHTML = "";
  for (let i = 1; i <= 3; i++) {
    const r = (radius / 3) * i;
    const points = axes
      .map((_, j) => {
        const x = centerX + r * Math.cos(j * angleStep - Math.PI / 2);
        const y = centerY + r * Math.sin(j * angleStep - Math.PI / 2);
        return `${x},${y}`;
      })
      .join(" ");
    gridHTML += `<polygon points="${points}" class="radar-grid" stroke="#e0f2f1" />`;
  }

  // 2. Plot User Shapes
  let shapesHTML = "";
  let legendHTML = "";

  users.forEach((user, i) => {
    const color = colors[i % colors.length];
    const points = axes
      .map((axis, j) => {
        const val = Math.min(user[axis.key] / axis.max, 1);
        const x =
          centerX + radius * val * Math.cos(j * angleStep - Math.PI / 2);
        const y =
          centerY + radius * val * Math.sin(j * angleStep - Math.PI / 2);
        return `${x},${y}`;
      })
      .join(" ");

    shapesHTML += `<polygon points="${points}" class="radar-shape" stroke="${color}" fill="${color}" />`;
    legendHTML += `<div class="legend-item"><span class="dot" style="background:${color}"></span> User ${user.user_id}</div>`;
  });

  // 3. Draw Axis Labels
  let labelsHTML = "";
  axes.forEach((axis, j) => {
    const x = centerX + (radius + 15) * Math.cos(j * angleStep - Math.PI / 2);
    const y = centerY + (radius + 15) * Math.sin(j * angleStep - Math.PI / 2);
    labelsHTML += `<text x="${x}" y="${y}" class="radar-label" text-anchor="middle">${axis.name}</text>`;
  });

  gridG.innerHTML = gridHTML;
  shapeG.innerHTML = shapesHTML;
  labelG.innerHTML = labelsHTML;
  legend.innerHTML = legendHTML;
}




// Add to your existing window.onload or DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  
renderLearningFunnel();
  renderHeatmap(); // From previous step
  renderSteppedChart();
  renderDAUChart();
  renderServiceDonut();
  renderPlatformBreakdown();  
  renderLearningFunnel();
  renderEngagementRadar();
});
