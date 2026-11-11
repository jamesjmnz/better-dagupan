# PR #9 — data: show Dagupan's PhilGEPS procurement records

| | |
|---|---|
| **Merged** | 2026-11-10 |
| **Merge commit** | `ca82c5cad15e27f0c196a30088e969bf609fdaeb` |
| **Branch** | `data/dagupan-procurement` → `main` |
| **Diff** | 6 files, +49 / −16 |
| **Original PR** | <https://github.com/jamesjmnz/better-dagupan/pull/9> (historical reference) |

## Purpose

Turn on the procurement page for Dagupan by pointing it at the city
government's exact PhilGEPS entity names, and fix two infrastructure stat
cards.

## Original scope

The PhilGEPS entity names in config, support for more than one name per
LGU, a test pinning them, and two formatting fixes on the infrastructure
page.

## Technical decisions

### Procurement

PhilGEPS lists the City Government of Dagupan under two exact entity names in
the shared BetterGov index:

| Entity name (exact) | Contracts | Period |
|---|---|---|
| `CITY OF DAGUPAN  - PANGASINAN` (double space) | 1,966 | 2019-10 to 2025-12 |
| `CITY OF DAGUPAN, PANGASINAN` | 1,670 | 2006-11 to 2019-06 |

- **Confirmation.** The `philgeps_organizations` index was queried with the
  public search key, and the names were cross-checked against the city's own
  procurement posts on dagupan.gov.ph: both list works at the city-run
  Malimgas Market.
- **Excluded entities.** Other "Dagupan" entities (the water district, the
  DepEd division, DENR PENRO, barangays elsewhere) are left out.
- **Config.** `transparency.procurement.organizationName` becomes
  `organizationNames`, current name first. The page filters with
  `organization_name IN [...]` and sums the exact-name aggregates.
- At merge the page showed 3,636 contracts, about ₱4.23 B in total.

### Infrastructure

- The total allocation is formatted as pesos (₱2.64 B), and the fiscal year
  shows as `2025` instead of `2,025`.
- The existing DPWH filter (Region I, Pangasinan 2nd DEO, "Dagupan") returned
  200 Dagupan projects and was left unchanged.

## Commits

| Commit | Message |
|---|---|
| `ac44d35` | `feat: support several PhilGEPS entity names per LGU` |
| `b9cd031` | `data: point procurement at Dagupan's PhilGEPS entities` |
| `83f58e0` | `test: pin the procurement entity names` |
| `3bfa9f1` | `fix: format infrastructure totals and fiscal year` |

## Files changed

- Config and CI: `config/lgu.config.json`
- Frontend: `src/lib/lguConfig.ts`,
  `src/pages/transparency/infrastructure/index.tsx`,
  `src/pages/transparency/procurement/index.tsx`
- Scripts: `scripts/setup-lgu.cjs`
- Tests: `src/lib/__tests__/portalIdentity.test.ts`

## Validation and check results

| Check | Result |
|---|---|
| `vitest` | 483 passed, including a new test pinning the entity names |
| Prettier, lint, build | pass |
| Browser check | both pages against the live index |

Final CI state: all required checks passed. Deploy to Cloudflare Pages was
skipped (no credentials configured).

## Known limitations and follow-ups

None recorded at merge.
