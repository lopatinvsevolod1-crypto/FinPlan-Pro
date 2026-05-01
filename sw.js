const CACHE_NAME = 'finplan-pro-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
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

// Периодическая фоновая синхронизация
self.addEventListener('periodicsync', event => {
  if (event.tag === 'update-savings') {
    event.waitUntil(updateSavingsInBackground());
  }
});

async function syncData() {
  // Отправляем накопленные данные на сервер (если будет бэкенд)
  const data = await getLocalData();
  if (data) {
    // await fetch('/api/sync', { method: 'POST', body: JSON.stringify(data) });
    console.log('🔄 Данные синхронизированы');
  }
}

async function updateSavingsInBackground() {
  // Обновляем накопления в фоне
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({ type: 'UPDATE_SAVINGS' });
  });
}

async function getLocalData() {
  // В реальном приложении — чтение из IndexedDB
  return null;
}
