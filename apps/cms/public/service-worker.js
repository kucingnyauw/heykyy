/**
 * Service Worker - Heykyy
 *
 * Responsibilities:
 * - Cache static app shell
 * - Runtime caching (assets & API)
 * - Provide offline fallback
 * - Handle versioned cache invalidation
 *
 * Cache Strategy:
 * - API       → Network First
 * - Assets    → Cache First
 * - Navigation→ Network First + fallback (SPA)
 *
 * Versioning:
 * - CACHE_VERSION injected at build time
 * - Changing version invalidates old cache
 *
 * @global
 */

const CACHE_VERSION = "__CACHE_VERSION__";
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;

/**
 * App shell resources to precache
 * @type {string[]}
 */
const APP_SHELL = ["/", "/index.html", "/favicon.ico"];

// =========================
// INSTALL
// =========================

/**
 * Install event
 * - Pre-cache critical resources
 * - Activate immediately
 */
self.addEventListener("install", (event) => {
  console.log("[SW] Install:", CACHE_VERSION);

  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL))
  );

  self.skipWaiting();
});

// =========================
// ACTIVATE
// =========================

/**
 * Activate event
 * - Remove old caches
 * - Take control immediately
 */
self.addEventListener("activate", (event) => {
  console.log("[SW] Activate");

  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== STATIC_CACHE && key !== RUNTIME_CACHE) {
            return caches.delete(key);
          }
        })
      )
    )
  );

  self.clients.claim();
});

// =========================
// FETCH
// =========================

/**
 * Fetch handler
 * Routes requests based on type
 */
self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // API → Network First
  if (url.pathname.startsWith("/api")) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets → Cache First
  if (
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "image" ||
    request.destination === "font"
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Navigation (SPA)
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, "/index.html"));
    return;
  }

  event.respondWith(cacheFirst(request));
});

// =========================
// STRATEGIES
// =========================

/**
 * Cache First Strategy
 *
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function cacheFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);

  if (cached) return cached;

  const response = await fetch(request);
  cache.put(request, response.clone());

  return response;
}

/**
 * Network First Strategy
 *
 * @param {Request} request
 * @param {string} [fallbackUrl]
 * @returns {Promise<Response>}
 */
async function networkFirst(request, fallbackUrl) {
  const cache = await caches.open(RUNTIME_CACHE);

  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;

    if (fallbackUrl) {
      return caches.match(fallbackUrl);
    }
  }
}

// =========================
// MESSAGE HANDLER
// =========================

/**
 * Handle messages from client
 *
 * Supported messages:
 * - SKIP_WAITING → activate new SW immediately
 */
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    console.log("[SW] Skip waiting triggered");
    self.skipWaiting();
  }
});