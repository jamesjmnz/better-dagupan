/**
 * URL helpers for the "report incorrect information" flow.
 *
 * Corrections are filed as public GitHub issues through an issue form, so the
 * portal needs no backend and collects no personal data. The only value the
 * portal ever pre-fills is the path of the page being reported.
 */

/** Route of the page that explains how corrections work. */
export const REPORT_ERROR_PATH = '/report-an-error';

/** File name of the issue form in `.github/ISSUE_TEMPLATE/`. */
export const REPORT_ERROR_TEMPLATE = 'incorrect-civic-info.yml';

/** `id` of the page URL field in that issue form. */
export const REPORT_ERROR_PAGE_FIELD = 'page-url';

/** Longest path accepted for pre-filling; anything longer is dropped. */
const MAX_PAGE_LENGTH = 300;

/**
 * Reduce a reported page to a same-site path, or `null` if it is not one.
 *
 * The value arrives in a query string anyone can edit, so it is accepted only
 * when it is a plain path on this portal. Absolute URLs, protocol-relative
 * `//host` URLs and control characters are rejected rather than repaired, and
 * any query string or fragment is removed so filters and search terms are not
 * carried into a public issue.
 */
export function normalizeReportedPage(
  raw: string | null | undefined
): string | null {
  if (!raw) return null;

  const path = raw.trim().split(/[?#]/)[0];

  if (!path.startsWith('/') || path.startsWith('//')) return null;
  if (path.length > MAX_PAGE_LENGTH) return null;
  // eslint-disable-next-line no-control-regex -- rejecting control characters is the point
  if (/[\u0000-\u001f\u007f\\]/.test(path)) return null;

  return path;
}

/** Link from a page on the portal to the report-an-error page. */
export function buildReportErrorPath(currentPath: string): string {
  const page = normalizeReportedPage(currentPath);
  if (!page || page === REPORT_ERROR_PATH) return REPORT_ERROR_PATH;
  return `${REPORT_ERROR_PATH}?${new URLSearchParams({ page }).toString()}`;
}

/**
 * Link that opens the correction issue form on GitHub.
 *
 * GitHub issue forms accept a query parameter named after a field `id` to
 * pre-fill that field. When a valid page is given it is written into the page
 * URL field, as a full URL when the portal's origin is known.
 */
export function buildReportIssueUrl(
  githubUrl: string,
  page?: string | null,
  origin?: string
): string {
  const params = new URLSearchParams({ template: REPORT_ERROR_TEMPLATE });
  const path = normalizeReportedPage(page);

  if (path) {
    const base = origin?.replace(/\/+$/, '') ?? '';
    params.set(REPORT_ERROR_PAGE_FIELD, `${base}${path}`);
  }

  return `${githubUrl.replace(/\/+$/, '')}/issues/new?${params.toString()}`;
}

/**
 * Plain `mailto:` link for people without a GitHub account.
 *
 * Only a subject is pre-filled. The body is left to the sender so the portal
 * never places anything about them into the message.
 */
export function buildReportEmailUrl(email: string, subject: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}
