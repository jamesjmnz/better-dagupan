import { readFileSync } from 'node:fs';

/**
 * Read a dataset from src/data, so a spec can derive what the page should
 * show from the same file the page renders.
 *
 * Read from disk rather than imported: under Playwright's ESM loader a bare
 * JSON import needs an import attribute, which the rest of the toolchain here
 * does not expect.
 *
 * @param path Path relative to src/data, e.g. 'service_categories.json'.
 */
export function readData<T>(path: string): T {
  const url = new URL(`../../src/data/${path}`, import.meta.url);
  return JSON.parse(readFileSync(url, 'utf8')) as T;
}
