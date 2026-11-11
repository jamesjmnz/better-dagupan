import { test, expect } from '../test-config';
import { assertKapwaTokens } from '../utils/kapwa';

/**
 * The office directory is published from three official city rosters that
 * contradict each other, so these tests cover two things at once: that the 34
 * verified offices reach the screen intact, and that the seven heads the
 * portal deliberately withholds are presented as withheld rather than as
 * offices that simply have no leader.
 *
 * Every assertion here is unconditional. The previous version of this file
 * guarded each content check behind an `if (hasContact)`, which meant it went
 * on passing for as long as the dataset was empty.
 */
const DEPARTMENT_COUNT = 34;

/** Official pages name a different person for this office, so none is shown. */
const CONFLICTING_HEAD_SLUG = 'one-stop-business-center';
/** The rosters disagreed here until a dated city article settled it. */
const SETTLED_HEAD_SLUG = 'city-health-office';
/** Only one page family names anyone here. */
const UNCORROBORATED_HEAD_SLUG = 'bids-and-awards-committee';
/** Both page families agree on this one, so the name is published. */
const PUBLISHED_HEAD_SLUG = 'city-legal-office';

/**
 * Routes are lazy-loaded, so a bare goto() can leave assertions running
 * against the "Loading…" placeholder. These helpers wait for the real content.
 */
async function gotoIndex(page: import('@playwright/test').Page) {
  await page.goto('/government/departments');
  await expect(
    page.locator('a[href*="/government/departments/"]').first()
  ).toBeVisible();
}

async function gotoDetail(page: import('@playwright/test').Page, slug: string) {
  await page.goto(`/government/departments/${slug}`);
  // The identity header is a Card with role="banner", not a <header> element,
  // so match on the role rather than the tag.
  await expect(
    page.locator('[role="banner"][aria-label]').first()
  ).toBeVisible();
}

test.describe('Departments Pages', () => {
  test('departments index page uses Kapwa semantic tokens', async ({
    page,
  }) => {
    await gotoIndex(page);
    await assertKapwaTokens(page, '#main-content');
  });

  test('departments index displays every verified office', async ({ page }) => {
    await gotoIndex(page);

    const cards = page.locator('a[href*="/government/departments/"]');
    await expect(cards).toHaveCount(DEPARTMENT_COUNT);

    const firstCard = cards.first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard).toHaveAttribute('aria-label', /View details for/);
  });

  test('departments index names its sources and when they were verified', async ({
    page,
  }) => {
    await gotoIndex(page);

    const citation = page.getByRole('region', { name: /Sources|Source/ });
    await expect(citation).toBeVisible();

    // The city's own pages are the authority for its offices.
    await expect(
      citation.getByRole('link', { name: /Directory/ }).first()
    ).toHaveAttribute('href', /dagupan\.gov\.ph/);
    await expect(page.getByText(/Last verified/).first()).toBeVisible();
  });

  test('departments search matches the alternate office names', async ({
    page,
  }) => {
    await gotoIndex(page);

    const cards = page.locator('a[href*="/government/departments/"]');
    const searchInput = page.locator('input[placeholder*="Search"]');

    await searchInput.fill('Treasury');
    await expect(cards).toHaveCount(1);

    // "City Engineering Office" is the name the older roster uses; the record
    // is published as "City Engineer's Office" and must still be findable.
    await searchInput.fill('City Engineering Office');
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toHaveAttribute(
      'href',
      /city-engineers-office/
    );

    await searchInput.fill('nothing matches this');
    await expect(cards).toHaveCount(0);
    await expect(page.getByText(/No office name matches/)).toBeVisible();
  });

  test('an office page is titled with the office name', async ({ page }) => {
    await gotoDetail(page, 'city-health-office');
    await expect(page).toHaveTitle(/^City Health Office \| /);
  });

  test('an office with an agreed head shows the name and its citation', async ({
    page,
  }) => {
    await gotoDetail(page, PUBLISHED_HEAD_SLUG);

    await expect(
      page.getByRole('heading', { name: 'Aurora E. Valle' })
    ).toBeVisible();

    // The head is a separate claim from the office, so it carries its own
    // citation rather than sheltering under the office's.
    const citations = page.getByRole('region', { name: /Sources|Source/ });
    await expect(citations).toHaveCount(2);
  });

  test('an office whose sources disagree says so instead of naming a head', async ({
    page,
  }) => {
    await gotoDetail(page, CONFLICTING_HEAD_SLUG);

    await expect(
      page.getByText(/head of this office is not published here yet/)
    ).toBeVisible();
    await expect(
      page.getByText(/names a different person for this office/)
    ).toBeVisible();

    // Neither contested name may appear anywhere on the page.
    await expect(page.getByText(/Ngilay/)).toHaveCount(0);

    // The office itself is still published, with its corroborated numbers.
    await expect(
      page.getByRole('heading', { name: 'One-Stop Business Center' })
    ).toBeVisible();
    await expect(page.getByText('(075) 649-6951')).toBeVisible();
  });

  test('a conflict settled by a dated article names the head and cites it', async ({
    page,
  }) => {
    await gotoDetail(page, SETTLED_HEAD_SLUG);

    await expect(
      page.getByRole('heading', { name: 'Ma. Julita P. De Venecia' })
    ).toBeVisible();

    // The head carries its own citation, which includes the dated article.
    const citations = page.getByRole('region', { name: /Sources|Source/ });
    await expect(citations).toHaveCount(2);
    await expect(
      citations.last().getByRole('link', { name: /World Teachers/ })
    ).toHaveAttribute('href', /dagupan\.gov\.ph/);

    // The older roster's name is not shown.
    await expect(page.getByText(/Ophelia/)).toHaveCount(0);
    await expect(page.getByText('(075) 522-8206')).toBeVisible();
  });

  test('the committee shows the address and number its own notices give', async ({
    page,
  }) => {
    await gotoDetail(page, UNCORROBORATED_HEAD_SLUG);

    await expect(
      page.getByText(/BAC Office, 2nd Floor, City Hall Complex/)
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: '0917-855-3267' })
    ).toHaveAttribute('href', 'tel:+639178553267');
    // Its two published emails disagree, so neither is shown.
    await expect(page.getByText(/bacdagupan|asi_aaron/)).toHaveCount(0);
  });

  test('the council office links to the council website', async ({ page }) => {
    await gotoDetail(page, 'sangguniang-panlungsod');

    await expect(
      page.getByRole('link', { name: 'Website', exact: true })
    ).toHaveAttribute('href', 'https://sp.dagupan.gov.ph/');
    await expect(page.getByText('No verified address').first()).toBeVisible();
  });

  test('an office named by only one source says why the head is withheld', async ({
    page,
  }) => {
    await gotoDetail(page, UNCORROBORATED_HEAD_SLUG);

    await expect(
      page.getByText(/Only one official city page names anyone/)
    ).toBeVisible();
    await expect(page.getByText(/Arenas/)).toHaveCount(0);
  });

  test('an office with no verified contact says so rather than showing a blank', async ({
    page,
  }) => {
    // The General Services Office has an email on one page and a phone on
    // another, so the corroboration rule leaves it with neither.
    await gotoDetail(page, 'general-services-office');

    await expect(
      page.getByText('No verified contact number').first()
    ).toBeVisible();
    await expect(page.getByText('No verified address').first()).toBeVisible();
    await expect(
      page.getByText('No verified email or website').first()
    ).toBeVisible();
    // Never the bare "No contact", which would assert the office has none.
    await expect(page.getByText(/^No contact$/)).toHaveCount(0);
  });

  test('the detail page claims no mandate the sources do not support', async ({
    page,
  }) => {
    await gotoDetail(page, PUBLISHED_HEAD_SLUG);

    // A fabricated "Office Mandate" paragraph used to render for every office,
    // carrying the inherited LGU's slogan.
    await expect(page.getByText(/Office Mandate/)).toHaveCount(0);
    await expect(page.getByText(/Science and Nature City/)).toHaveCount(0);
    await expect(page.getByText(/frontline office/)).toHaveCount(0);
  });

  test('the detail page has breadcrumbs back to the index', async ({
    page,
  }) => {
    await gotoDetail(page, PUBLISHED_HEAD_SLUG);

    const breadcrumb = page.getByRole('navigation', { name: /breadcrumb/i });
    await expect(breadcrumb).toBeVisible();
    // BreadcrumbHome renders an icon with no text, so match on the href.
    await expect(breadcrumb.locator('a[href="/"]')).toBeVisible();
    await expect(breadcrumb).toContainText('City Legal Office');

    await breadcrumb.locator('a[href="/government/departments"]').click();
    await expect(page).toHaveURL(/\/government\/departments$/);
  });

  test('the detail page declares exactly one main landmark', async ({
    page,
  }) => {
    await gotoDetail(page, PUBLISHED_HEAD_SLUG);

    // The page used to declare its own <main id='main-content'> and skip link
    // on top of the ones the app shell already provides.
    await expect(page.locator('#main-content')).toHaveCount(1);
    await expect(page.locator('a[href="#main-content"]')).toHaveCount(1);
  });

  test('an unknown office slug reports that it was not found', async ({
    page,
  }) => {
    await page.goto('/government/departments/not-a-real-office');
    await expect(page.getByRole('alert')).toContainText(/not found/i);
  });

  test('the index renders in Filipino when the language is switched', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('i18nextLng', 'fil');
    });
    await gotoIndex(page);

    // The title also appears in the nav and the sidebar, so scope to the page.
    await expect(
      page
        .locator('#layout-content')
        .getByRole('heading', { name: 'Mga Kagawaran ng Lungsod', level: 1 })
    ).toBeVisible();
    await expect(page.getByText(/opisina ng/).first()).toBeVisible();
  });

  test('a withheld head is explained in Filipino too', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('i18nextLng', 'fil');
    });
    await gotoDetail(page, CONFLICTING_HEAD_SLUG);

    await expect(
      page.getByText(/Hindi pa inilalathala rito ang pinuno/)
    ).toBeVisible();
    await expect(page.getByText(/Ngilay/)).toHaveCount(0);
  });

  test('departments index page visual snapshot @visual', async ({ page }) => {
    await gotoIndex(page);
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('departments-index.png', {
      maxDiffPixels: 150,
    });
  });

  test('departments index page hero section visual snapshot @visual', async ({
    page,
  }) => {
    await gotoIndex(page);
    await page.waitForLoadState('networkidle');

    const heroSection = page.locator('main').first();
    await expect(heroSection).toHaveScreenshot('departments-hero.png', {
      maxDiffPixels: 100,
    });
  });

  test('department detail page visual snapshot @visual', async ({ page }) => {
    await gotoDetail(page, PUBLISHED_HEAD_SLUG);
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('department-detail.png', {
      maxDiffPixels: 150,
    });
  });
});
