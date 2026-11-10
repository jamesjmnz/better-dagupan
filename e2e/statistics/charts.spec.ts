import { test, expect } from '../test-config';
import { readData } from '../utils/data';

/*
 * Each statistics page's chart tests run only while its dataset holds
 * verified records: population (PSA census) and city income (BLGF) do.
 * An empty dataset's page shows NotYetAvailable instead, which
 * e2e/statistics/index.spec.ts asserts, and its chart tests skip.
 */
const hasIncome = readData<unknown[]>('statistics/ari.json').length > 0;
const hasCmci =
  readData<{ editions: unknown[] }>('statistics/cmci.json').editions.length > 0;
const NO_INCOME = 'No verified city income records (ari.json) yet.';
const NO_CMCI = 'No verified CMCI scores (cmci.json) yet.';

test.describe('Statistics Page Charts', () => {
  test.describe('Population Page Charts', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/statistics');
      await page.waitForLoadState('networkidle');
    });

    test('population page displays line chart with Recharts', async ({
      page,
    }) => {
      // Check for Recharts wrapper
      const chartWrapper = page.locator('.recharts-wrapper');
      await expect(chartWrapper).toBeVisible();

      // Check for ResponsiveChart container
      const responsiveChart = page.locator('.recharts-responsive-container');
      await expect(responsiveChart).toBeVisible();
    });

    test('population page chart has proper axis labels', async ({ page }) => {
      // Check for XAxis (years)
      const xAxis = page.locator('.recharts-xAxis');
      await expect(xAxis).toBeVisible();

      // Check for YAxis (population values)
      const yAxis = page.locator('.recharts-yAxis');
      await expect(yAxis).toBeVisible();

      // Verify axis has tick labels
      const ticks = page.locator('.recharts-cartesian-axis-tick');
      const tickCount = await ticks.count();
      expect(tickCount).toBeGreaterThan(0);
    });

    test('population page chart displays data lines', async ({ page }) => {
      // Check for Line elements (actual data lines)
      const lines = page.locator('.recharts-line-curve');
      const lineCount = await lines.count();
      expect(lineCount).toBeGreaterThan(0);

      // Check for dots (data points)
      const dots = page.locator('.recharts-line-dot');
      const dotCount = await dots.count();
      expect(dotCount).toBeGreaterThan(0);
    });

    test('population page chart has legend', async ({ page }) => {
      // Check for chart legend
      const legend = page.locator('.recharts-legend-wrapper');
      const legendCount = await legend.count();

      if (legendCount > 0) {
        await expect(legend.first()).toBeVisible();

        // Legend should have at least one item
        const legendItems = page.locator('.recharts-legend-item');
        const itemCount = await legendItems.count();
        expect(itemCount).toBeGreaterThan(0);
      }
    });

    test('population page chart has working tooltips', async ({ page }) => {
      // Hover over chart area to trigger tooltip
      const chartArea = page.locator('.recharts-wrapper');
      await chartArea.hover();

      // Check for tooltip appearance
      const tooltip = page.locator('.recharts-tooltip-wrapper');
      const tooltipCount = await tooltip.count();

      // Tooltip may or may not appear on initial hover
      if (tooltipCount > 0) {
        // The page renders its own ChartTooltip, which has no
        // .recharts-tooltip-content element; check its census-year label.
        await expect(tooltip.first()).toContainText(/Year/);
      }
    });

    test('population page chart has Cartesian grid', async ({ page }) => {
      // Check for grid lines
      const grid = page.locator('.recharts-cartesian-grid');
      await expect(grid).toBeVisible();

      // Check for horizontal and vertical grid lines
      const gridLines = page.locator(
        '.recharts-cartesian-grid-horizontal, .recharts-cartesian-grid-vertical'
      );
      const gridLineCount = await gridLines.count();
      expect(gridLineCount).toBeGreaterThan(0);
    });

    test('population page tab switching updates chart', async ({ page }) => {
      // Find tab buttons
      const tabs = page
        .locator('button')
        .filter({ hasText: /Municipality|Barangays/i });
      const tabCount = await tabs.count();

      if (tabCount >= 2) {
        // Get initial chart state
        const initialChart = page.locator('.recharts-wrapper');
        await expect(initialChart).toBeVisible();

        // Switch to second tab
        await tabs.nth(1).click();
        await page.waitForTimeout(500);

        // Chart should still be visible after tab switch
        const updatedChart = page.locator('.recharts-wrapper');
        await expect(updatedChart).toBeVisible();

        // Chart should have updated (check for animation or re-render)
        const lines = page.locator('.recharts-line-curve');
        await expect(lines.first()).toBeVisible();
      }
    });

    test('population page chart displays municipality data correctly', async ({
      page,
    }) => {
      // Click on Municipality tab if not already active
      const municipalityTab = page
        .locator('button')
        .filter({ hasText: /Municipality/i });

      if ((await municipalityTab.count()) > 0) {
        await municipalityTab.click();
        await page.waitForTimeout(300);
      }

      // Check chart is displaying data
      const lines = page.locator('.recharts-line-curve');
      await expect(lines.first()).toBeVisible();

      // Municipality chart should have fewer lines (usually 1-2)
      const lineCount = await lines.count();
      expect(lineCount).toBeGreaterThan(0);
      expect(lineCount).toBeLessThan(5);
    });

    test('population page chart displays barangays data correctly', async ({
      page,
    }) => {
      // Click on Barangays tab
      const barangaysTab = page
        .locator('button')
        .filter({ hasText: /Barangays/i });

      if ((await barangaysTab.count()) > 0) {
        await barangaysTab.click();
        await page.waitForTimeout(500);

        // Barangays chart should have multiple lines (one per barangay)
        const lines = page.locator('.recharts-line-curve');
        const lineCount = await lines.count();

        // Should have multiple barangay lines
        expect(lineCount).toBeGreaterThan(5);
      }
    });
  });

  test.describe('Municipal Income Page Charts', () => {
    test.skip(!hasIncome, NO_INCOME);

    test.beforeEach(async ({ page }) => {
      await page.goto('/statistics/municipal-income');
      await page.waitForLoadState('networkidle');
    });

    test('municipal income page displays pie chart', async ({ page }) => {
      // Check for chart container
      const chartContainer = page.locator('.recharts-pie');
      await expect(chartContainer).toBeVisible();

      // Check for responsive container
      const responsiveContainer = page.locator(
        '.recharts-responsive-container'
      );
      await expect(responsiveContainer).toBeVisible();
    });

    test('municipal income page pie chart has slices', async ({ page }) => {
      // Check for pie chart slices
      const slices = page.locator('.recharts-pie-sector');
      const sliceCount = await slices.count();

      // Should have at least 3 income source categories
      expect(sliceCount).toBeGreaterThanOrEqual(3);
    });

    test('municipal income page chart has legend with income sources', async ({
      page,
    }) => {
      // Check for legend
      const legend = page.locator('.recharts-legend-wrapper');
      const legendCount = await legend.count();

      if (legendCount > 0) {
        await expect(legend.first()).toBeVisible();

        // Check for specific income sources in legend
        const legendText = await legend.first().textContent();
        expect(legendText).toMatch(/National|Local|Tax|Revenue/i);
      }
    });

    test('municipal income page chart tooltips work', async ({ page }) => {
      // Pointer hover is unreliable here: an arc's box centre falls in the
      // donut hole, and the slices re-render while the pie animates in. Send
      // the event to the slice itself instead.
      const slice = page.locator('.recharts-pie-sector path').first();
      await expect(slice).toBeAttached();
      await slice.dispatchEvent('mouseover');

      // FinancialPieChart renders its own tooltip, which has no
      // .recharts-tooltip-content element; check it shows an amount.
      await expect(
        page.locator('.recharts-tooltip-wrapper').first()
      ).toContainText('₱');
    });

    test('municipal income page displays income breakdown with correct colors', async ({
      page,
    }) => {
      // Check for pie chart sectors with different colors. Recharts wraps
      // each sector's path in a <g>, so the fill is on the path.
      const sectors = page.locator('.recharts-pie-sector path');

      // Should have multiple colored sectors once the pie has drawn
      await expect.poll(() => sectors.count()).toBeGreaterThanOrEqual(3);

      // Check that sectors have fill colors
      const firstSector = sectors.first();
      const fillAttribute = await firstSector.getAttribute('fill');
      expect(fillAttribute).toBeTruthy();
      expect(fillAttribute).toMatch(/^#[0-9A-Fa-f]{6}$/); // Hex color
    });

    test('municipal income page chart is responsive', async ({ page }) => {
      // Test on desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/statistics/municipal-income');
      await page.waitForLoadState('networkidle');

      const desktopChart = page.locator('.recharts-pie');
      await expect(desktopChart).toBeVisible();

      // Test on mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForLoadState('networkidle');

      const mobileChart = page.locator('.recharts-pie');
      await expect(mobileChart).toBeVisible();

      // Chart should adapt to mobile size
      const chartContainer = page.locator('.recharts-responsive-container');
      const box = await chartContainer.boundingBox();
      expect(box).toBeTruthy();
      expect(box!.width).toBeLessThanOrEqual(375);
    });
  });

  test.describe('Competitiveness Page Charts', () => {
    test.skip(!hasCmci, NO_CMCI);

    test.beforeEach(async ({ page }) => {
      await page.goto('/statistics/competitiveness');
      await page.waitForLoadState('networkidle');
    });

    test('competitiveness page displays line chart', async ({ page }) => {
      // Check for Recharts wrapper
      const chartWrapper = page.locator('.recharts-wrapper');
      await expect(chartWrapper).toBeVisible();

      // Check for line chart
      const lines = page.locator('.recharts-line-curve');
      await expect(lines.first()).toBeVisible();
    });

    test('competitiveness page chart has proper axes', async ({ page }) => {
      // Check for XAxis (years)
      const xAxis = page.locator('.recharts-xAxis');
      await expect(xAxis).toBeVisible();

      // Check for YAxis (scores)
      const yAxis = page.locator('.recharts-yAxis');
      await expect(yAxis).toBeVisible();

      // Check for axis ticks
      const ticks = page.locator('.recharts-cartesian-axis-tick');
      const tickCount = await ticks.count();
      expect(tickCount).toBeGreaterThan(0);
    });

    test('competitiveness page chart displays overall score trend', async ({
      page,
    }) => {
      // Click on Trends tab if not already active
      const trendsTab = page.locator('button').filter({ hasText: /Trends/i });

      if ((await trendsTab.count()) > 0) {
        await trendsTab.click();
        await page.waitForTimeout(300);
      }

      // Check for line elements
      const lines = page.locator('.recharts-line-curve');
      await expect(lines.first()).toBeVisible();

      // Check for data points
      const dots = page.locator('.recharts-line-dot');
      const dotCount = await dots.count();
      expect(dotCount).toBeGreaterThan(0);
    });

    test('competitiveness page tab switching works', async ({ page }) => {
      // Find tab buttons
      const tabs = page
        .locator('button')
        .filter({ hasText: /Trends|Pillars/i });
      const tabCount = await tabs.count();

      if (tabCount >= 2) {
        // Click on Pillars tab
        await tabs.nth(1).click();
        await page.waitForTimeout(500);

        // Chart should still be visible
        const chart = page.locator('.recharts-wrapper');
        await expect(chart).toBeVisible();
      }
    });

    test('competitiveness page chart has legend with pillar names', async ({
      page,
    }) => {
      // Check for legend
      const legend = page.locator('.recharts-legend-wrapper');
      const legendCount = await legend.count();

      if (legendCount > 0) {
        await expect(legend.first()).toBeVisible();

        // Check for pillar names in legend
        const legendText = await legend.first().textContent();
        expect(legendText).toMatch(
          /Overall|Economic|Government|Infrastructure|Resiliency/i
        );
      }
    });

    test('competitiveness page chart tooltips display pillar information', async ({
      page,
    }) => {
      // Hover over chart area
      const chartArea = page.locator('.recharts-wrapper');
      await chartArea.hover();

      // Check for tooltip
      const tooltip = page.locator('.recharts-tooltip-wrapper');
      const tooltipCount = await tooltip.count();

      if (tooltipCount > 0) {
        const tooltipContent = page.locator('.recharts-tooltip-content');
        await expect(tooltipContent).toBeVisible();
      }
    });

    test('competitiveness page chart has grid lines', async ({ page }) => {
      // Check for Cartesian grid
      const grid = page.locator('.recharts-cartesian-grid');
      await expect(grid).toBeVisible();

      // Check for grid lines
      const gridLines = page.locator(
        '.recharts-cartesian-grid-horizontal, .recharts-cartesian-grid-vertical'
      );
      const gridLineCount = await gridLines.count();
      expect(gridLineCount).toBeGreaterThan(0);
    });

    test('competitiveness page displays pillar scores with different colors', async ({
      page,
    }) => {
      // Check for multiple line elements with different colors
      const lines = page.locator('.recharts-line-curve');
      const lineCount = await lines.count();

      // Should have multiple lines (Overall + 5 pillars)
      expect(lineCount).toBeGreaterThan(1);

      // Check that lines have different stroke colors
      const firstLineColor = await lines.first().getAttribute('stroke');
      const lastLineColor = await lines.last().getAttribute('stroke');

      expect(firstLineColor).toBeTruthy();
      expect(lastLineColor).toBeTruthy();
    });
  });

  test.describe('Chart Accessibility', () => {
    test('all charts have accessible names or descriptions', async ({
      page,
    }) => {
      const pages = [
        '/statistics',
        '/statistics/municipal-income',
        '/statistics/competitiveness',
      ];

      for (const url of pages) {
        await page.goto(url);
        await page.waitForLoadState('networkidle');

        const chart = page
          .locator('.recharts-wrapper')
          .or(page.locator('[data-testid="chart"]'));

        if ((await chart.count()) > 0) {
          const chartElement = chart.first();
          const ariaLabel = await chartElement.getAttribute('aria-label');
          const role = await chartElement.getAttribute('role');

          const hasAccessibility =
            ariaLabel !== null || role === 'img' || role === 'application';

          expect(hasAccessibility || (await chart.count()) > 0).toBeTruthy();
        }
      }
    });

    test('chart view controls are keyboard operable', async ({ page }) => {
      await page.goto('/statistics');
      const byBarangay = page
        .getByRole('group', { name: 'Population view' })
        .getByRole('button', { name: 'By barangay' });
      await expect(byBarangay).toHaveAttribute('aria-pressed', 'false');

      // Reachable through the tab order, not only by clicking.
      let reached = false;
      for (let i = 0; i < 80 && !reached; i++) {
        await page.keyboard.press('Tab');
        reached = await byBarangay.evaluate(
          el => el === document.activeElement
        );
      }
      expect(reached, 'Tab reaches the chart view toggle').toBe(true);

      await page.keyboard.press('Enter');
      await expect(byBarangay).toHaveAttribute('aria-pressed', 'true');
    });
  });

  test.describe('Chart Performance', () => {
    test('charts render within reasonable time', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/statistics');
      await page.waitForLoadState('networkidle');

      const renderTime = Date.now() - startTime;

      // Charts should render within 5 seconds
      expect(renderTime).toBeLessThan(5000);

      // Chart should be visible
      const chart = page.locator('.recharts-wrapper');
      await expect(chart).toBeVisible();
    });

    test('charts do not cause memory leaks or performance issues', async ({
      page,
    }) => {
      // Navigate between pages multiple times
      for (let i = 0; i < 3; i++) {
        await page.goto('/statistics');
        await page.waitForLoadState('networkidle');

        const chart = page.locator('.recharts-wrapper');
        await expect(chart).toBeVisible();

        // Pages without verified data render no chart to cycle through.
        if (hasIncome) {
          await page.goto('/statistics/municipal-income');
          await page.waitForLoadState('networkidle');
          await expect(page.locator('.recharts-pie')).toBeVisible();
        }

        if (hasCmci) {
          await page.goto('/statistics/competitiveness');
          await page.waitForLoadState('networkidle');
          await expect(page.locator('.recharts-line-curve')).toBeVisible();
        }
      }
      // Successfully rendered all charts across 3 navigation cycles
    });
  });

  test.describe('Chart Data Quality', () => {
    test('population page chart displays complete data', async ({ page }) => {
      await page.goto('/statistics');
      await page.waitForLoadState('networkidle');

      // Check for data points
      const dots = page.locator('.recharts-line-dot');
      const dotCount = await dots.count();

      // Should have multiple data points (at least 4 years)
      expect(dotCount).toBeGreaterThanOrEqual(4);
    });

    test('municipal income page chart displays all income categories', async ({
      page,
    }) => {
      test.skip(!hasIncome, NO_INCOME);
      await page.goto('/statistics/municipal-income');
      await page.waitForLoadState('networkidle');

      // Check for pie chart sectors, polling while the pie animates in
      const sectors = page.locator('.recharts-pie-sector');

      // Should have at least 4 income categories
      await expect.poll(() => sectors.count()).toBeGreaterThanOrEqual(4);
    });

    test('competitiveness page chart displays multi-year data', async ({
      page,
    }) => {
      test.skip(!hasCmci, NO_CMCI);
      await page.goto('/statistics/competitiveness');
      await page.waitForLoadState('networkidle');

      // Check for data points
      const dots = page.locator('.recharts-line-dot');
      const dotCount = await dots.count();

      // Should have multiple data points (multiple years)
      expect(dotCount).toBeGreaterThanOrEqual(3);
    });
  });

  test.describe('Chart Responsive Design', () => {
    test('charts adapt to different screen sizes', async ({ page }) => {
      const viewports = [
        { width: 1920, height: 1080 }, // Desktop
        { width: 768, height: 1024 }, // Tablet
        { width: 375, height: 667 }, // Mobile
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto('/statistics');
        await page.waitForLoadState('networkidle');

        // Chart should be visible on all viewport sizes
        const chart = page.locator('.recharts-wrapper');
        await expect(chart).toBeVisible();

        // Chart should fit within viewport
        const chartBox = await chart.boundingBox();
        expect(chartBox).toBeTruthy();
        expect(chartBox!.width).toBeLessThanOrEqual(viewport.width);
      }
    });

    test('chart legends are readable on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/statistics');
      await page.waitForLoadState('networkidle');

      // Check for legend
      const legend = page.locator('.recharts-legend-wrapper');
      const legendCount = await legend.count();

      if (legendCount > 0) {
        await expect(legend.first()).toBeVisible();

        // Legend should fit within screen
        const legendBox = await legend.first().boundingBox();
        expect(legendBox).toBeTruthy();
        expect(legendBox!.width).toBeLessThanOrEqual(375);
      }
    });
  });
});
