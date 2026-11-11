# PR #20 — test: repair the e2e suite and gate on accessibility

| | |
|---|---|
| **Merged** | 2026-11-10 |
| **Merge commit** | `b453e5e0890a4723ab6aa1e13d0b5a60999e1f87` |
| **Branch** | `test/e2e-repair` → `main` |
| **Diff** | 63 files, +1,757 / −1,595 |
| **Original PR** | <https://github.com/jamesjmnz/better-dagupan/pull/20> (historical reference) |

## Purpose

Repair the end-to-end suite so it tests what the portal actually renders,
and add a real accessibility gate.

## Original scope

The e2e specs and helpers, an axe accessibility suite and its CI job, and
the accessibility and rendering bugs the repaired suite found.

## Technical decisions

### Results (chromium, excluding `@visual`)

| | Failed | Passed | Skipped |
|---|---|---|---|
| Before | 112 | 128 | 0 |
| After | 0 | 223 | 42 |

Results were the same with and without API mocking. Of the 42 skips, 33 are
data-gated and switch on automatically when services, financial statements, or
income and competitiveness data are published; 9 are `fixme`, each with a
reason in the code (4 for raw gray classes rendered by the pinned kapwa 1.2.4
Banner and outline Button, 4 for admin pages that hide their filters when
empty).

### Accessibility

- **Gate.** `e2e/a11y.spec.ts` uses `@axe-core/playwright` (WCAG 2.0 A/AA) and
  replaces the non-existent `page.accessibility.scan()`. In `e2e.yml` the
  `@a11y` job is a real gate, with no `continue-on-error`.
- **Coverage.** 10 key routes plus the mobile services layout, all at 0
  violations with no rules excluded.
- **Fixes.** Contrast raised to AA with kapwa tokens; links inside running text
  underlined; valid sidebar landmarks and list markup; a name for the
  breadcrumb's Home link; list items in the home card grids; the skip link
  moves focus to `<main>`.

### Bugs found and fixed

- **Procurement page.** The city notices section crashed the whole page when
  the API returned an unexpected shape.
- **Empty links.** Links in translated sentences rendered with no text,
  because i18next treats `<link>` as an empty HTML tag. The tag is now
  `<anchor>`.
- **Services.** An empty catalogue said "no results matching your filters"; it
  now says "not yet available", and unknown service URLs get a real not-found
  state.
- **Transparency sidebar.** It never highlighted the active section.
- **Test mocks.** The API catch-all mock was registered last, so in CI the
  weather, OpenLGU and admin mocks never applied.
- **Skip link.** Made deterministic (30/30 runs).

## Commits

| Commit | Message |
|---|---|
| `993de40` | `fix: move focus to the main landmark from the skip link` |
| `e381f0c` | `fix: give the sidebar layout valid landmarks and list markup` |
| `a4e6264` | `fix: mark the active transparency section in the sidebar` |
| `7b3000f` | `fix: name the breadcrumb home link and keep its list valid` |
| `d422243` | `fix: wrap the home card grids in list items` |
| `b1a86a3` | `fix: say services are not available yet instead of no results` |
| `03e4a9b` | `fix: give unknown service URLs a real not-found state` |
| `b758ba4` | `fix: raise text contrast to WCAG AA with kapwa tokens` |
| `378cfd7` | `fix: underline links inside running text` |
| `d24202e` | `test: register the API catch-all mock first` |
| `a271a2b` | `test: wait for lazy routes before checking kapwa tokens` |
| `2379036` | `test: assert the home page the portal actually renders` |
| `329370d` | `test: assert empty states on the services pages` |
| `e401624` | `test: assert empty states on the transparency pages` |
| `d92eb33` | `test: sign in as a reviewer in the admin specs` |
| `ceb0c35` | `test: update the sanity suite for Dagupan data` |
| `8e72859` | `test: check key routes with axe` |
| `3027b85` | `ci: run the axe accessibility suite` |
| `8b41ab8` | `fix: keep the city notices section from crashing the procurement page` |
| `2716fbf` | `fix: render the link text in translated sentences` |
| `419692c` | `fix: raise the hotline number contrast` |
| `eba74bb` | `test: read the PhilGEPS entity names the config now lists` |
| `e68821f` | `test: assert the statistics pages against their datasets` |
| `00b140a` | `fix: list the audit log in the admin breadcrumb trail` |
| `bbe6742` | `test: run the audit log specs now that the page renders` |

## Files changed

- Config and CI: `.github/workflows/e2e.yml`, `package.json`
- Frontend: `src/App.tsx`, `src/components/civic/NotVerified.tsx`,
  `src/components/civic/SourceNote.tsx`,
  `src/components/government/BarangayHeader.tsx`,
  `src/components/home/GovernmentSection.tsx`,
  `src/components/home/ServicesSection.tsx`,
  `src/components/home/WeatherMapSection.tsx`, `src/components/layout/` (5
  files), `src/components/navigation/Breadcrumb.tsx`,
  `src/components/navigation/SidebarNavigation.tsx`,
  `src/components/ui/Badge.tsx`,
  `src/components/widgets/CriticalHotlinesWidget.tsx`,
  `src/pages/about/index.tsx`, `src/pages/admin/layout.tsx`,
  `src/pages/data/forex.tsx`, `src/pages/data/weather.tsx`,
  `src/pages/government/barangays/components/BarangaysSidebar.tsx`,
  `src/pages/government/barangays/index.tsx`,
  `src/pages/government/departments/components/DepartmentsSidebar.tsx`,
  `src/pages/government/departments/index.tsx`,
  `src/pages/government/layout.tsx`, `src/pages/services/[service].tsx`,
  `src/pages/services/index.tsx`,
  `src/pages/services/components/ServicesSidebar.tsx`,
  `src/pages/sitemap/index.tsx`,
  `src/pages/transparency/components/TransparencySidebar.tsx`,
  `src/pages/transparency/index.tsx`,
  `src/pages/transparency/procurement/CityNotices.tsx`
- Locales: `public/locales/en/pages.json`, `public/locales/en/services.json`,
  `public/locales/fil/pages.json`, `public/locales/fil/services.json`
- Tests: `e2e/` (5 files), `e2e/admin/` (6 files),
  `e2e/components/sidebar-layout.spec.ts`, `e2e/services/index.spec.ts`,
  `e2e/services/service-detail.spec.ts`, `e2e/statistics/charts.spec.ts`,
  `e2e/statistics/index.spec.ts`, `e2e/transparency/financial.spec.ts`,
  `e2e/transparency/infrastructure.spec.ts`,
  `e2e/transparency/procurement.spec.ts`, `e2e/utils/` (5 files)
- Docs: `src/i18n/README.md`

## Validation and check results

| Check | Result |
|---|---|
| `npm run typecheck` | 0 errors |
| `vitest` | 642 passed |
| Prettier, lint, build | pass |

Final CI state: all required checks passed. Deploy to Cloudflare Pages was
skipped (no credentials configured).

## Known limitations and follow-ups

- Procurement, infrastructure, elected officials and statistics still had axe
  violations (list markup, unnamed buttons, an unlabelled select, contrast) and
  should be added to the a11y suite next.
