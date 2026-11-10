import { test, expect } from '../test-config';
import { assertKapwaTokens } from '../utils/kapwa';

/**
 * The population page renders PSA census counts. These tests check that the
 * verified figures reach the screen unaltered, that each view names its PSA
 * sources, and that the census year with no verified barangay table is called
 * out rather than silently missing.
 *
 * Every assertion is unconditional, so the file fails if the dataset is
 * emptied again.
 */
const CENSUS_COUNTS = [
  ['2010', '163,676'],
  ['2015', '171,271'],
  ['2020', '174,302'],
  ['2024', '174,777'],
] as const;

const BARANGAY_COUNT = 31;

async function gotoPopulation(page: import('@playwright/test').Page) {
  await page.goto('/statistics/population');
  await expect(
    page.locator('h1').filter({ hasText: 'Population Profile' })
  ).toBeVisible();
}

test.describe('Population Page', () => {
  test('uses Kapwa semantic tokens', async ({ page }) => {
    await gotoPopulation(page);
    await assertKapwaTokens(page, '#main-content');
  });

  test('shows the latest PSA census count and growth rate', async ({
    page,
  }) => {
    await gotoPopulation(page);

    await expect(
      page.getByText('Total population', { exact: true })
    ).toBeVisible();
    await expect(page.getByText('174,777').first()).toBeVisible();
    await expect(page.getByText(/July 1, 2024/).first()).toBeVisible();
    await expect(page.getByText('0.07%').first()).toBeVisible();
    await expect(
      page.getByText(`${BARANGAY_COUNT} barangays`).first()
    ).toBeVisible();
  });

  test('lists every census count with its reference date', async ({ page }) => {
    await gotoPopulation(page);

    const table = page.getByRole('table');
    await expect(table).toBeVisible();

    for (const [year, count] of CENSUS_COUNTS) {
      const row = table.getByRole('row', { name: new RegExp(year) });
      await expect(row).toContainText(count);
    }
  });

  test('names the PSA as the source of the city figures', async ({ page }) => {
    await gotoPopulation(page);

    const citation = page.getByRole('region', { name: /Sources/ }).first();
    await expect(citation).toBeVisible();
    await expect(citation).toContainText('Philippine Statistics Authority');
    await expect(
      citation.getByRole('link', { name: /Table B/ }).first()
    ).toHaveAttribute('href', /psa\.gov\.ph/);
    await expect(page.getByText(/Last verified/).first()).toBeVisible();
  });

  test('draws one line per barangay and says which census has no breakdown', async ({
    page,
  }) => {
    await gotoPopulation(page);

    await page.getByRole('button', { name: /By barangay/ }).click();
    await expect(
      page.getByRole('button', { name: /By barangay/ })
    ).toHaveAttribute('aria-pressed', 'true');

    await expect(page.locator('.recharts-line-curve')).toHaveCount(
      BARANGAY_COUNT
    );

    // 2010 has a city count but no verified barangay table.
    await expect(
      page.getByText('No barangay breakdown is shown for 2010')
    ).toBeVisible();

    const citation = page.getByRole('region', { name: /Sources/ }).first();
    await expect(
      citation.getByRole('link', { name: /2015 Census of Population/ })
    ).toBeVisible();
  });

  test('carries no municipal wording on a city page', async ({ page }) => {
    await gotoPopulation(page);

    // A whole word only: the PSA's own table titles say "City/Municipality",
    // and citations are quoted as published.
    await expect(page.locator('#main-content')).not.toContainText(
      /\bMunicipal\b/
    );
  });
});
