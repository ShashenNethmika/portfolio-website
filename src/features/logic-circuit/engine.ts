import { z } from "zod";

export const gates = ["AND", "OR", "NOT", "XOR", "XNOR", "NAND", "NOR"] as const;
export type Gate = (typeof gates)[number];
export type Signal = 0 | 1;
export const nodeSchema = z.object({
  id: z.string().min(1).max(80),
  name: z.string().min(1).max(30),
  kind: z.enum(["INPUT", "OUTPUT", ...gates]),
  value: z.union([z.literal(0), z.literal(1)]),
  inputs: z.array(z.string().max(80).nullable()).max(4),
  x: z.number().finite().min(0).max(840),
  y: z.number().finite().min(0).max(470),
});
export const circuitSchema = z.object({ version: z.literal(1), nodes: z.array(nodeSchema).min(1).max(32) });
export type CircuitNode = z.infer<typeof nodeSchema>;
export type Circuit = z.infer<typeof circuitSchema>;

export function computeGate(gate: Gate, inputs: readonly Signal[]): Signal {
  if (gate === "NOT") return inputs[0] === 1 ? 0 : 1;
  const all = inputs.every(Boolean);
  const any = inputs.some(Boolean);
  const odd = inputs.reduce<number>((sum, value) => sum + value, 0) % 2 === 1;
  return Number(gate === "AND" ? all : gate === "OR" ? any : gate === "NAND" ? !all : gate === "NOR" ? !any : gate === "XOR" ? odd : !odd) as Signal;
}

/** DFS evaluates each node once and detects back edges, rather than guessing a signal in feedback loops. */
export function evaluateCircuit(circuit: Circuit, overrides: Record<string, Signal> = {}) {
  const signals: Record<string, Signal | null> = {};
  const errors: string[] = [];
  const steps: string[] = [];
  const visiting = new Set<string>();
  const nodes = new Map(circuit.nodes.map((node) => [node.id, node]));
  if (nodes.size !== circuit.nodes.length) errors.push("Node IDs must be unique.");
  if (circuit.nodes.filter((node) => node.kind === "INPUT").length > 8) errors.push("Use at most eight input switches.");
  function visit(id: string): Signal | null {
    if (Object.hasOwn(signals, id)) return signals[id];
    const node = nodes.get(id);
    if (!node) { errors.push(`Connection references missing node ${id}.`); return null; }
    if (visiting.has(id)) { errors.push(`Feedback loop at ${node.name}; this studio supports combinational circuits.`); return null; }
    if (node.kind === "INPUT") {
      if (node.inputs.length) errors.push(`${node.name}: input switches cannot receive wires.`);
      return signals[id] = overrides[id] ?? node.value;
    }
    visiting.add(id);
    const expected = node.kind === "NOT" || node.kind === "OUTPUT" ? 1 : node.inputs.length;
    if (node.inputs.length !== expected || (node.kind !== "NOT" && node.kind !== "OUTPUT" && (expected < 2 || expected > 4))) {
      errors.push(`${node.name}: invalid input count.`);
      visiting.delete(id);
      return signals[id] = null;
    }
    const values = node.inputs.map((source, index) => {
      if (!source) { errors.push(`${node.name}: connect input ${index + 1}.`); return null; }
      if (nodes.get(source)?.kind === "OUTPUT") { errors.push(`${node.name}: output monitors cannot drive another node.`); return null; }
      return visit(source);
    });
    visiting.delete(id);
    if (values.some((value) => value === null)) return signals[id] = null;
    const result = node.kind === "OUTPUT" ? values[0] as Signal : computeGate(node.kind, values as Signal[]);
    signals[id] = result;
    steps.push(`${node.name}: ${node.kind === "OUTPUT" ? "reads" : node.kind} [${values.join(", ")}] = ${result}`);
    return result;
  }
  circuit.nodes.forEach((node) => visit(node.id));
  if (!circuit.nodes.some((node) => node.kind === "OUTPUT")) errors.push("Add an output monitor to read the circuit.");
  return { signals, errors: [...new Set(errors)], steps };
}

export function truthTable(circuit: Circuit) {
  const inputs = circuit.nodes.filter((node) => node.kind === "INPUT");
  const outputs = circuit.nodes.filter((node) => node.kind === "OUTPUT");
  if (inputs.length > 8) return [];
  return Array.from({ length: 2 ** inputs.length }, (_, index) => {
    const values = inputs.map((_, bit) => ((index >> (inputs.length - bit - 1)) & 1) as Signal);
    const result = evaluateCircuit(circuit, Object.fromEntries(inputs.map((node, i) => [node.id, values[i]])));
    return { inputs: values, outputs: outputs.map((node) => result.signals[node.id]) };
  });
}

export function initialCircuit(): Circuit {
  return { version: 1, nodes: [
    { id: "a", name: "A", kind: "INPUT", value: 1, inputs: [], x: 50, y: 80 },
    { id: "b", name: "B", kind: "INPUT", value: 0, inputs: [], x: 50, y: 280 },
    { id: "gate", name: "AND 1", kind: "AND", value: 0, inputs: ["a", "b"], x: 360, y: 175 },
    { id: "out", name: "Output", kind: "OUTPUT", value: 0, inputs: ["gate"], x: 690, y: 175 },
  ] };
}

export function halfAdderChallenge(): Circuit {
  return { version: 1, nodes: [
    { id: "a", name: "A", kind: "INPUT", value: 0, inputs: [], x: 30, y: 90 },
    { id: "b", name: "B", kind: "INPUT", value: 0, inputs: [], x: 30, y: 300 },
    { id: "sum-gate", name: "XOR 1", kind: "XOR", value: 0, inputs: [null, null], x: 340, y: 70 },
    { id: "carry-gate", name: "AND 1", kind: "AND", value: 0, inputs: [null, null], x: 340, y: 300 },
    { id: "sum", name: "Sum", kind: "OUTPUT", value: 0, inputs: [null], x: 680, y: 70 },
    { id: "carry", name: "Carry", kind: "OUTPUT", value: 0, inputs: [null], x: 680, y: 300 },
  ] };
}

export function checkHalfAdder(circuit: Circuit): boolean {
  if (!circuit.nodes.some((node) => node.id === "a" && node.kind === "INPUT") || !circuit.nodes.some((node) => node.id === "b" && node.kind === "INPUT")) return false;
  return ([0, 1] as Signal[]).every((a) => ([0, 1] as Signal[]).every((b) => {
    const result = evaluateCircuit(circuit, { a, b });
    return !result.errors.length && result.signals.sum === (a ^ b) && result.signals.carry === (a & b);
  }));
}
