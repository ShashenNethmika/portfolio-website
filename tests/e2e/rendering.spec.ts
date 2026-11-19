import { expect, test, type Page } from "@playwright/test";

const errors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const messages: string[] = [];
  errors.set(page, messages);
  page.on("pageerror", error => messages.push(error.message));
  page.on("console", message => { if (message.type() === "error") messages.push(message.text()); });
});
test.afterEach(async ({ page }) => { expect(errors.get(page), "No browser errors with motion enabled").toEqual([]); });

test("normal-motion hero lazily starts WebGL or keeps its accessible fallback", async ({ page }) => {
  await page.goto("./");
  const supported = await page.evaluate(() => {
    try {
      const context = document.createElement("canvas").getContext("webgl2");
      if (!context) return false;
      context.getExtension("WEBGL_lose_context")?.loseContext();
      return true;
    } catch { return false; }
  });
  await expect(page.getByRole("img", { name: "Shashen Nethmika", exact: true }).first()).toBeVisible();
  if (supported) {
    const canvas = page.locator("#hero canvas");
    await expect(canvas).toBeVisible({ timeout: 20_000 });
    expect(await canvas.evaluate((element: HTMLCanvasElement) => element.width > 0 && element.height > 0)).toBe(true);
    await page.mouse.move(200, 250);
    await page.mouse.move(700, 350);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Shashen");
  } else {
    // The hero requests the optional WebGL module after 1.8 seconds.
    await page.waitForTimeout(2500);
    await expect(page.locator("#hero canvas")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Explore The Lab", exact: true })).toBeVisible();
  }
});

test("particle frames advance only while visible and running", async ({ page }) => {
  await page.addInitScript(() => {
    const target = window as Window & { __particleDraws: number };
    target.__particleDraws = 0;
    const original = CanvasRenderingContext2D.prototype.fillRect;
    CanvasRenderingContext2D.prototype.fillRect = function (this: CanvasRenderingContext2D, ...args: Parameters<typeof original>) {
      if (this.canvas.getAttribute("aria-label")?.startsWith("Interactive particle field")) target.__particleDraws++;
      return original.apply(this, args);
    };
  });
  const draws = () => page.evaluate(() => (window as Window & { __particleDraws: number }).__particleDraws);
  await page.goto("lab/particle-sandbox/");
  const canvas = page.getByRole("img", { name: /Interactive particle field/ });
  await expect(page.getByRole("button", { name: "Pause simulation", exact: true })).toBeVisible();
  await canvas.scrollIntoViewIfNeeded();
  const started = await draws();
  await page.waitForTimeout(300);
  expect(await draws(), "The visible, running field draws new frames").toBeGreaterThan(started + 1);

  await page.getByRole("button", { name: "Pause simulation", exact: true }).click();
  await expect(page.getByRole("button", { name: "Resume simulation", exact: true })).toBeVisible();
  await page.waitForTimeout(150);
  const paused = await draws();
  await page.waitForTimeout(300);
  expect(await draws(), "Pausing cancels recurring canvas draws").toBe(paused);

  await page.getByRole("button", { name: "Resume simulation", exact: true }).click();
  const viewport = page.viewportSize()!;
  await page.setViewportSize({ width: viewport.width, height: 240 });
  await canvas.scrollIntoViewIfNeeded();
  const resumed = await draws();
  await expect.poll(draws, { message: "Resuming restarts rendering", timeout: 5000 }).toBeGreaterThan(resumed + 1);

  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
  await expect.poll(() => canvas.evaluate(element => { const r = element.getBoundingClientRect(); return r.bottom <= 0 || r.top >= innerHeight; }), { message: "Canvas is completely outside the viewport" }).toBe(true);
  await page.waitForTimeout(150);
  const offscreen = await draws();
  await page.waitForTimeout(300);
  expect(await draws(), "An offscreen field does not keep rendering").toBe(offscreen);

  await canvas.scrollIntoViewIfNeeded();
  await expect.poll(draws, { message: "Returning to the field restarts frames", timeout: 5000 }).toBeGreaterThan(offscreen + 1);
});
