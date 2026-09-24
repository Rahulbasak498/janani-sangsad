importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyDVKceCHZvh7AnxLYfn40Vb5zYZjmKnWts',
  authDomain: 'janani-sangsad-31248.firebaseapp.com',
  projectId: 'janani-sangsad-31248',
  storageBucket: 'janani-sangsad-31248.firebasestorage.app',
  messagingSenderId: '935446853375',
  appId: '1:935446853375:web:a04618bae050e4090b7eca'
});

const messaging = firebase.messaging();
messaging.onBackgroundMessage(payload => {
  const data = payload.data || {};
  self.registration.showNotification(data.title || 'জননী সংসদ', {
    body: data.body || 'নতুন গুরুত্বপূর্ণ ঘোষণা এসেছে।',
    icon: './image/maa-durga.png',
    data: { url: data.url || './notice.html' }
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || './notice.html', self.registration.scope).href;
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
    const existing = clients.find(client => client.url === targetUrl);
    if (existing) return existing.focus();
    return self.clients.openWindow(targetUrl);
  }));
});

const CACHE_NAME = 'janani-sangsad-v4';
const APP_SHELL = [
  './index.html',
  './style.css',
  './script.js',
  './page-transition.js',
  './puja-calendar.js',
  './render.js',
  './firebase-config.js',
  './manifest.json',
  './image/maa-durga.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys
        .filter(key => key.startsWith('janani-sangsad-') && key !== CACHE_NAME)
        .map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) return;

  if (request.destination === 'image') {
    // Stale-while-revalidate: instant from cache, but silently refresh so a
    // replaced image (e.g. the real donation QR) shows up on the next visit.
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(request).then(cached => {
          const network = fetch(request).then(response => {
            if (response && response.ok) cache.put(request, response.clone());
            return response;
          }).catch(() => cached);
          return cached || network;
        })
      )
    );
    return;
  }

  event.respondWith(
    fetch(request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
      return response;
    }).catch(() => caches.match(request))
  );
});
