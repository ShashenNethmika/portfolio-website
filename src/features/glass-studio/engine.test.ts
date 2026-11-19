import { describe, expect, it } from "vitest";
import { defaultGlass, generateGlassCSS, generateGlassTSX, generateGlassVariables, glassSchema, glassStyle, savedGlassSchema, sceneStyle } from "./engine";

describe("glass design exports", () => {
  it("uses every live surface property in CSS and TSX", () => {
    const s = { ...defaultGlass, hue: 275, opacity: 37, border: 4, saturation: 62, shadow: 0, glow: 0 };
    const css = generateGlassCSS(s), tsx = generateGlassTSX(s);
    for (const value of Object.values(glassStyle(s))) { expect(css).toContain(value); expect(tsx).toContain(value); }
    expect(css).toContain("-webkit-backdrop-filter: blur(20px)");
    expect(css).toContain("hsla(275, 62%, 75%, 0.37)");
    expect(css).not.toMatch(/hsl\([^)]*\)[0-9a-f]{2}/);
  });
  it("exports scene controls and matching CSS variables", () => {
    const s = { ...defaultGlass, backgroundAngle: 87, backgroundSaturation: 20 };
    const variables = generateGlassVariables(s);
    expect(variables).toContain(sceneStyle(s).background);
    expect(variables).toContain("--glass-border-radius: 24px;");
    expect(variables).toContain("border-radius: var(--glass-border-radius);");
    expect(sceneStyle({ ...s, gradient: false }).background).not.toContain("gradient");
  });
  it("rejects malformed or unbounded stored settings", () => {
    expect(glassSchema.safeParse({ ...defaultGlass, blur: -1 }).success).toBe(false);
    expect(savedGlassSchema.safeParse({ version: 1, presets: [{ name: "Saved", settings: defaultGlass }] }).success).toBe(true);
    expect(savedGlassSchema.safeParse({ version: 1, presets: [{ name: "", settings: defaultGlass }] }).success).toBe(false);
  });
});
