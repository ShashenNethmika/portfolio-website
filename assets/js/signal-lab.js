const progressKey = "shashen-portfolio.signal-lab.v1";

const circuits = [
    {
        name: "Power the relay",
        gates: ["AND", "OR", "AND"],
        inputs: 3,
        hint: "The AND gate needs both A and B. The OR gate needs C or D.",
    },
    {
        name: "Split the signal",
        gates: ["XOR", "NAND", "AND"],
        inputs: 2,
        hint: "XOR is on when its inputs differ. NAND is on unless both of its inputs are on.",
    },
    {
        name: "Invert the output",
        gates: ["OR", "AND", "XOR"],
        inputs: 3,
        hint: "The final XOR needs exactly one gate to be on. Keep the AND gate off.",
    },
    {
        name: "Balance both branches",
        gates: ["XOR", "XOR", "NOR"],
        inputs: 2,
        hint: "NOR is on only when both gates are off. Give each XOR two matching inputs.",
    },
];

const logic = {
    AND: (a, b) => a && b,
    OR: (a, b) => a || b,
    XOR: (a, b) => a !== b,
    NAND: (a, b) => !(a && b),
    NOR: (a, b) => !(a || b),
};

function readProgress() {
    try {
        const values = JSON.parse(localStorage.getItem(progressKey));
        if (Array.isArray(values)) {
            return new Set(values.filter((index) => Number.isInteger(index) && index >= 0 && index < circuits.length));
        }
    } catch {
        // Play remains available when local storage is unavailable.
    }
    return new Set();
}

function saveProgress(solved) {
    try {
        localStorage.setItem(progressKey, JSON.stringify([...solved]));
    } catch {
        // The current page still tracks progress in memory.
    }
}

export function initSignalLab() {
    const lab = document.querySelector("[data-signal-lab]");
    if (!lab) return;

    const levelButtons = [...lab.querySelectorAll("[data-level]")];
    const switches = [...lab.querySelectorAll("[data-switch]")];
    const gates = [...lab.querySelectorAll("[data-gate]")].map((gate) => ({
        element: gate,
        operator: gate.querySelector("[data-operator]"),
        bit: gate.querySelector("[data-bit]"),
    }));
    const title = lab.querySelector("[data-level-title]");
    const goal = lab.querySelector("[data-level-goal]");
    const hint = lab.querySelector(".lab-hint");
    const hintText = lab.querySelector("[data-level-hint]");
    const output = lab.querySelector("[data-output]");
    const progress = lab.querySelector("[data-progress]");
    const status = lab.querySelector("[data-lab-status]");
    const next = lab.querySelector("[data-next]");
    const solved = readProgress();
    const signals = [false, false, false, false];
    let level = 0;

    function render() {
        const circuit = circuits[level];
        const [a, b, c, d] = signals;
        const left = logic[circuit.gates[0]](a, b);
        const right = logic[circuit.gates[1]](c, d);
        const result = logic[circuit.gates[2]](left, right);
        const activeInputs = signals.filter(Boolean).length;
        const match = result && activeInputs === circuit.inputs;

        switches.forEach((button, index) => {
            const signal = signals[index];
            button.setAttribute("aria-pressed", String(signal));
            button.querySelector(".lab-bit").textContent = Number(signal);
        });
        [left, right, result].forEach((signal, index) => {
            const gate = gates[index];
            gate.element.classList.toggle("is-live", signal);
            gate.operator.textContent = circuit.gates[index];
            gate.bit.textContent = Number(signal);
        });
        output.textContent = result ? "Signal on" : "Signal off";
        output.classList.toggle("is-live", result);

        if (match && !solved.has(level)) {
            solved.add(level);
            saveProgress(solved);
        }
        labelLevel(levelButtons[level], level);
        const tally = solved.size + " of " + circuits.length + " solved";
        progress.textContent = tally;
        next.hidden = !solved.has(level) || level === circuits.length - 1;
        status.textContent = match
            ? (solved.size === circuits.length ? "All four circuits solved." : "Circuit solved. " + tally + ".")
            : activeInputs + " of " + circuit.inputs + " required inputs active. " + output.textContent + ".";
        lab.classList.toggle("is-solved", match);
    }

    function labelLevel(button, index) {
        button.classList.toggle("is-solved", solved.has(index));
        button.setAttribute("aria-label", button.textContent.trim() + ", Circuit " + (index + 1) + (solved.has(index) ? ", solved" : ""));
    }

    function loadLevel(index) {
        level = index;
        signals.fill(false);
        const circuit = circuits[level];
        title.textContent = circuit.name;
        goal.textContent = "Turn the output on with exactly " + circuit.inputs + " inputs active.";
        hint.open = false;
        hintText.textContent = circuit.hint;
        levelButtons.forEach((button, i) => {
            button.setAttribute("aria-pressed", String(i === level));
            labelLevel(button, i);
        });
        render();
    }

    levelButtons.forEach((button, index) => {
        button.addEventListener("click", () => loadLevel(index));
    });
    switches.forEach((button, index) => {
        button.addEventListener("click", () => {
            signals[index] = !signals[index];
            render();
        });
    });
    lab.querySelector("[data-reset]").addEventListener("click", () => {
        signals.fill(false);
        render();
    });
    next.addEventListener("click", () => {
        loadLevel(level + 1);
        levelButtons[level].focus();
    });

    loadLevel(0);
    lab.hidden = false;
}
