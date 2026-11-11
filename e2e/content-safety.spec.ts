import type { Page } from '@playwright/test';

import { expect, test } from './test-config';

/**
 * The portal previously rendered Los Banos civic records under the Better
 * Dagupan name. This suite is the end-to-end half of that guarantee: the unit
 * tests prove the datasets are empty, these prove nothing reaches the screen.
 *
 * Deliberately not tagged @smoke. It asserts the state of the Dagupan
 * adaptation rather than something true of any LGU, and it should be revisited
 * when verified Dagupan records land.
 */
const routes = [
  '/',
  '/services',
  '/government/elected-officials',
  '/government/elected-officials/committees',
  '/government/departments',
  '/government/barangays',
  '/statistics',
  '/statistics/competitiveness',
  '/statistics/municipal-income',
  '/transparency',
  '/transparency/financial',
  '/search',
];

const INHERITED = /Los Ba(ñ|n)os|BetterLB|Better LB|losbanos\.gov\.ph/i;

test.describe('Inherited civic records', () => {
  for (const path of routes) {
    test(`${path} renders no inherited Los Banos content`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBeLessThan(400);

      // A page that crashed renders nothing, which would pass a text check
      // vacuously, so assert it actually rendered first.
      await expect(page.locator('main#main-content')).toBeVisible();
      const body = await page.locator('body').innerText();
      expect(body.length).toBeGreaterThan(0);
      expect(body).not.toMatch(INHERITED);
    });
  }
});

test.describe('Honest empty states', () => {
  // /statistics (population), /statistics/municipal-income,
  // /statistics/competitiveness and /transparency/financial are no longer
  // empty: PSA census figures, BLGF statements and DTI's CMCI scores are
  // published, and e2e/statistics and e2e/transparency/financial.spec.ts
  // cover them. Add a route here if a page goes back to an empty state.
  const emptyRoutes: string[] = [];

  for (const path of emptyRoutes) {
    test(`${path} says the records are not available yet`, async ({ page }) => {
      await page.goto(path);

      await expect(
        page.getByText(/Verified Dagupan information has not been added yet/i)
      ).toBeVisible();
    });
  }

  // Every empty route also must not read as a search that found nothing.
  for (const path of emptyRoutes) {
    test(`${path} does not claim a search came up empty`, async ({ page }) => {
      await page.goto(path);

      // Routes are lazy-loaded, so wait for the empty state to mount before
      // reading the document text.
      await expect(page.getByText(/not been added yet/i).first()).toBeVisible();

      const body = await page.locator('body').innerText();
      expect(body).not.toMatch(/no results found/i);
    });
  }
});

test.describe('Homepage history', () => {
  // The history section is no longer empty: it publishes legal milestones,
  // each cited to the official text, and says where its coverage stops.
  // src/data/__tests__/aboutProvenance.test.ts pins every entry to its source.
  const historySection = (page: Page) =>
    page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: /History of/i }) });

  test('cites the official text for each milestone', async ({ page }) => {
    await page.goto('/');
    const history = historySection(page);

    const first = history.getByTestId('history-milestone').first();
    await expect(first).toContainText('Republic Act No. 170');
    await expect(first.getByRole('region', { name: /Sources?/ })).toBeVisible();
    await expect(
      first.getByRole('link', { name: /Republic Act No\. 170/ })
    ).toHaveAttribute(
      'href',
      'https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/2/9189'
    );

    // No longer the empty state.
    await expect(
      history.getByText(/Verified Dagupan information has not been added yet/i)
    ).toHaveCount(0);
  });

  test('says earlier history is unverified rather than absent', async ({
    page,
  }) => {
    await page.goto('/');
    const history = historySection(page);

    await history.getByRole('button', { name: /Show \d+ more/ }).click();
    await expect(history.getByTestId('history-milestone')).toHaveCount(7);
    await expect(
      history.getByText('Earlier history not yet verified')
    ).toBeVisible();
  });

  test('shows the cited highlights on a phone as well', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/');
    const history = historySection(page);

    await expect(history.getByTestId('history-highlight')).toHaveCount(3);
    await expect(history.getByText('174,777 residents')).toBeVisible();
  });
});
