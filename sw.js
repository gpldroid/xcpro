const CACHE_NAME = 'xconvert-pro-v9';
const BASE = '/';
const APP_SHELL = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.webmanifest',
  BASE + 'robots.txt',
  BASE + 'sitemap.xml',
  BASE + 'assets/css/style.css',
  BASE + 'assets/css/home.css',
  BASE + 'assets/css/tool-ui.css',
  BASE + 'assets/js/app.js',
  BASE + 'assets/js/tool-page.js',
  BASE + 'assets/js/modules/state.js',
  BASE + 'assets/js/modules/navigation.js',
  BASE + 'assets/js/modules/workspace.js',
  BASE + 'assets/js/modules/canvas.js',
  BASE + 'assets/js/modules/controls.js',
  BASE + 'assets/js/modules/download.js',
  BASE + 'assets/js/modules/api.js',
  BASE + 'assets/icons/icon.svg',
  BASE + 'assets/icons/icon-192x192.png',
  BASE + 'assets/icons/icon-512x512.png',
  BASE + 'assets/icons/apple-touch-icon.png',
  BASE + 'assets/js/site-shell.js',
  BASE + 'assets/js/cookie-consent.js',
  BASE + 'tools/compress-image.html',
  BASE + 'tools/resize-image.html',
  BASE + 'tools/crop-image.html',
  BASE + 'tools/convert-image.html',
  BASE + 'tools/photo-editor.html',
  BASE + 'tools/remove-background.html',
  BASE + 'tools/upscale-image.html',
  BASE + 'tools/watermark-image.html',
  BASE + 'tools/meme-generator.html',
  BASE + 'tools/rotate-image.html'
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