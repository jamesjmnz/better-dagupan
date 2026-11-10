import { test, expect } from '../test-config';
import { ADMIN_CONTENT, gotoAdmin } from '../utils/admin';
import { assertKapwaTokens } from '../utils/kapwa';

test.describe('Admin Audit Log', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAdmin(page, '/admin/audit-logs');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Audit Logs' })
    ).toBeVisible();
  });

  test('audit log page uses Kapwa semantic tokens', async ({ page }) => {
    await assertKapwaTokens(page, ADMIN_CONTENT);
  });

  test('audit log shows an empty state with no entries', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'No audit logs found' })
    ).toBeVisible();
  });

  test('audit log has filter controls', async ({ page }) => {
    await expect(page.locator('input.kapwa-input').first()).toBeVisible();
  });

  test('audit log has refresh controls', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: 'Refresh', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Auto-refresh (On|Off)/ })
    ).toBeVisible();
  });

  test('audit log has navigation back to dashboard', async ({ page }) => {
    const breadcrumb = page.getByRole('navigation', { name: /breadcrumb/i });

    await expect(
      breadcrumb.getByRole('link', { name: 'Admin' })
    ).toHaveAttribute('href', '/admin');
    await expect(breadcrumb.getByText('Audit Logs')).toHaveAttribute(
      'aria-current',
      'page'
    );
  });
});
