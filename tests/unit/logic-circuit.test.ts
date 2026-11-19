import { describe, expect, it } from "vitest";
import { checkHalfAdder, computeGate, evaluateCircuit, halfAdderChallenge, initialCircuit, truthTable } from "../../src/features/logic-circuit/engine";

describe("combinational circuit engine", () => {
  it("computes all seven gates including multi-input parity", () => {
    expect(computeGate("AND", [1, 1, 1])).toBe(1);
    expect(computeGate("OR", [0, 0, 1])).toBe(1);
    expect(computeGate("NOT", [1])).toBe(0);
    expect(computeGate("NOT", [0])).toBe(1);
    expect(computeGate("XOR", [1, 1, 1])).toBe(1);
    expect(computeGate("XNOR", [1, 1, 1])).toBe(0);
    expect(computeGate("NAND", [1, 1])).toBe(0);
    expect(computeGate("NOR", [0, 0])).toBe(1);
  });
  it("evaluates chained gates and generates complete truth tables", () => {
    const circuit = initialCircuit();
    circuit.nodes.splice(3, 0, { id: "invert", name: "Inverter", kind: "NOT", value: 0, inputs: ["gate"], x: 500, y: 175 });
    circuit.nodes.find((node) => node.id === "out")!.inputs = ["invert"];
    expect(evaluateCircuit(circuit).signals.out).toBe(1);
    expect(truthTable(circuit).map((row) => row.outputs[0])).toEqual([1, 1, 1, 0]);
  });
  it("rejects feedback, missing wires, and malformed gate arity", () => {
    const cycle = initialCircuit(); cycle.nodes.find((node) => node.id === "gate")!.inputs = ["gate", "b"];
    expect(evaluateCircuit(cycle).errors.join(" ")).toMatch(/Feedback/);
    expect(evaluateCircuit(cycle).signals.out).toBeNull();
    const missing = initialCircuit(); missing.nodes.find((node) => node.id === "gate")!.inputs[0] = null;
    expect(evaluateCircuit(missing).errors.join(" ")).toMatch(/connect input 1/);
    const invalid = initialCircuit(); invalid.nodes.find((node) => node.id === "gate")!.inputs = ["a"];
    expect(evaluateCircuit(invalid).errors.join(" ")).toMatch(/input count/);
  });
  it("verifies a half adder across every combination rather than only current inputs", () => {
    const circuit = halfAdderChallenge();
    expect(checkHalfAdder(circuit)).toBe(false);
    circuit.nodes.find((node) => node.id === "sum-gate")!.inputs = ["a", "b"];
    circuit.nodes.find((node) => node.id === "carry-gate")!.inputs = ["a", "b"];
    circuit.nodes.find((node) => node.id === "sum")!.inputs = ["sum-gate"];
    circuit.nodes.find((node) => node.id === "carry")!.inputs = ["carry-gate"];
    expect(checkHalfAdder(circuit)).toBe(true);
    circuit.nodes.find((node) => node.id === "sum-gate")!.kind = "OR";
    expect(checkHalfAdder(circuit)).toBe(false);
  });
});
