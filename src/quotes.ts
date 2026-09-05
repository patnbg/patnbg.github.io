import * as Clock from "effect/Clock";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";

const MILLISECONDS_PER_DAY = 86_400_000;

export interface Quote {
  readonly text: string;
  readonly author: string;
  readonly source: string;
}

export interface CalendarDate {
  readonly day: string;
  readonly iso: string;
  readonly month: string;
  readonly weekday: string;
  readonly year: string;
}

export interface DailyQuote {
  readonly date: CalendarDate;
  readonly quote: Quote;
}

export const quotes = [
  {
    text: "I like work: it fascinates me. I can sit and look at it for hours.",
    author: "Jerome K. Jerome",
    source: "Three Men in a Boat",
  },
  {
    text: "I love deadlines. I love the whooshing noise they make as they go by.",
    author: "Douglas Adams",
    source: "The Salmon of Doubt",
  },
  {
    text: "Outside of a dog, a book is man's best friend. Inside of a dog, it's too dark to read.",
    author: "Groucho Marx",
    source: "The Essential Groucho",
  },
  {
    text: "The trouble with having an open mind, of course, is that people will insist on coming along and trying to put things in it.",
    author: "Terry Pratchett",
    source: "Diggers",
  },
  {
    text: "I can resist everything except temptation.",
    author: "Oscar Wilde",
    source: "Lady Windermere's Fan",
  },
  {
    text: "Begin at the beginning, and go on till you come to the end: then stop.",
    author: "Lewis Carroll",
    source: "Alice's Adventures in Wonderland",
  },
  {
    text: "Quotation, n. The act of repeating erroneously the words of another.",
    author: "Ambrose Bierce",
    source: "The Devil's Dictionary",
  },
] as const satisfies readonly [Quote, ...Quote[]];

const padDatePart = (part: number): string => String(part).padStart(2, "0");

const quoteIndexForTimestamp = (timestamp: number): number => {
  const elapsedDays = Math.floor(timestamp / MILLISECONDS_PER_DAY);
  return ((elapsedDays % quotes.length) + quotes.length) % quotes.length;
};

export const dailyQuoteForTimestamp = (timestamp: number): DailyQuote => {
  const dateTime = DateTime.unsafeMake(timestamp);
  const parts = DateTime.toPartsUtc(dateTime);
  const quote = quotes[quoteIndexForTimestamp(timestamp)] ?? quotes[0];

  return {
    date: {
      day: padDatePart(parts.day),
      iso: `${parts.year}-${padDatePart(parts.month)}-${padDatePart(parts.day)}`,
      month: DateTime.formatUtc(dateTime, { locale: "en", month: "short" }).toUpperCase(),
      weekday: DateTime.formatUtc(dateTime, { locale: "en", weekday: "long" }),
      year: String(parts.year),
    },
    quote,
  };
};

export const dailyQuote = Clock.currentTimeMillis.pipe(Effect.map(dailyQuoteForTimestamp));
