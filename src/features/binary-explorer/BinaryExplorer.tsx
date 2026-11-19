"use client";

import { useState } from "react";
import { z } from "zod";
import { calculate, mask, normalize, parseInteger, representations, signedValue, type BinaryOperation, type BitWidth } from "./engine";

const button = "rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-300/50 hover:bg-cyan-300/10";
const control = "rounded-lg border border-white/15 bg-[#0c1523] px-3 py-2 text-sm text-slate-100";
const snapshotSchema = z.object({ version: z.literal(1), width: z.union([z.literal(8), z.literal(16), z.literal(32)]), signed: z.boolean(), a: z.string().regex(/^\d{1,10}$/), b: z.string().regex(/^\d{1,10}$/) }).refine((data) => BigInt(data.a) <= mask(data.width) && BigInt(data.b) <= mask(data.width), "Saved value exceeds its bit width.");
type OperationResult = ReturnType<typeof calculate>;

function Register({ name, value, width, signed, onChange }: { name: string; value: bigint; width: BitWidth; signed: boolean; onChange: (value: bigint) => void }) {
  const values = representations(value, width);
  const [draft, setDraft] = useState(signed ? values.signed : values.decimal);
  const [error, setError] = useState("");
  const display = [["Decimal", signed ? values.signed : values.decimal], ["Hexadecimal", values.hex], ["Octal", values.octal], ["ASCII bytes", values.ascii]];
  return <section className="rounded-2xl border border-white/10 bg-white/[.025] p-5 sm:p-6">
    <div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-medium text-white">Register {name}</h2><span className="font-mono text-sm text-cyan-300">{width} bits</span></div>
    <div className="grid grid-cols-8 gap-1.5 sm:gap-2">{Array.from({ length: width }, (_, i) => width - i - 1).map((bit) => {
      const active = (value & (1n << BigInt(bit))) !== 0n;
      return <button key={bit} className={`rounded-lg border px-0 py-2 font-mono transition motion-reduce:transition-none ${active ? "border-cyan-300/60 bg-cyan-300/15 text-cyan-200 shadow-[inset_0_0_20px_#67e8f909]" : "border-white/10 bg-black/10 text-slate-400"}`} title={`Toggle register ${name}, bit ${bit}`} aria-pressed={active} onClick={() => onChange(value ^ (1n << BigInt(bit)))}><span className="block text-lg">{active ? "1" : "0"}</span><span className="text-xs text-slate-400">{bit}</span><span className="sr-only"> Toggle register {name} bit {bit}</span></button>;
    })}</div>
    <div className="mt-5 grid grid-cols-2 gap-3">{display.map(([label, text]) => <div className="min-w-0 rounded-xl bg-black/15 p-3" key={label}><p className="text-sm text-slate-400">{label}</p><p className="mt-1 break-all font-mono text-base text-slate-100" data-testid={`${name.toLowerCase()}-${label.toLowerCase().replaceAll(" ", "-")}`}>{text}</p></div>)}</div>
    <form className="mt-5" onSubmit={(event) => { event.preventDefault(); try { onChange(parseInteger(draft, width, signed)); setError(""); } catch (caught) { setError(caught instanceof Error ? caught.message : "Invalid integer."); } }}>
      <label htmlFor={`register-${name}`} className="mb-2 block text-sm text-slate-400">Set {name} from decimal, binary, hex, or octal</label><div className="flex gap-2"><input id={`register-${name}`} className={`${control} min-w-0 flex-1 font-mono`} value={draft} maxLength={40} onChange={(event) => setDraft(event.target.value)} aria-describedby={error ? `error-${name}` : undefined} aria-invalid={Boolean(error)} autoComplete="off" spellCheck={false} /><button className={button} type="submit">Set {name}</button></div>{error && <p role="alert" id={`error-${name}`} className="mt-2 text-sm text-amber-200">{error}</p>}
    </form>
    <p className="mt-4 break-all font-mono text-sm text-slate-400">{values.binary.match(/.{1,8}/g)?.join(" ")}</p>
  </section>;
}

export default function BinaryExplorer() {
  const [width, setWidth] = useState<BitWidth>(8);
  const [signed, setSigned] = useState(false);
  const [a, setA] = useState(43n);
  const [b, setB] = useState(15n);
  const [result, setResult] = useState<OperationResult | null>(null);
  const [explanation, setExplanation] = useState("Choose an operation. The result replaces A; B remains available for comparison.");
  const [status, setStatus] = useState("");
  const [challenge, setChallenge] = useState(false);
  function changeA(next: bigint) { setA(next); setResult(null); }
  function changeB(next: bigint) { setB(next); setResult(null); }
  function operate(operation: BinaryOperation) {
    const next = calculate(operation, a, b, width);
    const beforeA = representations(a, width), beforeB = representations(b, width), after = representations(next.value, width);
    setA(next.value); setResult(next);
    const usesB = ["AND", "OR", "XOR", "ADD", "SUB"].includes(operation);
    setExplanation(`${operation}: A ${beforeA.hex}${usesB ? ` and B ${beforeB.hex}` : ""} produce ${after.hex}. The result is kept within ${width} bits. ${operation === "SAR" ? "Arithmetic right shift preserves the sign bit." : operation === "SHR" ? "Logical right shift inserts a zero at the most significant bit." : operation === "NOT" ? "Every bit in A is inverted." : "Carry describes unsigned arithmetic; overflow describes signed arithmetic."}`);
  }
  const comparableA = signed ? signedValue(a, width) : a, comparableB = signed ? signedValue(b, width) : b;
  const weighted = Array.from({ length: width }, (_, bit) => bit).filter((bit) => (a & (1n << BigInt(bit))) !== 0n).reverse();
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-4"><label className="flex items-center gap-3 text-sm text-slate-400">Word size<select className={control} aria-label="Bit width" value={width} onChange={(event) => { const next = Number(event.target.value) as BitWidth; setWidth(next); setA(normalize(a, next)); setB(normalize(b, next)); setResult(null); setStatus(`Switched to ${next} bits. Values are truncated to fit when narrowing.`); }}>{[8, 16, 32].map((size) => <option key={size} value={size}>{size}-bit</option>)}</select></label><label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" className="size-4 accent-cyan-300" checked={signed} onChange={(event) => setSigned(event.target.checked)} />Signed interpretation</label></div>
      <div className="flex flex-wrap gap-2"><button className={button} onClick={() => { setA(43n); setB(15n); setWidth(8); setSigned(false); setResult(null); setChallenge(false); setStatus("Registers reset."); }}>Reset</button><button className={button} onClick={() => { setA(0n); setWidth(8); setSigned(false); setResult(null); setChallenge(true); setStatus("Challenge: use the bit switches to encode the ASCII plus sign (+), decimal 43."); }}>ASCII challenge</button></div>
    </div>
    <div className="grid gap-5 lg:grid-cols-2"><Register key={`a-${a}-${width}-${signed}`} name="A" value={a} width={width} signed={signed} onChange={changeA} /><Register key={`b-${b}-${width}-${signed}`} name="B" value={b} width={width} signed={signed} onChange={changeB} /></div>
    <section className="rounded-2xl border border-white/10 p-5 sm:p-6"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg text-white">Operations</h2><p className="text-sm text-slate-400">All results write to A · shifts are by one bit</p></div><div className="flex flex-wrap gap-2">{([["AND", "A AND B"], ["OR", "A OR B"], ["XOR", "A XOR B"], ["NOT", "NOT A"], ["SHL", "A << 1"], ["SHR", "A >> 1 (logical)"], ["SAR", "A >> 1 (signed)"], ["ADD", "A + B"], ["SUB", "A − B"], ["INC", "Increment A"], ["DEC", "Decrement A"]] as [BinaryOperation, string][]).map(([operation, label]) => <button key={operation} className={button} onClick={() => operate(operation)}>{label}</button>)}<button className={button} onClick={() => { changeA(0n); setExplanation("All bits in A cleared."); }}>Clear A</button><button className={button} onClick={() => { changeA(mask(width)); setExplanation(`All ${width} bits in A set to one.`); }}>Set all A</button><button className={button} onClick={() => { const bytes = crypto.getRandomValues(new Uint32Array(1)); changeA(BigInt(bytes[0]) & mask(width)); setExplanation("A randomized within its current width."); }}>Random A</button><button className={button} onClick={() => { setA(b); setB(a); setResult(null); setExplanation("Registers swapped."); }}>Swap A / B</button></div></section>
    <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
      <section className="rounded-2xl border border-white/10 p-5"><h2 className="mb-4 text-lg text-white">Live comparison & flags</h2><p className="mb-5 font-mono text-2xl text-cyan-200">A {comparableA === comparableB ? "=" : comparableA > comparableB ? ">" : "<"} B <span className="text-sm text-slate-400">({signed ? "signed" : "unsigned"})</span></p><div className="grid grid-cols-3 gap-2">{[["Carry", result?.carry], ["Borrow", result?.borrow], ["Overflow", result?.overflow]].map(([label, active]) => <div key={String(label)} className={`rounded-xl border p-3 ${active ? "border-amber-300/30 bg-amber-300/10 text-amber-200" : "border-white/5 bg-white/[.02] text-slate-400"}`}><p className="text-sm">{label}</p><p className="mt-1 font-mono text-xl">{result ? active ? "1" : "0" : "—"}</p></div>)}</div><p className="mt-4 text-sm leading-6 text-slate-400">Flags refer to the last operation. Carry indicates a bit shifted out or an unsigned sum exceeding the word. Borrow indicates unsigned subtraction below zero. Overflow indicates a signed result outside the word&apos;s range.</p></section>
      <section className="rounded-2xl border border-white/10 p-5"><h2 className="mb-4 text-lg text-white">Understand the result</h2><p className="text-sm leading-6 text-slate-300" role="status">{explanation}</p><div className="mt-5 border-t border-white/10 pt-4"><p className="mb-2 text-sm text-slate-400">Unsigned conversion · add the weights of all set bits</p><p className="break-words font-mono text-sm leading-7 text-cyan-200">{weighted.length ? weighted.map((bit) => `2^${bit}`).join(" + ") : "0"} = {a.toString()}</p><p className="mt-3 text-sm leading-6 text-slate-400">Two&apos;s complement: if the leading bit is 1, signed value = unsigned value − 2^{width}. For A: {a.toString()} {a >= (1n << BigInt(width - 1)) ? `− ${1n << BigInt(width)}` : "(leading bit is 0)"} = {signedValue(a, width).toString()}. ASCII is shown per byte, most significant first; brackets indicate non-printable or non-ASCII bytes.</p></div></section>
    </div>
    {challenge && <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-violet-300/20 bg-violet-300/5 p-5"><p className="text-sm text-violet-100">Encode ASCII &apos;+&apos; in A. Hint: 43 = 32 + 8 + 2 + 1.</p><button className={button} onClick={() => { const passed = a === 43n; setStatus(passed ? "Challenge passed. 00101011 = decimal 43 = ASCII +." : "Try again: check the weights of your set bits."); if (passed) window.dispatchEvent(new CustomEvent("lab:challenge", { detail: { station: "binary-explorer", id: "ascii-plus" } })); }}>Check answer</button></div>}
    <div className="flex flex-wrap items-center gap-3"><button className={button} onClick={() => { try { localStorage.setItem("shashen.binary.v1", JSON.stringify({ version: 1, width, signed, a: a.toString(), b: b.toString() })); window.dispatchEvent(new CustomEvent("lab:saved", { detail: { station: "binary-explorer" } })); setStatus("Both registers and interpretation saved on this browser."); } catch { setStatus("Browser storage unavailable or full."); } }}>Save experiment</button><button className={button} onClick={() => { try { const raw = localStorage.getItem("shashen.binary.v1"); if (!raw) { setStatus("No saved binary experiment on this browser."); return; } const parsed = snapshotSchema.parse(JSON.parse(raw)); setWidth(parsed.width); setSigned(parsed.signed); setA(BigInt(parsed.a)); setB(BigInt(parsed.b)); setResult(null); setStatus("Saved binary experiment loaded."); } catch { setStatus("Saved experiment is invalid or browser storage is unavailable."); } }}>Load experiment</button><p className="text-sm text-slate-400" role="status">{status}</p></div>
  </div>;
}
