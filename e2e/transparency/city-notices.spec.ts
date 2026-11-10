import { expect, test } from '../test-config';

const notices = {
  items: [
    {
      id: 1,
      date: '2026-10-28T06:57:42',
      title: 'SUPPLY & DELIVERY OF OFFICE EQUIPMENT',
      link: 'https://www.dagupan.gov.ph/bac/example-notice/',
      type: 'Competitive Bidding',
    },
  ],
  page: 1,
  pageSize: 20,
  total: 21,
  totalPages: 2,
  types: [{ id: 92, name: 'Competitive Bidding', count: 21 }],
};

test.describe('City procurement notices', () => {
  test('lists notices that link to the city website', async ({ page }) => {
    await page.route('**/api/city-procurement**', route =>
      route.fulfill({ json: notices })
    );
    await page.goto('/transparency/procurement');

    const section = page.locator(
      'section[aria-labelledby="city-notices-heading"]'
    );
    await expect(section).toBeVisible();
    const link = section.getByRole('link', {
      name: /SUPPLY & DELIVERY OF OFFICE EQUIPMENT/,
    });
    await expect(link).toHaveAttribute(
      'href',
      'https://www.dagupan.gov.ph/bac/example-notice/'
    );
    await expect(section.getByText('Page 1 of 2')).toBeVisible();
  });

  test('falls back to the city page when the feed is down', async ({
    page,
  }) => {
    await page.route('**/api/city-procurement**', route =>
      route.fulfill({
        status: 502,
        json: { error: 'city_notices_unavailable' },
      })
    );
    await page.goto('/transparency/procurement');

    const section = page.locator(
      'section[aria-labelledby="city-notices-heading"]'
    );
    await expect(
      section.getByRole('link', { name: /city's procurement page/i }).first()
    ).toHaveAttribute('href', 'https://www.dagupan.gov.ph/bac/');
  });
});
