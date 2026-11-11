# PR #17 — fix: correct bugs found while documenting the portal

| | |
|---|---|
| **Merged** | 2026-11-10 |
| **Merge commit** | `6fbd3180125140b6a03a194e92d8965012fb7c87` |
| **Branch** | `fix/reported-bugs` → `main` |
| **Diff** | 7 files, +12 / −381 |
| **Original PR** | <https://github.com/jamesjmnz/better-dagupan/pull/17> (historical reference) |

## Purpose

Fix the bugs found while rewriting the documentation in #16.

## Original scope

The DPWH filter, the person merge endpoint path, CORS origins, the admin
GitHub user agent, and an unused script.

## Technical decisions

- **DPWH filter.** The province OR is parenthesised, so Meilisearch applies
  the status filter to every result. Before, `region AND deo OR province AND
  status` grouped the wrong way.
- **Person merge.** The admin tool calls `/api/admin/persons-merge`, the path
  the handler actually serves.
- **CORS.** Allowed origins are shared between `functions/index.ts` and the
  weather API (`functions/utils/origins.ts`), and the weather API now accepts
  the `better-dagupan.pages.dev` origin.
- **Admin sign-in.** GitHub API requests identify as Better Dagupan instead of
  BetterLB.
- **Dead script removed.** The unused national `scripts/generate-llms-txt.js`;
  `llms.txt` is produced by `generate-sitemap.js`.

## Commits

| Commit | Message |
|---|---|
| `71cd607` | `fix: group the DPWH province filter so status filters apply` |
| `7e01e49` | `fix: call the person merge endpoint at its real path` |
| `f615671` | `fix: share CORS origins and allow the Pages domain for weather` |
| `fb21c5b` | `fix: identify admin GitHub requests as Better Dagupan` |
| `6ef8fbd` | `chore: remove the unused national llms.txt generator` |

## Files changed

- Functions: `functions/api/admin/auth/callback.ts`, `functions/api/weather.ts`,
  `functions/index.ts`, `functions/utils/origins.ts`
- Frontend: `src/lib/admin-api.ts`,
  `src/pages/transparency/infrastructure/index.tsx`
- Scripts: `scripts/generate-llms-txt.js`

## Validation and check results

| Check | Result |
|---|---|
| `vitest`, Prettier, lint, build | pass |
| Functions type errors in `functions/index.ts` | unchanged from `main` (cleared later in #18) |

Final CI state: all required checks passed. Deploy to Cloudflare Pages was
skipped (no credentials configured).

## Known limitations and follow-ups

None recorded at merge.
