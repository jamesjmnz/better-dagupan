import { test, expect } from '../test-config';
import { assertKapwaTokens } from '../utils/kapwa';

/**
 * The barangay index is the first dataset published under the Better Dagupan
 * name, so these tests cover two things at once: that the 31 verified records
 * reach the screen intact, and that everything the portal has NOT verified is
 * presented honestly rather than left blank or filled in.
 */

/** PSA PSGC, City of Dagupan (0105518000). */
const BARANGAY_COUNT = 31;

/**
 * Routes are lazy-loaded, so a bare goto() can leave assertions running
 * against the "Loading…" placeholder. These helpers wait for the real content.
 */
async function gotoIndex(page: import('@playwright/test').Page) {
  await page.goto('/government/barangays');
  await expect(
    page.locator('a[href*="/government/barangays/"]').first()
  ).toBeVisible();
}

async function gotoDetail(page: import('@playwright/test').Page, slug: string) {
  await page.goto(`/government/barangays/${slug}`);
  await expect(page.locator('header[role="banner"]')).toBeVisible();
}

test.describe('Barangays Pages', () => {
  test.beforeEach(async ({ page }) => {
    await gotoIndex(page);
  });

  test('barangays index page uses Kapwa semantic tokens', async ({ page }) => {
    await assertKapwaTokens(page, '#main-content');
  });

  test('barangays index displays every verified barangay', async ({ page }) => {
    const cards = page.locator('a[href*="/government/barangays/"]');
    await expect(cards).toHaveCount(BARANGAY_COUNT);

    const firstCard = cards.first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard).toHaveAttribute(
      'aria-label',
      /View the profile of/
    );
  });

  test('barangays index names its source and when it was verified', async ({
    page,
  }) => {
    const source = page.getByRole('link', {
      name: /PSGC — Barangays in the City of Dagupan/,
    });
    await expect(source).toBeVisible();
    await expect(source).toHaveAttribute('href', /psa\.gov\.ph/);

    await expect(page.getByText(/Last verified/).first()).toBeVisible();
  });

  test('Roman-numeral barangay names are not mangled', async ({ page }) => {
    // toTitleCase() would render these as "Barangay Ii" / "Barangay Iv".
    for (const name of ['Barangay I', 'Barangay II', 'Barangay IV']) {
      await expect(
        page.getByRole('heading', { name, exact: true }).first()
      ).toBeVisible();
    }

    const body = await page.locator('body').innerText();
    expect(body).not.toMatch(/Barangay Ii\b/);
    expect(body).not.toMatch(/Barangay Iv\b/);
  });

  test('barangays search works and matches other official spellings', async ({
    page,
  }) => {
    const allCards = page.locator('a[href*="/government/barangays/"]');
    await expect(allCards).toHaveCount(BARANGAY_COUNT);

    const searchInput = page.locator('input[placeholder*="Search"]');

    // A PSGC name.
    await searchInput.fill('Bonuan');
    await expect(allCards).toHaveCount(3);

    // The spelling the city government uses for the barangay PSGC calls
    // "Herrero" still has to find it.
    await searchInput.fill('Herrero-Perez');
    await expect(allCards).toHaveCount(1);
    await expect(
      page.getByRole('heading', { name: 'Herrero', exact: true })
    ).toBeVisible();

    await searchInput.fill('');
    await expect(allCards).toHaveCount(BARANGAY_COUNT);
  });

  test('barangay detail page uses semantic tokens', async ({ page }) => {
    await gotoDetail(page, 'bonuan-gueset');

    const header = page.locator('header[role="banner"]');
    await expect(header).toBeVisible();

    await assertKapwaTokens(page, '#main-content');
  });

  test('barangay detail page shows the verified PSGC record', async ({
    page,
  }) => {
    await gotoDetail(page, 'bonuan-gueset');

    const header = page.locator('header[role="banner"]');
    await expect(header.getByRole('heading', { level: 1 })).toHaveText(
      'Barangay Bonuan Gueset'
    );
    await expect(header).toContainText('0105518009');
    await expect(header).toContainText('24,943');
  });

  test('barangay detail page cites its source and verification date', async ({
    page,
  }) => {
    await gotoDetail(page, 'bonuan-gueset');

    await expect(
      page.getByText('Philippine Statistics Authority')
    ).toBeVisible();
    await expect(
      page.getByRole('link', {
        name: /PSGC — Barangays in the City of Dagupan/,
      })
    ).toHaveAttribute('href', /^https:\/\/psa\.gov\.ph\//);
    await expect(page.getByText(/Last verified/)).toBeVisible();
  });

  test('barangay detail page states that officials are not verified', async ({
    page,
  }) => {
    await gotoDetail(page, 'bonuan-gueset');

    await expect(
      page.getByText(/officials of this barangay are not published here yet/i)
    ).toBeVisible();
    // The reason is given, so an empty section does not read as neglect.
    await expect(page.getByText(/2018–2020 term/)).toBeVisible();
  });

  test('unknown details are not presented as established absences', async ({
    page,
  }) => {
    await gotoDetail(page, 'bonuan-gueset');

    await expect(page.getByText('No verified address')).toBeVisible();
    await expect(page.getByText('No verified contact number')).toBeVisible();

    const body = await page.locator('body').innerText();
    // The inherited wording claimed the barangay had no contact at all.
    expect(body).not.toMatch(/no contact listed/i);
    expect(body).not.toMatch(/awaiting data/i);
  });

  test('a differing spelling is labelled historical, not merely alternative', async ({
    page,
  }) => {
    await gotoDetail(page, 'barangay-ii');

    const header = page.locator('header[role="banner"]');
    await expect(header.getByRole('heading', { level: 1 })).toHaveText(
      'Barangay II'
    );

    // The period and the publisher must both be on screen, so the spelling
    // cannot be read as the current official name.
    await expect(header).toContainText(
      'Historical city-page spelling (2018–2020): Barangay II & III'
    );
    await expect(header).toContainText('City Government of Dagupan');
    await expect(header).toContainText(
      /not evidence of the current official name/i
    );

    // The superseded wording must not come back.
    await expect(header).not.toContainText(/also written as/i);
  });

  test('the historical city page is not cited as a source of the record', async ({
    page,
  }) => {
    await gotoDetail(page, 'barangay-ii');

    // Only the PSA backs the published fields. Listing the 2018-2020 page
    // among the sources would imply a superseded document supports the data.
    const sources = page.getByRole('region', { name: 'Source' });
    await expect(sources).toContainText('Philippine Statistics Authority');
    await expect(sources).not.toContainText('Barangay Captains');
  });

  test('the independent-project disclaimer stays visible', async ({ page }) => {
    await expect(
      page.getByText(/not the official website of the City Government/i).first()
    ).toBeVisible();
  });

  test('barangay detail page has breadcrumbs', async ({ page }) => {
    await gotoDetail(page, 'bonuan-gueset');

    const breadcrumb = page.locator('nav[aria-label="breadcrumb"]');
    await expect(breadcrumb).toBeVisible();
    // BreadcrumbHome renders an icon with no text, so match on the href.
    await expect(breadcrumb.locator('a[href="/"]')).toBeVisible();
    await expect(
      breadcrumb.locator('a[href="/government/barangays"]')
    ).toBeVisible();
    await expect(breadcrumb).toContainText('Bonuan Gueset');
  });

  test('the detail page does not duplicate the shell landmark', async ({
    page,
  }) => {
    await gotoDetail(page, 'bonuan-gueset');

    // The app shell owns #main-content and the skip link that targets it.
    // A second element with the same id makes the skip link ambiguous.
    await expect(page.locator('#main-content')).toHaveCount(1);
    await expect(page.locator('a[href="#main-content"]')).toHaveCount(1);
  });

  test('barangay card hover states work correctly', async ({ page }) => {
    const firstCard = page.locator('a[href*="/government/barangays/"]').first();

    await expect(firstCard).toHaveClass(/group/);
    await expect(firstCard.locator('svg').last()).toBeVisible();
    await expect(firstCard).toHaveAttribute(
      'aria-label',
      /View the profile of Barangay/
    );
  });

  test('sidebar navigation works on detail pages', async ({ page }) => {
    await gotoDetail(page, 'bonuan-gueset');

    // The layout collapses the sidebar on detail pages by design, so it is
    // present but hidden until the toggle is used.
    const sidebar = page.locator('aside').first();
    await expect(sidebar).toHaveCount(1);
    await expect(sidebar).toContainText('Bonuan Gueset');

    await page.getByRole('button', { name: /menu/i }).first().click();
    await expect(sidebar).toBeVisible();
  });

  test('barangays index page visual snapshot @visual', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('barangays-index.png', {
      maxDiffPixels: 150,
    });
  });

  test('barangays index page hero section visual snapshot @visual', async ({
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    const heroSection = page.locator('main').first();
    await expect(heroSection).toHaveScreenshot('barangays-hero.png', {
      maxDiffPixels: 100,
    });
  });

  test('barangay detail page visual snapshot @visual', async ({ page }) => {
    await gotoDetail(page, 'bonuan-gueset');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('barangay-detail.png', {
      maxDiffPixels: 150,
    });
  });
});
