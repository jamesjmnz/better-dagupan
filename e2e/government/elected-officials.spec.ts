import { test, expect } from '../test-config';
import { assertKapwaTokens } from '../utils/kapwa';

/**
 * The elected officials are published from the city's pages, the council's
 * own site and the COMELEC results data, with each name required on two
 * independent source families. These tests cover what reaches the screen: the
 * corroborated names with their citations, the council under its correct name
 * for a component city, and the details deliberately withheld, which must read
 * as withheld rather than as absent.
 *
 * Every content assertion is unconditional. The previous version of this file
 * guarded its contact checks behind `if (hasPhone)`, so it went on passing
 * while the page rendered no officials at all.
 */
const MAYOR = 'Belen T. Fernandez';
const VICE_MAYOR = 'Dean Bryan L. Kua';
const COUNCIL = 'Sangguniang Panlungsod';
const COUNCIL_SIZE = 12;

type Page = import('@playwright/test').Page;

/** Routes are lazy-loaded; wait for real content, not the placeholder. */
async function gotoIndex(page: Page) {
  await page.goto('/government/elected-officials');
  await expect(
    page.getByRole('heading', { name: `Hon. ${MAYOR}` })
  ).toBeVisible();
}

async function gotoCommittees(page: Page) {
  await page.goto('/government/elected-officials/committees');
  await expect(
    page
      .locator('#layout-content')
      .getByRole('heading', { name: 'Standing Committees', level: 1 })
  ).toBeVisible();
}

test.describe('Elected Officials Pages', () => {
  test('elected officials index page uses Kapwa semantic tokens', async ({
    page,
  }) => {
    await gotoIndex(page);
    await assertKapwaTokens(page, '#layout-content');
  });

  test('the executive branch names the mayor and vice mayor', async ({
    page,
  }) => {
    await gotoIndex(page);

    const content = page.locator('#layout-content');
    await expect(
      content.getByText('City Mayor', { exact: true }).first()
    ).toBeVisible();
    await expect(
      content.getByRole('heading', { name: `Hon. ${VICE_MAYOR}` })
    ).toBeVisible();
    await expect(
      content.getByText('City Vice Mayor', { exact: true }).first()
    ).toBeVisible();
    await expect(content.getByText('Term 2025–2028').first()).toBeVisible();
  });

  test('the council is the Sangguniang Panlungsod, never a Sangguniang Bayan', async ({
    page,
  }) => {
    await gotoIndex(page);

    const content = page.locator('#layout-content');
    await expect(
      content.getByRole('heading', { name: COUNCIL, level: 2 })
    ).toBeVisible();
    await expect(page.getByText(/Sangguniang Bayan/)).toHaveCount(0);

    // The vice mayor presides; the council lists its twelve members.
    await expect(
      content.getByText(`Hon. ${VICE_MAYOR}, City Vice Mayor`)
    ).toBeVisible();
    await expect(
      content.getByText('10 elected councilors and 2 ex-officio members.', {
        exact: false,
      })
    ).toBeVisible();
    await expect(content.getByText('Councilor', { exact: true })).toHaveCount(
      COUNCIL_SIZE
    );
  });

  test('member names render as the council prints them', async ({ page }) => {
    await gotoIndex(page);

    // toTitleCase() used to turn these into "Dv." and "Iv".
    const content = page.locator('#layout-content');
    await expect(
      content.getByRole('heading', { name: 'Marvin DV. Fabia' })
    ).toBeVisible();
    await expect(
      content.getByRole('heading', { name: 'Karlos Liberato E. Reyna IV' })
    ).toBeVisible();
  });

  test('ex-officio seats say which presidency they follow and that the term is unverified', async ({
    page,
  }) => {
    await gotoIndex(page);

    const content = page.locator('#layout-content');
    await expect(
      content.getByText('Ex officio · Liga ng mga Barangay President')
    ).toBeVisible();
    await expect(
      content.getByText('Ex officio · SK Federation President')
    ).toBeVisible();
    await expect(content.getByText('Term not verified')).toHaveCount(2);
  });

  test('every section names its sources and when they were verified', async ({
    page,
  }) => {
    await gotoIndex(page);

    const citations = page
      .locator('#layout-content')
      .getByRole('region', { name: /Sources|Source/ });
    // One per executive card, one for the council.
    await expect(citations).toHaveCount(3);

    const council = citations.last();
    await expect(
      council.getByRole('link', { name: 'Councilors' })
    ).toHaveAttribute('href', /sp\.dagupan\.gov\.ph/);
    await expect(
      council.getByRole('link', { name: /2025 NLE Results/ })
    ).toHaveAttribute('href', /comelec\.gov\.ph/);
    await expect(page.getByText(/Last verified/).first()).toBeVisible();
  });

  test('no contact detail is published for an official', async ({ page }) => {
    await gotoIndex(page);

    const content = page.locator('#layout-content');
    await expect(content.locator('a[href^="tel:"]')).toHaveCount(0);
    await expect(content.locator('a[href^="mailto:"]')).toHaveCount(0);
    await expect(
      content.getByText('No verified contact for this official')
    ).toHaveCount(2);
  });

  test('committees link navigates to the committees page', async ({ page }) => {
    await gotoIndex(page);

    await expect(
      page.getByText('Committee assignments are not published here yet.')
    ).toBeVisible();

    await page
      .locator('#layout-content')
      .getByRole('link', { name: /View committees/i })
      .click();
    await page.waitForURL(/\/government\/elected-officials\/committees/);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('committees page uses semantic tokens', async ({ page }) => {
    await gotoCommittees(page);
    await assertKapwaTokens(page, '#layout-content');
  });

  test('committees page explains why no assignments are shown', async ({
    page,
  }) => {
    await gotoCommittees(page);

    await expect(
      page.getByText('Committee assignments are not published here yet.')
    ).toBeVisible();
    await expect(
      page.getByText(/disagree about who chairs some committees/)
    ).toBeVisible();

    // There is nothing to search until assignments are published.
    await expect(page.locator('input[placeholder*="Search"]')).toHaveCount(0);
    await expect(page.getByText(/Sangguniang Bayan/)).toHaveCount(0);
  });

  test('the sidebar is labelled for a city, not a municipality', async ({
    page,
  }) => {
    await gotoIndex(page);

    await expect(page.getByText('Municipal Government')).toHaveCount(0);
    await expect(page.getByText('City of Dagupan').first()).toBeVisible();
  });

  test('the index renders in Filipino when the language is switched', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('i18nextLng', 'fil');
    });
    await page.goto('/government/elected-officials');

    const content = page.locator('#layout-content');
    await expect(
      content.getByRole('heading', { name: `Kgg. ${MAYOR}` })
    ).toBeVisible();
    await expect(
      content.getByRole('heading', {
        name: 'Mga Nahalal na Opisyal',
        level: 1,
      })
    ).toBeVisible();
    await expect(
      content.getByText('Hindi pa naberipika ang termino')
    ).toHaveCount(2);
  });

  test('elected officials index page has breadcrumbs', async ({ page }) => {
    await gotoIndex(page);

    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
    await expect(breadcrumb).toBeVisible();
    await expect(
      breadcrumb.locator('a').filter({ hasText: /Government/i })
    ).toBeVisible();
  });

  test('elected officials index page visual snapshot @visual', async ({
    page,
  }) => {
    await gotoIndex(page);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('elected-officials-index.png', {
      maxDiffPixels: 150,
    });
  });

  test('elected officials index page hero section visual snapshot @visual', async ({
    page,
  }) => {
    await gotoIndex(page);
    await page.waitForLoadState('networkidle');
    const heroSection = page.locator('main').first();
    await expect(heroSection).toHaveScreenshot('elected-officials-hero.png', {
      maxDiffPixels: 100,
    });
  });

  test('committees page visual snapshot @visual', async ({ page }) => {
    await gotoCommittees(page);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('elected-officials-committees.png', {
      maxDiffPixels: 150,
    });
  });
});
