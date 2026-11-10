import { test, expect } from '../test-config';
import { ADMIN_CONTENT, gotoAdmin } from '../utils/admin';
import { assertKapwaTokens } from '../utils/kapwa';

const EMPTY_STATE_HIDES_CONTROLS =
  'ErrorLog returns only its empty state when there are no errors, dropping the "Parse Errors" heading, stage filter and Refresh button.';

test.describe('Admin Error Log', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAdmin(page, '/admin/errors');
    await expect(
      page.getByRole('heading', { name: 'No errors found' })
    ).toBeVisible();
  });

  test('error log page uses Kapwa semantic tokens', async ({ page }) => {
    await assertKapwaTokens(page, ADMIN_CONTENT);
  });

  test('error log shows an empty state when nothing failed', async ({
    page,
  }) => {
    await expect(
      page.getByText('All documents processed successfully!')
    ).toBeVisible();
  });

  test('error log has filter controls', async ({ page }) => {
    test.fixme(true, EMPTY_STATE_HIDES_CONTROLS);
    await expect(page.getByRole('combobox').first()).toBeVisible();
  });

  test('error log has refresh button', async ({ page }) => {
    test.fixme(true, EMPTY_STATE_HIDES_CONTROLS);
    await expect(page.getByRole('button', { name: /Refresh/ })).toBeVisible();
  });

  test('error log has navigation back to dashboard', async ({ page }) => {
    const breadcrumb = page.getByRole('navigation', { name: /breadcrumb/i });

    await expect(
      breadcrumb.getByRole('link', { name: 'Admin' })
    ).toHaveAttribute('href', '/admin');
    await expect(breadcrumb.getByText('Error Log')).toHaveAttribute(
      'aria-current',
      'page'
    );
  });
});
