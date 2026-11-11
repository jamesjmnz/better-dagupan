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
| [#9](pr-009-philgeps-procurement.md) | data: show Dagupan's PhilGEPS procurement records | 2026-11-10 | `ca82c5c` |
| [#10](pr-010-inherited-artifacts.md) | chore: remove the inherited Los Baños data artifacts | 2026-11-10 | `357c8c0` |
| [#11](pr-011-elected-officials.md) | data: publish Dagupan's elected officials | 2026-11-10 | `3775d7c` |
| [#12](pr-012-city-procurement-notices.md) | feat: list the city's own procurement notices | 2026-11-10 | `03b7e63` |
| [#13](pr-013-report-an-error-and-pangasinan.md) | feat: add error reporting and Pangasinan locale scaffolding | 2026-11-10 | `c2b62c8` |
| [#14](pr-014-population-statistics.md) | data: publish Dagupan's census population history | 2026-11-10 | `5295d9c` |
| [#15](pr-015-emergency-hotlines.md) | data: publish Dagupan City emergency hotlines | 2026-11-10 | `dad9722` |
| [#16](pr-016-documentation-refresh.md) | docs: describe Better Dagupan as it is today | 2026-11-10 | `19b29e5` |
| [#17](pr-017-documentation-bug-fixes.md) | fix: correct bugs found while documenting the portal | 2026-11-10 | `6fbd318` |
| [#18](pr-018-typescript-backlog.md) | fix: clear the TypeScript backlog and enforce the type check | 2026-11-10 | `9579830` |
| [#19](pr-019-page-localization.md) | feat: localize the remaining pages in English and Filipino | 2026-11-10 | `0e8206d` |
| [#20](pr-020-e2e-repair-and-accessibility.md) | test: repair the e2e suite and gate on accessibility | 2026-11-10 | `b453e5e` |
| [#21](pr-021-city-notices-timeout.md) | fix: time out slow requests to the city notices feed | 2026-11-10 | `bdd6792` |
| [#22](pr-022-council-ordinances-feed.md) | feat: list the council's posted ordinances on OpenLGU | 2026-11-10 | `ceaac6d` |
| [#23](pr-023-civic-timeline.md) | data: publish Dagupan's civic timeline | 2026-11-10 | `72af83c` |
| [#24](pr-024-cross-browser-e2e.md) | test: make the e2e suite pass across browsers | 2026-11-10 | `26523a6` |
| [#25](pr-025-city-income-and-expenditure.md) | data: publish Dagupan's income and expenditure statements | 2026-11-10 | `0949fb6` |
| [#26](pr-026-competitiveness-scores.md) | data: publish Dagupan's competitiveness scores | 2026-11-10 | `41de4e6` |
| [#27](pr-027-citizens-charter-services.md) | data: publish Dagupan's business permit and clearance services | 2026-11-10 | `4c65a97` |
| [#28](pr-028-quiet-unavailable-apis.md) | fix: handle unconfigured weather and legislative APIs quietly | 2026-11-10 | `19c596d` |

Every merged pull request up to #28 is archived. Only merged pull requests are
added here, and the numbering has no gaps: #9, #11, and #12 merged after #13,
so their entries were added later than their numbers suggest.

### Merge order

PR #2 merged before PR #1, which is worth knowing when reading the history.
PR #1 was opened first; enabling GitHub Actions on this fork for the first time is
what exposed the pipeline problems that PR #2 then fixed. PR #2 merged first, and
PR #1 absorbed those fixes through a merge commit (`568616b`) before merging
itself.

```
4c65a97  Merge pull request #27  (Citizen's Charter services)
19c596d  Merge pull request #28  (quiet unavailable APIs)
41de4e6  Merge pull request #26  (competitiveness scores)
0949fb6  Merge pull request #25  (income and expenditure statements)
72af83c  Merge pull request #23  (civic timeline)
26523a6  Merge pull request #24  (cross-browser e2e)
ceaac6d  Merge pull request #22  (council ordinances feed)
bdd6792  Merge pull request #21  (city notices timeout)
b453e5e  Merge pull request #20  (e2e repair, accessibility gate)
0e8206d  Merge pull request #19  (page localization)
9579830  Merge pull request #18  (TypeScript backlog)
dad9722  Merge pull request #15  (emergency hotlines)
5295d9c  Merge pull request #14  (population statistics)
3775d7c  Merge pull request #11  (elected officials)
03b7e63  Merge pull request #12  (city procurement notices)
ca82c5c  Merge pull request #9   (PhilGEPS procurement)
6fbd318  Merge pull request #17  (bugs found while documenting)
19b29e5  Merge pull request #16  (documentation refresh)
c2b62c8  Merge pull request #13  (error reporting, Pangasinan scaffolding)
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
