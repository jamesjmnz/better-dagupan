# PR #6 — data: establish civic-data provenance and publish the verified Dagupan barangay index

| | |
|---|---|
| **Merged** | 2026-08-22 |
| **Merge commit** | `682d346781ad7b52e1e14e64d3d529240e70c06b` |
| **Branch** | `data/dagupan-barangay-foundation` → `main` |
| **Diff** | 26 files, +2,570 / −359 |
| **Original PR** | <https://github.com/jamesjmnz/better-dagupan/pull/6> (historical reference) |

## Purpose

Establish the provenance model every later dataset reuses, and publish the first
civic records under the Better Dagupan name: the 31 barangays of the City of
Dagupan, each traceable to a government document a reader can open.

Before this PR, `/government/barangays` rendered "0 component barangays" over an
empty grid, with a leftover Los Baños barangay name as the search placeholder.

## Original scope

The civic-source model, the barangay schema and records, their display, English
and Filipino copy, tests, and two documents. No departments, officials,
services, budgets, or legislation.

## Sources

| | Role | Dates |
|---|---|---|
| **Philippine Statistics Authority** — PSGC, Barangays in the City of Dagupan (0105518000) | Authoritative; the sole source for every published PSGC field | Published 2026-07-13; content as of 2026-06-30; verified 2026-08-22 |
| **City Government of Dagupan** — Barangay Captains page | Historical (covers 2018–2020); cited only for four older spellings | Verified 2026-08-22 |
| **DILG** — Masterlist of Barangays | Derivative of the PSA file; catalogued with `derives_from`, cited by no record | Verified 2026-08-22 |

The PSA and city pages list the same 31 local units. Four names are spelled
differently on the city page (Barangay II & III, Herrero-Perez, Manguin,
Pugaro). The PSA spelling is published; the city spellings are shown as dated,
attributed historical variants so searches still find them, and the historical
page is never listed in a record's `sources`.

## Technical decisions

- **`src/data/sources/civic-sources.json`** with a JSON Schema and a
  `CivicSource` type. Each citation keeps `published`, `data_as_of`, and
  `coverage` distinct, and an explicit `null` records that a publisher states no
  date.
- **Published fields:** PSGC name, 10-digit and 9-digit codes, urban/rural
  classification, 2024 POPCEN population (all PSA), plus a locally derived slug.
- **Withheld, left `null` / `[]`:** officials (the only city roster covers
  2018–2020, so it would present former officials as current), address,
  trunkline, website. The interface says these are not verified yet instead of
  "No contact listed".
- **`SourceNote` and `NotVerified`** components show the agency, a document
  link, and each source's last verification date.
- **Verification dates are reported conservatively.** A record shows the oldest
  verification date among its sources, in the reader's language.
- **Latent defects fixed:** Roman-numeral names rendered as "Barangay Ii", a
  doubled "Barangay Barangay II" heading, a duplicate `#main-content`, and a
  sidebar that sorted the shared imported array in place.

## Commits

| Commit | Message |
|---|---|
| `eb6bbca` | `data: add civic source provenance model` |
| `dfa74f9` | `refactor: represent unverified barangay fields safely` |
| `31bbb53` | `data: add verified Dagupan barangay index` |
| `af333ea` | `feat: localize barangay verification states` |
| `bcb6697` | `feat: display barangay sources and verification dates` |
| `09d01cd` | `test: enforce barangay provenance and integrity` |
| `c265399` | `docs: document the civic-data verification process` |
| `6a02861` | `docs: record the TypeScript error baseline` |
| `1359a50` | `fix: report civic verification dates conservatively and locally` |
| `60b5b6e` | `fix: align the civic-source schema with its TypeScript contract` |

## Files changed

- Data: `src/data/directory/barangays.json` and its schema,
  `src/data/sources/civic-sources.json` and its schema
- Code: `src/lib/civicSources.ts`, `src/types/civicSourceTypes.ts`,
  `src/types/directoryTypes.ts`, `src/components/civic/`,
  `src/components/government/BarangayHeader.tsx`, the barangay pages,
  `src/lib/stringUtils.ts`
- Locales: `public/locales/{en,fil}/common.json`
- Tests: `barangayProvenance.test.ts`, `civicSources.test.ts` (data and lib),
  `inheritedRecords.test.ts`, `stringUtils.test.ts`,
  `e2e/government/barangays.spec.ts`, `e2e/utils/kapwa.ts`
- Docs: `docs/civic-data-verification.md`, `docs/typescript-baseline.md`

## Validation and check results

| Check | Result |
|---|---|
| Schema validation (barangays, civic sources) | pass |
| `npm run lint` | clean |
| `npm run test -- --run` | 464 passed (23 files) |
| `npm run build` | pass |
| `--grep @smoke` (chromium) | 8 passed |
| Barangay, content-safety, and disclaimer e2e specs | 41 passed (non-visual) |
| `tsc -p tsconfig.app.json` | 307 errors, byte-identical to `main` |

Every row was re-read from the live PSA table and diffed programmatically: 31
rows, no code mismatches. The 31 populations sum to 174,777, the city total the
PSA publishes on the same page; a test asserts it.

Final CI state: all required checks passed. Deploy to Cloudflare Pages was
skipped (no credentials configured).

## Known limitations and follow-ups

- Barangay officials need a current source (post-2023 elections); the 2018–2020
  roster must not be used.
- No authoritative source yet for barangay hall addresses, phone numbers, or
  pages.
- `npx tsc --noEmit`, the command CI and the build run, checks no files because
  the root `tsconfig.json` is solution-style; see `docs/typescript-baseline.md`.
- Visual-regression baselines are not tracked, so `@visual` specs prove nothing
  in CI.
- `src/pages/admin/ReviewQueue.tsx` still held `losbanos.gov.ph` mock URLs
  (fixed later in PR #10).
