"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { applyPreset, exportSvg, exportTsx, initialProject, interpolateFrame, motionSchema, retimeProject, type Keyframe, type MotionProject, type Shape } from "./engine";

const button = "rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-300/50 hover:bg-cyan-300/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 disabled:cursor-not-allowed disabled:opacity-40";
const input = "w-full rounded-lg border border-white/15 bg-[#080f1c] px-3 py-2 text-base text-slate-100 focus:border-cyan-300 focus:outline-none";
const panel = "rounded-2xl border border-white/10 bg-[#0d1625]/90 p-5";
const storageKey = "portfolio.motion.v1";
const round = (value: number) => Math.round(value * 100) / 100;

function ShapeGeometry({ shape }: { shape: Shape }) {
  const size = shape.size;
  if (shape.type === "circle") return <circle r={size / 2} />;
  if (shape.type === "rectangle") return <rect x={-size / 2} y={-size / 2} width={size} height={size} rx={size * 0.15} />;
  if (shape.type === "triangle") return <polygon points={`0,${-size / 2} ${size / 2},${size / 2} ${-size / 2},${size / 2}`} />;
  if (shape.type === "ellipse") return <ellipse rx={size / 2} ry={size / 3} />;
  return <line x1={-size / 2} y1={0} x2={size / 2} y2={0} stroke={shape.color} strokeWidth={4} strokeLinecap="round" />;
}

export default function MotionStudio() {
  const [project, setProject] = useState<MotionProject>(() => structuredClone(initialProject));
  const [selected, setSelected] = useState("circle-1");
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [visible, setVisible] = useState(true);
  const [inView, setInView] = useState(true);
  const [message, setMessage] = useState("");
  const [format, setFormat] = useState<"svg" | "tsx">("svg");
  const [animated, setAnimated] = useState(true);
  const [loop, setLoop] = useState(true);
  const wrapper = useRef<HTMLDivElement>(null);
  const stage = useRef<SVGSVGElement>(null);
  const timeRef = useRef(0);
  const drag = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const selectedShape = project.shapes.find((shape) => shape.id === selected);
  const currentFrame = selectedShape ? interpolateFrame(selectedShape.keyframes, time) : null;
  const exportTime = animated ? 0 : time;
  const code = useMemo(() => format === "svg" ? exportSvg(project, animated, exportTime) : exportTsx(project, animated, exportTime), [project, animated, format, exportTime]);

  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility); onVisibility();
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    if (stage.current) observer.observe(stage.current);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", onVisibility); };
  }, []);

  useEffect(() => {
    if (!playing || !visible || !inView) return;
    let frameId = 0;
    let lastUpdate = 0;
    const started = performance.now();
    const initialTime = timeRef.current;
    function tick(now: number) {
      const elapsed = initialTime + (now - started) / 1000 * speed;
      const next = loop ? elapsed % project.duration : Math.min(elapsed, project.duration);
      if (now - lastUpdate >= 1000 / 30) { timeRef.current = next; setTime(next); lastUpdate = now; }
      if (!loop && elapsed >= project.duration) { timeRef.current = project.duration; setTime(project.duration); setPlaying(false); return; }
      frameId = requestAnimationFrame(tick);
    }
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [playing, visible, inView, speed, project.duration, loop]);

  function seek(next: number) { setPlaying(false); timeRef.current = next; setTime(next); }
  function updateShape(update: (shape: Shape) => Shape) { setProject((p) => ({ ...p, shapes: p.shapes.map((shape) => shape.id === selected ? update(shape) : shape) })); }
  function editFrame(values: Partial<Keyframe>, id = selected) {
    setPlaying(false);
    const at = round(time);
    setProject((p) => ({ ...p, shapes: p.shapes.map((shape) => {
      if (shape.id !== id) return shape;
      const existing = shape.keyframes.some((f) => f.time === at);
      if (!existing && shape.keyframes.length >= 40) return shape;
      const frame = { ...interpolateFrame(shape.keyframes, at), ...values, time: at };
      return { ...shape, keyframes: [...shape.keyframes.filter((f) => f.time !== at), frame].sort((a, b) => a.time - b.time) };
    }) }));
    timeRef.current = at; setTime(at);
  }
  function addShape(type: Shape["type"]) {
    if (project.shapes.length >= 20) { setMessage("This workspace supports up to 20 shapes."); return; }
    const id = crypto.randomUUID();
    const colors = ["#67e8f9", "#a78bfa", "#fbbf24", "#34d399", "#fb7185"];
    setProject({ ...project, shapes: [...project.shapes, { id, type, color: colors[project.shapes.length % colors.length], size: 64, keyframes: [{ time: 0, x: 300, y: 180, rotation: 0, scale: 1, opacity: 1 }] }] });
    setSelected(id); seek(0);
  }
  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(motionSchema.parse(project))); setMessage("Composition saved on this device."); window.dispatchEvent(new CustomEvent("lab:saved", { detail: { station: "motion-studio" } })); }
    catch { setMessage("Could not save. Browser storage may be unavailable."); }
  }
  function load() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) throw new Error("No saved composition on this device.");
      const parsed = motionSchema.safeParse(JSON.parse(raw));
      if (!parsed.success) throw new Error("The saved composition is invalid. Reset to start again.");
      setProject(parsed.data); setSelected(parsed.data.shapes[0]?.id ?? ""); seek(0); setMessage("Composition loaded.");
    } catch (error) { setMessage((error as Error).message); }
  }
  function download() {
    const blob = new Blob([code], { type: format === "svg" ? "image/svg+xml;charset=utf-8" : "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a");
    link.href = url; link.download = `shashen-motion.${format}`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage(`${animated ? "Animated" : "Static"} ${format.toUpperCase()} exported.`);
  }
  async function copyCode() {
    try {
      if (!navigator.clipboard) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(code);
      setMessage("Code copied to clipboard.");
    } catch { setMessage("Clipboard access is unavailable. Select the code or use Export file."); }
  }
  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen();
      else if (wrapper.current?.requestFullscreen) await wrapper.current.requestFullscreen();
      else setMessage("Fullscreen is unavailable in this browser.");
    } catch { setMessage("Fullscreen is unavailable in this browser."); }
  }
  function changeDuration(next: number) {
    const ratio = next / project.duration;
    setProject(retimeProject(project, next));
    seek(Math.min(time * ratio, next));
  }
  function checkChallenge() {
    const completed = project.shapes.length >= 3 && project.shapes.filter((shape) => shape.keyframes.length >= 2).length >= 2;
    setMessage(completed ? "Challenge complete: your composition contains at least three shapes and two animated layers. Export it to keep a portable copy." : "Add at least three shapes, then create two or more keyframes on at least two shapes. Try a preset or move to a new time and adjust a transform.");
    if (completed) window.dispatchEvent(new CustomEvent("lab:challenge", { detail: { station: "motion-studio", id: "keyframes" } }));
  }

  return <div className="space-y-6" ref={wrapper}>
    <div className="flex flex-wrap items-center justify-between gap-3"><p className="max-w-2xl text-sm leading-relaxed text-slate-400">Create a vector composition. Choose a time, adjust a shape, and a keyframe captures the change. Export the same motion as standalone SVG or React TSX.</p><div className="flex flex-wrap gap-2"><button className={button} onClick={save}>Save composition</button><button className={button} onClick={load}>Load saved</button><button className={button} onClick={() => { setProject(structuredClone(initialProject)); setSelected("circle-1"); seek(0); setMessage("Workspace reset."); }}>Reset</button></div></div>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div className="min-w-0 space-y-5"><section className={panel} aria-label="SVG composition canvas"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold text-white">Composition</h2><div className="flex items-center gap-3"><span className="text-sm text-slate-400">600 × 360</span><button className={button} onClick={() => { void toggleFullscreen(); }}>Fullscreen</button></div></div><div className="mb-4 flex flex-wrap gap-2">{(["circle", "rectangle", "triangle", "ellipse", "line"] as const).map((type) => <button className={button} key={type} onClick={() => addShape(type)}>+ {type}</button>)}</div>
        <svg ref={stage} viewBox="0 0 600 360" className="w-full touch-none rounded-xl border border-white/10" style={{ background: project.background }} role="group" aria-label="SVG shape editing canvas">
          <defs><pattern id="motion-grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="#ffffff" strokeOpacity="0.045" /></pattern></defs><rect width="600" height="360" fill="url(#motion-grid)" />
          <path d="M300 0V360M0 180H600" stroke="#ffffff" strokeOpacity="0.08" strokeDasharray="4 6" />
          {project.shapes.map((shape) => { const f = interpolateFrame(shape.keyframes, time); return <g key={shape.id} transform={`translate(${f.x} ${f.y})`} role="button" tabIndex={0} aria-label={`${shape.type}, ${selected === shape.id ? "selected" : "select shape"}. Arrow keys move; Enter selects.`} aria-pressed={selected === shape.id} className="cursor-grab outline-none focus:[&>circle]:stroke-white" onFocus={() => setSelected(shape.id)} onKeyDown={(e) => { const deltas: Record<string, [number, number]> = { ArrowLeft: [-5, 0], ArrowRight: [5, 0], ArrowUp: [0, -5], ArrowDown: [0, 5] }; if (deltas[e.key]) { e.preventDefault(); setSelected(shape.id); editFrame({ x: Math.max(-600, Math.min(1200, f.x + deltas[e.key][0])), y: Math.max(-360, Math.min(720, f.y + deltas[e.key][1])) }, shape.id); } if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(shape.id); } }} onPointerDown={(e) => { setSelected(shape.id); setPlaying(false); const rect = e.currentTarget.ownerSVGElement!.getBoundingClientRect(); drag.current = { id: shape.id, offsetX: (e.clientX - rect.left) / rect.width * 600 - f.x, offsetY: (e.clientY - rect.top) / rect.height * 360 - f.y }; e.currentTarget.setPointerCapture(e.pointerId); }} onPointerMove={(e) => { const current = drag.current; if (!current || current.id !== shape.id) return; const rect = e.currentTarget.ownerSVGElement!.getBoundingClientRect(); editFrame({ x: round(Math.max(-600, Math.min(1200, (e.clientX - rect.left) / rect.width * 600 - current.offsetX))), y: round(Math.max(-360, Math.min(720, (e.clientY - rect.top) / rect.height * 360 - current.offsetY))) }, shape.id); }} onPointerUp={(e) => { drag.current = null; if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId); }} onPointerCancel={() => { drag.current = null; }}>
            {selected === shape.id && <circle r={shape.size * f.scale * 0.8 + 10} fill="transparent" stroke="#ffffff" strokeOpacity="0.35" strokeDasharray="3 5" strokeWidth="1" />}
            <g transform={`rotate(${f.rotation}) scale(${f.scale})`} fill={shape.color} opacity={f.opacity}><ShapeGeometry shape={shape} /></g>
          </g>; })}
          {!project.shapes.length && <text x="300" y="180" textAnchor="middle" fill="#94a3b8" fontSize="16">Add a shape to start creating.</text>}
        </svg><p className="mt-3 text-sm text-slate-400">Drag a shape or use its transform controls. Focus a shape and use arrow keys to move it.</p>
      </section>
      <section className={panel} aria-label="Animation timeline"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div className="flex gap-2"><button className={`${button} !bg-cyan-300 !text-slate-950`} onClick={() => { if (time >= project.duration) { timeRef.current = 0; setTime(0); } setPlaying(!playing); }}>{playing ? "Pause" : "Play"}</button><button className={button} onClick={() => seek(0)}>Rewind</button><label className="flex items-center gap-2 px-2 text-sm text-slate-300"><input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} className="accent-cyan-300" />Loop</label></div><output className="font-mono text-sm text-cyan-200">{time.toFixed(2)}s / {project.duration.toFixed(2)}s</output></div><label className="block text-sm text-slate-300">Playhead<input aria-label="Animation playhead" type="range" min="0" max={project.duration} step="0.01" value={time} onChange={(e) => seek(Number(e.target.value))} className="mt-3 w-full accent-cyan-300" /></label><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="space-y-2 text-sm text-slate-300">Duration<select className={input} value={project.duration} onChange={(e) => changeDuration(Number(e.target.value))}>{[2, 4, 6, 8, 10, 20].map((value) => <option value={value} key={value}>{value} seconds</option>)}</select></label><label className="space-y-2 text-sm text-slate-300">Playback speed<select className={input} value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>{[0.25, 0.5, 1, 1.5, 2].map((value) => <option value={value} key={value}>{value}×</option>)}</select></label></div>
        {selectedShape && <div className="mt-5 border-t border-white/10 pt-4"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-medium text-slate-200">{selectedShape.type} keyframes</h3><button className={button} disabled={selectedShape.keyframes.length >= 40} onClick={() => { editFrame({}); setMessage(`Keyframe captured at ${round(time)} seconds.`); }}>Add keyframe here</button></div><div className="flex flex-wrap gap-2">{[...selectedShape.keyframes].sort((a, b) => a.time - b.time).map((frame) => <div className="flex overflow-hidden rounded-lg border border-white/15" key={frame.time}><button className={`px-3 py-2 text-sm ${Math.abs(time - frame.time) < 0.015 ? "bg-cyan-300/15 text-cyan-200" : "text-slate-300 hover:bg-white/5"}`} onClick={() => seek(frame.time)}>{frame.time.toFixed(2)}s</button><button className="border-l border-white/10 px-2 text-sm text-slate-400 hover:text-red-300 disabled:opacity-30" aria-label={`Delete keyframe at ${frame.time} seconds`} disabled={selectedShape.keyframes.length === 1} onClick={() => updateShape((shape) => ({ ...shape, keyframes: shape.keyframes.filter((f) => f.time !== frame.time) }))}>×</button></div>)}</div><p className="mt-3 text-sm text-slate-400">Transforms interpolate linearly between keys. Edits capture a key at the current playhead. Each shape supports up to 40 keys.</p></div>}
      </section></div>
      <aside className={`${panel} space-y-5`} aria-label="Shape inspector"><h2 className="text-lg font-semibold text-white">Shape inspector</h2><label className="block space-y-2 text-sm text-slate-300">Layers<select className={input} value={selected} onChange={(e) => setSelected(e.target.value)}><option value="">Choose a shape</option>{project.shapes.map((shape, index) => <option value={shape.id} key={shape.id}>{index + 1}. {shape.type}</option>)}</select></label>{selectedShape && currentFrame ? <><div className="grid grid-cols-2 gap-3"><label className="space-y-2 text-sm text-slate-300">Fill color<input type="color" value={selectedShape.color} onChange={(e) => updateShape((shape) => ({ ...shape, color: e.target.value }))} className="h-10 w-full cursor-pointer rounded-lg border border-white/15 bg-transparent p-1" /></label><label className="space-y-2 text-sm text-slate-300">Size<input className={input} type="number" min="10" max="180" value={selectedShape.size} onChange={(e) => { const value = Number(e.target.value); if (value >= 10 && value <= 180) updateShape((shape) => ({ ...shape, size: value })); }} /></label></div><div className="space-y-4">{([{ key: "x", label: "Position X", min: 0, max: 600, step: 1 }, { key: "y", label: "Position Y", min: 0, max: 360, step: 1 }, { key: "rotation", label: "Rotation", min: -360, max: 720, step: 1 }, { key: "scale", label: "Scale", min: 0.05, max: 4, step: 0.05 }, { key: "opacity", label: "Opacity", min: 0, max: 1, step: 0.01 }] as const).map(({ key, label, min, max, step: increment }) => <label className="block text-sm text-slate-300" key={key}><span className="flex justify-between gap-2">{label}<output className="font-mono text-cyan-200">{round(currentFrame[key])}{key === "rotation" ? "°" : ""}</output></span><input className="mt-2 w-full accent-cyan-300" type="range" min={min} max={max} step={increment} value={currentFrame[key]} onChange={(e) => editFrame({ [key]: Number(e.target.value) })} /></label>)}</div><div className="border-t border-white/10 pt-4"><h3 className="mb-3 text-sm font-medium text-slate-200">Motion presets</h3><div className="grid grid-cols-2 gap-2">{(["orbit", "bounce", "spin", "pulse"] as const).map((preset) => <button className={button} key={preset} onClick={() => { updateShape((shape) => applyPreset(shape, preset, project.duration)); seek(0); setMessage(`${preset[0].toUpperCase()}${preset.slice(1)} preset applied to the selected layer.`); }}>{preset}</button>)}</div><p className="mt-2 text-sm text-slate-400">A preset replaces this shape’s keyframes.</p></div><button className={`${button} w-full !text-red-300`} onClick={() => { const remaining = project.shapes.filter((shape) => shape.id !== selected); setProject({ ...project, shapes: remaining }); setSelected(remaining[0]?.id ?? ""); }}>Remove shape</button></> : <p className="text-sm text-slate-400">Add or select a shape to edit its appearance and motion.</p>}<label className="block space-y-2 border-t border-white/10 pt-4 text-sm text-slate-300">Canvas background<input type="color" className="h-10 w-full cursor-pointer rounded-lg border border-white/15 bg-transparent p-1" value={project.background} onChange={(e) => setProject({ ...project, background: e.target.value })} /></label></aside>
    </div>
    <p className="min-h-6 text-sm text-cyan-200" role="status" aria-live="polite">{message}</p>
    <section className={panel} aria-label="Generated animation code"><div className="mb-4 flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-xl font-semibold text-white">Take your motion with you</h2><p className="mt-2 text-sm text-slate-400">Standalone SVG uses native SMIL animation. Static export captures the current playhead. The preview grid and selection guides are excluded.</p></div><div className="flex flex-wrap items-center gap-3"><label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" className="accent-cyan-300" checked={animated} onChange={(e) => setAnimated(e.target.checked)} />Animated</label><label className="text-sm text-slate-300"><span className="sr-only">Export format</span><select className={input} value={format} onChange={(e) => setFormat(e.target.value as "svg" | "tsx")}><option value="svg">SVG</option><option value="tsx">React TSX</option></select></label><button className={button} onClick={() => { void copyCode(); }}>Copy code</button><button className={`${button} !bg-cyan-300 !text-slate-950`} onClick={download}>Export file</button></div></div><pre className="max-h-80 overflow-auto rounded-xl bg-[#070e1b] p-4 text-sm leading-relaxed text-slate-300" tabIndex={0} aria-label="Generated code"><code>{code}</code></pre><p className="mt-3 text-sm text-slate-400">Playback speed is a preview control; exported animation retains the composition duration. Animated exports repeat indefinitely. If you embed an animated SVG, provide a static version for visitors who prefer reduced motion.</p></section>
    <div className="grid gap-5 lg:grid-cols-2"><section className={panel}><span className="text-sm uppercase tracking-widest text-amber-300">Creative challenge</span><h2 className="mb-3 mt-2 text-xl font-semibold text-white">Build a moving composition</h2><p className="text-sm leading-relaxed text-slate-400">Create at least three shapes. Animate two of them using two or more keyframes each. Try contrasting rotation with a pulse, then export your creation.</p><button className={`${button} mt-4`} onClick={checkChallenge}>Check composition</button></section><details className={panel}><summary className="cursor-pointer font-medium text-white">How keyframes work</summary><p className="mt-3 text-sm leading-relaxed text-slate-400">Start at zero seconds and set a shape’s position. Move the playhead forward, then drag the shape or change a transform. A new keyframe records those values. Between keys, position, rotation, scale, and opacity change at a constant rate. The first and last values hold outside the keyframe range. Presets create editable keys; duration changes retime every key proportionally. Playback pauses when the canvas is offscreen or the browser tab is hidden.</p></details></div>
  </div>;
}
