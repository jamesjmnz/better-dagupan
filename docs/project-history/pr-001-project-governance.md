# PR #1 — chore: establish project governance and enable `data` commit type

| | |
|---|---|
| **Merged** | 2026-08-21 |
| **Merge commit** | `2d51b7068e5c6a5d721a5f3cff47393613664149` |
| **Branch** | `chore/project-governance` → `main` |
| **Diff** | 2 files, +24 / −1 |
| **Original PR** | <https://github.com/jamesjmnz/better-dagupan/pull/1> (historical reference) |

## Purpose

Phase 0 of the Better Dagupan adaptation: project governance only. It established
the working rules for the later adaptation phases and made the `data:` commit type
usable, which the project's commit convention requires for verified civic data
changes.

## Original scope

Governance only. No application code, civic data, or LGU configuration was
changed. Local instruction files were deliberately left untracked and excluded
from the pull request.

## Technical decisions

### The `data:` commit type was rejected before this change

`commitlint.config.js` extended `@commitlint/config-conventional`, whose
`type-enum` has no `data` type, and `.husky/commit-msg` runs commitlint on every
commit. Any `data: ...` commit was therefore rejected outright — a hard blocker for
a project whose commit convention reserves that type for verified civic data.

The fix was an explicit `type-enum` override listing the standard conventional
types plus `data`, rather than disabling the rule. Keeping the enum explicit means
an invalid type is still rejected.

Verified in both directions before and after:

```
$ echo "data: add verified Dagupan barangay directory" | npx commitlint
exit 0

$ echo "banana: nope" | npx commitlint
type must be one of [build, chore, ci, data, docs, feat, fix, perf, refactor,
revert, style, test]
exit 1
```

### `CLAUDE.local.md` needed its own ignore entry

The template already ignored `CLAUDE.md`, but the existing `*.local` pattern does
not match `CLAUDE.local.md`, so local project instructions would have been
committable by accident. It was given an explicit `.gitignore` entry.

## Commits

Two logical commits, both preserved through the merge:

| Commit | Change |
|---|---|
| `a8ec9bb` | `chore: ignore local project instructions` |
| `643a6c9` | `chore: allow data commit type in commitlint` |

A third commit, `568616b` (`Merge branch 'main' into chore/project-governance`),
absorbed the CI fixes from PR #2 so this branch could be validated against a
working pipeline. See the merge-order note in the [archive README](README.md).

## Files changed

- `.gitignore` — one added line
- `commitlint.config.js` — explicit `type-enum` with the standard conventional
  types plus `data`

## Validation and check results

Local validation:

| Check | Result |
|---|---|
| `npm run lint` | pass, no warnings |
| Prettier check on changed files | pass |
| commitlint accepts `data:` | pass |
| commitlint still rejects an invalid type | pass |
| Documented npm scripts all resolve | pass |
| Working tree free of unrelated staged changes | pass |

`npm run test`, `npm run test:e2e`, and `npm run build` were not run locally, since
no application code was touched; CI covered them.

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

Reaching that green state is itself part of the history: the first Actions run on
this pull request is what surfaced the pipeline defects fixed in PR #2.

## Data sources

None. No civic data was added or modified in this phase.

## Known limitations and follow-ups

Recorded at merge time and carried into later phases:

- The fork was still keyed to Los Baños — `package.json` name,
  `config/lgu.config.json`, `README.md`, `src/data/**`, and `public/logos/` all
  remained BetterLB content. *(Configuration addressed in PR #3; content, branding,
  and data still open.)*
- `config/lgu.config.json` `dataPaths` pointed at `src/data/lgu/losbanos/`, which
  does not exist; the real data lives in `src/data/directory/`. *(Fixed in PR #3.)*
- `.github/workflows/deploy.yml` still deployed `--project-name=betterlb` and used
  Node 20 while `.nvmrc` pins `v22.16.0`. *(Still open.)*
