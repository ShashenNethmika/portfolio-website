import { expect, test, type Locator, type Page } from "@playwright/test";

const errors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const messages: string[] = [];
  errors.set(page, messages);
  page.on("pageerror", error => messages.push(error.message));
  page.on("console", message => { if (message.type() === "error") messages.push(message.text()); });
});
test.afterEach(async ({ page }) => { expect(errors.get(page), "No browser errors").toEqual([]); });

async function setRange(range: Locator, value: string) {
  const min = Number(await range.getAttribute("min") || 0);
  const step = Number(await range.getAttribute("step") || 1);
  const max = Number(await range.getAttribute("max") || 100);
  await range.press("Home");
  // Use the native coarse keyboard gesture, then fine-tune the exact value.
  for(let i=0;i<Math.floor((Number(value)-min)/Math.max(step,(max-min)/10));i++)await range.press('PageUp');
  const remaining=Math.round((Number(value)-Number(await range.inputValue()))/step);
  for(let i=0;i<Math.abs(remaining);i++)await range.press(remaining>0?'ArrowRight':'ArrowLeft');
  await expect(range).toHaveValue(value);
}

test("logic builder calculates and connects actual multi-gate circuits", async ({ page }) => {
  await page.goto("lab/logic-circuit/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Logic Circuit Studio");
  await expect(page.getByRole("button", { name: /^Toggle A:/ })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: /^Toggle B:/ }).click();
  await expect(page.getByRole("button", { name: /^Toggle A:/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText(/Circuit valid\. All components are connected/)).toBeVisible();
  await expect(page.getByRole("table").locator("tbody tr").last().locator("td")).toHaveText(["1", "1", "1"]);
  await page.getByRole("combobox", { name: "Component to add", exact: true }).selectOption("NOT");
  await page.getByRole("button", { name: "Add component", exact: true }).click();
  await page.getByRole("combobox", { name: "NOT 1 input 1 source", exact: true }).selectOption({ label: "AND 1" });
  await expect(page.getByText(/NOT 1: NOT \[1\] = 0/)).toBeVisible();
  await page.getByLabel("Experiment name", { exact: true }).fill("Playwright connected circuit");
  await page.getByRole("button", { name: "Save circuit", exact: true }).click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("shashen.logic.v1") || "[]")[0].circuit.nodes.some((node: {kind: string}) => node.kind === "NOT"))).toBe(true);
  await page.getByRole("button", { name: "Reset circuit", exact: true }).click();
  await page.getByRole("button", { name: "Browse saved", exact: true }).click();
  await page.getByRole("button", { name: "Load circuit", exact: true }).click();
  await expect(page.getByRole("button", { name: "Move NOT 1", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Move NOT 1", exact: true }).focus();
  const before = await page.getByRole("button", { name: "Move NOT 1", exact: true }).boundingBox();
  await page.keyboard.press("ArrowRight");
  const after = await page.getByRole("button", { name: "Move NOT 1", exact: true }).boundingBox();
  expect(after!.x - before!.x).toBe(10);
});

test("binary explorer handles 32-bit unsigned, signed two's complement, and saved registers", async ({ page }) => {
  await page.goto("lab/binary-explorer/");
  await expect(page.getByTestId("a-decimal")).toHaveText("43");
  await expect(page.getByTestId("a-hexadecimal")).toHaveText(/2B/);
  await page.getByRole("combobox", { name: "Bit width" }).selectOption("32");
  await page.getByLabel("Set A from decimal, binary, hex, or octal", { exact: true }).fill("4294967295");
  await page.getByRole("button", { name: "Set A", exact: true }).click();
  await expect(page.getByTestId("a-decimal")).toHaveText("4294967295");
  await page.getByRole("checkbox", { name: "Signed interpretation" }).check();
  await expect(page.getByTestId("a-decimal")).toHaveText("-1");
  await page.getByRole("button", { name: "Increment A", exact: true }).click();
  await expect(page.getByTestId("a-decimal")).toHaveText("0");
  await page.getByRole("button", { name: "Save experiment", exact: true }).click();
  await page.getByRole("button", { name: "Set all A", exact: true }).click();
  await expect(page.getByTestId("a-decimal")).toHaveText("-1");
  await page.getByRole("button", { name: "Load experiment", exact: true }).click();
  await expect(page.getByTestId("a-decimal")).toHaveText("0");
  await page.getByLabel("Set A from decimal, binary, hex, or octal", { exact: true }).fill("4294967296");
  await page.getByRole("button", { name: "Set A", exact: true }).click();
  await expect(page.locator("#error-A")).toContainText("Allowed range");
});

test("particle sandbox respects reduced motion, updates controls, and persists a setup", async ({ page }) => {
  await page.goto("lab/particle-sandbox/");
  await expect(page.getByRole("button", { name: "Resume simulation", exact: true })).toBeVisible();
  await setRange(page.getByRole("slider", { name: /Gravity/ }), "4");
  await page.getByRole("button", { name: "Violet", exact: true }).click();
  await expect(page.getByRole("button", { name: "Violet", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Save setup", exact: true }).click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("shashen-lab-particle-v1") || "{}").settings.gravity)).toBe(4);
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page.getByRole("button", { name: "Load setup", exact: true }).click();
  await expect(page.getByRole("slider", { name: /Gravity/ })).toHaveValue("4");
  await page.getByRole("button", { name: "Resume simulation", exact: true }).click();
  await expect(page.getByRole("button", { name: "Pause simulation", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Shockwave", exact: true }).click();
  const canvas = page.getByRole("img", { name: /Interactive particle field/ });
  await canvas.click({ position: { x: 80, y: 80 } });
  await page.getByRole("button", { name: "Pause simulation", exact: true }).click();
  await expect(page.getByRole("button", { name: "Resume simulation", exact: true })).toBeVisible();
});

test("glass exports reflect the live preview and custom presets survive reload", async ({ page }) => {
  await page.goto("lab/glass-studio/");
  await setRange(page.getByRole("slider", { name: /Backdrop blur/ }), "31");
  await setRange(page.getByRole("slider", { name: /Border thickness/ }), "3");
  await expect(page.getByTestId("glass-preview")).toHaveCSS("backdrop-filter", "blur(31px)");
  await expect(page.getByTestId("glass-preview")).toHaveCSS("border-top-width", "3px");
  await expect(page.getByLabel("Generated CSS", { exact: true })).toContainText("backdrop-filter: blur(31px)");
  await page.getByRole("button", { name: "CSS variables", exact: true }).click();
  await expect(page.getByLabel("Generated CSS variables", { exact: true })).toContainText("--glass-backdrop-filter: blur(31px)");
  await page.getByRole("button", { name: "React TSX", exact: true }).click();
  await expect(page.getByLabel("Generated React TSX", { exact: true })).toContainText('"backdropFilter": "blur(31px)"');
  await page.getByLabel("Custom preset name", { exact: true }).fill("Browser verified glass");
  await page.getByRole("button", { name: "Save preset on this device", exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: "Browser verified glass", exact: true }).click();
  await expect(page.getByRole("slider", { name: /Backdrop blur/ })).toHaveValue("31");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export", exact: true }).click();
  expect((await download).suggestedFilename()).toBe("glass.css");
});

test("network studio calculates subnet boundaries, validates input, and sends a simulated packet", async ({ page }) => {
  await page.goto("lab/network-studio/");
  const calculator = page.getByRole("region", { name: "IP address calculator" });
  await calculator.getByLabel("IPv4 address", { exact: true }).fill("192.168.10.91");
  await calculator.getByLabel("CIDR prefix", { exact: true }).fill("26");
  await expect(calculator).toContainText("192.168.10.64/26");
  await expect(calculator).toContainText("192.168.10.127");
  await expect(calculator).toContainText("255.255.255.192");
  await calculator.getByLabel("IPv4 address", { exact: true }).fill("999.1.1.1");
  await expect(calculator.getByRole("alert")).toBeVisible();
  await calculator.getByLabel("IPv4 address", { exact: true }).fill("192.168.10.91");
  await page.getByRole("button", { name: "Send packet", exact: true }).click();
  await expect(page.getByText(/Hop 1 \/ /)).toBeVisible();
  await page.getByRole("button", { name: "Next hop", exact: true }).click();
  await expect(page.getByText(/Hop 2 \/ /)).toBeVisible();
  await page.getByRole("button", { name: "+ computer", exact: true }).click();
  await page.getByRole("button", { name: "Save topology", exact: true }).click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("portfolio.network.v1") || "{}").devices.length)).toBeGreaterThan(4);
  await page.getByLabel("Your answer", { exact: true }).fill("192.168.10.64");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.getByText(/^Correct\. Six host bits/)).toBeVisible();
});

test("motion studio creates shapes, captures keys, and exports valid SVG", async ({ page }) => {
  await page.goto("lab/motion-studio/");
  await page.getByRole("button", { name: "+ triangle", exact: true }).click();
  await expect(page.getByRole("combobox", { name: "Layers", exact: true }).locator("option")).toHaveCount(4);
  await page.getByRole("button", { name: "spin", exact: true }).click();
  await setRange(page.getByRole("slider", { name: "Animation playhead", exact: true }), "2");
  await expect(page.getByRole("slider", { name: /Rotation/ })).toHaveValue("180");
  await page.getByRole("button", { name: "Add keyframe here", exact: true }).click();
  await expect(page.getByRole("button", { name: "2.00s", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Save composition", exact: true }).click();
  const generated = page.getByLabel("Generated code", { exact: true });
  const svg = await generated.textContent();
  expect(await page.evaluate(source => {
    const doc = new DOMParser().parseFromString(source || "", "image/svg+xml");
    return { errors: doc.querySelectorAll("parsererror").length, shapes: doc.querySelectorAll("polygon").length, animations: doc.querySelectorAll("animateTransform").length };
  }, svg)).toEqual({ errors: 0, shapes: 1, animations: 9 });
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export file", exact: true }).click();
  expect((await download).suggestedFilename()).toMatch(/\.svg$/);
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page.getByRole("button", { name: "Load saved", exact: true }).click();
  await expect(page.getByRole("combobox", { name: "Layers", exact: true }).locator("option")).toHaveCount(4);
});
