const menuButton = document.querySelector("[data-menu-toggle]");
const navigation = document.querySelector("[data-nav]");

if (menuButton && navigation) {
    const mobile = window.matchMedia("(max-width: 760px)");

    function setMenu(open) {
        navigation.classList.toggle("is-open", open);
        menuButton.setAttribute("aria-expanded", String(open));
    }

    document.documentElement.classList.add("menu-ready");
    menuButton.hidden = false;
    menuButton.addEventListener("click", () => {
        setMenu(menuButton.getAttribute("aria-expanded") !== "true");
    });
    navigation.addEventListener("click", (event) => {
        const link = event.target.closest("a");
        if (!link || !mobile.matches) return;

        setMenu(false);
        const target = link.hash && link.pathname === location.pathname
            ? document.getElementById(link.hash.slice(1))
            : null;
        if (target) {
            target.setAttribute("tabindex", "-1");
            target.focus({ preventScroll: true });
        }
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && navigation.classList.contains("is-open")) {
            setMenu(false);
            menuButton.focus();
        }
    });
    document.addEventListener("pointerdown", (event) => {
        if (!navigation.contains(event.target) && !menuButton.contains(event.target)) {
            if (navigation.contains(document.activeElement) && navigation.classList.contains("is-open")) {
                menuButton.focus({ preventScroll: true });
            }
            setMenu(false);
        }
    });
    document.addEventListener("focusin", (event) => {
        if (!navigation.contains(event.target) && !menuButton.contains(event.target)) setMenu(false);
    });
    mobile.addEventListener("change", () => {
        if (mobile.matches && navigation.contains(document.activeElement)) menuButton.focus();
        setMenu(false);
    });
}

const projectFilters = document.querySelector("[data-project-filters]");
const projectCards = Array.from(document.querySelectorAll("[data-project-category]"));
const projectStatus = document.querySelector("[data-project-status]");

if (projectFilters && projectCards.length > 0) {
    const filterButtons = Array.from(projectFilters.querySelectorAll("[data-project-filter]"));
    for (const button of filterButtons) {
        button.addEventListener("click", () => {
            const selected = button.dataset.projectFilter;
            for (const filter of filterButtons) {
                filter.setAttribute("aria-pressed", String(filter === button));
            }

            let visibleCount = 0;
            for (const card of projectCards) {
                card.hidden = selected !== "all" && card.dataset.projectCategory !== selected;
                if (!card.hidden) visibleCount++;
            }
            if (projectStatus) {
                projectStatus.textContent = `${visibleCount} ${visibleCount === 1 ? "project" : "projects"} shown.`;
            }
        });
    }
    if (filterButtons.length) projectFilters.hidden = false;
}

const copyButton = document.querySelector("[data-copy-email]");
const emailAddress = document.querySelector("[data-email-address]");
const copyStatus = document.querySelector("[data-copy-status]");

if (copyButton && emailAddress && copyStatus && navigator.clipboard?.writeText) {
    copyButton.hidden = false;
    copyButton.addEventListener("click", async () => {
        copyStatus.textContent = "";
        try {
            await navigator.clipboard.writeText(emailAddress.textContent.trim());
            copyStatus.textContent = "Email address copied.";
        } catch {
            copyStatus.textContent = "Couldn’t copy. Select the email address to copy it manually.";
        }
    });
}

if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const reveals = new IntersectionObserver((entries, observer) => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
        }
    }, { threshold: 0.12 });

    for (const item of document.querySelectorAll("[data-reveal]")) reveals.observe(item);
}
