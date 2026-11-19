import { z } from "zod";

export const keyframeSchema = z.object({
  time: z.number().min(0).max(20), x: z.number().min(-600).max(1200), y: z.number().min(-360).max(720),
  rotation: z.number().min(-3600).max(3600), scale: z.number().min(0.05).max(4), opacity: z.number().min(0).max(1),
});
export const shapeSchema = z.object({
  id: z.string().min(1).max(80), type: z.enum(["circle", "rectangle", "triangle", "line", "ellipse"]),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/), size: z.number().min(10).max(180),
  keyframes: z.array(keyframeSchema).min(1).max(40),
});
export const motionSchema = z.object({
  duration: z.number().min(1).max(20), background: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  shapes: z.array(shapeSchema).max(20),
}).superRefine((project, ctx) => {
  if (new Set(project.shapes.map((shape) => shape.id)).size !== project.shapes.length) ctx.addIssue({ code: "custom", message: "Shape IDs must be unique." });
  project.shapes.forEach((shape) => {
    const times = shape.keyframes.map((frame) => frame.time);
    if (new Set(times).size !== times.length || times.some((time) => time > project.duration)) ctx.addIssue({ code: "custom", message: "Keyframes must have unique times within the project duration." });
  });
});
export type Keyframe = z.infer<typeof keyframeSchema>;
export type Shape = z.infer<typeof shapeSchema>;
export type MotionProject = z.infer<typeof motionSchema>;
export const initialProject: MotionProject = {
  duration: 4, background: "#071321",
  shapes: [
    { id: "circle-1", type: "circle", color: "#67e8f9", size: 48, keyframes: [{ time: 0, x: 180, y: 180, rotation: 0, scale: 1, opacity: 1 }, { time: 2, x: 420, y: 180, rotation: 180, scale: 0.65, opacity: 1 }, { time: 4, x: 180, y: 180, rotation: 360, scale: 1, opacity: 1 }] },
    { id: "rectangle-1", type: "rectangle", color: "#a78bfa", size: 42, keyframes: [{ time: 0, x: 420, y: 180, rotation: 45, scale: 1, opacity: 0.75 }, { time: 2, x: 180, y: 180, rotation: 225, scale: 1.3, opacity: 1 }, { time: 4, x: 420, y: 180, rotation: 405, scale: 1, opacity: 0.75 }] },
  ],
};

/** Retiming preserves relative key positions without rounding close keys onto one another. */
export function retimeProject(project: MotionProject, duration: number): MotionProject {
  return motionSchema.parse({ ...project, duration, shapes: project.shapes.map((shape) => ({ ...shape, keyframes: shape.keyframes.map((frame) => ({ ...frame, time: frame.time / project.duration * duration })) })) });
}

/** Deterministic piecewise-linear interpolation, clamped outside the keyframe range. */
export function interpolateFrame(frames: Keyframe[], time: number): Keyframe {
  if (!frames.length) throw new Error("A shape needs at least one keyframe.");
  const ordered = [...frames].sort((a, b) => a.time - b.time);
  if (time <= ordered[0].time) return { ...ordered[0], time };
  if (time >= ordered[ordered.length - 1].time) return { ...ordered[ordered.length - 1], time };
  const upper = ordered.findIndex((frame) => frame.time >= time);
  const a = ordered[upper - 1];
  const b = ordered[upper];
  const fraction = (time - a.time) / (b.time - a.time);
  return { time, x: a.x + (b.x - a.x) * fraction, y: a.y + (b.y - a.y) * fraction, rotation: a.rotation + (b.rotation - a.rotation) * fraction, scale: a.scale + (b.scale - a.scale) * fraction, opacity: a.opacity + (b.opacity - a.opacity) * fraction };
}

const number = (value: number) => Number(value.toFixed(4));
function geometry(shape: Shape): string {
  const n = shape.size;
  switch (shape.type) {
    case "circle": return `<circle r="${n / 2}" />`;
    case "rectangle": return `<rect x="${-n / 2}" y="${-n / 2}" width="${n}" height="${n}" rx="${n * 0.15}" />`;
    case "triangle": return `<polygon points="0,${-n / 2} ${n / 2},${n / 2} ${-n / 2},${n / 2}" />`;
    case "line": return `<line x1="${-n / 2}" y1="0" x2="${n / 2}" y2="0" stroke="${shape.color}" stroke-width="4" stroke-linecap="round" />`;
    case "ellipse": return `<ellipse rx="${n / 2}" ry="${n / 3}" />`;
  }
}

function fullFrames(shape: Shape, duration: number): Keyframe[] {
  const frames = [...shape.keyframes].sort((a, b) => a.time - b.time);
  if (frames[0].time !== 0) frames.unshift({ ...frames[0], time: 0 });
  if (frames[frames.length - 1].time !== duration) frames.push({ ...frames[frames.length - 1], time: duration });
  return frames;
}

/** All emitted values come from a validated model; arbitrary SVG/XML cannot enter exports. */
export function exportSvg(projectInput: MotionProject, animated: boolean, atTime = 0): string {
  const project = motionSchema.parse(projectInput);
  const shapes = project.shapes.map((shape) => {
    const frame = interpolateFrame(shape.keyframes, atTime);
    const frames = fullFrames(shape, project.duration);
    const keyTimes = frames.map((f) => f.time / project.duration).join(";");
    const animation = (type: "translate" | "rotate" | "scale", values: string) => animated ? `<animateTransform attributeName="transform" type="${type}" values="${values}" keyTimes="${keyTimes}" dur="${project.duration}s" repeatCount="indefinite" calcMode="linear" />` : "";
    return `  <g transform="translate(${number(frame.x)} ${number(frame.y)})" fill="${shape.color}">\n    ${animation("translate", frames.map((f) => `${number(f.x)} ${number(f.y)}`).join(";"))}\n    <g transform="rotate(${number(frame.rotation)})">\n      ${animation("rotate", frames.map((f) => String(number(f.rotation))).join(";"))}\n      <g transform="scale(${number(frame.scale)})" opacity="${number(frame.opacity)}">\n        ${animation("scale", frames.map((f) => String(number(f.scale))).join(";"))}\n        ${animated ? `<animate attributeName="opacity" values="${frames.map((f) => number(f.opacity)).join(";")}" keyTimes="${keyTimes}" dur="${project.duration}s" repeatCount="indefinite" calcMode="linear" />` : ""}\n        ${geometry(shape)}\n      </g>\n    </g>\n  </g>`;
  }).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360" viewBox="0 0 600 360" role="img" aria-label="Motion Studio composition">\n  <title>Motion Studio composition</title>\n  <rect width="600" height="360" fill="${project.background}" />\n${shapes}\n</svg>`;
}

export function exportTsx(project: MotionProject, animated: boolean, atTime = 0): string {
  const svg = exportSvg(project, animated, atTime).replace(/stroke-width=/g, "strokeWidth=").replace(/stroke-linecap=/g, "strokeLinecap=");
  return `export default function MotionComposition() {\n  return (\n    ${svg.split("\n").join("\n    ")}\n  );\n}\n`;
}

export function applyPreset(shape: Shape, preset: "orbit" | "bounce" | "spin" | "pulse", duration: number): Shape {
  const base = interpolateFrame(shape.keyframes, 0);
  const frame = (fraction: number, overrides: Partial<Keyframe>): Keyframe => ({ ...base, time: number(duration * fraction), ...overrides });
  const keyframes = preset === "orbit" ? [frame(0, { x: 220, y: 180 }), frame(0.25, { x: 300, y: 100 }), frame(0.5, { x: 380, y: 180 }), frame(0.75, { x: 300, y: 260 }), frame(1, { x: 220, y: 180 })]
    : preset === "bounce" ? [frame(0, { y: 100 }), frame(0.5, { y: 270, scale: 0.8 }), frame(1, { y: 100 })]
      : preset === "spin" ? [frame(0, { rotation: 0 }), frame(1, { rotation: 360 })]
        : [frame(0, { scale: 0.6, opacity: 0.5 }), frame(0.5, { scale: 1.6, opacity: 1 }), frame(1, { scale: 0.6, opacity: 0.5 })];
  return { ...shape, keyframes };
}
