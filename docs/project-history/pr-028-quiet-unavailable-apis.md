# PR #28 — fix: handle unconfigured weather and legislative APIs quietly

| | |
|---|---|
| **Merged** | 2026-11-10 |
| **Merge commit** | `19c596d97e5300354bbf44948d680dd1129d03fa` |
| **Branch** | `fix/quiet-unavailable-apis` → `main` |
| **Diff** | 8 files, +154 / −103 |
| **Original PR** | <https://github.com/jamesjmnz/better-dagupan/pull/28> (historical reference) |

## Purpose

Stop every page logging a weather error, and the weather page showing
"HTTP error! status: 500". With the Los Baños KV binding removed, `WEATHER_KV`
was undefined and there was no OpenWeatherMap key yet, and the weather function
crashed on both.

## Original scope

The weather function and its test, the weather ticker and page, the
weather source credit, and the OpenLGU loaders.

## Technical decisions

- **Weather function.** KV is optional, and with no key set the function
  answers `503 {"error": "weather_unavailable"}`. Its catch block referenced an
  `origin` declared inside `try`, so every error path threw a ReferenceError;
  that is fixed and covered by a test.
- **Weather UI.** The ticker and `/data/weather` treat that `503` as "nothing to
  show". The weather page renders an empty state instead of the raw error.
- **Source credit.** The weather page said its data came from PAGASA. It comes
  from OpenWeatherMap, and the text now says so.
- **OpenLGU loaders.** They no longer `console.error` the expected `503` while
  no legislative D1 is bound.

## Commits

| Commit | Message |
|---|---|
| `b276cbd` | `fix: answer 503 from the weather API when it is not configured` |
| `fdfe6fd` | `fix: show an unavailable state when weather is not configured` |
| `64c85a4` | `fix: credit OpenWeatherMap as the weather source` |
| `4b6835c` | `fix: stop logging the expected legislative 503` |

## Files changed

- Functions: `functions/api/weather.ts`
- Frontend: `src/lib/api.ts`, `src/lib/openlgu.ts`, `src/lib/weather.ts`,
  `src/pages/data/weather.tsx`
- Locales: `public/locales/en/pages.json`, `public/locales/fil/pages.json`
- Tests: `functions/api/__tests__/weather.test.ts`

## Validation and check results

| Check | Result |
|---|---|
| Typecheck, lint, Prettier, build | pass |
| `vitest` | 694 passed |
| Crawl of all 93 local routes | no app errors; only the browser's own network log for the 503 |

Final CI state: all required checks passed. Deploy to Cloudflare Pages was
skipped (no credentials configured).

## Known limitations and follow-ups

None recorded at merge.
