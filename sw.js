// ═══════════════════════════════════════════════════════════════════════
// Service Worker — Daily Learning Habit Tracker
// Caches the app shell so it loads even with no internet connection.
// Data (Google Sheets) still requires network — only the app itself is cached.
// ═══════════════════════════════════════════════════════════════════════

const CACHE_NAME = 'lt-cache-v4';
const APP_SHELL = [
  './',
  './index.html',
  './habits.html',
  './docs.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Install: pre-cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch strategy:
// - App shell files (same-origin HTML/JSON/PNG): cache-first, fall back to network, update cache in background
// - Everything else (Google Sheets API, Quotable API): network-first, never cached (always fresh data)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isSameOrigin = url.origin === self.location.origin;

  if (!isSameOrigin) {
    // API calls (Apps Script, Quotable, ZenQuotes) — always go to network
    event.respondWith(
      fetch(event.request).catch(() => new Response(
        JSON.stringify({ success: false, error: 'offline' }),
        { headers: { 'Content-Type': 'application/json' } }
      ))
    );
    return;
  }

  // App shell — cache first, refresh in background
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
      return cached || networkFetch;
    })
  );
});
