import { expect, test, type Page } from "@playwright/test";

const errors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const messages: string[] = [];
  errors.set(page, messages);
  page.on("pageerror", (error) => messages.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") messages.push(message.text()); });
});
test.afterEach(async ({ page }) => { expect(errors.get(page), "No browser errors").toEqual([]); });

test("deleting a pending connection endpoint keeps the saved topology valid", async ({ page }) => {
  await page.goto("lab/network-studio/");
  await page.getByRole("button", { name: "Connect devices", exact: true }).click();
  await page.getByRole("button", { name: /^PC Your computer / }).press("Enter");
  await page.getByRole("button", { name: "Remove device", exact: true }).click();
  await page.getByRole("button", { name: /^SW Access switch / }).press("Enter");
  await page.getByRole("button", { name: /^SRV Web server / }).press("Enter");
  await page.getByRole("button", { name: "Save topology", exact: true }).click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("portfolio.network.v1") || "null") as { devices: { id: string }[]; connections: { a: string; b: string }[] } | null);
  expect(saved).not.toBeNull();
  expect(saved!.devices).toHaveLength(3);
  const ids = saved!.devices.map((device) => device.id);
  expect(saved!.connections.every((edge) => ids.includes(edge.a) && ids.includes(edge.b))).toBe(true);
  await expect(page.getByRole("combobox", { name: "Source", exact: true })).toHaveValue("switch");
});

test("subnet calculator distinguishes point-to-point links and host routes", async ({ page }) => {
  await page.goto("lab/network-studio/");
  const calculator = page.getByRole("region", { name: "IP address calculator" });
  await calculator.getByLabel("IPv4 address", { exact: true }).fill("10.0.0.3");
  await calculator.getByLabel("CIDR prefix", { exact: true }).fill("31");
  await expect(calculator).toContainText("10.0.0.2/31");
  await expect(calculator).toContainText("/31 uses both addresses on point-to-point links");
  await calculator.getByLabel("CIDR prefix", { exact: true }).fill("32");
  await expect(calculator).toContainText("10.0.0.3/32");
  await expect(calculator).toContainText("/32 identifies one host route");
  await calculator.getByLabel("Subnet mask", { exact: true }).fill("255.0.255.0");
  await calculator.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(calculator.getByRole("status")).toContainText("consecutive ones followed by zeros");
});

test("motion static SVG export captures the playhead and excludes animation", async ({ page }) => {
  await page.goto("lab/motion-studio/");
  await page.getByRole("checkbox", { name: "Animated", exact: true }).uncheck();
  await page.getByRole("slider", { name: "Animation playhead", exact: true }).press("End");
  await expect(page.getByRole("slider", { name: "Animation playhead", exact: true })).toHaveValue("4");
  const code = await page.getByRole("region", { name: "Generated code", exact: true }).textContent();
  const snapshot = await page.evaluate((source) => {
    const svg = new DOMParser().parseFromString(source || "", "image/svg+xml");
    const circle = svg.querySelector("svg > g");
    return { errors: svg.querySelectorAll("parsererror").length, animations: svg.querySelectorAll("animate,animateTransform").length, position: circle?.getAttribute("transform"), rotation: circle?.querySelector("g")?.getAttribute("transform") };
  }, code);
  expect(snapshot).toEqual({ errors: 0, animations: 0, position: "translate(180 180)", rotation: "rotate(360)" });
  await page.getByRole("combobox", { name: "Export format", exact: true }).selectOption("tsx");
  await expect(page.getByRole("region", { name: "Generated code", exact: true })).toContainText("export default function MotionComposition()");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export file", exact: true }).click();
  expect((await download).suggestedFilename()).toBe("shashen-motion.tsx");
});
