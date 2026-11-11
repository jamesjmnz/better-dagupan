# PR #26 — data: publish Dagupan's competitiveness scores

| | |
|---|---|
| **Merged** | 2026-11-10 |
| **Merge commit** | `41de4e60b74458964ec5f2bd3be34a9e845ae5fe` |
| **Branch** | `data/dagupan-competitiveness` → `main` |
| **Diff** | 14 files, +3,610 / −148 |
| **Original PR** | <https://github.com/jamesjmnz/better-dagupan/pull/26> (historical reference) |

## Purpose

Publish Dagupan City's scores in DTI's Cities and Municipalities
Competitiveness Index (`cmci.dti.gov.ph`).

## Original scope

The CMCI dataset, restructured one record per year, the competitiveness
page, tests, and the verification record.

## Technical decisions

### Published

- **11 editions, 2014–2024.** The overall score and rank, plus every pillar's
  and indicator's score and rank, exactly as DTI published them.
- **Sources.** DTI's profile page for Dagupan, and from 2015 its "Rankings of
  Component Cities" table, which gives the overall score to four decimals. The
  two pages agree on every rank and pillar score.
- **One record per year.** `cmci.json` is restructured this way because DTI's
  framework changed (three pillars, then four from 2017, five from 2022) and
  indicators were renamed.
- **Page.** A year switcher, ranks, a methodology note, and a table linking
  each year's DTI page.

### Withheld

- **2014 Government Efficiency indicators.** DTI's indicator scores sum to
  14.8815 against a pillar score of 17.3893. The pillar score is published.
- **Peer counts for 2014–2016 and 2021.** DTI prints "()" instead of a number.

## Commits

| Commit | Message |
|---|---|
| `1d9bcca` | `feat: show competitiveness scores by edition with provenance` |
| `926c202` | `data: publish Dagupan's competitiveness scores` |
| `1441400` | `test: assert competitiveness provenance` |
| `b9ad28a` | `docs: record the competitiveness verification` |

## Files changed

- Data: `src/data/sources/civic-sources.json`, `src/data/statistics/cmci.json`
- Frontend: `src/pages/statistics/CompetitivenessPage.tsx`,
  `src/types/statisticsTypes.ts`
- Locales: `public/locales/en/statistics.json`,
  `public/locales/fil/statistics.json`
- Tests: `e2e/content-safety.spec.ts`, `e2e/statistics/charts.spec.ts`,
  `e2e/statistics/competitiveness.spec.ts`, `e2e/statistics/index.spec.ts`,
  `src/data/__tests__/cmciProvenance.test.ts`,
  `src/data/__tests__/inheritedRecords.test.ts`
- Docs: `docs/civic-data-verification.md`,
  `docs/reference/betterlb-data-model.md`

## Validation and check results

| Check | Result |
|---|---|
| `vitest` | 658 passed |
| Typecheck, Prettier, lint, build | pass |
| chromium e2e | 236 passed, 33 skipped |

Final CI state: all required checks passed, including Validate JSON files
against schema. Deploy to Cloudflare Pages was skipped (no credentials
configured).

## Known limitations and follow-ups

None recorded at merge.
