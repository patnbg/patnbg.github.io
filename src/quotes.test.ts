import { describe, expect, test } from "bun:test";
import { dailyQuoteForTimestamp, quotes } from "./quotes";

const SEPTEMBER_4_2026_MIDNIGHT_UTC = 1_788_480_000_000;
const SEPTEMBER_4_2026_NOON_UTC = 1_788_523_200_000;

describe("dailyQuoteForTimestamp", () => {
  test("selects a known quote and formats its UTC calendar date", () => {
    expect(dailyQuoteForTimestamp(SEPTEMBER_4_2026_NOON_UTC)).toEqual({
      date: {
        day: "04",
        iso: "2026-09-04",
        month: "SEP",
        weekday: "Friday",
        year: "2026",
      },
      quote: quotes[1],
    });
  });

  test("keeps the same quote for the complete UTC day", () => {
    const firstMillisecond = dailyQuoteForTimestamp(SEPTEMBER_4_2026_MIDNIGHT_UTC);
    const lastMillisecond = dailyQuoteForTimestamp(SEPTEMBER_4_2026_MIDNIGHT_UTC + 86_400_000 - 1);

    expect(firstMillisecond.quote).toBe(lastMillisecond.quote);
    expect(firstMillisecond.date).toEqual(lastMillisecond.date);
  });

  test("advances at the next UTC midnight", () => {
    const friday = dailyQuoteForTimestamp(SEPTEMBER_4_2026_MIDNIGHT_UTC);
    const saturday = dailyQuoteForTimestamp(SEPTEMBER_4_2026_MIDNIGHT_UTC + 86_400_000);

    expect(saturday.quote).toBe(quotes[2]);
    expect(saturday.quote).not.toBe(friday.quote);
    expect(saturday.date.iso).toBe("2026-09-05");
  });

  test("wraps safely for timestamps before the Unix epoch", () => {
    const previousDay = dailyQuoteForTimestamp(-1);

    expect(previousDay.quote).toBe(quotes[6]);
    expect(previousDay.date.iso).toBe("1969-12-31");
  });
});

test("every bundled quote has complete credit information", () => {
  for (const quote of quotes) {
    expect(quote.text.trim().length).toBeGreaterThan(0);
    expect(quote.author.trim().length).toBeGreaterThan(0);
    expect(quote.source.trim().length).toBeGreaterThan(0);
  }
});
