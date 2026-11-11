import type { Page } from '@playwright/test';

import { test, expect } from '../test-config';
import { assertKapwaTokens } from '../utils/kapwa';

/**
 * The infrastructure page queries the shared BetterGov Meilisearch instance
 * for DPWH projects, filtered by the config strings for Dagupan. That is live
 * upstream data, so these tests do not fix a project count. They assert the
 * page's structure and that the result area settles into one of its three
 * honest states: a project table, "No Records Found", or "Unavailable" when
 * the search engine cannot be reached.
 */

async function gotoInfrastructure(page: Page) {
  await page.goto('/transparency/infrastructure');
  await expect(
    page.getByRole('heading', { level: 2, name: 'Infrastructure Projects' })
  ).toBeVisible();
}

/** The project table, or whichever empty state replaced it. */
const resultArea = (page: Page) =>
  page
    .locator('#layout-content table')
    .or(page.getByRole('heading', { name: 'No Records Found' }))
    .or(page.getByRole('heading', { name: 'No Active Projects' }))
    .or(page.getByRole('heading', { name: 'Unavailable' }));

test.describe('Infrastructure Transparency Page', () => {
  test.beforeEach(async ({ page }) => {
    await gotoInfrastructure(page);
  });

  test('infrastructure page uses Kapwa semantic tokens', async ({ page }) => {
    await assertKapwaTokens(page);
  });

  test('infrastructure page displays stats cards', async ({ page }) => {
    const content = page.locator('#layout-content');

    for (const label of [
      'Total Allocation',
      'Avg Progress',
      'Project Count',
      'Fiscal Year',
    ]) {
      await expect(content.getByText(label, { exact: true })).toBeVisible();
    }
  });

  test('the results settle into a table or an honest empty state', async ({
    page,
  }) => {
    await expect(resultArea(page).first()).toBeVisible({ timeout: 15_000 });
  });

  test('infrastructure search functionality works', async ({ page }) => {
    const searchInput = page.getByRole('textbox', {
      name: 'Search projects...',
    });
    await expect(searchInput).toBeVisible();
    await expect(resultArea(page).first()).toBeVisible({ timeout: 15_000 });

    // The box feeds the upstream query. Meilisearch drops unmatched words, so
    // the result count is not a reliable signal; the request itself is.
    const searched = page.waitForRequest(
      request =>
        request.method() === 'POST' &&
        request.url().includes('/search') &&
        (request.postData() ?? '').includes('school')
    );
    await searchInput.fill('school');
    await searched;

    await expect(resultArea(page).first()).toBeVisible({ timeout: 15_000 });
  });

  test('infrastructure page has external links to DPWH and BISTO', async ({
    page,
  }) => {
    const dpwhLink = page.locator('a[href*="transparency.bettergov.ph/dpwh"]');
    const bistoLink = page.locator('a[href*="bisto.ph"]');

    for (const link of [dpwhLink, bistoLink]) {
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('target', '_blank');
      // noreferrer implies noopener in every supported browser.
      await expect(link).toHaveAttribute('rel', /noreferrer/);
    }
  });

  test('infrastructure page displays filter options', async ({ page }) => {
    const statusPicker = page.getByRole('button', { name: 'Select status...' });
    await expect(statusPicker).toBeVisible();

    await statusPicker.click();
    for (const status of ['Active', 'Completed', 'Terminated']) {
      await expect(page.getByRole('option', { name: status })).toBeVisible();
    }
  });

  test('infrastructure page has accessible skip link', async ({ page }) => {
    const skipLink = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  test('infrastructure project rows have proper structure', async ({
    page,
  }) => {
    await expect(resultArea(page).first()).toBeVisible({ timeout: 15_000 });

    const rows = page.locator('#layout-content table tbody tr');
    test.skip((await rows.count()) === 0, 'No DPWH projects were returned.');

    await expect(
      page.getByRole('columnheader', { name: 'Description' })
    ).toBeVisible();
    await expect(rows.first().getByRole('cell').nth(1)).not.toBeEmpty();
  });

  test('infrastructure page breadcrumbs are present', async ({ page }) => {
    const breadcrumbs = page.getByRole('navigation', { name: /breadcrumb/i });

    await expect(breadcrumbs).toBeVisible();
    await expect(
      breadcrumbs.getByRole('link', { name: 'Transparency' })
    ).toHaveAttribute('href', '/transparency');
  });
});

test.describe('Infrastructure Transparency Page - Filipino', () => {
  test('the page renders in Filipino when the language is switched', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('i18nextLng', 'fil');
    });
    await page.goto('/transparency/infrastructure');

    await expect(
      page.getByRole('heading', {
        level: 2,
        name: 'Mga Proyektong Pang-imprastraktura',
      })
    ).toBeVisible();
    await expect(
      page.getByRole('textbox', { name: 'Maghanap ng proyekto...' })
    ).toBeVisible();

    const content = page.locator('#layout-content');
    for (const label of ['Kabuuang Alokasyon', 'Bilang ng Proyekto']) {
      await expect(content.getByText(label, { exact: true })).toBeVisible();
    }

    // The option labels are translated; the values stay the DPWH strings.
    await page.getByRole('button', { name: 'Pumili ng status...' }).click();
    await expect(
      page.getByRole('option', { name: 'Kasalukuyang Ginagawa' })
    ).toBeVisible();
  });
});

test.describe('Infrastructure Detail Page', () => {
  test('infrastructure detail page displays project information', async ({
    page,
  }) => {
    await gotoInfrastructure(page);
    await expect(resultArea(page).first()).toBeVisible({ timeout: 15_000 });

    const rows = page.locator('#layout-content table tbody tr');
    test.skip((await rows.count()) === 0, 'No DPWH projects were returned.');

    await rows.first().click();

    await expect(page).toHaveURL(/\/transparency\/infrastructure\/.+/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
    await assertKapwaTokens(page);
  });

  test('infrastructure transparency page visual snapshot @visual', async ({
    page,
  }) => {
    await page.goto('/transparency/infrastructure');
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Take full page screenshot
    await expect(page).toHaveScreenshot('infrastructure-transparency.png', {
      maxDiffPixels: 150,
    });
  });
});
