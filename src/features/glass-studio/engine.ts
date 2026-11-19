import { z } from "zod";

export const glassSchema = z.object({
  blur: z.number().min(0).max(50), opacity: z.number().min(0).max(100), radius: z.number().min(0).max(64),
  border: z.number().min(0).max(8), glow: z.number().min(0).max(80), shadow: z.number().min(0).max(80),
  hue: z.number().min(0).max(360), saturation: z.number().min(0).max(100),
  backgroundHue: z.number().min(0).max(360), backgroundSaturation: z.number().min(0).max(100),
  backgroundAngle: z.number().min(0).max(360), gradient: z.boolean(),
});
export type GlassSettings = z.infer<typeof glassSchema>;
export const defaultGlass: GlassSettings = { blur: 20, opacity: 18, radius: 24, border: 1, glow: 12, shadow: 40, hue: 190, saturation: 75, backgroundHue: 235, backgroundSaturation: 60, backgroundAngle: 135, gradient: true };
export const glassPresets: Record<string, GlassSettings> = {
  "Arctic": defaultGlass,
  "Violet": { ...defaultGlass, hue: 275, backgroundHue: 285, blur: 28, glow: 22 },
  "Emerald": { ...defaultGlass, hue: 155, backgroundHue: 170, radius: 16, opacity: 22 },
  "Amber": { ...defaultGlass, hue: 42, backgroundHue: 20, opacity: 24, radius: 28 },
  "Stealth": { ...defaultGlass, hue: 215, saturation: 15, backgroundHue: 215, backgroundSaturation: 15, opacity: 60, blur: 32, glow: 0 },
};

export function glassStyle(s: GlassSettings) {
  return {
    background: `hsla(${s.hue}, ${s.saturation}%, 75%, ${s.opacity / 100})`,
    backdropFilter: `blur(${s.blur}px)`,
    WebkitBackdropFilter: `blur(${s.blur}px)`,
    border: `${s.border}px solid hsla(${s.hue}, ${s.saturation}%, 80%, 0.5)`,
    borderRadius: `${s.radius}px`,
    boxShadow: `0 20px ${s.shadow}px rgba(0, 0, 0, ${s.shadow ? 0.35 : 0}), 0 0 ${s.glow}px hsla(${s.hue}, ${s.saturation}%, 70%, ${s.glow ? 0.3 : 0})`,
    color: "#ffffff",
    padding: "32px",
  };
}
export function sceneStyle(s: GlassSettings) {
  const first = `hsl(${s.backgroundHue}, ${s.backgroundSaturation}%, 25%)`;
  const second = `hsl(${(s.backgroundHue + 90) % 360}, ${s.backgroundSaturation}%, 12%)`;
  return { background: s.gradient ? `linear-gradient(${s.backgroundAngle}deg, ${first}, ${second})` : first, padding: "48px", minHeight: "400px", display: "grid", placeItems: "center" };
}
function cssName(name: string) { return name.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`).replace(/^webkit-/, "-webkit-"); }
function rules(style: Record<string, string>) { return Object.entries(style).map(([key, value]) => `  ${cssName(key)}: ${value};`).join("\n"); }
export function generateGlassCSS(s: GlassSettings) { return `.glass-scene {\n${rules(sceneStyle(s))}\n}\n\n.glass-card {\n${rules(glassStyle(s))}\n}`; }

/** All exports derive from the same style functions used by the live preview. */
export function generateGlassVariables(s: GlassSettings) {
  const surface = glassStyle(s), scene = sceneStyle(s);
  const variables = Object.entries(surface).map(([key, value]) => `  --glass-${cssName(key).replace(/^-/, "")}: ${value};`).join("\n");
  const card = Object.keys(surface).map(key => `  ${cssName(key)}: var(--glass-${cssName(key).replace(/^-/, "")});`).join("\n");
  return `:root {\n${variables}\n  --glass-scene-background: ${scene.background};\n}\n\n.glass-scene {\n${rules({ ...scene, background: "var(--glass-scene-background)" })}\n}\n\n.glass-card {\n${card}\n}`;
}
export function generateGlassTSX(s: GlassSettings) {
  return `import type { CSSProperties, ReactNode } from "react";\n\nconst scene: CSSProperties = ${JSON.stringify(sceneStyle(s), null, 2)};\n\nconst surface: CSSProperties = ${JSON.stringify(glassStyle(s), null, 2)};\n\nexport function GlassCard({ children }: { children: ReactNode }) {\n  return <div style={scene}><article style={surface}>{children}</article></div>;\n}\n`;
}
export const savedGlassSchema = z.object({ version: z.literal(1), presets: z.array(z.object({ name: z.string().trim().min(1).max(40), settings: glassSchema })).max(30) });
export type SavedGlass = z.infer<typeof savedGlassSchema>;
