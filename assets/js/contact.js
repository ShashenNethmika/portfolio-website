/* ===================================================================
   CONTACT JS — Interactive Contact Page Scripts
   =================================================================== */

(function () {
  "use strict";

  function boot() {
    // Lenis Smooth Scroll
    if (window.Lenis && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      try {
        const lenis = new window.Lenis({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: "vertical",
        });

        function raf(time) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      } catch (e) {
        console.warn("Lenis skipped:", e);
      }
    }

    // Custom Cursor
    const dot = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-ring");

    if (dot && ring && window.matchMedia("(hover: hover)").matches) {
      let mouseX = window.innerWidth / 2;
      let mouseY = window.innerHeight / 2;
      let ringX = mouseX;
      let ringY = mouseY;

      window.addEventListener(
        "mousemove",
        (e) => {
          mouseX = e.clientX;
          mouseY = e.clientY;
          dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
        },
        { passive: true }
      );

      function renderCursor() {
        ringX += (mouseX - ringX) * 0.16;
        ringY += (mouseY - ringY) * 0.16;
        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
        requestAnimationFrame(renderCursor);
      }
      renderCursor();

      const interactives = document.querySelectorAll("a, button, .social-card, input");
      interactives.forEach((el) => {
        el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hover"));
        el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"));
      });

      window.addEventListener("mousedown", () => document.body.classList.add("cursor-clicked"));
      window.addEventListener("mouseup", () => document.body.classList.remove("cursor-clicked"));
    }

    // Copy Email Button
    const copyBtn = document.getElementById("copy-email-btn");
    const emailText = document.getElementById("email-text");
    const feedback = document.querySelector(".copy__feedback");

    if (copyBtn && emailText) {
      copyBtn.addEventListener("click", async () => {
        try {
          const textToCopy = emailText.textContent.trim();
          await navigator.clipboard.writeText(textToCopy);

          if (feedback) {
            feedback.classList.add("show");
            setTimeout(() => {
              feedback.classList.remove("show");
            }, 2000);
          }
        } catch (err) {
          console.error("Failed to copy:", err);
        }
      });
    }

    // Mobile Menu Toggle
    const menuToggle = document.getElementById("menu-toggle");
    const mobileMenu = document.getElementById("mobile-menu");

    if (menuToggle && mobileMenu) {
      menuToggle.addEventListener("click", () => {
        const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
        menuToggle.setAttribute("aria-expanded", String(!isExpanded));
        mobileMenu.classList.toggle("is-open", !isExpanded);
        document.body.style.overflow = !isExpanded ? "hidden" : "";
      });

      document.querySelectorAll(".mobile-menu__link").forEach((link) => {
        link.addEventListener("click", () => {
          menuToggle.setAttribute("aria-expanded", "false");
          mobileMenu.classList.remove("is-open");
          document.body.style.overflow = "";
        });
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
