"use client";

import { useMemo, useRef, useState } from "react";
import { z } from "zod";
import { checkHalfAdder, circuitSchema, evaluateCircuit, gates, halfAdderChallenge, initialCircuit, truthTable, type Circuit, type CircuitNode, type Gate } from "./engine";

const button = "rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-300/50 hover:bg-cyan-300/10 disabled:opacity-40";
const control = "w-full rounded-lg border border-white/15 bg-[#0c1523] px-3 py-2 text-sm text-slate-100";
const savedSchema = z.array(z.object({ id: z.string().max(80), name: z.string().max(50), circuit: circuitSchema })).max(20);
type Saved = z.infer<typeof savedSchema>;
const storageKey = "shashen.logic.v1";
function readSaved(): Saved {
  const parsed = savedSchema.safeParse(JSON.parse(localStorage.getItem(storageKey) ?? "[]"));
  if (!parsed.success) throw new Error("Saved circuit data is invalid. Save a new experiment to replace it.");
  return parsed.data;
}

export default function LogicStudio() {
  const [circuit, setCircuit] = useState<Circuit>(initialCircuit);
  const [selectedId, setSelectedId] = useState("gate");
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState("Select an output port, then a gate input to connect a wire.");
  const [challenge, setChallenge] = useState(false);
  const [saveName, setSaveName] = useState("My circuit");
  const [saved, setSaved] = useState<Saved>([]);
  const [savedId, setSavedId] = useState("");
  const [addKind, setAddKind] = useState<CircuitNode["kind"]>("XOR");
  const dragging = useRef<{ id: string; x: number; y: number; startX: number; startY: number } | null>(null);
  const result = useMemo(() => evaluateCircuit(circuit), [circuit]);
  const rows = useMemo(() => truthTable(circuit), [circuit]);
  const inputs = circuit.nodes.filter((node) => node.kind === "INPUT");
  const outputs = circuit.nodes.filter((node) => node.kind === "OUTPUT");
  const selected = circuit.nodes.find((node) => node.id === selectedId);
  function update(id: string, patch: Partial<CircuitNode>) {
    setCircuit((current) => ({ ...current, nodes: current.nodes.map((node) => node.id === id ? { ...node, ...patch } : node) }));
  }
  function connect(target: CircuitNode, index: number, source: string | null = pending) {
    if (source === target.id) { setMessage("A node cannot connect to itself."); return; }
    const next = [...target.inputs]; next[index] = source;
    update(target.id, { inputs: next }); setPending(null);
    setMessage(source ? "Wire connected. Results and validation updated." : "Input disconnected.");
  }
  function addNode() {
    if (circuit.nodes.length >= 32 || (addKind === "INPUT" && inputs.length >= 8)) { setMessage("Limit reached: 32 components and eight input switches."); return; }
    const id = crypto.randomUUID();
    const node: CircuitNode = { id, kind: addKind, name: `${addKind} ${circuit.nodes.filter((item) => item.kind === addKind).length + 1}`, value: 0, inputs: addKind === "INPUT" ? [] : Array(addKind === "NOT" || addKind === "OUTPUT" ? 1 : 2).fill(null), x: 200 + circuit.nodes.length % 4 * 150, y: 40 + circuit.nodes.length % 5 * 90 };
    setCircuit((current) => ({ ...current, nodes: [...current.nodes, node] })); setSelectedId(id);
  }
  function save() {
    try {
      let previous: Saved;
      try { previous = readSaved(); } catch { previous = []; }
      const next = [{ id: crypto.randomUUID(), name: saveName.trim().slice(0, 50) || "Untitled circuit", circuit }, ...previous].slice(0, 20);
      localStorage.setItem(storageKey, JSON.stringify(next)); window.dispatchEvent(new CustomEvent("lab:saved", { detail: { station: "logic-circuit" } })); setSaved(next); setSavedId(next[0].id); setMessage("Circuit saved on this browser.");
    } catch { setMessage("Storage unavailable or full. Your current circuit remains in this workspace."); }
  }
  function showSaved() {
    try { const list = readSaved(); setSaved(list); setSavedId(list[0]?.id ?? ""); setMessage(list.length ? "Choose a circuit, then load it." : "No saved circuits on this browser yet."); }
    catch { setMessage("Saved data could not be read. Save a new circuit to replace invalid data."); }
  }
  function reset() { setCircuit(initialCircuit()); setSelectedId("gate"); setPending(null); setChallenge(false); setMessage("Starter AND circuit restored."); }
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-2"><select aria-label="Component to add" className={`${control} !w-auto`} value={addKind} onChange={(event) => setAddKind(event.target.value as CircuitNode["kind"])}>{["INPUT", ...gates, "OUTPUT"].map((kind) => <option key={kind}>{kind}</option>)}</select><button className={button} onClick={addNode}>Add component</button></div>
      <div className="flex flex-wrap gap-2"><button className={button} onClick={() => { setCircuit(halfAdderChallenge()); setChallenge(true); setSelectedId("sum-gate"); setPending(null); setMessage("Challenge started: wire two inputs to produce Sum = A XOR B and Carry = A AND B."); }}>Half-adder challenge</button><button className={button} onClick={reset}>Reset circuit</button></div>
    </div>
    <p className="text-sm text-slate-400">Drag a component by its title. Use the title&apos;s arrow keys to move it. Connect right-hand output ports to left-hand inputs, or use the inspector dropdowns.</p>
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
      <div className="overflow-auto rounded-2xl border border-white/10 bg-[#07101b]" aria-label="Circuit canvas">
        <div className="relative h-[550px] min-w-[1000px]" style={{ backgroundImage: "radial-gradient(#233042 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
          <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
            {circuit.nodes.flatMap((target) => target.inputs.map((sourceId, index) => {
              const source = circuit.nodes.find((node) => node.id === sourceId);
              if (!source) return null;
              const x1 = source.x + 150, y1 = source.y + 40, x2 = target.x, y2 = target.y + 22 + index * 16;
              const active = result.signals[source.id] === 1;
              return <path key={`${target.id}-${index}`} d={`M${x1},${y1} C${x1 + 65},${y1} ${x2 - 65},${y2} ${x2},${y2}`} fill="none" stroke={active ? "#67e8f9" : "#40536b"} strokeWidth={active ? 2 : 1.5} strokeDasharray={active ? "6 4" : undefined} className={active ? "motion-safe:animate-pulse" : ""} />;
            }))}
          </svg>
          {circuit.nodes.map((node) => <div key={node.id} className={`absolute w-[150px] rounded-xl border bg-[#101d2d] shadow-lg ${selectedId === node.id ? "border-cyan-300/70" : "border-slate-600/60"}`} style={{ left: node.x, top: node.y }}>
            <button aria-label={`Move ${node.name}`} aria-pressed={selectedId === node.id} className="w-full touch-none cursor-grab truncate rounded-t-xl px-4 pb-1 pt-3 text-left text-sm font-medium text-slate-300 active:cursor-grabbing"
              onFocus={() => setSelectedId(node.id)} onPointerDown={(event) => { setSelectedId(node.id); event.currentTarget.setPointerCapture(event.pointerId); dragging.current = { id: node.id, x: node.x, y: node.y, startX: event.clientX, startY: event.clientY }; }}
              onPointerMove={(event) => { const drag = dragging.current; if (drag?.id === node.id) update(node.id, { x: Math.max(0, Math.min(840, drag.x + event.clientX - drag.startX)), y: Math.max(0, Math.min(470, drag.y + event.clientY - drag.startY)) }); }}
              onPointerUp={() => { dragging.current = null; }} onPointerCancel={() => { dragging.current = null; }}
              onKeyDown={(event) => { const moves: Record<string, [number, number]> = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] }; const delta = moves[event.key]; if (delta) { event.preventDefault(); update(node.id, { x: Math.max(0, Math.min(840, node.x + delta[0])), y: Math.max(0, Math.min(470, node.y + delta[1])) }); } }}>{node.name}</button>
            <div className="flex items-center justify-between px-4 pb-3"><span className="font-mono text-sm text-white">{node.kind}</span>{node.kind === "INPUT" ? <button aria-label={`Toggle ${node.name}`} aria-pressed={node.value === 1} className={`rounded-md px-3 py-1 font-mono text-sm ${node.value ? "bg-cyan-300 text-slate-950" : "bg-white/10 text-slate-400"}`} onClick={() => update(node.id, { value: node.value ? 0 : 1 })}>{node.value}</button> : <span className={`font-mono text-lg ${result.signals[node.id] === 1 ? "text-cyan-300" : "text-slate-400"}`}>{result.signals[node.id] ?? "?"}</span>}</div>
            {node.inputs.map((source, index) => <button key={index} aria-label={`${node.name} input ${index + 1}${source ? ", connected" : ""}`} title={pending ? "Connect selected output here" : "Select an output port first"} style={{ top: 16 + index * 16 }} className={`absolute -left-2 size-4 rounded-full border-2 ${source ? "border-cyan-300 bg-cyan-700" : "border-slate-400 bg-[#07101b]"}`} onClick={() => { setSelectedId(node.id); if (pending) connect(node, index); else setMessage("Choose a component output port first, or connect in the inspector."); }} />)}
            {node.kind !== "OUTPUT" && <button aria-label={`${node.name} output port`} aria-pressed={pending === node.id} title="Start connection" className={`absolute -right-2 top-8 size-4 rounded-full border-2 ${pending === node.id ? "border-white bg-cyan-300 ring-4 ring-cyan-300/20" : "border-cyan-300 bg-[#07101b]"}`} onClick={() => { setPending(node.id); setMessage(`${node.name} selected. Choose a destination input port.`); }} />}
          </div>)}
        </div>
      </div>
      <aside className="space-y-4 rounded-2xl border border-white/10 bg-white/[.025] p-5">
        <h2 className="text-sm font-semibold text-white">Component inspector</h2>
        {selected ? <>
          <label className="block space-y-2 text-sm text-slate-400">Name<input className={control} maxLength={30} value={selected.name} onChange={(event) => update(selected.id, { name: event.target.value || selected.kind })} /></label>
          {gates.includes(selected.kind as Gate) && <label className="block space-y-2 text-sm text-slate-400">Gate<select className={control} value={selected.kind} onChange={(event) => { const kind = event.target.value as Gate; update(selected.id, { kind, inputs: kind === "NOT" ? [selected.inputs[0] ?? null] : Array.from({ length: Math.max(2, selected.inputs.length) }, (_, index) => selected.inputs[index] ?? null) }); }}>{gates.map((gate) => <option key={gate}>{gate}</option>)}</select></label>}
          {selected.kind !== "INPUT" && selected.kind !== "OUTPUT" && selected.kind !== "NOT" && <label className="block space-y-2 text-sm text-slate-400">Input count<select className={control} value={selected.inputs.length} onChange={(event) => update(selected.id, { inputs: Array.from({ length: Number(event.target.value) }, (_, index) => selected.inputs[index] ?? null) })}>{[2, 3, 4].map((count) => <option key={count}>{count}</option>)}</select></label>}
          {selected.inputs.map((source, index) => <label className="block space-y-2 text-sm text-slate-400" key={index}>Input {index + 1} source<select aria-label={`${selected.name} input ${index + 1} source`} className={control} value={source ?? ""} onChange={(event) => connect(selected, index, event.target.value || null)}><option value="">Disconnected</option>{circuit.nodes.filter((node) => node.id !== selected.id && node.kind !== "OUTPUT").map((node) => <option value={node.id} key={node.id}>{node.name}</option>)}</select></label>)}
          <button className={`${button} w-full text-rose-300`} onClick={() => { setCircuit((current) => ({ ...current, nodes: current.nodes.filter((node) => node.id !== selected.id).map((node) => ({ ...node, inputs: node.inputs.map((source) => source === selected.id ? null : source) })) })); setSelectedId(""); setPending(null); }} disabled={circuit.nodes.length <= 1}>Remove component</button>
        </> : <p className="text-sm text-slate-400">Select a component on the canvas.</p>}
        <p className="text-sm leading-5 text-slate-400">A signal can feed several gates. Empty inputs show ?. Feedback loops are flagged; sequential circuits are outside this studio&apos;s scope.</p>
      </aside>
    </div>
    <p role="status" className="rounded-xl border border-cyan-300/15 bg-cyan-300/5 p-4 text-sm text-cyan-100">{message} {pending && <button className="ml-2 underline" onClick={() => { setPending(null); setMessage("Connection cancelled."); }}>Cancel connection</button>}</p>
    {challenge && <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-violet-300/20 bg-violet-300/5 p-5"><p className="max-w-2xl text-sm text-violet-100">Build a half adder. Sum is high when exactly one input is high; Carry is high when both are high. All four input combinations must pass.</p><button className={button} onClick={() => { const passed = checkHalfAdder(circuit); setMessage(passed ? "Challenge passed: Sum and Carry are correct for all four combinations." : "Challenge not yet complete. Check every connection and both outputs."); if (passed) { try { window.dispatchEvent(new CustomEvent("lab:challenge", { detail: { station: "logic-circuit", id: "half-adder" } })); } catch { /* Progress is optional. */ } } }}>Check challenge</button></div>}
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-2xl border border-white/10 p-5"><h2 className="mb-4 text-lg text-white">Live truth table</h2><div className="max-h-72 overflow-auto"><table className="w-full text-center font-mono text-sm"><thead className="sticky top-0 bg-[#0c1523]"><tr>{[...inputs, ...outputs].map((node) => <th className="p-2 font-medium text-slate-400" key={node.id}>{node.name}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index} className={row.inputs.every((value, i) => value === inputs[i].value) ? "bg-cyan-300/10 text-cyan-200" : "border-t border-white/5 text-slate-400"}>{[...row.inputs, ...row.outputs].map((value, i) => <td className="p-2" key={i}>{value ?? "?"}</td>)}</tr>)}</tbody></table></div><p className="mt-3 text-sm text-slate-500">{rows.length} combinations · current inputs highlighted · up to eight inputs</p></section>
      <section className="rounded-2xl border border-white/10 p-5"><h2 className="mb-4 text-lg text-white">Signal walkthrough</h2>{result.errors.length ? <ul className="space-y-2 text-sm text-amber-200">{result.errors.map((error) => <li key={error}>{error}</li>)}</ul> : <p className="mb-3 text-sm text-emerald-300">Circuit valid. All components are connected without feedback.</p>}<ol className="mt-4 space-y-2 font-mono text-sm text-slate-400">{result.steps.map((step, index) => <li key={`${index}-${step}`}>{index + 1}. {step}</li>)}</ol><p className="mt-4 text-sm leading-5 text-slate-500">For multi-input XOR, 1 means an odd number of high inputs. XNOR is its inverse. NOT inverts one signal.</p></section>
    </div>
    <section className="flex flex-wrap items-end gap-3 rounded-2xl border border-white/10 p-5"><label className="space-y-2 text-sm text-slate-400">Experiment name<input className={control} maxLength={50} value={saveName} onChange={(event) => setSaveName(event.target.value)} /></label><button className={button} onClick={save}>Save circuit</button><button className={button} onClick={showSaved}>Browse saved</button>{saved.length > 0 && <><select aria-label="Saved circuit" className={`${control} !w-auto max-w-60`} value={savedId} onChange={(event) => setSavedId(event.target.value)}>{saved.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}</select><button className={button} onClick={() => { const entry = saved.find((item) => item.id === savedId); if (entry) { setCircuit(entry.circuit); setChallenge(false); setSelectedId(entry.circuit.nodes[0]?.id ?? ""); setPending(null); setMessage(`Loaded ${entry.name}.`); } }}>Load circuit</button><button className={button} onClick={() => { try { const next = saved.filter((entry) => entry.id !== savedId); localStorage.setItem(storageKey, JSON.stringify(next)); setSaved(next); setSavedId(next[0]?.id ?? ""); setMessage("Saved circuit deleted."); } catch { setMessage("Unable to update browser storage."); } }}>Delete saved</button></>}</section>
  </div>;
}
