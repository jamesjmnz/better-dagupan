# PR #12 — feat: list the city's own procurement notices

| | |
|---|---|
| **Merged** | 2026-11-10 |
| **Merge commit** | `03b7e63f37b4b7da281d055d0364110c7ae371e4` |
| **Branch** | `feat/city-procurement-feed` → `main` |
| **Diff** | 10 files, +609 / −1 |
| **Original PR** | <https://github.com/jamesjmnz/better-dagupan/pull/12> (historical reference) |

## Purpose

List the bid and award notices the City Government posts on its own
website, next to the PhilGEPS records.

## Original scope

A Pages Function proxying the city's WordPress feed, its config, a
section on the procurement page, and tests. The branch was stacked on #9 and
retargeted to `main` once #9 merged.

## Technical decisions

- **Pages Function.** `GET /api/city-procurement?page=&search=&type=` proxies
  the city's WordPress REST feed (`/wp-json/wp/v2/bac`, about 1,671 notices)
  and caches responses at the edge for 30 minutes to spare the city's server.
  Visitors' browsers never call the city site directly.
- **Config.** The feed location lives in
  `transparency.procurement.cityNotices` (API base, post type, taxonomy, public
  page). Without it, the section is hidden.
- **Content.** Titles are shown as published (HTML entities decoded) and link
  back to the city's own pages; nothing is re-hosted. Notices can be filtered
  by procurement mode (Competitive Bidding / Alternative Mode) and searched.
- **Errors.** If the feed is unreachable, the section links to the city's
  procurement page instead. Strings are in English and Filipino.

## Commits

| Commit | Message |
|---|---|
| `28a7c26` | `feat: proxy the city's posted procurement notices` |
| `e4fc481` | `test: cover the city notices helpers` |
| `71fc6f9` | `feat: list city procurement notices on the procurement page` |
| `3383ab3` | `test: cover the city notices section` |

## Files changed

- Config and CI: `config/lgu.config.json`
- Functions: `functions/api/city-procurement.ts`,
  `functions/utils/city-notices.ts`
- Frontend: `src/lib/lguConfig.ts`,
  `src/pages/transparency/procurement/CityNotices.tsx`,
  `src/pages/transparency/procurement/index.tsx`
- Locales: `public/locales/en/common.json`, `public/locales/fil/common.json`
- Tests: `e2e/transparency/city-notices.spec.ts`,
  `functions/utils/__tests__/city-notices.test.ts`

## Validation and check results

| Check | Result |
|---|---|
| `vitest` | 488 passed, including helper tests for entity decoding, query clamping, URL building and mapping |
| `e2e/transparency/city-notices.spec.ts` | pass (mocked feed and the failure fallback) |
| Live check through `wrangler pages dev` | 533 competitive-bidding notices, 84 pages |
| Prettier, lint, build | pass |

Final CI state: all required checks passed. Deploy to Cloudflare Pages was
skipped (no credentials configured).

## Known limitations and follow-ups

None recorded at merge.
