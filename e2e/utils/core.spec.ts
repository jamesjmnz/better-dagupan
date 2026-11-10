import { expect, test } from '../test-config';
import { readData } from './data';

/**
 * Cross-cutting sanity checks. WCAG coverage lives in e2e/a11y.spec.ts, which
 * scans every key route with axe instead of the two this file used to.
 */
const services = readData<unknown[]>('citizens-charter/merged-services.json');
const departments = readData<{ slug: string; office_name: string }[]>(
  'directory/departments.json'
);

test.describe('Better Dagupan Sanity Suite', () => {
  // RULE 2: Search Logic (Ensures the JSON-to-UI bridge isn't broken)
  test('search functionality should filter services', async ({ page }) => {
    await page.goto('/services');
    const searchInput = page.getByPlaceholder(/Search for services/i);
    await searchInput.fill('Business');
    await expect(page).toHaveURL(/search=Business/);

    const content = page.locator('#layout-content');
    if (services.length === 0) {
      // Nothing is published to search through, and the page says so.
      await expect(
        content.getByRole('heading', { name: 'Not yet available' })
      ).toBeVisible();
    } else {
      await expect(
        content
          .locator('[data-testid="service-card"]')
          .or(content.getByRole('heading', { name: 'No services found' }))
          .first()
      ).toBeVisible();
    }
  });

  // RULE 3: Navigation & Breadcrumbs (Ensures the site "Flow" works)
  test('directory navigation should be intact', async ({ page }) => {
    const engineering = departments.find(dept =>
      /Engineer/i.test(dept.office_name)
    );
    expect(
      engineering,
      'departments.json lists an engineering office'
    ).toBeDefined();

    await page.goto('/government/departments');
    await page
      .locator(
        `#layout-content a[href="/government/departments/${engineering!.slug}"]`
      )
      .click();

    await expect(page).toHaveURL(
      new RegExp(`/government/departments/${engineering!.slug}$`)
    );
    // Ensure the Breadcrumb component is working
    await expect(
      page.getByRole('navigation', { name: /breadcrumb/i })
    ).toBeVisible();
  });

  // RULE 4: Touch Targets (Ensures mobile users and people with motor impairments can use the site)
  test('interactive elements must meet 44px target size', async ({ page }) => {
    await page.goto('/');
    const primaryLinks = page.locator('a.group, button');
    await expect(primaryLinks.first()).toBeVisible();
    const box = await primaryLinks.first().boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });
});
