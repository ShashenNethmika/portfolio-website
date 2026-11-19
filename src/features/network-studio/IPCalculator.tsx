"use client";

import { useId, useState } from "react";
import { calculateSubnet, ipv4ToNumber, maskToPrefix } from "./engine";
import { networkButton as button, networkInput as input, networkPanel as panel } from "./ui";

export default function IPCalculator() {
  const [address, setAddress] = useState("192.168.1.42");
  const [prefix, setPrefix] = useState("24");
  const [mask, setMask] = useState("255.255.255.0");
  const [maskMessage, setMaskMessage] = useState("");
  const id = useId();
  let subnet: ReturnType<typeof calculateSubnet> | undefined;
  let addressError = "";
  const prefixError = !/^\d{1,2}$/.test(prefix) || Number(prefix) > 32 ? "Enter a CIDR prefix between 0 and 32." : "";
  try { ipv4ToNumber(address); } catch (cause) { addressError = (cause as Error).message; }
  const error = [addressError, prefixError].filter(Boolean).join(" ");
  if (!error) subnet = calculateSubnet(address, Number(prefix));

  function changePrefix(next: string) {
    setPrefix(next);
    const value = Number(next);
    if (/^\d{1,2}$/.test(next) && Number.isInteger(value) && value >= 0 && value <= 32) {
      setMask(calculateSubnet("0.0.0.0", value).mask);
      setMaskMessage("");
    }
  }

  function applyMask() {
    try {
      const value = maskToPrefix(mask);
      setPrefix(String(value));
      setMask(calculateSubnet("0.0.0.0", value).mask);
      setMaskMessage(`Mask applied: /${value}.`);
    } catch (cause) { setMaskMessage((cause as Error).message); }
  }

  return <section className={panel} aria-label="IP address calculator">
    <div className="mb-5 flex flex-wrap justify-between gap-2">
      <h2 className="text-xl font-semibold text-white">IPv4 address laboratory</h2>
      <span className="text-sm text-slate-400">32 bits. Every address accounted for.</span>
    </div>
    <div className="grid gap-4 md:grid-cols-[1fr_120px_1fr]">
      <label className="space-y-2 text-sm text-slate-300">
        IPv4 address
        <input className={input} value={address} onChange={(event) => setAddress(event.target.value)} spellCheck={false} aria-invalid={Boolean(addressError)} aria-describedby={addressError ? `${id}-error` : undefined} />
      </label>
      <label className="space-y-2 text-sm text-slate-300">
        CIDR prefix
        <input className={input} value={prefix} inputMode="numeric" onChange={(event) => changePrefix(event.target.value)} aria-invalid={Boolean(prefixError)} aria-describedby={prefixError ? `${id}-error` : undefined} />
      </label>
      <div className="space-y-2 text-sm text-slate-300">
        <label htmlFor={`${id}-mask`}>Subnet mask</label>
        <div className="flex gap-2">
          <input id={`${id}-mask`} className={input} value={mask} onChange={(event) => setMask(event.target.value)} spellCheck={false} />
          <button className={button} onClick={applyMask}>Apply</button>
        </div>
      </div>
    </div>
    {error && <p id={`${id}-error`} role="alert" className="mt-3 text-sm text-red-300">{error}</p>}
    <p role="status" className="mt-3 text-sm text-cyan-200">{maskMessage}</p>
    {subnet && <>
      <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Network address", `${subnet.network}/${subnet.prefix}`],
          [subnet.prefix >= 31 ? "Upper address (no broadcast)" : "Broadcast address", subnet.broadcast],
          ["First usable host", subnet.firstHost], ["Last usable host", subnet.lastHost],
          ["Subnet mask", subnet.mask], ["Usable hosts", subnet.usableHosts.toLocaleString("en-US")],
          ["Total addresses", subnet.totalAddresses.toLocaleString("en-US")], ["Host bits", String(32 - subnet.prefix)],
        ].map(([key, value]) => <div className="rounded-xl border border-white/10 p-3" key={key}>
          <dt className="mb-2 text-xs uppercase tracking-wider text-slate-400">{key}</dt>
          <dd className="break-all font-mono text-base text-cyan-100">{value}</dd>
        </div>)}
      </dl>
      <div className="mt-4 overflow-x-auto rounded-xl bg-[#070e1b] p-4 text-sm" role="region" aria-label="IPv4 binary representations" tabIndex={0}>
        <p className="mb-2 text-slate-400">Address in binary</p><code className="text-cyan-300">{subnet.binary}</code>
        <p className="mb-2 mt-4 text-slate-400">Mask in binary</p><code className="text-slate-200">{subnet.binaryMask}</code>
      </div>
      <p className="mt-3 text-sm text-slate-400">{subnet.note}</p>
      <p className="mt-2 text-sm text-slate-400">Calculation: 2<sup>{32 - subnet.prefix}</sup> = {subnet.totalAddresses.toLocaleString("en-US")} addresses. Round the address down to the nearest block boundary to find the network; add block size − 1 for the upper address.</p>
    </>}
  </section>;
}
