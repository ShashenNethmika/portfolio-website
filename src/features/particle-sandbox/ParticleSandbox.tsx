"use client";

import { useEffect, useRef, useState } from "react";
import { createParticles, nearbyPairs, particleExperimentSchema, shockwave, stepParticles, type Particle, type PhysicsSettings } from "./engine";

const themes = { Cyan: "#67e8f9", Violet: "#c4b5fd", Amber: "#fcd34d", Emerald: "#6ee7b7" };
const initial: PhysicsSettings = { gravity: 0, speed: 1, amplitude: 32, frequency: 1, force: "repel" };
const control = "rounded-lg border border-white/15 bg-slate-900 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-300/60 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 disabled:opacity-40";

export default function ParticleSandbox() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const particles = useRef<Particle[]>([]);
  const [settings, setSettings] = useState(initial);
  const [density, setDensity] = useState(240);
  const [theme, setTheme] = useState<keyof typeof themes>("Cyan");
  const [paused, setPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [reset, setReset] = useState(0);
  const [stats, setStats] = useState({ fps: 0, count: 240, quality: "Auto" });
  const [notice, setNotice] = useState("");
  const options = useRef({ settings, density, theme, paused });
  useEffect(() => { options.current = { settings, density, theme, paused }; }, [settings, density, theme, paused]);
  useEffect(() => {
    const update = () => setIsFullscreen(document.fullscreenElement === wrapRef.current);
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current, wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) { setNotice("Canvas is unavailable in this browser."); return; }
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) setPaused(true);
    let width = 1, height = 1, raf = 0, visible = true, previous = 0, elapsed = 0, frames = 0, sample = 0, quality = 1, disposed = false;
    const pointer = { x: 0, y: 0, active: false };
    function actualCount() { return Math.max(32, Math.round(Math.min(options.current.density, width < 600 ? 220 : 650) * quality)); }
    function resize() {
      if (!canvas || !wrap || !ctx) return;
      width = Math.max(1, wrap.clientWidth); height = Math.max(1, wrap.clientHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, width < 600 ? 1.5 : 2);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles.current = createParticles(actualCount(), width, height);
      setStats(current => ({ ...current, count: particles.current.length }));
      draw();
    }
    function draw() {
      if (!ctx) return;
      ctx.fillStyle = "#07111e"; ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = "#152337"; ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let x = 0; x < width; x += 40) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
      for (let y = 0; y < height; y += 40) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
      ctx.stroke();
      const color = themes[options.current.theme];
      ctx.strokeStyle = color; ctx.lineWidth = 0.7;
      for (const [a, b, distance] of nearbyPairs(particles.current, 65)) {
        const p = particles.current[a], q = particles.current[b];
        ctx.globalAlpha = (1 - distance / 65) * 0.27;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
      }
      ctx.globalAlpha = 0.9; ctx.fillStyle = color;
      for (const p of particles.current) { ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill(); }
      ctx.globalAlpha = 0.45; ctx.strokeStyle = color; ctx.lineWidth = 1.2; ctx.beginPath();
      for (let x = 0; x < width; x += 6) {
        const y = height / 2 + Math.sin(x / width * Math.PI * 4 * options.current.settings.frequency + elapsed * options.current.settings.speed) * options.current.settings.amplitude;
        if (!x) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke(); ctx.globalAlpha = 1;
    }
    function tick(time: number) {
      raf = 0;
      if (disposed || !visible || document.hidden || options.current.paused) return;
      const dt = previous ? Math.min((time - previous) / 1000, 0.035) : 1 / 60;
      previous = time; elapsed += dt;
      const count = actualCount();
      if (count !== particles.current.length) particles.current = createParticles(count, width, height);
      stepParticles(particles.current, dt, elapsed, width, height, options.current.settings, pointer);
      draw(); frames++;
      if (!sample) sample = time;
      if (time - sample > 1000) {
        const fps = Math.round(frames * 1000 / (time - sample));
        if (fps < 38) quality = Math.max(0.35, quality * 0.82);
        else if (fps > 55) quality = Math.min(1, quality + 0.04);
        setStats({ fps, count: particles.current.length, quality: quality < 0.95 ? "Adaptive" : "Full" });
        frames = 0; sample = time;
      }
      raf = requestAnimationFrame(tick);
    }
    function sync() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0; previous = 0; sample = 0; frames = 0;
      if (!disposed && visible && !document.hidden && !options.current.paused) raf = requestAnimationFrame(tick);
      else {
        const count = actualCount();
        if (count !== particles.current.length) particles.current = createParticles(count, width, height);
        setStats(current => current.count === count ? current : { ...current, count });
        draw();
      }
    }
    function move(event: PointerEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left; pointer.y = event.clientY - rect.top; pointer.active = true;
    }
    function down(event: PointerEvent) { move(event); shockwave(particles.current, pointer.x, pointer.y); draw(); }
    function leave() { pointer.active = false; }
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrap);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(wrap);
    canvas.addEventListener("pointermove", move); canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointerleave", leave); canvas.addEventListener("pointerup", leave);
    document.addEventListener("visibilitychange", sync);
    wrap.addEventListener("sandbox-sync", sync);
    const reducedMotion = () => { if (media.matches) setPaused(true); };
    media.addEventListener("change", reducedMotion);
    resize(); sync();
    return () => {
      disposed = true; cancelAnimationFrame(raf); resizeObserver.disconnect(); observer.disconnect();
      canvas.removeEventListener("pointermove", move); canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointerleave", leave); canvas.removeEventListener("pointerup", leave);
      document.removeEventListener("visibilitychange", sync); wrap.removeEventListener("sandbox-sync", sync);
      media.removeEventListener("change", reducedMotion);
    };
  }, [reset]);

  useEffect(() => { wrapRef.current?.dispatchEvent(new Event("sandbox-sync")); }, [paused, settings, density, theme]);
  function setValue(key: "gravity" | "speed" | "amplitude" | "frequency", value: number) { setSettings(current => ({ ...current, [key]: value })); }
  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await wrapRef.current?.requestFullscreen();
    } catch { setNotice("Fullscreen is unavailable. The workspace remains fully usable here."); }
  }
  function save() {
    try {
      localStorage.setItem("shashen-lab-particle-v1", JSON.stringify({ version: 1, density, theme, settings }));
      window.dispatchEvent(new CustomEvent("lab:saved", { detail: { station: "particle-sandbox" } }));
      setNotice("Field setup saved on this device.");
    } catch { setNotice("Browser storage is full or disabled. Your current field is still available here."); }
  }
  function load() {
    try {
      const value = localStorage.getItem("shashen-lab-particle-v1");
      if (!value) { setNotice("Save a field setup first."); return; }
      const parsed = particleExperimentSchema.safeParse(JSON.parse(value));
      if (!parsed.success) { setNotice("The saved setup is invalid. Save a new field setup to replace it."); return; }
      setDensity(parsed.data.density); setSettings(parsed.data.settings); setTheme(parsed.data.theme);
      setNotice("Saved field setup loaded.");
    } catch { setNotice("The saved field setup could not be read."); }
  }

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <p className="max-w-xl text-sm leading-6 text-slate-400">Move through the field to apply force. Tap or click for a shockwave. This is a spring-and-wave particle model, with gravity measured in simulation units.</p>
      <div className="flex flex-wrap gap-2">
        <button className={control} onClick={() => setPaused(value => !value)}>{paused ? "Resume simulation" : "Pause simulation"}</button>
        <button className={control} onClick={() => { shockwave(particles.current, (wrapRef.current?.clientWidth ?? 600) / 2, (wrapRef.current?.clientHeight ?? 500) / 2); }}>Shockwave</button>
        <button className={control} onClick={() => { setSettings(initial); setDensity(240); setTheme("Cyan"); setReset(value => value + 1); }}>Reset</button>
        <button className={control} onClick={fullscreen}>Fullscreen</button>
        <button className={control} onClick={save}>Save setup</button>
        <button className={control} onClick={load}>Load setup</button>
      </div>
    </div>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div ref={wrapRef} className="relative h-[430px] min-h-[360px] overflow-hidden rounded-2xl border border-white/10 bg-[#07111e] sm:h-[560px]">
        <canvas ref={canvasRef} className="h-full w-full touch-none" aria-label="Interactive particle field with a harmonic wave. Use controls to change physics and the Shockwave button to send an impulse." role="img" />
        <div className="pointer-events-none absolute left-4 top-4 flex gap-3 rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 font-mono text-xs text-slate-300">
          <span>{paused ? "PAUSED" : `${stats.fps || "—"} FPS`}</span><span>{stats.count} particles</span><span>{stats.quality}</span>
        </div>
        {isFullscreen && <button className={`${control} absolute right-4 top-4 bg-slate-950`} onClick={fullscreen}>Exit canvas fullscreen</button>}
        <span className="pointer-events-none absolute bottom-4 left-4 font-mono text-xs tracking-widest text-slate-400">KINETIC FIELD / CANVAS 2D</span>
      </div>
      <aside aria-label="Physics controls" className="space-y-5 rounded-2xl border border-white/10 bg-slate-900/50 p-5">
        <h2 className="text-base font-medium text-white">Field parameters</h2>
        {([
          ["gravity", "Gravity", -10, 10, 0.5, ""], ["speed", "Simulation speed", 0.1, 3, 0.1, "×"],
          ["amplitude", "Wave amplitude", 0, 120, 1, "px"], ["frequency", "Wave frequency", 0.1, 4, 0.1, ""],
        ] as const).map(([key, label, min, max, step, unit]) => <label className="block text-sm text-slate-300" key={key}>
          <span className="mb-2 flex justify-between gap-2"><span>{label}</span><output className="font-mono text-cyan-200">{settings[key]}{unit}</output></span>
          <input className="w-full accent-cyan-300" type="range" min={min} max={max} step={step} value={settings[key]} onChange={e => setValue(key, +e.target.value)} />
        </label>)}
        <label className="block text-sm text-slate-300"><span className="mb-2 flex justify-between"><span>Requested particles</span><output className="font-mono text-cyan-200">{density}</output></span><input className="w-full accent-cyan-300" type="range" min="40" max="650" step="10" value={density} onChange={e => setDensity(+e.target.value)} /></label>
        <label className="block text-sm text-slate-300">Pointer force<select className={`${control} mt-2 w-full`} value={settings.force} onChange={e => setSettings(current => ({ ...current, force: e.target.value as PhysicsSettings["force"] }))}><option value="repel">Repulsion</option><option value="attract">Attraction</option><option value="none">None</option></select></label>
        <fieldset><legend className="mb-2 text-sm text-slate-300">Color theme</legend><div className="grid grid-cols-2 gap-2">{(Object.keys(themes) as (keyof typeof themes)[]).map(name => <button aria-pressed={theme === name} key={name} className={`${control} ${theme === name ? "border-cyan-300/50 bg-cyan-300/10" : ""}`} onClick={() => setTheme(name)}>{name}</button>)}</div></fieldset>
        <p className="text-xs leading-5 text-slate-400">Density adapts to frame rate and viewport. Rendering stops while paused, offscreen, or in a background tab. Reduced motion starts paused.</p>
      </aside>
    </div>
    {notice && <p role="status" className="text-sm text-amber-200">{notice}</p>}
    <details className="rounded-xl border border-white/10 p-5 text-sm text-slate-400"><summary className="cursor-pointer font-medium text-slate-200">How this field works</summary><p className="mt-3 leading-7">Each particle springs toward its original position plus a sine-wave displacement. Gravity adds vertical acceleration; pointer force acts within 170 pixels. Shockwaves add outward velocity. Nearby particles connect using a spatial hash, which avoids checking every possible pair. This is a creative physics model, not a fluid-dynamics solver. Fullscreen can be exited with Escape.</p></details>
  </div>;
}
