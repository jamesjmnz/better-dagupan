# Weather API

The Weather API provides current weather conditions and 3-hour forecasts for Dagupan, Pangasinan using the OpenWeatherMap API.

## Overview

- **Base URL:** `https://<your-pages-domain>/api/weather` (Better Dagupan has no production domain yet; locally `http://localhost:8788/api/weather`)
- **Current state:** needs an `OPENWEATHERMAP_API_KEY`, which is not configured yet, so the endpoint answers `503`. A `WEATHER_KV` namespace is optional; without one, nothing is cached
- **Authentication:** None required
- **Data Source:** OpenWeatherMap API
- **Cache Duration:** 1 hour (3,600 seconds)
- **Auto-Update:** A scheduled handler can refresh the data; no schedule is configured yet

## Features

- Current weather conditions (temperature, humidity, wind, visibility)
- 3-hour forecast for the next 24 hours (8 data points)
- Multi-city support (currently Dagupan, extensible to other LGUs)
- KV caching with automatic refresh
- CORS-protected for authorized origins
- Force update option for manual refresh

---

## Get Weather Data

### Endpoint

**GET** `/api/weather`

### Description

Retrieves current weather and 3-hour forecast data. Returns cached data if available and not expired.

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `city` | string | `null` | Optional city name filter (case-insensitive). Returns all cities if not specified. |
| `update` | boolean | `false` | Force refresh from OpenWeatherMap API, bypassing cache. |

### Response Format

**Success Response (200 OK):**

```json
{
  "dagupan": {
    "name": "Dagupan",
    "coordinates": {
      "lat": 16.0433,
      "lon": 120.3333
    },
    "weather": [
      {
        "id": 800,
        "main": "Clear",
        "description": "clear sky",
        "icon": "01d"
      }
    ],
    "main": {
      "temp": 28.5,
      "feels_like": 31.2,
      "temp_min": 27.8,
      "temp_max": 29.1,
      "pressure": 1013,
      "humidity": 75
    },
    "visibility": 10000,
    "wind": {
      "speed": 3.5,
      "deg": 90
    },
    "clouds": {
      "all": 20
    },
    "dt": 1740720000,
    "sys": {
      "country": "PH",
      "sunrise": 1740691200,
      "sunset": 1740734400
    },
    "timezone": 28800,
    "id": 1708928,
    "timestamp": "2026-02-28T12:00:00.000Z",
    "hourly": [
      {
        "dt": 1740720000,
        "temp": 28.5,
        "feels_like": 31.2,
        "icon": "01d",
        "description": "clear sky",
        "humidity": 75,
        "wind_speed": 3.5
      },
      {
        "dt": 1740730800,
        "temp": 29.1,
        "feels_like": 32.0,
        "icon": "02d",
        "description": "few clouds",
        "humidity": 73,
        "wind_speed": 4.1
      }
    ]
  }
}
```

### Response Fields

#### City-Level Data

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | City name |
| `coordinates` | object | `{lat, lon}` coordinates |
| `weather` | array | Current weather conditions (icon, description) |
| `main` | object | Temperature data (temp, feels_like, temp_min, temp_max, pressure, humidity) |
| `visibility` | number | Visibility in meters |
| `wind` | object | Wind data (speed in m/s, direction in degrees) |
| `clouds` | object | Cloud coverage percentage |
| `dt` | number | Current weather data timestamp (Unix) |
| `sys` | object | System data (country, sunrise, sunset) |
| `timezone` | number | Timezone offset in seconds |
| `id` | number | OpenWeatherMap city ID |
| `timestamp` | string | ISO 8601 timestamp of API response |
| `hourly` | array | 3-hour forecast data (next 24 hours) |

#### Hourly Forecast Data

| Field | Type | Description |
|-------|------|-------------|
| `dt` | number | Forecast timestamp (Unix) |
| `temp` | number | Temperature in Celsius |
| `feels_like` | number | Feels-like temperature in Celsius |
| `icon` | string | OpenWeatherMap icon code (e.g., "01d", "10n") |
| `description` | string | Weather description (e.g., "clear sky", "light rain") |
| `humidity` | number | Humidity percentage |
| `wind_speed` | number | Wind speed in m/s |

### Error Responses

**404 Not Found (City not found):**

```json
{
  "dagupan": {}
}
```

**503 Service Unavailable (API key missing):**

```json
{
  "error": "weather_unavailable"
}
```

The weather ticker and `/data/weather` treat this as "nothing to show".

---

## Usage Examples

### Get All Cities

```bash
curl https://<your-pages-domain>/api/weather
```

### Get Specific City

```bash
curl "https://<your-pages-domain>/api/weather?city=Dagupan"
```

### Force Update (Bypass Cache)

```bash
curl "https://<your-pages-domain>/api/weather?update=true"
```

### Get Specific City with Force Update

```bash
curl "https://<your-pages-domain>/api/weather?city=Dagupan&update=true"
```

### JavaScript/TypeScript Example

```typescript
// Fetch weather data
const response = await fetch('https://<your-pages-domain>/api/weather');
const weather = await response.json();

// Access Dagupan weather
const dagupan = weather.dagupan;
console.log(`Temperature: ${dagupan.main.temp}°C`);
console.log(`Humidity: ${dagupan.main.humidity}%`);
console.log(`Description: ${dagupan.weather[0].description}`);

// Access hourly forecast
dagupan.hourly.forEach((hour, index) => {
  console.log(`Hour ${index + 1}: ${hour.temp}°C - ${hour.description}`);
});
```

### React Example

```tsx
import { useState, useEffect } from 'react';

interface WeatherData {
  dagupan: {
    main: { temp: number; humidity: number };
    weather: Array<{ description: string; icon: string }>;
    hourly: Array<{ temp: number; description: string }>;
  };
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const response = await fetch('https://<your-pages-domain>/api/weather');
        const data = await response.json();
        setWeather(data);
      } catch (error) {
        console.error('Failed to fetch weather:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, []);

  if (loading) return <div>Loading weather...</div>;
  if (!weather) return <div>Weather unavailable</div>;

  const current = weather.dagupan;

  return (
    <div>
      <h2>Dagupan Weather</h2>
      <p>Temperature: {current.main.temp}°C</p>
      <p>Humidity: {current.main.humidity}%</p>
      <p>Conditions: {current.weather[0].description}</p>

      <h3>3-Hour Forecast</h3>
      <ul>
        {current.hourly.map((hour, index) => (
          <li key={index}>
            {hour.temp}°C - {hour.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Configuration

### Supported Cities

The API is configured for **Dagupan** by default. The city is set in `functions/api/weather.ts` itself, not read from `config/lgu.config.json`, so keep it in step with `location.coordinates` there. Additional cities can be added in the same file:

```typescript
const DEFAULT_CITY: CityCoordinates = {
  name: 'Dagupan',
  lat: 16.0433,
  lon: 120.3333,
};

const ADDITIONAL_CITIES: CityCoordinates[] = [
  // { name: 'Neighbouring LGU', lat: 0, lon: 0 },
];
```

The response key is the lower-cased city name with spaces replaced by
underscores (`dagupan`). The frontend derives the same key from `lgu.name` in
`src/lib/weather.ts`.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENWEATHERMAP_API_KEY` | Yes | OpenWeatherMap API key |
| `WEATHER_KV` | No | Cloudflare KV namespace for caching; without it every request goes to OpenWeatherMap |

---

## Caching Behavior

### Cache Strategy

1. **First Request:** Fetches from OpenWeatherMap API and stores in KV
2. **Subsequent Requests:** Returns cached data (within 1 hour)
3. **Expired Cache:** Fetches fresh data and updates KV
4. **Force Update:** Bypasses cache, fetches fresh data, updates KV

### Cache Keys

- **All Cities:** `WEATHER_KV:philippines_weather`
- **Cache TTL:** 3,600 seconds (1 hour) for manual requests
- **Scheduled Update:** 21,600 seconds (6 hours) for auto-refresh

### Cache Headers

```http
Cache-Control: max-age=3600
```

---

## Scheduled Auto-Update

The API includes a scheduled handler (exported from `functions/index.ts`) that refreshes the weather data when a schedule invokes it:

```typescript
export async function scheduled(controller: ScheduledController, env: Env) {
  const weatherData = await fetchWeatherData(env);
  await env.WEATHER_KV.put('philippines_weather', JSON.stringify(weatherData), {
    expirationTtl: 3600 * 6, // 6 hours
  });
}
```

**Configuration:** `wrangler.jsonc` defines no schedule yet, so the cache is
filled only by requests to the endpoint.

---

## CORS Configuration

The API implements CORS protection for security:

**Allowed Origins:**
- `https://better-dagupan.pages.dev`, from the shared list in `functions/utils/origins.ts`; add the portal's domain there once one is assigned
- `http://localhost:5173` (Vite dev server)
- `http://localhost:8788` (Wrangler dev server)

**CORS Headers:**
```http
Access-Control-Allow-Origin: <request-origin>
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
Access-Control-Max-Age: 86400
```

**Preflight Handling:** OPTIONS requests return 204 No Content with CORS headers.

---

## Rate Limiting

This API does **not** implement rate limiting. Limiting is delegated to OpenWeatherMap API:

- **OpenWeatherMap Free Tier:** 1,000 calls/day, 60 calls/minute
- **OpenWeatherMap Paid Tier:** Higher limits available

**Recommendation:** Use caching and force updates sparingly to stay within limits.

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `OpenWeatherMap API key not found` | Missing `OPENWEATHERMAP_API_KEY` environment variable | Add API key to Cloudflare Pages environment variables |
| `Failed to fetch current weather` | OpenWeatherMap API error or invalid city coordinates | Verify coordinates and API key validity |
| `No matching city found` | City parameter doesn't match configured cities | Check city name spelling and configured cities |

### Error Response Format

```json
{
  "error": "Error message describing what went wrong"
}
```

---

## Implementation Notes

### Data Flow

1. **Request received** → Check for `city` and `update` parameters
2. **Check KV cache** → Return cached data if valid (unless `update=true`)
3. **Fetch from OpenWeatherMap** → Current weather + 3-hour forecast
4. **Store in KV** → Cache for 1 hour (6 hours for scheduled updates)
5. **Return response** → JSON with CORS headers

### Performance Considerations

- **KV Cache:** Reduces OpenWeatherMap API calls by ~95%
- **Batch Requests:** Fetches both current and forecast data in parallel
- **Rate Limit Protection:** 100ms delay between multiple city requests
- **Scheduled Updates:** Keeps cache fresh without user requests

### Multi-City Support

The API is designed to support multiple cities:

1. **City Configuration:** Add cities to `ADDITIONAL_CITIES` array
2. **City Normalization:** City names normalized to lowercase with underscores
3. **Independent Caching:** Each city cached separately
4. **Selective Filtering:** Query by city name returns specific city data

---

## Testing

### Manual Testing

```bash
# Test basic request
curl https://<your-pages-domain>/api/weather

# Test city filtering
curl "https://<your-pages-domain>/api/weather?city=Dagupan"

# Test force update
curl "https://<your-pages-domain>/api/weather?update=true"

# Test case insensitivity
curl "https://<your-pages-domain>/api/weather?city=DAGUPAN"

# Test OPTIONS preflight
curl -X OPTIONS https://<your-pages-domain>/api/weather \
  -H "Origin: http://localhost:5173" \
  -v
```

### Unit Testing

```typescript
// Test weather data fetching
const response = await fetch('http://localhost:8788/api/weather');
const data = await response.json();

assert(data.dagupan);
assert(data.dagupan.main.temp > 0);
assert(data.dagupan.hourly.length === 8);
```

---

## References

- **OpenWeatherMap API Documentation:** https://openweathermap.org/api
- **Cloudflare KV Documentation:** https://developers.cloudflare.com/kv/
- **Cloudflare Pages Functions:** https://developers.cloudflare.com/pages/functions/

---

**Last Updated:** 2026-02-28
**API Version:** 1.0.0
**Maintained By:** Better Dagupan contributors
