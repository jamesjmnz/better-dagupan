# PR #4 — docs: archive early project development history

| | |
|---|---|
| **Merged** | 2026-08-21 |
| **Merge commit** | `e7510f58fc5284a234a7ec38579eb9b87dbc7b4f` |
| **Branch** | `docs/archive-early-project-history` → `main` |
| **Diff** | 4 files, +661 / −0 |
| **Original PR** | <https://github.com/jamesjmnz/better-dagupan/pull/4> (historical reference) |

## Purpose

Preserve the history of PRs #1, #2, and #3 inside the repository, ahead of any
detachment from the BetterLB fork network. Pull request descriptions and Actions
logs live in the GitHub UI and can be lost when a fork is detached, a repository
is transferred, or Actions history is pruned.

## Original scope

Documentation only. No application code, configuration, civic data,
dependencies, or workflows changed.

## Technical decisions

- **Merge order is recorded.** PR #2 merged before PR #1 (06:54:44 vs 06:57:32
  UTC); PR #1 absorbed PR #2's fixes through `568616b` before merging.
- **The boundary commit is documented.** `5f3f25c` is the last inherited
  BetterLB commit; everything at or below it is upstream work.
- **Attribution and licence are restated, not changed.** The archive credits
  BetterLB and BetterGov.ph and points at the existing CC0 `LICENSE`.
- **The archive is frozen.** Each entry describes the repository as it stood at
  merge time; the index points readers at the living documentation.
- **Excluded deliberately:** temporary logs, credentials, local filesystem paths,
  tooling session details, and verbose transcripts.

## Commits

| Commit | Message |
|---|---|
| `a47a55f` | `docs: archive early project development history` |

## Files changed

- `docs/project-history/README.md` — index, merge order, boundary commit,
  attribution, licence
- `docs/project-history/pr-001-project-governance.md`
- `docs/project-history/pr-002-ci-pipeline-health.md`
- `docs/project-history/pr-003-dagupan-identity.md`

## Validation and check results

| Check | Result |
|---|---|
| `npx prettier --check docs/project-history/*.md` | pass |

Final CI state: Code Quality Checks, Unit Tests, Production Build Check, E2E
Smoke Tests, Quality Gate, Security Vulnerability Scan, Code Complexity
Analysis, and zizmor passed. Deploy to Cloudflare Pages was skipped (no
credentials configured).

## Known limitations and follow-ups

None introduced. The follow-ups recorded in the archived entries stayed open.
