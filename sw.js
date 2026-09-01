const CACHE = 'mizan-secure-v4-3-force-1';
const SHELL = [
  '/secure-v3.html?v=430',
  '/manifest.webmanifest?v=430',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(cache =>
      Promise.allSettled(SHELL.map(url => cache.add(url)))
    )
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(keys =>
        Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
      ),
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      fetch(req, {cache:'no-store'})
        .then(res => res)
        .catch(() =>
          caches.match(req).then(r => r || caches.match('/secure-v3.html?v=430'))
        )
    );
    return;
  }

  event.respondWith(
    fetch(req, {cache:'no-store'})
      .then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});
