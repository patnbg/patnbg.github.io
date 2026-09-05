# Daily Detour

One funny thought per day, with no action items attached.

Daily Detour is a static React page dressed as a slightly crooked desk calendar. It displays one
of seven credited comic quotes for the current UTC day.

Live site: <https://patnbg.github.io/>

## Local setup

The project pins [Bun 1.4.0](https://bun.com/docs/installation#installing-older-versions) in
`package.json`.

```sh
bun install --frozen-lockfile
bun run dev
```

Open <http://127.0.0.1:4173/>.

Install the Playwright browsers before running browser tests:

```sh
bun run browsers:install
```

## Useful scripts

| Command                         | What it does                                              |
| ------------------------------- | --------------------------------------------------------- |
| `bun run dev`                   | Start the Vite development server                         |
| `bun run build`                 | Build the static site into `dist/`                        |
| `bun run preview`               | Serve the production build locally                        |
| `bun run test:unit`             | Run the quote and UTC date unit tests                     |
| `bun run test:e2e`              | Run Playwright behavior and visual tests                  |
| `bun run test:update-snapshots` | Update the visual baselines                               |
| `bun run format`                | Format the repository with Oxfmt                          |
| `bun run lint:fix`              | Apply Oxlint fixes                                        |
| `bun run audit`                 | Check for moderate-or-higher dependency advisories        |
| `bun run check`                 | Run all formatting, linting, type, build, and test checks |

`bun run test:e2e` serves `dist/`, so build first. `bun run check` already does that.

## One quote, one UTC day

Effect reads the browser clock when the app starts. The timestamp becomes a whole UTC day, which
selects an entry from `src/quotes.ts`. The choice is deterministic, not random. Everyone on the
same UTC date gets the same quote, and the seven-quote list repeats each week.

The calculation runs once at page load. A tab left open across midnight needs a refresh. Adding,
removing, or reordering quotes changes which quote lands on each date.

## Test coverage

- Bun tests cover date-to-quote selection, UTC formatting, midnight rollover, pre-Unix timestamps,
  and complete quote credits.
- Playwright checks content, browser errors, horizontal overflow, every quote at 320 pixels, Axe
  results, reduced motion, and the no-JavaScript fallback.
- Screenshot baselines cover desktop, mobile, and reduced-motion layouts.
- CI runs Chromium, Firefox, and WebKit. Local browser projects use Chromium.

## Deployment

In repository Settings > Pages > Build and deployment, set Source to **GitHub Actions**.
This requires Pages administration permission; a token that can read Pages settings may not be
allowed to change them. Legacy branch publishing cannot build this Vite application.

`.github/workflows/ci.yml` runs all checks on pull requests and pushes to `main`. A successful push
uploads `dist/` and deploys it through GitHub Pages. Vite uses a `/` base path because this is the
`patnbg.github.io` user site.
