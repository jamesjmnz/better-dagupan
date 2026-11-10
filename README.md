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

The Dagupan adaptation is in progress. Branding, localisation, and the
independent-project disclaimer are in place, and the inherited Los Baños civic
records have been removed rather than shown under a Dagupan heading.

Two verified Dagupan datasets are published. Every record cites a government
source, and the pages show the source and its last verification date:

| Dataset | State |
|---|---|
| Barangays (`src/data/directory/barangays.json`) | **Published.** 31 barangays from the PSA Philippine Standard Geographic Code (PSGC). |
| City offices (`src/data/directory/departments.json`) | **Published.** 34 offices from the City Government of Dagupan's own pages. 11 office heads are deliberately withheld because the sources disagree or only one source names them. |
| Elected officials (`executive.json`, `legislative.json`) | Empty on `main`; in review in [#11](https://github.com/jamesjmnz/better-dagupan/pull/11). |
| Procurement (PhilGEPS) | The page shows a "source pending" state on `main` because no PhilGEPS entity name is configured; the entity names are in review in [#9](https://github.com/jamesjmnz/better-dagupan/pull/9). |
| Infrastructure (DPWH) | Live from the shared BetterGov search index, filtered by the values in `config/lgu.config.json`. |
| Services, citizens charter, statistics, financial reports, about/history | Empty. These sections show an honest empty state. |
| Legislation (ordinances, resolutions, executive orders) | Not published. No legislative database is bound yet, so the OpenLGU API answers `503` and the pages say the records are not published yet. |

Nothing in the portal should be read as official Dagupan government
information. Always check with the city government.

---
### Inspirations

BetterGov.PH https://github.com/bettergovph/bettergov
BetterSolano.org https://github.com/BetterSolano/bettersolano
Betterlocalgov https://github.com/iyanski/betterlocalgov

### Portal Features
Better Dagupan is being built to provide:
- **Government Directory**: City offices and barangays, with sources (published); elected officials (in review)
- **Public Services Directory**: Guide to city services with requirements, fees, and step-by-step processes (not yet populated)
- **Legislative Portal (OpenLGU)**: Ordinances, resolutions, and executive orders from the Sangguniang Panlungsod (not yet populated)
- **Transparency Dashboard**: DPWH infrastructure projects, PhilGEPS procurement, and financial reports
- **Open Data**: Weather and foreign-exchange pages under `/data`
- **Multi-language Support**: English and Filipino translations

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
| `/src/data/services/categories/*.json` | Public services data by category |

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
| `portal.baseUrl` | Portal base URL | "" — unset until a domain is assigned |

`portal.domain`, `portal.baseUrl`, and the social URLs are deliberately empty.
Leaving them unset keeps SEO canonicals root-relative and stops the portal
advertising a domain or account that does not exist.

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
│   ├── api/                     # API endpoints: weather, openlgu, admin
│   └── utils/                   # Shared middleware (auth, CSRF, rate limits, cache)
├── public/                      # Static public assets
│   ├── locales/                 # Translation files (en, fil)
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
- **Government Directory**: Barangays and city offices, each record citing sources from `src/data/sources/civic-sources.json`
- **Service Directory**: Categorized services from `src/data/services/categories/`
- **Legislative Portal**: Ordinances, resolutions, and executive orders served from Cloudflare D1 through `functions/api/openlgu/`
- **Transparency Portal**: Financial reports, PhilGEPS procurement, and DPWH infrastructure projects
- **Search Integration**: Procurement and infrastructure queries against the shared BetterGov Meilisearch instance
- **Internationalization**: Multi-language support with i18next

### LGU-Specific Data

| Data Type | Location | State |
|-----------|----------|-------|
| **Barangays** | `/src/data/directory/barangays.json` | Published — 31 records |
| **Departments** | `/src/data/directory/departments.json` | Published — 34 offices |
| **Elected officials** | `/src/data/directory/executive.json`, `legislative.json` | Empty (in review) |
| **Services** | `/src/data/services/categories/*.json` | Empty |
| **Citizens Charter** | `/src/data/citizens-charter/citizens-charter.json` | Empty |
| **Statistics** | `/src/data/statistics/` | Empty |
| **Financial reports** | `/src/data/transparency/sre.json` | Empty |
| **Legislation** | Cloudflare D1 database | Not bound yet |

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
database bound, the OpenLGU endpoints answer `503`.

### 5. Running Tests
```bash
npm run test            # Vitest unit tests
npm run test:e2e        # Run all end-to-end tests
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
The Sangguniang Panlungsod is the legislative body of the City of Dagupan. Its
composition, membership, and committee structure are not documented here until
they have been verified against primary sources.

### Departments

The verified list of city offices is in
`src/data/directory/departments.json` and on the portal's
`/government/departments` page, with a source for each office. It is not
repeated here so that there is only one copy to keep accurate.

---

## Join the Grassroots Movement
We are looking for volunteers passionate about making Dagupan a better place. You don't need to be a developer to help!

### How You Can Contribute:
1.  **Non-Developers**: Use the portal's `/contribute` page to suggest new services or fix outdated information via GitHub Issues (requires a free GitHub account).
2.  **Developers**: Check the [Issues](https://github.com/jamesjmnz/better-dagupan/issues) tab for "Help Wanted" or "Good First Issue" labels, and read [`CONTRIBUTING.md`](./CONTRIBUTING.md).
3.  **Data Auditors**: Help verify records against primary government sources, following [`docs/civic-data-verification.md`](./docs/civic-data-verification.md).
4.  **Translators**: Help translate the portal to Filipino and other Philippine languages by working on `public/locales/` files.

### Development Workflow
- Follow [Conventional Commits](https://www.conventionalcommits.org/) (enforced via commitlint)
- All PRs run ESLint, Prettier, unit tests, a production build, and the E2E smoke suite
- The full cross-browser E2E suite runs weekly and on demand

---

## 🚢 Deployment

### Status

Better Dagupan is **not deployed yet**, and no production domain is assigned.

The deployment setup targets **Cloudflare Pages**:
- **Project**: `wrangler.jsonc` names the Pages project `better-dagupan`
- **Workflow**: `.github/workflows/deploy.yml` builds on every push and pull request to `main`, then deploys `dist/` with `wrangler pages deploy dist --project-name=better-dagupan`
- **Backend**: Cloudflare Pages Functions for the API endpoints
- **Database**: Cloudflare D1 for legislative data — **not bound yet**
- **KV**: Weather caching and admin sessions — **not bound yet**
- **Search**: The shared BetterGov Meilisearch instance (`search2.bettergov.ph`); nothing to host
- **Wrangler**: Version 4.70.0 (pinned for compatibility)

### Prerequisites before the first deploy

1. **Repository secrets**: Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`
   to the repository. Until both exist, the workflow's quality gate still runs and
   the deploy job is skipped.
2. **Pages project**: Create the `better-dagupan` Pages project in that Cloudflare account.
3. **KV namespace**: Create one and bind it as `WEATHER_KV` in `wrangler.jsonc`.
   The weather endpoint and the admin sign-in both depend on it.
4. **D1 database** (only when legislative data is ready): Create it, bind it as
   `BETTERLB_DB`, and apply `db/migrations/`. Never bind another LGU's database.
5. **Secrets and variables**: `OPENWEATHERMAP_API_KEY` for weather, and
   `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `AUTHORIZED_USERS`, `ADMIN_USERS`
   for the admin area (see `.dev.vars.example`).
6. **Domain**: Once assigned, set `portal.domain` and `portal.baseUrl` in
   `config/lgu.config.json` and add the origin to the CORS allow-lists in
   `functions/index.ts` and `functions/api/weather.ts`.

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
| **Philippine Statistics Authority (PSA)** | Barangay names, PSGC codes, classification, 2024 population | Published |
| **City Government of Dagupan** | City office directory | Published |
| **Philippine Government Electronic Procurement System (PhilGEPS)**, via BetterGov.ph | Procurement awards | In review (#9) |
| **Department of Public Works and Highways (DPWH)**, via BetterGov.ph | Infrastructure projects | Live |
| **Department of Budget and Management (DBM)**, **Commission on Audit (COA)**, **Official Gazette** | Financial and legislative references | Planned |

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
