import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://127.0.0.1:4173/portfolio-website/";
const channel = process.env.PLAYWRIGHT_CHANNEL || (process.platform === "win32" ? "msedge" : undefined);

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  outputDir: "test-results",
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL,
    reducedMotion: "reduce",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    actionTimeout: 10_000,
  },
  projects: [
    { name: "desktop-edge", use: { ...devices["Desktop Edge"], channel, viewport: { width: 1440, height: 1000 } } },
    { name: "mobile-edge", use: { ...devices["Pixel 7"], channel, browserName: "chromium", viewport: { width: 390, height: 844 } } },
  ],
  webServer: {
    command: "node scripts/serve.mjs",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
