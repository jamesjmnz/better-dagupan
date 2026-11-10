# Better Dagupan Architecture

High-level architecture overview for developers working on Better Dagupan, the
independent community portal for the City of Dagupan, Pangasinan. The
architecture is inherited from the [BetterLB](https://github.com/BetterLosBanos/betterlb)
template and kept largely as it was.

Better Dagupan is not deployed yet and has no production domain.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                     │
│  React 19 SPA + Tailwind CSS v4 + @bettergov/kapwa          │
└─────────────────────────────────────────────────────────────┘
              │                              │
              ▼                              ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│    Cloudflare Pages      │    │  BetterGov services      │
│  Static frontend +       │    │  (called from browser)   │
│  Pages Functions (/api)  │    │  • Meilisearch           │
└──────────────────────────┘    │    (PhilGEPS, DPWH)      │
       │            │           │  • DPWH project API      │
       ▼            ▼           │  • Forex API             │
┌─────────────┐ ┌────────────┐  └──────────────────────────┘
│ Cloudflare  │ │ External   │
│ D1 + KV     │ │ • OpenWeatherMap
│ (not bound  │ │ • GitHub OAuth
│  yet)       │ └────────────┘
└─────────────┘
```

**Architecture Type:** JAMstack (Static Frontend + Serverless Backend)

---

## Frontend Structure

### Component Hierarchy
```
App.tsx
├── Layout Providers (SidebarLayout, UnifiedLayouts)
│   └── Page Components (Home, Services, etc.)
│       ├── Feature Components (ServiceCard, DocumentTable)
│       │   └── Shared UI Components (Card, Badge, Button)
│       └── Data Providers (API calls, static imports)
```

### Key Directories
| Directory | Purpose |
|-----------|---------|
| `src/components/ui/` | Local UI components (Card, Badge, Dialog, empty states) |
| `src/components/civic/` | Provenance UI: `SourceNote`, `NotVerified` |
| `src/components/layout/` | Page structure (PageHeader, DetailPageLayout, Disclaimer) |
| `src/pages/` | Route-level pages |
| `src/data/` | Static JSON data (directory, services, statistics, sources) |
| `src/hooks/` | Custom React hooks |
| `src/lib/` | Utilities and helpers, including the typed config loader |

---

## Configuration

`config/lgu.config.json` holds the LGU's identity, portal branding, coordinates,
transparency filters, and feature flags. `src/lib/lguConfig.ts` types it and
`src/lib/lguLabels.ts` turns `lgu.type` into labels such as "Sangguniang
Panlungsod". Some values are still hardcoded outside the config; see
[`FORKING.md`](./FORKING.md#what-still-is-not).

---

## Design System

### Kapwa Design Tokens
**Never use raw colors in components.** Always use semantic tokens:

```tsx
// ✅ Correct
<div className="bg-kapwa-surface text-kapwa-text-strong">

// ❌ Wrong
<div className="bg-blue-500 text-white">
```

### Import Patterns
```tsx
// Base components from Kapwa (@bettergov/kapwa)
import { Button } from '@bettergov/kapwa/button';
import { Input } from '@bettergov/kapwa/input';

// Local UI components
import { Card, Badge } from '@/components/ui';
```

---

## Data Layer

### Static Data (Version Controlled)
Located in `src/data/`:
- **Directory:** Barangays (31, published) and city offices (34, published); elected officials (empty)
- **Sources:** `sources/civic-sources.json`, the citations every published record refers to
- **Services:** Category files and the citizens charter (empty)
- **Statistics and transparency:** Population, income, competitiveness, and SRE data (empty)

Publishing rules are in
[`docs/civic-data-verification.md`](./docs/civic-data-verification.md).

### Dynamic Data (Cloudflare D1)
- Legislative documents (ordinances, resolutions, executive orders)
- Persons (councilors, mayors, officials)
- Sessions and attendance
- Source records and staged records for review

No D1 database is bound yet. `functions/api/openlgu/_middleware.ts` answers
`503` with `legislative_data_unavailable` while `BETTERLB_DB` is missing, and the
OpenLGU pages show that the records are not published yet.

In the meantime, that empty state lists the ordinances the Sangguniang
Panlungsod posts on its own WordPress site (`openlgu.councilFeed` in
`config/lgu.config.json`). `/api/council-ordinances` proxies the feed live,
caches it at the edge for 30 minutes, and stores nothing: titles link to the
council's pages, and the date shown is the posting date, since the feed has no
ordinance number or enactment date. The council publishes no resolution or
executive order feed. This is an interim link-back list, not the pipeline: its
items are not source records, and nothing from it reaches D1. Once the
pipeline is re-keyed for Dagupan and canonical records exist, the OpenLGU pages
render those instead.

### External APIs
| Service | Purpose |
|---------|---------|
| BetterGov Meilisearch (`search2.bettergov.ph`) | PhilGEPS procurement and DPWH infrastructure search. `src/lib/meilisearch.ts` defaults to BetterGov's public search-only key |
| BetterGov DPWH API (`api.dpwh.bettergov.ph`) | Infrastructure project detail |
| BetterGov forex API (`api.bettergov.ph/forex`) | Foreign-exchange rates |
| OpenWeatherMap | Weather data, cached in the `WEATHER_KV` namespace |
| GitHub OAuth | Admin sign-in |

---

## Backend (Cloudflare Pages Functions)

### API Structure
```
functions/
├── index.ts          # Workers entry: CORS, security headers, scheduled weather job
├── weather.ts        # Weather read straight from KV
├── api/
│   ├── weather.ts    # /api/weather — OpenWeatherMap, cached in KV
│   ├── openlgu/      # /api/openlgu/* — public legislative data (D1)
│   └── admin/        # /api/admin/* — auth, documents, review queue, workbench
└── utils/            # withAuth, RBAC, CSRF, rate limiting, caching, audit log
```

### Security
- All admin endpoints use the `withAuth()` middleware chain
- GitHub OAuth sign-in; sessions are stored in KV and carried in an `admin_session` cookie
- Sign-in is fail-closed: an empty `AUTHORIZED_USERS` admits nobody
- State-changing admin requests need a CSRF token
- D1 queries use prepared statements

---

## Data Pipeline

Legislative documents go through the OpenLGU Legislative Source Pipeline
(`scripts/openlgu/`). Collectors emit source records, staging produces staged
records, shadow reconciliation compares them with canonical records, and only
reviewed promotion writes to D1. Local artifacts live under `pipeline/openlgu/`
and are not committed.

The collectors still target the template's sources (`losbanos.gov.ph` tables and
Sangguniang Bayan terms). Re-keying them to Dagupan's Sangguniang Panlungsod is a
later phase.

See [`docs/openlgu/source-pipeline.md`](./docs/openlgu/source-pipeline.md) for
details, [`CONTEXT.md`](./CONTEXT.md) for the vocabulary, and
[`docs/reference/betterlb-data-model.md`](./docs/reference/betterlb-data-model.md)
for the shape of the data inherited from BetterLB.

---

## State Management

### Client State
- **Component state:** `useState`, `useReducer`
- **URL state:** `nuqs` for search params
- **Shared state:** React context for admin auth and section layouts

### Server State
- Static data: Direct imports
- Dynamic data: API endpoints (fetch on demand)

---

## Testing

### E2E Tests (Playwright)
Located in `e2e/`:
- Smoke suite (`@smoke`) that must hold for any LGU
- Content safety and disclaimer checks
- Government directory, services, statistics, and transparency pages
- Admin dashboard operations
- Semantic token validation (via `e2e/utils/kapwa.ts`)

**Shared Testing Utilities:**
- `e2e/utils/kapwa.ts` - Validates Kapwa design token usage and prevents raw Tailwind colors

### Unit Tests (Vitest)
Component tests, library tests, and data tests in `src/data/__tests__/` that
enforce provenance and keep inherited records out.

---

## Deployment

### Better Dagupan
- **Platform:** Cloudflare Pages, project `better-dagupan` (`wrangler.jsonc`)
- **Workflow:** `.github/workflows/deploy.yml`, Node from `.nvmrc`; the deploy job is skipped until `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are set
- **Database:** none bound yet
- **KV:** none bound yet (`WEATHER_KV` is needed for weather and admin sessions)
- **Search:** Shared BetterGov Meilisearch
- **Domain:** not yet assigned
- **Wrangler:** 4.70.0 (pinned for compatibility)

### For Other LGUs
1. Create a Cloudflare Pages project and set its name in `wrangler.jsonc` and `deploy.yml`
2. Add the Cloudflare secrets to the repository
3. Create and bind your own KV namespace and, when needed, D1 database
4. Run database migrations
5. Set a custom domain and add it to the CORS allow-lists

**Note:** The deployment workflow pins Wrangler to version 4.70.0 to avoid compatibility issues with newer versions. Update both `.github/workflows/deploy.yml` and `package.json` if upgrading.

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `config/lgu.config.json` | LGU settings |
| `src/App.tsx` | Root component with routing |
| `src/i18n.ts`, `src/i18n/` | Internationalization setup and language definitions |
| `public/locales/` | English and Filipino translations |
| `functions/` | Backend API endpoints |
| `wrangler.jsonc` | Cloudflare Pages project and bindings |
| `.env.example`, `.dev.vars.example` | Environment variable templates |

---

For design decisions, see [`docs/adr/`](./docs/adr/). For anything else, open an
issue.
