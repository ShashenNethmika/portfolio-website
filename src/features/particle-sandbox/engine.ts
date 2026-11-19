import { z } from "zod";

export interface Particle {
  x: number; y: number; homeX: number; homeY: number; vx: number; vy: number; radius: number;
}

export interface PhysicsSettings {
  gravity: number; speed: number; amplitude: number; frequency: number; force: "attract" | "repel" | "none";
}
export interface PointerForce { x: number; y: number; active: boolean }

export const particleExperimentSchema = z.object({
  version: z.literal(1), density: z.number().int().min(40).max(650),
  theme: z.enum(["Cyan", "Violet", "Amber", "Emerald"]),
  settings: z.object({
    gravity: z.number().min(-10).max(10), speed: z.number().min(0.1).max(3),
    amplitude: z.number().min(0).max(120), frequency: z.number().min(0.1).max(4),
    force: z.enum(["attract", "repel", "none"]),
  }),
});

export function createParticles(count: number, width: number, height: number, random = Math.random): Particle[] {
  return Array.from({ length: count }, () => {
    const x = random() * width, y = random() * height;
    return { x, y, homeX: x, homeY: y, vx: (random() - 0.5) * 14, vy: (random() - 0.5) * 14, radius: 1 + random() * 1.5 };
  });
}

/** A bounded, time-based spring field. Clamp time after a suspended browser tab. */
export function stepParticles(particles: Particle[], dt: number, time: number, width: number, height: number, settings: PhysicsSettings, pointer: PointerForce) {
  const step = Math.min(0.035, Math.max(0, dt)) * settings.speed;
  for (const p of particles) {
    const wave = Math.sin(p.homeX / Math.max(1, width) * Math.PI * 4 * settings.frequency + time * settings.speed) * settings.amplitude;
    p.vx += (p.homeX - p.x) * 0.4 * step;
    p.vy += ((p.homeY + wave - p.y) * 0.65 + settings.gravity * 20) * step;
    if (pointer.active && settings.force !== "none") {
      const dx = pointer.x - p.x, dy = pointer.y - p.y, distance = Math.hypot(dx, dy);
      if (distance > 0.1 && distance < 170) {
        const acceleration = (1 - distance / 170) * 220 * (settings.force === "attract" ? 1 : -1);
        p.vx += dx / distance * acceleration * step;
        p.vy += dy / distance * acceleration * step;
      }
    }
    const damping = Math.exp(-1.15 * step);
    p.vx *= damping; p.vy *= damping;
    p.x += p.vx * step; p.y += p.vy * step;
    if (p.x < 0 || p.x > width) { p.x = Math.max(0, Math.min(width, p.x)); p.vx *= -0.6; }
    if (p.y < 0 || p.y > height) { p.y = Math.max(0, Math.min(height, p.y)); p.vy *= -0.6; }
  }
}

export function shockwave(particles: Particle[], x: number, y: number, radius = 240) {
  for (const p of particles) {
    const dx = p.x - x, dy = p.y - y, distance = Math.hypot(dx, dy);
    if (distance > 0.1 && distance < radius) {
      const impulse = (1 - distance / radius) * 360;
      p.vx += dx / distance * impulse; p.vy += dy / distance * impulse;
    }
  }
}

/** Spatial hash: inspect only the nine neighboring cells; emit every pair once. */
export function nearbyPairs(particles: Particle[], radius = 65): [number, number, number][] {
  const grid = new Map<string, number[]>();
  particles.forEach((p, i) => {
    const key = `${Math.floor(p.x / radius)},${Math.floor(p.y / radius)}`;
    const cell = grid.get(key);
    if (cell) cell.push(i); else grid.set(key, [i]);
  });
  const pairs: [number, number, number][] = [];
  particles.forEach((p, i) => {
    const cx = Math.floor(p.x / radius), cy = Math.floor(p.y / radius);
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
      for (const j of grid.get(`${cx + dx},${cy + dy}`) ?? []) {
        if (j <= i) continue;
        const q = particles[j], distance = Math.hypot(p.x - q.x, p.y - q.y);
        if (distance < radius) pairs.push([i, j, distance]);
      }
    }
  });
  return pairs;
}
