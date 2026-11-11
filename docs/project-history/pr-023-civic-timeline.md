# PR #23 — data: publish Dagupan's civic timeline

| | |
|---|---|
| **Merged** | 2026-11-10 |
| **Merge commit** | `72af83c396744fb8ec0d00a4a0ebd76a0ca4c987` |
| **Branch** | `data/dagupan-history` → `main` |
| **Diff** | 18 files, +1,032 / −113 |
| **Original PR** | <https://github.com/jamesjmnz/better-dagupan/pull/23> (historical reference) |

## Purpose

Publish a short legal timeline of the City of Dagupan and three sourced
highlights. Every law was read in its official text on the Supreme Court
E-Library; lawphil was used only to find them.

## Original scope

The city charter sources, the history and highlights datasets and their
schemas, provenance on the timeline, tests, and the verification record.

## Technical decisions

### Timeline

| Date | Entry | Source |
|---|---|---|
| 1947-06-20 | City of Dagupan created (RA 170) | E-Library; council "About" page |
| 1947-10-15 | 1 Jan 1948 fixed as organization date; Calasiao to be joined (EO 96) | E-Library |
| 1947-12-31 | Date restated; territory limited to the former municipality of Dagupan (EO 115) | E-Library |
| 1950-06-10 | Municipal Board reconstituted; city voters may vote for provincial officials (RA 484) | E-Library |
| 1959-06-19 | City offices made elective; voters "shall not vote for provincial officials" (RA 2259) | E-Library |
| 1965-06-19 | Four assistant city fiscals created (RA 4291) | E-Library |
| 1973-07-06 | City court expanded to three branches (PD 235) | E-Library |

### Highlights

- **Chartered city since 1947:** RA 170.
- **31 barangays:** PSGC.
- **174,777 residents:** PSA Table B and PSGC.

Tests require the two figures to match the published barangay and population
datasets.

### Withheld

- **"Government organized 1 Jan 1948":** only a lawphil copy of the court
  decision was found.
- **1987 district placement:** the apportionment ordinance was not in the
  official copies read.
- **"Independent component city":** PSA is not the classifying authority, and
  the laws point both ways.
- **Folklore and earlier history, the 1990 earthquake:** only the city page or
  non-authoritative sources state them. A "not yet verified" note marks the
  gap instead.

### Code

- The timeline type gains `slug`, `date`, `instrument` and `sources`. Both
  files get JSON schemas, validated in CI.
- Every entry shows its sources and a report-an-error link. Strings are in
  English and Filipino.
- Highlights also show on mobile.
- `inheritedRecords` deliberately moves `about/*` to present-and-Dagupan,
  allowing only "municipality of Dagupan/Calasiao" from the official texts.

## Commits

| Commit | Message |
|---|---|
| `7c201d3` | `data: cite the city charter and its amendments` |
| `3654f82` | `data: publish Dagupan's civic timeline` |
| `fd05d18` | `feat: show provenance on the history timeline` |
| `b12f25d` | `test: assert history provenance` |
| `e8ed826` | `docs: record the history verification` |

## Files changed

- Config and CI: `.github/workflows/validate-json-schema.yml`
- Data: `src/data/about/highlights.json`, `src/data/about/history.json`,
  `src/data/about/schema/highlights.schema.json`,
  `src/data/about/schema/history.schema.json`,
  `src/data/sources/civic-sources.json`
- Frontend: `src/components/home/TimelineSection.tsx`,
  `src/lib/historyDates.ts`, `src/types/aboutTypes.ts`
- Locales: `public/locales/en/common.json`, `public/locales/fil/common.json`
- Tests: `e2e/content-safety.spec.ts`, `e2e/home.spec.ts`,
  `src/data/__tests__/aboutProvenance.test.ts`,
  `src/data/__tests__/inheritedRecords.test.ts`, `src/lib/historyDates.test.ts`
- Docs: `README.md`, `docs/civic-data-verification.md`

## Validation and check results

| Check | Result |
|---|---|
| `vitest` | 667 passed |
| Typecheck, Prettier, lint, build | pass |
| `home` and `content-safety` e2e | pass |

Final CI state: all required checks passed, including Validate JSON files
against schema. Deploy to Cloudflare Pages was skipped (no credentials
configured).

## Known limitations and follow-ups

- The city's main history page on dagupan.gov.ph returned 504 throughout and was
  never read.
- PSA has a newer PSGC release (as of 30 Sep 2026). It still shows 31 barangays
  and 174,777 residents, but the barangay index should be re-verified against
  it.
