import { expect, type Page } from '@playwright/test';

/**
 * Assert that the page uses Kapwa design system semantic tokens
 * and does not contain raw Tailwind color classes.
 *
 * Note: Checks main content area only, excluding Navbar/Footer and code examples (<pre> tags).
 *
 * `scope` defaults to '#main-content', the single main landmark App.tsx
 * renders around every route. A bare 'main' is ambiguous on pages that render
 * their own <main> inside it, such as the home page.
 *
 * Routes are lazy-loaded, so the scope first holds the Suspense fallback.
 * The positive checks poll until the route has rendered instead of reading
 * whatever happens to be there when the helper is called.
 */
export async function assertKapwaTokens(
  page: Page,
  scope = '#main-content'
): Promise<void> {
  const readMainHTML = async () =>
    // Remove <pre> tag contents (code examples that may show "wrong" usage as examples)
    (await page.locator(scope).innerHTML()).replace(
      /<pre[^>]*>[\s\S]*?<\/pre>/gi,
      ''
    );

  // Positive: Kapwa semantic tokens should be present
  await expect
    .poll(readMainHTML, { message: `${scope} uses Kapwa text tokens` })
    .toMatch(/text-kapwa-text-/);
  await expect
    .poll(readMainHTML, { message: `${scope} uses Kapwa background tokens` })
    .toMatch(/bg-kapwa-bg-/);
  await expect
    .poll(readMainHTML, { message: `${scope} uses Kapwa border tokens` })
    .toMatch(/border-kapwa-border-/);

  // Negative: no raw Tailwind color classes in main content (excluding code examples)
  const mainHTML = await readMainHTML();
  expect(mainHTML).not.toMatch(/text-(slate|gray|blue|green|red|yellow)-\d+/);
  expect(mainHTML).not.toMatch(/bg-(slate|gray|blue|green|red|yellow)-\d+/);
  expect(mainHTML).not.toMatch(/border-(slate|gray|blue|green|red|yellow)-\d+/);
}
