import { defineConfig, devices } from "@playwright/test";

const ciProjects = process.env.CI
  ? [
      {
        name: "firefox",
        use: {
          ...devices["Desktop Firefox"],
          viewport: { width: 1440, height: 960 },
        },
      },
      {
        name: "webkit",
        use: {
          ...devices["Desktop Safari"],
          viewport: { width: 1440, height: 960 },
        },
      },
    ]
  : [];

export default defineConfig({
  testDir: "./tests",
  outputDir: "./test-results",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  ...(process.env.CI ? { workers: 2 } : {}),
  reporter: [["list"], ["html", { open: "never" }]],
  expect: {
    toHaveScreenshot: {
      animations: "disabled",
      maxDiffPixelRatio: 0.005,
    },
  },
  snapshotPathTemplate:
    "{testDir}/__screenshots__/{testFilePath}/{platform}/{projectName}/{arg}{ext}",
  use: {
    baseURL: "http://127.0.0.1:4173",
    colorScheme: "light",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 960 },
      },
    },
    {
      name: "mobile",
      use: {
        ...devices["Pixel 7"],
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: "compact",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 320, height: 700 },
      },
    },
    ...ciProjects,
  ],
  webServer: {
    command: "bun run preview",
    reuseExistingServer: false,
    timeout: 120_000,
    url: "http://127.0.0.1:4173",
  },
});
