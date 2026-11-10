import { expect, type Page } from '@playwright/test';

/**
 * The admin area sits behind GitHub OAuth (AdminAuthProvider), and the Pages
 * Functions that back it do not run under the Vite dev server. Without a
 * session every /admin route renders the "Admin Access Required" gate, which
 * is what the admin specs used to run against while asserting dashboard
 * content.
 *
 * signInAsReviewer() answers the session check as an authenticated reviewer
 * and every admin endpoint with an empty, well-formed response, so a spec can
 * exercise the real admin UI with no records in it. It registers its routes
 * after the shared fixture's, so they take precedence.
 */

export const REVIEWER = {
  id: 1,
  login: 'e2e-reviewer',
  name: 'E2E Reviewer',
  email: null,
  // A data URL, so the navbar avatar neither hits the network nor gets src=''.
  avatar_url: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=',
};

/** One body that satisfies every admin list endpoint's response shape. */
const EMPTY_LIST = {
  items: [],
  logs: [],
  errors: [],
  documents: [],
  pagination: {
    page: 1,
    limit: 20,
    offset: 0,
    total: 0,
    totalPages: 0,
    has_more: false,
  },
};

const ZERO_STATS = {
  review_queue: { total: 0, pending: 0, in_progress: 0, resolved: 0 },
  documents: { total: 0, pending_review: 0, processed: 0 },
  errors: { total: 0, recent: 0 },
  conflicts: { active: 0 },
  deletion_queue: { total: 0 },
};

const json = (body: unknown) => ({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify(body),
});

export async function signInAsReviewer(page: Page): Promise<void> {
  // Most general first: Playwright runs the last matching handler first.
  await page.route('**/api/admin/**', route => route.fulfill(json(EMPTY_LIST)));
  await page.route('**/api/admin/stats**', route =>
    route.fulfill(json(ZERO_STATS))
  );
  await page.route('**/api/admin/auth/session**', route =>
    route.fulfill(json({ authenticated: true, user: REVIEWER }))
  );
}

/**
 * The admin layout's content column, below the navbar and session bar. Those
 * render @bettergov/kapwa Buttons whose ghost variant ships raw gray-* classes,
 * which is the library's markup rather than this portal's, so Kapwa token
 * checks are scoped to the content the admin pages own.
 */
export const ADMIN_CONTENT = '#main-content div.w-full.max-w-7xl.py-8';

/** Open an admin route as a signed-in reviewer and wait for the layout. */
export async function gotoAdmin(page: Page, path: string): Promise<void> {
  await signInAsReviewer(page);
  await page.goto(path);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Admin Dashboard' })
  ).toBeVisible();
}
