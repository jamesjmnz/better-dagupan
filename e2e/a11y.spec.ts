import { test, expect } from './test-config';
import { expectNoAxeViolations, type AxeOptions } from './utils/axe';
import { readData } from './utils/data';

/**
 * WCAG 2.0 A/AA scans of the portal's key public routes with axe-core.
 *
 * Run with `npx playwright test --grep @a11y`; the e2e-accessibility job in
 * .github/workflows/e2e.yml does exactly that. Each route waits for its own
 * content first, because routes are lazy-loaded and a scan of the Suspense
 * fallback passes vacuously.
 *
 * A route that cannot pass a rule yet lists it in `disableRules` with the
 * reason. None does today.
 */

const [barangay] = readData<{ slug: string; barangay_name: string }[]>(
  'directory/barangays.json'
);

interface Route extends AxeOptions {
  name: string;
  path: string;
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
  { name: 'transparency', path: '/transparency' },
  { name: 'openlgu', path: '/openlgu' },
  { name: 'about', path: '/about' },
  { name: 'report an error', path: '/report-an-error' },
  { name: 'sitemap', path: '/sitemap' },
];

test.describe('Accessibility', () => {
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
});
