/** Capture genuine deployed project UIs. Never substitute generated artwork for failed captures. */
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const projects = [
  { slug: "vesak-card-generator", repo: "Vesak-Card-Generator", title: "Vesak Card Generator", ready: "#card-image", tree: "2f00b2aa034ae4073e8a2c2a7722fadb35bef21f" },
  { slug: "new-year-wish", repo: "Sinhala-and-Tamil-New-Year-Wish", title: "New Year Wish By Shashen", ready: "#nameInput", tree: "eef0694809c57a1d02fb67e8b5cbc1fc1f852caf" },
  { slug: "study-buddy-timer", repo: "Study-Buddy-Timer", title: "Study Buddy Timer", ready: "#main-header", tree: "ef5d2d014d92aceedacbfe1b371e7aba22c7bc2a" },
  { slug: "weather-forecast", repo: "Weather-Forecast", title: "Weather Forecast", ready: "#location-input", tree: "4b4d03282be735a5d5f8547c463eb0c91f91da26" },
  { slug: "filmpotha", repo: "FilmPotha", title: "Film Potha - Movie & TV Series Search", ready: "#home-title", tree: "6d33a5f080b477c4e4ca72728af2aeb942a18ce8" },
];

const folder = path.resolve("public/images/projects");
await mkdir(folder, { recursive: true });
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || (process.platform === "win32" ? "msedge" : undefined), headless: true });
const records: Record<string, unknown>[] = [];
try {
  for (const project of projects) {
    const url = `https://shashennethmika.github.io/${project.repo}/`;
    const page = await browser.newPage({ viewport: { width: 1280, height: 850 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
    try {
      const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 });
      if (!response?.ok()) throw new Error(`Live demo returned HTTP ${response?.status() ?? "no response"}.`);
      await page.locator(project.ready).waitFor({ state: "visible", timeout: 20_000 });
      if (await page.title() !== project.title) throw new Error(`Unexpected page title: ${await page.title()}`);
      await page.waitForLoadState("load", { timeout: 20_000 });
      await page.evaluate(() => Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 5000))]));
      if (project.slug === "filmpotha") await page.locator(".movie-card").first().waitFor({ state: "visible", timeout: 20_000 });
      await page.waitForFunction(() => [...document.images].filter(img => {
        const r = img.getBoundingClientRect();
        return r.height > 0 && r.width > 0 && r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
      }).every(img => img.complete && img.naturalWidth > 0), undefined, { timeout: 15_000 });
      const checks = await page.evaluate(() => ({
        text: document.body.innerText,
        styled: [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].some(link => link.href.includes("style.css") && Boolean(link.sheet)),
        brokenImages: [...document.images].filter(img => { const r = img.getBoundingClientRect(); return r.height > 0 && r.bottom > 0 && r.top < window.innerHeight && (!img.complete || img.naturalWidth === 0); }).map(img => img.src),
      }));
      if (!checks.styled || checks.text.length < 100 || /There isn't a GitHub Pages site here|404 File not found/.test(checks.text)) throw new Error("The live demo is not a verified, styled project page.");
      if (checks.brokenImages.length) throw new Error(`Visible project images failed to load: ${checks.brokenImages.length}`);
      const actions: string[] = [];
      if (project.slug === "new-year-wish") {
        await page.locator("#nameInput").fill("Shashen Nethmika");
        await page.getByRole("button", { name: "Generate Custom Wish Card", exact: true }).click();
        await page.locator("#wishCanvas.showCard").waitFor({ state: "visible" });
        if (!await page.locator("#wishCanvas").evaluate((canvas: HTMLCanvasElement) => canvas.width > 300 && canvas.height > 300)) throw new Error("The generated wish canvas is empty.");
        actions.push("Entered the portfolio owner's name and generated the real wish card using the deployed application's button.");
      }
      await page.screenshot({ path: path.join(folder, `${project.slug}.png`), fullPage: false, animations: "disabled" });
      records.push({ slug: project.slug, source: url, repository: `https://github.com/ShashenNethmika/${project.repo}`, inspectedTree: project.tree, title: await page.title(), file: `public/images/projects/${project.slug}.png`, viewport: "1280 × 850", actions, capturedAt: new Date().toISOString(), status: "captured" });
      process.stdout.write(`Captured ${project.repo}\n`);
    } catch (error) {
      records.push({ slug: project.slug, source: url, status: "not captured", reason: error instanceof Error ? error.message : String(error) });
      process.stderr.write(`Skipped ${project.repo}: ${error instanceof Error ? error.message : String(error)}\n`);
    } finally { await page.close(); }
  }
} finally { await browser.close(); }
await writeFile(path.resolve("docs/project-capture-manifest.json"), JSON.stringify(records, null, 2) + "\n");
if (records.some(record => record.status !== "captured")) process.exitCode = 1;
