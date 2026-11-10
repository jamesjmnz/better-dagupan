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
      // Quarters BLGF has not published yet are rendered but disabled, so
      // pick the last one that can actually be chosen.
      const quarterButtons = page
        .locator('#layout-content')
        .getByRole('button', { name: /Q[1-4]/, disabled: false });
      await expect(quarterButtons.first()).toBeVisible();

      await quarterButtons.last().click();
      await expect(quarterButtons.last()).toHaveAttribute(
        'aria-pressed',
        'true'
      );
      await expect(page.locator('#layout-content')).toContainText('₱');
    });

    test('says that quarterly figures are year to date', async ({ page }) => {
      const content = page.locator('#layout-content');

      // BLGF's quarterly statements run from January; "Q3" alone would
      // read as July to September.
      await expect(
        content.getByRole('button', { name: /Q[1-4]: January to/ }).first()
      ).toBeVisible();
      await expect(content).toContainText(/year to date/i);
    });

    test('shows the full-year statement in the annual view', async ({
      page,
    }) => {
      const content = page.locator('#layout-content');

      await content.getByRole('button', { name: '2025', exact: true }).click();
      await content
        .getByRole('button', { name: 'Annual', exact: true })
        .click();

      await expect(content).toContainText(
        'Fiscal year 2025, January to December'
      );
      await expect(content).toContainText('BLGF: preliminary');
      await expect(content.locator('.recharts-wrapper').first()).toBeVisible();
    });

    test('names its BLGF source and when it was checked', async ({ page }) => {
      const note = page
        .locator('#layout-content')
        .getByRole('region', { name: /^Sources?$/ });

      await expect(note).toContainText('Bureau of Local Government Finance');
      await expect(note.getByRole('link').first()).toHaveAttribute(
        'href',
        /^https:\/\/blgf\.gov\.ph\//
      );
      await expect(note).toContainText(/Last verified/);
    });

    test('marks the withheld 2024 lines rather than drawing them', async ({
      page,
    }) => {
      const content = page.locator('#layout-content');

      await content.getByRole('button', { name: '2024', exact: true }).click();
      await expect(content).toContainText(
        'Some lines are withheld for this period'
      );

      await content
        .getByRole('button', { name: 'Annual', exact: true })
        .click();
      await expect(content).not.toContainText(
        'Some lines are withheld for this period'
      );
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
