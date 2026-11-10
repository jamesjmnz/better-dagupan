# Forking Guide — Create Your BetterLGU Portal

Better Dagupan is built on the [BetterLB](https://github.com/BetterLosBanos/betterlb)
template by BetterLosBanos (originally made for Los Baños, Laguna), which is
itself a fork of [BetterGov.ph](https://bettergov.ph). This repository keeps the
template's forkable design, so you can start from it to build a community portal
for another municipality, city, or province.

This guide describes the template as it exists in this repository. Where
Better Dagupan has already made a choice, it is shown as an example.

## Quick Start

```bash
# 1. Fork or clone
git clone https://github.com/jamesjmnz/better-dagupan.git better-yourlgu
cd better-yourlgu

# 2. Use the pinned Node version (.nvmrc) and install
nvm use
npm install --legacy-peer-deps

# 3. Run the setup wizard
node scripts/setup-lgu.cjs

# 4. Start the dev server
npm run dev
```

You can also start from the upstream template at
`https://github.com/BetterLosBanos/betterlb.git`. It still contains the Los
Baños records that this repository has removed.

The setup wizard prompts for LGU details and writes `config/lgu.config.json`,
`.env`, resolved SEO metadata, and empty placeholder directory files. Review its
output by hand afterwards: see [Known gaps in the wizard](#known-gaps-in-the-wizard).

---

## What to Customize

### 1. Config (`config/lgu.config.json`)

Most LGU-specific values live here. This is Better Dagupan's file, abridged:

```json
{
  "lgu": {
    "name": "Dagupan",
    "fullName": "City of Dagupan",
    "province": "Pangasinan",
    "districtEngineeringOffice": "Pangasinan 2nd DEO",
    "region": "Region I",
    "regionCode": "Ilocos Region",
    "type": "city",
    "officialWebsite": "https://www.dagupan.gov.ph"
  },
  "portal": {
    "name": "Better Dagupan",
    "domain": "",
    "baseUrl": "",
    "brandColor": "#0066eb"
  },
  "location": {
    "coordinates": { "lat": 16.0433, "lon": 120.3333 },
    "weather": { "defaultCity": "Dagupan" }
  },
  "transparency": {
    "procurement": {
      "organizationName": "",
      "externalDashboard": "https://transparency.bettergov.ph/organizations/"
    },
    "infrastructure": {
      "searchString": "Dagupan",
      "exactMatchTargets": ["dagupan", "dagupan city"]
    }
  },
  "features": {
    "openLGU": true,
    "transparency": true,
    "statistics": true,
    "pangasinan": false
  }
}
```

Supported LGU types: `municipality`, `city`, `province`. Labels adapt
automatically through `src/lib/lguLabels.ts` (Mayor/Governor, Sangguniang
Bayan/Panlungsod/Panlalawigan, Municipal/City/Provincial).

Notes on individual fields:

- **`lgu.region`** must match the DPWH dataset's `location.region` value exactly
  (for example `Region I`), because the infrastructure page filters on it.
  `regionCode` holds the region's name.
- **`lgu.districtEngineeringOffice`** is the DPWH `location.province` value for
  your district office, such as `Pangasinan 2nd DEO`. Check it against the live
  index rather than guessing it.
- **`transparency.procurement.organizationName`** is the exact PhilGEPS entity
  name. Leave it empty until you have confirmed it against the
  `philgeps_organizations` index; with an empty value the procurement page shows
  a "source pending" state instead of another entity's records. Better Dagupan's
  value is still empty on `main`. A change in review
  ([#9](https://github.com/jamesjmnz/better-dagupan/pull/9)) replaces the field
  with an `organizationNames` array, because PhilGEPS lists the city under two
  exact names.
- **`portal.domain`** and **`portal.baseUrl`** can stay empty until you have a
  domain. SEO canonical URLs are then root-relative.

See [`docs/MEILISEARCH_INTEGRATION_GUIDE.md`](./docs/MEILISEARCH_INTEGRATION_GUIDE.md)
for how to find the procurement and infrastructure filter values.

### 2. Data Files

Read [`docs/civic-data-verification.md`](./docs/civic-data-verification.md)
before adding any record. Every published record cites a source in
`src/data/sources/civic-sources.json`, and `null` or `[]` means "not verified
yet", never "does not exist".

| File | What |
|------|------|
| `src/data/directory/departments.json` | City or municipal offices |
| `src/data/directory/barangays.json` | Barangay directory |
| `src/data/directory/executive.json` | Elected executive officials (mayor, vice mayor) |
| `src/data/directory/legislative.json` | Sanggunian members |
| `src/data/sources/civic-sources.json` | The source citations that records refer to |
| `src/data/services/` | Service categories |
| `src/data/citizens-charter/` | Citizens charter source and merged output |
| `src/data/statistics/` | Population, income, competitiveness data (if enabled) |
| `src/data/transparency/sre.json` | Statement of Receipts and Expenditures data |
| `src/data/about/` | LGU history and highlights |

`src/data/__tests__/inheritedRecords.test.ts` asserts which datasets are empty
and which are populated. When you populate a dataset, update that test on
purpose rather than deleting the assertion.

### 3. Logos

Put your marks in `public/logos/` and point the `portal.*Path` fields in
`config/lgu.config.json` at them. Better Dagupan uses two SVGs:

- `svg/better-dagupan-icon.svg` — navbar logo and favicon
- `svg/better-dagupan-icon-white.svg` — logo on dark backgrounds (footer)

`defaultOgImagePath` is empty, so `src/components/layout/SEO.tsx` leaves out the
Open Graph image instead of pointing at a missing file. `appleTouchIconPath` is
declared in the config type but not read anywhere yet.

### 4. SEO Metadata

`src/data/seo-metadata.json` uses template tokens resolved at runtime:

```json
{
  "/": {
    "title": "{{portal.name}} | {{lgu.fullName}} | Community Powered Government Portal",
    "description": "Find important information about {{portal.name}} ..."
  }
}
```

Available tokens: `{{portal.name}}`, `{{portal.domain}}`, `{{portal.baseUrl}}`, `{{lgu.name}}`, `{{lgu.fullName}}`, `{{lgu.province}}`, `{{lgu.type}}`, `{{lgu.adjective}}`

To regenerate with concrete values: `node scripts/generate-seo.cjs`

### 5. Environment

```bash
cp .env.example .env
cp .dev.vars.example .dev.vars   # only for the admin API under `npm run functions:dev`
```

`.env` points at the shared BetterGov Meilisearch instance
(`https://search2.bettergov.ph`). `src/lib/meilisearch.ts` already defaults to
BetterGov's public search-only key, so `VITE_MEILISEARCH_API_KEY` only needs a
value if that key rotates. The shared instance provides:

- **Procurement data** — filter by your LGU's exact PhilGEPS entity name
- **DPWH infrastructure** — filter by region and district engineering office, then match your LGU's name

### 6. Feature Flags

Enable or disable entire sections in `config/lgu.config.json`:

```json
{
  "features": {
    "openLGU": true,
    "transparency": true,
    "statistics": true,
    "pangasinan": false
  }
}
```

Routes for disabled sections are not registered in `src/App.tsx`.
`pangasinan` only controls whether the Pangasinan (`pag`) locale appears in the
language switcher; keep it off until the locale has human-reviewed translations
(see `src/i18n/README.md`). Replace it with your own regional language if you
need one.

---

## Architecture

```
config/lgu.config.json          ← LGU identity (edit this)
src/lib/lguConfig.ts             ← Typed config loader
src/lib/lguLabels.ts             ← LGU-type-aware labels
src/lib/seoTemplates.ts          ← SEO token resolution
src/data/navigation.ts           ← Config-driven nav (reads from config)
src/data/seo-metadata.json       ← Template tokens (resolved at runtime)
functions/utils/lgu.ts           ← Council name and official website for the API
```

### What is config-driven

The LGU's name, full name, province, type, and official website; the portal's
name, logos, links, and contact email; the labels for the executive and the
Sanggunian; SEO titles; the home map and weather coordinates on the frontend;
the procurement and infrastructure filters; and which sections are enabled.

### What still is not

Search for these when you fork, because changing the config does not change them:

| Place | What is hardcoded |
|---|---|
| `functions/api/weather.ts` | `DEFAULT_CITY` name and coordinates for the weather endpoint |
| `functions/index.ts`, `functions/api/weather.ts` | CORS allow-lists of portal origins |
| `wrangler.jsonc` | Pages project name, `GITHUB_REPO`, and the KV/D1 bindings |
| `.github/workflows/deploy.yml` | `--project-name` for the Pages deploy |
| `scripts/openlgu/` | Collector URLs, source keys, and term data — still the template's `losbanos.gov.ph` and Sangguniang Bayan values |
| `db/migrations/002_baseline_data.sql` | Seeded legislative terms — still the template's four Sangguniang Bayan terms |
| `scripts/migrate.sh`, `scripts/flag_sessions_for_review.py` | D1 database names inherited from the template |
| `public/locales/*/common.json` | Some LGU-specific copy |
| `src/lib/officeIcons.ts` | Icons keyed by office slug from `departments.json` |

Better Dagupan plans to re-key the legislative pipeline to its Sangguniang
Panlungsod in a later phase.

### Known gaps in the wizard

`scripts/setup-lgu.cjs` predates some of the config fields above. After running
it, check by hand that:

- `lgu.officialWebsite` is your LGU's official site; the wizard fills it with the
  portal's domain
- `location.coordinates` uses `lat`/`lon` and `location.weather.defaultCity` is
  set; the wizard writes `lat`/`lng` with zeros and `weather.enabled`
- `lgu.region` holds the DPWH region value and `lgu.districtEngineeringOffice` is
  present; the wizard does not ask for the district office
- `transparency.procurement.organizationName` is empty unless you have verified
  it; the wizard proposes the uppercased full name, which is a guess

---

## Deploy

```bash
npm run build
# Deploy dist/ to Cloudflare Pages
```

The Pages Functions in `functions/` (weather, the OpenLGU API, and the admin
API) need Cloudflare Pages. `.github/workflows/deploy.yml` deploys there when the
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets are set. See the
Deployment section of [`README.md`](./README.md#-deployment) for the bindings and
secrets the functions expect.

---

## Contributing Back

Found a bug or improvement that applies to all LGU portals? Open an issue or pull
request on the upstream [BetterLB repo](https://github.com/BetterLosBanos/betterlb).
For Better Dagupan itself, use
[jamesjmnz/better-dagupan](https://github.com/jamesjmnz/better-dagupan/issues).
