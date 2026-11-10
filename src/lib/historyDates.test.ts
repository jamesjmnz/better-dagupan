import { describe, expect, it } from 'vitest';

import {
  formatHistoryDate,
  historyDatePrecision,
  historyDateYear,
} from './historyDates';

describe('historyDatePrecision', () => {
  it('reports the precision the stored date carries', () => {
    expect(historyDatePrecision('1947')).toBe('year');
    expect(historyDatePrecision('1947-06')).toBe('month');
    expect(historyDatePrecision('1947-06-20')).toBe('day');
  });

  it('rejects malformed and impossible dates', () => {
    expect(historyDatePrecision('')).toBeNull();
    expect(historyDatePrecision('47')).toBeNull();
    expect(historyDatePrecision('1947-13')).toBeNull();
    expect(historyDatePrecision('1947-02-30')).toBeNull();
    expect(historyDatePrecision('June 20, 1947')).toBeNull();
  });
});

describe('formatHistoryDate', () => {
  it('never adds a day or month the source did not state', () => {
    expect(formatHistoryDate('1947', 'en')).toBe('1947');
    expect(formatHistoryDate('1947-06', 'en')).toMatch(/^June 1947$/);
    expect(formatHistoryDate('1947-06', 'en')).not.toMatch(/\b1\b/);
  });

  it('formats a full date in the reader’s language without shifting the day', () => {
    expect(formatHistoryDate('1947-06-20', 'en')).toBe('June 20, 1947');
    expect(formatHistoryDate('1947-06-20', 'fil')).toMatch(/Hunyo/);
    expect(formatHistoryDate('1947-06-20', 'fil')).toMatch(/20/);
    expect(formatHistoryDate('1947-12-31', 'en')).toBe('December 31, 1947');
  });

  it('returns a malformed value unchanged rather than hiding it', () => {
    expect(formatHistoryDate('not-a-date', 'en')).toBe('not-a-date');
  });
});

describe('historyDateYear', () => {
  it('takes the year from any precision', () => {
    expect(historyDateYear('1947')).toBe('1947');
    expect(historyDateYear('1973-07-06')).toBe('1973');
  });
});
