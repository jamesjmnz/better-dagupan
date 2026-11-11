# PR #25 — data: publish Dagupan's income and expenditure statements

| | |
|---|---|
| **Merged** | 2026-11-10 |
| **Merge commit** | `0949fb6273cd28cb2f5c47bb0de88984404c27c4` |
| **Branch** | `data/dagupan-city-income` → `main` |
| **Diff** | 24 files, +4,095 / −827 |
| **Original PR** | <https://github.com/jamesjmnz/better-dagupan/pull/25> (historical reference) |

## Purpose

Publish the City of Dagupan's fiscal data from the Bureau of Local
Government Finance (BLGF, `blgf.gov.ph/lgu-fiscal-data/`), the national office
that collects LGU finances.

## Original scope

The SRE and ARI datasets, the financial and income pages, tests, and the
verification record.

## Technical decisions

### Published

- **`transparency/sre.json`.** 21 Statements of Receipts and Expenditures for
  the "Dagupan City" row (Region I, Pangasinan, City): every quarter from Q1
  2022 to Q3 2026, plus full-year statements for FY 2022–2025. BLGF labels FY
  2024 "Final" and FY 2025 "Preliminary", and the page shows those labels.
- **`statistics/ari.json`.** Annual regular income for FY 2022–2025, with
  BLGF's own dependency ratios.
- **Units.** Amounts are stored in pesos to the centavo. The sheets say "In Php
  Million", but the cells hold pesos.

### Cross-checks (tested)

- Every total equals its parts.
- Each Q4 statement equals that year's full-year statement.
- Each year opens with the previous year's closing balance.
- Regular income adds up by BLGF's stated definition, and the ratios match its
  formula.
- The eight lines the income table shares with the full-year statement are
  identical in both workbooks.

### Page fixes

- **Annual view.** It was adding up quarters that already run from January, so
  January was counted four times. It now shows BLGF's full-year statement, or
  says none exists yet.
- **Income total.** It was multiplied by 1,000,000.
- **Badge.** A false "Verified Audit" badge is replaced by BLGF's
  Final/Preliminary label.
- **Breadcrumbs.** The financial page had two trails.

### Withheld

- **Labor and Employment and Housing lines for the 2024 quarters.** The 2024
  quarterly workbook has them swapped compared with the final FY 2024
  statement, for 605 of 1,716 LGUs. They are null, and the page explains why.
  Totals are published.
- **Income class.** The current schedule (DOF Order 074-2024) is a scanned PDF
  that could not be read.

## Commits

| Commit | Message |
|---|---|
| `2f828a7` | `feat: read year-to-date and annual statements on the financial page` |
| `381cb9c` | `data: publish Dagupan's statement of receipts and expenditures` |
| `cfd3d60` | `fix: drop the financial page's duplicate breadcrumb trail` |
| `3e9ca1a` | `test: assert financial statement provenance` |
| `b93a099` | `feat: show provenance on the income page` |
| `48876eb` | `data: publish Dagupan's annual regular income` |
| `227d6d3` | `fix: keep the headline figures readable on the income and financial pages` |
| `0548552` | `test: assert income provenance` |
| `786d9a1` | `docs: record the income verification` |

## Files changed

- Data: `src/data/sources/civic-sources.json`, `src/data/statistics/ari.json`,
  `src/data/transparency/budgetData.ts`, `src/data/transparency/sre.json`
- Frontend: `src/hooks/useFinancialData.ts`, `src/lib/budgetUtils.ts`,
  `src/pages/statistics/MunicipalIncomePage.tsx`,
  `src/pages/transparency/components/QuarterToggle.tsx`,
  `src/pages/transparency/components/SummaryCards.tsx`,
  `src/pages/transparency/financial/index.tsx`, `src/types/budgetTypes.ts`,
  `src/types/statisticsTypes.ts`
- Locales: `public/locales/en/statistics.json`,
  `public/locales/en/transparency.json`, `public/locales/fil/statistics.json`,
  `public/locales/fil/transparency.json`
- Tests: `e2e/content-safety.spec.ts`, `e2e/statistics/charts.spec.ts`,
  `e2e/statistics/index.spec.ts`, `e2e/transparency/financial.spec.ts`,
  `src/data/__tests__/ariProvenance.test.ts`,
  `src/data/__tests__/inheritedRecords.test.ts`,
  `src/data/__tests__/sreProvenance.test.ts`
- Docs: `docs/civic-data-verification.md`

## Validation and check results

| Check | Result |
|---|---|
| `vitest` | 665 passed |
| Typecheck, Prettier, lint, build | pass |
| chromium e2e | 235 passed, 34 skipped |

Final CI state: all required checks passed, including Validate JSON files
against schema. Deploy to Cloudflare Pages was skipped (no credentials
configured).

## Known limitations and follow-ups

- BLGF's workbooks ask that BLGF be "duly informed and/or recognized" when the
  data is reproduced. Every figure cites BLGF; consider also notifying
  lfdad@blgf.gov.ph.
- The spreadsheet extraction and upload dates are recorded as notes, and the
  fiscal year goes in `coverage`; the reasoning is in
  `docs/civic-data-verification.md`.
