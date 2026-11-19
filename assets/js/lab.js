/* ===================================================================
   LAB JS — The Lab / Interactive Playground Script
   Logic Circuit Studio, 8-Bit Binary Matrix, Kinetic Wave Sandbox,
   and Cyberpunk Glassmorphism Studio
   Shashen Nethmika
   =================================================================== */

(function () {
  "use strict";

  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];

  /* ═══════════════════════════════════════════
     UTILITIES
     ════════════════════════════════════════════ */
  function throttle(fn, delay) {
    let last = 0;
    return function (...args) {
      const now = Date.now();
      if (now - last >= delay) {
        last = now;
        fn.apply(this, args);
      }
    };
  }

  /* ═══════════════════════════════════════════
     AUDIO SYNTHESIS ENGINE (Web Audio API)
     ════════════════════════════════════════════ */
  let audioCtx = null;
  let soundEnabled = true;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(freq = 440, type = "sine", duration = 0.04, gainVal = 0.07) {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq * 0.45), ctx.currentTime + duration);

      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      /* Audio policy or unavailable */
    }
  }

  function playArpeggio(notes = [440, 550, 660]) {
    if (!soundEnabled) return;
    notes.forEach((freq, idx) => {
      setTimeout(() => playTone(freq, "sine", 0.035, 0.05), idx * 40);
    });
  }

  /* ═══════════════════════════════════════════
     BOOT
     ════════════════════════════════════════════ */
  function boot() {
    initCursor();
    initSmoothScroll();
    initMobileMenu();
    initStationTabs();
    initCircuitStudio();
    initBinaryMatrix();
    initKineticWaveSandbox();
    initGlassmorphismStudio();
  }

  /* ═══════════════════════════════════════════
     0. CURSOR & NAVIGATION
     ════════════════════════════════════════════ */
  function initCursor() {
    const dot = $(".cursor-dot");
    const ring = $(".cursor-ring");
    if (!dot || !ring || !matchMedia("(hover: hover)").matches) return;

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

    function render() {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      requestAnimationFrame(render);
    }
    render();

    const hoverables = $$(
      "a, button, input, select, .lab-tab-btn, .matrix-bit-btn, .matrix-op-btn, .sandbox-theme-btn, .glass-preset-btn"
    );
    hoverables.forEach((el) => {
      el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hover"));
      el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"));
    });

    window.addEventListener("mousedown", () => document.body.classList.add("cursor-clicked"));
    window.addEventListener("mouseup", () => document.body.classList.remove("cursor-clicked"));
  }

  function initSmoothScroll() {
    if (window.Lenis && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      try {
        const lenis = new window.Lenis({ duration: 1.2, orientation: "vertical" });
        function raf(time) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      } catch (e) {
        /* fallback to native smooth scroll */
      }
    }
  }

  function initMobileMenu() {
    const toggle = $("#menu-toggle");
    const menu = $("#mobile-menu");
    if (!toggle || !menu) return;

    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      menu.classList.toggle("is-open", !open);
      document.body.style.overflow = !open ? "hidden" : "";
    });

    $$(".mobile-menu__link").forEach((link) => {
      link.addEventListener("click", () => {
        toggle.setAttribute("aria-expanded", "false");
        menu.classList.remove("is-open");
        document.body.style.overflow = "";
      });
    });
  }

  /* ═══════════════════════════════════════════
     1. STATION TABS
     ════════════════════════════════════════════ */
  function initStationTabs() {
    const tabBtns = $$(".lab-tab-btn");
    const stations = $$(".lab-station");

    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.dataset.tab;
        if (!targetId) return;

        tabBtns.forEach((b) => b.classList.remove("is-active"));
        stations.forEach((s) => s.classList.remove("is-active"));

        btn.classList.add("is-active");
        const targetStation = $(`#${targetId}`);
        if (targetStation) {
          targetStation.classList.add("is-active");
        }

        playTone(520, "triangle", 0.03, 0.04);

        // If switching to wave sandbox, trigger canvas resize and particle re-seed
        if (targetId === "station-wave" && window.__resizeWaveCanvas) {
          setTimeout(() => {
            window.__resizeWaveCanvas();
          }, 40);
        }

        // On mobile devices, smoothly align tab view
        if (window.innerWidth < 768 && targetStation) {
          const headerOffset = 80;
          const targetTop = targetStation.getBoundingClientRect().top + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: targetTop,
            behavior: "smooth"
          });
        }
      });
    });
  }

  /* ═══════════════════════════════════════════
     2. STATION 1: LOGIC CIRCUIT STUDIO
     ════════════════════════════════════════════ */
  function initCircuitStudio() {
    const soundToggle = $("#sound-toggle-btn");
    if (soundToggle) {
      soundToggle.addEventListener("click", () => {
        soundEnabled = !soundEnabled;
        soundToggle.classList.toggle("is-active", soundEnabled);
        const span = soundToggle.querySelector("span");
        if (span) span.textContent = soundEnabled ? "Sound: ON" : "Sound: OFF";
        if (soundEnabled) playTone(620, "sine", 0.05, 0.06);
      });
    }

    const gateLogic = {
      AND: (a, b) => (a && b ? 1 : 0),
      OR: (a, b) => (a || b ? 1 : 0),
      XOR: (a, b) => (a !== b ? 1 : 0),
      NAND: (a, b) => (!(a && b) ? 1 : 0),
      NOR: (a, b) => (!(a || b) ? 1 : 0),
    };

    const circuitCards = $$(".circuit-card");

    circuitCards.forEach((card) => {
      const select = card.querySelector(".lab__gate-select");
      const toggleA = card.querySelector('[data-input="a"]');
      const toggleB = card.querySelector('[data-input="b"]');
      const valA = card.querySelector('[data-val="a"]');
      const valB = card.querySelector('[data-val="b"]');
      const gateSymbol = card.querySelector(".lab__gate-symbol");
      const outputVal = card.querySelector(".lab__output-val");
      const wireA = card.querySelector(".lab__wire--a");
      const wireB = card.querySelector(".lab__wire--b");
      const wireOut = card.querySelector(".lab__wire--out");
      const tbody = card.querySelector(".lab__truth-table tbody");

      let stateA = 0;
      let stateB = 0;

      function renderTable(gateName) {
        if (!tbody) return;
        tbody.innerHTML = "";
        [
          [0, 0],
          [0, 1],
          [1, 0],
          [1, 1],
        ].forEach(([a, b]) => {
          const out = gateLogic[gateName](a, b);
          const tr = document.createElement("tr");
          tr.dataset.row = `${a}-${b}`;
          tr.innerHTML = `<td>${a}</td><td>${b}</td><td>${out}</td>`;
          tbody.appendChild(tr);
        });
      }

      function update() {
        const gate = select ? select.value : "AND";
        const result = gateLogic[gate](stateA, stateB);

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

        if (wireA) wireA.classList.toggle("is-active", stateA === 1);
        if (wireB) wireB.classList.toggle("is-active", stateB === 1);
        if (wireOut) wireOut.classList.toggle("is-active", result === 1);

        if (gateSymbol) {
          gateSymbol.textContent = gate;
          gateSymbol.classList.toggle("is-active", result === 1);
        }

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
          playTone(stateA === 1 ? 520 : 380, "sine", 0.035, 0.06);
          update();
        });
      }

      if (toggleB) {
        toggleB.addEventListener("click", () => {
          stateB = stateB === 0 ? 1 : 0;
          toggleB.classList.toggle("is-active", stateB === 1);
          playTone(stateB === 1 ? 520 : 380, "sine", 0.035, 0.06);
          update();
        });
      }

      if (select) {
        select.addEventListener("change", () => {
          renderTable(select.value);
          playTone(460, "triangle", 0.04, 0.05);
          update();
        });
        renderTable(select.value);
      }

      update();
    });
  }

  /* ═══════════════════════════════════════════
     3. STATION 2: 8-BIT BINARY MATRIX
     ════════════════════════════════════════════ */
  function initBinaryMatrix() {
    // 8 bits (Bit 7 down to Bit 0) - default 00101011 = 43 decimal = 0x2B = '+'
    let bits = [0, 0, 1, 0, 1, 0, 1, 1];

    const bitBtns = $$(".matrix-bit-btn");
    const binDisplay = $("#matrix-bin-val");
    const decDisplay = $("#matrix-dec-val");
    const hexDisplay = $("#matrix-hex-val");
    const asciiDisplay = $("#matrix-ascii-val");

    function renderMatrix() {
      // Calculate decimal
      let decVal = 0;
      bits.forEach((b, idx) => {
        const weight = Math.pow(2, 7 - idx);
        if (b === 1) decVal += weight;
      });

      // Update bit buttons
      bitBtns.forEach((btn, idx) => {
        const isOne = bits[idx] === 1;
        btn.classList.toggle("is-active", isOne);
        const textNode = btn.querySelector("span:not(.matrix-bit-led)");
        if (textNode) textNode.textContent = isOne ? "1" : "0";
      });

      // Update displays
      const binStr = bits.join("");
      if (binDisplay) binDisplay.textContent = binStr;
      if (decDisplay) decDisplay.textContent = String(decVal);
      if (hexDisplay) hexDisplay.textContent = "0x" + decVal.toString(16).toUpperCase().padStart(2, "0");

      if (asciiDisplay) {
        if (decVal >= 32 && decVal <= 126) {
          asciiDisplay.textContent = `'${String.fromCharCode(decVal)}'`;
        } else if (decVal === 0) {
          asciiDisplay.textContent = "[NUL 0]";
        } else if (decVal === 10) {
          asciiDisplay.textContent = "[LF /n]";
        } else if (decVal === 13) {
          asciiDisplay.textContent = "[CR /r]";
        } else {
          asciiDisplay.textContent = `[ASCII ${decVal}]`;
        }
      }
    }

    // Toggle bit click
    bitBtns.forEach((btn, idx) => {
      btn.addEventListener("click", () => {
        bits[idx] = bits[idx] === 1 ? 0 : 1;
        playTone(bits[idx] === 1 ? 640 : 340, "sine", 0.035, 0.06);
        renderMatrix();
      });
    });

    // Bitwise operations
    const opNot = $("#matrix-op-not");
    const opShl = $("#matrix-op-shl");
    const opShr = $("#matrix-op-shr");
    const opInc = $("#matrix-op-inc");
    const opDec = $("#matrix-op-dec");
    const opRandom = $("#matrix-op-random");
    const opClear = $("#matrix-op-clear");
    const opSet = $("#matrix-op-set");

    if (opNot) {
      opNot.addEventListener("click", () => {
        bits = bits.map((b) => (b === 1 ? 0 : 1));
        playTone(580, "triangle", 0.04, 0.07);
        renderMatrix();
      });
    }

    if (opShl) {
      opShl.addEventListener("click", () => {
        bits.shift();
        bits.push(0);
        playArpeggio([440, 580, 720]);
        renderMatrix();
      });
    }

    if (opShr) {
      opShr.addEventListener("click", () => {
        bits.pop();
        bits.unshift(0);
        playArpeggio([720, 580, 440]);
        renderMatrix();
      });
    }

    if (opInc) {
      opInc.addEventListener("click", () => {
        let decVal = parseInt(bits.join(""), 2);
        decVal = (decVal + 1) % 256;
        const binStr = decVal.toString(2).padStart(8, "0");
        bits = binStr.split("").map(Number);
        playTone(660, "sine", 0.04, 0.06);
        renderMatrix();
      });
    }

    if (opDec) {
      opDec.addEventListener("click", () => {
        let decVal = parseInt(bits.join(""), 2);
        decVal = (decVal - 1 + 256) % 256;
        const binStr = decVal.toString(2).padStart(8, "0");
        bits = binStr.split("").map(Number);
        playTone(390, "sine", 0.04, 0.06);
        renderMatrix();
      });
    }

    if (opRandom) {
      opRandom.addEventListener("click", () => {
        bits = bits.map(() => (Math.random() > 0.5 ? 1 : 0));
        playArpeggio([420, 640, 520]);
        renderMatrix();
      });
    }

    if (opClear) {
      opClear.addEventListener("click", () => {
        bits = [0, 0, 0, 0, 0, 0, 0, 0];
        playTone(280, "sine", 0.05, 0.07);
        renderMatrix();
      });
    }

    if (opSet) {
      opSet.addEventListener("click", () => {
        bits = [1, 1, 1, 1, 1, 1, 1, 1];
        playTone(740, "sine", 0.05, 0.07);
        renderMatrix();
      });
    }

    renderMatrix();
  }

  /* ═══════════════════════════════════════════
     4. STATION 3: KINETIC WAVE & PARTICLE SANDBOX
     ════════════════════════════════════════════ */
  function initKineticWaveSandbox() {
    const canvas = $("#sandbox-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    const particles = [];
    const count = 120;
    let wavePhase = 0;

    let colorTheme = "#66e3f5";
    const themes = {
      cyan: "#66e3f5",
      purple: "#c084fc",
      amber: "#fbbf24",
      green: "#4ade80",
    };

    function initParticles() {
      particles.length = 0;
      const safeW = width || 800;
      const safeH = height || 480;
      for (let i = 0; i < count; i++) {
        const px = Math.random() * safeW;
        const py = Math.random() * safeH;
        particles.push({
          x: px,
          y: py,
          originX: px,
          originY: py,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          radius: Math.random() * 2.5 + 1.5,
          alpha: Math.random() * 0.6 + 0.3,
        });
      }
    }

    function resizeCanvas() {
      const wrap = canvas.parentElement;
      const rect = wrap ? wrap.getBoundingClientRect() : canvas.getBoundingClientRect();
      const newW = Math.floor(rect.width) || canvas.clientWidth || 800;
      const newH = Math.floor(rect.height) || canvas.clientHeight || 480;

      if (newW > 0 && newH > 0) {
        if (canvas.width !== newW || canvas.height !== newH || particles.length === 0) {
          canvas.width = width = newW;
          canvas.height = height = newH;
          initParticles();
        }
      }
    }

    // Expose for tab switcher
    window.__resizeWaveCanvas = resizeCanvas;

    // Initial resize attempt
    resizeCanvas();

    // ResizeObserver on canvas container
    if (window.ResizeObserver && canvas.parentElement) {
      const ro = new ResizeObserver(() => {
        resizeCanvas();
      });
      ro.observe(canvas.parentElement);
    }

    // Window resize fallback
    window.addEventListener(
      "resize",
      throttle(() => {
        resizeCanvas();
      }, 200)
    );

    // Color theme buttons
    $$(".sandbox-theme-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        $$(".sandbox-theme-btn").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        const t = btn.dataset.theme;
        colorTheme = themes[t] || "#66e3f5";
        playTone(540, "sine", 0.03, 0.05);
      });
    });

    const mouse = { x: width / 2, y: height / 2, active: false };

    // Mouse movement
    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    });

    canvas.addEventListener("mouseleave", () => {
      mouse.active = false;
    });

    // Touch support for mobile devices
    canvas.addEventListener(
      "touchstart",
      (e) => {
        if (!e.touches[0]) return;
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.touches[0].clientX - rect.left;
        mouse.y = e.touches[0].clientY - rect.top;
        mouse.active = true;
        triggerShockwave(mouse.x, mouse.y);
      },
      { passive: true }
    );

    canvas.addEventListener(
      "touchmove",
      (e) => {
        if (!e.touches[0]) return;
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.touches[0].clientX - rect.left;
        mouse.y = e.touches[0].clientY - rect.top;
        mouse.active = true;
      },
      { passive: true }
    );

    canvas.addEventListener("touchend", () => {
      mouse.active = false;
    });

    function triggerShockwave(clickX, clickY) {
      playTone(780, "sine", 0.08, 0.08);

      particles.forEach((p) => {
        const dx = p.x - clickX;
        const dy = p.y - clickY;
        const dist = Math.hypot(dx, dy);
        if (dist < 220) {
          const force = (220 - dist) * 0.16;
          p.vx += (dx / (dist || 1)) * force;
          p.vy += (dy / (dist || 1)) * force;
        }
      });
    }

    // Canvas click shockwave
    canvas.addEventListener("click", (e) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      triggerShockwave(clickX, clickY);
    });

    // Burst button
    const burstBtn = $("#sandbox-burst-btn");
    if (burstBtn) {
      burstBtn.addEventListener("click", () => {
        triggerShockwave(width / 2, height / 2);
      });
    }

    // Render loop
    function renderLoop() {
      requestAnimationFrame(renderLoop);

      if (width === 0 || height === 0) {
        resizeCanvas();
        if (width === 0) return;
      }

      // Smooth trailing fade
      ctx.fillStyle = "rgba(6, 10, 18, 0.24)";
      ctx.fillRect(0, 0, width, height);

      wavePhase += 0.03;

      // Draw kinetic wave lines
      ctx.beginPath();
      ctx.strokeStyle = colorTheme + "33";
      ctx.lineWidth = 1.5;
      for (let x = 0; x < width; x += 10) {
        const y = height / 2 + Math.sin(x * 0.015 + wavePhase) * 36;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Update & Draw particles
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        p.vx *= 0.96;
        p.vy *= 0.96;

        // Cursor attraction / perturbation
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 150) {
            const force = (150 - dist) * 0.014;
            p.vx -= (dx / dist) * force;
            p.vy -= (dy / dist) * force;
          }
        }

        // Return drift to origin
        p.x += (p.originX - p.x) * 0.005;
        p.y += (p.originY - p.y) * 0.005;

        // Wrap boundaries
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Render particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = colorTheme;
        ctx.shadowColor = colorTheme;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Connect nearby nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 70) {
            ctx.beginPath();
            const hexAlpha = Math.floor((1 - dist / 70) * 55)
              .toString(16)
              .padStart(2, "0");
            ctx.strokeStyle = colorTheme + hexAlpha;
            ctx.lineWidth = 0.8;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });
    }
    renderLoop();
  }

  /* ═══════════════════════════════════════════
     5. STATION 4: CYBERPUNK GLASS & GLOW STUDIO
     ════════════════════════════════════════════ */
  function initGlassmorphismStudio() {
    const blurSlider = $("#slider-blur");
    const opacitySlider = $("#slider-opacity");
    const glowSlider = $("#slider-glow");
    const hueSlider = $("#slider-hue");
    const radiusSlider = $("#slider-radius");

    const valBlur = $("#val-blur");
    const valOpacity = $("#val-opacity");
    const valGlow = $("#val-glow");
    const valHue = $("#val-hue");
    const valRadius = $("#val-radius");

    const previewPanel = $("#glass-preview-panel");
    const targetCard = $("#glass-target-card");
    const codePre = $("#glass-code-pre");
    const copyBtn = $("#glass-copy-btn");
    const presetBtns = $$(".glass-preset-btn");

    const presets = {
      cyan: { blur: 16, opacity: 25, glow: 24, hue: 185, radius: 20 },
      neon: { blur: 20, opacity: 30, glow: 35, hue: 300, radius: 24 },
      emerald: { blur: 18, opacity: 20, glow: 30, hue: 145, radius: 16 },
      amber: { blur: 14, opacity: 35, glow: 28, hue: 42, radius: 22 },
      stealth: { blur: 28, opacity: 65, glow: 10, hue: 210, radius: 18 },
    };

    function updateGlass() {
      const blur = blurSlider ? blurSlider.value : "16";
      const opacity = opacitySlider ? opacitySlider.value : "25";
      const glow = glowSlider ? glowSlider.value : "24";
      const hue = hueSlider ? hueSlider.value : "185";
      const radius = radiusSlider ? radiusSlider.value : "20";

      if (valBlur) valBlur.textContent = `${blur}px`;
      if (valOpacity) valOpacity.textContent = `${opacity}%`;
      if (valGlow) valGlow.textContent = `${glow}px`;
      if (valHue) valHue.textContent = `${hue}°`;
      if (valRadius) valRadius.textContent = `${radius}px`;

      const bgAlpha = (parseInt(opacity, 10) / 100).toFixed(2);
      const accentColor = `hsl(${hue}, 88%, 68%)`;

      if (targetCard) {
        targetCard.style.background = `rgba(16, 24, 39, ${bgAlpha})`;
        targetCard.style.backdropFilter = `blur(${blur}px)`;
        targetCard.style.webkitBackdropFilter = `blur(${blur}px)`;
        targetCard.style.borderColor = accentColor;
        targetCard.style.borderRadius = `${radius}px`;
        targetCard.style.boxShadow = `0 20px 50px rgba(0, 0, 0, 0.65), 0 0 ${glow}px ${accentColor}55`;
      }

      if (codePre) {
        codePre.textContent = `/* Cyberpunk Glassmorphism */
background: rgba(16, 24, 39, ${bgAlpha});
backdrop-filter: blur(${blur}px);
-webkit-backdrop-filter: blur(${blur}px);
border: 1px solid ${accentColor};
border-radius: ${radius}px;
box-shadow: 0 20px 50px rgba(0, 0, 0, 0.65),
            0 0 ${glow}px ${accentColor}55;`;
      }
    }

    [blurSlider, opacitySlider, glowSlider, hueSlider, radiusSlider].forEach((slider) => {
      if (slider) slider.addEventListener("input", updateGlass);
    });

    // Presets
    presetBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        presetBtns.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");

        const p = presets[btn.dataset.preset];
        if (!p) return;

        if (blurSlider) blurSlider.value = p.blur;
        if (opacitySlider) opacitySlider.value = p.opacity;
        if (glowSlider) glowSlider.value = p.glow;
        if (hueSlider) hueSlider.value = p.hue;
        if (radiusSlider) radiusSlider.value = p.radius;

        playTone(600, "triangle", 0.04, 0.06);
        updateGlass();
      });
    });

    // 3D Card Interactive Mouse Tilt
    if (previewPanel && targetCard && matchMedia("(hover: hover)").matches) {
      previewPanel.addEventListener("mousemove", (e) => {
        const rect = previewPanel.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        const rotX = (y / (rect.height / 2)) * -14;
        const rotY = (x / (rect.width / 2)) * 14;

        targetCard.style.transform = `perspective(900px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
      });

      previewPanel.addEventListener("mouseleave", () => {
        targetCard.style.transform = `perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      });
    }

    // 1-Click Copy CSS Button
    if (copyBtn && codePre) {
      copyBtn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(codePre.textContent);
          const orig = copyBtn.textContent;
          copyBtn.textContent = "Copied to Clipboard! ✓";
          copyBtn.style.background = "#22c55e";
          copyBtn.style.borderColor = "#22c55e";
          playArpeggio([520, 660, 880]);

          setTimeout(() => {
            copyBtn.textContent = orig;
            copyBtn.style.background = "";
            copyBtn.style.borderColor = "";
          }, 2000);
        } catch (e) {
          /* clipboard fallback */
        }
      });
    }

    updateGlass();
  }

  /* ═══════════════════════════════════════════
     BOOTSTRAP
     ════════════════════════════════════════════ */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
