import { describe, expect, it } from 'vitest';

import {
  buildReportEmailUrl,
  buildReportErrorPath,
  buildReportIssueUrl,
  normalizeReportedPage,
  REPORT_ERROR_PATH,
} from './reportError';

const GITHUB = 'https://github.com/example/portal';

describe('normalizeReportedPage', () => {
  it('accepts a plain same-site path', () => {
    expect(normalizeReportedPage('/government/departments/x')).toBe(
      '/government/departments/x'
    );
  });

  it('drops the query string and fragment', () => {
    expect(normalizeReportedPage('/services?q=permit#top')).toBe('/services');
  });

  it.each([
    null,
    undefined,
    '',
    'government/departments',
    'https://evil.example/phish',
    '//evil.example/phish',
    'javascript:alert(1)',
    '/\\evil.example',
    '/line\nbreak',
    `/${'a'.repeat(400)}`,
  ])('rejects %j', value => {
    expect(normalizeReportedPage(value)).toBeNull();
  });
});

describe('buildReportErrorPath', () => {
  it('carries the current path as the page parameter', () => {
    expect(buildReportErrorPath('/government/barangays/bonuan-gueset')).toBe(
      '/report-an-error?page=%2Fgovernment%2Fbarangays%2Fbonuan-gueset'
    );
  });

  it('falls back to the bare page for an unusable path', () => {
    expect(buildReportErrorPath('https://evil.example')).toBe(
      REPORT_ERROR_PATH
    );
    expect(buildReportErrorPath(REPORT_ERROR_PATH)).toBe(REPORT_ERROR_PATH);
  });
});

describe('buildReportIssueUrl', () => {
  it('opens the correction issue form', () => {
    expect(buildReportIssueUrl(GITHUB)).toBe(
      `${GITHUB}/issues/new?template=incorrect-civic-info.yml`
    );
  });

  it('tolerates a trailing slash on the repository URL', () => {
    expect(buildReportIssueUrl(`${GITHUB}/`)).toBe(
      `${GITHUB}/issues/new?template=incorrect-civic-info.yml`
    );
  });

  it('pre-fills the page URL field with the full page URL', () => {
    const url = new URL(
      buildReportIssueUrl(
        GITHUB,
        '/government/departments/city-legal-office',
        'https://portal.example/'
      )
    );

    expect(url.pathname).toBe('/example/portal/issues/new');
    expect(url.searchParams.get('template')).toBe('incorrect-civic-info.yml');
    expect(url.searchParams.get('page-url')).toBe(
      'https://portal.example/government/departments/city-legal-office'
    );
  });

  it('pre-fills the bare path when no origin is known', () => {
    const url = new URL(buildReportIssueUrl(GITHUB, '/services'));
    expect(url.searchParams.get('page-url')).toBe('/services');
  });

  it('leaves the field empty for an unsafe page value', () => {
    const url = new URL(buildReportIssueUrl(GITHUB, '//evil.example'));
    expect(url.searchParams.has('page-url')).toBe(false);
  });
});

describe('buildReportEmailUrl', () => {
  it('pre-fills only an encoded subject', () => {
    expect(
      buildReportEmailUrl('team@example.org', 'Data correction: /services')
    ).toBe(
      'mailto:team@example.org?subject=Data%20correction%3A%20%2Fservices'
    );
  });
});
