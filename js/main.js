import { FetchData, PostData, DeleteData, UpdateData } from "../js/api/crud.js"
const logoutbtn = document.getElementById("btn-logout");
if (logoutbtn) {
    logoutbtn.addEventListener("click", async () => {
      const response = await FetchData("/logout", true);
      if (response.success) {
        localStorage.removeItem("token");
        alert("Succeessfull Logout");
        window.location.href = "../auth/login.html";
      } else {
        alert("logout failed");
      }
    });
}

const msgBox = document.getElementById("message-box");
const toggleLogin = document
  .getElementById("login-tab")
  .addEventListener("click", () => {
    setMode("login");
  });
const toggleSign = document
  .getElementById("signup-tab")
  .addEventListener("click", () => {
    setMode("signup");
  });

function showMessage(text, type) {
  msgBox.textContent = text;
  msgBox.className = type;
  msgBox.style.display = "flex";
}

function hideMessage() {
  msgBox.style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".header");

  if (!header) {
    console.error("Header not found!");
    return;
  }

  let lastScrollY = window.scrollY;

  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY && currentScrollY > 80) {
      // scrolling down
      header.classList.add("hide");
    } else {
      // scrolling up
      header.classList.remove("hide");
    }

    // add background + blur after user scrolls
    if (currentScrollY > 20) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    lastScrollY = currentScrollY;
  });
});

let mode = "login";

// SVGs for the toggle button
const eyeOpen = `<svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
const eyeClosed = `<svg class="eye-off-icon" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

function setMode(newMode) {
  mode = newMode;

  // Elements
  const loginTab = document.getElementById("login-tab");
  const signupTab = document.getElementById("signup-tab");
  const confirmGroup = document.getElementById("confirm-password-group");
  const forgotLink = document.getElementById("forgot-password-link");
  const submitBtn = document.getElementById("submit-btn");
  const confirmInput = document.getElementById("confirmPassword");

  // Toggle Classes
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

document
  .getElementById("auth-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (mode === "login") {
      const payload = {
        email: email,
        password: password,
      };
      const response = await PostData("/login", payload);
      console.log(response);
      if (response.success) {
        localStorage.setItem("authToken", response.data.token);

        if (response.data.role == "client") {
          window.location.href = "../user/modeselection.html";
        } else {
          window.location.href = "../admin/admin-dashboard.html";
        }
      } else {
        showMessage(response.error.message, "error");
      }
    } else {
      if (password.length < 8) {
        showMessage("Passwords should be at least 8 characters", "error");
      }
      if (password !== confirmPassword) {
        showMessage("Passwords do not match!", "error");
      }
      const payload = {
        email: email,
        password: password,
      };
      const response = await PostData("/register", payload);
      if (response.success) {
        setTimeout(() => {
          setMode("signup");
          showMessage(
            `${response.data.message}. Login with your credentials.`,
            "success",
            );
            email = "";
            password = "";
            confirmPassword = "";
          // Optional: Automatically hide the message after another 7 seconds
          setTimeout(() => {
            hideMessage();
          }, 7000);
        }, 1000);
      } else {
        console.log(response);
        showMessage(response.error.message, "error");
      }
    }
  });
