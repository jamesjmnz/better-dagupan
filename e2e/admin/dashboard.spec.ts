import { test, expect } from '../test-config';
import { ADMIN_CONTENT, gotoAdmin } from '../utils/admin';
import { assertKapwaTokens } from '../utils/kapwa';

test.describe('Admin access', () => {
  test('signed-out visitors get the sign-in gate, not admin data', async ({
    page,
  }) => {
    // No session mock: whatever /api/admin/auth/session returns here (the
    // shared fixture's canned body in CI, or a dev-server miss locally) is not
    // an authenticated session.
    await page.goto('/admin');

    await expect(
      page.getByRole('heading', { name: 'Admin Access Required' })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Sign in with GitHub' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Admin Dashboard' })
    ).toHaveCount(0);
  });
});

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAdmin(page, '/admin');
  });

  test('admin dashboard uses Kapwa semantic tokens', async ({ page }) => {
    test.fixme(
      true,
      'The pinned @bettergov/kapwa Button outline variant (Refresh) renders raw border-gray-300/text-gray-700 classes.'
    );
    await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();
    await assertKapwaTokens(page, ADMIN_CONTENT);
  });

  test('admin dashboard displays stat cards', async ({ page }) => {
    // Every stat card links to the page that explains its number.
    for (const [title, href] of [
      ['Failed Parses', '/admin/errors'],
      ['Review Queue', '/admin/review-queue'],
      ['Reconcile', '/admin/reconcile'],
      ['Documents', '/admin/documents'],
    ]) {
      const card = page.locator(`a[href="${href}"]`).filter({
        has: page.getByRole('heading', { level: 3, name: title }),
      });
      await expect(card).toBeVisible();
      // The pipeline is empty, so each count is zero rather than a placeholder.
      await expect(card.getByText('0', { exact: true })).toBeVisible();
    }
  });

  test('admin dashboard has navigation links', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Quick Actions' })
    ).toBeVisible();
    for (const href of [
      '/admin/documents',
      '/admin/review-queue',
      '/admin/errors',
      '/admin/reconcile',
    ]) {
      await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible();
    }
  });

  test('admin dashboard is accessible', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      /Admin Dashboard/
    );
    await expect(
      page.getByRole('button', { name: 'Refresh' }).first()
    ).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: /breadcrumb/i })
    ).toBeVisible();
  });
});
