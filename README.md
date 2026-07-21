# NULL//STAR

An interactive Y2K deep-space transmission built as a static site. It uses Vite only for local development and production packaging; the generated `dist/` directory contains plain static assets suitable for GitHub Pages.

## Requirements

- Node.js 22.13 or newer in the 22.x line, or Node.js 24+
- npm

## Commands

```sh
npm ci
npm run browsers:install
npm run dev
npm run check
```

Update the committed visual baselines after an intentional design change:

```sh
npm run test:update-snapshots
```

Review every generated image in `tests/__screenshots__/` before committing it. Linux baselines are authoritative; other platforms write to separate snapshot directories.

## Quality Gates

- ESLint checks application, test, and configuration JavaScript.
- Playwright exercises mouse, touch-sized, and keyboard interactions in Chromium.
- axe checks the rendered page for automatically detectable accessibility issues.
- Playwright compares desktop, mobile, and reduced-motion screenshots.
- Zizmor audits GitHub Actions with its pedantic persona.
- Renovate proposes npm and pinned GitHub Action updates for review; executable tooling is never automerged.

Pushes to `main` deploy to GitHub Pages only after all quality and workflow-security checks pass.

## Repository Settings

GitHub configuration lives outside this repository and must be enabled once:

- Set Pages deployment source to **GitHub Actions**.
- Enable **Enforce HTTPS** for `www.prctl.de`; HTTP currently serves content without redirecting.
- Protect `main` with pull requests and the `Lint, build, and test` plus `Audit workflows with zizmor` checks.
- Disable force pushes and branch deletion for `main`.
