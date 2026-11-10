import type { FinancialStatement } from '@/types/budgetTypes';

import raw from './sre.json';

/**
 * The city's Statements of Receipts and Expenditures, as BLGF publishes them.
 *
 * The file is a cell-for-cell transcription, so it is served as is. The
 * inherited loader filled absent fields with zeros and recomputed every total
 * from its parts; both would put figures on the page that BLGF never stated.
 * The parts-sum-to-total checks live in sreProvenance.test.ts instead.
 *
 * Ordered by fiscal year, then quarter, with each year's full-year statement
 * after its quarters.
 */
const budgetData = raw as unknown as FinancialStatement[];

export default budgetData;
