# PR #11 — data: publish Dagupan's elected officials

| | |
|---|---|
| **Merged** | 2026-11-10 |
| **Merge commit** | `3775d7cdb9ec19dd3a9e1f2d10e913c611e6f029` |
| **Branch** | `data/dagupan-elected-officials` → `main` |
| **Diff** | 15 files, +2,146 / −393 |
| **Original PR** | <https://github.com/jamesjmnz/better-dagupan/pull/11> (historical reference) |

## Purpose

Publish the verified elected officials of the City of Dagupan, following
the department directory's provenance rules.

## Original scope

Provenance fields on the executive and legislative schemas, the civic
sources, the executive and Sangguniang Panlungsod records, provenance on the
elected officials pages, tests, and the verification record.

## Technical decisions

### Published

Each name is backed by at least two independent source families: the city's
officials pages, the council site (sp.dagupan.gov.ph), city news, and the
COMELEC 2025 results.

| Seat | Name | Source families |
|---|---|---|
| City Mayor | Belen T. Fernandez | city officials page, city news, COMELEC |
| City Vice Mayor (presiding officer) | Dean Bryan L. Kua | city officials page, council site, city news, COMELEC |
| 10 elected councilors | Canto, Cayabyab, Fabia, M. Fernandez, Paras, K. Reyna IV, M. L. F. Reyna, Samson Jr., Seen, Tamayo | council site and city news, plus COMELEC where the given name matches |
| Ex officio, Liga ng mga Barangay President | M. D. Fernandez | council site, city news |
| Ex officio, SK Federation President | Benavides | council site, city news |

- Names follow the council's own roster; other spellings are kept as
  attributed `name_variants`.
- COMELEC ballot nicknames do not count as a match.
- The term "2025–2028" is derived from the 12 May 2025 election plus the
  three-year local term. No source prints the range.

### Withheld

- **Committee assignments:** the council profiles contradict each other on
  several chairs.
- **Ex-officio terms:** no source states them.
- **Contacts, photos, biographies:** none sourced.

### Code

- `sources` and status fields on the executive and legislative schemas and
  types, plus 9 new civic sources.
- The pages show `SourceNote` / `NotVerified`, use LGU labels, are localized in
  English and Filipino, and no longer depend on the Los Baños
  `12th-sangguniang-bayan` slug.

## Commits

| Commit | Message |
|---|---|
| `23868e0` | `feat: add civic provenance fields to official schemas` |
| `33f641f` | `data: cite the elected officials sources` |
| `098f851` | `data: publish Dagupan's elected executive officials` |
| `be44398` | `data: publish the Sangguniang Panlungsod roster` |
| `8803ce7` | `feat: show provenance on elected officials pages` |
| `0f51be4` | `feat: label the elected officials sidebar from the LGU config` |
| `539a10d` | `fix: stop nesting buttons in elected officials links` |
| `57bdad4` | `test: assert elected officials provenance and rendering` |
| `e023401` | `docs: record the elected officials verification` |

## Files changed

- Data: `src/data/directory/executive.json`,
  `src/data/directory/legislative.json`,
  `src/data/directory/schema/executive.schema.json`,
  `src/data/directory/schema/legislative.schema.json`,
  `src/data/sources/civic-sources.json`
- Frontend:
  `src/pages/government/elected-officials/components/ElectedOfficialsSidebar.tsx`,
  `src/pages/government/elected-officials/index.tsx`,
  `src/pages/government/elected-officials/municipal-committees.tsx`,
  `src/types/directoryTypes.ts`
- Locales: `public/locales/en/common.json`, `public/locales/fil/common.json`
- Tests: `e2e/government/elected-officials.spec.ts`,
  `src/data/__tests__/electedOfficialsProvenance.test.ts`,
  `src/data/__tests__/inheritedRecords.test.ts`
- Docs: `docs/civic-data-verification.md`

## Validation and check results

| Check | Result |
|---|---|
| `vitest` | 502 passed, including 22 new provenance tests |
| Prettier, lint, build, schema validation | pass |
| Elected officials e2e | non-visual tests pass |

Final CI state: all required checks passed, including Validate JSON files
against schema. Deploy to Cloudflare Pages was skipped (no credentials
configured).

## Known limitations and follow-ups

- Ex-officio holders are named by city news, while the council roster only
  describes those seats in general terms; whether to keep publishing them was
  left for review.
- Whether deriving "2025–2028" is acceptable, or RA 7160 Sec. 43 should be cited
  as a source.
- Re-check the ex-officio seats after the next barangay and SK elections.
