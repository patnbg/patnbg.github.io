import { expect, test } from "@playwright/test";

async function prepareVisual(page) {
  await page.goto("/");
  const isBooting = await page.locator("body").evaluate((body) => body.classList.contains("is-booting"));
  if (isBooting) {
    await page.getByRole("button", { name: /skip boot/i }).focus();
    await page.keyboard.press("Escape");
  }
  await expect(page.locator("body")).toHaveClass(/is-ready/);
  await page.evaluate(async () => {
    document.querySelector("#local-time").textContent = "21:09:09";
    document.body.dataset.visualTest = "true";
    await document.fonts.ready;
  });
}

test("terminal shell matches the approved visual", async ({ page }, testInfo) => {
  test.skip(!["desktop", "mobile", "compact"].includes(testInfo.project.name), "Chromium owns visual baselines.");
  await prepareVisual(page);
  await expect(page).toHaveScreenshot("terminal-shell.png", { fullPage: true });
});

test("reduced-motion terminal matches the approved visual", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One reduced-motion baseline is sufficient.");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await prepareVisual(page);
  await expect(page).toHaveScreenshot("terminal-shell-reduced.png", { fullPage: true });
});
