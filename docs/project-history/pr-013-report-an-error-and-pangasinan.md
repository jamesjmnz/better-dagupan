# PR #13 — feat: add error reporting and Pangasinan locale scaffolding

| | |
|---|---|
| **Merged** | 2026-11-10 |
| **Merge commit** | `c2b62c855aa2f86f7e0c68643635cef45b604b41` |
| **Branch** | `feat/report-and-pangasinan` → `main` |
| **Diff** | 22 files, +756 / −6 |
| **Original PR** | <https://github.com/jamesjmnz/better-dagupan/pull/13> (historical reference) |

## Purpose

Give readers a way to report incorrect civic information, and lay the
groundwork for a Pangasinan translation without publishing any machine-written
text.

## Original scope

A GitHub issue form, a `/report-an-error` page, a link from every source note,
the Pangasinan (`pag`) locale scaffolding behind a feature flag, tests, and a
translation guide.

## Technical decisions

### Report an error

- **Issue form** `.github/ISSUE_TEMPLATE/incorrect-civic-info.yml` requires the
  page URL, what is wrong, the correct information, and an official source
  link, and asks people not to include personal information.
- **`/report-an-error` page** explains that a fact is published only when a
  primary government source states it, and opens the issue form with the page
  URL pre-filled from `?page=`. Only same-site paths are accepted; query strings
  and fragments are dropped. An email fallback pre-fills only the subject.
- **Every `SourceNote`** carries a small "Report an error" link for its page.
- The page is linked from the footer and the sitemap, in English and Filipino.

### Pangasinan scaffolding

- `pag` is registered with an English fallback. `public/locales/pag/*.json` are
  empty: no Pangasinan text is machine-written, and strings will come only from
  a human translator.
- The language appears in the switcher only when `features.pangasinan` is true
  (default `false`).
- The locale parity test still requires exact English/Filipino parity, and also
  checks that Pangasinan keys exist in English with the same placeholders.
- `supportedLngs` is set, so browser languages such as `en-US` resolve to `en`
  instead of requesting locale files that do not exist.
- `src/i18n/README.md` explains how to contribute translations.

## Commits

| Commit | Message |
|---|---|
| `c523817` | `feat: add an issue form for civic data corrections` |
| `85f95ee` | `feat: add a report-an-error page` |
| `aad6983` | `feat: link source notes to the report-an-error page` |
| `98df393` | `test: cover the report-an-error flow` |
| `f51f4bd` | `feat: scaffold a Pangasinan locale behind a feature flag` |
| `a7d13d0` | `test: check Pangasinan keys against English` |
| `9f1af06` | `docs: explain how to contribute Pangasinan translations` |

## Files changed

- Issue form: `.github/ISSUE_TEMPLATE/incorrect-civic-info.yml`
- Config: `config/lgu.config.json` (`features.pangasinan`), `src/lib/lguConfig.ts`,
  `scripts/setup-lgu.cjs`
- Frontend: `src/pages/ReportAnError.tsx`, `src/lib/reportError.ts`,
  `src/components/civic/SourceNote.tsx`, `src/components/layout/Navbar.tsx`,
  `src/App.tsx`, `src/data/navigation.ts`, `src/pages/sitemap/index.tsx`,
  `src/i18n.ts`, `src/i18n/languages.ts`, `src/types/index.ts`
- Locales: `public/locales/{en,fil}/common.json`, `public/locales/pag/*.json`
  (empty)
- Tests and docs: `src/lib/reportError.test.ts`,
  `src/data/__tests__/localeParity.test.ts`, `e2e/report-an-error.spec.ts`,
  `src/i18n/README.md`

## Validation and check results

| Check | Result |
|---|---|
| `vitest` | 513 passed |
| Prettier, lint, build | pass |
| `e2e/report-an-error.spec.ts` | 5/5 |
| `@smoke` | pass |

Final CI state: all required checks passed. Deploy to Cloudflare Pages was
skipped (no credentials configured).

## Known limitations and follow-ups

- Create a `data-correction` label so the form can apply it; the existing
  `contribution` label is also missing.
- Have someone who reads Filipino check the new strings.
