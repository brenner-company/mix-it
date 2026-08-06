/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

import { publishedCatalog } from '$lib/catalog/published';
import {
  installReleaseAtomically,
  isReleaseCacheName,
  releaseCacheName,
  uniqueReleaseAssets
} from '$lib/offline-release';

const worker = self as unknown as ServiceWorkerGlobalScope;
const cacheName = releaseCacheName(version);
const pageRoutes = ['/', ...publishedCatalog.map((variant) => `/product/${variant.id}`)];
const assets = uniqueReleaseAssets(build, files, pageRoutes);

async function precacheRelease(): Promise<void> {
  const cache = await caches.open(cacheName);

  await installReleaseAtomically(
    async () => cache.addAll(assets.map((asset) => new Request(asset, { cache: 'reload' }))),
    () => worker.skipWaiting(),
    async () => {
      await caches.delete(cacheName);
    }
  );
}

async function respondWithReleaseCache(request: Request): Promise<Response> {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    if (request.mode === 'navigate') {
      const fallback = await cache.match('/');
      if (fallback) return fallback;
    }

    return new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

worker.addEventListener('install', (event) => {
  event.waitUntil(precacheRelease());
});

worker.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => isReleaseCacheName(key) && key !== cacheName)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => worker.clients.claim())
  );
});

worker.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (new URL(event.request.url).origin !== worker.location.origin) return;

  event.respondWith(respondWithReleaseCache(event.request));
});
