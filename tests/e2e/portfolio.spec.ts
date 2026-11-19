import { expect, test, type Page } from "@playwright/test";

const errors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const messages: string[] = [];
  errors.set(page, messages);
  page.on("pageerror", error => messages.push(error.message));
  page.on("console", message => { if (message.type() === "error") messages.push(message.text()); });
});
test.afterEach(async ({ page }) => { expect(errors.get(page), "No browser errors").toEqual([]); });

test("homepage preserves the real portrait, project filtering, and accessible project dialogs", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Shashen");
  const portrait = page.getByRole("img", { name: "Shashen Nethmika", exact: true }).first();
  await expect(portrait).toBeVisible();
  await expect.poll(() => portrait.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  await expect(portrait).toHaveAttribute("src", /\/portfolio-website\/images\/profile\.webp/);
  await expect(page.getByRole("button", { name: /(Vesak|Sinhala|Study|Weather|FilmPotha|Shashen)/ })).toHaveCount(6);
  await page.getByRole("button", { name: "Creative UI", exact: true }).click();
  await expect(page.getByRole("button", { name: "Creative UI", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: /(Vesak|Sinhala|Study|Weather|FilmPotha|Shashen)/ })).toHaveCount(3);
  await expect(page.getByRole("button", { name: /Vesak Card Generator$/ })).toHaveCount(0);
  await page.getByRole("button", { name: "All work", exact: true }).click();
  const opener = page.getByRole("button", { name: /Vesak Card Generator$/ });
  await opener.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { name: /Vesak Card Generator$/ })).toBeVisible();
  await expect(dialog.getByRole("link", { name: "View on GitHub" })).toHaveAttribute("href", "https://github.com/ShashenNethmika/Vesak-Card-Generator");
  await dialog.getByRole("button", { name: "amber", exact: true }).click();
  await expect(dialog.getByRole("button", { name: "amber", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
});

test("responsive navigation reaches the Lab and the original contact alias", async ({ page, isMobile }) => {
  await page.goto("./");
  if (isMobile) {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await expect(page.getByRole("button", { name: "Close navigation" })).toHaveAttribute("aria-expanded", "true");
    await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "The Lab", exact: true }).click();
    await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toHaveCount(0);
  } else {
    await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "The Lab", exact: true }).click();
  }
  await expect(page).toHaveURL(/\/portfolio-website\/lab\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("The Lab");
  await page.goto("pages/contact.html");
  await expect(page.getByRole("link", { name: "WhatsApp", exact: true })).toHaveAttribute("href", "https://wa.me/94740066592");
  await expect(page.getByRole("link", { name: "Open email app" })).toHaveAttribute("href", "mailto:iamshashennethmika@gmail.com");
});

test("Lab search, categories, pinned saves and history work", async ({ page }) => {
  await page.goto("lab/");
  await expect(page.getByRole("link", { name: /^Launch (Logic|Binary|Particle|Glass|Network|Motion)/ })).toHaveCount(6);
  await page.getByRole("textbox", { name: "Search experiments" }).fill("packet");
  await expect(page.getByRole("heading", { level: 2, name: "Network & Data Flow", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Logic Circuit Studio", exact: true })).toHaveCount(0);
  await page.getByRole("textbox", { name: "Search experiments" }).clear();
  await page.getByRole("combobox", { name: "Experiment category" }).selectOption("Networking");
  await expect(page.getByRole("link", { name: /^Launch (Logic|Binary|Particle|Glass|Network|Motion)/ })).toHaveCount(1);
  await page.getByRole("combobox", { name: "Experiment category" }).selectOption("All experiments");
  await page.getByRole("button", { name: "Pin Glass & UI Generator", exact: true }).click();
  await page.getByRole("button", { name: "Saved experiments", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Glass & UI Generator", exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Saved experiments", exact: true }).click();
  await expect(page.getByRole("button", { name: "Unpin Glass & UI Generator", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("link", { name: "Launch Glass & UI Generator", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Glass & UI Generator");
  await page.getByRole("link", { name: "All experiments", exact: true }).click();
  await page.getByRole("button", { name: "Recently used", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Glass & UI Generator", exact: true })).toBeVisible();
});

test("contact copies the preserved email address", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("contact/");
  await page.getByRole("button", { name: "Copy email", exact: true }).click();
  await expect(page.getByRole("button", { name: "Email copied", exact: true })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("iamshashennethmika@gmail.com");
  await expect(page.getByRole("link", { name: "LinkedIn linkedin.com", exact: true })).toHaveAttribute("href", "https://www.linkedin.com/in/shashennethmika/");
});
