import { describe, expect, it } from "vitest";
import { createParticles, nearbyPairs, shockwave, stepParticles } from "./engine";

describe("particle field", () => {
  it("spatial hashing matches a brute-force neighbor search, without duplicates", () => {
    let seed = 7;
    const random = () => ((seed = seed * 16807 % 2147483647) - 1) / 2147483646;
    const particles = createParticles(100, 500, 400, random);
    const expected = [];
    for (let a = 0; a < particles.length; a++) for (let b = a + 1; b < particles.length; b++) {
      if (Math.hypot(particles[a].x - particles[b].x, particles[a].y - particles[b].y) < 65) expected.push(`${a}:${b}`);
    }
    const actual = nearbyPairs(particles).map(([a, b]) => `${a}:${b}`);
    expect(actual.sort()).toEqual(expected.sort());
    expect(new Set(actual).size).toBe(actual.length);
  });
  it("keeps particles finite when pointer and shockwave hit an exact particle position", () => {
    const particles = createParticles(3, 100, 100, () => 0.5);
    shockwave(particles, 50, 50);
    for (let i = 0; i < 100; i++) stepParticles(particles, 30, i, 100, 100, { gravity: 10, speed: 3, amplitude: 120, frequency: 4, force: "attract" }, { active: true, x: 50, y: 50 });
    for (const p of particles) { expect(Number.isFinite(p.x + p.y + p.vx + p.vy)).toBe(true); expect(p.x).toBeGreaterThanOrEqual(0); expect(p.y).toBeLessThanOrEqual(100); }
  });
});
