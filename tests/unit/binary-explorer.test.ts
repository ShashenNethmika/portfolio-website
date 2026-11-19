import { describe, expect, it } from "vitest";
import { calculate, normalize, parseInteger, representations, signedValue } from "../../src/features/binary-explorer/engine";

describe("fixed-width integer engine", () => {
  it("converts 32-bit unsigned values without JavaScript signed coercion", () => {
    expect(representations(4294967295n, 32)).toMatchObject({ binary: "1".repeat(32), decimal: "4294967295", signed: "-1", hex: "0xFFFFFFFF", octal: "0o37777777777" });
    expect(calculate("XOR", 4294967295n, 0n, 32).value).toBe(4294967295n);
    expect(calculate("NOT", 0n, 0n, 32).value).toBe(4294967295n);
  });
  it("separates carry, borrow, and signed overflow", () => {
    expect(calculate("INC", 255n, 0n, 8)).toMatchObject({ value: 0n, carry: true, overflow: false });
    expect(calculate("INC", 127n, 0n, 8)).toMatchObject({ value: 128n, carry: false, overflow: true });
    expect(calculate("DEC", 0n, 0n, 8)).toMatchObject({ value: 255n, borrow: true, overflow: false });
    expect(calculate("SUB", 128n, 1n, 8)).toMatchObject({ value: 127n, borrow: false, overflow: true });
    expect(calculate("ADD", 200n, 100n, 8)).toMatchObject({ value: 44n, carry: true, overflow: false });
  });
  it("distinguishes logical and arithmetic right shifts", () => {
    expect(calculate("SHR", 255n, 0n, 8)).toMatchObject({ value: 127n, carry: true });
    expect(calculate("SAR", 255n, 0n, 8)).toMatchObject({ value: 255n, carry: true });
    expect(calculate("SHL", 128n, 0n, 8)).toMatchObject({ value: 0n, carry: true, overflow: true });
  });
  it("validates signed ranges and explicit bases", () => {
    expect(parseInteger("-128", 8, true)).toBe(128n);
    expect(parseInteger("0x2B", 8, false)).toBe(43n);
    expect(parseInteger("0b00101011", 8, false)).toBe(43n);
    expect(parseInteger("0o53", 8, false)).toBe(43n);
    expect(() => parseInteger("128", 8, true)).toThrow(/range/);
    expect(() => parseInteger("256", 8, false)).toThrow(/range/);
    expect(() => parseInteger("2.4", 8, false)).toThrow(/integer/);
    expect(normalize(-1n, 16)).toBe(65535n);
    expect(signedValue(32768n, 16)).toBe(-32768n);
    expect(representations(43n, 8).ascii).toBe("+");
  });
});
