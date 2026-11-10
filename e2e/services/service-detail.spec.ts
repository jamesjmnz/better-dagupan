import { test, expect } from '../test-config';
import { readData } from '../utils/data';
import { assertKapwaTokens } from '../utils/kapwa';

/**
 * No verified services are published yet, so every detail URL is unknown to
 * the portal, including slugs that existed in the template this portal was
 * forked from. The first describe pins down that not-found state; the second
 * exercises a real record and runs only once one is published.
 */
const services = readData<{ slug: string }[]>(
  'citizens-charter/merged-services.json'
);
const firstService = services[0];

test.describe('Service Detail Page - unknown service', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/services/nonexistent-service-12345');
    await expect(
      page.getByRole('heading', { name: 'Service not found' })
    ).toBeVisible();
  });

  test('says the service was not found and links back', async ({ page }) => {
    const back = page.getByRole('link', { name: 'Back to all services' });
    await expect(back).toHaveAttribute('href', '/services');

    await back.click();
    await expect(page).toHaveURL(/\/services$/);
  });

  test('keeps the breadcrumb trail', async ({ page }) => {
    const breadcrumb = page.getByRole('navigation', { name: /breadcrumb/i });

    await expect(breadcrumb).toBeVisible();
    // The home crumb is an icon, so it carries its own accessible name.
    await expect(
      breadcrumb.getByRole('link', { name: 'Home' })
    ).toHaveAttribute('href', '/');
    await expect(
      breadcrumb.getByRole('link', { name: 'Services' })
    ).toHaveAttribute('href', '/services');
  });

  test('uses Kapwa semantic tokens', async ({ page }) => {
    await assertKapwaTokens(page);
  });

  test('slugs inherited from the template are not served', async ({ page }) => {
    // A Los Banos service slug, kept here to prove it is gone.
    await page.goto('/services/animal-bite-treatment-center');
    await expect(
      page.getByRole('heading', { name: 'Service not found' })
    ).toBeVisible();
  });
});

test.describe('Service Detail Page - published service', () => {
  test.skip(!firstService, 'No verified services are published yet.');

  test.beforeEach(async ({ page }) => {
    await page.goto(`/services/${firstService.slug}`);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('service detail page uses Kapwa semantic tokens', async ({ page }) => {
    await assertKapwaTokens(page);
  });

  test('service detail page has breadcrumb navigation', async ({ page }) => {
    const breadcrumb = page.getByRole('navigation', { name: /breadcrumb/i });
    await expect(breadcrumb).toBeVisible();
    await expect(
      breadcrumb.getByRole('link', { name: 'Services' })
    ).toHaveAttribute('href', '/services');
  });

  test('service detail page has proper external links', async ({ page }) => {
    const externalLinks = page.locator('#main-content a[target="_blank"]');
    for (const link of await externalLinks.all()) {
      await expect(link).toHaveAttribute('rel', /noreferrer/);
    }
  });

  test('service detail page navigation works', async ({ page }) => {
    await page
      .getByRole('navigation', { name: /breadcrumb/i })
      .getByRole('link', { name: 'Services' })
      .click();
    await expect(page).toHaveURL(/\/services$/);
  });
});
