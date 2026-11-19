import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const pages = [
  ["./", "Shashen"], ["about/", "The person behind the pixels"], ["projects/", "Selected work"],
  ["lab/", "The Lab"], ["contact/", "conversation"], ["pages/lab.html", "The Lab"], ["pages/contact.html", "conversation"],
  ["lab/logic-circuit/", "Logic Circuit Studio"], ["lab/binary-explorer/", "Binary & Digital Systems"],
  ["lab/particle-sandbox/", "Particle & Wave Sandbox"], ["lab/glass-studio/", "Glass & UI Generator"],
  ["lab/network-studio/", "Network & Data Flow"], ["lab/motion-studio/", "Motion & SVG Studio"],
] as const;

for (const [path, heading] of pages) {
  test(`WCAG 2.2 AA automated audit: ${path}`, async ({ page }, testInfo) => {
    const response = await page.goto(path);
    expect(response?.ok(), "Route responds successfully").toBe(true);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(heading);
    if (path.startsWith("lab/") && path !== "lab/") await expect(page.getByText("Preparing your workspace…", { exact: true })).toHaveCount(0);
    await page.evaluate(() => document.fonts.ready);
    const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    await testInfo.attach("axe-results", { body: JSON.stringify(result, null, 2), contentType: "application/json" });
    expect(result.violations.map(violation => ({ id: violation.id, impact: violation.impact, description: violation.description, nodes: violation.nodes.map(node => ({ target: node.target, summary: node.failureSummary })) }))).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), "No page-wide horizontal overflow").toBe(true);
  });
}
