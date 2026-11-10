import { test, expect } from '../test-config';
import { ADMIN_CONTENT, gotoAdmin } from '../utils/admin';
import { assertKapwaTokens } from '../utils/kapwa';

test.describe('Admin Review Queue Page', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAdmin(page, '/admin/review-queue');
  });

  test('review queue page uses Kapwa semantic tokens', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'No items in review queue' })
    ).toBeVisible();
    await assertKapwaTokens(page, ADMIN_CONTENT);
  });

  test('review queue page shows empty state when no items', async ({
    page,
  }) => {
    await expect(
      page.getByRole('heading', { name: 'No items in review queue' })
    ).toBeVisible();
    // The default filter is pending items, and the copy names it.
    await expect(page.getByText(/status "pending"/)).toBeVisible();
  });

  test('review queue page is accessible', async ({ page }) => {
    const breadcrumb = page.getByRole('navigation', { name: /breadcrumb/i });

    await expect(
      breadcrumb.getByRole('link', { name: 'Admin' })
    ).toHaveAttribute('href', '/admin');
    await expect(breadcrumb.getByText('Review Queue')).toHaveAttribute(
      'aria-current',
      'page'
    );
  });
});
