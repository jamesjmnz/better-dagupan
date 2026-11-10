import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

/** WCAG 2.0 Level A and AA: the bar this portal commits to. */
export const WCAG_TAGS = ['wcag2a', 'wcag2aa'];

export interface AxeOptions {
  /**
   * Rules to skip for this page. Every entry needs a comment at the call site
   * saying why it cannot be fixed yet; an exclusion is a tracked debt, not a
   * pass.
   */
  disableRules?: string[];
}

/**
 * Run axe against the current page and fail with a readable summary: one line
 * per violated rule with the selectors it hit, instead of a deep-equality diff
 * of axe's raw result objects.
 */
export async function expectNoAxeViolations(
  page: Page,
  { disableRules = [] }: AxeOptions = {}
): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(WCAG_TAGS)
    .disableRules(disableRules)
    .analyze();

  const summary = results.violations.map(violation => {
    const targets = violation.nodes
      .slice(0, 5)
      .map(node => node.target.join(' '))
      .join(', ');
    const more =
      violation.nodes.length > 5
        ? ` (+${violation.nodes.length - 5} more)`
        : '';
    return `${violation.id} [${violation.impact}] ${violation.help}: ${targets}${more}`;
  });

  expect(summary, `axe violations on ${page.url()}`).toEqual([]);
}
