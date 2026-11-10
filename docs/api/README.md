# Better Dagupan API Documentation

This directory documents the API endpoints served by Better Dagupan's Cloudflare
Pages Functions (`functions/`). Better Dagupan is an independent community
portal for the City of Dagupan; it is not the city government's website.

## Overview

Better Dagupan exposes three API categories:

- **Public APIs** - No authentication required, publicly accessible
- **Admin APIs** - GitHub OAuth authentication required, for administrative operations
- **OpenLGU API** - Public legislative data API for government transparency

## Base URL

All API endpoints are prefixed with `/api/`. Better Dagupan is not deployed yet
and has no production domain, so the examples below use a placeholder:

```
https://<your-pages-domain>/api/
```

Locally, `npm run functions:dev` serves the functions at
`http://localhost:8788/api/`.

## Current State

- **No D1 database is bound.** Every `/api/openlgu/*` endpoint answers
  `503 {"error": "legislative_data_unavailable"}` until one is, and the admin
  endpoints that read D1 cannot work either.
- **No KV namespace is bound.** `/api/weather` and the admin sign-in both need
  `WEATHER_KV`.

## Quick Start

### Public APIs (No Authentication)

1. **Weather API** - Get current weather and forecasts
   ```bash
   curl https://<your-pages-domain>/api/weather
   ```

2. **Contribution Flow** - Community contributions are submitted as [GitHub Issues](https://github.com/jamesjmnz/better-dagupan/issues/new?template=contribution.yml) using the contribution issue template (`.github/ISSUE_TEMPLATE/contribution.yml`). The `/contribute` page on the site links users directly to GitHub; there is no contribution endpoint.

### Admin APIs (Authentication Required)

All admin endpoints require GitHub OAuth authentication:

1. **Login** - Redirect to GitHub OAuth
   ```bash
   curl https://<your-pages-domain>/api/admin/auth/login
   ```

2. **Get Session** - Check authentication status
   ```bash
   curl https://<your-pages-domain>/api/admin/auth/session \
     -H "Cookie: admin_session=<your-session-cookie>"
   ```

3. **Make Authenticated Request** - Include session cookie in requests
   ```bash
   curl https://<your-pages-domain>/api/admin/documents \
     -H "Cookie: admin_session=<your-session-cookie>"
   ```

### OpenLGU API (Public Legislative Data)

There is no separate reference page yet. The handlers are in
`functions/api/openlgu/` (`documents.ts`, `persons.ts`, `sessions.ts`,
`sessions/[id].ts`, `committees.ts`, `terms.ts`), and the integration tests in
`functions/test/` describe their behaviour.

```bash
# Get documents
curl "https://<your-pages-domain>/api/openlgu/documents?limit=10"

# Get persons
curl "https://<your-pages-domain>/api/openlgu/persons?term=1"

# Get terms
curl https://<your-pages-domain>/api/openlgu/terms
```

---

## API Categories

### Public APIs

| API | Description | Authentication |
|-----|-------------|----------------|
| [Weather API](./weather-api.md) | Current weather and 3-hour forecast for Dagupan | None |
| OpenLGU API (`functions/api/openlgu/`) | Legislative documents, persons, terms, sessions, committees | None |

### Admin APIs

See [Admin API Overview](./admin/README.md) for authentication and common patterns.

| API | Description | Documentation |
|-----|-------------|----------------|
| Authentication | GitHub OAuth login, logout, session management | [Auth API](./admin/authentication.md) |
| Documents | CRUD operations for legislative documents | `functions/api/admin/documents/` |
| Review Queue | Manage data quality review workflow | `functions/api/admin/review-queue/` |
| Person Management | Merge duplicate persons, manage deletion queue | `functions/api/admin/persons-merge.ts`, `persons-deletion-queue.ts` |
| Data Reconciliation | Resolve conflicts between data sources | `functions/api/admin/reconcile.ts` |
| Audit Logging | Query audit logs for compliance and security | `functions/api/admin/audit-logs.ts` |
| Statistics | Dashboard statistics and activity feeds | `functions/api/admin/stats.ts`, `recent-activity.ts` |
| Review Workbench | Staged records and review decisions | [`functions/api/admin/workbench/README.md`](../../functions/api/admin/workbench/README.md) |

Only the authentication endpoints have a reference page; the others are
documented by their handlers.

---

## Common Patterns

### Authentication Pattern

All Admin APIs use the `withAuth()` wrapper from `functions/utils/admin-auth.ts`:

1. **GitHub OAuth Flow:**
   - User visits `/api/admin/auth/login` → Redirects to GitHub OAuth
   - GitHub redirects to `/api/admin/auth/callback` → Creates session
   - Session stored in Cloudflare KV (`WEATHER_KV`) with 24-hour expiry

2. **Session Cookie:**
   - After login, browser receives an `admin_session` cookie
   - Include this cookie in all subsequent admin requests

3. **Authentication Required:**
   ```typescript
   // Frontend example
   const response = await fetch('/api/admin/documents', {
     credentials: 'include', // sends the admin_session cookie
   });
   ```

### CSRF Protection Pattern

**All state-changing operations** (POST/PUT/PATCH/DELETE) require CSRF protection:

1. **Get CSRF Token:**
   ```bash
   curl https://<your-pages-domain>/api/admin/auth/csrf \
     -H "Cookie: admin_session=<your-session-cookie>"
   ```

   Response:
   ```json
   {
     "csrfToken": "uuid-v4-token"
   }
   ```

2. **Include CSRF Token in Request:**
   ```typescript
   const response = await fetch('/api/admin/documents', {
     method: 'POST',
     credentials: 'include',
     headers: {
       'Content-Type': 'application/json',
       'X-CSRF-Token': csrfToken,
     },
     body: JSON.stringify({ title: 'New Document' })
   });
   ```

3. **CSRF Token Properties:**
   - One-time use (consumed after validation)
   - 24-hour expiration
   - Stored in Cloudflare KV (`WEATHER_KV`)
   - Required for all non-GET requests to admin endpoints

### Audit Logging Pattern

All state-changing operations are logged for compliance and security:

```typescript
await logAudit(env, {
  action: AuditActions.CREATE_DOCUMENT,  // or custom string
  performedBy: context.auth.user.login,
  targetType: AuditTargetTypes.DOCUMENT,
  targetId: documentId,
  details: {
    title: 'Ordinance 001',
    type: 'ordinance',
    // Additional context about the action
  },
});
```

**Common Audit Actions:**
- `create_document`, `update_document`, `delete_document`
- `merge_persons`, `delete_person`, `update_attendance`
- `assign_review`, `update_review_status`
- `login`, `logout`, `login_failed`
- `reconcile_data`, `parse_facebook_post`

**View Audit Logs:**
```bash
curl "https://<your-pages-domain>/api/admin/audit-logs?action=create_document&limit=10" \
  -H "Cookie: admin_session=<your-session-cookie>"
```

### Response Patterns

**Success Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response:**
```json
{
  "error": "Error message"
}
```

**Pagination Response:**
```json
{
  "items": [...],
  "pagination": {
    "total": 150,
    "limit": 100,
    "offset": 0,
    "has_more": true
  }
}
```

### Error Handling

| HTTP Code | Meaning | Common Causes |
|-----------|---------|---------------|
| 200 | Success | Request completed successfully |
| 201 | Created | Resource created successfully |
| 204 | No Content | Delete operation successful |
| 400 | Bad Request | Validation error, malformed request |
| 401 | Unauthorized | Not logged in or session expired |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Duplicate resource, constraint violation |
| 415 | Unsupported Media Type | Wrong Content-Type header |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |
| 503 | Service Unavailable | OpenLGU endpoint called while no D1 database is bound |

---

## Environment Variables and Bindings

Bindings are declared in `wrangler.jsonc`; secrets are set in Cloudflare and,
for local development, in `.dev.vars` (copy `.dev.vars.example`).

### Bindings

| Name | Description | Used by |
|------|-------------|---------|
| `BETTERLB_DB` | D1 database binding (name inherited from the template) | OpenLGU and admin APIs |
| `WEATHER_KV` | KV namespace | Weather cache, admin sessions, OAuth state, CSRF tokens, rate limits |

Neither is bound yet in this repository.

### Required for Admin APIs

| Variable | Description | Example |
|----------|-------------|---------|
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID | `github_client_id` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret | `github_client_secret` |
| `AUTHORIZED_USERS` | JSON array of GitHub logins allowed to sign in (empty = nobody) | `["your-github-login"]` |
| `ADMIN_USERS`, `EDITOR_USERS` | JSON arrays assigning roles; anyone else is a viewer | `["your-github-login"]` |

### Required for Public APIs

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENWEATHERMAP_API_KEY` | OpenWeatherMap API key | `your_api_key` |

---

## Rate Limiting

### Public APIs

- **Weather API:** No rate limiting (cached in KV for 1 hour)
- **OpenLGU API:** 100 requests per minute per IP address, counted in KV

### Admin APIs

- Admin endpoints have no rate limit of their own; every request needs a valid
  session, and state-changing requests need a CSRF token
- Rate-limited OpenLGU responses include:
  - `X-RateLimit-Limit`: 100
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

**Rate Limit Response:**
```json
{
  "error": "Too many requests",
  "retryAfter": 45
}
```

---

## Caching Strategy

### Weather API

- **Cache Duration:** 1 hour (3,600 seconds)
- **Cache Key:** `WEATHER_KV:philippines_weather`
- **Auto-Update:** A scheduled handler refreshes the data (6-hour expiry)
- **Force Update:** Add `?update=true` to bypass cache

### OpenLGU API

- **Static Data (terms list):** 1 hour (3,600 seconds)
- **List Endpoints:** 15 minutes (900 seconds)
- **Detail Endpoints:** 5 minutes (300 seconds)
- **Count Endpoints:** 2 minutes (120 seconds)

### Admin APIs

- Most admin endpoints do not cache (real-time data)
- Session data cached for 24 hours in KV
- CSRF tokens cached for 24 hours in KV

---

## CORS Configuration

### Public APIs

Public APIs send CORS headers only to allowed origins:

- **Production:** `https://better-dagupan.pages.dev` (in `functions/index.ts`); no custom domain yet. `functions/api/weather.ts` keeps its own list, which has no production origin yet.
- **Development:** `http://localhost:5173`, `http://localhost:8788`

**CORS Headers:**
```
Access-Control-Allow-Origin: <origin>
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
Access-Control-Max-Age: 86400
```

### Admin APIs

Admin APIs require same-origin requests (no CORS for security).
All admin requests must come from the portal's own origin.

---

## SDK Examples

### TypeScript/JavaScript

**Public API (Weather):**
```typescript
const response = await fetch('https://<your-pages-domain>/api/weather');
const weather = await response.json();
console.log(weather.dagupan);
```

**Admin API (Authenticated):**
```typescript
// Login
window.location.href = 'https://<your-pages-domain>/api/admin/auth/login';

// After callback, make authenticated request
const response = await fetch('https://<your-pages-domain>/api/admin/documents', {
  credentials: 'include', // Include session cookie
});
const data = await response.json();
```

**Admin API (CSRF-Protected):**
```typescript
// Get CSRF token
const csrfResponse = await fetch('https://<your-pages-domain>/api/admin/auth/csrf', {
  credentials: 'include',
});
const { csrfToken } = await csrfResponse.json();

// Make CSRF-protected request
const response = await fetch('https://<your-pages-domain>/api/admin/documents', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken,
  },
  body: JSON.stringify({ title: 'New Document' }),
});
```

### Python

```python
import requests

# Public API
response = requests.get('https://<your-pages-domain>/api/weather')
weather = response.json()

# Admin API with session cookie
session = requests.Session()
session.cookies.set('admin_session', '<your-session-cookie>')

response = session.get('https://<your-pages-domain>/api/admin/documents')
documents = response.json()
```

---

## Testing

### Testing Public APIs

```bash
# Weather API
curl https://<your-pages-domain>/api/weather

# Weather API (specific city)
curl "https://<your-pages-domain>/api/weather?city=Dagupan"

# Weather API (force update)
curl "https://<your-pages-domain>/api/weather?update=true"

# OpenLGU API (503 until a D1 database is bound)
curl "https://<your-pages-domain>/api/openlgu/documents?limit=5"
```

### Testing Admin APIs

```bash
# 1. Login (opens browser)
# Navigate to: https://<your-pages-domain>/api/admin/auth/login

# 2. Get session cookie from browser dev tools
# Application > Cookies > admin_session

# 3. Test authenticated endpoint
curl https://<your-pages-domain>/api/admin/auth/session \
  -H "Cookie: admin_session=<your-session-cookie>"

# 4. Get CSRF token
curl https://<your-pages-domain>/api/admin/auth/csrf \
  -H "Cookie: admin_session=<your-session-cookie>"

# 5. Make CSRF-protected request
curl -X POST https://<your-pages-domain>/api/admin/documents \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: <csrf-token>" \
  -H "Cookie: admin_session=<your-session-cookie>" \
  -d '{"title":"Test Document","type":"ordinance"}'
```

---

## Support

- **Documentation:** See individual API documentation files
- **Issues:** [GitHub Issues](https://github.com/jamesjmnz/better-dagupan/issues)

---

**Last Updated:** 2026-11-10
**API Version:** 1.0.0
