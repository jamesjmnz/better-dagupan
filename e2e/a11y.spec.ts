import { test, expect } from './test-config';
import { expectNoAxeViolations, type AxeOptions } from './utils/axe';
import { readData } from './utils/data';
import { mockMeilisearch } from './utils/meilisearch';

/**
 * WCAG 2.0 A/AA scans of the portal's key public routes with axe-core.
 *
 * Run with `npx playwright test --grep @a11y`; the e2e-accessibility job in
 * .github/workflows/e2e.yml does exactly that. Each route waits for its own
 * content first, because routes are lazy-loaded and a scan of the Suspense
 * fallback passes vacuously.
 *
 * Meilisearch and the city's BAC feed are mocked (utils/meilisearch.ts and
 * `cityNotices` below), so the procurement and infrastructure tables render
 * and get scanned whether or not the upstream services are reachable.
 *
 * A route that cannot pass a rule yet lists it in `disableRules` with the
 * reason. None does today.
 */

const [barangay] = readData<{ slug: string; barangay_name: string }[]>(
  'directory/barangays.json'
);
const [service] = readData<{ slug: string; service: string }[]>(
  'citizens-charter/merged-services.json'
);

/** One notice from the city's BAC feed, so the list renders and is scanned. */
const cityNotices = {
  items: [
    {
      id: 1,
      date: '2026-01-15T08:00:00',
      title: 'Example notice',
      link: 'https://www.dagupan.gov.ph/bac/example-notice/',
      type: 'Competitive Bidding',
    },
  ],
  page: 1,
  pageSize: 20,
  total: 1,
  totalPages: 1,
  types: [{ id: 1, name: 'Competitive Bidding', count: 1 }],
};

interface Route extends AxeOptions {
  name: string;
  path: string;
  /** A selector that is only present once the route's data has rendered. */
  ready?: string;
}

const routes: Route[] = [
  { name: 'home', path: '/' },
  { name: 'services', path: '/services' },
  { name: 'departments', path: '/government/departments' },
  { name: 'barangays', path: '/government/barangays' },
  {
    name: `barangay detail (${barangay.barangay_name})`,
    path: `/government/barangays/${barangay.slug}`,
  },
  {
    name: `service detail (${service.service})`,
    path: `/services/${service.slug}`,
  },
  { name: 'elected officials', path: '/government/elected-officials' },
  { name: 'committees', path: '/government/elected-officials/committees' },
  { name: 'transparency', path: '/transparency' },
  {
    name: 'procurement',
    path: '/transparency/procurement',
    ready: '#layout-content table',
  },
  {
    name: 'infrastructure',
    path: '/transparency/infrastructure',
    ready: '#layout-content table',
  },
  { name: 'financial', path: '/transparency/financial' },
  { name: 'population', path: '/statistics/population' },
  { name: 'municipal income', path: '/statistics/municipal-income' },
  { name: 'competitiveness', path: '/statistics/competitiveness' },
  { name: 'openlgu', path: '/openlgu' },
  { name: 'weather', path: '/data/weather' },
  { name: 'about', path: '/about' },
  { name: 'report an error', path: '/report-an-error' },
  { name: 'sitemap', path: '/sitemap' },
];

test.describe('Accessibility', () => {
  // Upstream services are mocked so the data-driven tables render the same
  // way on every run, with or without network access.
  test.beforeEach(async ({ page }) => {
    await mockMeilisearch(page);
    await page.route('**/api/city-procurement**', route =>
      route.fulfill({ json: cityNotices })
    );
  });

  for (const route of routes) {
    test(`${route.name} has no WCAG A/AA violations @a11y`, async ({
      page,
    }) => {
      await page.goto(route.path);

      // The route rendered real content rather than the loader or a 404.
      const heading = page.getByRole('heading', { level: 1 }).first();
      await expect(heading).toBeVisible();
      await expect(heading).not.toHaveText('404');
      // Let data-driven sections render before scanning. Some pages keep
      // retrying an unreachable API and never go idle, so bound the wait.
      await page
        .waitForLoadState('networkidle', { timeout: 5_000 })
        .catch(() => {});
      if (route.ready) await expect(page.locator(route.ready)).toBeVisible();

      await expectNoAxeViolations(page, route);
    });
  }

  test('the mobile services layout has no WCAG A/AA violations @a11y', async ({
    page,
  }) => {
    // The sidebar is a disclosure on small screens; scan it open.
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/services');
    await page.getByRole('button', { name: 'Menu', exact: true }).click();
    await expect(
      page.getByRole('navigation', { name: 'Categories' })
    ).toBeVisible();

    await expectNoAxeViolations(page);
  });

  test('the open status picker has no WCAG A/AA violations @a11y', async ({
    page,
  }) => {
    await page.goto('/transparency/infrastructure');
    await page.getByRole('button', { name: 'Select status...' }).click();
    await expect(page.getByRole('listbox')).toBeVisible();

    await expectNoAxeViolations(page);
  });
});
