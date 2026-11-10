import { test, expect } from '../test-config';
import { readData } from '../utils/data';
import { assertKapwaTokens } from '../utils/kapwa';
import { openSidebar } from '../utils/layout';

/**
 * The financial page renders the city's Statements of Receipts and
 * Expenditures from src/data/transparency/sre.json. The inherited Los Banos
 * statements were removed and Dagupan's are not sourced yet, so today the
 * page must say the data is not available instead of drawing charts and
 * summary cards. The chart and quarter tests run only once statements exist.
 */
const statements = readData<unknown[]>('transparency/sre.json');
const hasStatements = statements.length > 0;

test.describe('Financial Transparency Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/transparency/financial');
    await expect(
      page.getByRole('heading', { level: 1, name: /Financial/i })
    ).toBeVisible();
  });

  test('financial page uses Kapwa semantic tokens', async ({ page }) => {
    await assertKapwaTokens(page);
  });

  test('financial page has accessible skip link', async ({ page }) => {
    const skipLink = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  test('financial page breadcrumbs are present', async ({ page }) => {
    const breadcrumbs = page.getByRole('navigation', { name: /breadcrumb/i });

    await expect(breadcrumbs).toBeVisible();
    await expect(
      breadcrumbs.getByRole('link', { name: 'Transparency' })
    ).toHaveAttribute('href', '/transparency');
  });

  test('the sidebar links every transparency section', async ({ page }) => {
    await openSidebar(page);
    const nav = page.getByRole('navigation', { name: 'Transparency' });

    for (const href of [
      '/transparency/financial',
      '/transparency/procurement',
      '/transparency/infrastructure',
    ]) {
      await expect(nav.locator(`a[href="${href}"]`)).toBeVisible();
    }
    await expect(
      nav.locator('a[href="/transparency/financial"]')
    ).toHaveAttribute('aria-current', 'page');
  });

  test.describe('with no verified statements', () => {
    test.skip(hasStatements, 'Financial statements are published.');

    test('says the data is not available yet', async ({ page }) => {
      const content = page.locator('#layout-content');

      await expect(
        content.getByRole('heading', { name: 'Not yet available' })
      ).toBeVisible();
      await expect(
        content.getByRole('link', { name: 'Suggest a source' })
      ).toBeVisible();
    });

    test('shows no figures, charts or quarter controls', async ({ page }) => {
      const content = page.locator('#layout-content');

      // Nothing that could be read as a published amount.
      await expect(content).not.toContainText('₱');
      await expect(content.locator('.recharts-wrapper')).toHaveCount(0);
      await expect(
        content.getByRole('button', { name: /Q[1-4]|Quarter/i })
      ).toHaveCount(0);
    });
  });

  test.describe('with published statements', () => {
    test.skip(!hasStatements, 'No verified financial statements yet.');

    test('financial page displays budget information', async ({ page }) => {
      await expect(page.locator('#layout-content')).toContainText('₱');
    });

    test('financial page displays a chart', async ({ page }) => {
      await expect(
        page.locator('#layout-content .recharts-wrapper').first()
      ).toBeVisible();
    });

    test('financial page quarter toggle updates display', async ({ page }) => {
      const quarterButtons = page
        .locator('#layout-content')
        .getByRole('button', { name: /Q[1-4]/ });
      await expect(quarterButtons.first()).toBeVisible();

      await quarterButtons.last().click();
      await expect(page.locator('#layout-content')).toContainText('₱');
    });
  });

  test('financial transparency page visual snapshot @visual', async ({
    page,
  }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Take full page screenshot
    await expect(page).toHaveScreenshot('financial-transparency.png', {
      maxDiffPixels: 150,
    });
  });
});
