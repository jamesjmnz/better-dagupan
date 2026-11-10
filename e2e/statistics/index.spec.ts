import { test, expect } from '../test-config';
import { readData } from '../utils/data';
import { assertKapwaTokens } from '../utils/kapwa';
import { openSidebar } from '../utils/layout';

const incomeRecords = readData<unknown[]>('statistics/ari.json');
const cmci = readData<{ overall_score: unknown[] }>('statistics/cmci.json');

test.describe('Statistics Pages', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to statistics index before each test
    await page.goto('/statistics');
  });

  test('statistics index page uses Kapwa semantic tokens', async ({ page }) => {
    // Check page title is visible (should show PopulationPage by default)
    await expect(
      page.locator('h1').filter({ hasText: 'Population Profile' })
    ).toBeVisible();

    // Check PageHeader is visible. The heading takes the LGU-type adjective
    // from lguLabels, which for a city is "City".
    await expect(
      page.locator('h1').filter({ hasText: 'City Statistics' })
    ).toBeVisible();

    // Verify Kapwa semantic tokens are used. Scoped to the page's own main
    // landmark: the app shell renders a second <main>.
    await assertKapwaTokens(page, '#main-content');
  });

  test('statistics layout has PageHeader and Sidebar', async ({ page }) => {
    // Check PageHeader with centered variant
    const pageHeader = page.locator('header').filter({
      has: page.locator('h1:has-text("City Statistics")'),
    });
    await expect(pageHeader).toBeVisible();

    // Check description is present
    await expect(
      page.locator('p:has-text("Data-driven insights")')
    ).toBeVisible();

    // Check StatisticsSidebar is present, opening it first on viewports that
    // fold it behind the Menu disclosure.
    const sidebar = await openSidebar(page);
    await expect(
      sidebar.getByRole('navigation', { name: 'City Statistics' })
    ).toBeVisible();
  });

  test('population page displays KPI cards', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // StatCard renders no test id or marker class, so check the three KPI
    // labels the population page passes to it.
    for (const label of ['Total population', 'Annual growth rate']) {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    }
    await expect(
      page.getByText('Barangays', { exact: true }).first()
    ).toBeVisible();
  });

  test('population page displays chart', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for chart container
    const chartContainer = page
      .locator('.recharts-wrapper')
      .or(page.locator('[data-testid="chart"]'));
    await expect(chartContainer).toBeVisible();
  });

  test('population page has tab switching functionality', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for tab buttons
    const tabs = page
      .locator('button')
      .filter({ hasText: /Municipality|Barangays/i });
    const tabCount = await tabs.count();

    if (tabCount > 0) {
      // Click second tab
      await tabs.nth(1).click();

      // Wait for content to update
      await page.waitForTimeout(300);

      // Verify content changed (chart should still be visible)
      const chart = page.locator('.recharts-wrapper');
      await expect(chart).toBeVisible();
    }
  });

  test('statistics sidebar navigation works', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check sidebar links
    const sidebarLinks = page
      .locator('aside a')
      .or(page.locator('[data-testid="sidebar"] a'));

    // Should have links to different statistics pages
    const linkCount = await sidebarLinks.count();
    expect(linkCount).toBeGreaterThan(0);

    // Click on municipal income link
    const incomeLink = sidebarLinks.filter({ hasText: /Municipal Income/i });
    if ((await incomeLink.count()) > 0) {
      await incomeLink.click();

      // Should navigate to municipal income page
      await page.waitForURL(/municipal-income/);
      await expect(
        page.locator('h1').filter({ hasText: /Municipal Income/i })
      ).toBeVisible();
    }
  });

  /*
   * Population is published from the PSA census and income (ari.json) from
   * BLGF. Each page is tested for what its dataset supports: an empty page
   * must say the data is not available, and switches to the chart checks on
   * its own once records land.
   */
  for (const route of [
    {
      path: '/statistics/municipal-income',
      title: 'City Income',
      hasData: incomeRecords.length > 0,
    },
    {
      path: '/statistics/competitiveness',
      title: 'Competitiveness',
      hasData: cmci.overall_score.length > 0,
    },
  ]) {
    test(`${route.path} displays correctly`, async ({ page }) => {
      await page.goto(route.path);
      await expect(
        page.getByRole('heading', { level: 1, name: route.title })
      ).toBeVisible();

      const content = page.locator('#layout-content');
      if (route.hasData) {
        await expect(
          content.locator('.recharts-wrapper').first()
        ).toBeVisible();
      } else {
        await expect(
          content.getByRole('heading', { name: 'Not yet available' })
        ).toBeVisible();
        // No chart or figures without a verified source.
        await expect(content.locator('.recharts-wrapper')).toHaveCount(0);
      }
    });
  }

  test('the population page shows its KPI cards', async ({ page }) => {
    // StatCard renders no test id or marker class; its labels are what a
    // reader sees. The other statistics pages are covered by the chart or
    // not-yet-available checks above, whichever their data supports.
    await page.goto('/statistics');
    const content = page.locator('#layout-content');
    for (const label of ['Total population', 'Annual growth rate']) {
      await expect(content.getByText(label, { exact: true })).toBeVisible();
    }
  });

  test('statistics pages have accessibility features', async ({ page }) => {
    await page.goto('/statistics');
    await page.waitForLoadState('networkidle');

    // Check for skip link (if present)
    const skipLink = page.locator('a[href^="#"]:has-text("Skip")');
    if ((await skipLink.count()) > 0) {
      await expect(skipLink.first()).toBeVisible();
    }

    // Check main content area
    const main = page.locator('main').or(page.locator('[role="main"]'));
    await expect(main).toBeVisible();

    // Check proper heading hierarchy
    const h1 = page.locator('h1');
    const h1Count = await h1.count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });

  test('statistics pages are mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/statistics');

    await expect(
      page.locator('h1').filter({ hasText: /Population/i })
    ).toBeVisible();

    // The section sidebar folds behind the layout's Menu toggle on small
    // screens. (The navbar's own "Open main menu" button is a different menu.)
    const sidebar = page.locator('#layout-sidebar');
    const toggle = page.getByRole('button', { name: 'Menu', exact: true });
    await expect(sidebar).toBeHidden();

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(sidebar).toBeVisible();
    await expect(
      sidebar.getByRole('navigation', { name: 'City Statistics' })
    ).toBeVisible();
  });

  test('statistics sidebar is collapsible', async ({ page }) => {
    await page.goto('/statistics');
    await page.waitForLoadState('networkidle');

    const sidebar = await openSidebar(page);

    // Desktop collapses the sidebar with the layout's Hide control, which
    // small screens hide; there the Menu disclosure folds it away.
    const hide = page.getByRole('button', { name: 'Hide Menu' });
    if (await hide.isVisible()) {
      await hide.click();
    } else {
      await page.locator('button[aria-controls="layout-sidebar"]').click();
    }

    await expect(sidebar).toBeHidden();
    // The content stays put.
    await expect(page.locator('#layout-content')).toBeVisible();
  });

  test('statistics pages have consistent breadcrumb navigation', async ({
    page,
  }) => {
    await page.goto('/statistics/municipal-income');
    await page.waitForLoadState('networkidle');

    // Check for breadcrumb navigation
    const breadcrumb = page
      .locator('nav[aria-label*="Breadcrumb" i]')
      .or(page.locator('[data-testid="breadcrumb"]'));

    const breadcrumbCount = await breadcrumb.count();
    if (breadcrumbCount > 0) {
      await expect(breadcrumb.first()).toBeVisible();

      // Check breadcrumb has Home link
      const homeLink = breadcrumb
        .first()
        .locator('a')
        .filter({ hasText: /Home/i });
      await expect(homeLink).toBeVisible();

      // Check breadcrumb has current page indicator
      const currentPage = breadcrumb
        .first()
        .locator('span, a')
        .filter({
          hasText: /Municipal Income/i,
        });
      await expect(currentPage).toBeVisible();
    }
  });

  test('statistics pages handle data loading states', async ({ page }) => {
    // Navigate to a statistics page
    await page.goto('/statistics');

    // Check for loading state (if applicable)
    const loader = page
      .locator('[data-testid="loader"]')
      .or(page.locator('.animate-spin'));

    // Wait for content to load
    await page.waitForLoadState('networkidle');

    // After loading, content should be visible
    await expect(
      page.locator('h1').filter({ hasText: /Population/i })
    ).toBeVisible();

    // Loader should not be visible after content loads
    const loaderCount = await loader.count();
    if (loaderCount > 0) {
      await expect(loader.first()).not.toBeVisible();
    }
  });

  test('statistics index page visual snapshot @visual', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Take full page screenshot
    await expect(page).toHaveScreenshot('statistics-index.png', {
      maxDiffPixels: 150,
    });
  });

  test('statistics index page hero section visual snapshot @visual', async ({
    page,
  }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Take snapshot of hero section
    const heroSection = page.locator('main').first();
    await expect(heroSection).toHaveScreenshot('statistics-hero.png', {
      maxDiffPixels: 100,
    });
  });
});
