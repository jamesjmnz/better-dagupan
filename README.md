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

**No verified Dagupan civic data has been added yet.** The directory,
statistics, services, and financial sections render honest empty states until
records are sourced from primary government sources and verified. Nothing in
the portal should be read as official Dagupan government information.

---
### Inspirations

BetterGov.PH https://github.com/bettergovph/bettergov
BetterSolano.org https://github.com/BetterSolano/bettersolano
Betterlocalgov https://github.com/iyanski/betterlocalgov

### Portal Features
Better Dagupan is being built to provide:
- **Public Services Directory**: Guide to city services with requirements, fees, and step-by-step processes
- **Legislative Portal**: Ordinances, resolutions, and executive orders from the Sangguniang Panlungsod
- **Transparency Dashboard**: Financial data, procurement bids, and infrastructure projects
- **Government Directory**: Contact information for city departments and officials
- **Multi-language Support**: English and Filipino translations

Sections are present in the interface but empty until verified records exist.

---

## 🔄 Forking for Your LGU

This portal, like the BetterLB template it comes from, is designed to be adapted for any Local Government Unit (LGU) in the Philippines.

## Quick Start for Other LGUs

1. **Edit Configuration**: Update `/config/lgu.config.json` with your LGU details
2. **Update Translations**: Modify `/public/locales/en/common.json` for LGU-specific text
3. **Add Your Data**: Replace data files in `/src/data/` with your municipality's information
4. **Build and Test**: Run `npm install && npm run build`

### Configuration Files to Edit

| File | What to Change |
|------|------------------|
| `/config/lgu.config.json` | All LGU settings (name, province, coordinates, branding, transparency config) |
| `/public/locales/en/common.json` | UI text strings (hero title, footer copyright, government section) |
| `/src/data/directory/departments.json` | Municipal departments and offices |
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
| `lgu.officialWebsite` | Official LGU website | "https://www.dagupan.gov.ph" |
| `portal.name` | Portal name | "Better Dagupan" |
| `portal.baseUrl` | Portal base URL | "" — unset until a domain is assigned |

`portal.domain`, `portal.baseUrl`, and the social URLs are deliberately empty.
Leaving them unset keeps SEO canonicals root-relative and stops the portal
advertising a domain or account that does not exist.

**Note:** See [`FORKING.md`](./FORKING.md) for comprehensive forking instructions including database setup for legislative data.

## Technical Stack
*   **Frontend**: React 19, Vite, TypeScript (Strict mode)
*   **Styling**: Tailwind CSS v4 (CSS variables, high-contrast tokens)
*   **Design System**: @bettergov/kapwa (semantic tokens, component library)
*   **Backend**: Cloudflare Pages Functions (TypeScript)
*   **Deployment**: Wrangler 4.70.0 (pinned for compatibility)
*   **Data**: Structured JSON (Modular category-based architecture)
*   **Search**: Meilisearch with Fuse.js fuzzy search
*   **Localization**: i18next with English & Filipino support
*   **Maps**: Leaflet for geospatial visualizations
*   **Data Pipeline**: Python scripts for legislative document processing
*   **Testing**: Playwright (E2E tests across multiple browsers)
*   **Code Quality**: ESLint, Prettier, Husky pre-commit hooks
*   **Security**: Undici 8.0.2 (pinned for security fixes)

---

## Project Structure

```
better-dagupan/
├── e2e/                         # End-to-end tests
│   └── utils/                   # Test helpers and shared testing logic
├── functions/                   # Serverless / backend functions (Cloudflare Pages)
│   └── api/                     # API endpoints and handlers
├── pipeline/                    # Data processing pipeline (Python side)
│   ├── data/                    # Structured source documents
│   │   └── pdfs/                # Source legislative PDFs
│   │       ├── executive_orders/
│   │       ├── ordinances/
│   │       └── resolutions/
│   └── __pycache__/             # Python cache (auto-generated)
├── public/                      # Static public assets
│   ├── assets/                  # General media assets
│   ├── locales/                 # Translation files (en, fil)
│   └── logos/                   # Logo exports
├── raw_data/                    # Unprocessed data before pipeline cleanup
├── scripts/                     # Automation, maintenance, and build scripts
├── src/                         # Main application source code
│   ├── components/              # Reusable UI components
│   │   ├── data-display/        # Tables, cards, and record viewers
│   │   ├── home/                # Homepage-specific components
│   │   ├── layout/              # Layout wrappers, grids, headers, footers
│   │   ├── map/                 # Map visualizations and geospatial UI
│   │   ├── navigation/          # Menus, navbars, breadcrumbs
│   │   ├── search/              # Search bars, filters, query UI
│   │   ├── ui/                  # Generic UI elements (buttons, modals, etc.)
│   │   └── widgets/             # Small reusable info widgets
│   ├── constants/               # App-wide constant values and config
│   ├── data/                    # Structured frontend data layer
│   │   ├── about/               # About page content
│   │   ├── directory/           # Government directory datasets
│   │   │   └── schema/          # Data schemas for directory records
│   │   ├── legislation/         # Legislative data
│   │   │   ├── committees/
│   │   │   ├── documents/
│   │   │   │   └── sb_12/       # Session-specific legislative docs
│   │   │   ├── persons/         # Councilors, authors, sponsors
│   │   │   ├── sessions/        # Legislative sessions
│   │   │   │   └── sb_12/
│   │   │   └── term/            # Term metadata
│   │   ├── schema/              # Global data schemas
│   │   ├── services/            # Public service datasets
│   │   │   └── categories/      # Service classifications
│   │   ├── statistics/          # Municipality statistics datasets
│   │   └── transparency/        # Transparency and governance data
│   ├── hooks/                   # Custom reusable frontend hooks
│   ├── i18n/                    # Internationalization setup and config
│   │   ├── languages.ts         # Language definitions (English, Filipino)
│   │   └── README.md            # Translation guide
│   ├── lib/                     # Utility libraries and helpers
│   ├── pages/                   # Route-level pages (site sections)
│   │   ├── about/
│   │   ├── accessibility/
│   │   ├── contribute/
│   │   ├── data/                # Open data portal pages
│   │   ├── government/          # Government structure pages
│   │   │   ├── barangays/
│   │   │   ├── departments/
│   │   │   ├── elected-officials/
│   │   │   └── executive/
│   │   ├── legislation/         # Legislative portal for Ordinances/Resolutions/Executive Orders
│   │   ├── services/            # Public services portal
│   │   ├── sitemap/             # Human-readable sitemap
│   │   ├── statistics/          # Statistics portal
│   │   └── transparency/        # Transparency portal
│   │       ├── bids/
│   │       ├── components/
│   │       ├── financial/
│   │       ├── infrastructure/
│   │       └── procurement/
│   └── types/                   # Type definitions (TypeScript or schemas)
└── (root config files)          # package.json, build configs, .env files
```

### Key Components
- **Service Directory**: Categorized services from `src/data/services/categories/`
- **Legislative Portal**: Ordinances, resolutions, executive orders with document parsing
- **Transparency Portal**: Financial data, procurement, bids, infrastructure projects
- **Search Integration**: Meilisearch-powered search with real-time indexing
- **Internationalization**: Multi-language support with i18next

### LGU-Specific Data

These datasets are **currently empty**. The inherited Los Baños records were
removed, and verified Dagupan records have not been added yet. The JSON Schemas
and the types in `src/types/` document the shape each one must take.

| Data Type | Location | Description |
|-----------|----------|-------------|
| **Departments** | `/src/data/directory/departments.json` | City departments and offices with contact info |
| **Barangays** | `/src/data/directory/barangays.json` | Barangay profiles and officials |
| **Services** | `/src/data/services/categories/*.json` | Public services by category |
| **Citizens Charter** | `/src/data/citizens-charter/citizens-charter.json` | Service requirements, fees, and client steps |
| **Legislation** | Cloudflare D1 Database | Ordinances, resolutions, executive orders |
| **Statistics** | `/src/data/statistics/` | City demographics and indicators |

`services.json` and `merged-services.json` are generated by
`npm run merge:services`; edit the category files and the citizens charter
rather than the generated output.

#### Data Pipeline for Legislative Documents

Legislative documents are processed through a Python pipeline:

1. **Scrape** (`pipeline/1_scrape.py`) - Download PDFs from official sources
2. **Normalize** (`pipeline/1.5_normalize.py`) - Standardize filenames and metadata
3. **Parse** (`pipeline/3_parse.py`) - Extract text and metadata from PDFs
4. **Generate** (`pipeline/4_generate.py`) - Create structured JSON for database import

See [`pipeline/README.md`](./pipeline/README.md) for complete documentation.

---

## 🚀 How to Run Locally

### 1. Clone and Install
```bash
git clone https://github.com/jamesjmnz/better-dagupan
cd better-dagupan
npm install
```

### 2. Prepare Data
Since the service directory is split into manageable category files, you must merge them before running the app:
```bash
python3 scripts/merge_services.py
```

### 3. Start Development Server
```bash
npm run dev
```
**Access the portal at:** `http://localhost:5173`

### 4. Running Tests
```bash
npm run test:e2e        # Run all end-to-end tests
npm run lint            # Check code quality (max warnings = 0)
npm run format          # Format code with Prettier
```

### 5. Building for Production
```bash
npm run build           # Combines merge_services, TypeScript, and Vite build
```

**Note:** The build script runs `tsc && npm run merge:data && vite build` automatically

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

### Key Departments

The department roster is not documented here yet, for the same reason. Dagupan's
offices differ from the inherited template's, and listing them from memory would
be exactly the kind of unverified civic information this project must not
publish.

---

## Join the Grassroots Movement
We are looking for volunteers passionate about making Dagupan a better place. You don't need to be a developer to help!

### How You Can Contribute:
1.  **Non-Developers**: Visit the `/contribute` page on the live site to suggest new services or fix outdated information via GitHub Issues (requires a free GitHub account).
2.  **Developers**: Check the [Issues](https://github.com/jamesjmnz/better-dagupan/issues) tab for "Help Wanted" or "Good First Issue" labels.
3.  **Data Auditors**: Help us verify community submissions on GitHub to ensure the portal remains an authoritative source of information.
4.  **Translators**: Help translate the portal to Filipino and other Philippine languages by working on `public/locales/` files.

### Development Workflow
- Follow [Conventional Commits](https://www.conventionalcommits.org/) (enforced via commitlint)
- All PRs run ESLint and Prettier automatically
- E2E tests run on CI to ensure cross-browser compatibility

---

## 🚢 Deployment

### Production Deployment

Better Dagupan is not yet deployed; no production domain is assigned. The
template's deployment setup is retained and targets **Cloudflare Pages** with:
- **Frontend**: Vite build automatically deployed on push to `main` branch
- **Backend**: Cloudflare Pages Functions for API endpoints
- **Database**: Cloudflare D1 for legislative data
- **Search**: Meilisearch instance for fuzzy search
- **KV Storage**: Weather data caching with automatic updates
- **Wrangler**: Version 4.70.0 (pinned for compatibility)

### Deployment for Other LGUs

When deploying for your own LGU:

1. **Cloudflare Pages**: Connect your GitHub repository
2. **Environment Variables**: Configure your D1 database binding
3. **Custom Domain**: Set up your custom domain (e.g., `betterlgu.gov.ph`)
4. **Database Migration**: Run database migrations on remote D1 instance
5. **Meilisearch**: Deploy your own Meilisearch instance or use alternative search

**Note:** The deployment workflow uses Wrangler 4.70.0 (pinned in both `.github/workflows/deploy.yml` and `package.json`). If upgrading, ensure compatibility with the Wrangler Action and test thoroughly.

See [`ARCHITECTURE.md`](./ARCHITECTURE.md#deployment) for detailed deployment strategies.

## License and Data Sources

### Code License
This project is released under the [Creative Commons CC0](https://creativecommons.org/publicdomain/zero/1.0/) dedication. The work is dedicated to the public domain and can be freely used, modified, and distributed without restriction.

### Data Attribution
Better Dagupan will aggregate data from multiple sources. Each dataset records
its own source agency and retrieval date where the schema supports it:

| Data Source | Type | Attribution |
|-------------|------|-------------|
| **City Government of Dagupan** | Official government data, services directory | Public domain |
| **Philippine Government Procurement Portal (PhilGEPS)** | Procurement bids and awards | Republic of the Philippines |
| **Department of Budget and Management (DBM)** | Financial releases | Republic of the Philippines |
| **Department of Public Works and Highways (DPWH)** | Infrastructure projects | Republic of the Philippines |
| **Official Gazette of the Philippines** | Legislative documents reference | Republic of the Philippines |

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
