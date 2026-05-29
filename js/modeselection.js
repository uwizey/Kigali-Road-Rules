import { FetchData, PostData } from "../js/api/crud.js";

// ─────────────────────────────────────────────────────────────────────────────

(function () {
  "use strict";

  const REVEAL = [".fade-up", ".fade-in", ".slide-left", ".cardz"];

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );

  function init() {
    document
      .querySelectorAll(REVEAL.join(", "))
      .forEach((el) => observer.observe(el));
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", init)
    : init();

  /* Navbar hide/show + shadow on scroll */
  let lastScroll = 0;
  const header = document.querySelector(".header");

  window.addEventListener(
    "scroll",
    () => {
      const current = window.scrollY;
      if (!header) return;
      header.classList.toggle("hide", current > lastScroll && current > 80);
      header.classList.toggle("scrolled", current > 10);
      lastScroll = current;
    },
    { passive: true },
  );

  /* Spotlight glow on service cards */
  const grid = document.getElementById("serviceCards");
  if (grid) {
    grid.addEventListener("mousemove", (e) => {
      for (const card of grid.getElementsByClassName("service-card")) {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
        card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
      }
    });
  }
})();

const avatarBtn = document.getElementById("avatarBtn");
const avatarDropdown = document.getElementById("avatarDropdown");

// Toggle on click
if (avatarBtn && avatarDropdown) {
  avatarBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = avatarDropdown.classList.toggle("open");
    avatarBtn.setAttribute("aria-expanded", isOpen);
  });

  // Close when clicking outside
  document.addEventListener("click", () => {
    avatarDropdown.classList.remove("open");
    avatarBtn.setAttribute("aria-expanded", false);
  });

  // Close when a dropdown link is clicked (smooth UX)
  avatarDropdown.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      avatarDropdown.classList.remove("open");
      avatarBtn.setAttribute("aria-expanded", false);
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const logoutbtn = document.getElementById("btn-logout");

  if (logoutbtn) {
    logoutbtn.addEventListener("click", async () => {
      const response = await FetchData("/logout", true);
      if (response && response.success) {
        localStorage.removeItem("authToken");
        alert("Successful Logout");
        //window.location.href = "../auth/login.html";
      } else {
        alert("Logout failed");
      }
    });
  }

  const useremail = document.getElementById("userEmail");
  if (useremail) {
    try {
      const response = await FetchData("/user/profile", true);
      console.log(response);

      if (response && response.success) {
        useremail.textContent =
          response.data?.data?.email ||
          response.data?.email ||
          "No Email Found";
      } else {
        useremail.textContent = "Unknown User";
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      useremail.textContent = "Error Loading Profile";
    }
  }
});
