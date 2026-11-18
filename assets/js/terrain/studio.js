import { draw } from "./render.js";

const columns = 85, rows = 45;
const clamp = value => Math.min(1, Math.max(0, value));

export function initTerrain() {
    const panel = document.querySelector("#studio");
    const canvas = panel.querySelector("canvas");
    if (!canvas.getContext("2d")) return;
    const deck = panel.parentElement;
    const tabs = deck.querySelector(".deck-tabs");
    const portrait = deck.querySelector(".hero-visual");
    const presets = [...panel.querySelectorAll(".terrain-presets button")];
    const undo = panel.querySelector("[data-undo]");
    const slider = panel.querySelector("input");
    const status = panel.querySelector("[role=status]");
    const scenes = presets.map(() => ({ edits: new Float32Array(columns * rows), history: [], relief: 90 }));
    const hitMap = new Float32Array(columns * rows * 2);
    let preset = 0, brush = null, pointer = null, frame = 0;
    const scene = () => scenes[preset];
    function paint() {
        if (panel.hidden) return;
        draw(canvas, { ...scene(), preset }, brush, hitMap);
    }
    function schedule() {
        if (frame) return;
        frame = requestAnimationFrame(() => { frame = 0; paint(); });
    }
    function resize() {
        if (panel.hidden) return;
        const scale = Math.min(devicePixelRatio || 1, 2);
        canvas.width = Math.max(1, Math.round(canvas.clientWidth * scale));
        canvas.height = Math.max(1, Math.round(canvas.clientHeight * scale));
        paint();
    }
    function view(studio) {
        panel.hidden = !studio;
        portrait.hidden = studio;
        for (const tab of tabs.children) tab.setAttribute("aria-pressed", String((tab.dataset.view === "studio") === studio));
        resize();
    }
    tabs.hidden = false;
    for (const tab of tabs.children) tab.onclick = () => view(tab.dataset.view === "studio");
    function select(index) {
        preset = index;
        presets.forEach((button, i) => button.setAttribute("aria-pressed", String(i === index)));
        panel.querySelector("[data-terrain-name]").textContent = presets[index].textContent;
        slider.value = scene().relief;
        panel.querySelector("output").value = slider.value + "%";
        undo.disabled = !scene().history.length;
        status.textContent = "";
        paint();
    }
    presets.forEach((button, i) => button.onclick = () => select(i));
    slider.oninput = () => {
        scene().relief = Number(slider.value);
        panel.querySelector("output").value = slider.value + "%";
        schedule();
    };
    function remember() {
        const history = scene().history;
        if (history.length >= 30) history.shift();
        history.push(scene().edits.slice());
        undo.disabled = false;
        status.textContent = "";
    }
    function stamp() {
        let nearest = 0, best = Infinity;
        for (let i = 0; i < columns * rows; i++) {
            const dx = (hitMap[2 * i] - brush.x) * canvas.width / canvas.height;
            const dy = hitMap[2 * i + 1] - brush.y;
            const distance = dx * dx + dy * dy;
            if (distance <= best) { best = distance; nearest = i; }
        }
        const cx = nearest % columns, cy = Math.floor(nearest / columns);
        for (let y = Math.max(0, cy - 8); y <= Math.min(rows - 1, cy + 8); y++) {
            for (let x = Math.max(0, cx - 12); x <= Math.min(columns - 1, cx + 12); x++) {
                const weight = Math.exp(-((x - cx) ** 2 / 32 + (y - cy) ** 2 / 14));
                const i = y * columns + x;
                scene().edits[i] = Math.min(0.65, scene().edits[i] + .22 * weight);
            }
        }
        schedule();
    }
    function position(event) {
        const rect = canvas.getBoundingClientRect();
        return { x: clamp((event.clientX - rect.left) / rect.width), y: clamp((event.clientY - rect.top) / rect.height) };
    }
    canvas.onpointerdown = event => {
        if (pointer !== null || event.button !== 0) return;
        pointer = event.pointerId;
        canvas.setPointerCapture(pointer);
        brush = position(event);
        remember();
        stamp();
    };
    canvas.onpointermove = event => {
        if (pointer !== null && pointer !== event.pointerId) return;
        brush = position(event);
        if (pointer !== null) stamp();
        else schedule();
    };
    canvas.onlostpointercapture = canvas.onpointerleave = () => {
        if (pointer !== null && canvas.hasPointerCapture(pointer)) return;
        pointer = null;
        brush = null;
        schedule();
    };
    canvas.onblur = () => { brush = null; schedule(); };
    canvas.onkeydown = event => {
        const delta = { ArrowLeft: [-.025, 0], ArrowRight: [.025, 0], ArrowUp: [0, -.025], ArrowDown: [0, .025] }[event.key];
        if (!delta && event.code !== "Space") return;
        event.preventDefault();
        brush ??= { x: .5, y: .52 };
        if (delta) {
            brush.x = clamp(brush.x + delta[0]);
            brush.y = clamp(brush.y + delta[1]);
        } else if (!event.repeat) {
            remember();
            stamp();
            status.textContent = "Peak added.";
        }
        schedule();
    };
    undo.onclick = () => {
        scene().edits = scene().history.pop();
        undo.disabled = !scene().history.length;
        status.textContent = "Stroke removed.";
        paint();
    };
    panel.querySelector("[data-save]").onclick = () => {
        const print = document.createElement("canvas");
        print.width = 1680;
        print.height = 1000;
        draw(print, { ...scene(), preset }, null);
        const link = document.createElement("a");
        link.download = "shashen-" + presets[preset].textContent.toLowerCase() + ".png";
        link.href = print.toDataURL("image/png");
        link.click();
    };
    new ResizeObserver(resize).observe(canvas);
    view(true);
    select(0);
}
