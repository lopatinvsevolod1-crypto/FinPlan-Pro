const CACHE_NAME = 'finplan-pro-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-shortcut.png'
];

// Установка
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Активация
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Офлайн-режим
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

// Фоновая синхронизация
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// Периодическая синхронизация
self.addEventListener('periodicsync', event => {
  if (event.tag === 'update-savings') {
    event.waitUntil(updateSavingsInBackground());
  }
});

// Push-уведомления
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'Обновление ваших финансов',
    icon: './icon-192.png',
    badge: './icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'finplan-notification',
    data: { url: data.url || './' }
  };
  
  event.waitUntil(
    self.registration.showNotification(
      data.title || 'FinPlan Pro',
      options
    )
  );
});

// Клик по уведомлению
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow(event.notification.data.url || './');
    })
  );
});

async function syncData() {
  console.log('🔄 Фоновая синхронизация');
}

async function updateSavingsInBackground() {
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({ type: 'UPDATE_SAVINGS' });
  });
}
