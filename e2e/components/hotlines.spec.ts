import { test, expect } from '../test-config';

/**
 * The home page shows the city's emergency numbers above the national ones.
 * These tests check that the verified city numbers render as dialable links
 * with accessible names, that the group names its sources, that it says some
 * of the city's numbers are held back, and that the withheld ones stay off the
 * page. Every assertion is unconditional.
 */
const CITY_ENTRY_COUNT = 10;
const WITHHELD_NUMBERS = [
  '0933-378-8888',
  '0960-260-6036',
  '0969-045-1111',
  // Another city page gives this Red Cross landline to a bank.
  '632-3296',
];

async function gotoHotlines(page: import('@playwright/test').Page) {
  await page.goto('/');
  const widget = page.getByRole('region', { name: 'Emergency hotlines' });
  await expect(widget).toBeVisible();
  return widget;
}

test.describe('Emergency hotlines', () => {
  test('lists the city group above the national hotlines', async ({ page }) => {
    const widget = await gotoHotlines(page);

    const headings = widget.getByRole('heading', { level: 3 });
    await expect(headings).toHaveText(['City of Dagupan', 'National hotlines']);

    const cityList = widget.getByRole('list').first();
    await expect(cityList.getByRole('listitem')).toHaveCount(CITY_ENTRY_COUNT);
  });

  test('makes every city number a tel: link with an accessible name', async ({
    page,
  }) => {
    const widget = await gotoHotlines(page);

    const police = widget.getByRole('link', {
      name: 'Call PNP Dagupan at (075) 529-5604',
    });
    await expect(police).toHaveAttribute('href', 'tel:+63755295604');

    const disaster = widget.getByRole('link', {
      name: 'Call CDRRMO at 0968-444-9598',
    });
    await expect(disaster).toHaveAttribute('href', 'tel:+639684449598');

    const cityLinks = widget
      .getByRole('list')
      .first()
      .locator('a[href^="tel:+63"]');
    await expect(cityLinks).toHaveCount(24);
  });

  test('cites the city pages and says some numbers are held back', async ({
    page,
  }) => {
    const widget = await gotoHotlines(page);

    const citation = widget.getByRole('region', { name: /Sources/ });
    await expect(citation).toContainText('City Government of Dagupan');
    await expect(
      citation.getByRole('link', { name: 'Contact Us' })
    ).toHaveAttribute('href', 'https://www.dagupan.gov.ph/contact-us/');

    await expect(
      widget.getByText('Some numbers the city lists are not shown yet')
    ).toBeVisible();
  });

  test('keeps the uncorroborated numbers off the page', async ({ page }) => {
    const widget = await gotoHotlines(page);

    for (const number of WITHHELD_NUMBERS) {
      await expect(widget).not.toContainText(number);
    }
  });
});
