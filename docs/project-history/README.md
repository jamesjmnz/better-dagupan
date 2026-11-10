# Project History Archive

This directory preserves the record of Better Dagupan's development inside the
repository itself, one entry per merged pull request.

## Why this archive exists

Better Dagupan began as a fork of the [BetterLB][betterlb] (Los Baños) template.
While the fork relationship exists on GitHub, the repository's early pull requests
carry context that lives only in the GitHub UI: why the inherited CI pipeline was
restructured, which configuration values were verified against primary sources and
which were deliberately left unset, and which inherited defects were documented
rather than silently patched.

That context is needed to maintain the portal, but it is not durable. Pull request
descriptions and Actions logs are tied to the hosted fork network — they can be
lost when a fork is detached, a repository is transferred, or Actions history is
pruned. Archiving the substance here makes the reasoning survive independently of
GitHub.

These documents are a historical record. They describe the repository as it stood
when each pull request merged and are **not** updated as the project moves on. For
current guidance, read the files listed under [Living documentation](#living-documentation).

## Archived pull requests

| PR | Title | Merged | Merge commit |
|---|---|---|---|
| [#1](pr-001-project-governance.md) | chore: establish project governance and enable `data` commit type | 2026-08-21 | `2d51b70` |
| [#2](pr-002-ci-pipeline-health.md) | ci: make the CI pipeline produce a trustworthy signal | 2026-08-21 | `e0457b7` |
| [#3](pr-003-dagupan-identity.md) | feat: configure Better Dagupan identity and LGU configuration | 2026-08-21 | `267fab9` |
| [#4](pr-004-project-history-archive.md) | docs: archive early project development history | 2026-08-21 | `e7510f5` |
| [#5](pr-005-branding-and-content-safety.md) | feat: Better Dagupan branding, localization, and inherited-content safety | 2026-08-21 | `1e45793` |
| [#6](pr-006-barangay-index.md) | data: establish civic-data provenance and publish the verified Dagupan barangay index | 2026-08-22 | `682d346` |
| [#7](pr-007-department-directory.md) | data: publish the verified Dagupan city office directory | 2026-08-23 | `0a05adc` |
| [#8](pr-008-runtime-safety.md) | fix: make the portal safe to deploy for Dagupan | 2026-11-10 | `35b7e51` |
| [#10](pr-010-inherited-artifacts.md) | chore: remove the inherited Los Baños data artifacts | 2026-11-10 | `357c8c0` |

Pull requests #9 and #11 were still open when this index was last extended, so
they are not archived. Only merged pull requests are added here.

### Merge order

PR #2 merged before PR #1, which is worth knowing when reading the history.
PR #1 was opened first; enabling GitHub Actions on this fork for the first time is
what exposed the pipeline problems that PR #2 then fixed. PR #2 merged first, and
PR #1 absorbed those fixes through a merge commit (`568616b`) before merging
itself.

```
357c8c0  Merge pull request #10  (inherited data artifacts removed)
35b7e51  Merge pull request #8   (runtime safety)
0a05adc  Merge pull request #7   (city office directory)
682d346  Merge pull request #6   (civic-data provenance, barangay index)
1e45793  Merge pull request #5   (branding and content safety)
e7510f5  Merge pull request #4   (project history archive)
267fab9  Merge pull request #3   (Dagupan identity and configuration)
2d51b70  Merge pull request #1   (project governance)
e0457b7  Merge pull request #2   (CI pipeline health)
5f3f25c  last inherited BetterLB commit (2026-08-11)
```

`5f3f25c` is the boundary: every commit from it downwards belongs to the upstream
BetterLB template, and everything above it is Better Dagupan's own work.

## Reading these documents

Each entry records the same sections: purpose, original scope, technical decisions,
the commit list with its merge commit SHA, validation and check results, known
limitations and follow-ups, the merge date, and a link to the original pull request.

The pull request URLs are kept for historical reference only. They are expected to
stop resolving if the repository is ever detached from the fork network or
transferred, which is precisely why the content is duplicated here.

## Living documentation

This archive is frozen by design. Current, maintained guidance lives elsewhere:

| File | Purpose |
|---|---|
| `README.md` | What the portal is and how to run it |
| `CONTRIBUTING.md` | Which checks gate a pull request, and how to tag a test `@smoke` |
| `ARCHITECTURE.md` | Application structure |
| `CONTEXT.md` | Mandatory vocabulary for the OpenLGU legislative pipeline |
| `FORKING.md` | Re-keying the template for another LGU |
| `docs/adr/` | Binding architecture decisions |
| `docs/MEILISEARCH_INTEGRATION_GUIDE.md` | Transparency data sources and filter values |
| `docs/civic-data-verification.md` | How a civic fact gets published |

## Attribution and licence

Better Dagupan is an independent, community-led project. It is **not** the official
website of the Dagupan City Government.

The portal is derived from the [BetterLB][betterlb] template by
[BetterLosBanos][betterlosbanos], itself a fork of [BetterGov.ph][bettergov]. The
template's architecture, design system integration, and much of its supporting
tooling are retained, and that attribution stands regardless of any future change
to the repository's fork status. Commits at and below `5f3f25c` are the work of the
upstream BetterLB contributors.

Licensing is unchanged by this archive: see `LICENSE` at the repository root
(Creative Commons CC0 1.0 Universal). Government information reproduced in the
portal is public domain; each dataset records its own source agency and retrieval
date where the schema supports it.

[betterlb]: https://github.com/BetterLosBanos/betterlb
[betterlosbanos]: https://github.com/BetterLosBanos
[bettergov]: https://github.com/bettergovph/bettergov
