// ═══════════════════════════════════════════════════════════════════════
// Service Worker — Daily Learning Habit Tracker  v5
// Handles:
//   1. App-shell caching (offline support)
//   2. Push notifications (notificationclick routing)
//   3. Scheduled local notifications via message from main thread
// ═══════════════════════════════════════════════════════════════════════

const CACHE_NAME = 'lt-cache-v5';
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

// ── NOTIFICATION CLICK HANDLER ────────────────────────────────────────────────
// When user taps a notification, open/focus the app and route to the right tab.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action || '';
  const data   = event.notification.data || {};

  // Which URL to open — default to the app root
  let url = './';
  if (data.view === 'habits')  url = './habits.html';
  if (data.view === 'plans')   url = './';
  if (data.view === 'books')   url = './';
  if (data.view === 'review')  url = './';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      // If app is already open, focus it and post a message to switch tab
      for (const client of list) {
        if (client.url.includes('sathiyaseelanK.github.io') || client.url.includes('localhost')) {
          client.focus();
          client.postMessage({ type: 'NOTIFICATION_CLICK', view: data.view, skey: data.skey });
          return;
        }
      }
      // App not open — launch it
      return clients.openWindow(url);
    })
  );
});

// ── PUSH HANDLER (future Web Push support) ────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const payload = event.data.json();
    event.waitUntil(
      self.registration.showNotification(payload.title || '🌱 Learning Tracker', {
        body   : payload.body  || '',
        icon   : './icon-192.png',
        badge  : './icon-192.png',
        data   : payload.data  || {},
        tag    : payload.tag   || 'lt-push',
        actions: payload.actions || [],
      })
    );
  } catch (_) {}
});

// ── MESSAGE HANDLER — receives schedule commands from the main thread ─────────
// The app posts { type: 'SCHEDULE_NOTIFICATION', ... } when it wants to
// schedule a local notification via the SW (more reliable than setTimeout).
self.addEventListener('message', (event) => {
  const msg = event.data || {};
  if (msg.type === 'SKIP_WAITING') { self.skipWaiting(); return; }
});
