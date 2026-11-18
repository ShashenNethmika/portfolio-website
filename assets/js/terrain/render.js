const palettes = [
    ["#132a2a", "#b2ed98", "#5aa6a5"],
    ["#302026", "#ffc590", "#d57b73"],
    ["#221d34", "#e6b5ff", "#9891ed"]
];

function relief(x, y, preset) {
    const envelope = Math.sin(Math.PI * x) * Math.sin(Math.PI * y);
    if (preset === 1) return envelope * (.38 + .30 * Math.sin(13 * x + 4 * Math.cos(3 * y)));
    if (preset === 2) return envelope * (.12 + .78 * Math.exp(-70 * (Math.hypot(x - .5, y - .5) - .23) ** 2));
    const ridge = y - .48 - .15 * Math.sin(6 * x);
    return envelope * (.22 + .64 * Math.exp(-26 * ridge * ridge) + .11 * Math.sin(20 * x + 9 * y));
}

export function draw(canvas, model, brush, hitMap) {
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height;
    const [sky, near, far] = palettes[model.preset];
    const background = ctx.createLinearGradient(0, 0, 0, h);
    background.addColorStop(0, sky);
    background.addColorStop(1, "#081317");
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = far;
    for (let x = 0; x < 30; x++) {
        for (let y = 0; y < 16; y++) ctx.fillRect(x * w / 30, y * h / 16, 1, 1);
    }
    const colors = ctx.createLinearGradient(0, h * .26, 0, h * .88);
    colors.addColorStop(0, near);
    colors.addColorStop(1, far);
    ctx.lineWidth = Math.max(1, w / 660);
    for (let row = 0; row <= 44; row++) {
        const y = row / 44;
        ctx.beginPath();
        for (let col = 0; col <= 84; col++) {
            const x = col / 84;
            const elevation = relief(x, y, model.preset) + model.edits[row * 85 + col];
            const px = w * (.075 + .71 * x + .14 * y);
            const py = h * (.57 + .34 * y - .05 * x - .31 * elevation * model.relief / 100);
            if (hitMap) {
                const i = 2 * (row * 85 + col);
                hitMap[i] = px / w;
                hitMap[i + 1] = py / h;
            }
            if (!col) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = colors;
        ctx.stroke();
    }
    if (brush) {
        ctx.strokeStyle = near;
        ctx.beginPath();
        ctx.arc(brush.x * w, brush.y * h, w * .027, 0, Math.PI * 2);
        ctx.stroke();
    }
}
