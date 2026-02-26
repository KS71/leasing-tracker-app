const CACHE_NAME = 'lease-mileage-tracker-v2'; // Bump version to trigger new install
// Add all essential files for the PWA shell to work offline.
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/index.tsx', // Add main app script to initial cache
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache, caching app shell');
        // Use a new Request object to ensure we can cache the cross-origin CDN URL
        const cachePromises = urlsToCache.map(urlToCache => {
            if (urlToCache.startsWith('http')) {
                // For cross-origin requests, create a new Request object with 'no-cors' mode.
                // This allows caching the opaque response, which is sufficient for TailwindCSS.
                const request = new Request(urlToCache, { mode: 'no-cors' });
                return cache.add(request);
            }
            return cache.add(urlToCache);
        });
        return Promise.all(cachePromises);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Not in cache, fetch from network and then cache it.
        return fetch(event.request.clone()).then(
          response => {
            // Check if we received a valid response.
            // Opaque responses (type: 'opaque', status: 0) are valid for no-cors requests.
            if (!response || ![0, 200].includes(response.status)) {
              return response;
            }

            // Clone the response to use it for both caching and returning to the browser.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});

// Clean up old caches to ensure the app stays up-to-date.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});