import { test, expect } from './test-config';

/**
 * Pull-request smoke suite.
 *
 * The full cross-browser suite runs on a schedule and on demand (see
 * .github/workflows/e2e.yml); this file is the only end-to-end coverage that
 * gates a pull request. It therefore has to stay small, fast, and free of
 * LGU-specific content assertions so that it keeps passing across the Dagupan
 * adaptation instead of encoding inherited Los Baños records.
 *
 * What it proves: the app boots, each top-level route resolves to a real page
 * rather than the 404 catch-all, and the shared layout landmarks render.
 */

const routes = [
  { name: 'home', path: '/' },
  { name: 'services index', path: '/services' },
  { name: 'elected officials', path: '/government/elected-officials' },
  { name: 'departments index', path: '/government/departments' },
  { name: 'barangays index', path: '/government/barangays' },
  { name: 'statistics', path: '/statistics' },
  { name: 'transparency', path: '/transparency' },
];

test.describe('Smoke', () => {
  for (const route of routes) {
    test(`${route.name} renders the app shell @smoke`, async ({ page }) => {
      const response = await page.goto(route.path);
      expect(response?.status()).toBeLessThan(400);

      // The route resolved to a page, not the '*' NotFound element.
      const heading = page.locator('h1').first();
      await expect(heading).toBeVisible();
      await expect(heading).not.toHaveText('404');

      // Shared layout landmarks from src/App.tsx.
      await expect(page.locator('main#main-content')).toBeVisible();
      await expect(page.locator('nav').first()).toBeVisible();
    });
  }

  test('the skip link moves focus to the main landmark @smoke', async ({
    page,
  }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');

    const skipLink = page.locator('a[href="#main-content"]').first();
    await expect(skipLink).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main-content$/);
  });
});
