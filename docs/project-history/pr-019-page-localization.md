# PR #19 — feat: localize the remaining pages in English and Filipino

| | |
|---|---|
| **Merged** | 2026-11-10 |
| **Merge commit** | `0e8206dc064d9d4a21607af0cce2d3fd27a00bd5` |
| **Branch** | `feat/localize-pages` → `main` |
| **Diff** | 87 files, +3,842 / −1,328 |
| **Original PR** | <https://github.com/jamesjmnz/better-dagupan/pull/19> (historical reference) |

## Purpose

Move the remaining hard-coded English into i18n, with Filipino for every
string.

## Original scope

Eight new locale namespaces, the layout, services, OpenLGU, transparency,
statistics, government and static pages, the locale parity test, and the
translation guide.

## Technical decisions

### Namespaces

New namespaces, each in `en`, `fil` and (empty) `pag`, registered in
`src/i18n.ts`: `ui`, `navigation`, `services`, `openlgu`, `transparency`,
`statistics`, `government`, `pages`. They load at startup behind the existing
Suspense loader, so pages never show raw keys. `common.json` is unchanged.

### Localized

- **Layout:** navbar, footer, navigation labels (items carry a `labelKey`),
  sidebar menu, `EmptyState` defaults
- **Services:** all pages, including category names keyed by slug
- **OpenLGU:** all pages and components, with real plurals for counts
- **Transparency:** index, layout and financial page
- **Statistics:** layout, income and competitiveness pages
- **Government:** hub layout and barangay leftovers
- **Static pages:** About, Contact, Join Us, Ideas, Contribute, Sitemap, Search,
  Weather, Forex, Accessibility, Terms

LGU-specific words such as "City", "Mayor" and "City of …" follow the LGU type
in config through `useLguTerms`.

Kept in English on purpose: government data values (office names, roles,
document types, CMCI pillars), BLGF/SRE budget line items, and the weather and
forex fetch-error fallbacks.

### Tests

`localeParity.test.ts` covers every namespace: en, fil and pag have the same
set of files; every file is registered in `src/i18n.ts`; en and fil have
exactly the same keys, placeholders and inline tags, with no empty strings; and
the Pangasinan subset rules apply to every namespace.

## Commits

| Commit | Message |
|---|---|
| `6e2c4bc` | `feat: localize the shared empty state and sidebar menu` |
| `405eeee` | `feat: localize the site navigation and footer` |
| `8a5fd98` | `feat: localize the services pages` |
| `e34b355` | `feat: localize the OpenLGU pages` |
| `c80c30c` | `feat: localize the transparency pages` |
| `212bae0` | `feat: localize the statistics income and competitiveness pages` |
| `c279b8c` | `feat: localize the government hub and barangay leftovers` |
| `8897387` | `feat: localize the static pages` |
| `eecfa3f` | `test: check parity across every locale namespace` |
| `8711c29` | `docs: list the locale namespaces and their rules` |
| `d9b31f1` | `test: wait for the app before tabbing to the skip link` |

## Files changed

- Data: `src/data/navigation.ts`
- Frontend: `src/components/layout/Footer.tsx`,
  `src/components/layout/Navbar.tsx`, `src/components/layout/SidebarLayout.tsx`,
  `src/components/ui/EmptyState.tsx`, `src/i18n.ts`, `src/lib/useLguTerms.ts`,
  `src/pages/` (5 files), `src/pages/about/index.tsx`,
  `src/pages/accessibility/index.tsx`, `src/pages/contribute/index.tsx`,
  `src/pages/data/forex.tsx`, `src/pages/data/weather.tsx`,
  `src/pages/government/barangays/[barangay].tsx`,
  `src/pages/government/barangays/components/BarangaysSidebar.tsx`,
  `src/pages/government/layout.tsx`, `src/pages/openlgu/` (8 files),
  `src/pages/openlgu/components/` (7 files), `src/pages/services/[service].tsx`,
  `src/pages/services/index.tsx`, `src/pages/services/layout.tsx`,
  `src/pages/services/components/` (9 files), `src/pages/sitemap/index.tsx`,
  `src/pages/statistics/CompetitivenessPage.tsx`,
  `src/pages/statistics/MunicipalIncomePage.tsx`,
  `src/pages/statistics/layout.tsx`,
  `src/pages/statistics/components/StatisticsSidebar.tsx`,
  `src/pages/transparency/components/FinancialPieChart.tsx`,
  `src/pages/transparency/components/QuarterToggle.tsx`,
  `src/pages/transparency/components/SummaryCards.tsx`,
  `src/pages/transparency/components/TransparencySidebar.tsx`,
  `src/pages/transparency/financial/index.tsx`,
  `src/pages/transparency/index.tsx`, `src/pages/transparency/layout.tsx`,
  `src/types/index.ts`
- Locales: `public/locales/en/` (8 files), `public/locales/fil/` (8 files),
  `public/locales/pag/` (8 files)
- Tests: `e2e/smoke.spec.ts`, `src/data/__tests__/localeParity.test.ts`
- Docs: `src/i18n/README.md`

## Validation and check results

| Check | Result |
|---|---|
| `npm run typecheck` | 0 errors |
| `vitest` | 642 passed |
| Prettier, lint, build | pass |
| Browser check | 25 routes in English and Filipino, with no raw keys, placeholders or errors |

Final CI state: all required checks passed. Deploy to Cloudflare Pages was
skipped (no credentials configured).

## Known limitations and follow-ups

- Have a fluent reader check the Filipino, especially the Terms of Service legal
  phrasing, "Kakayahang Makipagkumpitensya", "Mga Mapagkukunan", and ordinals
  like "12th na Termino".
- The Contact page says content is CC0, while the footer says only the code
  follows the repository licence. The text was left unchanged; a decision is
  needed.
