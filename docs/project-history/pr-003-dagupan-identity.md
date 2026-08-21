# PR #3 — feat: configure Better Dagupan identity and LGU configuration

| | |
|---|---|
| **Merged** | 2026-08-21 |
| **Merge commit** | `267fab990431183e64ad444f52d91c2a5576ebdd` |
| **Branch** | `feat/dagupan-identity-config` → `main` |
| **Diff** | 9 files, +98 / −70 |
| **Original PR** | <https://github.com/jamesjmnz/better-dagupan/pull/3> (historical reference) |

## Purpose

Phase 1 of the adaptation: re-key the portal's identity and configuration from the
inherited BetterLB (Los Baños) template to the City of Dagupan, so that every
config-driven surface — SEO titles, navbar, footer, LGU-type labels, weather, and
the transparency filters — stopped asserting Los Baños.

`config/lgu.config.json` is the single source of LGU configuration for the whole
portal, which is what made this the change that unblocked every later phase.

## Original scope

Configuration and identity only. Branding assets, page content, localisation, and
civic datasets were explicitly deferred to later phases.

Civic datasets under `src/data` were not modified. `src/data/navigation.ts` changed
only to suppress unset social links.

## Verified values

Each of these was confirmed against a primary government source or the live
BetterGov dataset that consumes it.

| Config value | Value | Verification |
|---|---|---|
| `lgu.officialWebsite` | `https://www.dagupan.gov.ph` | Official website of the City Government of Dagupan |
| `lgu.provinceWebsite` | `https://www.pangasinan.gov.ph` | Province of Pangasinan — Dagupan City page |
| `lgu.type` | `city` | Dagupan is an independent component city of Pangasinan |
| `lgu.region` | `Region I` | Live DPWH dataset: `location.region` is exactly `"Region I"` for Dagupan works (391 of 484 sampled rows) |
| `lgu.districtEngineeringOffice` | `Pangasinan 2nd DEO` | Live-index verified — see below |
| `location.coordinates` | `16.0433, 120.3333` | Dagupan City centre; drives the home map and the weather handler |

## Technical decisions

### `lgu.type` was the highest-leverage single change

`src/lib/lguLabels.ts` keys off it, so setting `city` flipped the whole portal from
*Sangguniang Bayan* / *Municipal* to *Sangguniang Panlungsod* / *City* with no
further edits. Confirmed present in the production bundle.

### `region` and `regionCode` mirror the template's split

The template stored `region: "Region IV-A"` alongside `regionCode: "CALABARZON"`,
so Dagupan uses `region: "Region I"` with `regionCode: "Ilocos Region"`.
`config.lgu.region` is load-bearing —
`src/pages/transparency/infrastructure/index.tsx` feeds it into the DPWH
dashboard's `regions` and `provinces` query parameters — so the value had to keep
matching the upstream facet convention rather than read as prose.

A related documentation defect was fixed: the `regionCode` doc-comment in
`src/lib/lguConfig.ts` claimed the field held an ISO-like numeral, when neither the
template nor this fork has ever stored one there.

### `lgu.name` is `Dagupan`, not `Dagupan City`

It is interpolated into phrases like `Community Powered {name} Portal`,
`{name} Gov.ph`, and `Cost to the People of {name}`, and it is the DPWH free-text
search term. `fullName` carries "City of Dagupan".

### `districtEngineeringOffice` was verified against the live index, not inferred

This value initially carried naming-pattern inference alone, which is not an
acceptable basis for a value that selects which records display as Dagupan's. It
was checked directly against the public DPWH API (`api.dpwh.bettergov.ph`), the
same upstream data behind the Meilisearch `dpwh` index the infrastructure page
queries.

Of 484 sampled projects whose description mentions Dagupan, the `location.province`
values were:

| Count | `location.province` |
|---|---|
| 256 | `Pangasinan 2nd DEO` |
| 96 | `Region I` |
| 14 | `Pangasinan 4th DEO` |
| 4 | `Pangasinan 3rd DEO` |
| — | remainder are unrelated DEOs — false hits on the word "Dagupan", excluded by the `location.region` filter |

`Pangasinan 2nd DEO` is the exact canonical string, is the dominant value, and
covers works explicitly named in Dagupan City (for example riverbank protection
along the Sinucalan River, Brgys. 2 and 3, Dagupan City). Independently, DPWH
confirms Dagupan City falls under that district office.

Two findings from the same check were recorded:

1. Plain `"Pangasinan"` never appears as a `location.province` value, so the
   consumer's `OR location.province = "{province}"` fallback branch matches
   nothing. It is inert, not harmful, and was left alone.
2. Dagupan works also sit under `Region I`, `Pangasinan 4th DEO`, and
   `Pangasinan 3rd DEO`, so the single-DEO filter is under-inclusive (roughly 256
   of 370 relevant rows). It is never misleading, because results are post-filtered
   client-side against `exactMatchTargets`.

### `organizationName` was left unset because it could not be verified

`"CITY OF DAGUPAN, PANGASINAN"` was inferred from the template's
`"MUNICIPALITY OF LOS BAÑOS, LAGUNA"` pattern. Following a naming pattern is not
verification, and this value decides which procurement records are presented as the
City of Dagupan's, so it was removed rather than shipped on inference.

It could not be verified at the time: the `philgeps` index requires a bearer token
that is not configured in this repository, and no public PhilGEPS endpoint exposes
the entity list (unlike DPWH, which has an open API). The discovery procedure
documented in `docs/MEILISEARCH_INTEGRATION_GUIDE.md` needs an authenticated
client.

**A blank value was not safe on its own.** The document filter degrades harmlessly
to `organization_name = ""`, but two other paths did not:

- the aggregate lookup calls `orgIndex.search(ORG_NAME)`, and an empty query
  returns an arbitrary organization, whose contract count and peso total would have
  rendered as Dagupan's headline procurement figures
- the outbound dashboard URL degrades to the all-organizations index while still
  being labelled "View Dagupan Charts"

All three paths are now gated on a configured entity name, and the empty state
distinguishes *"Procurement Source Pending"* from *"No Records Found"* so a blank
value reads as unconfigured rather than as an LGU with no procurement activity.

### The production domain is unset

`portal.domain` and `portal.baseUrl` are empty strings — the pattern
`scripts/setup-lgu.cjs` already uses for unset values, and valid against the
required `string` in the `LGUConfig` interface. SEO canonical and Open Graph URLs
become root-relative until a domain is assigned.

### Emptying the social URLs required a paired code change

The inherited Discord and Facebook URLs belonged to the BetterLB community rather
than this fork, but `footerNavigation.socialLinks` mapped them unconditionally, so
blank values would have rendered two dead footer links. A single filter now drops
entries without an href.

### `dataPaths` was broken, not merely stale

It pointed at `src/data/lgu/losbanos/directory/`, a directory that has never
existed in this repository. Nothing reads it at runtime, so it silently misled
anyone using it as a map of the data layer. It now matches what
`scripts/setup-lgu.cjs` generates, and all five targets resolve to real files.

### The weather handler hardcodes its city independently of the config

Left alone, it would have kept returning Los Baños observations under a Dagupan
banner. `DEFAULT_CITY` now points at Dagupan, consistent with
`location.coordinates` and `lgu.name`, because `src/lib/weather.ts` derives the
response key from the configured LGU name. The `betterlb.pages.dev` and
`betterlb.gov.ph` CORS origins were removed from both weather handlers; no
production origin replaces them yet.

## Commits

Seven commits, all preserved through the merge:

| Commit | Message |
|---|---|
| `a53e858` | `chore: retarget package metadata to Better Dagupan` |
| `6a58fcc` | `chore: configure City of Dagupan LGU identity` |
| `548f801` | `chore: set Better Dagupan portal identity and unset production domain` |
| `79385fc` | `chore: point transparency filters at City of Dagupan` |
| `d541bc9` | `fix: correct stale LGU dataPaths and configuration documentation` |
| `6d292f0` | `fix: serve Dagupan weather and drop inherited portal origins` |
| `61449fd` | `fix: leave the PhilGEPS entity name unconfigured until verified` |

## Files changed

- `config/lgu.config.json` (+28/−26) — LGU, portal, location, transparency, and
  `dataPaths` blocks
- `package.json` (+1/−1), `package-lock.json` (+2/−2) — `betterlb-portal` →
  `better-dagupan-portal`
- `src/pages/transparency/procurement/index.tsx` (+52/−25) — gate queries and the
  outbound dashboard link on a configured PhilGEPS entity name
- `functions/api/weather.ts` (+6/−8), `functions/weather.ts` (+1/−2) — default city
  and CORS origins
- `src/data/navigation.ts` (+3/−1) — drop social links whose URL is unset
- `src/lib/lguConfig.ts` (+1/−1), `src/lib/lguLabels.ts` (+4/−4) — doc-comment
  corrections only

## Validation and check results

Local validation:

| Check | Result |
|---|---|
| `npm run lint` | pass, clean |
| `npm run test -- --run` | pass — 353/353 across 15 files |
| `npm run build` | pass — `tsc` clean |
| `CI=true npx playwright test --project=chromium --grep @smoke` | pass — 8/8 |

No pre-existing failures were observed, and `npm run merge:services` (invoked by
`build`) produced no diff.

Final CI state — all checks passing:

| Check | Result |
|---|---|
| Code Quality Checks | pass |
| Unit Tests | pass |
| Production Build Check | pass |
| E2E Smoke Tests | pass |
| Quality Gate | pass |
| Security Vulnerability Scan | pass |
| Code Complexity Analysis | pass |
| zizmor | pass |
| Deploy to Cloudflare Pages | skipped (no credentials configured) |

The smoke suite added in PR #2 passed unchanged, which was its design intent: it
survived a complete rewrite of the LGU identity because it asserts no
LGU-specific content.

## Data sources

No officials, departments, services, budgets, procurement records, infrastructure
projects, barangays, or statistics were added.

Sources consulted for the configuration values: the official website of the City
Government of Dagupan, the Province of Pangasinan website, DPWH (for district
engineering office jurisdiction), and the public DPWH project API (for canonical
facet values).

## Known limitations and follow-ups

Deferred configuration, left unconfigured rather than guessed:

| Config value | State | Reason |
|---|---|---|
| `portal.domain`, `portal.baseUrl` | empty | No production domain assigned |
| `portal.discordUrl`, `portal.facebookUrl` | empty | Inherited URLs were BetterLB's own channels |
| `transparency.procurement.organizationName` | empty | Could not be verified |
| `portal.contactEmail` | shared BetterGov volunteer address | Not Los Baños-specific; needs a project decision |
| logo and favicon paths | still `betterlb-*` | Repointing before Dagupan artwork exists would break every image |

Follow-ups:

1. Obtain a Meilisearch search key, then confirm the PhilGEPS entity name and set
   `transparency.procurement.organizationName`.
2. Consider broadening the DPWH province filter to the other Pangasinan DEOs and
   `Region I`, to recover the roughly 30% of Dagupan works currently missed.
3. Decide whether Better Dagupan needs its own contact address.
4. Replace the inherited `betterlb-*` branding assets.

Remaining Los Baños and BetterLB references, deferred by design:

- `public/locales/en|fil/common.json` — "Welcome to BetterLB", "Municipality of Los
  Baños", "2025 BetterLB.org" → branding and localisation phase
- `src/data/**` — directory, services, statistics, tourism, about → data phase
- `README.md`, `FORKING.md`, `ARCHITECTURE.md`, `CONTEXT.md`, `ABOUT.md`,
  `CONTRIBUTING.md`, `docs/**` → documentation phase
- `.github/workflows/deploy.yml` (`--project-name=betterlb`),
  `verify-contributions.yml` ("BetterLB Auditor Bot") → deployment phase
- `e2e/test-config.ts` and `e2e/government/barangays.spec.ts` fixtures → test
  phase; neither is tagged `@smoke`, so neither gated this pull request
