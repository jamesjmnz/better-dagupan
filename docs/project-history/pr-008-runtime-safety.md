# PR #8 — fix: make the portal safe to deploy for Dagupan

| | |
|---|---|
| **Merged** | 2026-11-10 |
| **Merge commit** | `35b7e5197e7f826071215fb4f2f15e5beb7bcfcd` |
| **Branch** | `fix/runtime-safety` → `main` |
| **Diff** | 47 files, +415 / −1,345 |
| **Original PR** | <https://github.com/jamesjmnz/better-dagupan/pull/8> (historical reference) |

## Purpose

Make the portal safe to deploy and remove the remaining runtime ties to Los
Baños. `wrangler.jsonc` still bound the template's production D1 database, KV
namespace, and project name, and the deploy workflow targeted the `betterlb`
Pages project. Deploying as it stood would have served Los Baños legislation as
Dagupan's.

## Original scope

Cloudflare configuration, the OpenLGU API and pages, CI workflows, removal of
unused inherited features, LGU-derived wording, broken links, and three fixes
ported from upstream BetterLB.

## Technical decisions

- **Cloudflare.** `wrangler.jsonc` names the `better-dagupan` project, binds no
  D1 or KV (they are added once Better Dagupan's own resources exist), and sets
  `GITHUB_REPO` to this repository. CORS allows only Better Dagupan origins.
- **Legislative API.** `functions/api/openlgu/_middleware.ts` answers `503`
  (`legislative_data_unavailable`) while no database is bound, and the OpenLGU
  pages show an honest "not published yet" state in English and Filipino.
- **CI.** Workflows take Node from `.nvmrc`; deploy targets `better-dagupan`;
  e2e jobs are pinned to `ubuntu-24.04`, a runner Playwright supports.
- **Removed:** the Los Baños news scraper and its homepage section, the empty
  bids page and its spec, the unused instant-search component, an empty charter
  schema file, and the unused `dataPaths` and `features.tourism` config.
- **Wording.** The council name and PDF host derive from config
  (`functions/utils/lgu.ts`), so copy reads Sangguniang Panlungsod and "city".
- **Broken links.** Discord links appear only when a server is configured; the
  sitemap page lists the portal's real routes; the public works card links to
  `/transparency/infrastructure`; the reference implementation page is dev-only.
- **Ported from upstream BetterLB:** the public BetterGov search key as the
  Meilisearch default, one Mayor and Vice Mayor per term in the terms API, and
  stat card trend rounding.
- **Other.** Local worktree directories are ignored by lint and tests, and
  `.dev.vars.example` uses placeholder admin logins.

## Commits

| Commit | Message |
|---|---|
| `02901a1` | `chore: point Cloudflare config at Better Dagupan` |
| `7df33f3` | `fix: answer 503 when the legislative database is not bound` |
| `5d5d300` | `fix: restrict CORS to Better Dagupan origins` |
| `024e81f` | `ci: run workflows on the pinned Node version` |
| `6034d60` | `ci: deploy to the better-dagupan Pages project` |
| `5693e81` | `chore: remove the inherited Los Baños news scraper` |
| `3b6cd73` | `fix: derive council name and PDF host from LGU config` |
| `9078e34` | `fix: use LGU labels in legislative and transparency copy` |
| `a2d365c` | `chore: ignore local worktrees in lint and tests` |
| `d427744` | `fix: show Discord links only when a server is configured` |
| `5f5a1da` | `fix: build the sitemap page from the portal's own routes` |
| `175c6af` | `fix: link the public works card to the infrastructure route` |
| `e1f179d` | `chore: remove the empty bids page and its spec` |
| `901908b` | `chore: remove the empty citizens charter schema file` |
| `5baff45` | `chore: drop the unused dataPaths and tourism config` |
| `49daff8` | `chore: remove the unused instant search component` |
| `67327ee` | `fix: keep the reference implementation page out of production` |
| `50d96c2` | `chore: use placeholder admin logins in the dev vars example` |
| `1a5d119` | `feat: show an empty state when no legislative records exist` |
| `70a6ced` | `fix: default to the public BetterGov search key` |
| `cd7d6e9` | `fix: pick one mayor and vice mayor per legislative term` |
| `63211c0` | `fix: round stat card trends to one decimal` |
| `ec2423d` | `fix: use a Dagupan source example in the contribution form` |
| `fc23bf5` | `style: format the LGU helper and transparency index` |
| `a721a18` | `ci: pin e2e jobs to a runner Playwright supports` |

## Files changed

- Config and CI: `wrangler.jsonc`, `config/lgu.config.json`, `.env.example`,
  `.dev.vars.example`, `.github/workflows/*.yml`, the contribution issue
  template, `eslint.config.js`, `vitest.config.ts`
- Functions: `functions/api/openlgu/_middleware.ts` (new),
  `functions/api/openlgu/terms.ts`, `functions/utils/lgu.ts` (new),
  `functions/index.ts`; `functions/api/lgu-news.ts` removed
- Frontend: OpenLGU pages, sitemap page, home and contact pages,
  `src/lib/meilisearch.ts`, `src/lib/lguConfig.ts`, `StatCard`; the news section,
  instant-search component, and bids page removed
- Locales: `public/locales/{en,fil}/common.json`

## Validation and check results

| Check | Result |
|---|---|
| `npm run lint` | clean |
| `vitest` | 482 passed |
| `npm run build` | pass |
| e2e `@smoke` | 8/8 |

A wider e2e run (home, services, statistics, transparency, components, safety,
disclaimer) showed no new failures against `main`, and 15 tests that failed on
`main` passed. The remaining failures already occurred on `main`, mostly in
specs that expect data not yet published.

Final CI state: all required checks passed, including Validate JSON files
against schema. Deploy to Cloudflare Pages was skipped (no credentials
configured).

## Known limitations and follow-ups

- Bind Better Dagupan's own KV namespace (weather) once it exists, in the deploy
  phase.
- Re-key the legislative pipeline for the Sangguniang Panlungsod in a later
  phase.
