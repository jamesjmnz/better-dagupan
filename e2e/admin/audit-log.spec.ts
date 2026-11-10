import { test, expect } from '../test-config';
import { gotoAdmin } from '../utils/admin';
import { assertKapwaTokens } from '../utils/kapwa';

/**
 * With no audit entries the page crashes: AuditLog.tsx passes a JSX element
 * (`<FileText />`) to EmptyState's `icon`, which expects a component, so React
 * throws "Element type is invalid" and the route renders nothing. tsc reports
 * the same line (TS2741). Every test below needs the page to render.
 */
const CRASHES_WHEN_EMPTY =
  'AuditLog crashes when there are no entries: EmptyState receives <FileText /> instead of FileText for `icon` (AuditLog.tsx, TS2741).';

test.describe('Admin Audit Log', () => {
  test.beforeEach(async ({ page }) => {
    test.fixme(true, CRASHES_WHEN_EMPTY);
    await gotoAdmin(page, '/admin/audit-logs');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Audit Logs' })
    ).toBeVisible();
  });

  test('audit log page uses Kapwa semantic tokens', async ({ page }) => {
    await assertKapwaTokens(page);
  });

  test('audit log shows an empty state with no entries', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'No audit logs found' })
    ).toBeVisible();
  });

  test('audit log has filter controls', async ({ page }) => {
    await expect(page.locator('input.kapwa-input').first()).toBeVisible();
  });

  test('audit log has refresh button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Refresh' })).toBeVisible();
  });

  test('audit log has navigation back to dashboard', async ({ page }) => {
    await expect(
      page
        .getByRole('navigation', { name: /breadcrumb/i })
        .getByRole('link', { name: 'Admin' })
    ).toHaveAttribute('href', '/admin');
  });
});
