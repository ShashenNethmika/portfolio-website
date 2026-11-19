export type BitWidth = 8 | 16 | 32;
export type BinaryOperation = "AND" | "OR" | "XOR" | "NOT" | "SHL" | "SHR" | "SAR" | "INC" | "DEC" | "ADD" | "SUB";
export function modulus(width: BitWidth) { return 1n << BigInt(width); }
export function mask(width: BitWidth) { return modulus(width) - 1n; }
export function normalize(value: bigint, width: BitWidth) { return ((value % modulus(width)) + modulus(width)) % modulus(width); }
export function signedValue(value: bigint, width: BitWidth) {
  const n = normalize(value, width);
  return n >= modulus(width) / 2n ? n - modulus(width) : n;
}
export function representations(value: bigint, width: BitWidth) {
  const n = normalize(value, width);
  const bytes = Array.from({ length: width / 8 }, (_, index) => Number((n >> BigInt((width / 8 - index - 1) * 8)) & 255n));
  return { binary: n.toString(2).padStart(width, "0"), decimal: n.toString(), signed: signedValue(n, width).toString(), hex: `0x${n.toString(16).toUpperCase().padStart(width / 4, "0")}`, octal: `0o${n.toString(8)}`, ascii: bytes.map((byte) => byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : `[${byte}]`).join(" ") };
}
export function parseInteger(text: string, width: BitWidth, signed: boolean): bigint {
  if (!/^-?(?:\d+|0[xX][\da-fA-F]+|0[bB][01]+|0[oO][0-7]+)$/.test(text.trim())) throw new Error("Enter an integer, 0b binary, 0x hexadecimal, or 0o octal value.");
  const trimmed = text.trim();
  const value = trimmed.startsWith("-") ? -BigInt(trimmed.slice(1)) : BigInt(trimmed);
  const min = signed ? -modulus(width) / 2n : 0n;
  const max = signed ? modulus(width) / 2n - 1n : mask(width);
  if (value < min || value > max) throw new Error(`Allowed range: ${min} to ${max}.`);
  return normalize(value, width);
}
/** BigInt avoids JavaScript's signed 32-bit bitwise coercion, including for unsigned 0xffffffff. */
export function calculate(operation: BinaryOperation, inputA: bigint, inputB: bigint, width: BitWidth) {
  const a = normalize(inputA, width), b = normalize(inputB, width);
  const sa = signedValue(a, width), sb = signedValue(b, width);
  let raw: bigint;
  let signedRaw: bigint | null = null;
  switch (operation) {
    case "AND": raw = a & b; break;
    case "OR": raw = a | b; break;
    case "XOR": raw = a ^ b; break;
    case "NOT": raw = ~a; break;
    case "SHL": raw = a << 1n; signedRaw = sa * 2n; break;
    case "SHR": raw = a >> 1n; break;
    case "SAR": raw = sa >> 1n; break;
    case "INC": raw = a + 1n; signedRaw = sa + 1n; break;
    case "DEC": raw = a - 1n; signedRaw = sa - 1n; break;
    case "ADD": raw = a + b; signedRaw = sa + sb; break;
    case "SUB": raw = a - b; signedRaw = sa - sb; break;
  }
  const carry = operation === "SHR" || operation === "SAR" ? (a & 1n) === 1n : operation === "SHL" ? a >= modulus(width) / 2n : ["ADD", "INC"].includes(operation) ? raw >= modulus(width) : false;
  const borrow = (operation === "SUB" || operation === "DEC") && raw < 0n;
  const overflow = signedRaw !== null && (signedRaw < -modulus(width) / 2n || signedRaw >= modulus(width) / 2n);
  return { value: normalize(raw, width), carry, borrow, overflow, operation };
}
