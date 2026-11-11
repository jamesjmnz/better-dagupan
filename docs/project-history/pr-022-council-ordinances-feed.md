# PR #22 — feat: list the council's posted ordinances on OpenLGU

| | |
|---|---|
| **Merged** | 2026-11-10 |
| **Merge commit** | `ceaac6daafc42ef7109c1b2957f85eb97052cfd5` |
| **Branch** | `feat/council-ordinances-feed` → `main` |
| **Diff** | 15 files, +1,033 / −143 |
| **Original PR** | <https://github.com/jamesjmnz/better-dagupan/pull/22> (historical reference) |

## Purpose

Show the ordinances the Sangguniang Panlungsod posts on its own website,
until the legislative database is re-keyed for Dagupan in a later phase.

## Original scope

A Pages Function proxying the council's WordPress feed, WordPress helpers
shared with the city notices, the OpenLGU page's ordinance list, strings, tests,
and a note in `ARCHITECTURE.md`.

## Technical decisions

- **Pages Function.** `GET /api/council-ordinances?page=&search=&classification=`
  proxies `sp.dagupan.gov.ph/wp-json/wp/v2/ordinance` (147 ordinances, June
  2021 to January 2026), caches responses at the edge for 30 minutes, gives up
  after 8 seconds, and returns `502` on failure or `404` when not configured.
- **Shared helper.** The WordPress feed code lives in
  `functions/utils/wordpress-feed.ts`, shared with the city procurement
  notices. Their behaviour and tests are unchanged.
- **OpenLGU page.** The empty state lists the ordinances, with search, the
  council's own classification filter (only 31 ordinances carry one),
  pagination, and links back to the council's pages.
  - Dates are labelled "Posted", because the feed has no ordinance number or
    enactment date.
  - If the feed fails, the page links to the council's ordinance page instead.
  - The header search is hidden until database records exist, so the page does
    not show two search boxes.
- **Config.** `openlgu.councilFeed`. Strings are in English and Filipino.
- **Vocabulary.** `ARCHITECTURE.md` explains that this is an interim link-back
  list. Its items are not source records, and nothing reaches D1.
- **Fix.** Link contrast on the attribution lines here and in the city
  procurement notices, found by axe.

## Commits

| Commit | Message |
|---|---|
| `2994bf8` | `refactor: share the WordPress feed helpers` |
| `74c96bf` | `chore: configure the council ordinances feed` |
| `1c71ca6` | `feat: proxy the council's posted ordinances` |
| `153a32b` | `test: cover the council ordinances helpers` |
| `62c0df7` | `feat: add council ordinances strings in English and Filipino` |
| `fc84173` | `feat: list council ordinances on the OpenLGU page` |
| `b646433` | `test: cover the council ordinances list` |
| `4ed9067` | `fix: raise the city notices link contrast` |
| `1116e84` | `docs: describe the interim ordinances feed` |
| `c1c6765` | `fix: stack the council ordinances header on wide screens` |
| `c6d0429` | `fix: hide the legislative search until records exist` |

## Files changed

- Config and CI: `config/lgu.config.json`
- Functions: `functions/api/city-procurement.ts`,
  `functions/api/council-ordinances.ts`, `functions/utils/city-notices.ts`,
  `functions/utils/council-ordinances.ts`, `functions/utils/wordpress-feed.ts`
- Frontend: `src/lib/lguConfig.ts`,
  `src/pages/openlgu/components/CouncilOrdinances.tsx`,
  `src/pages/openlgu/layout.tsx`,
  `src/pages/transparency/procurement/CityNotices.tsx`
- Locales: `public/locales/en/openlgu.json`, `public/locales/fil/openlgu.json`
- Tests: `e2e/openlgu/council-ordinances.spec.ts`,
  `functions/utils/__tests__/council-ordinances.test.ts`
- Docs: `ARCHITECTURE.md`

## Validation and check results

| Check | Result |
|---|---|
| Live run with `wrangler pages dev` | 147 ordinances, 8 classifications, filters work, repeat requests served from cache |
| `vitest` | 649 passed, including new helper tests |
| Typecheck, Prettier, lint, build | pass |
| `e2e/openlgu/council-ordinances.spec.ts`, `e2e/a11y.spec.ts` | pass; `/openlgu` has 0 violations |

Final CI state: all required checks passed. Deploy to Cloudflare Pages was
skipped (no credentials configured).

## Known limitations and follow-ups

None recorded at merge.
