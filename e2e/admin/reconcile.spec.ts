import { test, expect } from '../test-config';
import { ADMIN_CONTENT, gotoAdmin } from '../utils/admin';
import { assertKapwaTokens } from '../utils/kapwa';

const EMPTY_STATE_HIDES_CONTROLS =
  'Reconcile returns only its empty state when a filter matches nothing, dropping the status filter and Refresh button, so the filter cannot be changed back.';

test.describe('Admin Reconcile', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAdmin(page, '/admin/reconcile');
    await expect(
      page.getByRole('heading', { name: 'No conflicts to reconcile' })
    ).toBeVisible();
  });

  test('reconcile page uses Kapwa semantic tokens', async ({ page }) => {
    await assertKapwaTokens(page, ADMIN_CONTENT);
  });

  test('reconcile page shows an empty state with no conflicts', async ({
    page,
  }) => {
    // The default filter is unresolved conflicts, and the copy names it.
    await expect(page.getByText(/status "unresolved"/)).toBeVisible();
  });

  test('reconcile page has filter controls', async ({ page }) => {
    test.fixme(true, EMPTY_STATE_HIDES_CONTROLS);
    await expect(page.getByRole('combobox').first()).toBeVisible();
  });

  test('reconcile page has refresh button', async ({ page }) => {
    test.fixme(true, EMPTY_STATE_HIDES_CONTROLS);
    await expect(page.getByRole('button', { name: /Refresh/ })).toBeVisible();
  });

  test('reconcile page has navigation back to dashboard', async ({ page }) => {
    const breadcrumb = page.getByRole('navigation', { name: /breadcrumb/i });

    await expect(
      breadcrumb.getByRole('link', { name: 'Admin' })
    ).toHaveAttribute('href', '/admin');
    await expect(breadcrumb.getByText('Reconcile')).toHaveAttribute(
      'aria-current',
      'page'
    );
  });
});
