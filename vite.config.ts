// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// Never set ssr.external or resolve.external: the Worker has no runtime module resolution, so
// the build fails. Never add compression (compressPublicAssets, vite-plugin-compression):
// hosting already compresses at the edge.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      VitePWA({
        strategies: "generateSW",
        filename: "sw.js",
        registerType: "autoUpdate",
        injectRegister: null,
        manifest: false,
        devOptions: { enabled: false },
        includeAssets: ["favicon.svg", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png"],
        workbox: {
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2,webmanifest}"],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          navigateFallback: "/",
          navigateFallbackDenylist: [/^\/~oauth/],
          runtimeCaching: [
            {
              urlPattern: ({ request, url }) => request.mode === "navigate" && !url.pathname.startsWith("/~oauth"),
              handler: "NetworkFirst",
              options: {
                cacheName: "armario-pages",
                networkTimeoutSeconds: 3,
                cacheableResponse: { statuses: [200] },
                expiration: { maxEntries: 40, maxAgeSeconds: 30 * 24 * 60 * 60 },
              },
            },
            {
              urlPattern: ({ request, url, sameOrigin }) => sameOrigin &&
                ["script", "style", "font", "worker"].includes(request.destination) &&
                url.pathname.includes("/assets/") && /-[a-z0-9_-]{8,}\./i.test(url.pathname),
              handler: "CacheFirst",
              options: {
                cacheName: "armario-assets",
                cacheableResponse: { statuses: [0, 200] },
                expiration: { maxEntries: 80, maxAgeSeconds: 365 * 24 * 60 * 60 },
              },
            },
          ],
        },
      }),
    ],
  },
});
