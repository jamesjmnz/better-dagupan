# The inherited BetterLB data model

Better Dagupan was forked from BetterLB, the Los Baños portal. The fork
shipped with the data Los Baños had collected for itself: a D1 database
export, a legislative staging CSV with about 1 GB of PDFs, procurement and
competitiveness dumps, and Citizen's Charter snapshots. None of it describes
Dagupan, so it has been removed from the repository.

This page records how that data was shaped before it went, because the
OpenLGU schema, the scripts and the review tooling still assume the same
shapes. Use it to plan the Dagupan equivalents. It deliberately contains no
Los Baños records, names or document text; every example below is a
placeholder.

Vocabulary follows [`CONTEXT.md`](../../CONTEXT.md): source record, staged
record, canonical record, canonical term, and so on.

## Summary

| Artifact | What it was | Size | Read by |
|---|---|---|---|
| `remote_db.sql` | Full export of the Los Baños OpenLGU D1 database, pre-rebuild schema | 1.7 MB, 5,342 lines | Nothing in the repo |
| `pipeline/data/documents.csv` | Legacy manual staging CSV of legislative documents | 2,169 rows | `scripts/openlgu/collect-source-records.cjs` |
| `pipeline/data/documents copy.csv` | Older variant of the same CSV, with attendance | 2,298 rows | Nothing |
| `pipeline/data/terms.csv`, `term_members.csv` | Council terms and rosters | 4 and 36 rows | Nothing |
| `pipeline/data/pdfs/**` | Downloaded legislative PDFs | 2,193 files, about 1.0 GB | Nothing |
| `raw_data/*.txt`, `unified_procurement.*` | Procurement tables saved from the municipal website | 5 HTML dumps, 415 joined records | `raw_data/unify_procurement.py` only |
| `raw_data/cmci.csv` | DTI competitiveness scores, 2014–2024 | 55 indicator rows | Nothing; `cmci.json` mirrors its shape |
| `.backups/citizens-charter/**` | Snapshots of the Citizen's Charter JSON and a duplicates report | 15 files, 2.6 MB | Nothing |

Deleting the files does not remove them from git history; they remain
reachable in commits before the removal.

## 1. The D1 export (`remote_db.sql`)

A `wrangler d1 export` of the production Los Baños database. Its
`d1_migrations` table lists only `001_initial_schema.sql` and
`002_add_mayor_fk.sql`, so it predates the rebuild described in
[`docs/openlgu/schema-rebuild.md`](../openlgu/schema-rebuild.md) and
[ADR 0003](../adr/0003-openlgu-schema-rebuild.md). The current schema lives in
`db/migrations/001_initial_schema.sql`.

### Tables and row counts

| Table | Rows | Notes |
|---|---|---|
| `terms` | 4 | One per council term; `id` like `sb_12`, with date range, ordinal and mayor / vice mayor (text and FK) |
| `persons` | 28 | `id` is a surname-first slug; first, middle, last name, suffix, aliases, photo URL |
| `memberships` | 39 | Person in a term: `chamber`, `role`, `rank`, optional tenure dates |
| `committees` | 23 | `id` is a snake_case slug of the committee name; all `type = regular` |
| `committee_memberships` | 261 | Person, committee, term, role (Chairperson, Vice Chairperson, Member) |
| `sessions` | 473 | `id` = `<term>_<date>`; type Regular (469), Special (3), and one placeholder "Executive" session |
| `session_absences` | 331 | One row per absent person per session, across 116 sessions; `reason` and `excuse_type` never filled |
| `documents` | 2,372 | 1,614 resolutions, 620 ordinances, 138 executive orders |
| `document_authors` | 1,574 | Document–person pairs, all `author_type = primary` |
| `subjects`, `document_subjects` | 0 | Never populated |
| `review_queue`, `data_conflicts`, `facebook_session_data`, `audit_log` | 0 | Old-pipeline tables, empty in this export |

### How the tables relate

```
terms ──< memberships >── persons ──< committee_memberships >── committees
  │                          │
  └──< sessions ──< session_absences (person_id)
         │
         └──< documents ──< document_authors (person_id)
```

- Attendance was recorded as **absences only**. Presence was implied by a
  membership in the session's term.
- Every document had a `session_id`. Executive orders all pointed at a single
  synthetic session, which the schema rebuild dissolved (executive orders do
  not belong to sessions).
- The term FK was inconsistent: `terms.id` used `sb_9`, while sessions and
  memberships for that term used `sb_09`. `scripts/openlgu/migrate-data.cjs`
  still carries the `fixTermId` patch for it.
- Foreign keys were not enforced. 241 documents pointed at a `session_id` with
  no session row, and 22 author rows and 16 absence rows pointed at persons
  that did not exist.

### Document fields

```sql
-- placeholder row, not a real record
INSERT INTO documents (id, type, number, title, session_id, status,
  date_enacted, pdf_url, moved_by, seconded_by, source_type, needs_review)
VALUES ('ordinance_sb_12_2025-0001', 'ordinance', '2025-0001',
  'AN ORDINANCE EXAMPLE TITLE', 'sb_12_2025-01-01', 'active', '2025-01-01',
  'https://example.gov.ph/storage/ordinances/Ordinance No. 2025-0001.pdf',
  NULL, NULL, 'pdf', 0);
```

- Document `id` encoded type, term and number:
  `<type>_<term>_<number>`, with `resolution_legacy_<number>` for older items.
- Publication and verification were not modelled. Every row had
  `status = active`, `source_type = pdf`, `needs_review = 0`,
  `processed = 1`. `date_filed`, `content_preview` and `full_text` were empty
  for every row; `moved_by` was set on 239 resolutions.
- Quality problems the new pipeline was built to catch: 433 type-plus-number
  pairs shared by more than one row (often spacing variants such as
  `2019-0001` vs `2019 -0001`, which the pipeline now treats as unresolved
  collisions); 19 documents without a date; 8 dated `1990-01-01` as a
  placeholder; 3 without a title.
- The rebuilt schema replaces `status`, `needs_review` and `processed` with
  `publication_status` and `verification_state`, adds `term_id` on documents,
  and moves movers and seconders into staging evidence.

### Consumers

Nothing reads `remote_db.sql`. `migrate-data.cjs` performed the rebuild from a
JSON export of the same tables in `pipeline/openlgu/reference/remote-*.json`,
which was never committed and which the script treats as optional.

## 2. Legislative staging data (`pipeline/data/`)

### `documents.csv` — the Legacy Manual Staging CSV

```csv
type,status,subjects,number,title,date_enacted,term_id,raw_author_text,pdf_url,filename,id,session_id
ordinance,active,,2025-0001,AN ORDINANCE EXAMPLE TITLE,2025-01-01,sb_12,Hon. Example A. Person,https://example.gov.ph/storage/ordinances/Ordinance No. 2025-0001.pdf,Ordinance No. 2025-0001.pdf,ordinance_sb_12_2025-0001,sb_12_2025-01-01
```

- 2,169 rows: 1,395 resolutions, 609 ordinances, 165 executive orders.
- Hand-edited. `status` was always `active`; `subjects` always empty.
- `term_id` was `unknown_term` on 446 rows, and 436 rows had no date. Only 904
  rows had a `session_id`.
- `raw_author_text` (1,444 rows) was free text: a name with a middle initial,
  several names, sometimes a trailing date, sometimes collective authorship.
- `pdf_url` pointed at the municipal website's storage folders, one per type.

`collect-source-records.cjs` converts this file into source records with
source id `legacy_manual_documents_csv`. It was already removed from the
shadow pipeline chain; the website collector is the primary source.

### `documents copy.csv`

An older variant with one extra column, `absent_ids`: a comma-separated list
of person ids absent at the document's session (659 rows set). It had 2,298
rows, 1,955 of them sharing an id with `documents.csv`. Attendance appears to
have reached `session_absences` this way: absences travelled on document rows
and were collapsed per session at import.

### `terms.csv` and `term_members.csv`

```csv
id,term_number,ordinal,name,start_date,end_date,year_range,mayor,vice_mayor
sb_12,12,12th,12th Sangguniang Bayan,2025-07-01,2028-06-30,2025-2028,Example Mayor,Example Vice Mayor

term_id,person_id,role,full_name,rank
sb_12,person-example-a,Councilor,Example A. Person,1
```

Three terms carried rosters, each with eight councilors, the vice mayor, the
SK federation president, the Liga ng mga Barangay president and the council
secretary. Terms are canonical reference data maintained by hand
([ADR 0002](../adr/0002-maintain-terms-as-canonical-reference-data.md)); the
same four terms are still seeded by `db/migrations/002_baseline_data.sql`.

### `pdfs/`

```
pipeline/data/pdfs/
├── executive_orders/   141 files,  99 MB
├── ordinances/         768 files, 344 MB
└── resolutions/      1,284 files, 600 MB
```

Filenames were kept exactly as the municipal website served them, so they
are inconsistent: `Ordinance No. 2025-0001.pdf`,
`Ordinance No. 2025 - 0001_1700000000.pdf` (a ten-digit upload timestamp),
`Resolution No.  2025-01.pdf` (double space), `Resolution No. 2025-01 (1).pdf`
(a browser download duplicate), `EO-2025-001_1700000000.pdf`. The Python
scrape, normalize and parse scripts that produced and read them were never
part of this repository. Under the current model a downloaded PDF is a PDF
mirror: evidence that does not replace the official URL.

### Sources

- **Website table rows** from the municipal site's resolutions, ordinances and
  executive orders pages: the primary source of number, title, date, author,
  committees and PDF URL. `collect-website-source-records.cjs` still targets
  those three pages.
- **Facebook posts** about council sessions: session dates, movers,
  seconders and some authors. `collect-facebook-posts.cjs` reads saved post
  text from `pipeline/openlgu/fixtures/facebook/` and never calls Facebook.
- **OCR text** from scanned PDFs: enrichment only.

## 3. Procurement and competitiveness (`raw_data/`)

### Procurement dumps

Five `.txt` files, each the saved HTML of one DataTables table from the
municipal website's bids and awards pages:

| File | Columns | Rows |
|---|---|---|
| `bacresolution.txt` | Title, Action (PDF link) | ~120 |
| `biddinginvite.txt` | Reference no., Project Title, ABC, Invitation File, Bid Docs, Requirements | ~80 |
| `noticeofaward.txt` | Reference No., Project Title, Contractor / Supplier, ABC, Contract Price, Action | ~414 |
| `noticetoproceed.txt` | same as above | ~412 |
| `bidcontract.txt` | same as above | ~413 |

`unify_procurement.py` (pandas and BeautifulSoup) outer-joined the award,
notice-to-proceed and contract tables on all five text columns and wrote
`unified_procurement.csv` and `unified_procurement.json`:

```json
{
  "reference_no": "25-GOODS-01",
  "project_title": "Supply and Delivery of Example Items",
  "contractor": "Example Supplier",
  "abc": 100000.0,
  "contract_price": 95000.0,
  "documents": { "noa": "public/storage/...", "ntp": "public/storage/...", "contract": "public/storage/..." }
}
```

Reference numbers follow `YY-GOODS-NN`, `YY-SVP-NN`, `YY-INFRA-NN` and
`YY-NNP-NN`, plus a seven-digit form. The portal never read these files: the
procurement page queries PhilGEPS records through the shared Meilisearch
instance, filtered by `transparency.procurement.organizationName` in
`config/lgu.config.json`.

### `cmci.csv`

The DTI Cities and Municipalities Competitiveness Index: one row per pillar or
indicator (overall score, the five pillars, then indicators), one column per
year from 2014 to 2024. Missing values were written as `0.0000` or `-`: the
2018 overall and pillar scores are all `0.0000`, which meant "not
available", not a score of zero. It was converted by hand into the shape of
`src/data/statistics/cmci.json` (`meta.years`, `overall_score`, `pillars`),
which is now empty and guarded by `inheritedRecords.test.ts`.

## 4. Citizen's Charter snapshots (`.backups/citizens-charter/`)

Thirteen timestamped copies of `citizens-charter.json`, a copy of
`merged-services.json`, and a `duplicates-report.md`, all from February 2026.
No script in this repository wrote them.

The snapshots trace a cleanup: 190 services, then 178, then 154, then 56. The
56 that remained were the "authoritative" services, in charter sections 1–8.
Sections 9 and up were treated as unverified and dropped.

```json
{
  "service_number": "1.1",
  "service_name": "Example Permit Issuance",
  "office_division": "EXAMPLE OFFICE",
  "classification": "Simple",
  "type_of_transaction": "G2C",
  "who_may_avail": "All",
  "requirements": [{ "requirement": "Example form", "where_to_secure": "Example office" }],
  "client_steps": [{ "step": 1, "action": "Submit the form" }],
  "fees": { "amount": "None", "description": "" },
  "processing_time": "1 day",
  "plain_language_name": "Get an example permit"
}
```

Earlier snapshots also had `person_responsible`, `note`, `fee_schedule` and
other one-off keys. `scripts/merge_citizens_charter.py` turns each service
into the camelCase service shape in `merged-services.json` (`serviceNumber`,
`officeDivision`, `officeSlug`, `category`, `detailedRequirements`,
`clientSteps`, `dataComplete`, `needsVerification`).

`scripts/detect_citizens_charter_duplicates.py` compared every authoritative
service with the unverified services of the same normalized office, using
`difflib.SequenceMatcher` on normalized names: 95% or more was a definite
duplicate, 85–94% needed review. The authoritative service always won. The
surviving report scanned 176 services (56 authoritative, 120 unverified) and
found no duplicates.

## What this means for Dagupan

- **The council is a Sangguniang Panlungsod**, not a Sangguniang Bayan. Term
  ids, ordinals and dates must come from Dagupan sources;
  `db/migrations/002_baseline_data.sql`, the `inferTermId` ranges in
  `migrate-data.cjs` and the `sb_` id prefix are all Los Baños values to
  replace when the legislative pipeline is re-keyed.
- **A better first source exists.** `sp.dagupan.gov.ph` is a WordPress site
  whose REST API exposes an `ordinance` post type
  (`https://sp.dagupan.gov.ph/wp-json/wp/v2/ordinance`, about 147 items from
  2021 to 2026), a `councilor` post type, and a `classification` taxonomy that
  tags only some ordinances. That is structured JSON, so the Dagupan
  collector can emit source records without parsing HTML tables. Note that a
  WordPress post `date` is when the item was published on the site, not when
  the ordinance was enacted. No resolution or executive order feed was found.
- **Keep the pipeline's stages.** Website rows become source records first,
  then staged records, and are promoted to canonical records only after
  review. The legacy CSV path should not be revived for Dagupan.
- **Model attendance directly.** Attaching absences to document rows, as
  `documents copy.csv` did, cannot record a session that produced no
  documents. Capture attendance per session.
- **Enforce references.** Validate session and person ids before promotion so
  the dangling references seen in the export cannot recur.
- **Do not commit PDFs.** Store PDF mirrors outside git and cite the official
  URL.
- **Procurement needs no scrape.** Set
  `transparency.procurement.organizationName` to the exact PhilGEPS
  organization name; the Meilisearch integration does the rest.
- **CMCI** data for Dagupan can be taken from the DTI CMCI portal, with
  missing years kept as missing rather than zero, and cited per
  [`civic-data-verification.md`](../civic-data-verification.md).
- **The Citizen's Charter** should come from the city's current published
  charter. Fill `scripts/merge_citizens_charter.py`'s office mapping with
  Dagupan office names and the slugs in
  `src/data/directory/departments.json` at that point, and run the duplicate
  detector before publishing.
