const studies = {
    "art-vesak": {
        goal: "Give a personalized Vesak greeting room to breathe on both a narrow phone and a wide screen.",
        approach: "HTML and CSS define the card layout. Flexbox lets the greeting and artwork adapt to the space available.",
        preview: { title: "Try a lantern palette", options: [["Lilac", "lilac"], ["Amber", "amber"]] }
    },
    "art-new-year": {
        goal: "Create a shareable greeting that keeps the Sinhala and Tamil New Year message front and center.",
        approach: "The responsive HTML and CSS layout pairs a personalized wish with festival artwork."
    },
    "art-study": {
        goal: "Make it easy to see how much focus time remains without interrupting a study session.",
        approach: "A countdown pairs with animated CSS progress and customizable color themes.",
        timer: true
    },
    "art-weather": {
        goal: "Make location and forecast details quick to scan, including on smaller screens.",
        approach: "The dashboard uses CSS Grid to organize weather cards into a flexible layout."
    },
    "art-film": {
        goal: "Make movie collections easy to browse and keep the details of each title within reach.",
        approach: "The responsive web showcase pairs a discovery view with film details to help visitors decide what to watch."
    },
    "art-cinema": {
        goal: "Tell a short story while keeping characters recognizable from shot to shot.",
        approach: "Custom prompts guide the generative footage. Editing in DaVinci Resolve and CapCut brings the shots together."
    }
};

function create(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
}

function createButton(className, label) {
    const button = create("button", className, label);
    button.type = "button";
    return button;
}

function addDetail(list, term, description) {
    const item = create("div");
    item.append(create("dt", "", term), create("dd", "", description));
    list.append(item);
}

function addPalettePreview(container, artwork, data) {
    const title = create("p", "explorer-demo-title", data.title);
    const choices = create("div", "explorer-demo-actions");
    choices.setAttribute("role", "group");
    choices.setAttribute("aria-label", data.title);

    for (const [label, palette] of data.options) {
        const choice = createButton("explorer-control", label);
        choice.dataset.palette = palette;
        choices.append(choice);
        choice.addEventListener("click", () => selectPalette(palette));
    }

    function selectPalette(palette) {
        artwork.dataset.palette = palette;
        for (const choice of choices.children) {
            choice.setAttribute("aria-pressed", String(choice.dataset.palette === palette));
        }
    }

    selectPalette(data.options[0][1]);
    container.append(title, choices);
}

function addTimerPreview(container, artwork) {
    const duration = 25 * 60 * 1000;
    const display = artwork.querySelector(".study-dial span");
    if (!display) return null;
    artwork.removeAttribute("aria-hidden");
    display.setAttribute("role", "timer");
    display.setAttribute("aria-label", "Remaining focus time");

    const title = create("p", "explorer-demo-title", "Try the focus timer");
    const controls = create("div", "explorer-demo-actions");
    const toggle = createButton("explorer-control explorer-control-primary", "Start");
    const reset = createButton("explorer-control", "Reset");
    const progress = create("progress", "explorer-progress");
    progress.max = duration / 1000;
    progress.setAttribute("aria-label", "Elapsed focus time");
    const status = create("p", "explorer-announcement");
    status.setAttribute("role", "status");
    controls.append(toggle, reset);
    container.append(title, controls, progress, status);

    let remaining = duration;
    let endsAt = 0;
    let interval = null;

    function stop() {
        if (interval === null) return;
        window.clearInterval(interval);
        interval = null;
    }

    function updateDisplay() {
        const totalSeconds = Math.ceil(remaining / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        display.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
        progress.value = progress.max - totalSeconds;
    }

    function tick() {
        remaining = Math.max(0, endsAt - Date.now());
        updateDisplay();
        if (remaining === 0) {
            stop();
            toggle.textContent = "Start";
            status.textContent = "Focus timer finished.";
        }
    }

    toggle.addEventListener("click", () => {
        if (interval !== null) {
            tick();
            if (remaining === 0) return;
            stop();
            toggle.textContent = "Resume";
            status.textContent = "Focus timer paused.";
            return;
        }

        const resuming = remaining > 0 && remaining < duration;
        if (remaining === 0) remaining = duration;
        endsAt = Date.now() + remaining;
        interval = window.setInterval(tick, 200);
        tick();
        toggle.textContent = "Pause";
        status.textContent = resuming ? "Focus timer resumed." : "Focus timer started.";
    });

    reset.addEventListener("click", () => {
        stop();
        remaining = duration;
        updateDisplay();
        toggle.textContent = "Start";
        status.textContent = "Focus timer reset to 25 minutes.";
    });

    updateDisplay();
    return stop;
}

export function initProjectExplorer() {
    const projects = document.querySelector("#projects");
    const dialog = document.createElement("dialog");
    if (!projects || typeof dialog.showModal !== "function" || document.getElementById("project-explorer")) return;

    const items = [];
    for (const card of projects.querySelectorAll(".project-card")) {
        const artwork = card.querySelector(".project-art");
        const key = artwork && Array.from(artwork.classList).find((name) => Object.hasOwn(studies, name));
        const heading = card.querySelector("h3");
        const content = card.querySelector(".project-content");
        const link = content?.querySelector(".project-link");
        const description = content?.querySelector(".project-description");
        const type = content?.querySelector(".project-type");
        const stack = content?.querySelector(".project-stack");
        if (!key || !heading || !link || !description || !type || !stack) continue;
        items.push({ card, artwork, study: studies[key], heading, link, description, type, stack });
    }
    if (!items.length) return;

    dialog.id = "project-explorer";
    dialog.className = "project-explorer";
    dialog.setAttribute("aria-labelledby", "project-explorer-title");

    const shell = create("div", "explorer-shell");
    const toolbar = create("header", "explorer-toolbar");
    const label = create("p", "eyebrow", "Case study");
    const close = createButton("explorer-close", "Close");
    toolbar.append(label, close);

    const content = create("div", "explorer-scroll");
    const intro = create("header", "explorer-intro");
    const title = create("h2", "");
    title.id = "project-explorer-title";
    title.tabIndex = -1;
    const type = create("p", "project-type");
    const overview = create("p", "explorer-overview");
    const technologies = create("div", "explorer-technologies");
    intro.append(type, title, overview, technologies);

    const visual = create("div", "explorer-visual");
    const demo = create("div", "explorer-demo");
    const details = create("dl", "explorer-details");
    const repository = create("div", "explorer-repository");
    content.append(intro, visual, demo, details, repository);

    const navigation = create("footer", "explorer-navigation");
    const previous = createButton("explorer-control", "Previous project");
    const next = createButton("explorer-control", "Next project");
    const position = create("p", "explorer-position");
    navigation.append(previous, position, next);

    shell.append(toolbar, content, navigation);
    dialog.append(shell);
    document.body.append(dialog);

    let openFrom = null;
    let activeItems = [];
    let current = 0;
    let endDemo = null;
    let pointerDownOnBackdrop = false;

    function render() {
        endDemo?.();
        endDemo = null;
        const { heading, description, stack, link, artwork, study, type: projectType } = activeItems[current];
        title.textContent = heading.textContent;
        type.textContent = projectType.textContent;
        overview.textContent = description.textContent;
        technologies.replaceChildren(stack.cloneNode(true));
        details.replaceChildren();
        addDetail(details, "Design goal", study.goal);
        addDetail(details, "Approach", study.approach);

        const featuredArt = artwork.cloneNode(true);
        visual.replaceChildren(featuredArt);
        demo.replaceChildren();
        demo.hidden = !study.timer && !study.preview;
        if (study.timer) endDemo = addTimerPreview(demo, featuredArt);
        if (study.preview) addPalettePreview(demo, featuredArt, study.preview);

        const repositoryLink = link.cloneNode(true);
        repositoryLink.className = "button button-secondary explorer-repository-link";
        repository.replaceChildren(repositoryLink);
        position.textContent = `${current + 1} of ${activeItems.length}`;
        navigation.hidden = activeItems.length < 2;
        content.scrollTop = 0;
    }

    function move(offset) {
        if (activeItems.length < 2) return;
        current = (current + offset + activeItems.length) % activeItems.length;
        render();
        title.focus({ preventScroll: true });
    }

    for (const item of items) {
        const actions = create("div", "explorer-card-actions");
        const opener = createButton("explorer-card-trigger", "Case study");
        opener.setAttribute("aria-label", `Case study for ${item.heading.textContent}`);
        opener.setAttribute("aria-haspopup", "dialog");
        item.link.before(actions);
        actions.append(opener, item.link);
        opener.addEventListener("click", () => {
            activeItems = items.filter(({ card }) => !card.hidden);
            current = activeItems.indexOf(item);
            if (current === -1) return;
            openFrom = opener;
            render();
            dialog.showModal();
            document.documentElement.classList.add("explorer-open");
            title.focus({ preventScroll: true });
        });
    }

    previous.addEventListener("click", () => move(-1));
    next.addEventListener("click", () => move(1));
    close.addEventListener("click", () => dialog.close());
    dialog.addEventListener("keydown", (event) => {
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        if (event.target.closest("a, button, input, [contenteditable]")) return;
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        move(event.key === "ArrowLeft" ? -1 : 1);
    });
    dialog.addEventListener("pointerdown", (event) => {
        pointerDownOnBackdrop = event.target === dialog;
    });
    dialog.addEventListener("click", (event) => {
        if (pointerDownOnBackdrop && event.target === dialog) dialog.close();
        pointerDownOnBackdrop = false;
    });
    dialog.addEventListener("close", () => {
        endDemo?.();
        endDemo = null;
        document.documentElement.classList.remove("explorer-open");
        openFrom?.focus({ preventScroll: true });
        openFrom = null;
    });
}

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
