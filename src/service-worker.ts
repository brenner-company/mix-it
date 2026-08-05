/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

import { publishedCatalog } from '$lib/catalog/published';

const worker = self as unknown as ServiceWorkerGlobalScope;
const cacheName = `mix-it-${version}`;
const pageRoutes = ['/', ...publishedCatalog.map((variant) => `/product/${variant.id}`)];
const assets = [...build, ...files, ...pageRoutes];

worker.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(cacheName)
      .then((cache) => cache.addAll(assets))
      .then(() => worker.skipWaiting())
  );
});

worker.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== cacheName).map((key) => caches.delete(key))))
      .then(() => worker.clients.claim())
  );
});

worker.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          if (response.ok && event.request.url.startsWith(worker.location.origin)) {
            void caches.open(cacheName).then((cache) => cache.put(event.request, response.clone()));
          }
          return response;
        })
        .catch(() => caches.match('/'));
    })
  );
});
