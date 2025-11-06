// src/sw.js
const CACHE_NAME = 'storyhub-v1.3.0';
const API_CACHE_NAME = 'storyhub-api-v1.1.0';

// File yang akan di-cache untuk app shell
const APP_SHELL_FILES = [
  '/',
  '/index.html',
  '/bundle.js',
  '/styles.main.css',
  '/assets/logo.svg',
  '/assets/apple-touch-icon.png',
  '/assets/favicon-32x32.png',
  '/assets/favicon-16x16.png',
  '/assets/site.webmanifest'
];

// Install event - cache app shell
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching App Shell');
        return cache.addAll(APP_SHELL_FILES);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network first strategy for API, cache first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API requests - Network First strategy
  if (url.pathname.startsWith('/v1/stories') && request.method === 'GET') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache the API response
          const responseClone = response.clone();
          caches.open(API_CACHE_NAME)
            .then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() => {
          // Fallback to cache when offline
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Return offline page or empty data
              return new Response(JSON.stringify({ 
                error: 'You are offline', 
                stories: [] 
              }), {
                headers: { 'Content-Type': 'application/json' }
              });
            });
        })
    );
    return;
  }

  // Static assets - Cache First strategy
  if (request.method === 'GET') {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request)
            .then((response) => {
              // Cache new requests
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => cache.put(request, responseClone));
              return response;
            });
        })
    );
  }
});

// Push Notification event
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push Received');

  let notificationData = {
    title: 'StoryHub',
    body: 'Ada cerita baru nih! Yuk lihat cerita terbaru dari komunitas.',
    icon: '/assets/logo.svg',
    badge: '/assets/favicon-32x32.png',
    data: { url: '/#/home' }
  };

  // Try to parse push data if available
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        ...notificationData,
        ...pushData
      };
    } catch (error) {
      console.log('Push data is not JSON, using default notification');
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      data: notificationData.data,
      actions: [
        {
          action: 'open',
          title: 'Buka Aplikasi'
        },
        {
          action: 'dismiss',
          title: 'Tutup'
        }
      ],
      tag: 'storyhub-notification'
    })
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click Received');

  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Focus existing window or open new one
        for (const client of clientList) {
          if (client.url.includes('/') && 'focus' in client) {
            client.navigate(event.notification.data.url || '/#/home');
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url || '/#/home');
        }
      })
  );
});