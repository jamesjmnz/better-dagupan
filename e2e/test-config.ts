/**
 * Global test configuration for E2E tests with API mocking
 *
 * Import from this file instead of @playwright/test to get automatic API mocking:
 *
 *   import { test, expect } from './test-config';
 *
 * When CI=true or MOCK_API=true, all API requests will be mocked automatically.
 */

/* eslint-disable react-hooks/rules-of-hooks -- 'use' is from Playwright fixtures, not React */

import { test as base, expect, type Page } from '@playwright/test';

// Check if API mocking should be enabled
const shouldMockApis =
  process.env.CI === 'true' || process.env.MOCK_API === 'true';

/**
 * Route every /api/** request to a canned response. The fixture below applies
 * this automatically under CI or MOCK_API; a test that depends on a healthy
 * backend (for example, asserting a clean console) can call it directly so it
 * behaves the same way locally.
 */
export async function mockApiRoutes(page: Page): Promise<void> {
  // Playwright runs matching handlers in reverse registration order, so the
  // catch-all goes first and every more specific route registered after it
  // takes precedence. (Registered last, it used to answer every request,
  // weather and admin included.)
  await page.route('**/api/**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: null, offline: true }),
    });
  });

  // The ticker reads exchange rates from the shared BetterGov API, which
  // refuses cross-origin requests from a localhost dev server.
  await page.route('https://api.bettergov.ph/forex**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        rates: [{ country: 'United States', symbol: 'USD', phpEquivalent: 58 }],
      }),
    });
  });

  await page.route('**/api/weather**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        dagupan: {
          name: 'Dagupan',
          coordinates: { lat: 16.0433, lon: 120.3333 },
          weather: [{ icon: '01d', description: 'partly cloudy' }],
          main: {
            temp: 28,
            feels_like: 30,
            temp_min: 25,
            temp_max: 31,
            pressure: 1012,
            humidity: 75,
          },
          visibility: 10000,
          wind: { speed: 3.5, deg: 180 },
          clouds: { all: 10 },
          dt: Math.floor(Date.now() / 1000),
          sys: {},
          timezone: 28800,
          id: 1714746,
          timestamp: new Date().toISOString(),
          hourly: [],
        },
      }),
    });
  });

  await page.route('**/api/openlgu/**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [], offline: true }),
    });
  });

  await page.route('**/api/admin/**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ authenticated: false, offline: true }),
    });
  });

  await page.route('**/api/submit-contribution**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, offline: true }),
    });
  });
}

/**
 * Extended test object with automatic API mocking
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    if (shouldMockApis) {
      await mockApiRoutes(page);
    }

    await use(page);
  },
});

// Re-export expect for convenience
export { expect };
