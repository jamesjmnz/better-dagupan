# PR #5 — feat: Better Dagupan branding, localization, and inherited-content safety

| | |
|---|---|
| **Merged** | 2026-08-21 |
| **Merge commit** | `1e457930b337d227588b6e04d7d5cecdf0cbd1e2` |
| **Branch** | `feat/dagupan-branding-content-safety` → `main` |
| **Diff** | 104 files, +1,757 / −27,468 |
| **Original PR** | <https://github.com/jamesjmnz/better-dagupan/pull/5> (historical reference) |

## Purpose

After PR #3 re-keyed the configuration, the portal still rendered Los Baños
government data under the Better Dagupan name: its offices with
`losbanos.gov.ph` addresses, its barangays, its elected officials, its census,
competitiveness, and budget figures, and its local history. This phase removed
that data, gave the portal its own identity, and made the independent-project
status explicit.

## Original scope

Branding assets, the disclaimer, English and Filipino copy, empty-state
handling, removal of inherited civic records, metadata, and tests. Routes and
`config.features.*` were left unchanged.

## Technical decisions

### Datasets were emptied to their loaders' valid shapes

Every dataset the UI imports was set to the empty shape its loader expects, not
a blanket `[]`; schemas were kept and shapes documented in `src/types/`.

| Dataset | Was | Now |
|---|---|---|
| `directory/{barangays,departments,executive,legislative}` | 14 / 33 / 3 / 1 Los Baños records | `[]` |
| `about/{history,highlights}` | 14 / 4 Los Baños entries | `[]` |
| `statistics/population`, `ari`, `cmci` | Los Baños figures | empty shapes |
| `transparency/sre` | 7 Los Baños quarters | `[]` |
| `citizens-charter/citizens-charter` | 176 Los Baños services | `{"services": []}` |
| `services/categories/*.json` (10) | Los Baños services | `[]` |

The generated `merged-services.json` and `services.json` are rebuilt by
`npm run merge:services` during the build, so their sources were emptied too.

Deleted: the tourism resort records, the Los Baños municipal seal, scraped
legislative HTML dumps, and leftover backup files. Kept: all JSON Schemas, the
generic service-category taxonomy, the national hotline list, and the national
agency website directory.

### Hardcoded facts in components

Two inherited facts lived in components rather than data and would not have been
removed by emptying datasets: a "1st Class Municipality" rank card and a "14
component barangays" count. Both were dropped rather than restated for Dagupan.

### Crashes on empty data

`/statistics`, `/statistics/competitiveness`, `/statistics/municipal-income`,
and `/transparency/financial` read fields off the first record and blanked the
route once the data was empty. Each now returns an honest empty state, placed
below the hooks so hook order stays stable.

### Empty states and the disclaimer

`NotYetAvailable` says verified Dagupan information has not been added yet,
rather than "No results found", which would imply a search came up empty. The
disclaimer ("Better Dagupan is an independent, community-led project. It is not
the official website of the City Government of Dagupan.") appears in the global
footer and as a homepage notice; names are interpolated from config.

### Metadata

- `seo-metadata.json` advertised a "Better Dagupan.org" domain that does not
  exist; the suffix was dropped. Two "official" claims became "independent".
- `robots.txt` pointed at the upstream national portal's sitemap and
  `sitemap.xml` listed its URLs; both were removed.
- The `llms.txt` generator now reads config and states the disclaimer.
- `og:image` is left out rather than pointed at an SVG with no `baseUrl`.

### Branding

The nine inherited SVGs embedded raster images as base64 (about 1 MB each). They
were replaced with two small hand-authored monogram SVGs. No city seal or
national emblem is used, because that would contradict the disclaimer.

## Commits

| Commit | Message |
|---|---|
| `b14afb5` | `chore: replace BetterLB branding assets with a Better Dagupan mark` |
| `8b4a457` | `feat: state the independent-project disclaimer across the portal` |
| `5f98c10` | `feat: retarget English and Filipino copy to Better Dagupan` |
| `8e616a7` | `refactor: let the portal render honestly with no civic records` |
| `9a5259f` | `data: remove inherited Los Banos civic records` |
| `a8f5e5c` | `fix: stop publishing an invented domain and an official-portal claim` |
| `fcc5fe2` | `test: cover Dagupan identity, the disclaimer, and content safety` |
| `459bcbd` | `docs: rewrite README and ABOUT as Better Dagupan` |
| `86133fc` | `data: remove orphaned Los Banos legislative dumps` |
| `6ad371a` | `fix: correct city wording found in the visual check` |
| `99a40f7` | `fix: make crawler guidance and licensing language accurate` |
| `1f7d3d8` | `fix: defer metadata that requires a production domain or PNG asset` |

## Files changed

Mainly `src/data/**` and its regenerated outputs, `public/logos/`,
`public/locales/{en,fil}/common.json`, `src/components/layout/` (footer,
disclaimer, SEO), the statistics and financial pages, `index.html`,
`public/robots.txt`, `public/llms.txt`, new unit and e2e specs, `README.md`, and
`ABOUT.md`.

## Validation and check results

| Check | Result |
|---|---|
| `npm run lint` | clean |
| `npm run test -- --run` | 410 passed (20 files), up from 353 / 15 |
| `npm run build` | clean; no Los Baños or BetterLB matches in `dist/` |
| `--grep @smoke` (chromium) | 8/8, assertions unchanged |
| `e2e/disclaimer` + `e2e/content-safety` | 24/24 |
| `tsc -p tsconfig.app.json` | 60 errors, identical to `main` |

The non-smoke e2e suite (which does not gate pull requests) went from 104 to 103
failures on chromium; it was already failing on inherited expectations.

Final CI state: all required checks passed, including Validate JSON files
against schema. Deploy to Cloudflare Pages was skipped (no credentials
configured).

## Data sources

No Dagupan records were added. This phase only removed inherited records.

## Known limitations and follow-ups

- Verified Dagupan civic data, the next phase.
- `portal.contactEmail` is still the shared BetterGov volunteer address.
- `transparency.procurement.organizationName` intentionally empty since PR #3.
- `src/i18n.ts` declares four namespaces but only `common` and `about` exist.
- `src/data/schema/services.schema.json` `$id` still reads `betterlb.org`.
- `config.features.tourism` gated nothing (removed later in PR #8).
- `scripts/README.md` described the sitemap script as writing `sitemap.xml`; it
  writes `llms.txt`.
- An OG image and the production domain await a deployment decision.
- `CONTRIBUTING.md`, `ARCHITECTURE.md`, `CONTEXT.md`, `FORKING.md`, and `docs/**`
  were left for the documentation phase.
