# 🏛️ Better Dagupan

A community-led, open-source portal that makes public information about the
**City of Dagupan**, Pangasinan easier to find, read, and verify.

> **Better Dagupan is an independent, community-led project. It is not the
> official website of the City Government of Dagupan, and it is not affiliated
> with or endorsed by any government agency.** The official city website is
> [dagupan.gov.ph](https://www.dagupan.gov.ph).

### Provenance

Better Dagupan is derived from the [BetterLB](https://github.com/BetterLosBanos/betterlb)
(Los Baños) template by BetterLosBanos, itself a fork of
[BetterGov.ph](https://bettergov.ph). The template's architecture, design system
integration, and much of its supporting tooling are retained here, and that
attribution stands regardless of the repository's fork status. Commits at and
below `5f3f25c` are the work of the upstream BetterLB contributors; see
[`docs/project-history/`](./docs/project-history/) for the full record.

### Current status

Branding, localisation, and the independent-project disclaimer are in place,
and the inherited Los Baños civic records have been removed rather than shown
under a Dagupan heading. Most of the directory, statistics, and financial
sections now hold verified Dagupan records. Every record cites a government
source, and the pages show the agency, a link to the document, and its last
verification date:

| Dataset | State |
|---|---|
| Barangays (`src/data/directory/barangays.json`) | **Published.** 31 barangays from the PSA Philippine Standard Geographic Code (PSGC). |
| City offices (`src/data/directory/departments.json`) | **Published.** 34 offices from the City Government of Dagupan's own pages. 11 office heads are withheld because the sources disagree or only one source names them. |
| Executive officials (`src/data/directory/executive.json`) | **Published.** The City Mayor and Vice Mayor, each from two or more independent source families. |
| Sangguniang Panlungsod (`src/data/directory/legislative.json`) | **Published.** 12 members: 10 elected councilors and 2 ex officio. Committee assignments are withheld because the council's own profiles contradict each other. |
| Emergency hotlines (`src/data/directory/hotlines.json`) | **Published.** 10 city entries with 25 numbers, each stated by two independent city lists. 4 entries are withheld. |
| Population (`src/data/statistics/population.json`) | **Published.** PSA census counts for 2010, 2015, 2020, and 2024, with barangay counts for 2015–2024. |
| Annual regular income (`src/data/statistics/ari.json`) | **Published.** BLGF figures for FY 2022–2025. |
| Competitiveness (`src/data/statistics/cmci.json`) | **Published.** DTI CMCI editions 2014–2024, one record per year. |
| Financial statements (`src/data/transparency/sre.json`) | **Published.** BLGF Statements of Receipts and Expenditures, quarterly from Q1 2022 to Q3 2026 and full-year for FY 2022–2025. |
| City history (`src/data/about/history.json`, `highlights.json`) | **Published.** Seven legal milestones from 1947 to 1973, each from the official text in the Supreme Court E-Library, and three cited highlights. Earlier history is marked as not yet verified. |
| Citizen's Charter services (`src/data/citizens-charter/citizens-charter.json`) | **Published.** 10 One Stop Business Center services from the city's Citizen's Charter, read from archived copies while the city site was down; they need re-checking against the live pages. |
| Community services (`src/data/services/`) | Empty. No community-contributed service has been verified yet. |
| Procurement | **Live.** PhilGEPS records from the shared BetterGov search index, filtered by the two exact entity names in `transparency.procurement.organizationNames`, plus the bid and award notices the city posts on its own site (`/api/city-procurement`). |
| Infrastructure (DPWH) | **Live.** From the shared BetterGov search index, filtered by the values in `config/lgu.config.json`. |
| Legislation | **Interim.** No legislative database is bound, so the OpenLGU API answers `503`. Until the OpenLGU pipeline is re-keyed for Dagupan, the OpenLGU page lists the ordinances the Sangguniang Panlungsod posts on its own WordPress site (`/api/council-ordinances`), linking back to the council's pages. |

The per-dataset verification notes, including what was withheld and why, are in
[`docs/civic-data-verification.md`](./docs/civic-data-verification.md).

Nothing in the portal should be read as official Dagupan government
information. Always check with the city government.

---
### Inspirations

BetterGov.PH https://github.com/bettergovph/bettergov
BetterSolano.org https://github.com/BetterSolano/bettersolano
Betterlocalgov https://github.com/iyanski/betterlocalgov

### Portal Features
Better Dagupan is being built to provide:
- **Government Directory**: City offices, barangays, elected officials, and emergency hotlines, each with sources
- **Public Services Directory**: City services with requirements, fees, and step-by-step processes, starting with 10 Citizen's Charter services
- **Legislative Portal (OpenLGU)**: For now, the ordinances the Sangguniang Panlungsod posts on its own site; the full portal of ordinances, resolutions, executive orders, sessions, and attendance waits for the re-keyed pipeline
- **Transparency Dashboard**: DPWH infrastructure projects, PhilGEPS procurement and the city's own bid notices, and BLGF financial statements
- **Statistics**: Census population, annual regular income, and DTI competitiveness scores
- **Open Data**: Weather and foreign-exchange pages under `/data`
- **Report an Error**: A `/report-an-error` page and GitHub issue form for correcting civic information, linked from every source note
- **Multi-language Support**: English and Filipino translations; a Pangasinan locale is scaffolded but stays hidden (`features.pangasinan: false`) until human translations exist

Sections without verified records stay in the interface and show an empty state.

---

## 🔄 Forking for Your LGU

This portal, like the BetterLB template it comes from, is designed to be adapted for any Local Government Unit (LGU) in the Philippines.

## Quick Start for Other LGUs

1. **Edit Configuration**: Run `node scripts/setup-lgu.cjs`, or update `/config/lgu.config.json` by hand
2. **Update Translations**: Modify `/public/locales/en/common.json` and `/public/locales/fil/common.json` for LGU-specific text
3. **Add Your Data**: Replace the datasets in `/src/data/` with your LGU's verified information
4. **Build and Test**: Run `npm install --legacy-peer-deps && npm run build`

### Configuration Files to Edit

| File | What to Change |
|------|------------------|
| `/config/lgu.config.json` | All LGU settings (name, province, coordinates, branding, transparency config) |
| `/public/locales/en/common.json`, `/public/locales/fil/common.json` | UI text strings (hero title, footer copyright, government section) |
| `/src/data/directory/departments.json` | City or municipal departments and offices |
| `/src/data/directory/barangays.json` | Barangay information |
| `/src/data/citizens-charter/citizens-charter.json` | Services from the LGU's Citizen's Charter |
| `/src/data/services/categories/*.json` | Community-contributed services by category |

### Key Configuration Fields

| Field | Description | Value in this repository |
|-------|-------------|--------------------------|
| `lgu.name` | Short LGU name | "Dagupan" |
| `lgu.fullName` | Full official name | "City of Dagupan" |
| `lgu.province` | Province name | "Pangasinan" |
| `lgu.region` | Region name | "Region I" |
| `lgu.regionCode` | Region name paired with `region` | "Ilocos Region" |
| `lgu.type` | LGU type, drives Mayor/Sanggunian labels | "city" |
| `lgu.districtEngineeringOffice` | DPWH district office used by the infrastructure filter | "Pangasinan 2nd DEO" |
| `lgu.officialWebsite` | Official LGU website | "https://www.dagupan.gov.ph" |
| `portal.name` | Portal name | "Better Dagupan" |
| `portal.baseUrl` | Portal base URL | "https://better-dagupan.pages.dev" |

`portal.domain` and `portal.baseUrl` name the Cloudflare Pages project in
`wrangler.jsonc`; canonical URLs, the share image, `sitemap.xml`, and
`public/robots.txt` are built on them. The social URLs are deliberately empty
so the portal does not advertise an account that does not exist.

**Note:** See [`FORKING.md`](./FORKING.md) for comprehensive forking instructions including database setup for legislative data.

## Technical Stack
*   **Frontend**: React 19, Vite 6, TypeScript (Strict mode)
*   **Styling**: Tailwind CSS v4 (CSS variables, high-contrast tokens)
*   **Design System**: @bettergov/kapwa (semantic tokens, component library)
*   **Backend**: Cloudflare Pages Functions (TypeScript)
*   **Deployment**: Wrangler 4.70.0 (pinned for compatibility)
*   **Data**: Structured JSON (Modular category-based architecture)
*   **Search**: Shared BetterGov Meilisearch instance, plus Fuse.js fuzzy search
*   **Localization**: i18next with English & Filipino support
*   **Maps**: Leaflet for geospatial visualizations
*   **Data Pipeline**: Node scripts for the legislative source pipeline, Python scripts for service data
*   **Testing**: Vitest (unit) and Playwright (E2E across multiple browsers)
*   **Code Quality**: ESLint, Prettier, Husky pre-commit hooks, commitlint
*   **Security**: Undici 8.0.2 (pinned for security fixes)

---

## Project Structure

```
better-dagupan/
├── config/                      # lgu.config.json — the LGU configuration
├── db/migrations/               # Cloudflare D1 schema migrations (OpenLGU)
├── docs/                        # ADRs, API, pipeline, and data-verification docs
├── e2e/                         # End-to-end tests
│   └── utils/                   # Test helpers and shared testing logic
├── functions/                   # Serverless / backend functions (Cloudflare Pages)
│   ├── api/                     # weather, city-procurement, council-ordinances, openlgu, admin
│   └── utils/                   # Shared middleware (auth, CSRF, rate limits, cache)
├── public/                      # Static public assets
│   ├── locales/                 # Translation files (en, fil; pag scaffolded, empty)
│   └── logos/                   # Logo exports
├── scripts/                     # Automation, maintenance, and build scripts
│   └── openlgu/                 # OpenLGU Legislative Source Pipeline
├── src/                         # Main application source code
│   ├── components/              # Reusable UI components
│   │   ├── admin/               # Admin tool components
│   │   ├── civic/               # Provenance UI (SourceNote, NotVerified)
│   │   ├── data-display/        # Charts and record viewers
│   │   ├── government/          # Government directory components
│   │   ├── home/                # Homepage-specific components
│   │   ├── layout/              # Layout wrappers, grids, headers, footers
│   │   ├── map/                 # Map visualizations and geospatial UI
│   │   ├── navigation/          # Menus, navbars, breadcrumbs
│   │   ├── ui/                  # Generic UI elements (cards, badges, empty states)
│   │   └── widgets/             # Small reusable info widgets
│   ├── constants/               # App-wide constant values
│   ├── data/                    # Structured frontend data layer
│   │   ├── about/               # About page content
│   │   ├── citizens-charter/    # Citizens charter source and merged output
│   │   ├── directory/           # Barangays, departments, elected officials
│   │   │   └── schema/          # JSON Schemas for directory records
│   │   ├── schema/              # Global data schemas
│   │   ├── services/            # Public service datasets
│   │   │   └── categories/      # Service classifications
│   │   ├── sources/             # Civic source citations (civic-sources.json)
│   │   ├── statistics/          # Population, income, competitiveness
│   │   └── transparency/        # Financial report data
│   ├── hooks/                   # Custom reusable frontend hooks
│   ├── i18n/                    # Language definitions and translation guide
│   ├── lib/                     # Utility libraries and helpers
│   ├── pages/                   # Route-level pages (site sections)
│   │   ├── about/
│   │   ├── accessibility/
│   │   ├── admin/               # Admin dashboard and review workbench
│   │   ├── contribute/
│   │   ├── data/                # Weather and forex pages
│   │   ├── government/          # Barangays, departments, elected officials
│   │   ├── openlgu/             # Legislative portal (ordinances, resolutions, EOs)
│   │   ├── services/            # Public services portal
│   │   ├── sitemap/             # Human-readable sitemap
│   │   ├── statistics/          # Statistics portal
│   │   └── transparency/        # Financial, procurement, infrastructure
│   └── types/                   # TypeScript type definitions
└── (root config files)          # package.json, wrangler.jsonc, build configs
```

### Key Components
- **Government Directory**: Barangays, city offices, elected officials, and hotlines, each record citing sources from `src/data/sources/civic-sources.json`
- **Service Directory**: The Citizen's Charter and the category files in `src/data/services/categories/`, merged by `npm run merge:services`
- **Legislative Portal**: Ordinances, resolutions, and executive orders served from Cloudflare D1 through `functions/api/openlgu/`; until a database is bound, the council's posted ordinances through `functions/api/council-ordinances.ts`
- **Transparency Portal**: BLGF financial statements, PhilGEPS procurement, the city's bid notices (`functions/api/city-procurement.ts`), and DPWH infrastructure projects
- **Search Integration**: Procurement and infrastructure queries against the shared BetterGov Meilisearch instance
- **Internationalization**: Multi-language support with i18next

### LGU-Specific Data

| Data Type | Location | State |
|-----------|----------|-------|
| **Barangays** | `/src/data/directory/barangays.json` | Published — 31 records |
| **Departments** | `/src/data/directory/departments.json` | Published — 34 offices |
| **Elected officials** | `/src/data/directory/executive.json`, `legislative.json` | Published — Mayor, Vice Mayor, 12 council members |
| **Hotlines** | `/src/data/directory/hotlines.json` | Published — 10 entries |
| **History** | `/src/data/about/history.json`, `highlights.json` | Published — 7 milestones, 3 highlights |
| **Statistics** | `/src/data/statistics/population.json`, `ari.json`, `cmci.json` | Published |
| **Financial reports** | `/src/data/transparency/sre.json` | Published — Q1 2022 to Q3 2026 |
| **Citizens Charter** | `/src/data/citizens-charter/citizens-charter.json` | Published — 10 services |
| **Services** | `/src/data/services/categories/*.json` | Empty |
| **Legislation** | Cloudflare D1 database | Not bound yet; the council's posted ordinances are shown meanwhile |

Before adding or changing a dataset, read
[`docs/civic-data-verification.md`](./docs/civic-data-verification.md). It sets
the source rules, the citation structure, and how unverified fields are shown.
The JSON Schemas and the types in `src/types/` document the shape each dataset
must take.

`services.json` and `merged-services.json` are generated by
`npm run merge:services`; edit the category files and the citizens charter
rather than the generated output.

#### Data Pipeline for Legislative Documents

Legislative documents go through the OpenLGU Legislative Source Pipeline in
`scripts/openlgu/`: collection into source records, staging, shadow
reconciliation, and reviewed promotion to canonical records in D1. Its local
artifacts are written under `pipeline/openlgu/`, which is not committed.

The collectors are still the template's: they read `losbanos.gov.ph` tables and
Facebook posts and assume Sangguniang Bayan terms. Re-keying them to Dagupan's
Sangguniang Panlungsod (for example the WordPress JSON feed at
`sp.dagupan.gov.ph`) is planned for a later phase. Do not run the pipeline
against a Dagupan database until then.

Meanwhile `/api/council-ordinances` proxies that same feed live, so the OpenLGU
page can list the council's posted ordinances with links back to its pages.
This list is not part of the pipeline: its items are not source records, and
nothing from it is stored.

See [`docs/openlgu/source-pipeline.md`](./docs/openlgu/source-pipeline.md) for
the pipeline and
[`docs/reference/betterlb-data-model.md`](./docs/reference/betterlb-data-model.md)
for the data inherited from BetterLB.

---

## 🚀 How to Run Locally

### 1. Clone and Install
Use the Node version in `.nvmrc` (`v22.16.0`). CI installs with
`--legacy-peer-deps`, so do the same:
```bash
git clone https://github.com/jamesjmnz/better-dagupan
cd better-dagupan
nvm use
npm install --legacy-peer-deps
```

### 2. Configure the Environment (optional)
```bash
cp .env.example .env            # Meilisearch host; the public search key is the default
cp .dev.vars.example .dev.vars  # Only for the admin API under `npm run functions:dev`
```

### 3. Prepare Data
The service directory is split into category files. Merge them before running
the app (`npm run build` does this for you):
```bash
npm run merge:services
```

### 4. Start Development Server
```bash
npm run dev
```
**Access the portal at:** `http://localhost:5173`

To run the Cloudflare Pages Functions (`/api/*`) as well, start Vite and then,
in a second terminal:
```bash
npm run functions:dev   # wrangler pages dev, proxying to Vite on port 5173
```
Wrangler serves the combined app at `http://localhost:8788`. With no D1
database bound, the OpenLGU endpoints answer `503`, and without
`OPENWEATHERMAP_API_KEY` so does `/api/weather`; the pages show an empty state
for both.

### 5. Running Tests
```bash
npm run test            # Vitest unit tests
npm run typecheck       # Type-check the app, Node config, and functions
npm run test:e2e        # Run all end-to-end tests (excluding @visual)
npm run lint            # Check code quality (max warnings = 0)
npm run format          # Format code with Prettier
```

### 6. Building for Production
```bash
npm run build           # tsc, npm run merge:services, then vite build
```

---

## 🏛️ City Government Structure

### Executive Branch
- **Mayor**: Chief executive officer of the city
- **Vice Mayor**: Presiding officer of the Sangguniang Panlungsod and mayoral successor
- **City Departments**: Administrative offices implementing city programs

### Legislative Branch (Sangguniang Panlungsod)
The Sangguniang Panlungsod is the legislative body of the City of Dagupan,
presided over by the Vice Mayor. Its verified roster is in
`src/data/directory/legislative.json` and on the portal's
`/government/elected-officials` page. Committee assignments are not published
yet, because the council's own profiles contradict each other.

### Departments

The verified list of city offices is in
`src/data/directory/departments.json` and on the portal's
`/government/departments` page, with a source for each office. It is not
repeated here so that there is only one copy to keep accurate.

---

## Join the Grassroots Movement
We are looking for volunteers passionate about making Dagupan a better place. You don't need to be a developer to help!

### How You Can Contribute:
1.  **Non-Developers**: Use the portal's `/report-an-error` page to correct civic information, or `/contribute` to suggest new services, via GitHub Issues (requires a free GitHub account).
2.  **Developers**: Check the [Issues](https://github.com/jamesjmnz/better-dagupan/issues) tab for "Help Wanted" or "Good First Issue" labels, and read [`CONTRIBUTING.md`](./CONTRIBUTING.md).
3.  **Data Auditors**: Help verify records against primary government sources, following [`docs/civic-data-verification.md`](./docs/civic-data-verification.md).
4.  **Translators**: Help translate the portal to Filipino and Pangasinan by working on `public/locales/` files; see [`src/i18n/README.md`](./src/i18n/README.md).

### Development Workflow
- Follow [Conventional Commits](https://www.conventionalcommits.org/) (enforced via commitlint)
- All PRs run the type check, ESLint, Prettier, unit tests, a production build, and the E2E smoke suite; changes to `src/data/**/*.json` are also validated against their JSON Schemas
- The full cross-browser E2E suite and the axe accessibility suite run weekly and on demand

---

## 🚢 Deployment

### Status

Better Dagupan is **not deployed yet**, and no production domain is assigned.

The deployment setup targets **Cloudflare Pages**:
- **Project**: `wrangler.jsonc` names the Pages project `better-dagupan`
- **Workflow**: `.github/workflows/deploy.yml` builds on every push and pull request to `main`, then deploys `dist/` with `wrangler pages deploy dist --project-name=better-dagupan`
- **Backend**: Cloudflare Pages Functions for the API endpoints
- **Database**: Cloudflare D1 for legislative data — **not bound yet**
- **KV**: Admin sessions and the weather cache — **not bound yet**
- **Search**: The shared BetterGov Meilisearch instance (`search2.bettergov.ph`); nothing to host
- **Wrangler**: Version 4.70.0 (pinned for compatibility)

### Prerequisites before the first deploy

1. **Repository secrets**: Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`
   to the repository. Until both exist, the workflow's quality gate still runs and
   the deploy job is skipped.
2. **Pages project**: Create the `better-dagupan` Pages project in that Cloudflare account.
3. **KV namespace**: Create one and bind it as `WEATHER_KV` in `wrangler.jsonc`.
   The admin sign-in depends on it; the weather endpoint works without it but
   then caches nothing.
4. **D1 database** (only when legislative data is ready): Create it, bind it as
   `BETTERLB_DB`, and apply `db/migrations/`. Never bind another LGU's database.
5. **Secrets and variables**: `OPENWEATHERMAP_API_KEY` for weather, and
   `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `AUTHORIZED_USERS`, `ADMIN_USERS`
   for the admin area (see `.dev.vars.example`).
6. **Domain**: The portal is served from `better-dagupan.pages.dev`. If a
   custom domain is assigned, change `portal.domain` and `portal.baseUrl` in
   `config/lgu.config.json`, add the origin to `functions/utils/origins.ts`,
   update the `Sitemap:` line in `public/robots.txt` and the share-image URLs
   in `index.html`, and re-run `npx tsx scripts/render-brand-images.ts` so the
   card shows the new domain. The unit tests catch a stale origin,
   `robots.txt`, or `index.html`.

**Note:** The deployment workflow uses Wrangler 4.70.0 (pinned in both `.github/workflows/deploy.yml` and `package.json`). If upgrading, ensure compatibility with the Wrangler Action and test thoroughly.

See [`ARCHITECTURE.md`](./ARCHITECTURE.md#deployment) for more detail.

## License and Data Sources

### Code License
This project is released under the [Creative Commons CC0](https://creativecommons.org/publicdomain/zero/1.0/) dedication. The work is dedicated to the public domain and can be freely used, modified, and distributed without restriction.

### Data Attribution
Each published record cites its sources by id in
`src/data/sources/civic-sources.json`, which records the agency, document URL,
retrieval date, and last verification date.

| Data Source | Used for | State |
|-------------|----------|-------|
| **Philippine Statistics Authority (PSA)** | Barangay names, PSGC codes, classification, census population | Published |
| **City Government of Dagupan** | City offices, elected officials, hotlines, Citizen's Charter services, bid and award notices | Published / live |
| **Sangguniang Panlungsod, Dagupan City** | Council roster; posted ordinances | Published / live |
| **Commission on Elections (COMELEC)** | 2025 election results, as a corroborating source for elected officials | Published |
| **Bureau of Local Government Finance (BLGF)** | Statements of Receipts and Expenditures, annual regular income | Published |
| **Department of Trade and Industry (DTI)** | Cities and Municipalities Competitiveness Index | Published |
| **Supreme Court E-Library** | Official texts of the city charter and its amendments | Published |
| **Philippine Government Electronic Procurement System (PhilGEPS)**, via BetterGov.ph | Procurement awards | Live |
| **Department of Public Works and Highways (DPWH)**, via BetterGov.ph | Infrastructure projects | Live |
| **Commission on Audit (COA)**, **Department of Budget and Management (DBM)**, **Official Gazette** | Audit, budget, and legislative references | Planned |

**Note**: Data is presented as-is and may not reflect the most current information. Always verify with official LGU sources.

---

## 📞 Contact and Support

### For Dagupan Residents
- **Website**: not yet deployed
- **GitHub Issues**: Report bugs or suggest features at [github.com/jamesjmnz/better-dagupan/issues](https://github.com/jamesjmnz/better-dagupan/issues)
- **Community**: Join our community contributions via the "Contribute" page on the portal

### For Other LGUs
- **Forking Guide**: See [`FORKING.md`](./FORKING.md) for detailed instructions
- **Architecture**: See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for system design
- **Documentation**: See [`docs/`](./docs/) for comprehensive guides
