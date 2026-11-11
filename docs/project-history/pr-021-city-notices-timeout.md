# PR #21 — fix: time out slow requests to the city notices feed

| | |
|---|---|
| **Merged** | 2026-11-10 |
| **Merge commit** | `bdd679293622dfd7fe1bb8864509b993a6bdb871` |
| **Branch** | `fix/city-notices-timeout` → `main` |
| **Diff** | 1 files, +3 / −0 |
| **Original PR** | <https://github.com/jamesjmnz/better-dagupan/pull/21> (historical reference) |

## Purpose

Stop `/api/city-procurement` hanging when dagupan.gov.ph stops
responding, which left the procurement page's notices section loading
forever.

## Original scope

One change to `functions/api/city-procurement.ts`.

## Technical decisions

Upstream requests abort after 8 seconds. The endpoint returns its existing
`502`, and the page shows its fallback link to the city's procurement page.

## Commits

| Commit | Message |
|---|---|
| `d9cb766` | `fix: time out slow requests to the city notices feed` |

## Files changed

- Functions: `functions/api/city-procurement.ts`

## Validation and check results

| Check | Result |
|---|---|
| Local run with `wrangler pages dev` while the city site was down | 502 after 8.0 s; previously no response at all |
| Functions typecheck, lint | pass |

Final CI state: all required checks passed. Deploy to Cloudflare Pages was
skipped (no credentials configured).

## Known limitations and follow-ups

None recorded at merge.
