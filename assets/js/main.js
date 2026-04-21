import { initI18n } from "./i18n.js";

// Mobile nav
function initNav() {
  const toggle = document.querySelector(".menu-toggle");
  const links = document.querySelector(".nav-links");
  if (!toggle || !links) return;

  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });

  // close on link click (mobile)
  links.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      links.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

// Highlight active nav item based on current page
function markActiveLink() {
  const here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === here || (here === "" && href === "index.html")) {
      a.classList.add("active");
    }
  });
}

// Reveal-on-scroll for .reveal elements
function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || els.length === 0) {
    els.forEach((el) => el.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "-40px 0px", threshold: 0.05 }
  );
  els.forEach((el) => io.observe(el));
}

// Simple client-side form handlers (no backend)
function initForms() {
  document.querySelectorAll("form[data-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const kind = form.getAttribute("data-form");
      const msgEl = form.querySelector(".form-message");
      if (!msgEl) return;
      msgEl.classList.remove("success", "error");

      if (kind === "email") {
        const input = form.querySelector('input[type="email"]');
        const ok = input && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
        if (!ok) {
          msgEl.textContent = msgEl.dataset.error || "Please enter a valid email.";
          msgEl.classList.add("error");
          return;
        }
        form.reset();
        msgEl.textContent = msgEl.dataset.success || "Thanks!";
        msgEl.classList.add("success");
        return;
      }

      if (kind === "contact") {
        const email = form.querySelector('input[type="email"]');
        const name = form.querySelector('input[name="name"]');
        const message = form.querySelector('textarea[name="message"]');
        const emailOk = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
        const filled = name && name.value.trim() && message && message.value.trim();
        if (!emailOk || !filled) {
          msgEl.textContent = msgEl.dataset.error || "Please complete the form.";
          msgEl.classList.add("error");
          return;
        }
        form.reset();
        msgEl.textContent = msgEl.dataset.success || "Thanks!";
        msgEl.classList.add("success");
      }
    });
  });
}

// Sync form-message success/error text with active language when it changes.
// We stash the current success/error keys on the element via data-success/data-error,
// populated by data-i18n-attr from the translation dict.
function bootstrap() {
  initNav();
  markActiveLink();
  initReveal();
  initForms();
  initI18n();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap);
} else {
  bootstrap();
}
