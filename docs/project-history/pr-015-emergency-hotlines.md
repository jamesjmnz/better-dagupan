# PR #15 — data: publish Dagupan City emergency hotlines

| | |
|---|---|
| **Merged** | 2026-11-10 |
| **Merge commit** | `dad97228b8674ad0ec2f6d0162c4bcce7ddb7209` |
| **Branch** | `data/dagupan-emergency-hotlines` → `main` |
| **Diff** | 15 files, +802 / −61 |
| **Original PR** | <https://github.com/jamesjmnz/better-dagupan/pull/15> (historical reference) |

## Purpose

Publish Dagupan City's emergency hotlines next to the national
hotlines.

## Original scope

The hotlines dataset and schema, the home page hotlines widget, a fix
for `tel:` links, tests, and the verification record.

## Technical decisions

### Rule applied

A number is published only when two of three independent city lists state it:
the emergency list (the Directory hotline table and the Contact Us page are the
same 14 rows, so they count as one list), roster A, and roster B. This follows
the department directory precedent.

### Published

10 entries with 25 numbers in `src/data/directory/hotlines.json`, plus a JSON
schema:

- PNP, BFP, CDRRMO, City Health Office and CSWDO appear on all three lists.
- PESO and POSO are corroborated.
- PANDA Volunteers, Red Cross and DECORP are corroborated by a second table on
  the Directory page. The test names this exception explicitly.

### Withheld

- **PAMANA:** its number is also CSWDO's.
- **Anti-VAWC, anti-bullying and anti-suicide helplines:** each appears on only
  one official list.

### Other changes

- The hotlines widget is back on the home page, with the city group above the
  national numbers, `tel:` links, a source note, and a note about withheld
  numbers.
- **Fix:** `tel:` links were built only for the inherited 049 area code, so
  Dagupan's (075) landlines, including those on department pages, had no
  working link.
- The four existing city sources were re-read and their verification dates
  refreshed. The 38 department numbers and 23 heads still matched.

## Commits

| Commit | Message |
|---|---|
| `7b89ee6` | `fix: build tel links for any Philippine area code` |
| `ae902f7` | `data: publish Dagupan City emergency hotlines` |
| `ac542bf` | `feat: show city hotlines alongside national hotlines` |
| `385da11` | `test: assert city hotline provenance` |
| `1ddd9ed` | `docs: record the hotline verification` |

## Files changed

- Data: `src/data/directory/hotlines.json`,
  `src/data/directory/schema/hotlines.schema.json`,
  `src/data/sources/civic-sources.json`
- Frontend: `src/components/widgets/CriticalHotlinesWidget.tsx`,
  `src/components/widgets/index.ts`, `src/lib/utils.ts`, `src/pages/Home.tsx`,
  `src/types/directoryTypes.ts`
- Locales: `public/locales/en/common.json`, `public/locales/fil/common.json`
- Tests: `e2e/components/hotlines.spec.ts`,
  `src/data/__tests__/hotlinesProvenance.test.ts`,
  `src/data/__tests__/inheritedRecords.test.ts`, `src/lib/utils.test.ts`
- Docs: `docs/civic-data-verification.md`

## Validation and check results

| Check | Result |
|---|---|
| `vitest` | 525 passed, including the new hotline provenance test |
| Prettier, build | pass |
| Home and departments e2e | no new failures |

Final CI state: all required checks passed, including Validate JSON files
against schema. Deploy to Cloudflare Pages was skipped (no credentials
configured).

## Known limitations and follow-ups

- The three crisis helplines need a second official source before they can be
  published.
- Whether the home page is the right place for the hotlines widget was left
  open.
