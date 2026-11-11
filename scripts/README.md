# Build Scripts Documentation

This directory contains automation, maintenance, and build scripts for Better Dagupan. Most of them come from the BetterLB template.

## Overview

Scripts in this directory handle:
- Service data merging
- `llms.txt` generation
- Build automation
- Data validation
- **Database migrations**
- The OpenLGU Legislative Source Pipeline (`scripts/openlgu/`)

---

## OpenLGU Pipeline Scripts (`scripts/openlgu/`)

The `openlgu:*` npm scripts run the OpenLGU Legislative Source Pipeline:
collection into source records, staging, and shadow reconciliation. Run it in
shadow mode first (`npm run openlgu:pipeline:shadow`), and never promote staged
records to canonical records without review. See
[`docs/openlgu/source-pipeline.md`](../docs/openlgu/source-pipeline.md) and the
vocabulary in [`CONTEXT.md`](../CONTEXT.md).

**Not yet re-keyed for Dagupan.** The collectors still read the template's
`losbanos.gov.ph` tables and Facebook source, and `generate-term-snapshot.cjs`
still holds Sangguniang Bayan terms. Re-keying them to Dagupan's Sangguniang
Panlungsod is a later phase; until then their output is not Dagupan data.

---

## Database Migration Scripts

### `migrate.sh`

Automated D1 database migration management with safety checks and tracking.

**Purpose:**
Manages database schema changes across local, preview, and production environments with automatic migration tracking and safety verification.

**Features:**
- ✅ Automatic migration discovery and execution
- ✅ Migration state tracking (applied vs pending)
- ✅ Safety checks (DROP TABLE, UPDATE/DELETE without WHERE)
- ✅ Production confirmation prompts
- ✅ Status reporting across environments
- ✅ CI/CD integration

**Usage:**

```bash
# Run migrations on local database
npm run db:migrate
# or: ./scripts/migrate.sh local

# Run migrations on production (with confirmation)
npm run db:migrate:remote
# or: ./scripts/migrate.sh remote

# Check migration status
npm run db:migrate:status
# or: ./scripts/migrate.sh status

# Create new migration file
npm run db:migrate:create <migration_name>
# or: ./scripts/migrate.sh create <migration_name>

# Verify migration safety
./scripts/migrate.sh verify
```

**Migration Tracking:**
- `schema_migrations` table tracks applied migrations
- Migration files in `db/migrations/` with numeric prefixes
- Skips already-applied migrations automatically

The script's D1 database name (`DB_NAME`) is still the template's, and
`db/migrations/002_baseline_data.sql` seeds the template's Sangguniang Bayan
terms. Review both before running migrations against a Better Dagupan database.
See also [`docs/openlgu/schema-rebuild.md`](../docs/openlgu/schema-rebuild.md).

---

## Scripts

### `merge_services.py`

Merges category-based service files into a single services JSON file.

**Purpose:**
The service directory is split into manageable category files for easier maintenance.
This script combines them into a single file that the application loads at runtime.

**Input:**
- `src/data/services/categories/*.json` - Individual category files

**Output:**
- `src/data/services/services.json` - Merged services array

**Usage:**
```bash
python3 scripts/merge_services.py
```

**When to Run:**
- Before starting development server (`npm run dev`)
- After modifying any service category file
- `npm run build` runs it for you through `npm run merge:services`

**Process:**
1. Reads all `.json` files from `src/data/services/categories/`
2. Combines arrays into a single list
3. Sorts alphabetically by service name
4. Writes to `src/data/services/services.json`

---

### `generate-sitemap.js`

Despite its name, this script generates `public/llms.txt` (crawler guidance)
from the published datasets and the route list in `src/lib/siteRoutes.ts`. It
runs under `tsx` so it can import that TypeScript module.

**Output:**
- `public/llms.txt`

**Usage:**
```bash
npm run generate:sitemap
```

**Automated:**
Not run by the build; re-run it and commit the result after publishing a dataset.

---

### `generate-sitemap-xml.ts`

Writes `sitemap.xml`: every indexable route in `src/lib/siteRoutes.ts` plus one
detail page per published department, barangay, and service, made absolute
with `portal.baseUrl`. Skips with a warning when `baseUrl` is empty.

**Output:**
- `dist/sitemap.xml` (or the directory passed as the first argument)

**Usage:**
```bash
npm run generate:sitemap-xml
```

**Automated:**
Runs at the end of `npm run build`. The output is never committed.

---

### `render-brand-images.ts`

Renders the Open Graph card, Apple touch icon, and app icons from the SVG
logos and the portal config with Playwright's Chromium, and writes
`public/manifest.webmanifest`.

**Usage:**
```bash
npx tsx scripts/render-brand-images.ts
```

**Automated:**
Not run by the build; re-run it and commit the PNGs after changing the logo,
the portal name, or the domain.

---

## Service Data Structure

### Category File Format

Each category file in `src/data/services/categories/` follows this structure:

```json
[
  {
    "service": "Business Permit Renewal",
    "slug": "business-permit-renewal",
    "type": "transaction",
    "category": {
      "name": "Business",
      "slug": "business"
    },
    "description": "Annual renewal of business permits...",
    "steps": [
      "Step 1: Prepare requirements",
      "Step 2: Submit application"
    ],
    "requirements": [
      "Previous year's permit",
      "Barangay clearance"
    ],
    "quickInfo": {
      "fee": "Varies by business size",
      "processingTime": "3-5 working days",
      "whoCanApply": "Business owners"
    },
    "updatedAt": "2024-01-15T10:00:00Z"
  }
]
```

### Schema Validation

All services must conform to the schema at `src/data/schema/services.schema.json`.

**Required Fields:**
- `service` - Service name
- `slug` - URL-friendly identifier
- `category` - Category object with `name` and `slug`
- `updatedAt` - ISO 8601 timestamp

---

## Creating a New Service Category

1. Create a new JSON file in `src/data/services/categories/`:
   ```bash
   touch src/data/services/categories/new-category.json
   ```

2. Add services following the schema:
   ```json
   [
     {
       "service": "Service Name",
       "slug": "service-name",
       "category": {
         "name": "New Category",
         "slug": "new-category"
       },
       "updatedAt": "2024-01-15T10:00:00Z"
     }
   ]
   ```

3. Run the merge script:
   ```bash
   python3 scripts/merge_services.py
   ```

4. Verify the output:
   ```bash
   cat src/data/services/services.json | jq '.[] | select(.category.slug == "new-category")'
   ```

---

## Troubleshooting

### "Module not found" errors

Ensure Python 3 is installed:
```bash
python3 --version
```

### Merge script produces empty file

Check that:
- Category files contain valid JSON
- Files are in the correct directory
- Files have `.json` extension

### Services not appearing in the app

1. Run the merge script
2. Check the output file exists
3. Restart the development server
4. Clear browser cache

---

## Validation

### Validate Service JSON

```bash
# Install ajv-cli
npm install -g ajv-cli

# Validate against schema
ajv validate -s src/data/schema/services.schema.json -d src/data/services/services.json
```

---

## Automation in Build Process

The merge scripts are integrated into the build process:

```json
{
  "scripts": {
    "build": "tsc && npm run merge:services && vite build",
    "merge:services": "python3 scripts/merge_citizens_charter.py && npm run merge:data && npx prettier --write src/data/citizens-charter/*.json",
    "merge:data": "python3 scripts/merge_services.py"
  }
}
```

This ensures services are always merged before building.

---

## Contributing

When adding new scripts:

1. Add documentation to this README
2. Include usage examples
3. Document input/output formats
4. Add error handling

---

## Related Documentation

- [Services Schema](../src/data/schema/services.schema.json)
- [Civic data verification](../docs/civic-data-verification.md) — required reading before adding service records
- [Build Documentation](../README.md#6-building-for-production)
