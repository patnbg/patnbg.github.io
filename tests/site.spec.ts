import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { quotes } from "../src/quotes";

const FIXED_TIME = 1_788_523_200_000;

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(FIXED_TIME);
  await page.goto("/");
});

test("renders the Effect-selected daily quote", async ({ page }) => {
  await expect(page).toHaveTitle("Daily Detour");
  await expect(page.getByRole("heading", { level: 1, name: "Daily Detour" })).toBeVisible();

  const date = page.locator("time");
  await expect(date).toHaveAttribute("datetime", "2026-09-04");
  await expect(date).toContainText("Friday");
  await expect(date).toContainText("04");
  await expect(date).toContainText("SEP / 2026");

  const quote = page.getByRole("blockquote");
  await expect(quote).toContainText(
    "I love deadlines. I love the whooshing noise they make as they go by.",
  );
  await expect(quote).toContainText("Douglas Adams");
  await expect(quote).toContainText("The Salmon of Doubt");
  await expect(page.locator(".calendar__footer")).toContainText("Reload after midnight UTC");
});

test("loads without browser errors or horizontal overflow", async ({ page }, testInfo) => {
  const browserErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      browserErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => browserErrors.push(error.message));

  await page.reload();
  await expect(page.getByRole("blockquote")).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );

  expect(hasHorizontalOverflow, `${testInfo.project.name} should not overflow horizontally`).toBe(
    false,
  );
  expect(browserErrors).toEqual([]);
});

for (const textScale of [100, 200]) {
  test(`keeps every bundled quote inside the calendar at ${textScale}% text size`, async ({
    page,
  }, testInfo) => {
    test.skip(!["compact", "mobile"].includes(testInfo.project.name), "Check the narrow layouts.");
    await page.emulateMedia({ reducedMotion: "reduce" });

    /* oxlint-disable eslint/no-await-in-loop -- Each iteration reuses the same page and clock. */
    for (let dayOffset = 0; dayOffset < quotes.length; dayOffset += 1) {
      await page.clock.setFixedTime(FIXED_TIME + dayOffset * 86_400_000);
      await page.reload();
      await page.addStyleTag({ content: `html { font-size: ${textScale}% }` });
      await expect(page.getByRole("blockquote")).toBeVisible();
      await page.evaluate(() => document.fonts.ready);

      const layout = await page.evaluate(() => {
        const quote = document.querySelector(".quote > p");
        const credit = document.querySelector(".quote__credit");
        const calendarFooter = document.querySelector(".calendar__footer");
        const sheet = document.querySelector(".calendar__sheet");

        if (quote === null || credit === null || calendarFooter === null || sheet === null) {
          return null;
        }

        const quoteBounds = quote.getBoundingClientRect();
        const creditBounds = credit.getBoundingClientRect();
        const footerBounds = calendarFooter.getBoundingClientRect();
        const sheetBounds = sheet.getBoundingClientRect();
        const viewportWidth = document.documentElement.clientWidth;
        // Ranges include text overflowing its element, even when an ancestor clips it.
        const textFits = Array.from(
          document.querySelectorAll(
            ".calendar__title, .calendar__edition, .quote > p, time, .date-stamp__instruction, .quote__credit, .calendar__footer",
          ),
        ).every((element) => {
          const range = document.createRange();
          range.selectNodeContents(element);
          return Array.from(range.getClientRects()).every(
            (bounds) =>
              bounds.left >= Math.max(0, sheetBounds.left) &&
              bounds.right <= Math.min(viewportWidth, sheetBounds.right),
          );
        });

        return {
          creditBottom: creditBounds.bottom,
          creditTop: creditBounds.top,
          footerTop: footerBounds.top,
          hasHorizontalOverflow:
            document.documentElement.scrollWidth > document.documentElement.clientWidth,
          quoteBottom: quoteBounds.bottom,
          textFits,
        };
      });

      expect(layout).not.toBeNull();
      expect(layout?.hasHorizontalOverflow).toBe(false);
      expect(layout?.textFits).toBe(true);
      expect(layout?.quoteBottom).toBeLessThanOrEqual(layout?.creditTop ?? 0);
      expect(layout?.creditBottom).toBeLessThanOrEqual(layout?.footerTop ?? 0);
    }
    /* oxlint-enable eslint/no-await-in-loop */
  });
}

test("has no automatically detectable accessibility violations", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One browser run is sufficient for axe.");

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("removes the entrance animation when reduced motion is requested", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "The media query is browser-independent.");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();

  await expect(page.locator(".calendar")).toHaveCSS("animation-name", "none");
});

test("keeps a useful quote available without JavaScript", async ({
  browser,
  baseURL,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One no-JavaScript check is sufficient.");

  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(baseURL ?? "/");

  await expect(page.getByText("Daily Detour", { exact: true })).toBeVisible();
  await expect(page.getByRole("blockquote")).toContainText("I love deadlines");
  const note = page.locator(".no-script__note");
  await expect(note).toBeVisible();
  await expect(note).toHaveText("JavaScript is off, so this one is staying put.");

  await context.close();
});
