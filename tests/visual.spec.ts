import { expect, test } from "@playwright/test";

const FIXED_TIME = 1_788_523_200_000;

test("matches the daily calendar artwork", async ({ page }, testInfo) => {
  test.skip(
    !["desktop", "mobile"].includes(testInfo.project.name),
    "Visual baselines cover the primary layouts.",
  );

  await page.clock.setFixedTime(FIXED_TIME);
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);

  await expect(page).toHaveScreenshot("daily-detour.png", { fullPage: true });
});

test("matches the reduced-motion artwork", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One reduced-motion baseline is sufficient.");

  await page.clock.setFixedTime(FIXED_TIME);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);

  await expect(page).toHaveScreenshot("daily-detour-reduced.png", { fullPage: true });
});
