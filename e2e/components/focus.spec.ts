import type { Page } from '@playwright/test';

import { test, expect } from '../test-config';
import { mockMeilisearch } from '../utils/meilisearch';

/**
 * Every control reached with Tab shows where focus is (WCAG 2.4.7). Walks the
 * tab order from the top of the page and reports any element whose focused
 * style draws neither an outline nor a ring (box-shadow). The skip link, as
 * the first stop, is covered by smoke.spec.ts.
 */

const STOPS = 40;

async function focusWithoutIndicator(page: Page): Promise<string[]> {
  const missing: string[] = [];
  for (let i = 0; i < STOPS; i++) {
    await page.keyboard.press('Tab');
    const read = () =>
      page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const style = getComputedStyle(el);
        const outline =
          style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
        const ring = style.boxShadow !== 'none';
        const label = (
          el.getAttribute('aria-label') ||
          el.textContent ||
          el.getAttribute('href') ||
          ''
        )
          .trim()
          .slice(0, 40);
        return {
          visible: outline || ring,
          name: `${el.tagName.toLowerCase()} "${label}"`,
        };
      });
    // Focus styles can transition in (transition-all covers outline and
    // box-shadow), so give each stop a moment to settle before judging it.
    let result = await read();
    for (let tries = 0; result && !result.visible && tries < 10; tries++) {
      await page.waitForTimeout(50);
      result = await read();
    }
    if (result && !result.visible) missing.push(result.name);
  }
  return [...new Set(missing)];
}

const routes = ['/', '/services', '/transparency/infrastructure'];

test.describe('Visible focus', () => {
  for (const path of routes) {
    test(`tab stops on ${path} show a focus indicator`, async ({ page }) => {
      await mockMeilisearch(page);
      await page.goto(path);
      await expect(
        page.getByRole('heading', { level: 1 }).first()
      ).toBeVisible();

      expect(await focusWithoutIndicator(page)).toEqual([]);
    });
  }
});
