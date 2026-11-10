# Cloudflare Pages Functions

Serverless backend functions deployed on Cloudflare Pages. These functions handle API requests, data fetching, and caching for Better Dagupan.

## Overview

The backend is built using Cloudflare Pages Functions, which provide:
- Edge computing (global distribution)
- Automatic HTTPS
- KV storage for caching
- D1 (SQLite) for legislative data
- TypeScript support

Better Dagupan is not deployed yet. `wrangler.jsonc` binds no KV namespace and
no D1 database, so the endpoints below that need them cannot serve data until
those resources are created. Endpoint reference pages live in
[`docs/api/`](../docs/api/README.md).

---

## Layout

```
functions/
├── index.ts          # Workers entry: CORS, security headers, scheduled weather export
├── weather.ts        # Weather read straight from KV
├── types.ts          # Env interface (KV, D1 bindings, secrets)
├── api/
│   ├── weather.ts    # /api/weather
│   ├── openlgu/      # /api/openlgu/* — public legislative data
│   └── admin/        # /api/admin/* — GitHub OAuth admin API and review workbench
├── utils/            # withAuth, RBAC, CSRF, rate limiting, caching, audit log
└── test/             # Integration test utilities and fixtures
```

---

## Functions

### `/api/weather`

Current weather and a 3-hour forecast from OpenWeatherMap, cached in KV.

**Method:** `GET`

**Query Parameters:**
- `city` (optional) — case-insensitive city name; defaults to every configured city
- `update=true` (optional) — bypass the cache

The city is set by `DEFAULT_CITY` in `functions/api/weather.ts` (Dagupan,
`16.0433, 120.3333`). It is not read from `config/lgu.config.json`.

**Response:** an object keyed by city, for example `{ "dagupan": { ... } }`. See
[`docs/api/weather-api.md`](../docs/api/weather-api.md) for the full shape.

**Caching:**
- Responses are cached in `WEATHER_KV` under `philippines_weather` for 1 hour
- The scheduled handler writes the same key with a 6-hour expiry

**Implementation:** `functions/api/weather.ts`

---

### `/api/openlgu/*`

Public legislative data: `documents`, `persons`, `sessions`, `sessions/:id`,
`committees`, and `terms`, read from the `BETTERLB_DB` D1 database.

`functions/api/openlgu/_middleware.ts` answers every request with
`503 {"error": "legislative_data_unavailable"}` while `BETTERLB_DB` is not
bound, which is the case today. The OpenLGU pages show that the records are not
published yet.

---

### `/api/admin/*`

GitHub OAuth sign-in, legislative document management, the review queue, and
the review workbench. See [`docs/api/admin/README.md`](../docs/api/admin/README.md)
and [`api/admin/workbench/README.md`](./api/admin/workbench/README.md).

---

## Bindings

| Binding | Type | Used for |
|---|---|---|
| `WEATHER_KV` | KV namespace | Weather cache, admin sessions, OAuth state, CSRF tokens, rate-limit counters |
| `BETTERLB_DB` | D1 database | OpenLGU legislative data and the admin API (binding name inherited from the template) |

Add them to `wrangler.jsonc` once Better Dagupan's own resources exist. Never
bind another LGU's database.

---

## Local Development

### Running Locally

```bash
# Terminal 1: the Vite dev server on port 5173
npm run dev

# Terminal 2: wrangler pages dev, proxying to Vite
npm run functions:dev
```

Wrangler serves the app and the functions at `http://localhost:8788`.

### Environment Variables

Copy `.dev.vars.example` to `.dev.vars` (gitignored); Wrangler loads it
automatically. It covers the admin sign-in:

```env
GITHUB_CLIENT_ID=your_dev_oauth_client_id
GITHUB_CLIENT_SECRET=your_dev_oauth_client_secret
AUTHORIZED_USERS=["your-github-login"]
ADMIN_USERS=["your-github-login"]
```

For the weather endpoint, also set:

```env
OPENWEATHERMAP_API_KEY=your_api_key_here
```

---

## Deployment

### Automatic Deployment

`.github/workflows/deploy.yml` builds the site and runs
`wrangler pages deploy dist --project-name=better-dagupan`. The deploy job is
skipped until the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repository
secrets are set.

### Manual Deployment

```bash
npm run build
npx wrangler pages deploy dist --project-name=better-dagupan
```

---

## Error Handling

Functions return JSON error responses:

```json
{
  "error": "Error message"
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Server Error
- `503` - Service Unavailable (for example, no D1 database bound)

---

## CORS Configuration

CORS headers are sent only to allowed origins. `functions/index.ts` allows
`https://better-dagupan.pages.dev` and the local dev servers;
`functions/api/weather.ts` keeps its own list with only the local dev servers.
Add the production domain to both once one is assigned.

```typescript
'Access-Control-Allow-Origin': origin,
'Access-Control-Allow-Methods': 'GET, OPTIONS',
'Access-Control-Allow-Headers': 'Content-Type',
'Access-Control-Max-Age': '86400',
```

---

## Monitoring

### Logs

View function logs in Cloudflare Dashboard:
1. Go to Pages project
2. Click on "Functions" tab
3. View real-time logs

### Analytics

Monitor:
- Request count
- Response times
- Error rates
- KV read/write operations

---

## Security

### API Keys

API keys are stored as environment variables:
- Never commit keys to Git
- Use `.dev.vars` for local development
- Use Cloudflare environment variables and secrets for production

### Rate Limiting

The public OpenLGU endpoints are limited to 100 requests per minute per client,
counted in KV (`functions/utils/rate-limit.ts`). The weather endpoint has no
rate limit of its own.

---

## Adding New Functions

1. Create a new file in `functions/api/`:
   ```bash
   touch functions/api/new-endpoint.ts
   ```

2. Export an `onRequest` handler (or `onRequestGet`, `onRequestPost`, …):
   ```typescript
   import type { Env } from '../types';

   export async function onRequest(context: { request: Request; env: Env }) {
     return Response.json({ ok: true });
   }
   ```

3. Test locally:
   ```bash
   npm run functions:dev
   curl http://localhost:8788/api/new-endpoint
   ```

---

## Related Documentation

- [Cloudflare Pages Functions Docs](https://developers.cloudflare.com/pages/functions/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [KV Storage](https://developers.cloudflare.com/kv/)
- [D1](https://developers.cloudflare.com/d1/)
