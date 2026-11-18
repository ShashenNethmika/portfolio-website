const anchors = [
    [.37, .12], [.46, .24], [.49, .07], [.53, .34], [.55, .13], [.59, .23],
    [.62, .08], [.67, .16], [.70, .05], [.73, .25], [.77, .12], [.82, .06],
    [.85, .20], [.89, .12], [.92, .26], [.96, .09], [.98, .33], [.94, .46],
    [.88, .37], [.78, .43], [.62, .39], [.57, .49], [.49, .51], [.56, .65],
    [.63, .59], [.67, .75], [.78, .66], [.86, .61], [.94, .60], [.98, .76],
    [.91, .77], [.84, .87], [.75, .81], [.71, .94], [.61, .87], [.55, .92],
];

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function createField(width, height) {
    const small = width <= 760;
    const points = anchors.map(([x, y], index) => ({
        baseX: (small ? x * 1.34 - .35 : x) * width,
        baseY: y * height,
        phase: index * 2.39996,
        beacon: index % 7 === 2,
        x: 0,
        y: 0,
        influence: 0,
    }));
    const links = [];
    const limit = clamp(width * .099, 64, 134);

    for (const [index, point] of points.entries()) {
        for (const neighbor of points.slice(index + 1)) {
            const distance = Math.hypot(point.baseX - neighbor.baseX, point.baseY - neighbor.baseY);
            if (distance < limit) links.push({ point, neighbor, proximity: 1 - distance / limit });
        }
    }

    return { width, height, points, links };
}

function paintField(context, field, pointer, progress) {
    const { width, height, points, links } = field;
    const pointerX = pointer.x * width;
    const pointerY = pointer.y * height;
    const radius = clamp(width * .15, 105, 210);
    const drift = (1 - progress) * 10;
    context.clearRect(0, 0, width, height);

    for (const point of points) {
        const dx = pointerX - point.baseX;
        const dy = pointerY - point.baseY;
        point.influence = Math.max(0, 1 - Math.hypot(dx, dy) / radius) * pointer.strength;
        point.x = point.baseX + Math.cos(point.phase + progress * 4) * drift + dx * point.influence * .15;
        point.y = point.baseY + Math.sin(point.phase + progress * 4) * drift + dy * point.influence * .15;
    }

    context.lineWidth = 1;
    for (const { point, neighbor, proximity } of links) {
        const strength = Math.max(point.influence, neighbor.influence);
        const alpha = .05 + proximity * .16 + strength * .24;
        context.strokeStyle = `rgba(102, 227, 245, ${alpha})`;
        context.beginPath();
        context.moveTo(point.x, point.y);
        context.lineTo(neighbor.x, neighbor.y);
        context.stroke();
    }

    for (const point of points) {
        const alpha = (point.beacon ? .58 : .27) + point.influence * .38;
        context.fillStyle = `rgba(146, 231, 255, ${alpha})`;
        context.beginPath();
        context.arc(point.x, point.y, (point.beacon ? 2 : 1.35) + point.influence, 0, Math.PI * 2);
        context.fill();

        if (point.beacon) {
            context.strokeStyle = `rgba(102, 227, 245, ${.18 + point.influence * .47})`;
            context.beginPath();
            context.arc(point.x, point.y, 5 + point.influence * 5, 0, Math.PI * 2);
            context.stroke();
        }
    }
}

export function initHeroMotion() {
    const hero = document.querySelector(".hero");
    const visual = hero?.querySelector(".hero-visual");
    const portrait = visual?.querySelector(".portrait");
    if (!portrait || hero.querySelector(".hero-motion-canvas")) return;

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.className = "hero-motion-canvas";
    canvas.setAttribute("aria-hidden", "true");
    hero.prepend(canvas);

    const glint = document.createElement("span");
    glint.className = "portrait-glint";
    glint.setAttribute("aria-hidden", "true");
    portrait.append(glint);

    const motion = matchMedia("(prefers-reduced-motion: no-preference)");
    const hover = matchMedia("(any-hover: hover) and (any-pointer: fine)");
    const pointer = { x: .75, y: .5, strength: 0 };
    const targetPointer = { ...pointer };
    const tilt = { x: 0, y: 0, strength: 0 };
    const targetTilt = { ...tilt };
    let field;
    let frame = 0;
    let lastTime = 0;
    let progress = motion.matches ? 0 : 1;
    let sizingNeeded = true;
    let visible = !("IntersectionObserver" in window);

    function fitCanvas() {
        const width = hero.clientWidth;
        const height = hero.clientHeight;
        const scale = Math.min(1.5, window.devicePixelRatio || 1);
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(height * scale);
        context.setTransform(scale, 0, 0, scale, 0, 0);
        field = createField(width, height);
        sizingNeeded = false;
    }

    function requestRender() {
        if (!frame && visible && !document.hidden) frame = requestAnimationFrame(render);
    }

    function render(timestamp) {
        frame = 0;
        if (sizingNeeded) fitCanvas();

        const delta = lastTime ? Math.min(timestamp - lastTime, 48) : 16;
        const smoothing = 1 - Math.pow(.76, delta / 16);
        lastTime = timestamp;
        progress = motion.matches ? Math.min(1, progress + delta / 2200) : 1;

        let moving = false;
        for (const [current, target] of [[pointer, targetPointer], [tilt, targetTilt]]) {
            for (const key of ["x", "y", "strength"]) {
                const difference = target[key] - current[key];
                if (motion.matches && Math.abs(difference) > .002) {
                    current[key] += difference * smoothing;
                    moving = true;
                } else {
                    current[key] = target[key];
                }
            }
        }

        paintField(context, field, pointer, progress);

        if (tilt.strength > 0) {
            portrait.style.setProperty("--portrait-rx", `${-tilt.y * 6}deg`);
            portrait.style.setProperty("--portrait-ry", `${tilt.x * 7}deg`);
            portrait.style.setProperty("--portrait-light-x", `${50 + tilt.x * 40}%`);
            portrait.style.setProperty("--portrait-light-y", `${50 + tilt.y * 40}%`);
            portrait.style.setProperty("--portrait-alpha", String(tilt.strength));
            portrait.style.setProperty("--portrait-shift-x", `${-tilt.x * 4}px`);
            portrait.style.setProperty("--portrait-shift-y", `${-tilt.y * 4}px`);
            portrait.dataset.heroTilt = "";
        } else {
            delete portrait.dataset.heroTilt;
        }

        if (motion.matches && (progress < 1 || moving)) {
            requestRender();
        } else {
            lastTime = 0;
        }
    }

    function resetPointer() {
        targetPointer.strength = 0;
        Object.assign(targetTilt, { x: 0, y: 0, strength: 0 });
        requestRender();
    }

    function stopRendering() {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        lastTime = 0;
        resetPointer();
    }

    function resize() {
        sizingNeeded = true;
        requestRender();
    }

    hero.addEventListener("pointermove", (event) => {
        if (!motion.matches || !hover.matches || event.pointerType === "touch") return;
        const bounds = hero.getBoundingClientRect();
        const picture = visual.getBoundingClientRect();
        const x = (event.clientX - picture.left) / picture.width;
        const y = (event.clientY - picture.top) / picture.height;
        const overPortrait = x >= 0 && x <= 1 && y >= 0 && y <= 1;

        targetPointer.x = (event.clientX - bounds.left) / bounds.width;
        targetPointer.y = (event.clientY - bounds.top) / bounds.height;
        targetPointer.strength = 1;
        targetTilt.x = overPortrait ? x * 2 - 1 : 0;
        targetTilt.y = overPortrait ? y * 2 - 1 : 0;
        targetTilt.strength = overPortrait ? 1 : 0;
        requestRender();
    }, { passive: true });

    hero.addEventListener("pointerleave", resetPointer);
    hero.addEventListener("pointercancel", resetPointer);
    motion.addEventListener("change", resetPointer);
    hover.addEventListener("change", resetPointer);
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) stopRendering();
        else resize();
    });

    if ("IntersectionObserver" in window) {
        const intersection = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible) resize();
            else stopRendering();
        });
        intersection.observe(hero);
    }
    if ("ResizeObserver" in window) {
        const observer = new ResizeObserver(resize);
        observer.observe(hero);
    } else {
        window.addEventListener("resize", resize);
    }

    requestRender();
}
