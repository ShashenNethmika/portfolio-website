"use client";

import { useState } from "react";
import { networkButton as button, networkInput as input, networkPanel as panel } from "./ui";

const layers = [
  { name: "Application", protocols: "HTTP, DNS, SMTP", text: "Application messages and services. HTTP requests a resource; DNS resolves a name.", model: "Application" },
  { name: "Presentation", protocols: "Encoding, encryption", text: "Represents data so applications can interpret it. TLS handles encryption above transport.", model: "Application" },
  { name: "Session", protocols: "Session management", text: "Coordinates ongoing conversations and their state.", model: "Application" },
  { name: "Transport", protocols: "TCP, UDP", text: "TCP offers ordered, reliable byte streams. UDP sends independent datagrams without delivery guarantees.", model: "Transport" },
  { name: "Network", protocols: "IPv4, IPv6, ICMP", text: "IP addresses identify endpoints. Routers forward packets between networks using routing tables.", model: "Internet" },
  { name: "Data link", protocols: "Ethernet, Wi-Fi", text: "Frames and MAC addresses move data over a local link. A switch learns which ports reach which MAC addresses.", model: "Link" },
  { name: "Physical", protocols: "Copper, fiber, radio", text: "Electrical, optical, or radio signals carry the bits over a medium.", model: "Link" },
];

export default function NetworkEducation() {
  const [layer, setLayer] = useState(4);
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");
  function checkAnswer() {
    if (answer.trim() !== "192.168.10.64") {
      setMessage("Try again. /26 leaves six host bits. Its blocks begin at 0, 64, 128, and 192 in the last octet. Which block contains 91?");
      return;
    }
    setMessage("Correct. Six host bits give blocks of 64. Address 91 is in the 64–127 block; 64 is the network address.");
    try { localStorage.setItem("portfolio.challenge.network", "complete"); } catch { /* The challenge remains available without storage. */ }
    window.dispatchEvent(new CustomEvent("lab:challenge", { detail: { station: "network-studio", id: "subnet" } }));
  }
  return <div className="grid gap-5 lg:grid-cols-2">
    <section className={panel} aria-label="Network reference models">
      <h2 className="mb-4 text-xl font-semibold text-white">From signal to application</h2>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-1">{layers.map((item, index) => <button className={`flex w-full justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm ${layer === index ? "bg-cyan-300/10 text-cyan-200" : "text-slate-400 hover:bg-white/5"}`} key={item.name} onClick={() => setLayer(index)} aria-pressed={layer === index}>
          <span>{7 - index}. {item.name}</span><span className="text-xs">{item.model}</span>
        </button>)}</div>
        <div className="rounded-xl bg-white/5 p-4">
          <span className="text-xs uppercase tracking-widest text-cyan-300">OSI ↔ TCP/IP</span>
          <h3 className="mb-2 mt-3 font-semibold text-white">{layers[layer].name}</h3>
          <p className="text-sm leading-relaxed text-slate-300">{layers[layer].text}</p>
          <p className="mt-4 text-sm text-cyan-200">{layers[layer].protocols}</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-400">Right-hand labels show the four-layer TCP/IP model. OSI is a conceptual reference, not a mandatory protocol implementation.</p>
    </section>
    <section className={panel} aria-label="Subnet learning challenge">
      <span className="text-xs uppercase tracking-widest text-amber-300">Learning challenge</span>
      <h2 className="mb-3 mt-2 text-xl font-semibold text-white">Find the network boundary</h2>
      <p className="mb-4 text-sm leading-relaxed text-slate-300">A computer is assigned <code className="text-cyan-200">192.168.10.91/26</code>. What is its network address? Enter only the IPv4 address.</p>
      <form onSubmit={(event) => { event.preventDefault(); checkAnswer(); }}>
        <label className="block space-y-2 text-sm text-slate-300">Your answer<input className={input} value={answer} placeholder="192.168.10.…" onChange={(event) => setAnswer(event.target.value)} spellCheck={false} /></label>
        <button className={`${button} mt-3`} type="submit">Check answer</button>
      </form>
      <p role="status" className="mt-3 text-sm leading-relaxed text-cyan-200">{message}</p>
    </section>
  </div>;
}
