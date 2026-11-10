import { test, expect } from '../test-config';
import { readData } from '../utils/data';

/**
 * The competitiveness page publishes DTI's CMCI scores per edition. These
 * checks cover what makes them trustworthy rather than how they are drawn:
 * the citation, the per-year DTI links, and the breakdown DTI's own figures
 * do not support. Chart rendering is covered by charts.spec.ts.
 */
interface Edition {
  year: number;
  overall_score: number;
  sources: string[];
}
const { editions } = readData<{ editions: Edition[] }>('statistics/cmci.json');
const latest = editions[editions.length - 1];

test.describe('Competitiveness provenance', () => {
  test.skip(!latest, 'No verified CMCI scores (cmci.json) yet.');

  test.beforeEach(async ({ page }) => {
    await page.goto('/statistics/competitiveness');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Competitiveness' })
    ).toBeVisible();
  });

  test('shows the latest edition and cites DTI for it', async ({ page }) => {
    const content = page.locator('#layout-content');

    await expect(
      content.getByRole('button', { name: String(latest?.year) })
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(content).toContainText(String(latest?.overall_score));

    const note = content.getByRole('region', { name: /^Sources?$/ });
    await expect(note).toContainText('Department of Trade and Industry');
    await expect(note.getByRole('link').first()).toHaveAttribute(
      'href',
      /^https:\/\/cmci\.dti\.gov\.ph\/lgu-profile\.php\?lgu=Dagupan/
    );
    await expect(note).toContainText(/Last verified/);
  });

  test('links every edition to its own DTI profile', async ({ page }) => {
    const table = page.locator('#layout-content table');

    await expect(table.locator('tbody tr')).toHaveCount(editions.length);
    for (const edition of editions) {
      await expect(
        table.getByRole('link', { name: `Profile, ${edition.year}` })
      ).toHaveAttribute('href', /cmci\.dti\.gov\.ph\/lgu-profile\.php/);
    }
  });

  test('withholds the 2014 breakdown DTI does not add up', async ({ page }) => {
    const content = page.locator('#layout-content');

    await content.getByRole('button', { name: '2014', exact: true }).click();
    await content.getByRole('button', { name: /pillars/i }).click();
    await content
      .getByRole('button', { name: /Government Efficiency/ })
      .click();

    await expect(content).toContainText(
      'Indicator scores withheld for this pillar'
    );
    // The pillar score itself is still published.
    await expect(content).toContainText('17.3893');
  });
});
