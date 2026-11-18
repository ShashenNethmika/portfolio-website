export function initProjectGlow() {
    const enabled = matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)");
    for (const card of document.querySelectorAll(".project-card")) {
        const artwork = card.querySelector(".project-art");
        card.addEventListener("pointermove", event => {
            if (!enabled.matches) return;
            const bounds = artwork.getBoundingClientRect();
            artwork.style.setProperty("--glow-x", 100 * ((event.clientX - bounds.left) / bounds.width) + "%");
            artwork.style.setProperty("--glow-y", 100 * ((event.clientY - bounds.top) / bounds.height) + "%");
        });
    }
}
