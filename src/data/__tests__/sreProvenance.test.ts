import { describe, expect, it } from 'vitest';

import { getCivicSource, hasCivicSource } from '@/lib/civicSources';

import budgetData from '@/data/transparency/budgetData';

import type { FinancialStatement } from '@/types/budgetTypes';

/**
 * Dagupan's Statements of Receipts and Expenditures, from BLGF's by-LGU
 * workbooks. BLGF is the only publisher of these figures, so corroboration
 * comes from arithmetic and from separately issued BLGF workbooks agreeing:
 * every total must equal its parts, the fourth-quarter statement must equal
 * the full-year one, and each year must open with the balance the previous
 * year closed on. See docs/civic-data-verification.md, "Worked example: the
 * city's receipts and expenditures".
 */
const statements: FinancialStatement[] = budgetData;

const INHERITED = /los ba(ñ|n)os|laguna|region iv-a|municipality/i;

/** BLGF's full-year totals for the city, as the by-LGU workbooks state them. */
const EXPECTED_ANNUAL = [
  {
    year: 2022,
    income: 1407927643.51,
    expenditure: 938887762.39,
    net: 469039881.12,
    fundEnd: 1278121572.11,
  },
  {
    year: 2023,
    income: 1320951707.3,
    expenditure: 863842037.23,
    net: 457109670.07,
    fundEnd: 1613889524.08,
  },
  {
    year: 2024,
    income: 1417022040.63,
    expenditure: 1107702137.5,
    net: 309319903.13,
    fundEnd: 1648591375.42,
  },
  {
    year: 2025,
    income: 1582363793.32,
    expenditure: 1309879843.74,
    net: 272483949.58,
    fundEnd: 1245379038.07,
  },
];

/** The two lines the 2024 quarterly workbook transposes against the final FY 2024 statement. */
const TRANSPOSED_2024 = [
  'current_operating_expenditures.social_services.labor_and_employment',
  'current_operating_expenditures.social_services.housing_and_community_development',
];

/** Parts are rounded to the centavo, so a sum may drift by half a centavo per part. */
const expectSum = (parts: (number | null)[], total: number, label: string) => {
  const known = parts.filter((p): p is number => p !== null);
  expect(
    Math.abs(known.reduce((a, b) => a + b, 0) - total),
    label
  ).toBeLessThanOrEqual(0.005 * parts.length + 1e-6);
};

/** Every numeric leaf, by dotted path. */
const leaves = (value: unknown, prefix = ''): [string, unknown][] => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.entries(value as Record<string, unknown>).flatMap(([k, v]) =>
      leaves(v, prefix ? `${prefix}.${k}` : k)
    );
  }
  return [[prefix, value]];
};

const AMOUNT_ROOTS = [
  'current_operating_income',
  'current_operating_expenditures',
  'net_operating_income_loss_from_current_operations',
  'non_income_receipts',
  'non_operating_expenditures',
  'fund_summary',
] as const;

const amountsOf = (s: FinancialStatement) =>
  AMOUNT_ROOTS.flatMap(root => leaves(s[root], root));

const annual = (year: number) =>
  statements.find(s => s.basis === 'annual' && s.fiscal_year === year);

describe('statements of receipts and expenditures', () => {
  it('publishes statements, each for Dagupan City', () => {
    expect(statements.length).toBeGreaterThan(0);
    for (const s of statements) {
      expect(s.location_info, s.period).toEqual({
        region: 'Region I',
        province: 'Pangasinan',
        lgu_name: 'Dagupan City',
        lgu_type: 'City',
      });
    }
  });

  it('lists each period once, in order, with a consistent label', () => {
    const periods = statements.map(s => s.period);
    expect(new Set(periods).size).toBe(periods.length);

    const order = (s: FinancialStatement) =>
      s.fiscal_year * 10 + (s.basis === 'annual' ? 5 : (s.quarter ?? 0));
    const keys = statements.map(order);
    expect([...keys].sort((a, b) => a - b)).toEqual(keys);

    for (const s of statements) {
      if (s.basis === 'annual') {
        expect(s.quarter).toBeNull();
        expect(s.period).toBe(`FY-${s.fiscal_year}`);
      } else {
        expect(s.quarter).not.toBeNull();
        expect(s.period).toBe(`Q${s.quarter}-${s.fiscal_year}`);
      }
      // BLGF's own heading names the same year, and the status is only ever
      // the label BLGF printed.
      expect(s.blgf_label).toContain(String(s.fiscal_year));
      const printed = /\((Final|Preliminary)\)/.exec(s.blgf_label)?.[1];
      expect(s.status).toBe(printed ? printed.toLowerCase() : null);
    }
  });

  it('cites the BLGF workbook for its own period', () => {
    for (const s of statements) {
      expect(s.sources.length, s.period).toBeGreaterThan(0);
      for (const id of s.sources) {
        expect(hasCivicSource(id), `unknown source "${id}"`).toBe(true);
        const source = getCivicSource(id);

        expect(source.agency).toBe('Bureau of Local Government Finance');
        expect(source.derives_from).toBeNull();
        expect(source.url).toMatch(/^https:\/\/blgf\.gov\.ph\/wp-content\//);
        // A fiscal statement covers a period, and the page labels every
        // figure with it; the source's coverage must be that same year.
        expect(source.coverage, id).toContain(`FY ${s.fiscal_year}`);
      }
      const expected =
        s.basis === 'annual'
          ? `blgf-sre-by-lgu-fy${s.fiscal_year}`
          : s.fiscal_year === 2026
            ? 'blgf-sre-quarterly-fy2026-q3'
            : `blgf-sre-quarterly-fy${s.fiscal_year}`;
      expect(s.sources).toEqual([expected]);
    }
  });

  it('states every amount in pesos to the centavo, with nothing filled in', () => {
    const withheld = new Map(
      statements.map(s => [s.period, new Set(s.withheld.map(w => w.field))])
    );
    for (const s of statements) {
      for (const [path, value] of amountsOf(s)) {
        if (withheld.get(s.period)?.has(path)) {
          expect(value, `${s.period} ${path}`).toBeNull();
          continue;
        }
        expect(typeof value, `${s.period} ${path}`).toBe('number');
        expect(Number.isFinite(value as number)).toBe(true);
        expect(
          Math.abs(
            Math.round((value as number) * 100) - (value as number) * 100
          )
        ).toBeLessThan(1e-4);
      }
      // A statement for a city of this size in millions would be a unit slip.
      expect(
        s.current_operating_income.total_current_operating_income
      ).toBeGreaterThan(1_000_000);
    }
  });

  it('withholds only the lines the 2024 BLGF workbooks disagree on', () => {
    for (const s of statements) {
      if (s.fiscal_year === 2024 && s.basis === 'year_to_date') {
        expect(s.withheld).toEqual(
          TRANSPOSED_2024.map(field => ({
            field,
            reason: 'conflicting_sources',
          }))
        );
      } else {
        expect(s.withheld, s.period).toEqual([]);
      }
    }
  });

  it('adds every part up to the total BLGF states', () => {
    // The strongest check on the transcription: a mistyped, shifted or
    // dropped cell breaks one of these sums.
    for (const s of statements) {
      const p = s.period;
      const inc = s.current_operating_income;
      const ls = inc.local_sources;
      const tr = ls.tax_revenue;
      const nt = ls.non_tax_revenue;
      const ex = inc.external_sources;
      const rpt = tr.real_property_tax;
      expectSum(
        [rpt.general_fund, rpt.special_education_fund],
        rpt.total,
        `${p} RPT`
      );
      expectSum(
        [rpt.total, tr.tax_on_business, tr.other_taxes],
        tr.total_tax_revenue,
        `${p} tax`
      );
      expectSum(
        [
          nt.regulatory_fees,
          nt.service_user_charges,
          nt.receipts_from_economic_enterprises,
          nt.other_receipts,
        ],
        nt.total_non_tax_revenue,
        `${p} non-tax`
      );
      expectSum(
        [tr.total_tax_revenue, nt.total_non_tax_revenue],
        ls.total_local_sources,
        `${p} local`
      );
      expectSum(
        [
          ex.national_tax_allotment,
          ex.other_shares_from_national_tax_collection,
          ex.inter_local_transfers,
          ex.extraordinary_receipts_grants_donations_aids,
        ],
        ex.total_external_sources,
        `${p} external`
      );
      expectSum(
        [ls.total_local_sources, ex.total_external_sources],
        inc.total_current_operating_income,
        `${p} income`
      );

      const exp = s.current_operating_expenditures;
      const soc = exp.social_services;
      if (s.withheld.length === 0) {
        expectSum(
          [
            soc.education_culture_sports_manpower_development,
            soc.health_nutrition_population_control,
            soc.labor_and_employment,
            soc.housing_and_community_development,
            soc.social_services_and_social_welfare,
          ],
          soc.total_social_services,
          `${p} social`
        );
      }
      expectSum(
        [
          exp.general_public_services,
          soc.total_social_services,
          exp.economic_services,
          exp.debt_service_interest_expense,
        ],
        exp.total_current_operating_expenditures,
        `${p} expenditure`
      );
      expectSum(
        [
          inc.total_current_operating_income,
          -exp.total_current_operating_expenditures,
        ],
        s.net_operating_income_loss_from_current_operations,
        `${p} net`
      );

      const nir = s.non_income_receipts;
      const cir = nir.capital_investment_receipts;
      const loans = nir.receipts_from_loans_and_borrowings;
      expectSum(
        [
          cir.proceeds_from_sale_of_assets,
          cir.proceeds_from_sale_of_debt_securities_of_other_entities,
          cir.collection_of_loans_receivables,
        ],
        cir.total_capital_investment_receipts,
        `${p} capital receipts`
      );
      expectSum(
        [loans.acquisition_of_loans, loans.issuance_of_bonds],
        loans.total_receipts_from_loans_and_borrowings,
        `${p} loans`
      );
      expectSum(
        [
          cir.total_capital_investment_receipts,
          loans.total_receipts_from_loans_and_borrowings,
          nir.other_non_income_receipts,
        ],
        nir.total_non_income_receipts,
        `${p} non-income receipts`
      );

      const noe = s.non_operating_expenditures;
      const cie = noe.capital_investment_expenditures;
      const dsp = noe.debt_service_principal_cost;
      expectSum(
        [
          cie.purchase_construct_of_property_plant_and_equipment,
          cie.purchase_of_debt_securities_of_other_entities,
          cie.grant_make_loan_to_other_entities,
        ],
        cie.total_capital_investment_expenditures,
        `${p} capital expenditures`
      );
      expectSum(
        [
          dsp.payment_of_loan_amortization,
          dsp.retirement_redemption_of_bonds_debt_securities,
        ],
        dsp.total_debt_service_principal_cost,
        `${p} principal`
      );
      expectSum(
        [
          cie.total_capital_investment_expenditures,
          dsp.total_debt_service_principal_cost,
          noe.other_non_operating_expenditures,
        ],
        noe.total_non_operating_expenditures,
        `${p} non-operating expenditures`
      );

      const f = s.fund_summary;
      expectSum(
        [
          s.net_operating_income_loss_from_current_operations,
          nir.total_non_income_receipts,
          -noe.total_non_operating_expenditures,
        ],
        f.net_increase_decrease_in_funds ?? NaN,
        `${p} net increase`
      );
      expectSum(
        [
          f.net_increase_decrease_in_funds ?? NaN,
          f.add_cash_balance_beginning ?? NaN,
        ],
        f.fund_cash_available ?? NaN,
        `${p} cash available`
      );
      expectSum(
        [
          f.fund_cash_available ?? NaN,
          -(f.less_payment_of_prior_years_accounts_payable ?? NaN),
          -(f.continuing_appropriation ?? NaN),
        ],
        f.fund_cash_balance_end,
        `${p} balance end`
      );
    }
  });

  it('publishes the full-year totals BLGF states, exactly', () => {
    expect(
      statements
        .filter(s => s.basis === 'annual')
        .map(s => ({
          year: s.fiscal_year,
          income: s.current_operating_income.total_current_operating_income,
          expenditure:
            s.current_operating_expenditures
              .total_current_operating_expenditures,
          net: s.net_operating_income_loss_from_current_operations,
          fundEnd: s.fund_summary.fund_cash_balance_end,
        }))
    ).toEqual(EXPECTED_ANNUAL);
  });

  it('matches each fourth-quarter statement to the full-year one', () => {
    // Two BLGF workbooks issued separately. Q4 being identical to the full
    // year is also what establishes that the quarterly figures are year to
    // date rather than quarter by quarter.
    for (const q4 of statements.filter(s => s.quarter === 4)) {
      const fy = annual(q4.fiscal_year);
      expect(fy, `FY ${q4.fiscal_year}`).toBeDefined();

      const full = new Map(amountsOf(fy as FinancialStatement));
      const withheld = new Set(q4.withheld.map(w => w.field));
      for (const [path, value] of amountsOf(q4)) {
        if (withheld.has(path)) continue;
        expect(value, `${q4.period} ${path}`).toBe(full.get(path));
      }
    }
  });

  it('opens every statement with the balance the previous year closed on', () => {
    // Year-to-date statements all start from 1 January, so they share the
    // year's opening balance, and that balance is the previous year's close.
    for (const s of statements) {
      const opening = s.fund_summary.add_cash_balance_beginning;
      const sameYear = annual(s.fiscal_year);
      if (sameYear) {
        expect(opening, s.period).toBe(
          sameYear.fund_summary.add_cash_balance_beginning
        );
      }
      const previous = annual(s.fiscal_year - 1);
      if (previous) {
        expect(opening, s.period).toBe(
          previous.fund_summary.fund_cash_balance_end
        );
      }
    }
  });

  it('mentions no inherited LGU', () => {
    expect(JSON.stringify(statements)).not.toMatch(INHERITED);
  });
});
