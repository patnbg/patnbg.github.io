import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function skipBoot(page) {
  const isBooting = await page.locator("body").evaluate((body) => body.classList.contains("is-booting"));
  if (isBooting) {
    await page.getByRole("button", { name: /skip boot/i }).focus();
    await page.keyboard.press("Escape");
  }
  await expect(page.locator("body")).toHaveClass(/is-ready/);
}

test("boots cleanly and acquires the next transmission", async ({ page }) => {
  const browserErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      browserErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => browserErrors.push(error.message));

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: /null.*star/i })).toBeVisible();
  await expect(page.locator(".terminal-shell")).toHaveJSProperty("inert", true);
  await skipBoot(page);
  await expect(page.locator("#main-content")).toBeFocused();
  await expect(page.locator(".terminal-shell")).toHaveJSProperty("inert", false);

  await page.getByRole("button", { name: /acquire next ghost/i }).click();

  await expect(page.locator("body")).toHaveAttribute("data-signal", "local-ghost");
  await expect(page.locator("#signal-code")).toHaveText("LC–14 / LOCAL GHOST");
  await expect(page.locator("#signal-announcement")).toContainText("Signal acquired");
  expect(browserErrors).toEqual([]);
});

test("scanner supports keyboard tuning and activation", async ({ page }) => {
  await page.goto("/");
  await skipBoot(page);

  const scanner = page.getByRole("button", { name: /signal scanner/i });
  await scanner.focus();
  await page.keyboard.press("ArrowRight");

  await expect(scanner).toHaveCSS("--scan-x", "54%");
  await page.keyboard.press("Enter");
  await expect(page.locator("body")).toHaveAttribute("data-signal", "local-ghost");
});

test("archive fragments retune the receiver", async ({ page }) => {
  await page.goto("/");
  await skipBoot(page);

  const lastLight = page.getByRole("button", { name: /last light/i });
  await lastLight.click();

  await expect(lastLight).toHaveClass(/is-active/);
  await expect(lastLight).toHaveAttribute("aria-current", "true");
  await expect(page.locator("body")).toHaveAttribute("data-signal", "last-light");
  await expect(page.locator("#signal-mood")).toHaveText("Amber forever");
});

test("pointer movement tunes the scanner without layout overflow", async ({ page }, testInfo) => {
  await page.goto("/");
  await skipBoot(page);

  const scanner = page.getByRole("button", { name: /signal scanner/i });
  await scanner.scrollIntoViewIfNeeded();
  const bounds = await scanner.boundingBox();
  expect(bounds).not.toBeNull();
  await page.mouse.move(bounds.x + bounds.width * 0.8, bounds.y + bounds.height * 0.25);

  await expect
    .poll(() => scanner.evaluate((element) => Number.parseFloat(element.style.getPropertyValue("--scan-x"))))
    .toBeCloseTo(80, 0);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    `${testInfo.project.name} should not overflow horizontally`,
  ).toBe(true);
});

test("touch dragging tunes without acquiring a signal", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Touch drag is covered by the mobile project.");
  await page.goto("/");
  await skipBoot(page);

  const scanner = page.getByRole("button", { name: /signal scanner/i });
  const bounds = await scanner.boundingBox();
  const start = { x: bounds.x + bounds.width * 0.3, y: bounds.y + bounds.height * 0.5 };
  const end = { x: bounds.x + bounds.width * 0.7, y: bounds.y + bounds.height * 0.5 };
  const pointer = { bubbles: true, isPrimary: true, pointerId: 7, pointerType: "touch" };

  await scanner.dispatchEvent("pointerdown", { ...pointer, clientX: start.x, clientY: start.y });
  await scanner.dispatchEvent("pointermove", { ...pointer, buttons: 1, clientX: end.x, clientY: end.y });
  await scanner.dispatchEvent("pointerup", { ...pointer, clientX: end.x, clientY: end.y });
  await scanner.dispatchEvent("click", { bubbles: true });

  await expect
    .poll(() => scanner.evaluate((element) => Number.parseFloat(element.style.getPropertyValue("--scan-x"))))
    .toBeCloseTo(70, 0);
  await expect(page.locator("body")).toHaveAttribute("data-signal", "blue-hour");
});

test("the core artwork remains available without JavaScript", async ({ browser, baseURL }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One no-JavaScript browser check is sufficient.");
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(baseURL);

  await expect(page.locator("body")).not.toHaveClass(/is-booting/);
  await expect(page.getByRole("heading", { level: 1, name: /null.*star/i })).toBeVisible();
  await expect(page.locator(".no-script")).toBeVisible();
  expect(await page.evaluate(() => getComputedStyle(document.body).overflowY)).not.toBe("hidden");
  await context.close();
});

test("legacy public URLs lead to the new artwork", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Redirect behavior is browser-independent.");
  await page.goto("/records.html");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1, name: /null.*star/i })).toBeVisible();
});

test("production serves the progressive boot script", async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One artifact check is sufficient.");
  const response = await request.get("/boot.js");
  expect(response.ok()).toBe(true);
  expect(await response.text()).toContain('classList.add("is-booting")');
});

test("rendered interface has no automatically detectable accessibility violations", async ({ page }) => {
  await page.goto("/");
  await skipBoot(page);

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
