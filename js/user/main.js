import { FetchData, PostData } from "../api/crud.js";

// ─── Logout (shared header button) ───────────────────────────────────────────

const logoutBtn = document.getElementById("btn-logout");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    const response = await FetchData("/logout", true);
    localStorage.removeItem("authToken");
    window.location.href = "../auth/login.html";
  });
}

// ─── Scroll-aware header ──────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".header");
  if (!header) return;

  let lastScrollY = window.scrollY;
  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollY && currentScrollY > 80)
      header.classList.add("hide");
    else header.classList.remove("hide");
    header.classList.toggle("scrolled", currentScrollY > 20);
    lastScrollY = currentScrollY;
  });
});

// ─── Message box ──────────────────────────────────────────────────────────────

const msgBox = document.getElementById("message-box");

function showMessage(text, type) {
  msgBox.textContent = text;
  msgBox.className = type;
  msgBox.style.display = "flex";
}

function hideMessage() {
  msgBox.style.display = "none";
}

// ─── Tab / mode switching ─────────────────────────────────────────────────────

let mode = "login";

const eyeOpen = `<svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
const eyeClosed = `<svg class="eye-off-icon" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

document
  .getElementById("login-tab")
  .addEventListener("click", () => setMode("login"));
document
  .getElementById("signup-tab")
  .addEventListener("click", () => setMode("signup"));

function setMode(newMode) {
  mode = newMode;

  const loginTab = document.getElementById("login-tab");
  const signupTab = document.getElementById("signup-tab");
  const confirmGroup = document.getElementById("confirm-password-group");
  const forgotLink = document.getElementById("forgot-password-link");
  const submitBtn = document.getElementById("submit-btn");
  const confirmInput = document.getElementById("confirmPassword");

  if (mode === "login") {
    loginTab.classList.add("active");
    signupTab.classList.remove("active");
    confirmGroup.classList.add("hidden");
    forgotLink.classList.remove("hidden");
    submitBtn.innerText = "Login";
    confirmInput.required = false;
  } else {
    loginTab.classList.remove("active");
    signupTab.classList.add("active");
    confirmGroup.classList.remove("hidden");
    forgotLink.classList.add("hidden");
    submitBtn.innerText = "Create Account";
    confirmInput.required = true;
  }

  hideMessage();
}

function togglePass(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === "password") {
    input.type = "text";
    btn.innerHTML = eyeClosed;
  } else {
    input.type = "password";
    btn.innerHTML = eyeOpen;
  }
}

// ─── Form submission ──────────────────────────────────────────────────────────

document
  .getElementById("auth-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (mode === "login") {
      const response = await PostData("/login", { email, password });

      if (response.success) {
        // crud.js wraps the Flask JSON body inside response.data
        // Flask returns: { data: { token, role }, ... }
        const token = response.data?.data?.token;
        const role = response.data?.data?.role;

        if (!token) {
          showMessage("Login failed. Please try again.", "error");
          return;
        }

        localStorage.setItem("authToken", token);
        window.location.href =
          role === "client"
            ? "../user/user.html"
            : "../admin/admin-dashboard.html";
      } else {
        // userMessage is always safe copy from crud.js — never raw backend text
        showMessage(response.userMessage, "error");
      }
    } else {
      // Client-side validation first — no round trip needed
      if (password.length < 8) {
        showMessage("Password must be at least 8 characters.", "error");
        return;
      }
      if (password !== confirmPassword) {
        showMessage("Passwords do not match.", "error");
        return;
      }

      const response = await PostData("/register", { email, password });

      if (response.success) {
        setMode("login");
        showMessage("Account created. Login with your credentials.", "success");
        setTimeout(hideMessage, 7000);
      } else {
        showMessage(response.userMessage, "error");
      }
    }
  });

// ─── Intersection observer (fade-up animations) ───────────────────────────────

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);

document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));
