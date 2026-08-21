import { expect, test } from './test-config';

/**
 * The portal previously rendered Los Banos civic records under the Better
 * Dagupan name. This suite is the end-to-end half of that guarantee: the unit
 * tests prove the datasets are empty, these prove nothing reaches the screen.
 *
 * Deliberately not tagged @smoke. It asserts the state of the Dagupan
 * adaptation rather than something true of any LGU, and it should be revisited
 * when verified Dagupan records land.
 */
const routes = [
  '/',
  '/services',
  '/government/elected-officials',
  '/government/elected-officials/committees',
  '/government/departments',
  '/government/barangays',
  '/statistics',
  '/statistics/competitiveness',
  '/statistics/municipal-income',
  '/transparency',
  '/transparency/financial',
  '/search',
];

const INHERITED = /Los Ba(ñ|n)os|BetterLB|Better LB|losbanos\.gov\.ph/i;

test.describe('Inherited civic records', () => {
  for (const path of routes) {
    test(`${path} renders no inherited Los Banos content`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBeLessThan(400);

      // A page that crashed renders nothing, which would pass a text check
      // vacuously, so assert it actually rendered first.
      await expect(page.locator('main#main-content')).toBeVisible();
      const body = await page.locator('body').innerText();
      expect(body.length).toBeGreaterThan(0);
      expect(body).not.toMatch(INHERITED);
    });
  }
});

test.describe('Honest empty states', () => {
  const emptyRoutes = [
    '/statistics',
    '/statistics/competitiveness',
    '/statistics/municipal-income',
    '/transparency/financial',
  ];

  for (const path of emptyRoutes) {
    test(`${path} says the records are not available yet`, async ({ page }) => {
      await page.goto(path);

      await expect(
        page.getByText(/Verified Dagupan information has not been added yet/i)
      ).toBeVisible();
    });
  }

  test('the empty state does not claim a search came up empty', async ({
    page,
  }) => {
    await page.goto('/statistics/municipal-income');

    // Routes are lazy-loaded, so wait for the empty state to mount before
    // reading the document text.
    await expect(page.getByText(/not been added yet/i).first()).toBeVisible();

    const body = await page.locator('body').innerText();
    expect(body).not.toMatch(/no results found/i);
    expect(body).toMatch(/not been added yet/i);
  });

  test('the homepage history section explains that it is empty', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(
      page
        .getByText(/Verified Dagupan information has not been added yet/i)
        .first()
    ).toBeVisible();
  });
});
