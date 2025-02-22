// Cache version
const CACHE_VERSION = 'v2';
const CACHE_NAME = `constructivo-cache-${CACHE_VERSION}`;

// Assets to cache
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/index.css',
  '/assets/index.js',
];

// API cache configuration
const API_CACHE_NAME = `constructivo-api-cache-${CACHE_VERSION}`;
const API_ROUTES = [
  '/api/projects',
  '/api/testimonials',
  '/api/settings'
];

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_CACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== API_CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Helper function to determine caching strategy based on request
function shouldCacheResponse(request, response) {
  // Only cache successful responses
  if (!response || response.status !== 200) return false;

  // Don't cache user-specific data
  if (request.url.includes('/api/user')) return false;

  // Cache API responses that are in our whitelist
  if (API_ROUTES.some(route => request.url.includes(route))) return true;

  // Cache static assets
  const isStaticAsset = request.url.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico)$/);
  if (isStaticAsset) return true;

  return false;
}

// Fetch event handler with improved caching strategy
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached response if found
        if (cachedResponse) {
          // If it's an API request, fetch new data in background
          if (API_ROUTES.some(route => event.request.url.includes(route))) {
            event.waitUntil(
              fetch(event.request)
                .then((response) => {
                  if (shouldCacheResponse(event.request, response)) {
                    const responseToCache = response.clone();
                    caches.open(API_CACHE_NAME)
                      .then((cache) => {
                        cache.put(event.request, responseToCache);
                      });
                  }
                })
            );
          }
          return cachedResponse;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses or user-specific data
            if (!shouldCacheResponse(event.request, response)) {
              return response;
            }

            // Clone the response as it can only be consumed once
            const responseToCache = response.clone();

            // Cache the response for future use
            const cacheName = API_ROUTES.some(route => 
              event.request.url.includes(route)) ? API_CACHE_NAME : CACHE_NAME;

            caches.open(cacheName)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch((error) => {
            // On network error, try to return a cached response
            return caches.match(event.request)
              .then((cachedResponse) => {
                if (cachedResponse) {
                  return cachedResponse;
                }
                throw error;
              });
          });
      })
  );
});

// Handle service worker updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});