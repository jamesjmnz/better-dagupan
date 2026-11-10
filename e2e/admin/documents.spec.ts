import { test, expect } from '../test-config';
import { ADMIN_CONTENT, gotoAdmin } from '../utils/admin';
import { assertKapwaTokens } from '../utils/kapwa';

test.describe('Admin Documents Page', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAdmin(page, '/admin/documents');
    await expect(
      page.getByRole('heading', { level: 2, name: 'Documents Management' })
    ).toBeVisible();
  });

  test('documents page uses Kapwa semantic tokens', async ({ page }) => {
    test.fixme(
      true,
      'The pinned @bettergov/kapwa Button outline variant (Refresh) renders raw border-gray-300/text-gray-700 classes.'
    );
    await assertKapwaTokens(page, ADMIN_CONTENT);
  });

  test('documents page shows filters and an empty state', async ({ page }) => {
    await expect(
      page.getByRole('textbox', { name: 'Search by number or title...' })
    ).toBeVisible();
    for (const option of ['All Types', 'All Statuses', 'All Review States']) {
      await expect(
        page.getByRole('combobox').filter({ hasText: option })
      ).toBeVisible();
    }

    // The mocked pipeline holds no documents.
    await expect(page.getByText('0 total documents')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'No documents found' })
    ).toBeVisible();
  });

  test('documents page has refresh and import actions', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Refresh' })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Import from Facebook' })
    ).toBeVisible();
  });
});
