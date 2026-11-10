# PR #7 — data: publish the verified Dagupan city office directory

| | |
|---|---|
| **Merged** | 2026-08-23 |
| **Merge commit** | `0a05adc4334b2c70e004efdee7724fd0f23321a8` |
| **Branch** | `data/dagupan-department-directory` → `main` |
| **Diff** | 15 files, +2,044 / −400 |
| **Original PR** | <https://github.com/jamesjmnz/better-dagupan/pull/7> (historical reference) |

## Purpose

Populate the city office directory with 34 verified offices, and move the
department pages onto the provenance pattern the barangay index established in
PR #6.

## Original scope

Department sources, schema, records, pages, English and Filipino copy, tests,
and the verification notes in `docs/civic-data-verification.md`.

## The source problem

The city government publishes three department rosters at the same time
(`/directories/`, `/officials/department-heads/`, `/the-city/department-heads/`),
none dated in its content, and they disagree on seven offices. Their CMS
timestamps all fall within the same 70 minutes, so they record a bulk re-save,
not editorial currency. That is noted in each citation's `notes` and never used
as `published`.

## Reconciliation rules

Both rules are mechanical and asserted in tests.

- **Heads** are published only where two independent page families name the
  same person, matching on surname and an overlapping given name. Two
  near-identical pages count as one family.
- **Contacts** (number, address, email) are published only where two of the four
  pages state them. This drops a transposed phone number and a number listed
  under the wrong office without anyone having to spot them.

| | Count |
|---|---|
| Offices published | 34 |
| Heads published | 23 |
| Heads withheld — sources disagree | 7 |
| Heads withheld — one page family only | 4 |

A `department_head_status` field records which reason applies, so the interface
explains a withheld name instead of showing a blank. Non-city bodies (police,
fire, Red Cross, utilities, and the emergency hotline table) are excluded and
asserted absent.

## Technical decisions

- **A fabricated mandate was removed.** The detail page rendered an
  unconditional "Office Mandate" paragraph for every office, containing the
  Los Baños slogan. It had survived only because `departments.json` was empty.
- **Five citations** were added to `civic-sources.json`, all on
  `dagupan.gov.ph`. The 2025 local-election article (published 2025-05-13) is the
  only dated one; it is cited for the Mayor's and Vice Mayor's offices.
- **The e2e spec became assertive.** Its content checks were previously guarded
  by conditions that passed while the dataset was empty.

## Commits

| Commit | Message |
|---|---|
| `6c3a7d0` | `data: cite the Dagupan city office directory sources` |
| `49ac41a` | `data: define the verified department directory schema` |
| `d554947` | `data: publish the verified Dagupan city office directory` |
| `ecd7500` | `fix: remove the fabricated department mandate and inherited slogan` |
| `85ffb00` | `feat: show civic provenance and unverified details on department pages` |
| `2bc6da0` | `feat: localize the department directory in English and Filipino` |
| `602dcf3` | `test: assert department directory provenance and rendering` |
| `64d8152` | `docs: record the department directory verification` |

## Files changed

- Data: `src/data/directory/departments.json` and its schema,
  `src/data/sources/civic-sources.json`
- Code: the department pages and sidebar, `src/lib/officeIcons.ts`,
  `src/types/directoryTypes.ts`
- Locales: `public/locales/{en,fil}/common.json`; `public/llms.txt` corrected by
  hand
- Tests: `departmentProvenance.test.ts`, `inheritedRecords.test.ts`,
  `e2e/government/departments.spec.ts`
- Docs: `docs/civic-data-verification.md`

## Validation and check results

| Check | Result |
|---|---|
| `npm run lint` | pass |
| `npm run test -- --run` | 481 passed (24 files), up from 464 / 23 |
| `npm run build` | pass |
| `--grep @smoke` | 8 passed |
| `e2e/government/departments.spec.ts` | 17 passed (10 of 14 had failed on `main`) |
| Schema validation (departments, civic sources) | pass |
| `tsc -p tsconfig.app.json` | 307 errors, unchanged from the baseline |

The provenance tests were checked against deliberate mutations (picking a side
in a conflict, narrowing a head to one page family, adding an unsourced address
or phone number, reintroducing an excluded body); each one fails the suite.

Final CI state: all required checks passed. Deploy to Cloudflare Pages was
skipped (no credentials configured).

## Known limitations and follow-ups

1. Heads for the 7 conflicting offices need one dated, authoritative roster.
2. Heads for the 4 single-family offices.
3. Per-office addresses for 33 of 34 offices.
4. Per-office hours; only city hall's and the Mayor's Office's are published.
5. 18 single-page contact values dropped by the corroboration rule.
6. No official Citizen's Charter document was found.
7. `scripts/generate-llms-txt.js` still emits upstream branding and drops the
   disclaimer, so it is not safe to run.
8. The licence recorded for the 2018–2020 barangay-captains citation conflicts
   with the site footer's copyright notice; flagged for a decision.
