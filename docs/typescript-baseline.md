# TypeScript error baseline

The repository carries a large inherited TypeScript error backlog. Two different
counts have been reported for it — 60 and 307 — and both are correct. They
measure different scopes. This records the measurements so the next phase does
not have to repeat the investigation.

Measured 2026-08-22 on `main` at `1e45793` and on `data/dagupan-barangay-foundation`.

## Toolchain

```
$ npx tsc --version
Version 5.9.3

$ npm ls typescript @types/react @types/react-dom --depth=0
├── @types/react-dom@18.3.7
├── @types/react@18.3.28
└── typescript@5.9.3
```

Note the mismatch: `react@19.1.0` is installed, but the React type packages are
still on 18.x. That accounts for several of the app-source errors, including the
`lucide-react` "cannot be used as a JSX component" failure.

## The counts

| Command | Result |
|---|---|
| `npx tsc --noEmit` | **exit 0 — passes** |
| `npx tsc -p tsconfig.app.json --noEmit` | **307 errors** |
| `npx tsc -b --noEmit` | 307 errors |

Split of the 307:

| Scope | Errors |
|---|---|
| Application source (non-test) | **60** |
| Test files (`*.test.ts` / `*.test.tsx`) | 247 |
| **Total** | **307** |

`main` and the Phase 3A branch produce **byte-identical** error output; a sorted
diff of the two is empty. Phase 3A introduces zero additional errors.

## Why the numbers differ

**60 is the application-source count.** It excludes test files.

**247 of the errors are in test files and are a configuration gap, not defects.**
The dominant code is `TS2339` (246 occurrences), almost all of the form:

```
Property 'toBeInTheDocument' does not exist on type 'Assertion<HTMLElement>'.
```

`tsconfig.app.json` has `"include": ["src"]`, so it type-checks the co-located
test files. The matcher types come from `@testing-library/jest-dom`, which is
imported only at runtime in `vitest.setup.ts` and never enters the type graph.
The tests themselves pass — all 440 of them.

**`npx tsc --noEmit` passes because it checks nothing.** The root
`tsconfig.json` is a solution-style config:

```json
{ "files": [], "references": [{ "path": "./tsconfig.app.json" },
                              { "path": "./tsconfig.node.json" }] }
```

With `files: []` and no `-b`, `tsc` compiles an empty file list and exits 0. It
does not follow the references. Build mode (`tsc -b`) does, and reports the same
307.

## This matters for CI

`.github/workflows/quality-check.yml` and `.github/workflows/deploy.yml` both run:

```yaml
run: npx tsc --noEmit
```

That gate is currently **vacuous** — it type-checks zero files and cannot fail.
A green "Code Quality Checks" tick does not mean the app type-checks.

`npm run build` has the same shape: its `tsc` step is the bare root invocation,
so the build also does not type-check the application. Vite transpiles without
type-checking, so nothing else catches it either.

## Recommended remediation, in order

Not done here — Phase 3A deliberately does not touch the baseline.

1. Add the jest-dom matcher types to the type graph (a `types` entry or a
   `.d.ts` reference). Expected to clear ~247 errors without touching any test.
2. Change the CI and `build` commands to `tsc -b --noEmit` so the gate is real.
3. Align `@types/react` / `@types/react-dom` with React 19.
4. Work through the remaining application-source errors, then turn the gate red-on-failure.

Step 2 must come after 1 and 3, or CI turns red immediately.
