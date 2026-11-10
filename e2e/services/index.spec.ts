import { test, expect } from '../test-config';
import { readData } from '../utils/data';
import { assertKapwaTokens } from '../utils/kapwa';
import { openSidebar } from '../utils/layout';

/**
 * The services directory renders from citizens-charter/merged-services.json,
 * which holds the city's Citizen's Charter services. The empty-state describe
 * covers what the page does if that dataset is ever emptied again: it says the
 * directory is not available yet, instead of a "no results" message that
 * blames the visitor's filters. The published describe covers the card and
 * filter behaviour, and runs while records are published.
 */
const services = readData<unknown[]>('citizens-charter/merged-services.json');
const categories = readData<{ categories: { slug: string; name: string }[] }>(
  'service_categories.json'
).categories;
const hasServices = services.length > 0;

const serviceCards = '[data-testid="service-card"]';

test.describe('Services Index Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/services');
    await expect(
      page.getByRole('heading', { level: 1, name: /Services/i })
    ).toBeVisible();
  });

  test('services page uses Kapwa semantic tokens', async ({ page }) => {
    await assertKapwaTokens(page);
  });

  test('the sidebar lists every service category', async ({ page }) => {
    await openSidebar(page);
    const nav = page.getByRole('navigation', { name: 'Categories' });

    await expect(nav.getByRole('button')).toHaveCount(categories.length + 1);
    await expect(
      nav.getByRole('button', { name: 'All Services' })
    ).toHaveAttribute('aria-current', 'page');
    for (const category of categories) {
      await expect(
        nav.getByRole('button', { name: category.name, exact: true })
      ).toBeVisible();
    }
  });

  test('choosing a category updates the URL and the active item', async ({
    page,
  }) => {
    await openSidebar(page);
    const nav = page.getByRole('navigation', { name: 'Categories' });
    const [category] = categories;
    const item = nav.getByRole('button', { name: category.name, exact: true });

    await item.click();

    await expect(page).toHaveURL(new RegExp(`category=${category.slug}`));
    await expect(item).toHaveAttribute('aria-current', 'page');
    await expect(
      nav.getByRole('button', { name: 'All Services' })
    ).not.toHaveAttribute('aria-current', 'page');
  });

  test('search is labelled and kept in the URL', async ({ page }) => {
    await page
      .getByRole('textbox', { name: /Search for services/i })
      .fill('business');

    await expect(page).toHaveURL(/search=business/);
  });

  test.describe('with no verified services published', () => {
    test.skip(hasServices, 'Verified services are published.');

    test('the directory says it is not available yet', async ({ page }) => {
      const content = page.locator('#layout-content');

      await expect(
        content.getByRole('heading', { name: 'Not yet available' })
      ).toBeVisible();
      await expect(
        content.getByRole('link', { name: 'Suggest a source' })
      ).toHaveAttribute('href', /\/issues\/new\?template=contribution\.yml$/);

      // Nothing to list, so neither cards nor the filter bar render, and the
      // copy does not pretend a search came back empty.
      await expect(page.locator(serviceCards)).toHaveCount(0);
      await expect(
        page.locator('[data-testid="filter-bar-toggle"]')
      ).toHaveCount(0);
      await expect(content.getByText('No services found')).toHaveCount(0);
    });

    test('searching and filtering keep the same honest empty state', async ({
      page,
    }) => {
      const notYetAvailable = page
        .locator('#layout-content')
        .getByRole('heading', { name: 'Not yet available' });

      await page
        .getByRole('textbox', { name: /Search for services/i })
        .fill('xyznonexistent123');
      await expect(page).toHaveURL(/search=xyznonexistent123/);
      await expect(notYetAvailable).toBeVisible();

      await openSidebar(page);
      await page
        .getByRole('navigation', { name: 'Categories' })
        .getByRole('button', { name: categories[0].name, exact: true })
        .click();
      await expect(page).toHaveURL(/category=/);
      await expect(notYetAvailable).toBeVisible();
    });
  });
});

/**
 * Card and filter behaviour. These need records to act on, so they are
 * skipped until verified services are published.
 */
test.describe('Services Index Page with published services', () => {
  test.skip(!hasServices, 'No verified services are published yet.');

  test.beforeEach(async ({ page }) => {
    await page.goto('/services');
    await expect(page.locator(serviceCards).first()).toBeVisible();
  });

  test('services index displays service cards', async ({ page }) => {
    const firstCard = page.locator(serviceCards).first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard).toHaveAttribute('aria-label', /View details for/);
    await expect(
      page.locator('#layout-content a[href*="/services/"]').first()
    ).toBeVisible();
  });

  test('services search narrows and restores the list', async ({ page }) => {
    const cards = page.locator(serviceCards);
    const initialCount = await cards.count();
    const searchInput = page.getByRole('textbox', {
      name: /Search for services/i,
    });

    await searchInput.fill('xyznonexistent123');
    await expect(
      page.getByRole('heading', { name: 'No services found' })
    ).toBeVisible();

    await searchInput.fill('');
    await expect(cards).toHaveCount(initialCount);
  });

  test('filter by source never adds results', async ({ page }) => {
    const cards = page.locator(serviceCards);
    const initialCount = await cards.count();

    await page.locator('[data-testid="filter-bar-toggle"]').click();
    await page.locator('[data-testid="filter-source-official"]').click();

    await expect.poll(() => cards.count()).toBeLessThanOrEqual(initialCount);
  });

  test('filter by classification never adds results', async ({ page }) => {
    const cards = page.locator(serviceCards);
    const initialCount = await cards.count();

    await page.locator('[data-testid="filter-bar-toggle"]').click();
    await page.locator('[data-testid="filter-classification-simple"]').click();

    await expect.poll(() => cards.count()).toBeLessThanOrEqual(initialCount);
  });

  test('filter by office never adds results', async ({ page }) => {
    const cards = page.locator(serviceCards);
    const initialCount = await cards.count();

    await page.locator('[data-testid="filter-bar-toggle"]').click();
    await page
      .locator('[data-testid="filter-office-select"]')
      .selectOption({ index: 1 });

    await expect.poll(() => cards.count()).toBeLessThanOrEqual(initialCount);
  });

  test('clear all filters button restores the list', async ({ page }) => {
    const cards = page.locator(serviceCards);
    const initialCount = await cards.count();

    await page.locator('[data-testid="filter-bar-toggle"]').click();
    await page.locator('[data-testid="filter-source-official"]').click();
    await page.locator('[data-testid="filter-clear-all"]').click();

    await expect(cards).toHaveCount(initialCount);
  });

  test('navigation to service detail page works', async ({ page }) => {
    await page.locator(serviceCards).first().click();

    await page.waitForURL(/\/services\/.+/);
    await assertKapwaTokens(page);
  });

  test('filter toggle is a button', async ({ page }) => {
    await expect(
      page.locator('[data-testid="filter-bar-toggle"]')
    ).toHaveAttribute('type', 'button');
  });
});

test.describe('Services Index Page - Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/services');
  });

  test('services index page visual snapshot @visual', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Take full page screenshot
    await expect(page).toHaveScreenshot('services-index.png', {
      maxDiffPixels: 150,
    });
  });

  test('services index page hero section visual snapshot @visual', async ({
    page,
  }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Take snapshot of hero section
    const heroSection = page.locator('main').first();
    await expect(heroSection).toHaveScreenshot('services-hero.png', {
      maxDiffPixels: 100,
    });
  });
});
