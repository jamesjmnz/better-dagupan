import type { Page } from '@playwright/test';

/**
 * Answer the shared Meilisearch instance with canned search results, so a
 * spec that needs a populated procurement or infrastructure table does not
 * depend on the live upstream index (or on the network at all).
 *
 * The hits are neutral test fixtures, not civic records: every name and
 * amount is made up, and nothing here is rendered outside the test run.
 */

const PHILGEPS_HIT = {
  id: 'fixture-1',
  reference_id: 'REF-0001',
  contract_no: 'CN-0001',
  award_title: 'Supply of example office equipment',
  notice_title: 'Supply of example office equipment',
  awardee_name: 'Example Trading',
  organization_name: 'EXAMPLE ORGANIZATION',
  area_of_delivery: 'Example',
  business_category: 'Office Equipment',
  contract_amount: 125000,
  award_date: '2026-01-15',
  award_status: 'Awarded',
};

const DPWH_HIT = {
  contractId: 'FIXTURE-0001',
  // The page keeps only hits that name the LGU (exactMatchTargets in
  // config/lgu.config.json), so the fixture has to as well.
  description: 'Example road rehabilitation, Dagupan',
  category: 'Roads',
  programName: 'Example Program',
  status: 'On-Going',
  infraType: 'Roads',
  sourceOfFunds: 'Example',
  budget: 1000000,
  amountPaid: 250000,
  progress: 25,
  location: {
    region: 'Region I',
    province: 'Pangasinan',
    municipality: 'Dagupan City',
    infraType: 'Roads',
    coordinates: { latitude: 16.04, longitude: 120.33, verified: false },
  },
  infraYear: 2026,
  contractor: 'Example Builders',
  isVerifiedByDpwh: false,
  isVerifiedByPublic: false,
  isLive: false,
  reportCount: 0,
};

function searchResponse(hits: unknown[]) {
  return {
    hits,
    query: '',
    processingTimeMs: 1,
    limit: 20,
    offset: 0,
    estimatedTotalHits: hits.length,
  };
}

export async function mockMeilisearch(page: Page): Promise<void> {
  await page.route('https://search2.bettergov.ph/**', route => {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    };
    if (route.request().method() === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: cors });
    }

    const url = route.request().url();
    let hits: unknown[] = [];
    if (url.includes('/indexes/philgeps/')) hits = [PHILGEPS_HIT];
    else if (url.includes('/indexes/dpwh/')) hits = [DPWH_HIT];

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: cors,
      body: JSON.stringify(searchResponse(hits)),
    });
  });
}
