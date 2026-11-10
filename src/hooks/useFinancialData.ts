import { useMemo, useState } from 'react';

import budgetData from '@/data/transparency/budgetData';

import type { FinancialStatement } from '@/types/budgetTypes';

const quarterLabel = (statement: FinancialStatement) =>
  statement.quarter ? `Q${statement.quarter}` : 'FY';

const yearToDateIn = (year: string) =>
  budgetData
    .filter(s => s.basis === 'year_to_date' && String(s.fiscal_year) === year)
    .sort((a, b) => (a.quarter ?? 0) - (b.quarter ?? 0));

const annualIn = (year: string) =>
  budgetData.find(s => s.basis === 'annual' && String(s.fiscal_year) === year);

export interface ComparisonBaseline {
  totalIncome: number;
  totalExpenditure: number;
  netIncome: number;
  fundCashEnd: number;
}

/**
 * Selection state for the financial page.
 *
 * BLGF publishes two kinds of statement for a fiscal year: year-to-date ones
 * at the end of each quarter, and a full-year one. The quarterly view shows a
 * year-to-date statement; the annual view shows the full-year statement for
 * that year, or nothing when BLGF has published none. Statements are never
 * added together: a year-to-date figure already contains the quarters before
 * it, so summing them would count January several times over.
 */
export function useFinancialData() {
  const years = useMemo(
    () =>
      Array.from(new Set(budgetData.map(s => String(s.fiscal_year)))).sort(),
    []
  );

  const [selectedYear, setSelectedYear] = useState(years[years.length - 1]);
  const [viewMode, setViewMode] = useState<'quarter' | 'year'>('quarter');

  const quartersInYear = useMemo(
    () => (selectedYear ? yearToDateIn(selectedYear) : []),
    [selectedYear]
  );

  const annualStatement = useMemo(
    () => (selectedYear ? annualIn(selectedYear) : undefined),
    [selectedYear]
  );

  // Undefined while no statements are published at all.
  const [selectedQuarter, setSelectedQuarter] = useState<
    FinancialStatement | undefined
  >(quartersInYear[quartersInYear.length - 1]);

  /**
   * Keeps the same quarter (e.g. Q2) when switching years, falling back to
   * the latest one published for the new year.
   */
  const changeYear = (newYear: string) => {
    setSelectedYear(newYear);

    const newYearQuarters = yearToDateIn(newYear);
    const matching = selectedQuarter
      ? newYearQuarters.find(q => q.quarter === selectedQuarter.quarter)
      : undefined;

    setSelectedQuarter(matching ?? newYearQuarters[newYearQuarters.length - 1]);
  };

  const displayedStatement =
    viewMode === 'year' ? annualStatement : selectedQuarter;

  /** The same kind of statement one year earlier, for the trend arrows. */
  const comparisonBaseline = useMemo<ComparisonBaseline | undefined>(() => {
    if (!selectedYear || !displayedStatement) return undefined;

    const prevYear = String(Number(selectedYear) - 1);
    const previous =
      displayedStatement.basis === 'annual'
        ? annualIn(prevYear)
        : yearToDateIn(prevYear).find(
            q => q.quarter === displayedStatement.quarter
          );

    if (!previous) return undefined;

    return {
      totalIncome:
        previous.current_operating_income.total_current_operating_income,
      totalExpenditure:
        previous.current_operating_expenditures
          .total_current_operating_expenditures,
      netIncome: previous.net_operating_income_loss_from_current_operations,
      fundCashEnd: previous.fund_summary.fund_cash_balance_end,
    };
  }, [selectedYear, displayedStatement]);

  return {
    /** False while no verified financial statements are published. */
    hasData: budgetData.length > 0,
    years,
    selectedYear,
    setSelectedYear: changeYear,
    viewMode,
    setViewMode,
    quartersInYear,
    selectedQuarter,
    setSelectedQuarter,
    annualStatement,
    displayedStatement,
    displayedIncome: displayedStatement?.current_operating_income,
    displayedExpenditure: displayedStatement?.current_operating_expenditures,
    displayedFundSummary: displayedStatement?.fund_summary,
    comparisonBaseline,
    getQuarter: quarterLabel,
  };
}
