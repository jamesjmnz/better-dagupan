import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

/**
 * Tailwind v4 writes responsive variants as nested CSS (`.md\:w-0 { @media
 * (...) { width: 0 } }`) and only flattens it in production builds. WebKit does
 * not restyle an element when a class change only affects rules nested that
 * way, so on the dev server a collapsed sidebar stayed open in Safari. Run the
 * same optimize step the production build uses, unminified, on the dev server.
 */
function flattenCssInDev(): Plugin {
  // @tailwindcss/node arrives through @tailwindcss/vite rather than as a
  // declared dependency, so load it lazily and skip the step if it is absent
  // instead of breaking the dev server or the build.
  type Optimize = (
    css: string,
    options: { file: string; minify: boolean }
  ) => { code: string };
  let optimize: Optimize | null = null;
  return {
    name: 'better-dagupan:flatten-css-in-dev',
    apply: 'serve',
    enforce: 'pre',
    async configResolved() {
      try {
        ({ optimize } = (await import('@tailwindcss/node')) as {
          optimize: Optimize;
        });
      } catch {
        optimize = null;
      }
    },
    transform(code, id) {
      if (!optimize) return;
      if (!/\.css(?:$|\?)/.test(id) || /[?&](?:raw|url)\b/.test(id)) return;
      return { code: optimize(code, { file: id, minify: false }).code };
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          // React core — loaded on every page
          'vendor-react': [
            'react',
            'react-dom',
            'react-router-dom',
            '@remix-run/router',
          ],
          // Maps — only needed on map pages
          'vendor-leaflet': ['leaflet', 'react-leaflet'],
          // Charts — only needed on stats/transparency pages
          'vendor-recharts': ['recharts'],
          // Search — only needed on search page
          'vendor-search': ['meilisearch', 'fuse.js'],
          // i18n — loaded early but large
          'vendor-i18n': ['i18next', 'react-i18next'],
        },
      },
    },
  },
  plugins: [react(), tailwindcss(), flattenCssInDev()],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, 'src'),
      },
    ],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8788',
        changeOrigin: true,
        rewrite: path => path,
        configure: proxy => {
          // Handle proxy errors (ECONNREFUSED, ECONNRESET, etc.)
          proxy.on(
            'error',
            (
              _err: Error,
              _req: unknown,
              res: {
                headersSent: boolean;
                writeHead: (
                  code: number,
                  headers: Record<string, string>
                ) => void;
                end: (data: string) => void;
              }
            ) => {
              if (!res.headersSent) {
                res.writeHead(503, { 'Content-Type': 'application/json' });
                res.end(
                  JSON.stringify({ error: 'API unavailable', offline: true })
                );
              }
            }
          );
          // Handle proxy request errors (connection failures)
          proxy.on(
            'proxyReq',
            (proxyReq: {
              on: (event: string, handler: () => void) => void;
            }) => {
              proxyReq.on('error', () => {
                // Error will be caught by the main error handler above
              });
            }
          );
        },
      },
    },
  },
});
