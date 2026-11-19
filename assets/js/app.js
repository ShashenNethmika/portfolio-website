/* ===================================================================
   PORTFOLIO MAIN APPLICATION
   Shashen Nethmika — Ultra-Interactive 3D Portfolio
   Engine: GSAP, ScrollTrigger, Three.js & Lenis
   =================================================================== */

(function () {
  "use strict";

  /* ---------------------------------------------------------------
     0. GLOBALS & HELPERS
     --------------------------------------------------------------- */
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];

  function throttle(fn, ms) {
    let last = 0;
    return function (...args) {
      const now = performance.now();
      if (now - last >= ms) {
        last = now;
        fn.apply(this, args);
      }
    };
  }

  /* ---------------------------------------------------------------
     1. BULLETPROOF LOADING SCREEN
     --------------------------------------------------------------- */
  function initLoader() {
    return new Promise((resolve) => {
      const loader = $("#loader");
      const numberEl = $("#loaderNumber");
      const fillEl = $("#loaderBarFill");

      if (!loader) {
        resolve();
        return;
      }

      function dismiss() {
        if (loader.dataset.dismissed) return;
        loader.dataset.dismissed = "true";

        if (window.gsap && !prefersReducedMotion) {
          window.gsap.to(loader, {
            yPercent: -100,
            duration: 0.8,
            ease: "power4.inOut",
            onComplete() {
              loader.style.display = "none";
              resolve();
            },
          });
        } else {
          loader.style.transition = "transform 0.6s ease-in-out, opacity 0.6s ease";
          loader.style.transform = "translateY(-100%)";
          loader.style.opacity = "0";
          setTimeout(() => {
            loader.style.display = "none";
            resolve();
          }, 600);
        }
      }

      if (prefersReducedMotion) {
        loader.style.display = "none";
        resolve();
        return;
      }

      // Absolute safety fallback: Never trap the user on loader
      const safetyTimer = setTimeout(dismiss, 2000);

      // Fast, smooth counter simulation
      let count = 0;
      const interval = setInterval(() => {
        count += Math.floor(Math.random() * 12) + 6;
        if (count >= 100) {
          count = 100;
          clearInterval(interval);
          clearTimeout(safetyTimer);
          if (numberEl) numberEl.textContent = "100";
          if (fillEl) fillEl.style.width = "100%";
          setTimeout(dismiss, 180);
        } else {
          if (numberEl) numberEl.textContent = count;
          if (fillEl) fillEl.style.width = count + "%";
        }
      }, 35);
    });
  }

  /* ---------------------------------------------------------------
     2. LENIS SMOOTH SCROLLING
     --------------------------------------------------------------- */
  let lenisInstance = null;

  function initSmoothScroll() {
    if (prefersReducedMotion || !window.Lenis) return;

    try {
      lenisInstance = new window.Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
      });

      if (window.ScrollTrigger) {
        lenisInstance.on("scroll", window.ScrollTrigger.update);
      }

      function raf(time) {
        lenisInstance.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);

      // Anchor smooth scrolling
      $$('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", (e) => {
          const targetId = anchor.getAttribute("href");
          if (targetId === "#") return;
          const targetEl = $(targetId);
          if (targetEl) {
            e.preventDefault();
            lenisInstance.scrollTo(targetEl, { offset: -60, duration: 1.2 });
          }
        });
      });
    } catch (e) {
      console.warn("Lenis init skipped:", e);
    }
  }

  /* ---------------------------------------------------------------
     3. HARDWARE-ACCELERATED CUSTOM CURSOR
     --------------------------------------------------------------- */
  function initCursor() {
    const dot = $("#cursorDot");
    const ring = $("#cursorRing");
    if (!dot || !ring) return;

    if (isTouchDevice || !matchMedia("(hover: hover)").matches) {
      dot.style.display = "none";
      ring.style.display = "none";
      return;
    }

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

    function renderRing() {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      requestAnimationFrame(renderRing);
    }
    renderRing();

    // Hoverable targets
    const hoverTargets = $$(
      "a, button, .btn, .project-card, .lab__toggle, .lab__gate-select, [data-magnetic]"
    );
    hoverTargets.forEach((el) => {
      el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hover"));
      el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"));
    });

    window.addEventListener("mousedown", () => document.body.classList.add("cursor-clicked"));
    window.addEventListener("mouseup", () => document.body.classList.remove("cursor-clicked"));
  }

  /* ---------------------------------------------------------------
     4. MAGNETIC BUTTONS (PHYSICS SPRING PULL)
     --------------------------------------------------------------- */
  function initMagnetic() {
    if (isTouchDevice || prefersReducedMotion) return;

    $$("[data-magnetic]").forEach((el) => {
      const strength = 0.28;

      el.addEventListener(
        "mousemove",
        (e) => {
          const rect = el.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = (e.clientX - cx) * strength;
          const dy = (e.clientY - cy) * strength;

          if (window.gsap) {
            window.gsap.to(el, { x: dx, y: dy, duration: 0.25, ease: "power2.out" });
          } else {
            el.style.transform = `translate(${dx}px, ${dy}px)`;
          }
        },
        { passive: true }
      );

      el.addEventListener("mouseleave", () => {
        if (window.gsap) {
          window.gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" });
        } else {
          el.style.transform = "translate(0, 0)";
        }
      });
    });
  }

  /* ---------------------------------------------------------------
     5. THREE.JS 3D PARTICLE CONSTELLATION
     --------------------------------------------------------------- */
  function initThreeHero() {
    const canvas = $("#heroCanvas");
    if (!canvas || !window.THREE) return;

    try {
      const THREE = window.THREE;
      const hero = $("#hero");
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        60,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        1000
      );
      camera.position.z = 80;

      const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
      });
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const PARTICLE_COUNT = 180;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(PARTICLE_COUNT * 3);
      const originalPositions = new Float32Array(PARTICLE_COUNT * 3);
      const colors = new Float32Array(PARTICLE_COUNT * 3);

      const cyanColor = new THREE.Color("#66e3f5");
      const blueColor = new THREE.Color("#48a2f9");
      const whiteColor = new THREE.Color("#ffffff");

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const x = (Math.random() - 0.5) * 160;
        const y = (Math.random() - 0.5) * 100;
        const z = (Math.random() - 0.5) * 80;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        originalPositions[i * 3] = x;
        originalPositions[i * 3 + 1] = y;
        originalPositions[i * 3 + 2] = z;

        const pick = Math.random();
        const col = pick > 0.6 ? cyanColor : pick > 0.2 ? blueColor : whiteColor;
        colors[i * 3] = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;
      }

      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const pointMaterial = new THREE.PointsMaterial({
        size: 2.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      });

      const particles = new THREE.Points(geometry, pointMaterial);
      scene.add(particles);

      // Connection Lines
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x66e3f5,
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending,
      });

      const lineGeometry = new THREE.BufferGeometry();
      const linePositions = new Float32Array(PARTICLE_COUNT * PARTICLE_COUNT * 3);
      lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));

      const lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
      scene.add(lineMesh);

      const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
      window.addEventListener(
        "mousemove",
        (e) => {
          mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
          mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
        },
        { passive: true }
      );

      let isVisible = true;
      if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(([entry]) => {
          isVisible = entry.isIntersecting;
        });
        observer.observe(hero);
      }

      const clock = new THREE.Clock();

      function animate() {
        requestAnimationFrame(animate);
        if (!isVisible) return;

        const time = clock.getElapsedTime() * 0.5;

        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;

        particles.rotation.y = time * 0.08 + mouse.x * 0.15;
        particles.rotation.x = mouse.y * 0.1;
        lineMesh.rotation.copy(particles.rotation);

        const pos = geometry.attributes.position.array;
        let lineIndex = 0;
        const linePos = lineGeometry.attributes.position.array;
        const maxDistance = 22;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const i3 = i * 3;
          pos[i3 + 1] = originalPositions[i3 + 1] + Math.sin(time + originalPositions[i3] * 0.05) * 4;

          for (let j = i + 1; j < PARTICLE_COUNT; j++) {
            const j3 = j * 3;
            const dx = pos[i3] - pos[j3];
            const dy = pos[i3 + 1] - pos[j3 + 1];
            const dz = pos[i3 + 2] - pos[j3 + 2];
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist < maxDistance) {
              linePos[lineIndex++] = pos[i3];
              linePos[lineIndex++] = pos[i3 + 1];
              linePos[lineIndex++] = pos[i3 + 2];
              linePos[lineIndex++] = pos[j3];
              linePos[lineIndex++] = pos[j3 + 1];
              linePos[lineIndex++] = pos[j3 + 2];
            }
          }
        }

        geometry.attributes.position.needsUpdate = true;
        lineGeometry.setDrawRange(0, lineIndex / 3);
        lineGeometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
      }
      animate();

      window.addEventListener(
        "resize",
        throttle(() => {
          const width = hero.clientWidth;
          const height = hero.clientHeight;
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        }, 200),
        { passive: true }
      );
    } catch (e) {
      console.warn("Three.js setup skipped:", e);
    }
  }

  /* ---------------------------------------------------------------
     6. 3D TILT EFFECT ON HERO PORTRAIT
     --------------------------------------------------------------- */
  function initTilt() {
    if (isTouchDevice || prefersReducedMotion) return;

    const wrapper = $("[data-tilt]");
    if (!wrapper) return;

    wrapper.addEventListener(
      "mousemove",
      (e) => {
        const rect = wrapper.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const cx = rect.width / 2;
        const cy = rect.height / 2;

        const rx = -((y - cy) / cy) * 12;
        const ry = ((x - cx) / cx) * 14;

        wrapper.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02, 1.02, 1.02)`;
        wrapper.style.setProperty("--glow-x", `${(x / rect.width) * 100}%`);
        wrapper.style.setProperty("--glow-y", `${(y / rect.height) * 100}%`);
      },
      { passive: true }
    );

    wrapper.addEventListener("mouseleave", () => {
      wrapper.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    });
  }

  /* ---------------------------------------------------------------
     7. TEXT SPLIT ENTRANCE
     --------------------------------------------------------------- */
  function initTextSplit() {
    $$("[data-split]").forEach((el) => {
      const text = el.textContent.trim();
      el.innerHTML = "";

      [...text].forEach((char) => {
        const span = document.createElement("span");
        span.className = "split-char";
        span.textContent = char;
        el.appendChild(span);
      });

      const chars = el.querySelectorAll(".split-char");

      if (window.gsap && window.ScrollTrigger && !prefersReducedMotion) {
        window.gsap.from(chars, {
          opacity: 0,
          y: 35,
          duration: 0.7,
          stagger: 0.03,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
          },
        });
      }
    });
  }

  /* ---------------------------------------------------------------
     8. HEADER, SCROLL PROGRESS & ACTIVE NAV SPY
     --------------------------------------------------------------- */
  function initNav() {
    const header = $("#header");
    const progressBar = $("#scrollProgress");
    const toggle = $("#navToggle");
    const mobileMenu = $("#mobileMenu");
    const sections = $$("section[id]");
    const navLinks = $$(".nav__link");

    // Scroll progress bar
    window.addEventListener(
      "scroll",
      () => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = totalHeight > 0 ? window.scrollY / totalHeight : 0;
        if (progressBar) {
          progressBar.style.transform = `scaleX(${progress})`;
        }

        const y = window.scrollY;
        if (header) {
          if (y > 60) {
            header.classList.add("is-scrolled");
          } else {
            header.classList.remove("is-scrolled");
          }
        }

        // Active link spy
        let currentSectionId = "";
        sections.forEach((sec) => {
          const top = sec.offsetTop - 120;
          const height = sec.offsetHeight;
          if (y >= top && y < top + height) {
            currentSectionId = sec.id;
          }
        });

        if (currentSectionId) {
          navLinks.forEach((link) => {
            if (link.getAttribute("href") === `#${currentSectionId}`) {
              link.setAttribute("aria-current", "true");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        }
      },
      { passive: true }
    );

    // Mobile menu toggle
    if (toggle && mobileMenu) {
      toggle.addEventListener("click", () => {
        const isOpen = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!isOpen));
        mobileMenu.classList.toggle("is-open", !isOpen);
        document.body.style.overflow = !isOpen ? "hidden" : "";
      });

      $$(".mobile-menu__link").forEach((link) => {
        link.addEventListener("click", () => {
          toggle.setAttribute("aria-expanded", "false");
          mobileMenu.classList.remove("is-open");
          document.body.style.overflow = "";
        });
      });
    }
  }

  /* ---------------------------------------------------------------
     9. PROJECTS FILTER & CARD GLOW
     --------------------------------------------------------------- */
  function initProjects() {
    const filters = $$(".projects__filter");
    const cards = $$(".project-card");

    filters.forEach((btn) => {
      btn.addEventListener("click", () => {
        filters.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const filter = btn.dataset.filter;

        cards.forEach((card) => {
          const category = card.dataset.category;
          const match = filter === "all" || category === filter;

          if (match) {
            if (window.gsap) {
              window.gsap.to(card, {
                scale: 1,
                opacity: 1,
                duration: 0.35,
                ease: "power2.out",
                onStart() {
                  card.style.display = "";
                },
              });
            } else {
              card.style.display = "";
              card.style.opacity = "1";
              card.style.transform = "none";
            }
          } else {
            if (window.gsap) {
              window.gsap.to(card, {
                scale: 0.95,
                opacity: 0,
                duration: 0.25,
                ease: "power2.in",
                onComplete() {
                  card.style.display = "none";
                },
              });
            } else {
              card.style.display = "none";
            }
          }
        });
      });
    });

    // Card mouse-glow
    if (!isTouchDevice) {
      cards.forEach((card) => {
        const art = card.querySelector(".project-card__artwork");
        if (!art) return;

        art.addEventListener(
          "mousemove",
          (e) => {
            const rect = art.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            art.style.setProperty("--glow-x", `${x}px`);
            art.style.setProperty("--glow-y", `${y}px`);
          },
          { passive: true }
        );
      });
    }
  }

  /* ---------------------------------------------------------------
     10. INTERACTIVE SIGNAL LAB (DIGITAL ELECTRONICS SIMULATION)
     --------------------------------------------------------------- */
  function initSignalLab() {
    const gateLogic = {
      AND: (a, b) => (a && b ? 1 : 0),
      OR: (a, b) => (a || b ? 1 : 0),
      XOR: (a, b) => (a !== b ? 1 : 0),
      NAND: (a, b) => (!(a && b) ? 1 : 0),
      NOR: (a, b) => (!(a || b) ? 1 : 0),
    };

    const circuitEls = $$(".lab__circuit");

    circuitEls.forEach((circuitEl) => {
      const gateSelect = circuitEl.querySelector(".lab__gate-select");
      const toggleA = circuitEl.querySelector('[data-input="a"]');
      const toggleB = circuitEl.querySelector('[data-input="b"]');
      const valA = circuitEl.querySelector('[data-val="a"]');
      const valB = circuitEl.querySelector('[data-val="b"]');
      const gateSymbol = circuitEl.querySelector(".lab__gate-symbol");
      const outputVal = circuitEl.querySelector(".lab__output-val");
      const wireA = circuitEl.querySelector(".lab__wire--a");
      const wireB = circuitEl.querySelector(".lab__wire--b");
      const wireOut = circuitEl.querySelector(".lab__wire--out");
      const tbody = circuitEl.querySelector(".lab__truth-table tbody");

      let stateA = 0;
      let stateB = 0;

      function renderTruthTable(gateName) {
        if (!tbody) return;
        tbody.innerHTML = "";
        const combinations = [
          [0, 0],
          [0, 1],
          [1, 0],
          [1, 1],
        ];

        combinations.forEach(([a, b]) => {
          const out = gateLogic[gateName](a, b);
          const tr = document.createElement("tr");
          tr.dataset.row = `${a}-${b}`;
          tr.innerHTML = `<td>${a}</td><td>${b}</td><td>${out}</td>`;
          tbody.appendChild(tr);
        });
      }

      function updateCircuit() {
        const gate = gateSelect ? gateSelect.value : "AND";
        const result = gateLogic[gate](stateA, stateB);

        // Update Values
        if (valA) {
          valA.textContent = stateA;
          valA.classList.toggle("is-active", stateA === 1);
        }
        if (valB) {
          valB.textContent = stateB;
          valB.classList.toggle("is-active", stateB === 1);
        }
        if (outputVal) {
          outputVal.textContent = result;
          outputVal.classList.toggle("is-active", result === 1);
        }

        // Update Wires
        if (wireA) wireA.classList.toggle("is-active", stateA === 1);
        if (wireB) wireB.classList.toggle("is-active", stateB === 1);
        if (wireOut) wireOut.classList.toggle("is-active", result === 1);

        // Update Gate Symbol
        if (gateSymbol) {
          gateSymbol.textContent = gate;
          gateSymbol.classList.toggle("is-active", result === 1);
        }

        // Highlight Active Row in Truth Table
        if (tbody) {
          $$("tr", tbody).forEach((tr) => {
            tr.classList.toggle("is-active", tr.dataset.row === `${stateA}-${stateB}`);
          });
        }
      }

      if (toggleA) {
        toggleA.addEventListener("click", () => {
          stateA = stateA === 0 ? 1 : 0;
          toggleA.classList.toggle("is-active", stateA === 1);
          updateCircuit();
        });
      }

      if (toggleB) {
        toggleB.addEventListener("click", () => {
          stateB = stateB === 0 ? 1 : 0;
          toggleB.classList.toggle("is-active", stateB === 1);
          updateCircuit();
        });
      }

      if (gateSelect) {
        gateSelect.addEventListener("change", () => {
          renderTruthTable(gateSelect.value);
          updateCircuit();
        });
        renderTruthTable(gateSelect.value);
      }

      updateCircuit();
    });
  }

  /* ---------------------------------------------------------------
     11. ABOUT SKILL BARS ANIMATION
     --------------------------------------------------------------- */
  function initSkillBars() {
    const bars = $$(".about__skill-bar");
    if (!bars.length) return;

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const bar = entry.target;
              const level = bar.dataset.level || "80";
              const fill = bar.querySelector(".about__skill-bar-fill");
              if (fill) fill.style.width = level + "%";
              observer.unobserve(bar);
            }
          });
        },
        { threshold: 0.2 }
      );

      bars.forEach((bar) => observer.observe(bar));
    } else {
      bars.forEach((bar) => {
        const level = bar.dataset.level || "80";
        const fill = bar.querySelector(".about__skill-bar-fill");
        if (fill) fill.style.width = level + "%";
      });
    }
  }

  /* ---------------------------------------------------------------
     12. SCROLL REVEALS (FALLBACK-SAFE)
     --------------------------------------------------------------- */
  function initReveals() {
    const elements = $$("[data-reveal]");
    if (!elements.length) return;

    // Immediately reveal hero elements so they are visible right away
    const heroElements = $$("#hero [data-reveal]");
    heroElements.forEach((el) => el.classList.add("is-revealed"));

    if (prefersReducedMotion) {
      elements.forEach((el) => el.classList.add("is-revealed"));
      return;
    }

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-revealed");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );

      elements.forEach((el) => {
        if (!el.classList.contains("is-revealed")) {
          observer.observe(el);
        }
      });
    } else {
      elements.forEach((el) => el.classList.add("is-revealed"));
    }
  }

  /* ---------------------------------------------------------------
     BOOTSTRAP
     --------------------------------------------------------------- */
  async function boot() {
    await initLoader();

    initSmoothScroll();
    initCursor();
    initMagnetic();
    initThreeHero();
    initTilt();
    initTextSplit();
    initNav();
    initProjects();
    initSignalLab();
    initSkillBars();
    initReveals();

    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
