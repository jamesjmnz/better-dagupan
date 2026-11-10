/**
 * Simple fetch wrapper with caching
 * Cache duration: 5 minutes
 */
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedResponse<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CachedResponse<unknown>>();

/** A non-2xx response, with its status kept for callers that branch on it. */
export class HttpError extends Error {
  constructor(public readonly status: number) {
    super(`HTTP error! status: ${status}`);
  }
}

export async function fetchWithCache<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const now = Date.now();
  const cached = cache.get(url);

  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new HttpError(response.status);
  }

  const data = await response.json();

  cache.set(url, { data, timestamp: now });

  return data as T;
}
