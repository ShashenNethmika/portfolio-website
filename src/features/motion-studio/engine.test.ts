import { describe, expect, it } from "vitest";
import { applyPreset, exportSvg, exportTsx, initialProject, interpolateFrame, motionSchema, retimeProject } from "./engine";

describe("motion interpolation", () => {
  it("interpolates every transform and clamps outside keyframe bounds", () => {
    const frames = initialProject.shapes[0].keyframes;
    expect(interpolateFrame(frames, 1)).toMatchObject({ x: 300, y: 180, rotation: 90, scale: 0.825, opacity: 1 });
    expect(interpolateFrame(frames, -1).x).toBe(180);
    expect(interpolateFrame(frames, 99).rotation).toBe(360);
  });
  it("sorts arbitrary key order and supports a single held key", () => {
    const frames = initialProject.shapes[0].keyframes;
    expect(interpolateFrame([...frames].reverse(), 1).x).toBe(300);
    expect(interpolateFrame([frames[0]], 2).x).toBe(180);
  });
  it("creates a seamless preset across the full composition duration", () => {
    const orbit = applyPreset(initialProject.shapes[0], "orbit", 8);
    expect(orbit.keyframes[0].x).toBe(orbit.keyframes.at(-1)!.x);
    expect(orbit.keyframes.at(-1)!.time).toBe(8);
    expect(motionSchema.safeParse({ ...initialProject, duration: 8, shapes: [orbit] }).success).toBe(true);
  });
  it("retimes close keys without rounding collisions or losing the last frame", () => {
    const frame = initialProject.shapes[0].keyframes[0];
    const project = { ...initialProject, duration: 20, shapes: [{ ...initialProject.shapes[0], keyframes: [{ ...frame, time: 19.99 }, { ...frame, time: 20, x: 400 }] }] };
    const retimed = retimeProject(project, 2);
    expect(retimed.shapes[0].keyframes).toHaveLength(2);
    expect(retimed.shapes[0].keyframes[0].time).toBeCloseTo(1.999);
    expect(retimed.shapes[0].keyframes[1]).toMatchObject({ time: 2, x: 400 });
    const keyTimes = exportSvg(retimed, true).match(/keyTimes="([^"]+)"/)![1].split(";").map(Number);
    expect(keyTimes[1]).toBeGreaterThan(0);
    expect(keyTimes[1]).toBeLessThan(1);
    expect(keyTimes[2]).toBe(1);
  });
});

describe("SVG and React export", () => {
  it("exports standard standalone SVG with valid normalized animation times", () => {
    const svg = exportSvg(initialProject, true);
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('keyTimes="0;0.5;1"');
    expect(svg).toContain('type="translate"');
    expect(svg).toContain('repeatCount="indefinite"');
    expect(svg).not.toMatch(/NaN|undefined|<script/);
  });
  it("captures the current frame in a static export", () => {
    const svg = exportSvg(initialProject, false, 1);
    expect(svg).toContain('translate(300 180)');
    expect(svg).not.toContain("<animate");
  });
  it("converts SVG attributes to valid React property names", () => {
    const shape = { ...initialProject.shapes[0], type: "line" as const };
    const tsx = exportTsx({ ...initialProject, shapes: [shape] }, true);
    expect(tsx).toContain("export default function MotionComposition()");
    expect(tsx).toContain('strokeWidth="4"');
    expect(tsx).not.toContain("stroke-width=");
  });
  it("validates values before emitting XML and rejects invalid keyframe sequences", () => {
    expect(() => exportSvg({ ...initialProject, background: '\"><script>' }, true)).toThrow();
    const shape = initialProject.shapes[0];
    expect(motionSchema.safeParse({ ...initialProject, shapes: [{ ...shape, keyframes: [shape.keyframes[0], shape.keyframes[0]] }] }).success).toBe(false);
    expect(motionSchema.safeParse({ ...initialProject, shapes: [{ ...shape, keyframes: [{ ...shape.keyframes[0], time: 5 }] }] }).success).toBe(false);
  });
});
