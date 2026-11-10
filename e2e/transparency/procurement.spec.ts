import { readFileSync } from 'node:fs';

import type { Page } from '@playwright/test';

import { test, expect } from '../test-config';
import { assertKapwaTokens } from '../utils/kapwa';

/**
 * Procurement records come from the shared Meilisearch PhilGEPS index,
 * filtered by `transparency.procurement.organizationNames` in
 * config/lgu.config.json. Without a confirmed entity name the page must
 * refuse to query at all (an empty filter returns another organization's
 * contracts) and say the source is pending, with zeroed totals. Once one is
 * set, the results settle into a table or "No Records Found". The city's own
 * notices section is covered by city-notices.spec.ts.
 */
const lguConfig = JSON.parse(
  readFileSync(new URL('../../config/lgu.config.json', import.meta.url), 'utf8')
) as { transparency: { procurement: { organizationNames: string[] } } };
const orgConfigured = lguConfig.transparency.procurement.organizationNames.some(
  name => name.trim().length > 0
);

async function gotoProcurement(page: Page) {
  await page.goto('/transparency/procurement');
  await expect(
    page.getByRole('heading', { level: 2, name: 'Procurement Transparency' })
  ).toBeVisible();
}

const STAT_LABELS = ['Categories', 'Total Value', 'Average', 'Volume'];

test.describe('Procurement Transparency Page', () => {
  test.beforeEach(async ({ page }) => {
    await gotoProcurement(page);
  });

  test('procurement page uses Kapwa semantic tokens', async ({ page }) => {
    test.fixme(
      true,
      'The pinned @bettergov/kapwa Button outline variant (Download CSV) renders raw border-gray-300/text-gray-700 classes.'
    );
    await assertKapwaTokens(page);
  });

  test('procurement page displays stats cards', async ({ page }) => {
    const content = page.locator('#layout-content');
    for (const label of STAT_LABELS) {
      await expect(content.getByText(label, { exact: true })).toBeVisible();
    }
  });

  test('procurement page has search and export controls', async ({ page }) => {
    await expect(
      page.getByRole('textbox', { name: 'Search contracts...' })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Download CSV' })
    ).toBeVisible();
  });

  test('procurement page links the national dashboard', async ({ page }) => {
    const dashboard = page.locator(
      'a[href="https://transparency.bettergov.ph/procurement"]'
    );

    await expect(dashboard).toBeVisible();
    await expect(dashboard).toHaveAttribute('target', '_blank');
    // noreferrer implies noopener in every supported browser.
    await expect(dashboard).toHaveAttribute('rel', /noreferrer/);
  });

  test('procurement page has accessible skip link', async ({ page }) => {
    const skipLink = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  test('procurement page breadcrumbs are present', async ({ page }) => {
    const breadcrumbs = page.getByRole('navigation', { name: /breadcrumb/i });

    await expect(breadcrumbs).toBeVisible();
    await expect(
      breadcrumbs.getByRole('link', { name: 'Transparency' })
    ).toHaveAttribute('href', '/transparency');
  });

  test.describe('before the PhilGEPS entity is confirmed', () => {
    test.skip(orgConfigured, 'The PhilGEPS entity name is configured.');

    test('says the procurement source is pending', async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: 'Procurement Source Pending' })
      ).toBeVisible();
      await expect(
        page.getByText(/PhilGEPS entity name .* has not been confirmed yet/)
      ).toBeVisible();
      await expect(page.locator('#layout-content table')).toHaveCount(0);
    });

    test('shows zeroed totals rather than another LGU record', async ({
      page,
    }) => {
      const content = page.locator('#layout-content');
      // Total Value and Average are both zero pesos.
      await expect(content.getByText('₱0.00', { exact: true })).toHaveCount(2);

      // No organization dashboard link without a confirmed organization.
      await expect(
        content.locator('a[href*="transparency.bettergov.ph/organizations/"]')
      ).toHaveCount(0);
    });

    test('does not query the PhilGEPS index', async ({ page }) => {
      const queries: string[] = [];
      page.on('request', request => {
        if (request.url().includes('/indexes/')) queries.push(request.url());
      });

      await gotoProcurement(page);
      await page.waitForLoadState('networkidle');

      expect(queries).toEqual([]);
    });
  });

  test.describe('with a confirmed PhilGEPS entity', () => {
    test.skip(!orgConfigured, 'The PhilGEPS entity name is not confirmed yet.');

    test('results settle into a table or no records', async ({ page }) => {
      await expect(
        page
          .locator('#layout-content table')
          .or(page.getByRole('heading', { name: 'No Records Found' }))
          .first()
      ).toBeVisible({ timeout: 15_000 });
    });

    test('procurement page links the organization dashboard', async ({
      page,
    }) => {
      await expect(
        page.locator('a[href*="transparency.bettergov.ph/organizations/"]')
      ).toBeVisible();
    });
  });

  test('procurement transparency page visual snapshot @visual', async ({
    page,
  }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Take full page screenshot
    await expect(page).toHaveScreenshot('procurement-transparency.png', {
      maxDiffPixels: 150,
    });
  });
});
