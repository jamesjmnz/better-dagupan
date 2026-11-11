import { readFileSync } from 'node:fs';

import { expect, test } from './test-config';

const { contactEmail } = JSON.parse(
  readFileSync(new URL('../config/lgu.config.json', import.meta.url), 'utf8')
).portal as { contactEmail: string };

/**
 * Readers report a wrong civic fact through a public GitHub issue form; the
 * portal has no backend for it. These tests cover the links that get them
 * there: the report-an-error page itself, the page URL it carries into the
 * form, and the entry point beside every citation.
 */
const ISSUE_FORM = /\/issues\/new\?template=incorrect-civic-info\.yml/;
const DEPARTMENT_PATH = '/government/departments/city-legal-office';

test.describe('Report an error', () => {
  test('the page explains corrections and links to the issue form @smoke', async ({
    page,
  }) => {
    await page.goto('/report-an-error');

    await expect(
      page.getByRole('heading', { level: 1, name: 'Report an error' })
    ).toBeVisible();
    await expect(page.getByText(/primary government source/)).toBeVisible();

    const github = page.getByTestId('report-error-github');
    await expect(github).toHaveAttribute('href', ISSUE_FORM);
    await expect(github).toHaveAttribute('target', '_blank');
    // Nothing is pre-filled when no page was reported.
    expect(await github.getAttribute('href')).not.toContain('page-url=');
  });

  test('a reported page is carried into the issue form', async ({ page }) => {
    await page.goto(
      `/report-an-error?page=${encodeURIComponent(DEPARTMENT_PATH)}`
    );

    await expect(page.getByTestId('reported-page')).toHaveText(DEPARTMENT_PATH);

    const href = await page
      .getByTestId('report-error-github')
      .getAttribute('href');
    const url = new URL(href ?? '');
    expect(url.searchParams.get('template')).toBe('incorrect-civic-info.yml');
    expect(url.searchParams.get('page-url')).toMatch(
      new RegExp(`^https?://[^/]+${DEPARTMENT_PATH}$`)
    );
  });

  test('a page value that is not a portal path is ignored', async ({
    page,
  }) => {
    await page.goto(
      `/report-an-error?page=${encodeURIComponent('https://evil.example/x')}`
    );

    await expect(page.getByTestId('reported-page')).toHaveCount(0);
    expect(
      await page.getByTestId('report-error-github').getAttribute('href')
    ).not.toContain('page-url=');
  });

  test('the email fallback appears only when an address is configured', async ({
    page,
  }) => {
    await page.goto('/report-an-error');
    await expect(page.getByTestId('report-error-github')).toBeVisible();

    const email = page.getByTestId('report-error-email');
    if (!contactEmail) {
      await expect(email).toHaveCount(0);
      return;
    }
    // When present it pre-fills only a subject.
    expect(await email.getAttribute('href')).toMatch(
      /^mailto:[^?]+\?subject=[^&]+$/
    );
  });

  test('a citation links to the report page for its own page', async ({
    page,
  }) => {
    await page.goto(DEPARTMENT_PATH);

    const link = page
      .getByRole('region', { name: /Sources|Source/ })
      .first()
      .getByRole('link', { name: 'Report an error in this information' });

    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute(
      'href',
      `/report-an-error?page=${encodeURIComponent(DEPARTMENT_PATH)}`
    );

    await link.click();
    await expect(page).toHaveURL(/\/report-an-error\?page=/);
    await expect(page.getByTestId('reported-page')).toHaveText(DEPARTMENT_PATH);
  });
});
