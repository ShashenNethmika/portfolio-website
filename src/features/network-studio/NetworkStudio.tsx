"use client";

import { useEffect, useRef, useState } from "react";
import { initialNetwork, networkSchema, packetJourney, type Device, type Network } from "./engine";
import IPCalculator from "./IPCalculator";
import NetworkEducation from "./NetworkEducation";
import { networkButton as button, networkInput as input, networkPanel as panel } from "./ui";

const symbols: Record<Device["type"], string> = { computer: "PC", switch: "SW", router: "R", server: "SRV" };
const storageKey = "portfolio.network.v1";

export default function NetworkStudio() {
  const [network, setNetwork] = useState<Network>(() => structuredClone(initialNetwork));
  const [selected, setSelected] = useState("router");
  const [connecting, setConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const [source, setSource] = useState("pc");
  const [destination, setDestination] = useState("server");
  const [journey, setJourney] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [message, setMessage] = useState("");
  const [routeDestination, setRouteDestination] = useState("10.0.0.0/24");
  const [nextHop, setNextHop] = useState("server");
  const wrapper = useRef<HTMLDivElement>(null);
  const dragging = useRef<{ id: string; startX: number; startY: number; dx: number; dy: number; moved: boolean } | null>(null);
  const selectedDevice = network.devices.find((d) => d.id === selected);

  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(query.matches);
    const updateVisibility = () => setVisible(!document.hidden);
    updateMotion(); updateVisibility();
    query.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => { query.removeEventListener("change", updateMotion); document.removeEventListener("visibilitychange", updateVisibility); };
  }, []);

  useEffect(() => {
    if (!playing || !visible || !journey.length) return;
    const timer = setTimeout(() => {
      if (step >= journey.length - 1) { setPlaying(false); setMessage("Packet delivered. Inspect each hop below."); }
      else setStep((value) => value + 1);
    }, 900);
    return () => clearTimeout(timer);
  }, [playing, visible, journey, step]);

  function mutate(next: Network) {
    setNetwork(next); setPlaying(false); setJourney([]); setConnectionStart(null);
    setSource((current) => next.devices.some((device) => device.id === current) ? current : next.devices[0]?.id ?? "");
    setDestination((current) => next.devices.some((device) => device.id === current) ? current : next.devices.at(-1)?.id ?? "");
  }
  function addDevice(type: Device["type"]) {
    if (network.devices.length >= 24) { setMessage("This workspace supports up to 24 devices."); return; }
    const count = network.devices.length;
    const id = crypto.randomUUID();
    mutate({ ...network, devices: [...network.devices, { id, type, name: `${type[0].toUpperCase()}${type.slice(1)} ${count + 1}`, ip: `192.168.1.${count + 10}`, x: 90 + (count % 5) * 140, y: 85 + Math.floor(count / 5) * 60 }] });
    setSelected(id);
  }
  function pickDevice(id: string) {
    setSelected(id);
    if (!connecting) return;
    if (!connectionStart) { setConnectionStart(id); setMessage("Choose a second device to create a connection."); return; }
    if (connectionStart === id) { setConnectionStart(null); return; }
    if (network.connections.length >= 80) { setMessage("This workspace supports up to 80 connections. Remove a cable before adding another."); setConnectionStart(null); return; }
    if (!network.connections.some((e) => (e.a === id && e.b === connectionStart) || (e.b === id && e.a === connectionStart))) {
      mutate({ ...network, connections: [...network.connections, { a: connectionStart, b: id }] });
      setMessage("Connection added.");
    } else setMessage("These devices are already connected.");
    setConnectionStart(null);
  }
  function moveDevice(id: string, x: number, y: number) {
    setNetwork((current) => ({ ...current, devices: current.devices.map((d) => d.id === id ? { ...d, x: Math.max(30, Math.min(730, x)), y: Math.max(30, Math.min(370, y)) } : d) }));
  }
  function sendPacket() {
    try {
      const validated = networkSchema.parse(network);
      const path = packetJourney(validated, source, destination);
      setJourney(path); setStep(0); setPlaying(!reducedMotion); setMessage(reducedMotion ? "Journey ready. Use Next hop to inspect the packet path." : "Transmitting an educational packet…");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Check your topology."); }
  }
  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(networkSchema.parse(network))); setMessage("Topology saved on this device."); window.dispatchEvent(new CustomEvent("lab:saved", { detail: { station: "network-studio" } })); }
    catch { setMessage("Unable to save. Check addresses and routes, or browser storage permissions."); }
  }
  function load() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) throw new Error("No saved topology on this device.");
      const result = networkSchema.safeParse(JSON.parse(raw));
      if (!result.success) throw new Error("Saved topology is invalid. Reset to start again.");
      mutate(result.data); setSelected(result.data.devices[0]?.id ?? ""); setSource(result.data.devices[0]?.id ?? ""); setDestination(result.data.devices.at(-1)?.id ?? ""); setMessage("Saved topology loaded.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not load the saved topology."); }
  }
  function deleteDevice() {
    if (!selectedDevice) return;
    mutate({ devices: network.devices.filter((d) => d.id !== selected), connections: network.connections.filter((e) => e.a !== selected && e.b !== selected), routes: network.routes.filter((r) => r.routerId !== selected && r.nextHop !== selected) });
    setSelected("");
  }
  function addRoute() {
    if (selectedDevice?.type !== "router") return;
    const next = { ...network, routes: [...network.routes.filter((r) => !(r.routerId === selected && r.destination === routeDestination)), { routerId: selected, destination: routeDestination, nextHop }] };
    const result = networkSchema.safeParse(next);
    if (!result.success) { setMessage("Use a valid destination CIDR and a next hop directly connected to the selected router."); return; }
    mutate(result.data); setMessage("Static route added. The most specific matching prefix wins.");
  }
  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen();
      else if (wrapper.current?.requestFullscreen) await wrapper.current.requestFullscreen();
      else setMessage("Fullscreen is unavailable in this browser.");
    } catch { setMessage("Fullscreen is unavailable in this browser."); }
  }
  const activeA = journey[step];
  const activeB = journey[step + 1];
  const a = network.devices.find((d) => d.id === activeA);
  const b = network.devices.find((d) => d.id === activeB);

  return <div className="space-y-6" ref={wrapper}>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="max-w-2xl text-sm leading-relaxed text-slate-400">Build a topology, send a packet, and inspect its journey. This is an educational simulation: it sends no real network traffic.</p>
      <div className="flex flex-wrap gap-2"><button className={button} onClick={save}>Save topology</button><button className={button} onClick={load}>Load saved</button><button className={button} onClick={() => { mutate(structuredClone(initialNetwork)); setSelected("router"); setSource("pc"); setDestination("server"); setMessage("Workspace reset."); }}>Reset</button></div>
    </div>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_290px]">
      <section className={`${panel} min-w-0`} aria-label="Topology builder">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold text-white">Topology canvas</h2><button className={button} onClick={() => { void toggleFullscreen(); }}>Fullscreen</button></div>
        <div className="mb-3 flex flex-wrap gap-2">{(["computer", "switch", "router", "server"] as const).map((type) => <button className={button} key={type} onClick={() => addDevice(type)}>+ {type}</button>)}<button className={`${button} ${connecting ? "!border-cyan-300 !text-cyan-300" : ""}`} aria-pressed={connecting} onClick={() => { setConnecting(!connecting); setConnectionStart(null); }}>Connect devices</button></div>
        <p id="network-keyboard-help" className="mb-3 text-sm text-slate-400">{connecting ? "Select two devices to connect them. Select a cable to remove it." : "Drag devices to arrange them. Focus a device and use arrow keys to move it."}</p>
        <svg viewBox="0 0 760 400" className="w-full touch-none rounded-xl border border-white/10 bg-[#070e1b]" role="group" aria-label="Interactive network topology">
          <defs><pattern id="network-grid" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#26394d" /></pattern></defs><rect width="760" height="400" fill="url(#network-grid)" />
          {network.connections.map((edge, index) => { const first = network.devices.find((d) => d.id === edge.a); const second = network.devices.find((d) => d.id === edge.b); if (!first || !second) return null; const active = (edge.a === activeA && edge.b === activeB) || (edge.b === activeA && edge.a === activeB); return <g key={`${edge.a}-${edge.b}`}>
            <line x1={first.x} y1={first.y} x2={second.x} y2={second.y} stroke={active ? "#67e8f9" : "#58738e"} strokeWidth={active ? 3 : 2} />
            <line x1={first.x} y1={first.y} x2={second.x} y2={second.y} stroke="transparent" strokeWidth="18" role="button" tabIndex={0} aria-label={`Remove connection between ${first.name} and ${second.name}`} className="cursor-pointer focus:stroke-red-300/70" onClick={() => mutate({ ...network, connections: network.connections.filter((_, i) => i !== index), routes: network.routes.filter((r) => !((r.routerId === edge.a && r.nextHop === edge.b) || (r.routerId === edge.b && r.nextHop === edge.a))) })} onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Delete" || e.key === " ") { e.preventDefault(); mutate({ ...network, connections: network.connections.filter((_, i) => i !== index), routes: network.routes.filter((r) => !((r.routerId === edge.a && r.nextHop === edge.b) || (r.routerId === edge.b && r.nextHop === edge.a))) }); } }} />
          </g>; })}
          {a && b && <circle cx={a.x} cy={a.y} r="6" fill="#a5f3fc" pointerEvents="none">{playing && visible && !reducedMotion && <animateMotion key={`${step}-${activeA}`} path={`M 0 0 L ${b.x - a.x} ${b.y - a.y}`} dur="0.9s" fill="freeze" />}</circle>}
          {network.devices.map((device) => <g key={device.id} transform={`translate(${device.x} ${device.y})`} role="button" tabIndex={0} aria-describedby="network-keyboard-help" aria-pressed={selected === device.id} className="cursor-grab outline-none focus:[&>rect]:stroke-white" onKeyDown={(e) => { const delta: Record<string, [number, number]> = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] }; if (delta[e.key]) { e.preventDefault(); moveDevice(device.id, device.x + delta[e.key][0], device.y + delta[e.key][1]); } if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pickDevice(device.id); } }} onPointerDown={(e) => { if (connecting) return; const rect = e.currentTarget.ownerSVGElement!.getBoundingClientRect(); dragging.current = { id: device.id, startX: e.clientX, startY: e.clientY, dx: (e.clientX - rect.left) / rect.width * 760 - device.x, dy: (e.clientY - rect.top) / rect.height * 400 - device.y, moved: false }; e.currentTarget.setPointerCapture(e.pointerId); }} onPointerMove={(e) => { const drag = dragging.current; if (!drag || drag.id !== device.id) return; drag.moved = Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > 4; const rect = e.currentTarget.ownerSVGElement!.getBoundingClientRect(); moveDevice(device.id, (e.clientX - rect.left) / rect.width * 760 - drag.dx, (e.clientY - rect.top) / rect.height * 400 - drag.dy); }} onPointerUp={(e) => { const moved = dragging.current?.moved; dragging.current = null; if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId); if (!moved) pickDevice(device.id); }} onPointerCancel={() => { dragging.current = null; }}>
            <rect x="-27" y="-26" width="54" height="52" rx={device.type === "router" ? 26 : 10} fill={selected === device.id ? "#123543" : "#122033"} stroke={connectionStart === device.id ? "#fbbf24" : selected === device.id ? "#67e8f9" : "#53708a"} strokeWidth="1.5" />
            <text textAnchor="middle" y="5" fill="#b6eff7" fontSize="14" fontFamily="monospace" pointerEvents="none">{symbols[device.type]}</text><text textAnchor="middle" y="44" fill="#cbd5e1" fontSize="12" pointerEvents="none">{device.name}</text><text textAnchor="middle" y="61" fill="#7890a8" fontSize="11" pointerEvents="none">{device.ip}</text>
          </g>)}
        </svg>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"><label className="space-y-2 text-sm text-slate-300">Source<select className={input} value={source} onChange={(e) => setSource(e.target.value)}><option value="">Choose source</option>{network.devices.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></label><label className="space-y-2 text-sm text-slate-300">Destination<select className={input} value={destination} onChange={(e) => setDestination(e.target.value)}><option value="">Choose destination</option>{network.devices.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></label><button className={`${button} self-end !bg-cyan-300 !text-slate-950`} onClick={sendPacket}>Send packet</button></div>
        <div className="mt-4 flex flex-wrap items-center gap-2">{journey.map((id, i) => <button key={`${id}-${i}`} className={`${button} ${step === i ? "!border-cyan-300 !text-cyan-300" : ""}`} onClick={() => { setPlaying(false); setStep(i); }}>{i + 1}. {network.devices.find((d) => d.id === id)?.name}</button>)}{journey.length > 0 && <button className={button} onClick={() => { setPlaying(false); setStep(Math.min(step + 1, journey.length - 1)); }} disabled={step >= journey.length - 1}>Next hop</button>}</div>
        {journey.length > 0 && <p className="mt-3 text-sm text-slate-400">Hop {step + 1} / {journey.length}: {step === journey.length - 1 ? "Delivered to destination." : network.devices.find((d) => d.id === activeA)?.type === "router" ? "Router checks the longest matching static route; if none matches, the simulator follows a connected shortest path." : "The simulator follows a connected link toward the destination. Switch MAC learning and ARP are outside this simplified model."}</p>}
      </section>
      <aside className={`${panel} space-y-4`} aria-label="Device properties"><h2 className="text-lg font-semibold text-white">Device inspector</h2>{selectedDevice ? <><span className="text-sm uppercase tracking-widest text-cyan-300">{selectedDevice.type}</span><label className="block space-y-2 text-sm text-slate-300">Name<input className={input} maxLength={40} value={selectedDevice.name} onChange={(e) => setNetwork({ ...network, devices: network.devices.map((d) => d.id === selected ? { ...d, name: e.target.value } : d) })} /></label><label className="block space-y-2 text-sm text-slate-300">IPv4 address<input className={input} value={selectedDevice.ip} onChange={(e) => setNetwork({ ...network, devices: network.devices.map((d) => d.id === selected ? { ...d, ip: e.target.value } : d) })} /></label><button className={`${button} !text-red-300`} onClick={deleteDevice}>Remove device</button>{selectedDevice.type === "router" && <div className="space-y-3 border-t border-white/10 pt-4"><h3 className="text-base font-medium text-white">Static forwarding route</h3><label className="block space-y-2 text-sm text-slate-300">Destination CIDR<input className={input} value={routeDestination} onChange={(e) => setRouteDestination(e.target.value)} /></label><label className="block space-y-2 text-sm text-slate-300">Next hop<select className={input} value={nextHop} onChange={(e) => setNextHop(e.target.value)}><option value="">Choose adjacent device</option>{network.devices.filter((d) => network.connections.some((edge) => (edge.a === selected && edge.b === d.id) || (edge.b === selected && edge.a === d.id))).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></label><button className={button} onClick={addRoute}>Add / replace route</button>{network.routes.filter((r) => r.routerId === selected).map((r) => <div className="rounded-lg bg-white/5 p-3 text-sm text-slate-300" key={r.destination}><code>{r.destination}</code><p className="my-1 text-slate-400">via {network.devices.find((d) => d.id === r.nextHop)?.name}</p><button className="text-xs text-red-300 underline" onClick={() => mutate({ ...network, routes: network.routes.filter((item) => item !== r) })}>Remove route</button></div>)}</div>}</> : <p className="text-sm text-slate-400">Select a device to change its properties.</p>}</aside>
    </div>
    <p role="status" aria-live="polite" className="min-h-6 text-sm text-cyan-200">{message}</p>
    <IPCalculator />
    <NetworkEducation />
    <details className={panel}><summary className="cursor-pointer font-medium text-white">Workspace help and simulation boundaries</summary><p className="mt-3 text-sm leading-relaxed text-slate-400">Add devices, connect them, and select a source and destination. Without a matching static router entry, this teaching model discovers the shortest connected path. A real router requires a routing table and does not automatically know this path. Routes here use next-hop device IDs, and each device has a single illustrative IPv4 address. Subnet isolation, multiple router interfaces, ARP, switching tables, congestion, and protocol timing are outside this simulation. Edits and saved experiments remain in your browser.</p></details>
  </div>;
}
