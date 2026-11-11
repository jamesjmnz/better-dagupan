# Contributing to Better Dagupan

Thank you for your interest in contributing! We welcome developers, designers, writers, data auditors, and anyone passionate about better government transparency for the City of Dagupan.

Better Dagupan is an independent, community-led project. It is not the official website of the City Government of Dagupan.

---

## Quick Start

1. **Fork and Clone**
   ```bash
   git clone https://github.com/<your-username>/better-dagupan
   cd better-dagupan
   npm install --legacy-peer-deps
   ```

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**
   - Follow the code patterns below
   - Test your changes
   - Commit with conventional commits

4. **Submit Pull Request**
   - Target the `main` branch
   - Describe your changes clearly
   - Link related issues

---

## Code Conventions

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <short description>

Types (enforced by commitlint.config.js):
feat:     New feature
fix:      Bug fix
data:     Verified civic data changes
docs:     Documentation only
style:    Code style (no logic change)
refactor: Code refactoring
perf:     Performance improvement
test:     Adding or updating tests
build:    Build system or dependencies
ci:       CI workflows
chore:    Maintenance tasks
revert:   Revert an earlier commit

Examples:
feat(services): add search filter by category
fix(navbar): correct mobile menu toggle
data: add verified Dagupan barangay index
docs: update setup instructions
```

A commit with any other type is rejected by the `commit-msg` hook.

### Code Style

- **Prettier** auto-formats on commit (via Husky)
- **ESLint** enforces rules (max warnings = 0)
- **TypeScript** strict mode enabled

### Design System (Kapwa)

**Always use semantic tokens, never raw colors:**

```tsx
// ✅ Correct
<div className="bg-kapwa-surface text-kapwa-text-strong">

// ❌ Wrong
<div className="bg-blue-500 text-white">
```

### Component Guidelines

- **Keep components under 200 lines** - split if larger
- **Extract complex logic to hooks** - keeps components clean
- **Use barrel exports** - `index.ts` in component folders
- **Document exports** - JSDoc comments on public APIs

```tsx
// src/components/example/index.ts
export { Example } from './Example';
export type { ExampleProps };
```

---

## Development Workflow

### Setup

```bash
# Use correct Node version
nvm use  # or fnm use

# Install dependencies (CI uses the same flag)
npm install --legacy-peer-deps

# Prepare data files
npm run merge:services

# Start dev server
npm run dev
```

### Testing

```bash
# Run the smoke suite a pull request has to pass
npx playwright test --project=chromium --grep @smoke

# Run the full cross-browser E2E suite (slow — five browser projects)
npm run test:e2e

# Run specific test file
npx playwright test services.spec.ts

# Run with debug mode
npx playwright test --debug

# Run unit tests
npm run test -- --run

# Type-check the app, the Node config, and the functions
npm run typecheck

# Check linting
npm run lint

# Format code
npm run format
```

**Note:** E2E tests use Playwright with shared utilities in `e2e/utils/` for common testing patterns like semantic token validation.

### What CI runs on a pull request

Pull requests are gated by these checks:

| Check | Command |
|---|---|
| Code Quality Checks | `npm run typecheck`, `npm run lint`, and `npx prettier --check .` |
| Unit Tests | `npm run test -- --run` |
| Production Build Check | `npm run build` |
| E2E Smoke Tests | `npx playwright test --project=chromium --grep @smoke` |
| Validate JSON files against schema | `scripts/validate-json-schema.js`; runs only when `src/data/**/*.json` or a schema changes |

The full cross-browser Playwright suite and the axe accessibility suite
(`@a11y`) live in `.github/workflows/e2e.yml` and do **not** run on pull
requests: across five browser projects the suite takes longer than a pull
request should wait. They run weekly and on demand via `workflow_dispatch`.
Trigger them from the Actions tab before merging anything that touches
rendering broadly, or run them locally:

```bash
npm run test:e2e                                          # every project, excluding @visual
npx playwright test --project=chromium --grep @a11y       # accessibility only
```

Tag a test `@smoke` only if it must hold for any LGU — the smoke suite has to
survive the Dagupan adaptation without edits. Assertions about specific
officials, departments, or services belong in the full suite.

### Pre-commit Hooks

Husky runs automatically:
- **Kapwa token check** rejects raw `gray`/`slate` color classes in `src/pages/services`, `government`, `statistics`, `transparency`, and `openlgu`
- **lint-staged** runs `eslint --fix` and `prettier --write` on staged files
- **commitlint** checks the commit message type

### Testing Utilities

The project includes shared E2E testing utilities in `e2e/utils/`:

- **`kapwa.ts`** - Semantic token validation helper that enforces Kapwa design token usage
  - `assertKapwaTokens()` - Validates no raw Tailwind colors are used
  - Automatically excludes code examples from validation

These utilities help maintain design system consistency across the application.

---

## Project Patterns

### Data Fetching

```tsx
// Static data - direct import
import barangays from '@/data/directory/barangays.json';

// Dynamic data - API endpoint
const response = await fetch('/api/openlgu/documents');
```

### Custom Hooks

```tsx
// Extract complex logic to hooks
function useServiceData(slug: string) {
  const [data, setData] = useState(null);
  // ... logic
  return { data, loading, error };
}
```

### Page Structure

```tsx
// Standard page pattern
export default function PageName() {
  // 1. Hooks first
  const { data } = useData();

  // 2. Early returns
  if (!data) return <Loading />;

  // 3. Render
  return (
    <PageLayout>
      <PageHeader>...</PageHeader>
      <Content>...</Content>
    </PageLayout>
  );
}
```

---

## Common Tasks

### Contributing Civic Data

Read [`docs/civic-data-verification.md`](./docs/civic-data-verification.md)
first. In short:

1. Use primary government sources, and add each one to
   `src/data/sources/civic-sources.json`
2. Cite at least one source by id on every record
3. Leave a field `null` or `[]` when it cannot be verified; the interface shows
   it as not verified yet, never as absent
4. Update `src/data/__tests__/inheritedRecords.test.ts` deliberately when a
   dataset goes from empty to populated
5. Use the `data:` commit type

Never add officials, offices, contacts, services, budgets, or legislation from
memory or from an unofficial source.

### Reporting an Error

You do not need to edit data to fix a wrong fact:

1. Follow the "Report an error" link in the source note on the page, or open
   `/report-an-error` from the footer. The link carries the page's path, without
   its query string or fragment.
2. The page links to the "Incorrect Civic Information" issue form
   (`.github/ISSUE_TEMPLATE/incorrect-civic-info.yml`) with the page URL filled
   in. The form asks what is wrong, the correct information, and a link to
   where it is officially published. It is labelled `data-correction`.
3. A maintainer checks the official source and, if it holds, corrects the
   record in a `data:` commit following the verification guide.

Issues are public, so leave out personal information such as phone numbers or
home addresses. To suggest a new service instead, use the "Service
Contribution" form (`.github/ISSUE_TEMPLATE/contribution.yml`) linked from the
`/contribute` page and the services pages.

### Contributing Translations

English and Filipino must stay in step; `localeParity.test.ts` checks it.
Pangasinan strings must come from a human translator. See
[`src/i18n/README.md`](./src/i18n/README.md).

### Adding a New Service

1. Update service data in `src/data/services/categories/` or `src/data/citizens-charter/`, following the data rules above
2. Run `npm run merge:services`
3. Test the service detail page

### Adding a New Page

1. Create file in `src/pages/your-page/`
2. Add route in `src/App.tsx`
3. Add navigation link if needed
4. Add E2E test in `e2e/`

### Updating LGU Config

Edit `config/lgu.config.json` - changes apply automatically. Some values are still hardcoded elsewhere; see [`FORKING.md`](./FORKING.md#what-still-is-not).

---

## Pull Request Guidelines

### Before Submitting

- [ ] Smoke tests pass locally (`npx playwright test --project=chromium --grep @smoke`)
- [ ] Unit tests pass locally (`npm run test -- --run`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] Commits follow conventional format
- [ ] PR description explains changes

### PR Description Template

```markdown
## Summary
Brief description of changes

## Changes
- Change 1
- Change 2

## Testing
- Tested on: [browsers]
- E2E tests: [pass/fail/NA]

## Related Issues
Closes #123
```

---

## Getting Help

- **Issues:** [github.com/jamesjmnz/better-dagupan/issues](https://github.com/jamesjmnz/better-dagupan/issues)
- **Live Site:** not deployed yet
- **Template:** improvements that apply to every LGU portal can also go upstream to [BetterLB](https://github.com/BetterLosBanos/betterlb)

---

## License

By contributing, you agree that your code will be released under the [Creative Commons CC0](https://creativecommons.org/publicdomain/zero/1.0/) license.

---

**Thank you for contributing to Better Dagupan!** 🇵🇭
