# PR #10 — chore: remove the inherited Los Baños data artifacts

| | |
|---|---|
| **Merged** | 2026-11-10 |
| **Merge commit** | `357c8c00ffe54880b740fba4cf2b3cbc3a446e37` |
| **Branch** | `chore/remove-inherited-artifacts` → `main` |
| **Diff** | 2,234 files, +373 / −106,737 |
| **Original PR** | <https://github.com/jamesjmnz/better-dagupan/pull/10> (historical reference) |

## Purpose

Study, document, and then remove the Los Baños data artifacts that were still
tracked in the repository, so that none of them could be mistaken for or loaded
as Dagupan data.

## Original scope

One new reference document, deletion of inherited data files, and the small code
and documentation changes needed so nothing referred to the deleted files. The
files remain in git history.

## Technical decisions

### Documented before removal

`docs/reference/betterlb-data-model.md` records how BetterLB shaped its data: the
D1 export's tables and relationships, the legislative staging CSV, the PDF
layout, the procurement and competitiveness dumps, the Citizen's Charter
snapshots, which scripts read them, and what each means for Dagupan. It also
covers the Sangguniang Panlungsod's WordPress ordinance feed as a future
source. Examples are placeholders; it contains no Los Baños names or document
text.

### Removed

| Path | What it was |
|---|---|
| `remote_db.sql` | The Los Baños D1 export |
| `pipeline/data/**` | Legislative CSVs and about 1 GB of PDFs (2,193 files) |
| `raw_data/**` | Procurement HTML dumps and `cmci.csv` |
| `.backups/**` | Citizen's Charter snapshots; now also gitignored |
| `functions/api/admin/review-queue.mock.ts` | Unused mock |

### Adjusted

- Admin mock data in `src/pages/admin/ReviewQueue.tsx` and
  `src/components/admin/SessionAttendanceQuickEdit.tsx` uses neutral
  `example.gov.ph` fixtures.
- `scripts/merge_citizens_charter.py` no longer maps Los Baños offices.
- `scripts/openlgu/collect-source-records.cjs` exits with a clear message when
  its input CSV is absent.
- `README.md`, `ARCHITECTURE.md`, `CONTEXT.md`, and
  `docs/openlgu/source-pipeline.md` no longer describe the removed files.

## Commits

| Commit | Message |
|---|---|
| `3acd3c0` | `docs: document the inherited BetterLB data model` |
| `839d77e` | `chore: remove inherited Los Baños database export` |
| `ff8ffb5` | `chore: remove inherited Los Baños pipeline data` |
| `86fc291` | `chore: remove inherited raw data and charter backups` |
| `04c071b` | `refactor: replace Los Baños admin mock data with neutral fixtures` |
| `e55b795` | `chore: drop Los Baños office mapping from charter merge script` |

## Files changed

Outside the deleted data trees, 13 files: `.gitignore`, `README.md`,
`ARCHITECTURE.md`, `CONTEXT.md`, `docs/openlgu/source-pipeline.md`,
`docs/reference/betterlb-data-model.md` (new),
`functions/api/admin/review-queue.mock.ts` (removed), `remote_db.sql` (removed),
`scripts/merge_citizens_charter.py`, `scripts/openlgu/collect-source-records.cjs`,
`src/components/admin/SessionAttendanceQuickEdit.tsx`,
`src/pages/admin/ReviewQueue.tsx`, and `src/types/citizens-charter.ts`.

## Validation and check results

| Check | Result |
|---|---|
| `vitest` | 482 passed |
| `npm run lint` | pass |
| Prettier | pass |
| `npm run build` | pass |
| `npm run merge:services` | pass |

Final CI state: all required checks passed. Deploy to Cloudflare Pages was
skipped (no credentials configured).

## Known limitations and follow-ups

The pull request recorded no follow-ups. Two related gaps were still open when it
merged:

- The legislative collectors in `scripts/openlgu/` still target
  `losbanos.gov.ph`; re-keying them is a later phase.
- `db/migrations/002_baseline_data.sql` still seeds the template's Sangguniang
  Bayan terms.
