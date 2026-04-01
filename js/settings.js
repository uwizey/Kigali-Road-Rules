// ── Swap stubs for your real API calls ────────────────────────────────────
import { UpdateData } from "./api/crud.js";
// const apiUpdateEmail    = p => UpdateData("/user/email",    p, true);
// const apiUpdatePassword = p => UpdateData("/user/password", p, true);

async function apiUpdateEmail(payload) {
    console.log("Updating email with payload:", payload);
    const response = await UpdateData("/user/update-email", payload, true);
    console.log("API response:", response);
    return response;
}
async function apiUpdatePassword(payload) {
    await new Promise((r) => setTimeout(r, 1000));
    console.log("Updating password with payload:", payload);
    const response = await UpdateData("/user/update-password", payload, true);
    console.log("API response:", response);
  return response;
  // Simulate wrong current password:
  // return { success: false, error: { message: "Current password is incorrect." } };
}
// ─────────────────────────────────────────────────────────────────────────

const $ = (id) => document.getElementById(id);

// ── Toast ─────────────────────────────────────────────────────────────────
let toastTimer;
function toast(text, type = "success") {
  const el = $("toast");
  el.textContent = (type === "success" ? "✓  " : "✕  ") + text;
  el.className = `toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 3000);
}

// ── Field helpers ─────────────────────────────────────────────────────────
function msg(id, text, type = "") {
  const el = $(id);
  el.textContent = text;
  el.className = `field-msg ${type}`;
}
function fieldState(id, s) {
  const el = $(id);
  el.classList.remove("err", "ok");
  if (s) el.classList.add(s);
}
function clearForm(ids) {
  ids.forEach((id) => {
    $(id).value = "";
    fieldState(id, null);
  });
}

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// ── Password strength ─────────────────────────────────────────────────────
function strength(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const level = Math.min(Math.max(s - 1, 0), 4);
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const cls = ["", "weak", "fair", "good", "strong"];
  return { level, cls: cls[level], label: labels[level] };
}

function updateStrengthBar(pw) {
  const { level, cls } = pw ? strength(pw) : { level: 0, cls: "" };
  [1, 2, 3, 4].forEach((i) => {
    $(`s${i}`).className = "seg" + (pw && i <= level + 1 ? ` ${cls}` : "");
  });
}

// ── Email validation ──────────────────────────────────────────────────────
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

// ── Password validation ───────────────────────────────────────────────────
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

// ── Submit: email ─────────────────────────────────────────────────────────
async function submitEmail() {
  const btn = $("btn-email");
  btn.classList.add("loading");
  btn.disabled = true;
  try {
    const res = await apiUpdateEmail({
      new_email: $("new-email").value.trim(),
      current_password: $("email-password").value,
    });
    if (res.success) {
      toast("Email updated successfully.");
      clearForm(["new-email", "confirm-email", "email-password"]);
      ["msg-new-email", "msg-confirm-email", "msg-email-password"].forEach(
        (id) => msg(id, ""),
      );
    } else {
      toast(res.error?.message ?? "Update failed.", "error");
      if (res.error?.message?.toLowerCase().includes("password")) {
        msg("msg-email-password", res.error.message, "err");
        fieldState("email-password", "err");
      }
    }
  } catch {
    toast("Network error. Please try again.", "error");
  } finally {
    btn.classList.remove("loading");
    btn.disabled = false;
  }
}

// ── Submit: password ──────────────────────────────────────────────────────
async function submitPassword() {
  const btn = $("btn-pw");
  btn.classList.add("loading");
  btn.disabled = true;
  try {
    const res = await apiUpdatePassword({
      current_password: $("current-pw").value,
      new_password: $("new-pw").value,
    });
    if (res.success) {
      toast("Password updated successfully.");
      clearForm(["current-pw", "new-pw", "confirm-pw"]);
      updateStrengthBar("");
      ["msg-current-pw", "msg-new-pw", "msg-confirm-pw"].forEach((id) =>
        msg(id, ""),
      );
    } else {
      toast(res.error?.message ?? "Update failed.", "error");
      if (res.error?.message?.toLowerCase().includes("current")) {
        msg("msg-current-pw", res.error.message, "err");
        fieldState("current-pw", "err");
      }
    }
  } catch {
    toast("Network error. Please try again.", "error");
  } finally {
    btn.classList.remove("loading");
    btn.disabled = false;
  }
}

// ── Event listeners ───────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  ["new-email", "confirm-email", "email-password"].forEach((id) =>
    $(id).addEventListener("input", validateEmail),
  );

  ["current-pw", "new-pw", "confirm-pw"].forEach((id) =>
    $(id).addEventListener("input", validatePassword),
  );

  $("btn-email").addEventListener("click", submitEmail);
  $("btn-pw").addEventListener("click", submitPassword);

  document.querySelectorAll(".toggle-pw").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = $(btn.dataset.target);
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.querySelector("svg").innerHTML = show
        ? `<line x1="1" y1="1" x2="23" y2="23"/>
             <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
             <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>`
        : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
             <circle cx="12" cy="12" r="3"/>`;
    });
  });
});
