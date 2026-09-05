import * as Effect from "effect/Effect";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { dailyQuote } from "./quotes";

const rootElement = document.querySelector<HTMLDivElement>("#root");

if (rootElement === null) {
  throw new TypeError("The application root is missing.");
}

const daily = Effect.runSync(dailyQuote);

createRoot(rootElement).render(
  <StrictMode>
    <App daily={daily} />
  </StrictMode>,
);
