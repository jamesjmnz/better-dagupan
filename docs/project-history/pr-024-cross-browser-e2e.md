# PR #24 — test: make the e2e suite pass across browsers

| | |
|---|---|
| **Merged** | 2026-11-10 |
| **Merge commit** | `26523a63cf845c69d1da2ca9cc234ccc4e2f96fd` |
| **Branch** | `test/cross-browser-e2e` → `main` |
| **Diff** | 10 files, +133 / −52 |
| **Original PR** | <https://github.com/jamesjmnz/better-dagupan/pull/24> (historical reference) |

## Purpose

Fix the end-to-end failures on Firefox, WebKit and the mobile projects
that the full suite reported after #20.

## Original scope

Footer and mobile navigation fixes, a dev-only CSS plugin for WebKit, and
test fixes.

## Technical decisions

### Results (local, `MOCK_API=true`, excluding `@visual`)

| Project | Failed before | Failed after |
|---|---|---|
| chromium | 0 | 0 |
| firefox | 0 | 0 |
| webkit | 17 | 4\* |
| Mobile Chrome | 9 | 0 |
| Mobile Safari | 25 | 4\* |

\* The four remaining are keyboard-Tab tests. They fail only on macOS WebKit,
because Safari's Tab does not move focus to links by default. They pass on CI's
Linux runners.

### App fixes

- **Footer.** The icon-only GitHub link had no accessible name in WebKit. It
  was the only axe failure on WebKit; no rules were excluded.
- **Mobile navigation.** The logo link and the menu buttons meet the 44px tap
  target.
- **Dev server in WebKit.** A dev-only Vite plugin flattens Tailwind's nested
  CSS, as production builds already do, so the sidebar collapses. The helper
  (`@tailwindcss/node`, which comes in through `@tailwindcss/vite`) is loaded
  lazily, and the plugin does nothing if it is missing.

### Test fixes

- A shared `openSidebar()` helper uses the layout's own Menu button on mobile,
  or Expand Menu on desktop.
- The transparency cards test waits for the cards to render.
- Home navigation clicks the link the viewport actually shows.
- The statistics "collapsible" test really collapses the sidebar.

## Commits

| Commit | Message |
|---|---|
| `ebf2a56` | `fix: name the icon-only social links in the footer` |
| `aca6a9f` | `fix: flatten nested CSS on the dev server so WebKit restyles class toggles` |
| `a432f85` | `fix: meet the 44px tap target on mobile navigation` |
| `709f2ab` | `test: open the mobile sidebar before checking its contents` |
| `05b86e8` | `test: wait for the transparency cards instead of counting them early` |
| `d618859` | `test: follow the navigation link the viewport actually shows` |
| `8228303` | `test: collapse the statistics sidebar with the control each viewport shows` |
| `5058407` | `fix: load the dev CSS optimizer lazily and skip it if missing` |

## Files changed

- Config and CI: `vite.config.ts`
- Frontend: `src/components/layout/Footer.tsx`,
  `src/components/layout/Navbar.tsx`
- Tests: `e2e/government/barangays.spec.ts`, `e2e/home.spec.ts`,
  `e2e/services/index.spec.ts`, `e2e/statistics/index.spec.ts`,
  `e2e/transparency/financial.spec.ts`, `e2e/transparency/index.spec.ts`,
  `e2e/utils/layout.ts`

## Validation and check results

| Check | Result |
|---|---|
| `vitest` | 649 passed |
| Typecheck, Prettier, lint, build | pass |

Final CI state: all required checks passed. Deploy to Cloudflare Pages was
skipped (no credentials configured).

## Known limitations and follow-ups

- The mobile submenu chevron buttons need an accessible name and
  `aria-expanded`.
- `e2e/utils/navbar.ts` is unused.
