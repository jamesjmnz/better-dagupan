import { describe, expect, it } from 'vitest';

import { getCivicSource, hasCivicSource } from '@/lib/civicSources';

import ariRaw from '@/data/statistics/ari.json';
import budgetData from '@/data/transparency/budgetData';

import type { AnnualRegularIncome } from '@/types/statisticsTypes';

/**
 * Dagupan's Annual Regular Income (ARI) and Dependencies, from BLGF's by-LGU
 * workbooks. BLGF builds ARI from the same statements of receipts and
 * expenditures, so the strongest check is that the two separately issued
 * workbooks agree line for line, and that each table adds up the way BLGF's
 * own definition says it should. See docs/civic-data-verification.md,
 * "Worked example: the city's receipts and expenditures".
 */
const records = ariRaw as unknown as AnnualRegularIncome[];

/** BLGF's ARI for the city, as each edition states it. */
const EXPECTED_ARI = [
  { year: 2022, ari: 1354649052.49 },
  { year: 2023, ari: 1269764580.18 },
  { year: 2024, ari: 1369208283.8 },
  { year: 2025, ari: 1531775307.7 },
];

const expectSum = (parts: number[], total: number, label: string) => {
  expect(
    Math.abs(parts.reduce((a, b) => a + b, 0) - total),
    label
  ).toBeLessThanOrEqual(0.005 * parts.length + 1e-6);
};

describe('annual regular income', () => {
  it('publishes records, each for Dagupan City', () => {
    expect(records.length).toBeGreaterThan(0);
    for (const r of records) {
      expect(r.location_info, r.period).toEqual({
        region: 'Region I',
        province: 'Pangasinan',
        lgu_name: 'Dagupan City',
        lgu_type: 'City',
      });
    }
  });

  it('lists each fiscal year once, in ascending order', () => {
    const years = records.map(r => r.fiscal_year);
    expect(new Set(years).size).toBe(years.length);
    expect([...years].sort((a, b) => a - b)).toEqual(years);
    for (const r of records) {
      expect(r.period).toBe(`FY ${r.fiscal_year}`);
      expect(r.blgf_label).toBe(`FY ${r.fiscal_year}`);
    }
  });

  it("publishes BLGF's annual regular income, exactly", () => {
    expect(
      records.map(r => ({
        year: r.fiscal_year,
        ari: r.summary_indicators.annual_regular_income,
      }))
    ).toEqual(EXPECTED_ARI);
  });

  it('cites the BLGF workbook for its own year', () => {
    for (const r of records) {
      expect(r.sources).toEqual([`blgf-ari-by-lgu-fy${r.fiscal_year}`]);
      for (const id of r.sources) {
        expect(hasCivicSource(id), `unknown source "${id}"`).toBe(true);
        const source = getCivicSource(id);
        expect(source.agency).toBe('Bureau of Local Government Finance');
        expect(source.derives_from).toBeNull();
        expect(source.coverage).toBe(`FY ${r.fiscal_year}`);
      }
    }
  });

  it('labels the allotment and the edition as BLGF prints them', () => {
    // BLGF renamed the Internal Revenue Allotment the National Tax
    // Allotment; its FY 2022 workbook still uses the old heading.
    expect(records.map(r => [r.fiscal_year, r.allotment_label])).toEqual([
      [2022, 'INTERNAL REVENUE ALLOTMENT (IRA)'],
      [2023, 'NATIONAL TAX ALLOTMENT (NTA)'],
      [2024, 'NATIONAL TAX ALLOTMENT (NTA)'],
      [2025, 'NATIONAL TAX ALLOTMENT (NTA)'],
    ]);
    // Only FY 2025 is marked preliminary, and only in BLGF's file name.
    expect(records.map(r => [r.fiscal_year, r.status])).toEqual([
      [2022, null],
      [2023, null],
      [2024, null],
      [2025, 'preliminary'],
    ]);
  });

  it("adds up the way BLGF's own definition says", () => {
    // From the workbook's Definition of Terms: LSR = RPT (General Fund) +
    // Tax on Business + Other Taxes + Regulatory Fees + Service Charges +
    // Receipts from Economic Enterprises; ARI = LSR + allotment + Other
    // Shares + Interest Income.
    for (const r of records) {
      const p = r.period;
      const tax = r.locally_sourced_revenue.tax_revenue;
      const nonTax = r.locally_sourced_revenue.non_tax_revenue;
      const shares = r.other_shares_from_national_tax_collection;
      const lsr = r.locally_sourced_revenue.total_locally_sourced_revenue;
      expectSum(
        [
          tax.real_property_tax_general_fund,
          tax.tax_on_business,
          tax.other_taxes,
        ],
        tax.total_tax_revenue,
        `${p} tax`
      );
      expectSum(
        [
          nonTax.regulatory_fees,
          nonTax.service_user_charges,
          nonTax.receipts_from_economic_enterprises,
        ],
        nonTax.total_non_tax_revenue,
        `${p} non-tax`
      );
      expectSum(
        [tax.total_tax_revenue, nonTax.total_non_tax_revenue],
        lsr,
        `${p} LSR`
      );
      expectSum(
        [
          shares.share_from_economic_zone,
          shares.share_from_evat,
          shares.share_from_national_wealth,
          shares.share_from_pagcor_pcso_lotto,
          shares.share_from_tobacco_excise_tax,
          shares.others,
        ],
        shares.total_other_shares,
        `${p} other shares`
      );
      expectSum(
        [
          lsr,
          r.other_income_sources.interest_income,
          r.other_income_sources.national_tax_allotment,
          shares.total_other_shares,
        ],
        r.summary_indicators.annual_regular_income,
        `${p} ARI`
      );
    }
  });

  it("stores BLGF's dependency ratios, which match its stated formula", () => {
    // The ratios are read from the workbook, not computed here. Recomputing
    // them from the published amounts checks the transcription.
    for (const r of records) {
      const ari = r.summary_indicators.annual_regular_income;
      const rates = r.summary_indicators.dependency_rates;
      const checks: [number, number][] = [
        [
          rates.lsr_dependency,
          r.locally_sourced_revenue.total_locally_sourced_revenue,
        ],
        [rates.nta_dependency, r.other_income_sources.national_tax_allotment],
        [
          rates.other_shares_from_national_tax_dependency,
          r.other_shares_from_national_tax_collection.total_other_shares,
        ],
      ];
      for (const [rate, amount] of checks) {
        expect(rate).toBeGreaterThanOrEqual(0);
        expect(rate).toBeLessThanOrEqual(1);
        expect(Math.abs(rate - amount / ari), r.period).toBeLessThan(1e-8);
      }
    }
  });

  it("matches every shared line to the same year's full-year SRE", () => {
    // Two BLGF workbooks issued separately for the same fiscal year.
    for (const r of records) {
      const sre = budgetData.find(
        s => s.basis === 'annual' && s.fiscal_year === r.fiscal_year
      );
      expect(sre, `FY ${r.fiscal_year} SRE`).toBeDefined();
      if (!sre) continue;

      const local = sre.current_operating_income.local_sources;
      const external = sre.current_operating_income.external_sources;
      const tax = r.locally_sourced_revenue.tax_revenue;
      const nonTax = r.locally_sourced_revenue.non_tax_revenue;

      expect([
        tax.real_property_tax_general_fund,
        tax.tax_on_business,
        tax.other_taxes,
        nonTax.regulatory_fees,
        nonTax.service_user_charges,
        nonTax.receipts_from_economic_enterprises,
        r.other_income_sources.national_tax_allotment,
        r.other_shares_from_national_tax_collection.total_other_shares,
      ]).toEqual([
        local.tax_revenue.real_property_tax.general_fund,
        local.tax_revenue.tax_on_business,
        local.tax_revenue.other_taxes,
        local.non_tax_revenue.regulatory_fees,
        local.non_tax_revenue.service_user_charges,
        local.non_tax_revenue.receipts_from_economic_enterprises,
        external.national_tax_allotment,
        external.other_shares_from_national_tax_collection,
      ]);
      // Interest income has no column of its own in the SRE, so it is the
      // one ARI line with nothing to compare against.
    }
  });
});
