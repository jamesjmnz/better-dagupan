import { test, expect } from '../test-config';
import { expectNoAxeViolations } from '../utils/axe';

/**
 * The mobile menu and its per-section submenus are disclosures: each toggle
 * has a name, reports its state with aria-expanded, points at what it opens
 * with aria-controls, and works from the keyboard alone.
 */
test.describe('Navbar mobile disclosures', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
  });

  test('the menu button opens and closes the menu from the keyboard', async ({
    page,
  }) => {
    const toggle = page.getByRole('button', { name: 'Toggle Menu' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toHaveAttribute('aria-controls', 'mobile-menu');

    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#mobile-menu')).toBeVisible();

    await page.keyboard.press('Space');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#mobile-menu')).toHaveCount(0);
  });

  test('each submenu toggle is a named disclosure', async ({
    page,
    browserName,
  }) => {
    await page.getByRole('button', { name: 'Toggle Menu' }).click();

    const toggle = page.getByRole('button', { name: 'Government submenu' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    const controls = await toggle.getAttribute('aria-controls');
    expect(controls).toBeTruthy();

    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const submenu = page.locator(`[id="${controls}"]`);
    await expect(
      submenu.getByRole('link', { name: 'Elected Officials' })
    ).toBeVisible();

    // The submenu follows its toggle in the tab order. (WebKit leaves links
    // out of the tab order unless the reader turns on full keyboard access.)
    if (browserName !== 'webkit') {
      await page.keyboard.press('Tab');
      await expect(submenu.getByRole('link').first()).toBeFocused();
    }

    await toggle.focus();
    await page.keyboard.press('Space');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(submenu).toHaveCount(0);
  });

  test('the open menu has no WCAG A/AA violations @a11y', async ({ page }) => {
    await page.getByRole('button', { name: 'Toggle Menu' }).click();
    await page.getByRole('button', { name: 'Services submenu' }).click();
    await expect(
      page.getByRole('button', { name: 'Services submenu' })
    ).toHaveAttribute('aria-expanded', 'true');

    await expectNoAxeViolations(page);
  });
});
