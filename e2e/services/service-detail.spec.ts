import { test, expect } from '../test-config';
import { readData } from '../utils/data';
import { assertKapwaTokens } from '../utils/kapwa';

/**
 * Unknown slugs, including ones that existed in the template this portal was
 * forked from, get a not-found state; the first describe pins that down. The
 * others exercise the published Citizen's Charter records, and skip if the
 * dataset is ever emptied again.
 */
type PublishedService = {
  slug: string;
  service: string;
  fees: { amount: string } | null;
  sources: string[];
  processingTimeStatus?: string;
};
const services = readData<PublishedService[]>(
  'citizens-charter/merged-services.json'
);
const firstService = services[0];
const withoutFee = services.find(s => s.fees === null);
const withFee = services.find(s => s.fees !== null);
const conflictingTotal = services.find(
  s => s.processingTimeStatus === 'conflicting'
);

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

test.describe('Service Detail Page - provenance', () => {
  test.skip(!firstService, 'No verified services are published yet.');

  test('names the city page the service was transcribed from', async ({
    page,
  }) => {
    await page.goto(`/services/${firstService.slug}`);

    const source = page.getByRole('region', { name: 'Source' });
    await expect(source).toBeVisible();
    await expect(source).toContainText('City Government of Dagupan');
    await expect(
      source.getByRole('link', { name: firstService.service })
    ).toHaveAttribute(
      'href',
      /^https:\/\/(web\.archive\.org\/web\/\d{14}\/)?https:\/\/www\.dagupan\.gov\.ph\/residents\/[a-z0-9-]+\/$/
    );
    await expect(source).toContainText(/Last verified/);

    // A citation read from an Internet Archive capture says so in words.
    const cited = readData<{ id: string; url: string }[]>(
      'sources/civic-sources.json'
    ).filter(s => firstService.sources.includes(s.id));
    const archived = page.getByText(
      /Internet Archive's copy of the city's page/
    );
    if (cited.some(s => s.url.startsWith('https://web.archive.org/'))) {
      await expect(archived).toBeVisible();
    } else {
      await expect(archived).toHaveCount(0);
    }
  });

  test('says the staff column is not republished', async ({ page }) => {
    await page.goto(`/services/${firstService.slug}`);

    await expect(
      page.getByText(/does not republish those names/)
    ).toBeVisible();
  });

  test('shows a printed fee as stated', async ({ page }) => {
    test.skip(!withFee, 'No service states a single fee.');
    await page.goto(`/services/${withFee!.slug}`);

    await expect(page.getByText('Fee amount: not verified')).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: /Fees/ }).first()
    ).toBeVisible();
  });

  test('says a fee the page does not state is not verified', async ({
    page,
  }) => {
    test.skip(!withoutFee, 'Every service states a fee.');
    await page.goto(`/services/${withoutFee!.slug}`);

    await expect(page.getByText('Fee amount: not verified')).toBeVisible();
    // The fee column is still shown as printed, step by step.
    await expect(page.getByText(/Table of Taxes/).first()).toBeVisible();
  });

  test('explains a withheld total processing time', async ({ page }) => {
    test.skip(!conflictingTotal, 'No total is withheld.');
    await page.goto(`/services/${conflictingTotal!.slug}`);

    await expect(
      page.getByText('Total processing time: not verified')
    ).toBeVisible();
    await expect(
      page.getByText(/do not add up to, so Better Dagupan publishes no total/)
    ).toBeVisible();
  });
});
