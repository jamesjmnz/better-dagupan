import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Bring SidebarLayout's sidebar (src/components/layout/SidebarLayout.tsx) into
 * view on any viewport, and return it.
 *
 * Below the md breakpoint the sidebar folds behind the layout's own "Menu"
 * disclosure, which is not the navbar's "Toggle Menu" button. On wider
 * screens it is shown, unless a collapsible layout starts collapsed (section
 * detail pages do), in which case "Expand Menu" brings it back. Tests that
 * assert on sidebar contents call this first so they run on the mobile
 * projects too, instead of failing on a sidebar that is hidden by design.
 */
export async function openSidebar(page: Page): Promise<Locator> {
  const sidebar = page.locator('#layout-sidebar');
  await expect(sidebar).toBeAttached();

  const disclosure = page.locator('button[aria-controls="layout-sidebar"]');
  if (await disclosure.isVisible()) {
    if ((await disclosure.getAttribute('aria-expanded')) !== 'true') {
      await disclosure.click();
    }
    await expect(disclosure).toHaveAttribute('aria-expanded', 'true');
  } else {
    // Only exposed to the accessibility tree while the sidebar is collapsed.
    const expand = page.getByRole('button', { name: 'Expand Menu' });
    if (await expand.isVisible()) {
      await expand.click();
    }
  }

  await expect(sidebar).toBeVisible();
  return sidebar;
}
