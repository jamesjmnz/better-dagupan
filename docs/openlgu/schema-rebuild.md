# OpenLGU Schema Rebuild — Migration Guide

This is a **breaking migration**. The OpenLGU D1 schema is rebuilt from scratch with proper constraints, clean column sets, and pipeline tables.

> **Better Dagupan context:** this guide records a migration of the BetterLB
> template's original database. Better Dagupan has no D1 database yet, so there
> is nothing to migrate: a new database only needs the files in `db/migrations/`
> applied. The data transformations and expected counts below describe the
> template's dataset, not Dagupan's. `002_baseline_data.sql` still seeds the
> template's Sangguniang Bayan terms; replace them with verified Sangguniang
> Panlungsod terms before applying it to a Better Dagupan database.

## Why

Migrations 001-004 accumulated technical debt that D1 cannot fix incrementally (no DROP COLUMN, no ALTER COLUMN, no ADD CONSTRAINT). Migration 006-007 added pipeline tables but were never applied. Rather than maintain 7 fragmented migrations with misleading comments, we squash into 2 clean files.

## What changed

### Column changes by table

| Table | Removed | Added |
|---|---|---|
| `terms` | `mayor`, `vice_mayor` (TEXT) | — |
| `persons` | `photo_url` | `birth_name` |
| `memberships` | — | `start_date`, `end_date` |
| `sessions` | `ordinal_number` | CHECK on `type`, `date NOT NULL` |
| `documents` | `status`, `needs_review`, `processed`, `review_notes`, `moved_by`, `seconded_by` | `term_id`, `publication_status`, `verification_state`, `source_confidence`, `canonical_notes` |
| `document_authors` | — | `raw_name`, CHECK on `author_type` |

### Dropped tables

| Table | Reason | Replacement |
|---|---|---|
| `facebook_session_data` | Old pipeline, 0 rows | `source_records` (source_kind=facebook_post) |
| `data_conflicts` | Old pipeline, 0 rows | `document_field_provenance` |
| `review_queue` | Old pipeline, 500 stale rows | `staged_documents.staging_status` |
| `admin_audit_log` | Duplicate of audit_log | Merged into `audit_log` |

### New constraints

```sql
-- sessions.type
CHECK(type IN ('Regular', 'Special', 'Inaugural'))

-- document_authors.author_type
CHECK(author_type IN ('principal', 'co_author'))

-- staged_document_person_refs.role
CHECK(role IN ('author', 'co_author', 'mover', 'seconder'))

-- documents.source_type
CHECK(source_type IN ('website', 'facebook', 'manual', 'ocr'))

-- documents.publication_status
CHECK(publication_status IN ('active', 'missing_from_source', 'withdrawn', 'superseded', 'manual_only'))

-- documents.verification_state
CHECK(verification_state IN ('unverified', 'partially_verified', 'verified', 'disputed'))

-- persons.last_name
NOT NULL
```

### Data transformations during migration

1. **Executive session dissolved** — `sb_11_2025-01-01_executive` had 157 documents. These get `session_id = NULL`. Executive orders don't belong to sessions.
2. **FK fix** — memberships referenced `sb_09` but terms PK is `sb_9`. Fixed to `sb_9`.
3. **Duplicate removed** — a membership row pointing at a wrong `person_id` (`<wrong-person-id>`) was removed; the row with the correct `person_id` (`<correct-person-id>`) was kept.
4. **author_type renamed** — `primary` → `principal` in document_authors.
5. **Admin audit merged** — rows from `admin_audit_log` inserted into `audit_log`.
6. **Mover/seconder preserved** — `documents.moved_by`/`seconded_by` values preserved in `staged_document_person_refs` during migration (not canonical, staging evidence only).

## Upgrade instructions

### Prerequisites

- Node.js 24+
- wrangler CLI (authenticated)
- Backup of existing D1 data

### Step 1: Backup existing data

```bash
wrangler d1 export <your-d1-database> --remote --output=backup_$(date +%Y%m%d).sql
```

Also already exported to `pipeline/openlgu/reference/remote-*.json`.

### Step 2: Apply new schema

```bash
# Drop and recreate — this is destructive
wrangler d1 execute <your-d1-database> --remote --file=db/migrations/001_initial_schema.sql
wrangler d1 execute <your-d1-database> --remote --file=db/migrations/002_baseline_data.sql
```

### Step 3: Migrate data

```bash
node scripts/openlgu/migrate-data.cjs
```

This reads from `pipeline/openlgu/reference/remote-*.json`, transforms, and inserts into the new schema.

### Step 4: Verify

```bash
wrangler d1 execute <your-d1-database> --remote --command="SELECT type, COUNT(*) FROM documents GROUP BY type"
wrangler d1 execute <your-d1-database> --remote --command="SELECT COUNT(*) FROM persons"
wrangler d1 execute <your-d1-database> --remote --command="SELECT COUNT(*) FROM memberships"
```

For the template's original dataset this check returned 2,430 documents, 27 or more persons, and 38 or more memberships. For a new database, expect the counts of whatever verified records you have loaded.

## Schema reference

See `db/migrations/001_initial_schema.sql` for the complete schema.
