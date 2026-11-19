"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { defaultGlass, generateGlassCSS, generateGlassTSX, generateGlassVariables, glassPresets, glassStyle, savedGlassSchema, sceneStyle, type GlassSettings, type SavedGlass } from "./engine";

const control = "rounded-lg border border-white/15 bg-slate-900 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-300/60 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 disabled:opacity-40";
const storageKey = "shashen-lab-glass-v1";
type CodeMode = "CSS" | "CSS variables" | "React TSX";

export default function GlassStudio() {
  const [settings, setSettings] = useState(defaultGlass);
  const [mode, setMode] = useState<CodeMode>("CSS");
  const [custom, setCustom] = useState<SavedGlass["presets"]>([]);
  const [presetName, setPresetName] = useState("");
  const [status, setStatus] = useState("");
  const card = useRef<HTMLElement>(null);
  const code = mode === "CSS" ? generateGlassCSS(settings) : mode === "CSS variables" ? generateGlassVariables(settings) : generateGlassTSX(settings);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return;
      const parsed = savedGlassSchema.safeParse(JSON.parse(stored));
      if (parsed.success) setCustom(parsed.data.presets);
      else setStatus("Saved presets could not be read. You can create a new preset.");
    } catch { setStatus("Local presets are unavailable in this browser session."); }
  }, []);
  function change(key: keyof GlassSettings, value: number | boolean) { setSettings(current => ({ ...current, [key]: value })); }
  function persist(next: SavedGlass["presets"]) {
    try { localStorage.setItem(storageKey, JSON.stringify({ version: 1, presets: next })); setCustom(next); return true; }
    catch { setStatus("Browser storage is full or disabled. Export the code to keep your design."); return false; }
  }
  function save() {
    const name = presetName.trim();
    if (!name || name.length > 40) { setStatus("Enter a preset name between 1 and 40 characters."); return; }
    const next = [...custom.filter(preset => preset.name !== name), { name, settings }];
    if (next.length > 30) { setStatus("You can keep 30 custom presets. Remove one before saving another."); return; }
    if (persist(next)) { window.dispatchEvent(new CustomEvent("lab:saved", { detail: { station: "glass-studio" } })); setStatus(`Saved “${name}” on this device.`); setPresetName(""); }
  }
  async function copy() {
    try { await navigator.clipboard.writeText(code); setStatus(`${mode} copied to clipboard.`); }
    catch { setStatus("Clipboard access is unavailable. Select the generated code or use Export."); }
  }
  function download() {
    const file = new Blob([code], { type: mode === "React TSX" ? "text/plain;charset=utf-8" : "text/css;charset=utf-8" });
    const url = URL.createObjectURL(file), a = document.createElement("a");
    a.href = url; a.download = mode === "React TSX" ? "GlassCard.tsx" : mode === "CSS variables" ? "glass-variables.css" : "glass.css";
    a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); setStatus(`${mode} exported.`);
  }
  function tilt(event: PointerEvent<HTMLDivElement>) {
    if (!card.current || event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5, y = (event.clientY - rect.top) / rect.height - 0.5;
    card.current.style.transform = `perspective(900px) rotateX(${-y * 16}deg) rotateY(${x * 16}deg)`;
  }

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <p className="max-w-xl text-sm leading-6 text-slate-400">Shape the surface, tune the light, then take the exact result into your project. Hover the card to explore its depth.</p>
      <button className={control} onClick={() => { setSettings(defaultGlass); setStatus("Restored Arctic settings."); }}>Reset design</button>
    </div>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-5">
        <div className="relative flex min-h-[440px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 p-6 sm:min-h-[520px]" style={{ background: sceneStyle(settings).background }} onPointerMove={tilt} onPointerLeave={() => { if (card.current) card.current.style.transform = ""; }}>
          <div aria-hidden="true" className="pointer-events-none absolute left-[9%] top-[14%] h-40 w-40 rounded-full opacity-70" style={{ background: `hsl(${settings.hue}, ${settings.saturation}%, 60%)` }} />
          <div aria-hidden="true" className="pointer-events-none absolute bottom-[10%] right-[5%] h-52 w-52 rounded-full opacity-50" style={{ background: `hsl(${(settings.hue + 80) % 360}, ${settings.saturation}%, 50%)` }} />
          <div aria-hidden="true" className="pointer-events-none absolute -right-8 top-1/3 h-20 w-80 -rotate-45 border-y border-white/20" />
          <article ref={card} data-testid="glass-preview" className="relative z-10 w-full max-w-sm transition-transform duration-150 motion-reduce:transition-none" style={glassStyle(settings)}>
            <span className="mb-12 inline-flex rounded-full border border-white/30 px-3 py-1 font-mono text-xs tracking-widest text-white">DESIGNED IN THE LAB</span>
            <div className="mb-3 flex items-center gap-3"><svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true"><path d="M15 2 28 9v13l-13 7L2 22V9L15 2Z" stroke="currentColor"/><path d="m2 9 13 7L28 9M15 16v13" stroke="currentColor"/></svg><span className="text-xl font-medium">Clarity, with depth.</span></div>
            <p className="text-sm leading-7 text-white">A small surface with a point of view. Refraction, color, and a little room to breathe.</p>
            <div className="mt-8 flex items-center justify-between border-t border-white/25 pt-5 font-mono text-xs"><span>{settings.blur}px blur</span><span>{settings.opacity}% opacity</span><span>{settings.radius}px radius</span></div>
          </article>
          <span className="absolute bottom-4 left-4 rounded-md bg-black/50 px-2 py-1 font-mono text-xs text-white">LIVE SURFACE PREVIEW</span>
        </div>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#070f1b]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4">
            <div role="group" className="flex flex-wrap gap-1" aria-label="Generated code format">{(["CSS", "CSS variables", "React TSX"] as const).map(name => <button key={name} className={`${control} ${mode === name ? "border-cyan-300/40 text-cyan-200" : ""}`} aria-pressed={mode === name} onClick={() => setMode(name)}>{name}</button>)}</div>
            <div className="flex gap-2"><button className={control} onClick={copy}>Copy code</button><button className={control} onClick={download}>Export</button></div>
          </div>
          <pre role="region" tabIndex={0} aria-label={`Generated ${mode}`} className="max-h-[400px] overflow-auto p-5 font-mono text-xs leading-6 text-cyan-100 sm:text-sm"><code>{code}</code></pre>
        </div>
      </div>
      <aside aria-label="Glass design controls" className="space-y-6 rounded-2xl border border-white/10 bg-slate-900/50 p-5">
        <div><h2 className="mb-3 text-base font-medium text-white">Start with a preset</h2><div className="flex flex-wrap gap-2">{Object.entries(glassPresets).map(([name, value]) => <button key={name} className={control} onClick={() => { setSettings(value); setStatus(`Applied ${name}.`); }}>{name}</button>)}</div></div>
        <fieldset className="space-y-4"><legend className="mb-4 text-sm font-medium text-white">Surface</legend>
          {([
            ["blur", "Backdrop blur", 0, 50, "px"], ["opacity", "Surface opacity", 0, 100, "%"], ["radius", "Border radius", 0, 64, "px"],
            ["border", "Border thickness", 0, 8, "px"], ["glow", "Glow spread", 0, 80, "px"], ["shadow", "Shadow blur", 0, 80, "px"],
            ["hue", "Surface hue", 0, 360, "°"], ["saturation", "Surface saturation", 0, 100, "%"],
          ] as const).map(([key, label, min, max, unit]) => <label key={key} className="block text-sm text-slate-300"><span className="mb-1.5 flex justify-between gap-2"><span>{label}</span><output className="font-mono text-cyan-200">{settings[key]}{unit}</output></span><input className="w-full accent-cyan-300" aria-label={label} type="range" min={min} max={max} value={settings[key]} onChange={e => change(key, +e.target.value)} /></label>)}
        </fieldset>
        <fieldset className="space-y-4 border-t border-white/10 pt-5"><legend className="mb-3 text-sm font-medium text-white">Scene background</legend>
          <label className="flex items-center gap-3 text-sm text-slate-300"><input type="checkbox" className="accent-cyan-300" checked={settings.gradient} onChange={e => change("gradient", e.target.checked)} />Gradient background</label>
          {([["backgroundHue", "Background hue", 360, "°"], ["backgroundSaturation", "Background saturation", 100, "%"], ["backgroundAngle", "Gradient angle", 360, "°"]] as const).map(([key, label, max, unit]) => <label key={key} className="block text-sm text-slate-300"><span className="mb-1.5 flex justify-between gap-2"><span>{label}</span><output className="font-mono text-cyan-200">{settings[key]}{unit}</output></span><input className="w-full accent-cyan-300" aria-label={label} type="range" min="0" max={max} value={settings[key]} onChange={e => change(key, +e.target.value)} /></label>)}
        </fieldset>
        <div className="space-y-3 border-t border-white/10 pt-5"><label className="block text-sm text-slate-300">Custom preset name<input value={presetName} onChange={e => setPresetName(e.target.value)} maxLength={40} placeholder="My glass surface" className={`${control} mt-2 w-full`} /></label><button className={`${control} w-full`} onClick={save}>Save preset on this device</button>
          {custom.length > 0 && <ul className="space-y-2" aria-label="Saved glass presets">{custom.map(preset => <li className="flex gap-2" key={preset.name}><button className={`${control} min-w-0 flex-1 truncate text-left`} onClick={() => { setSettings(preset.settings); setStatus(`Loaded “${preset.name}”.`); }}>{preset.name}</button><button className={control} aria-label={`Delete preset ${preset.name}`} onClick={() => { if (persist(custom.filter(item => item.name !== preset.name))) setStatus(`Deleted “${preset.name}”.`); }}>×</button></li>)}</ul>}
        </div>
      </aside>
    </div>
    <p role="status" className="min-h-6 text-sm text-cyan-200">{status}</p>
    <details className="rounded-xl border border-white/10 p-5 text-sm text-slate-400"><summary className="cursor-pointer font-medium text-slate-200">Using your generated surface</summary><p className="mt-3 leading-7">CSS and CSS variables include both the scene and card styles. Apply <code>.glass-scene</code> to the parent and <code>.glass-card</code> to your content. The TSX export is a typed React component. Colored preview objects demonstrate backdrop blur and are not part of the exported surface. Browser support for backdrop-filter varies; the translucent background remains visible without it. Custom presets stay only in this browser.</p></details>
  </div>;
}
