import { Landmark, ReceiptText, Scale, Vault } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { StatCard } from '@/components/ui/StatCard';

import { formatPesoAdaptive } from '@/lib/format';

import type { ComparisonBaseline } from '@/hooks/useFinancialData';

import type { FinancialStatement } from '@/types/budgetTypes';

// --- Types ---
interface SummaryCardsProps {
  statement: FinancialStatement;
  prevYear?: ComparisonBaseline;
}

// Helper to calculate YoY trend
const calculateTrend = (current: number, previous?: number) => {
  if (previous === undefined || previous === 0) return undefined;
  const diff = current - previous;
  const pct = (diff / previous) * 100;
  return { value: Math.abs(pct), positive: diff >= 0 };
};

/**
 * The four headline figures of a statement.
 *
 * Each is a total BLGF states on the statement itself, read as published
 * rather than re-added from its parts, and shown in pesos.
 */
export default function SummaryCards({
  statement,
  prevYear,
}: SummaryCardsProps) {
  const { t } = useTranslation('transparency');
  const totalIncome =
    statement.current_operating_income.total_current_operating_income;
  const totalExpenditure =
    statement.current_operating_expenditures
      .total_current_operating_expenditures;
  const netIncome = statement.net_operating_income_loss_from_current_operations;
  const fundBalance = statement.fund_summary.fund_cash_balance_end;

  const cards = [
    {
      label: t('summary.revenue'),
      amount: totalIncome,
      trend: calculateTrend(totalIncome, prevYear?.totalIncome),
      icon: Landmark,
      iconBg: 'bg-kapwa-green-50 text-kapwa-green-600',
    },
    {
      label: t('summary.expenditure'),
      amount: totalExpenditure,
      trend: calculateTrend(totalExpenditure, prevYear?.totalExpenditure),
      icon: ReceiptText,
      iconBg: 'bg-kapwa-red-50 text-kapwa-red-600',
    },
    {
      label: t('summary.netIncome'),
      amount: netIncome,
      trend: calculateTrend(netIncome, prevYear?.netIncome),
      icon: Scale,
      iconBg: 'bg-kapwa-bg-brand-weak text-kapwa-text-brand',
    },
    {
      label: t('summary.treasury'),
      amount: fundBalance,
      trend: calculateTrend(fundBalance, prevYear?.fundCashEnd),
      icon: Vault,
      iconBg: 'bg-kapwa-orange-50 text-kapwa-orange-600',
    },
  ];

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
      {cards.map(({ amount, ...card }) => (
        <StatCard
          key={card.label}
          {...card}
          value={formatPesoAdaptive(amount).fullString}
          subtext={formatPesoAdaptive(amount).raw}
          hover={true}
        />
      ))}
    </div>
  );
}
