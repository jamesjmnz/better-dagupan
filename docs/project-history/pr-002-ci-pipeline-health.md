# PR #2 — ci: make the CI pipeline produce a trustworthy signal

| | |
|---|---|
| **Merged** | 2026-08-21 |
| **Merge commit** | `e0457b7499265d5fe2d24dc1c933550ee02b7973` |
| **Branch** | `ci/pipeline-health` → `main` |
| **Diff** | 5 files, +240 / −18 |
| **Original PR** | <https://github.com/jamesjmnz/better-dagupan/pull/2> (historical reference) |

## Purpose

The CI pipeline inherited from the BetterLB template did not produce a trustworthy
signal on this fork. Enabling GitHub Actions here for the first time — on PR #1 —
exposed three distinct problems. This pull request fixed the pipeline itself. No
application code or civic data was touched.

## Original scope

Workflow configuration, one new end-to-end spec file, and the contributor
documentation describing which checks gate a pull request.

## Problems found

### 1. The end-to-end suite could not finish

`Running 1135 tests using 2 workers` — 227 specs across 5 browser projects, with
`retries: 2` on CI, against `timeout-minutes: 30`. The job was cancelled at 30m18s
mid-run. It had never completed a run on this repository.

### 2. The deploy job failed on every pull request by design

It ran `wrangler pages deploy dist --project-name=betterlb` and exited 1 with
`it's necessary to set a CLOUDFLARE_API_TOKEN environment variable`. No Cloudflare
project exists for this fork, so the job was guaranteed red on every phase pull
request. The `Build` step in that same job succeeded — only the upload failed.

### 3. The accessibility job reported green while running zero tests

It invoked `npx playwright test e2e/accessibility --grep @a11y`, but no
`e2e/accessibility` directory exists. Playwright exited 1 with `No tests found`,
and `continue-on-error: true` converted that failure into a passing check.

## Technical decisions

### Sharding alone was tried first, and was not enough

The suite was split into 4 parallel shards. The run for `a5d7f5c` showed that this
did not rescue it:

| Shard | Result |
|---|---|
| 1 | failed — 186 failed, 1 flaky, 97 passed (22.2m) |
| 2 | cancelled — exceeded the 30m maximum execution time |
| 3 | failed — 174 failed, 110 passed (27.7m) |
| 4 | cancelled — exceeded the 30m maximum execution time |

Two shards ran out of wall clock; the two that finished failed roughly two thirds
of their tests. Those failures were content expectations inherited from the
template (`element(s) not found`, `expect(received).toBeTruthy()`,
`toBeGreaterThan`) — not regressions from the branch. They would stay red, and
change shape repeatedly, throughout the Los Baños purge and the Dagupan
adaptation.

### The full suite was moved off the pull-request path

A check that is red for reasons unrelated to the change under review is worse than
no check. The cross-browser suite moved to `workflow_dispatch` plus a weekly cron
(18:00 UTC Sunday = 02:00 Monday PHT), with the shard timeout raised from 30 to 60
minutes now that nothing waits on it.

Nothing was weakened in the process: lint, unit tests, and the production build
were unchanged and still fail a pull request. Ordinary development is gated by
four checks:

| Check | Command |
|---|---|
| Code Quality Checks | `npm run lint` (plus `tsc --noEmit`, Prettier) |
| Unit Tests | `npm run test -- --run` |
| Production Build Check | `npm run build` |
| E2E Smoke Tests | `npx playwright test --project=chromium --grep @smoke` |

### The smoke suite asserts only what holds for any LGU

`e2e/smoke.spec.ts` was written deliberately free of LGU-specific content
assertions, so that it keeps passing across the Dagupan adaptation instead of
encoding inherited Los Baños records. Its 8 `@smoke` tests assert that each
top-level route resolves to a real page rather than the 404 catch-all, that
`main#main-content` and the nav landmark render, and that the skip link reaches the
main landmark. It ran in 5.1s locally.

This design held up: the suite passed unchanged through PR #3, which rewrote the
entire LGU identity.

### Deploy credentials are resolved as a job output

Secrets are not readable from a job-level `if`, so credential presence is resolved
in the `quality-gate` job and exposed as an output that gates `deploy`. Deployment
resumes automatically once the secrets are set, with no further workflow edit.

## Commits

Seven commits, all preserved through the merge:

| Commit | Message |
|---|---|
| `75d6299` | `ci: shard e2e suite so it completes within the job timeout` |
| `d99469f` | `ci: skip Cloudflare deploy when credentials are absent` |
| `a5d7f5c` | `ci: select accessibility tests by tag instead of a missing directory` |
| `17dd853` | `test: add a chromium smoke suite for pull requests` |
| `a18d936` | `ci: run the cross-browser e2e suite on demand and on a schedule` |
| `75c8921` | `ci: gate pull requests with the chromium smoke suite` |
| `92e29c4` | `docs: document which checks gate a pull request` |

## Files changed

- `.github/workflows/deploy.yml` (+18/−0)
- `.github/workflows/e2e-smoke.yml` (+57/−0, new)
- `.github/workflows/e2e.yml` (+80/−16)
- `CONTRIBUTING.md` (+30/−2)
- `e2e/smoke.spec.ts` (+55/−0, new)

## Validation and check results

Local validation:

| Check | Result |
|---|---|
| `npm run lint` | pass |
| `npx tsc --noEmit` | pass |
| `npm run test -- --run` | pass — 353 tests, 15 files |
| `npx playwright test --project=chromium --grep @smoke` | pass — 8/8 in 5.1s |
| Prettier check on changed files | pass |
| `package-lock.json` | untouched |

`npm run build` was not run locally because it regenerates merged service data in
the working tree; the Production Build Check job covered it.

Final CI state — all checks passing:

| Check | Result |
|---|---|
| Code Quality Checks | pass |
| Unit Tests | pass |
| Production Build Check | pass |
| E2E Smoke Tests | pass |
| Quality Gate | pass |
| Security Vulnerability Scan | pass |
| Code Complexity Analysis | pass |
| zizmor | pass |
| Deploy to Cloudflare Pages | skipped (no credentials configured) |

## Known limitations documented, not fixed

Both were recorded as in-file comments rather than silently patched:

- **The only `@a11y` test is broken.** `e2e/home.spec.ts` calls
  `(page as any).accessibility.scan()`, which is not a Playwright API and throws
  `TypeError: Cannot read properties of undefined (reading 'scan')`. The `as any`
  cast hides this at compile time. It should be rewritten with `AxeBuilder` from
  `@axe-core/playwright`, already used correctly in
  `e2e/reference-implementation.spec.ts` and `e2e/utils/core.spec.ts`.
  `continue-on-error` stays until then. Tagged `TODO(phase-7)`.
- **Visual regression baselines do not exist.** `e2e/**/*.spec.ts-snapshots/` is
  gitignored, so all 21 `@visual` assertions fail with "a snapshot doesn't exist,
  writing actual" (105 failures logged, masked to green). Committing baselines was
  judged not worthwhile while the portal still rendered inherited Los Baños
  content; regenerate them after the purge phase.

## Follow-ups

- Repair the full suite so it can return to a blocking role: fix the inherited
  content expectations after the Los Baños purge, then decide whether it belongs
  back on the pull-request path or stays scheduled.
- Grow the `@smoke` tag as real Dagupan pages land — it should stay small, but it
  should cover every route a contributor can break.
- Configure branch protection on `main` and require the four checks above. At merge
  time `main` was **not** branch-protected, so "required checks" meant only "checks
  that run on the pull request".
- Phase 7: rewrite the `@a11y` test with `AxeBuilder`, then drop
  `continue-on-error`.
- Phase 2+: regenerate visual baselines once Dagupan content is in place.
- Phase 8: set `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` and change
  `--project-name=betterlb` to the real project.
