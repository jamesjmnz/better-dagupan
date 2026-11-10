import { readFileSync } from 'node:fs';

import type { Page } from '@playwright/test';

import { expect, test } from '../test-config';
import { expectNoAxeViolations } from '../utils/axe';

const { councilFeed } = JSON.parse(
  readFileSync(new URL('../../config/lgu.config.json', import.meta.url), 'utf8')
).openlgu as { councilFeed: { pageUrl: string } };

const ordinances = {
  items: [
    {
      id: 2226,
      postedAt: '2026-01-17T20:06:12',
      title: 'AN ORDINANCE PRESCRIBING A NEW TRICYCLE FARE MATRIX',
      link: 'https://sp.dagupan.gov.ph/ordinance/example-ordinance/',
      classifications: ['Communication & Public Information'],
    },
  ],
  page: 1,
  pageSize: 20,
  total: 147,
  totalPages: 8,
  classifications: [
    { id: 11, name: 'Appropriation', count: 6 },
    { id: 14, name: 'Communication & Public Information', count: 23 },
  ],
};

/** The legislative database is not bound, so the page shows its empty state. */
async function withoutLegislativeRecords(page: Page) {
  await page.route('**/api/openlgu/**', route =>
    route.fulfill({
      status: 503,
      json: { error: 'legislative_data_unavailable' },
    })
  );
}

const section = (page: Page) =>
  page.locator('section[aria-labelledby="council-ordinances-heading"]');

test.describe('Council ordinances', () => {
  test('lists ordinances that link to the council website', async ({
    page,
  }) => {
    await withoutLegislativeRecords(page);
    const requests: URL[] = [];
    await page.route('**/api/council-ordinances**', route => {
      requests.push(new URL(route.request().url()));
      return route.fulfill({ json: ordinances });
    });
    await page.goto('/openlgu');

    const list = section(page);
    await expect(list).toBeVisible();
    await expect(
      list.getByRole('heading', {
        name: 'Ordinances posted by the Sangguniang Panlungsod',
      })
    ).toBeVisible();

    const link = list.getByRole('link', {
      name: /PRESCRIBING A NEW TRICYCLE FARE MATRIX/,
    });
    await expect(link).toHaveAttribute(
      'href',
      'https://sp.dagupan.gov.ph/ordinance/example-ordinance/'
    );
    await expect(link).toHaveAccessibleName(/opens the council's page/);

    // The feed's date is the posting date, and is labelled as such.
    const posted = list.locator('time');
    await expect(posted).toHaveAttribute('datetime', '2026-01-17T20:06:12');
    await expect(posted).toHaveText(/^Posted /);
    await expect(list.getByText('Page 1 of 8 · 147 ordinances')).toBeVisible();
    // The a11y suite only ever sees the fallback, since its feed is mocked away.
    await expectNoAxeViolations(page);

    await list
      .getByLabel('Classification')
      .selectOption({ label: 'Appropriation' });
    await expect
      .poll(() => requests.at(-1)?.searchParams.get('classification'))
      .toBe('11');
    await expect(
      list.getByText(/Only some ordinances are classified/)
    ).toBeVisible();

    await list
      .getByRole('textbox', { name: "Search the Sangguniang Panlungsod's" })
      .fill('tricycle');
    await expect
      .poll(() => requests.at(-1)?.searchParams.get('search'))
      .toBe('tricycle');
  });

  test('falls back to the council page when the feed is down', async ({
    page,
  }) => {
    await withoutLegislativeRecords(page);
    await page.route('**/api/council-ordinances**', route =>
      route.fulfill({
        status: 502,
        json: { error: 'council_ordinances_unavailable' },
      })
    );
    await page.goto('/openlgu');

    const list = section(page);
    await expect(
      list.getByRole('heading', {
        name: "The council's ordinances could not be loaded",
      })
    ).toBeVisible();
    await expect(
      list.getByRole('link', { name: /council's ordinances page/i }).first()
    ).toHaveAttribute('href', councilFeed.pageUrl);
    await expect(list.getByRole('list')).toHaveCount(0);
  });
});
