const CACHE_NAME = 'xconvert-pro-v1';
const BASE = '/xcpro/';
const APP_SHELL = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.webmanifest',
  BASE + 'robots.txt',
  BASE + 'sitemap.xml',
  BASE + 'assets/css/style.css',
  BASE + 'assets/css/pages.css',
  BASE + 'assets/js/app.js',
  BASE + 'assets/js/tool-page.js',
  BASE + 'assets/js/modules/state.js',
  BASE + 'assets/js/modules/navigation.js',
  BASE + 'assets/js/modules/workspace.js',
  BASE + 'assets/js/modules/canvas.js',
  BASE + 'assets/js/modules/controls.js',
  BASE + 'assets/js/modules/download.js',
  BASE + 'assets/js/modules/api.js',
  BASE + 'assets/icons/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        if (response && response.ok && url.pathname.startsWith(BASE)) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      }).catch(() => {
        if (request.mode === 'navigate') {
          return caches.match(BASE + 'index.html');
        }
        return Response.error();
      });
    })
  );
});
