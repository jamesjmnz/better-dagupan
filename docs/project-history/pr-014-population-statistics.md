# PR #14 — data: publish Dagupan's census population history

| | |
|---|---|
| **Merged** | 2026-11-10 |
| **Merge commit** | `5295d9c2442317b765221ce26875ccd82e1bb1ce` |
| **Branch** | `data/dagupan-population-statistics` → `main` |
| **Diff** | 14 files, +1,709 / −205 |
| **Original PR** | <https://github.com/jamesjmnz/better-dagupan/pull/14> (historical reference) |

## Purpose

Publish Dagupan's census population history from the PSA, with
provenance shown on the population page.

## Original scope

The population dataset, a barangay series joined from the barangay index,
provenance on the population page, tests, and the verification record.

## Technical decisions

### Published

Each city count is stated by at least two PSA publications.

| Census | City count | Stated by |
|---|---|---|
| 2010 | 163,676 | 2024 POPCEN Table B; Pangasinan QuickStat |
| 2015 | 171,271 | 2015 Region I barangay table; PSA release 2016-064; Table B; QuickStat |
| 2020 | 174,302 | 2020 Region I barangay table; PSA release 2021-316; Table B; QuickStat |
| 2024 | 174,777 | Table B; 2024 Region I Table C; PSGC |

- **Growth rates.** 0.87%, 0.37% and 0.07% are taken from PSA Table B. A test
  recomputes them with the PSA formula and they agree.
- **Barangay counts.** Published for 2015, 2020 and 2024. In each year the 31
  barangays add up exactly to the city total. The 2024 series is read from
  `directory/barangays.json` rather than stored twice.

### Withheld

- 2010 barangay counts and the 2000 census: no PSA document was retrieved.
- Land area: no authoritative document was retrieved.

### Page

- Source notes and a census table, with a `NotVerified` note for the 2010
  barangay gap.
- The "Municipal" wording and an unsupported "from 1960" claim were removed.
  Strings are in English and Filipino.
- 7 new civic sources.

## Commits

| Commit | Message |
|---|---|
| `5e47e97` | `feat: join barangay census series from the barangay index` |
| `4a04389` | `data: publish Dagupan census population history` |
| `89a12e5` | `feat: show provenance on the population page` |
| `6059721` | `test: assert population statistics provenance` |
| `01d88ce` | `docs: record the population verification` |

## Files changed

- Data: `src/data/sources/civic-sources.json`,
  `src/data/statistics/population.json`,
  `src/data/statistics/schema/population.schema.json`
- Frontend: `src/lib/populationStatistics.ts`,
  `src/pages/statistics/PopulationPage.tsx`, `src/types/populationTypes.ts`
- Locales: `public/locales/en/common.json`, `public/locales/fil/common.json`
- Tests: `e2e/statistics/charts.spec.ts`, `e2e/statistics/index.spec.ts`,
  `e2e/statistics/population.spec.ts`,
  `src/data/__tests__/inheritedRecords.test.ts`,
  `src/data/__tests__/populationProvenance.test.ts`
- Docs: `docs/civic-data-verification.md`

## Validation and check results

| Check | Result |
|---|---|
| `vitest` | 523 passed, including the new population provenance test |
| Prettier, build | pass |
| Statistics e2e | 21 failures against 36 on `main`, none new |

Final CI state: all required checks passed, including Validate JSON files
against schema. Deploy to Cloudflare Pages was skipped (no credentials
configured).

## Known limitations and follow-ups

None recorded at merge.
