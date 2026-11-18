import { initHeroMotion } from "./hero-motion.js";
import { initProjectExplorer, initProjectGlow } from "./project-explorer.js";
import { initSignalLab } from "./signal-lab.js";

import { initTerrain } from "./terrain/studio.js";

function initScrollNavigation() {
    const progress = document.querySelector("[data-scroll-progress]");
    const header = document.querySelector(".site-header");
    const marker = progress.querySelector("span");
    const sections = [...document.querySelectorAll('[data-nav] a[href^="#"]')]
        .map((link) => ({ link, section: document.getElementById(link.hash.slice(1)) }))
        .filter(({ section }) => section);
    let frame = null;
    let active = null;

    function render() {
        frame = null;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const percentage = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        marker.style.transform = "scaleX(" + percentage + ")";

        const anchor = header.offsetHeight + Math.min(100, window.innerHeight * .16);
        let current = sections[0];
        for (const entry of sections) {
            if (entry.section.getBoundingClientRect().top <= anchor) current = entry;
        }
        if (current !== active) {
            for (const entry of sections) {
                if (entry === current) entry.link.setAttribute("aria-current", "location");
                else entry.link.removeAttribute("aria-current");
            }
            active = current;
        }
    }

    function requestRender() {
        if (frame === null) frame = requestAnimationFrame(render);
    }

    progress.hidden = false;
    window.addEventListener("scroll", requestRender, { passive: true });
    window.addEventListener("resize", requestRender);
    if ("ResizeObserver" in window) new ResizeObserver(requestRender).observe(document.querySelector("main"));
    requestRender();
}

initSignalLab();
initProjectExplorer();
initHeroMotion();
initScrollNavigation();

initTerrain();
initProjectGlow();
