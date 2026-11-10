import { test, expect, mockApiRoutes } from './test-config';
import { readData } from './utils/data';
import { assertKapwaTokens } from './utils/kapwa';

const serviceCategories = readData<{
  categories: { slug: string; name: string }[];
}>('service_categories.json');
const services = readData<unknown[]>('services/services.json');

/**
 * The home page is data-driven: the category grid comes from
 * service_categories.json and the hero search from services.json. Expected
 * values are derived from those files, so the assertions follow the data
 * instead of encoding a count from the template this portal was forked from.
 *
 * Accessibility is covered by e2e/a11y.spec.ts.
 */

/** ServicesSection shows the first eight categories, for an even 4x2 grid. */
const HOME_CATEGORIES = serviceCategories.categories.slice(0, 8);

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Hero section with search and quick access', async ({ page }) => {
    const searchInput = page.getByRole('combobox', {
      name: 'Search government services',
    });
    const results = page.getByRole('listbox', { name: 'Matching services' });

    await searchInput.fill('health');
    await expect(searchInput).toHaveAttribute('aria-expanded', 'true');

    if (services.length === 0) {
      // No verified services are published yet, so the search has to say it
      // found nothing rather than render a list.
      await expect(results).toHaveCount(0);
      await expect(page.getByRole('status').first()).toHaveText('0 results');
    } else {
      await expect(results.getByRole('option').first()).toBeVisible();
    }

    // Clearing the query closes the results again.
    await searchInput.fill('');
    await expect(searchInput).toHaveAttribute('aria-expanded', 'false');
    await expect(results).toHaveCount(0);

    // Quick access cards. Scoped to the panel: the navbar and footer link to
    // the same routes.
    const quickAccess = page
      .getByRole('heading', { name: 'Quick Access' })
      .locator('..');
    const quickLinks = quickAccess.getByRole('link');
    await expect(quickLinks).toHaveCount(4);
    for (const [index, href] of [
      '/transparency/financial',
      '/transparency/infrastructure',
      '/openlgu',
      '/statistics',
    ].entries()) {
      await expect(quickLinks.nth(index)).toHaveAttribute('href', href);
    }
  });

  test('All main sections are displayed', async ({ page }) => {
    const sections = [
      /Government Services/i,
      /History of/i,
      /Weather/i,
      /Local Government/i,
    ];

    for (const name of sections) {
      await expect(page.getByRole('heading', { level: 2, name })).toBeVisible();
    }

    // The history timeline has no verified records yet and must say so.
    const history = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: /History of/i }) });
    await expect(
      history.getByRole('heading', { name: 'Not yet available' })
    ).toBeVisible();
  });

  test('Services section displays a card for each listed category', async ({
    page,
  }) => {
    const servicesSection = page.locator('section').filter({
      has: page.getByRole('heading', { name: /Government Services/i }),
    });
    const cards = servicesSection.getByRole('listitem');

    await expect(cards).toHaveCount(HOME_CATEGORIES.length);

    for (const [index, category] of HOME_CATEGORIES.entries()) {
      const card = cards.nth(index);
      await expect(card.getByRole('heading', { level: 3 })).toHaveText(
        category.name
      );
      await expect(card.getByRole('link')).toHaveAttribute(
        'href',
        `/services?category=${category.slug}`
      );
    }

    await expect(
      servicesSection.getByRole('link', { name: /View All Services/i })
    ).toHaveAttribute('href', '/services?category=all');
  });

  test('Page uses Kapwa semantic tokens', async ({ page }) => {
    test.fixme(
      true,
      'The pinned @bettergov/kapwa Banner in GovernmentSection renders raw bg-gray-50/text-gray-900 classes.'
    );
    await assertKapwaTokens(page);
  });

  test('Navigation links work correctly', async ({ page }) => {
    // Test multiple navigation paths in one test
    const links = [
      '/services',
      '/transparency/financial',
      '/government/elected-officials',
    ];

    for (const href of links) {
      await page.goto('/');
      // The first link in the DOM is the desktop navbar's, which small
      // screens replace with the menu overlay, so take the first one the
      // viewport actually shows.
      await page
        .locator(`a[href*="${href}"]`)
        .filter({ visible: true })
        .first()
        .click();
      await page.waitForURL(new RegExp(href.replace('/', '\\/')));
      expect(page.url()).toMatch(new RegExp(href.replace('/', '\\/')));
    }
  });

  test('Mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1')).toBeVisible();
    await expect(
      page.getByRole('combobox', { name: 'Search government services' })
    ).toBeVisible();
  });
});

test.describe('Home Page - Console', () => {
  test('No console errors', async ({ page }) => {
    // With a healthy backend the page must log nothing. Mocking here rather
    // than relying on CI makes the result the same locally, where the dev
    // server has no Pages Functions and every /api call fails. This test has
    // its own describe so that no earlier, unmocked load of the page is still
    // logging failed requests while it listens.
    await mockApiRoutes(page);

    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await page.waitForLoadState('networkidle');

    expect(errors.filter(e => !e.includes('DevTools'))).toEqual([]);
  });
});

test.describe('Home Page - Visual Regression', () => {
  test('Hero section visual snapshot @visual', async ({ page }) => {
    await page.goto('/');

    const heroSection = page.locator('main > div > div').first();
    await expect(heroSection).toHaveScreenshot('hero-section.png', {
      maxDiffPixels: 100,
    });
  });

  test('Services section visual snapshot @visual', async ({ page }) => {
    await page.goto('/');

    const servicesSection = page.locator('section').filter({
      hasText: /Government Services/i,
    });
    await servicesSection.scrollIntoViewIfNeeded();

    await expect(servicesSection).toHaveScreenshot('services-section.png', {
      maxDiffPixels: 100,
    });
  });
});
