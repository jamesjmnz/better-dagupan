import type { Page } from '@playwright/test';

import { test, expect } from '../test-config';

/**
 * SidebarLayout (src/components/layout/SidebarLayout.tsx), exercised through
 * the services index, which renders it with a collapsible sidebar.
 *
 * Locators go through roles and the toggle's aria-controls rather than bare
 * `aside`/`button` selectors: the layout also renders "Hide Menu" and
 * "Expand Menu" buttons, and the page can hold other landmarks.
 */

const MOBILE = { width: 375, height: 667 };
const DESKTOP = { width: 1280, height: 720 };

const menuToggle = (page: Page) =>
  page.getByRole('button', { name: 'Menu', exact: true });

const sidebar = (page: Page) => page.locator('#layout-sidebar');

async function openServices(page: Page, viewport: typeof MOBILE) {
  await page.setViewportSize(viewport);
  await page.goto('/services');
  // The content panel renders with the layout, so its presence means the
  // lazy route has mounted.
  await expect(page.locator('#layout-content')).toBeVisible();
}

test.describe('SidebarLayout Component', () => {
  test.describe('Mobile Responsiveness', () => {
    test('mobile menu button is visible on mobile viewport', async ({
      page,
    }) => {
      await openServices(page, MOBILE);

      await expect(menuToggle(page)).toBeVisible();
      await expect(menuToggle(page)).toHaveAttribute(
        'aria-controls',
        'layout-sidebar'
      );
    });

    test('mobile menu button is hidden on desktop viewport', async ({
      page,
    }) => {
      await openServices(page, DESKTOP);

      await expect(menuToggle(page)).toBeHidden();
    });

    test('sidebar is hidden by default on mobile', async ({ page }) => {
      await openServices(page, MOBILE);

      await expect(menuToggle(page)).toHaveAttribute('aria-expanded', 'false');
      await expect(sidebar(page)).toBeHidden();
    });

    test('sidebar is visible on desktop by default', async ({ page }) => {
      await openServices(page, DESKTOP);

      await expect(sidebar(page)).toBeVisible();
      await expect(
        sidebar(page).getByRole('heading', { name: 'Categories' })
      ).toBeVisible();
    });

    test('toggling mobile menu shows and hides sidebar', async ({ page }) => {
      await openServices(page, MOBILE);
      const toggle = menuToggle(page);

      await expect(sidebar(page)).toBeHidden();

      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await expect(sidebar(page)).toBeVisible();

      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await expect(sidebar(page)).toBeHidden();
    });

    test('mobile menu button swaps its icon with the menu state', async ({
      page,
    }) => {
      await openServices(page, MOBILE);
      const toggle = menuToggle(page);

      // lucide-react tags each icon with a lucide-<name> class.
      await expect(toggle.locator('svg.lucide-menu')).toBeVisible();
      await expect(toggle.locator('svg.lucide-x')).toHaveCount(0);

      await toggle.click();

      await expect(toggle.locator('svg.lucide-x')).toBeVisible();
      await expect(toggle.locator('svg.lucide-menu')).toHaveCount(0);
    });

    test('sidebar uses correct width classes on desktop', async ({ page }) => {
      await openServices(page, DESKTOP);
      await expect(sidebar(page)).toBeVisible();

      // The width transitions in, so poll until it settles in range.
      await expect
        .poll(async () => (await sidebar(page).boundingBox())?.width ?? 0)
        .toBeGreaterThan(200);
      const box = await sidebar(page).boundingBox();
      expect(box!.width).toBeLessThan(400);
    });

    test('sidebar content is accessible on mobile when menu is open', async ({
      page,
    }) => {
      await openServices(page, MOBILE);
      await menuToggle(page).click();

      const categories = sidebar(page).getByRole('navigation', {
        name: 'Categories',
      });
      await expect(categories).toBeVisible();
      await expect(
        categories.getByRole('button', { name: 'All Services' })
      ).toBeVisible();
      await expect(
        sidebar(page).getByRole('link', { name: 'Suggest New Service' })
      ).toBeVisible();
    });

    test('main content area is always visible regardless of viewport', async ({
      page,
    }) => {
      await openServices(page, MOBILE);
      await expect(page.locator('#layout-content')).toBeVisible();

      await page.setViewportSize(DESKTOP);
      await expect(page.locator('#layout-content')).toBeVisible();
    });

    test('the layout renders a single main landmark', async ({ page }) => {
      await openServices(page, DESKTOP);

      // App.tsx owns the page's main landmark; the layout must not nest one.
      await expect(page.getByRole('main')).toHaveCount(1);
      await expect(page.getByRole('complementary')).toHaveCount(1);
    });

    test('sidebar uses Kapwa semantic tokens', async ({ page }) => {
      await openServices(page, DESKTOP);
      await expect(sidebar(page)).toBeVisible();

      const sidebarHTML = await sidebar(page).innerHTML();
      expect(sidebarHTML).toMatch(/kapwa/);
    });

    test('mobile menu button has accessible styling', async ({ page }) => {
      await openServices(page, MOBILE);
      const toggle = menuToggle(page);
      await expect(toggle).toBeVisible();

      // Touch target minimum.
      const box = await toggle.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    });

    test('sidebar collapse/expand works on desktop when collapsible', async ({
      page,
    }) => {
      await openServices(page, DESKTOP);
      const hide = page.getByRole('button', { name: 'Hide Menu' });
      const expand = page.getByRole('button', { name: 'Expand Menu' });

      await expect(hide).toBeVisible();
      await hide.click();

      // Collapsed: the sidebar shrinks to nothing and the expand control
      // becomes the only way back.
      await expect
        .poll(async () => (await sidebar(page).boundingBox())?.width ?? 0)
        .toBeLessThan(1);
      await expect(expand).toBeVisible();

      await expand.click();
      await expect
        .poll(async () => (await sidebar(page).boundingBox())?.width ?? 0)
        .toBeGreaterThan(200);
    });

    test('the expand control is out of the tab order while expanded', async ({
      page,
    }) => {
      await openServices(page, DESKTOP);

      // Invisible (opacity 0) while the sidebar is open, so it must not take
      // keyboard focus either.
      const expand = page.locator('button[title="Expand Menu"]');
      await expect(expand).toHaveAttribute('tabindex', '-1');
      await expect(expand).toHaveAttribute('aria-hidden', 'true');

      // Once the sidebar collapses it is the way back, so it rejoins both.
      await page.getByRole('button', { name: 'Hide Menu' }).click();
      await expect(expand).not.toHaveAttribute('tabindex', '-1');
      await expect(
        page.getByRole('button', { name: 'Expand Menu' })
      ).toBeVisible();
    });

    test('layout adapts to different screen sizes', async ({ page }) => {
      await openServices(page, MOBILE);

      const viewports = [
        MOBILE,
        { width: 768, height: 1024 }, // Tablet
        DESKTOP,
        { width: 1920, height: 1080 }, // Large Desktop
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);

        const content = page.locator('#layout-content');
        await expect(content).toBeVisible();

        // No horizontal overflow at any breakpoint.
        const box = await content.boundingBox();
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1);
      }
    });

    test('sidebar maintains functionality across breakpoints', async ({
      page,
    }) => {
      await openServices(page, MOBILE);
      await menuToggle(page).click();

      const category = sidebar(page).getByRole('button', {
        name: 'Health & Wellness',
      });
      await category.click();

      await expect(page).toHaveURL(/category=health-wellness/);
      await expect(category).toHaveAttribute('aria-current', 'page');

      // Growing to desktop keeps the sidebar and the selection.
      await page.setViewportSize(DESKTOP);
      await expect(sidebar(page)).toBeVisible();
      await expect(category).toHaveAttribute('aria-current', 'page');
    });
  });

  test.describe('Accessibility', () => {
    test('mobile menu button is keyboard accessible', async ({ page }) => {
      await openServices(page, MOBILE);
      const toggle = menuToggle(page);

      // Reachable through the tab order, not only by clicking.
      let reached = false;
      for (let i = 0; i < 40 && !reached; i++) {
        await page.keyboard.press('Tab');
        reached = await toggle.evaluate(el => el === document.activeElement);
      }
      expect(reached, 'Tab reaches the menu toggle').toBe(true);

      await page.keyboard.press('Enter');
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await expect(sidebar(page)).toBeVisible();

      await page.keyboard.press('Space');
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    });

    test('sidebar links are accessible when menu is open on mobile', async ({
      page,
    }) => {
      await openServices(page, MOBILE);
      const toggle = menuToggle(page);
      await toggle.focus();
      await page.keyboard.press('Enter');
      await expect(sidebar(page)).toBeVisible();

      // The next stop after the toggle is inside the sidebar it opened.
      await page.keyboard.press('Tab');
      const focusedInSidebar = await sidebar(page).evaluate(el =>
        el.contains(document.activeElement)
      );
      expect(focusedInSidebar).toBe(true);
    });
  });
});
