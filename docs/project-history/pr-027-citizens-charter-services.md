# PR #27 — data: publish Dagupan's business permit and clearance services

| | |
|---|---|
| **Merged** | 2026-11-10 |
| **Merge commit** | `4c65a976b7c34571b95d904ed1d8e7972aa7ebf9` |
| **Branch** | `data/dagupan-services` → `main` |
| **Diff** | 23 files, +3,754 / −230 |
| **Original PR** | <https://github.com/jamesjmnz/better-dagupan/pull/27> (historical reference) |

## Purpose

Publish 10 services from the City Government of Dagupan's Citizen's
Charter, all from the One Stop Business Center, with the requirements, steps,
and the fees and processing times printed beside each step.

## Original scope

The Citizen's Charter sources and records, the services schemas and their
CI validation, the merge script, provenance on the service pages, tests, and
the verification record.

## Technical decisions

### Read from archive copies

www.dagupan.gov.ph returned 504 or no response throughout the retrieval
window. Each page was therefore transcribed from its newest Internet Archive
capture (April–July 2026) and compared field by field with the same page's July
2023 capture: all ten are identical. Each source's `url` is the capture
actually read, its notes name the live page, and the service page tells readers
the link opens an archived copy. **These need re-checking against the live
pages once the city site is back.**

### Published

| Service | Fee | Total time |
|---|---|---|
| New business permit | not stated | 30 min |
| Renewal of business permit | not stated | withheld\* |
| Amendment to business permit | not stated | 31 min |
| Retiring a business operation | not stated | 42 min |
| Certification of business record | ₱200.00 | 17 min |
| Certified copy of business permit | ₱100.00 | 12 min |
| Mayor's clearance | ₱50.00 | 16 min |
| Tricycle operator's permit | not stated | 1 h 16 min |
| Mayor's permit for activities | not stated | 40 min |
| Community Tax Certificate | not stated | 8 min |

- On nine pages the step times add up exactly to the printed total, and a test
  checks this.
- \*The renewal page's steps add up to 27 minutes but it prints 30, so the
  total is withheld and the page says why.

### Withheld

- **Fees for seven services.** The pages refer to a "Table of Taxes, Fees and
  Charges" that is not published with them.
- **Staff names** in the "Person Responsible" column: not republished.
- **The "Table of Special Requirements".** Not on the pages, so not linked.

### Code

- **Schemas.** The services schema has a relative `$id`, `sources` on each
  record, and no unknown fields. A new schema covers `citizens-charter.json`,
  and CI validates both.
- **Merge script.** Maps offices to department slugs, keeps unstated fields as
  null, and passes the sources through.
- **Service pages.** Show `SourceNote` / `NotVerified` and an archived-copy
  notice, and keep a single breadcrumb trail.
- **Tests.** The e2e specs gated on services now run. `inheritedRecords`
  deliberately moves the charter files to present-and-Dagupan.

### Decisions recorded for the maintainer

1. **Single source.** The verification guide has no explicit rule for a
   procedure the LGU publishes about itself from one source family. The closest
   precedents (PSGC, census) were applied, with the step-time sums used as an
   internal check.
2. **Archive copies.** `civicSources.test.ts` accepts an archive capture URL
   only when it copies a `gov.ph` page named in its notes.
3. **A conflicting city page.** An undated "Business Permit Processing" page
   lists extra requirements for retiring a business. This is recorded in the
   docs and not resolved.

## Commits

| Commit | Message |
|---|---|
| `1714a49` | `fix: give service pages a single breadcrumb trail` |
| `8217361` | `feat: carry civic sources through the services merge` |
| `05f021e` | `feat: show provenance on service pages` |
| `2cc6509` | `chore: validate the services data in CI` |
| `5e27a1e` | `data: cite the city's citizen's charter pages` |
| `0d6253f` | `feat: say when a service cites an archived copy` |
| `5e9e61b` | `data: publish Dagupan's business permit and clearance services` |
| `166cc31` | `test: assert services provenance` |
| `36aed6c` | `test: cover the published services in the e2e specs` |
| `70df712` | `docs: record the services verification` |

## Files changed

- Config and CI: `.github/workflows/validate-json-schema.yml`
- Data: `src/data/citizens-charter/citizens-charter.json`,
  `src/data/citizens-charter/merged-services.json`,
  `src/data/citizens-charter/schema/citizens-charter.schema.json`,
  `src/data/schema/services.schema.json`, `src/data/sources/civic-sources.json`
- Frontend: `src/components/home/Hero.tsx`, `src/lib/citizens-charter.ts`,
  `src/pages/services/[service].tsx`, `src/pages/services/layout.tsx`,
  `src/pages/services/components/ProcessTimeline.tsx`,
  `src/pages/services/components/RequirementCard.tsx`,
  `src/types/citizens-charter.ts`, `src/types/servicesTypes.ts`
- Locales: `public/locales/en/services.json`, `public/locales/fil/services.json`
- Scripts: `scripts/merge_citizens_charter.py`
- Tests: `e2e/services/index.spec.ts`, `e2e/services/service-detail.spec.ts`,
  `src/data/__tests__/civicSources.test.ts`,
  `src/data/__tests__/inheritedRecords.test.ts`,
  `src/data/__tests__/servicesProvenance.test.ts`
- Docs: `docs/civic-data-verification.md`

## Validation and check results

| Check | Result |
|---|---|
| `vitest` | 653 passed |
| Typecheck, Prettier, lint, build, schema validation | pass |
| `e2e/services/**` | 25 passed |

Final CI state: all required checks passed, including Validate JSON files
against schema. Deploy to Cloudflare Pages was skipped (no credentials
configured).

## Known limitations and follow-ups

- Re-check all ten services against the live dagupan.gov.ph pages once the site
  responds.
- Resolve the conflicting "Business Permit Processing" page.
