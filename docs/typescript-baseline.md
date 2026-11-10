# TypeScript error baseline

The repository inherited a large TypeScript error backlog. This file records
where it stands so the next phase does not have to repeat the investigation.

Last measured 2026-11-10 on `fix/typescript-errors`, branched from `main` at
`6fbd318`. The original 2026-08-22 measurement is kept below for history.

**All three projects are at zero errors, and CI enforces it:** `npm run
typecheck` runs the app, node and functions projects, and both the quality and
deploy workflows call it instead of the bare `npx tsc --noEmit` (which checked
no files).

## Toolchain

```
$ npx tsc --version
Version 5.9.3

$ npm ls typescript @types/react @types/react-dom --depth=0
├── @types/react-dom@18.3.7
├── @types/react@18.3.28
└── typescript@5.9.3
```

`react@19.1.0` is installed but the React type packages are still on 18.x.
Nothing in the backlog needed the upgrade: the two `lucide-react` "cannot be
used as a JSX component" errors came from indexing `import * as LucideIcons`
with a string, not from the type packages. The upgrade is still worth doing,
but it changes `package-lock.json` and belongs in its own change.

## The counts

There are three TypeScript projects. The root `tsconfig.json` references the
app and node projects; `functions/` has its own config.

| Project | Command | Before | Now |
|---|---|---|---|
| App (`src/`, tests included) | `npx tsc --noEmit -p tsconfig.app.json` | 304 | **0** |
| Pages Functions | `npx tsc --noEmit -p functions/tsconfig.json` | 101 | **0** |
| Node (`vite.config.ts`, `scripts/**/*.ts`) | `npx tsc --noEmit -p tsconfig.node.json` | 0 | 0 |

"Before" is `main` at `6fbd318`. The app count had drifted from 307 to 304
since the first measurement.

### The two remaining app errors

Both are in files that open pull requests are editing, so they were left
alone here. Each is a one-line fix in the file itself.

| File | Error | Cause |
|---|---|---|
| `src/pages/transparency/procurement/index.tsx:91` | TS2322 | `getBusinessCategoryBadgeVariant` returns `'slate'`, but its declared return type is `'primary' \| 'secondary' \| 'warning' \| 'success'`. `Badge` accepts `'slate'`, so widening the return type (or using `BadgeVariant`) fixes it. |
| `src/pages/government/elected-officials/municipal-committees.tsx:67` | TS2322 | Passes `heroActions` to `PageHero`, which has no such prop, so the committee search box is never rendered. Pass the search input as `PageHero` children, or give `PageHero` a `heroActions` slot. |

## What was fixed

Grouped by cause. Fixes are typed, not silenced: no new `@ts-ignore` or
`@ts-expect-error`, and `any` only where the test mocks implement the
overloaded KV and D1 methods.

**Test matcher types (244 errors).** `vitest.setup.ts` registered the
`@testing-library/jest-dom` matchers at runtime, but their types never entered
the program. `src/vitest-env.d.ts` now references
`@testing-library/jest-dom/vitest`, and the setup file imports that entry.

**kapwa `Button` used as a link.** The kapwa `Button` only renders a
`<button>`, so `href`, `target` and `rel` were passed to a button and the
controls on Join Us, Contact Us and the Join Us banner did not navigate.
`src/components/ui/ButtonLink.tsx` renders an anchor with the same class
recipe as the kapwa button; screenshots before and after are pixel-identical.
Admin buttons that passed `icon` now pass `leftIcon`.

**Props a component does not accept.** Badge variants (`'info'` → `'primary'`,
a non-existent `size`), `Card` `hoverable` → `hover`, kapwa button
`size='default'` → `'md'`, `PageHero` `subtitle` → `description`, the audit
log's `EmptyState` and `PaginationControls` props (the empty state crashed the
page), and `EmptyState` gained an `onAction` so Search can show its "Clear all
filters" button.

**Shared component types.** `BadgeVariant`, `IndexPageLayoutProps` and the
`SelectPicker` option types are exported; `SelectPicker` is generic over its
value type; `BreadcrumbItem` is imported from `@/types/components`, where it is
declared. The reconcile page used a `value`/`onChange` API `SelectPicker` never
had and now uses `options`/`selectedValues`/`onSelect`.

**Untyped responses.** Weather and forex responses are typed through
`fetchWithCache<T>`. The weather API shape (`WeatherApiCity`,
`WeatherApiHourly`) is now separate from the display shape (`HourlyForecast`),
and the weather icon map lives once in `src/lib/weather.ts`.

**Functions `Env`.** `Env` now declares `ENVIRONMENT` and
`REQUEST_SIZE_LIMIT`, which the security-headers and request helpers read.

**`withAuth`.** The wrapper now infers the handler's full context and returns
a function that takes that context without `auth`, so handlers can declare
their own route params. The `[id]` routes declare `params: { id: string }`,
which is what Pages passes for a file named `[id].ts`.

**D1 rows.** Queries pass their row type to `.all<T>()` / `.first<T>()`
instead of annotating `map` callbacks over `Record<string, unknown>`. Where a
`LEFT JOIN` can return a null term or session number, the formatter is only
called when the value is present.

**Functions tests.** The Workers mocks in `functions/test/test-utils.ts` now
implement `D1Database` and `KVNamespace` as declared (including the one- and
two-argument `get` forms), auth tests type their JSON bodies, and
`fail()` became `expect.unreachable()`. The unused
`functions/test/test-types.ts`, which imported app code across project
boundaries, was removed.

## CI is still not type-checking

`.github/workflows/quality-check.yml` and `.github/workflows/deploy.yml` run:

```yaml
run: npx tsc --noEmit
```

The root `tsconfig.json` is solution-style (`"files": []` plus references).
Without `-b`, `tsc` compiles an empty file list and exits 0, so that step
checks nothing. `npm run build` starts with the same bare `tsc`, and Vite
transpiles without type-checking.

The gate was not changed in this pass, because the app project is not yet at
zero. Once the two errors above are fixed:

1. Add a script to `package.json`:

   ```json
   "typecheck": "tsc --noEmit -p tsconfig.app.json && tsc --noEmit -p tsconfig.node.json && tsc --noEmit -p functions/tsconfig.json"
   ```

2. Replace `npx tsc --noEmit` with `npm run typecheck` in both workflows.
3. Optionally replace the bare `tsc` at the start of `npm run build` the same
   way.

## History: 2026-08-22 measurement

Measured on `main` at `1e45793`.

| Command | Result |
|---|---|
| `npx tsc --noEmit` | exit 0 (checks nothing) |
| `npx tsc -p tsconfig.app.json --noEmit` | 307 errors |
| `npx tsc -b --noEmit` | 307 errors |

Of the 307, 60 were in application source and 247 in test files; 246 of those
were `TS2339` from the missing jest-dom matcher types.
