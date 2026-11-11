# PR #18 — fix: clear the TypeScript backlog and enforce the type check

| | |
|---|---|
| **Merged** | 2026-11-10 |
| **Merge commit** | `95798302d0c7d3ce2ad29142cef151072bd30034` |
| **Branch** | `fix/typescript-errors` → `main` |
| **Diff** | 68 files, +713 / −590 |
| **Original PR** | <https://github.com/jamesjmnz/better-dagupan/pull/18> (historical reference) |

## Purpose

Clear the inherited TypeScript backlog and make CI enforce the type
check.

## Original scope

Type errors across the app, the functions, and the tests; a
`typecheck` script; and the quality and deploy workflows.

## Technical decisions

| Project | Errors before | After |
|---|---|---|
| App (`tsconfig.app.json`) | 304 | 0 |
| Functions (`functions/tsconfig.json`) | 101 | 0 |
| Node (`tsconfig.node.json`) | 0 | 0 |

CI used to run a bare `npx tsc --noEmit`, which checked no files. The new
`npm run typecheck` runs all three projects, and both the quality and deploy
workflows use it.

### Bugs the type errors were hiding

- **Dead links.** Several were rendered as `<button href>` and went nowhere
  (Join Us "Learn More", Ideas, Contact). They now use a typed `ButtonLink`
  anchor with identical styling.
- **Audit log.** `/admin/audit-logs` crashed because its empty state got a JSX
  element instead of an icon component.
- **Reconcile filters.** They called a `SelectPicker` API that does not exist.
- **Search.** The "Clear all filters" action never rendered. `EmptyState` now
  supports `onAction`.
- **Functions.** `withAuth` infers each handler's route context;
  `sessions/[id]` declared the wrong param name; D1 rows are typed through
  `.all<T>()` and `.first<T>()` instead of casts.
- **Removed.** An unused cross-project test-types module.

## Commits

| Commit | Message |
|---|---|
| `e927564` | `fix: load jest-dom matcher types for vitest` |
| `412f088` | `fix: render button-styled links as anchors` |
| `bd9cde2` | `fix: align badge variants with the design system` |
| `808fb80` | `fix: pass the audit log its real button, empty-state and pagination props` |
| `3866dde` | `fix: correct layout component types and imports` |
| `bcf2c02` | `fix: type the weather and forex responses and share the weather icons` |
| `75da037` | `fix: type SelectPicker options by value and use its real API in reconcile` |
| `7e1e56d` | `fix: type admin form state and review-queue handlers` |
| `a800f45` | `test: type the chart tooltip and stat card matchers` |
| `211d3ae` | `fix: drop the duplicate feeSchedule field from the service type` |
| `0b9220d` | `fix: let EmptyState run an action so search can clear its filters` |
| `c300946` | `fix: pass card, button and hero props their components accept` |
| `995fb04` | `fix: declare the runtime settings the functions read from Env` |
| `ac08471` | `fix: type withAuth so handlers can declare their own route context` |
| `9b621ac` | `fix: type admin D1 rows and GitHub OAuth responses` |
| `132dc8b` | `fix: type the OpenLGU read API's D1 rows` |
| `f0763dc` | `test: align the Workers mocks and auth tests with the runtime types` |
| `773c1a0` | `chore: remove the unused functions test-types module` |
| `9c97704` | `docs: update the TypeScript baseline` |
| `e875e8b` | `fix: include slate in the business category badge variants` |
| `dceee1b` | `ci: type-check the app and functions` |
| `01adc60` | `docs: record that the type check is now enforced` |

## Files changed

- Config and CI: `.github/workflows/deploy.yml`,
  `.github/workflows/quality-check.yml`, `package.json`, `vitest.setup.ts`
- Functions: `functions/api/admin/attendance/[id].ts`,
  `functions/api/admin/auth/callback.ts`, `functions/api/admin/auth/logout.ts`,
  `functions/api/admin/documents/bulk.ts`,
  `functions/api/admin/parse-facebook-post.ts`,
  `functions/api/admin/persons-deletion-queue.ts`,
  `functions/api/admin/terms.ts`, `functions/api/admin/sessions/[id].ts`,
  `functions/api/admin/terms/[id].ts`, `functions/api/admin/workbench/utils.ts`,
  `functions/api/openlgu/` (5 files), `functions/api/openlgu/sessions/[id].ts`,
  `functions/types.ts`, `functions/utils/admin-auth.ts`,
  `functions/utils/security-headers.ts`
- Frontend: `src/components/home/InfoWidgets.tsx`,
  `src/components/home/JoinUsBanner.tsx`,
  `src/components/home/WeatherMapSection.tsx`,
  `src/components/layout/DetailPageLayout.tsx`,
  `src/components/layout/IndexPageLayout.tsx`,
  `src/components/layout/UnifiedLayouts.tsx`, `src/components/layout/index.ts`,
  `src/components/ui/` (5 files), `src/components/ui/extensions/index.tsx`,
  `src/lib/admin-api.ts`, `src/lib/forex.ts`, `src/lib/weather.ts`,
  `src/pages/ContactUs.tsx`, `src/pages/Ideas.tsx`, `src/pages/JoinUs.tsx`,
  `src/pages/admin/AuditLog.tsx`, `src/pages/admin/Reconcile.tsx`,
  `src/pages/admin/ReviewQueue.tsx`, `src/pages/admin/layout.tsx`,
  `src/pages/admin/components/AttendanceForm.tsx`,
  `src/pages/admin/components/LegislativePostImporter.tsx`,
  `src/pages/admin/components/PersonMergeTool.tsx`,
  `src/pages/admin/components/SessionDataForm.tsx`,
  `src/pages/data/weather.tsx`,
  `src/pages/government/reference-implementation.tsx`,
  `src/pages/openlgu/components/DocumentFilters.tsx`,
  `src/pages/openlgu/officials.tsx`, `src/pages/openlgu/terms.tsx`,
  `src/pages/transparency/procurement/index.tsx`, `src/types/index.ts`,
  `src/types/servicesTypes.ts`, `src/vitest-env.d.ts`
- Tests: `functions/test/test-types.ts`, `functions/test/test-utils.ts`,
  `functions/utils/__tests__/admin-auth-csrf.test.ts`,
  `functions/utils/__tests__/admin-auth-rbac.test.ts`,
  `functions/utils/__tests__/rbac.test.ts`,
  `src/components/data-display/ChartContainer.test.tsx`,
  `src/components/layout/__tests__/PageLayouts.test.tsx`,
  `src/components/ui/StatCard.test.tsx`
- Docs: `docs/typescript-baseline.md`

## Validation and check results

| Check | Result |
|---|---|
| `npm run typecheck` | 0 errors |
| `vitest` | 561 passed |
| Prettier, lint, build | pass |

Final CI state: all required checks passed. Deploy to Cloudflare Pages was
skipped (no credentials configured).

## Known limitations and follow-ups

- Single-select `SelectPicker`s in `OfficialsFilterBar` and `DocumentFilters`
  read `selected[0]`, which may keep the previous choice. Not a type error, so
  left for a separate fix.
