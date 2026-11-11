const CACHE_NAME = 'xconvert-pro-rebuild-v1';
const PRECACHE = [
  '/', '/tools/', '/about/', '/archives/', '/contact/',
  '/pages/about.html', '/pages/contact.html', '/pages/tools.html',
  '/pages/privacy.html', '/pages/terms.html', '/pages/cookie-policy.html',
  '/pages/disclaimer.html', '/pages/acceptable-use.html', '/pages/api.html',
  '/tools/compress-image.html', '/tools/resize-image.html', '/tools/crop-image.html',
  '/tools/convert-image.html', '/tools/photo-editor.html', '/tools/remove-background.html',
  '/tools/upscale-image.html', '/tools/watermark-image.html', '/tools/meme-generator.html',
  '/tools/rotate-image.html', '/favicon.svg', '/manifest.webmanifest', '/og-image.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then((response) => {
      if (response.ok) { const copy = response.clone(); caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)); }
      return response;
    }).catch(async () => (await caches.match(request)) || (await caches.match('/')) || Response.error()));
    return;
  }
  if (/\.[a-f0-9]{8,}\./i.test(url.pathname)) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok) { const copy = response.clone(); caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)); }
      return response;
    })));
  }
});
